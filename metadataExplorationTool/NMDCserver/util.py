# Copyright (c) 2017 Norwegian Marine Data Centre
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
# documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
# persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial
# portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
# WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
# OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import datetime

import geojson
from shapely.geometry import shape
from tornado import log


def request_to_dict(request):
    return {k.lower(): v for k, v in request.arguments.items()}


def get_data_dictionary(rows):
    data_dict = {}
    for row in rows:
        data_id = get_id(row)
        if data_id not in data_dict:
            data_dict[data_id] = []
        data_dict[data_id].append(row)
    return data_dict


def get_id(item):
    url = item['landingpage']
    if url:
        idx = url.rfind('/')
        return url[idx+1:] if -1 < idx < len(url)-1 else item['Entry_ID']
    else:
        return item['Entry_ID']


def get_date_string(date_text):
    return datetime.datetime.strptime(date_text, '%Y%m%d').isoformat() + str('Z')


def get_float_or_none(value):
    if value is None:
        return None
    return float(value)


def multi_dim_min(val_array, axis=0):
    mi = float('inf')
    for val in val_array:
        mi = min(mi, val[axis])
    return mi


def multi_dim_max(val_array, axis=0):
    ma = float('-inf')
    for val in val_array:
        ma = max(ma, val[axis])
    return ma


def long_trafo(lng):
    return min(max(lng, -180), 180)


def get_coordinates(location_string):
    coordinates = []
    try:
        start = location_string.index('((') + 2
        end = location_string.index('))', start)
        coord_string = location_string[start:end]
    except ValueError:
        coord_string = location_string
    for coord_pair in coord_string.split(','):
        lng, lat = coord_pair.rstrip().rsplit(' ', 1)
        coordinates.append([float(lng.replace(' ', '')), float(lat.replace(' ', ''))])
    return coordinates


def get_geojson_geometry(coordinates):
    if coordinates is None:
        return None
    if len(coordinates) == 1:
        new_geometry = geojson.Point(coordinates[0])
        # print 'Empty polygon %s' % coordinates
    else:
        new_geometry = geojson.Polygon([coordinates])
    return new_geometry


def is_empty_bounds(coordinates):
    return abs(coordinates[2] - coordinates[0]) < 0.00001 and abs(coordinates[3] - coordinates[1]) < 0.00001


def get_shapely_projected_polygon(geojson_geometry, py_projection=None):
    try:
        geom_type = geojson_geometry['type']
        if geom_type == 'Point':
            lon = geojson_geometry['coordinates'][0]
            lat = geojson_geometry['coordinates'][1]
        else:
            lon, lat = zip(*geojson_geometry['coordinates'][0])

        x, y = lon, lat
        if py_projection is not None:
            x, y = py_projection(lon, lat)

        coordinates = [x, y] if geom_type == 'Point' else [zip(x, y)]
        cop = {"type": geom_type, "coordinates": coordinates}
        return shape(cop)
    except Exception as e:
        print('get_shapely_projected_polygon Error %s' % e)
        log.app_log.error('get_shapely_projected_polygon Error %s' % e)


def filter_on_area(geometry, shapely_view_bbox, fraction, inside):
    shapely_geometry = get_shapely_projected_polygon(geometry)
    bbox_contains = shapely_view_bbox.contains(shapely_geometry)
    if bbox_contains:
        return inside

    geometry_contains = shapely_geometry.contains(shapely_view_bbox)
    if not inside and geometry_contains:
        return True

    intersection = shapely_view_bbox.intersection(shapely_geometry)
    if intersection.is_empty:
        return not inside

    geometry_area = shapely_geometry.area
    if geometry_area < 0.001:
        return inside

    geometry_fraction = intersection.area / geometry_area
    if inside:
        return geometry_fraction >= fraction
    else:
        return geometry_fraction < fraction


def add_bounds(bounds, coordinates):
    if len(coordinates) == 0:
        return bounds

    if len(bounds) == 0:
        return [multi_dim_min(coordinates, 0), multi_dim_min(coordinates, 1),
                multi_dim_max(coordinates, 0), multi_dim_max(coordinates, 1)]

    bounds[0] = min(multi_dim_min(coordinates, 0), bounds[0])
    bounds[1] = min(multi_dim_min(coordinates, 1), bounds[1])
    bounds[2] = max(multi_dim_max(coordinates, 0), bounds[2])
    bounds[3] = max(multi_dim_max(coordinates, 1), bounds[3])
    return bounds


def maybe_split_bbox(map_bbox):
    if map_bbox.get_width() > 180:
        split_long = 0.5 * (map_bbox.e0 + map_bbox.e1)
        return [ArgBBox(map_bbox.e0, map_bbox.n0, split_long, map_bbox.n1),
                ArgBBox(split_long, map_bbox.n0, map_bbox.e1, map_bbox.n1)]
    else:
        return [map_bbox]
    pass


class ArgBBox:
    key = "bbox"

    def __init__(self, e0, n0, e1, n1):
        self.e0 = long_trafo(float(e0))
        self.n0 = float(n0)
        self.e1 = long_trafo(float(e1))
        self.n1 = float(n1)

    @staticmethod
    def from_dict(req_args):
        val = req_args.get(ArgBBox.key)
        if val:
            arr = val[0].split(",")
            return ArgBBox(arr[0], arr[1], arr[2], arr[3])
        return None

    def to_polygon_string(self):
        return 'POLYGON((' + str(self.e0) + ' ' + str(self.n0) + ',' \
               + str(self.e1) + ' ' + str(self.n0) + ',' \
               + str(self.e1) + ' ' + str(self.n1) + ',' \
               + str(self.e0) + ' ' + str(self.n1) + ',' \
               + str(self.e0) + ' ' + str(self.n0) + '))'

    def to_coordinates(self):
        return [[self.e0, self.n0], [self.e1, self.n0], [self.e1, self.n1], [self.e0, self.n1], [self.e0, self.n0]]

    def get_width(self):
        return self.e1 - self.e0

    def get_height(self):
        return self.n1 - self.n0

    def __str__(self):
        return "BBox.w,s,e,n:" + str((self.e0, self.n0, self.e1, self.n1))


def get_bbox(request_dict):
    bbox = ArgBBox.from_dict(request_dict)
    if bbox.e0 <= -180 and bbox.e1 >= 180:
        if bbox.n0 <= -85:
            bbox.n0 = -90
        if bbox.n1 >= 85:
            bbox.n1 = 90

    return bbox


def filter_dict(detail_dict, attribute_list):
    return {k: detail_dict[k] for k in attribute_list if k in detail_dict}
