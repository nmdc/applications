# Copyright (c) 2016, Christian Michelsen Research AS
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
# * Redistributions of source code must retain the above copyright
#   notice, this list of conditions and the following disclaimer.
# * Redistributions in binary form must reproduce the above copyright
#   notice, this list of conditions and the following disclaimer in the
#   documentation and/or other materials provided with the distribution.
# * Neither the name of the Christian Michelsen Research AS nor the
#   names of its contributors may be used to endorse or promote products
#   derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL Christian Michelsen Research AS BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


import collections

import geojson
from tornado import log, httpclient, escape

import util
import xmltodict

GEOJSON_MARKER_OPTIONS_DEFAULT = {"fillColor": "#00ff00", "color": "#ffffff", "weight": 2, "opacity": 1,
                                  "fillOpacity": 0.1}
GEOJSON_MARKER_OPTIONS_CONVERTED_POLY = {"fillColor": "#cccccc", "color": "#333333", "weight": 2, "opacity": 1,
                                         "fillOpacity": 0.1}


def get_filtered_geojson(pos_rows, bbox, greater_than, request_dict):
    view_bbox_geometry = util.get_geojson_geometry(bbox.to_coordinates())
    shapely_view_bbox = util.get_shapely_projected_polygon(view_bbox_geometry)
    fraction = util.get_float_or_none(request_dict['fraction'][0])
    return get_geojson(pos_rows, util.filter_on_area, (shapely_view_bbox, fraction if not None else 1.0, greater_than))


def get_initial_response_and_urls(request_dict, api_url):
    http = httpclient.HTTPClient()
    initial_res = []
    urls = []
    date_search_string = escape.url_escape(get_date_search_string(request_dict))
    map_bbox = util.get_bbox(request_dict)
    polys = [bbox.to_polygon_string() for bbox in (util.maybe_split_bbox(map_bbox))]
    for i in xrange(len(polys)):
        geography_search_string = escape.url_escape('location_rpt:"Intersects(' + polys[i] + ')"')
        first_search_url = api_url + 'search?q=' + geography_search_string + date_search_string
        try:
            first_respons = escape.json_decode(http.fetch(first_search_url).body)
        except Exception as e:
            log.app_log.error(first_search_url + 'datasets request failed \n' +
                              '(' + e.message + ')')
        initial_res += first_respons['results']
        urls_needed = int(first_respons['numFound']) / 10
        urls += [first_search_url + '&offset=' + str(10 * offset) for offset in xrange(1, urls_needed + 1)]
    return initial_res, urls


def get_date_search_string(request_dict):
    date_search_string = ''
    if len(request_dict['from'][0]) > 0:
        date_search_string += '&beginDate=' + util.get_date_string(request_dict['from'][0])
    if len(request_dict['to'][0]) > 0:
        date_search_string += '&endDate=' + util.get_date_string(request_dict['to'][0])
    if len(date_search_string) > 0:
        date_search_string += '&dateSearchMode=isWithin'
    return escape.url_escape(date_search_string)


def get_geojson(datasets, filter_func=None, filter_params=None):
    feature_array = []
    non_unique_polys = get_non_unique_polygons(datasets)
    datasets = add_cluster_representation(datasets, get_non_unique_polygons(datasets, return_ids=True))

    data_dict = util.get_data_dictionary(datasets)

    for data_id, data_record in data_dict.iteritems():
        try:
            data = data_record[0]

            include_geometry = False
            bounds = []
            geometry_array = []

            # original dataset extension
            poly = data['location_rpt']
            coordinates = util.get_coordinates(poly)
            geometry = util.get_geojson_geometry(coordinates)

            if filter_func is None or filter_func(geometry, *filter_params):
                include_geometry = True
                if poly in non_unique_polys and 'converted' not in data:
                    # convert to clusterable item if need be
                    data = convert_poly_dataset_to_point(data)
                    coordinates = util.get_coordinates(data['location_rpt'])
                    geometry = util.get_geojson_geometry(coordinates)

            bounds = util.add_bounds(bounds, coordinates)
            geometry_array.append(geometry)

            if include_geometry:
                if len(geometry_array) > 1:
                    new_geometry = geojson.GeometryCollection(geometry_array)
                else:
                    new_geometry = geometry_array[0]

                marker_options = GEOJSON_MARKER_OPTIONS_DEFAULT if 'converted' in data_dict\
                    else GEOJSON_MARKER_OPTIONS_CONVERTED_POLY

                properties = {"description": data['Entry_Title'],
                              "geojsonMarkerOptions": marker_options,
                              "converted": 'converted' in data}

                if not util.is_empty_bounds(bounds):
                    new_feature = geojson.Feature(id=data_id, geometry=new_geometry, properties=properties,
                                                  bbox=bounds)
                else:
                    new_feature = geojson.Feature(id=data_id, geometry=new_geometry, properties=properties)

                feature_array.append(new_feature)

        except Exception as e:
            print('get_geoJSON Error %s' % e)
            log.app_log.error('get_geoJSON Error %s' % e)

    return geojson.FeatureCollection(feature_array)


