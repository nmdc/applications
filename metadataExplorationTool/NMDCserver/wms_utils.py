# Copyright (c) 2016 Norwegian Marine Data Centre
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


from xml.etree import ElementTree as Et
from tornado import httpclient, log


class Wms:
    http = httpclient.HTTPClient()

    def __init__(self, url):
        self.url = url
        try:
            response = self.http.fetch(self.url + '?service=WMS&request=GetCapabilities').body
            self.error = None
        except httpclient.HTTPError as e:
            log.app_log.error('Could not reach WMS service ' + self.url + ' , error =' + e.message)
            self.error = 'Could not reach WMS service ' + self.url + ' , error =' + e.message
        except Exception as e:
            self.error = 'Something went wrong opening "' + self.url + '", error=' + e.message
        else:
            try:
                self.xml = Et.fromstring(response)
                self.version = self.xml.attrib['version']
                tag = self.xml.tag
                self.namespace = tag[tag.index('{'):tag.index('}') + 1]
                self.service = self._find(self.xml, 'Service')
                self.cap = self._find(self.xml, 'Capability')
                get_map = self._find(
                        self._find(self.cap, 'Request'),
                        'GetMap')
                self.formats = [e.text for e in self._findall(get_map, 'Format')]
                self.get_map_urls = self._find(
                        self._find(
                                self._find(
                                        self._find(get_map, 'DCPType'),
                                        'HTTP'),
                                'Get'),
                        'OnlineResource').attrib.values()
                self.access_constrains = self._find(self.service, 'AccessConstraints').text
                self.layers = self._generate_layers(self._findall(self.cap, 'Layer'))
            except Exception as e:
                self.error = 'Failed to parse getCapabilities response of ' + self.url


    def _get_correct_wms_version(self):
        return self.xml.attrib['version']

    def _find(self, elem, tag):
        return elem.find(self.namespace + tag)

    def _findall(self, elem, tag):
        return elem.findall(self.namespace + tag)

    def _generate_layers(self, layer_elements):
        out = []
        for le in layer_elements:
            sub_layers = self._findall(le, 'Layer')
            try:
                out += [Layer(le, self.namespace)]
            except Exception as e:
                pass
            if len(sub_layers) > 0:
                out += self._generate_layers(sub_layers)
        return out


class Layer:
    def __init__(self, layer_element, namespace):
        self.name = layer_element.find(namespace + 'Name').text
        attrib = layer_element.find(namespace + 'Attribution')
        self.attrib = attrib.find(namespace + 'Title').text if attrib is not None else ''
        crs = layer_element.find(namespace + 'CRS')
        self.epsg = crs.text if crs is not None else ''


def extract_wms_parameters(url):
    out = {'wmsParams': []}
    wms_url = url.split('?')[0]
    wms = Wms(wms_url)

    if wms.error is None:
        version = wms.version
        form = 'image/png' if 'image/png' in wms.formats else wms.formats[0]
        attrib = wms.access_constrains
        geturl = wms.get_map_urls[0].split('?')[0]

        for layer in wms.layers:
            out['wmsParams'] += [{
                'url': geturl,
                'name': layer.name,
                'version': version,
                'format': form,
                'attribution': layer.attrib if len(layer.attrib) > 0 else attrib,
                'epsg': layer.epsg
            }]
    else:
        out['wmsParams'] += [{
            'error': wms.error
        }]
    return out
