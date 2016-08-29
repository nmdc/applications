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