def get_non_unique_polygons(datasets, return_ids=False):
    non_unique_poly_dict = generate_non_unique_polygon_dict(datasets)
    if not return_ids:
        non_unique_polys = [p for p in non_unique_poly_dict]
    else:
        non_unique_polys = [(p, non_unique_poly_dict[p]) for p in non_unique_poly_dict]
    return non_unique_polys


def generate_non_unique_polygon_dict(datasets):
    out = {}
    for d in [d for d in datasets if 'POLY' in d['location_rpt']]:
        p = d['location_rpt']
        if p in out:
            out[p] += [util.get_id(d)]
        else:
            out[p] = [util.get_id(d)]
    return {k: out[k] for k in out if len(out[k]) > 1 and len(collections.Counter(out[k])) > 1}


def add_cluster_representation(datasets, non_unique_polys_and_count):
    return datasets + [generate_dummy_poly_dataset(p, datasets[0], c) for p, c in non_unique_polys_and_count]


def convert_poly_dataset_to_point(dataset):
    sum_lng = 0
    sum_lat = 0
    count = 0

    l = [[float(x), float(y)] for x, y in
         [s.split() for s in dataset['location_rpt'].split('POLYGON((')[1].split('))')[0].split(',')]]
    l.pop()

    lng_min = float('inf')
    lat_min = float('inf')
    lng_max = float('-inf')
    lat_max = float('-inf')
    for r in l:
        lng_min = min(lng_min, r[0])
        lat_min = min(lat_min, r[1])
        lng_max = max(lng_max, r[0])
        lat_max = max(lat_max, r[1])

        sum_lng += r[0]
        sum_lat += r[1]
        count += 1

        dataset['location_rpt'] = str(sum_lng / count) + ' ' + str(sum_lat / count)
        dataset['converted'] = True
    return dataset


def generate_dummy_poly_dataset(polygon, dataset_template, dataset_ids):
    d = dataset_template.copy()

    for k in d:
        d[k] = ''
    s = ''
    sep = ''
    for dataset_id in dataset_ids:
        s += sep + dataset_id
        sep = ','
    s += ''

    d['location_rpt'] = polygon
    d['Entry_ID'] = s
    d['Entry_Title'] = 'Dataset cluster (' + str(len(dataset_ids)) + ' datasets)'
    d['converted'] = True
    return d


def filter_detail_dict(detail_dict, attribute_list):
    if attribute_list is not None:
        tmp_dict = detail_dict['meta']['nmdc-metadata']['DIF']
        detail_dict['meta']['nmdc-metadata']['DIF'] = util.filter_dict(tmp_dict, attribute_list)
        return detail_dict
    else:
        return detail_dict


def parse_detail_response(response, namespaces, page_prefix):
    decoded = xmltodict.parse(response.body, process_namespaces=True, namespaces=namespaces)
    if decoded['meta'] and decoded['meta']['nmdc-metadata'] and decoded['meta']['nmdc-metadata']['DIF']:
        decoded['meta']['nmdc-metadata']['DIF'] = to_list_for_attributes(decoded['meta']['nmdc-metadata']['DIF'], ['Originating_Center', 'Data_Set_Citation', 'Access_Constraints', 'Summary', 'Keyword', 'Related_URL'])

    if decoded['meta'] and decoded['meta']['parameters'] and decoded['meta']['parameters']['pDefs'] and decoded['meta']['parameters']['pDefs']['pDef']:
        decoded['meta']['parameters']['pDefs']['pDef'] = to_list(decoded['meta']['parameters']['pDefs']['pDef'])

    idx = response.request.url.rfind('/')
    entry_id = response.request.url[idx+1:] if -1 < idx < len(response.request.url)-1 else None
    landing_page = page_prefix + entry_id if entry_id is not None else None
    decoded['landingpage'] = landing_page
    return decoded


def to_list_for_attributes(dict_object, attribute_list):
    for attribute in attribute_list:
        if attribute in dict_object:
            dict_object[attribute] = to_list(dict_object[attribute])
        else:
            dict_object[attribute] = []

    return dict_object


def to_list(dict_object):
    if isinstance(dict_object, list):
        return dict_object
    else:
        return [dict_object]


