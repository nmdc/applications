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

import os
import multiprocessing
import random
import time

import jinja2
from concurrent.futures import ThreadPoolExecutor
from tornado import ioloop, web, options, log, gen, httpclient, httpserver, escape, concurrent

import util
import dataset_utils as dsu
import wms_utils


class BaseHandler(web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get_current_user(self):
        return self.get_secure_cookie('user')


class MainHandler(BaseHandler):
    def get(self):
        self.redirect('/mapSearch')


class AngularMapHandler(BaseHandler):
    def __init__(self, app, request, **kwargs):
        super(AngularMapHandler, self).__init__(app, request, **kwargs)
        self.template = ENV.get_template('index.html')

    def get(self):
        log.access_log.warn('Login by IP ' + self.request.remote_ip)
        self.write(self.template.render())


class DetailsHandler(BaseHandler):
    @gen.coroutine
    def get(self):
        dataset_ids = self.get_query_arguments('ID')[0].split(',')
        attrib = self.get_query_arguments('ATTRIBUTES')
        if len(attrib) > 0:
            dataset_attributes = attrib[0].split(',')
        else:
            dataset_attributes = None
        response = {}
        try:
            http = httpclient.AsyncHTTPClient()
            res = yield [http.fetch(API_URL + 'getMetadataDetails?doi=' + escape.url_escape(dataset_id)) for dataset_id
                         in dataset_ids]
            response['datasetDetails'] = [
                dsu.filter_detail_dict(escape.json_decode(body.body)['results'][0], dataset_attributes) for body in res]
        except Exception as e:
            log.app_log.error('DETAIL request failed for ID = ' + str(dataset_ids) + '\n' +
                              '(' + e.message + ')')
        self.write(response)


class WmsParametersHandler(BaseHandler):
    def get(self):
        wms_urls = self.get_query_arguments('URL')
        out = {'wmsParams': []}
        for url in wms_urls:
            out['wmsParams'] += wms_utils.extract_wms_parameters(url)['wmsParams']
        self.write(out)


class DownloadPageHandler(web.RequestHandler):
    DATASET_ATTRIBUTES = 'Entry_Title,Entry_ID,Data_Summary,Data_URL'

    def __init__(self, app, request, **kwargs):
         super(DownloadPageHandler, self).__init__(app, request, **kwargs)
         self.template = ENV.get_template('download.html')

    @gen.coroutine
    def get(self):
        try:
            http = httpclient.AsyncHTTPClient()
            res = yield http.fetch('http://localhost:' + str(port) + '/' +
                                   'getDetails?ID=' + self.get_query_arguments('ID')[0] +
                                   '&ATTRIBUTES=' + self.DATASET_ATTRIBUTES)
            self.write(self.template.render(response=escape.json_decode(res.body)['datasetDetails'], referer='http://nmdc.nodc.no'))
        except Exception as e:
            log.app_log.error('GET DOWNLOAD PAGE request failed for ID = ' + str(self.get_query_arguments('ID')[0]) + '\n' +
                              '(' + e.message + ')')


class BaseDataHandler(BaseHandler):
    executor = ThreadPoolExecutor(max_workers=10)

    @concurrent.run_on_executor
    @gen.coroutine
    def extract_intersecting_datasets(self, request_dict):
        http = httpclient.AsyncHTTPClient()
        first_res = []
        try:
            first_res, urls = dsu.get_initial_response_and_urls(request_dict, API_URL)
            remaining_res = yield [http.fetch(url) for url in urls]
            for r in remaining_res:
                first_res += escape.json_decode(r.body)['results']
        except Exception as e:
            log.app_log.error('Intersecting datasets request failed \n' +
                              '(' + e.message + ')')
        raise gen.Return(first_res)


class DataInsideHandler(BaseDataHandler):
    @gen.coroutine
    def get(self, *args, **kwargs):
        req_dict = util.request_to_dict(self.request)
        map_bbox = util.get_bbox(req_dict)
        try:
            pos_rows = yield self.extract_intersecting_datasets(req_dict).result()
            self.write(dsu.get_filtered_geojson(pos_rows, map_bbox, True, req_dict))
        except Exception as e:
            log.app_log.error('DataInside failed \n' +
                              '(' + e.message + ')')


class DataRelatedHandler(BaseDataHandler):
    @gen.coroutine
    def get(self, *args, **kwargs):
        req_dict = util.request_to_dict(self.request)
        map_bbox = util.get_bbox(req_dict)
        try:
            pos_rows = yield self.extract_intersecting_datasets(req_dict).result()
            self.write(dsu.get_filtered_geojson(pos_rows, map_bbox, False, req_dict))
        except Exception as e:
            log.app_log.error('DataRelated failed \n' +
                              '(' + e.message + ')')


def setup_logging():
    open(LOCAL_PATH + '/resources/nmdcserver.log', 'a+').close()  # make sure file exists
    try:
        if os.path.getsize(LOCAL_PATH + '/resources/nmdcserver.log') > 1024 * 1024 or \
                                time.time() - os.path.getctime(
                                        LOCAL_PATH + '/resources/nmdcserver.log') > 7 * 24 * 60 * 60:
            if os.path.isfile(LOCAL_PATH + '/resources/nmdcserver.log.1'):
                os.remove(LOCAL_PATH + '/resources/nmdcserver.log.1')
            os.rename(LOCAL_PATH + '/resources/nmdcserver.log', LOCAL_PATH + '/resources/nmdcserver.log.1')
    except Exception, e:
        print('Log file setup failed: ' + str(e))
    try:
        options.parse_config_file(LOCAL_PATH + '/resources/nmdcserver.conf')
    except Exception, e:
        log.app_log.warn('Config file not found, no logs saved. ' + str(e))
    finally:
        log.app_log.info('\n\n\n')
        log.app_log.info('____________ NMDC SERVER LOG ____________')
        log.app_log.info('Config file loaded.')
        log.access_log.setLevel('WARNING')


def string_to_list(list_as_string):
    return [escape.url_unescape(l) for l in list_as_string.strip('[]').split(',')]

LOCAL_PATH = os.path.dirname(os.path.realpath(__file__))
ENV = jinja2.Environment(loader=jinja2.FileSystemLoader(LOCAL_PATH + '/resources/htmlTemplates'))
ENV.filters['stringToList'] = string_to_list
API_URL = 'http://prod1.nmdc.no/metadata-api/'

if __name__ == '__main__':
    setup_logging()
    settings = {'cookie_secret': str(random.randint(1, 1000000)), 'login_url': '/login'}
    application = web.Application([(r'/', MainHandler),
                                   (r'/mapSearch', AngularMapHandler),
                                   (r'/getDetails', DetailsHandler),
                                   (r'/getWmsParameters', WmsParametersHandler),
                                   (r'/getDownloadPage', DownloadPageHandler),
                                   (r'/getDataInside', DataInsideHandler),
                                   (r'/getDataRelated', DataRelatedHandler),
                                   (r'/static/(.*)', web.StaticFileHandler, {'path': LOCAL_PATH + '/resources'}),
                                   ], **settings)

    port = 8080
    server = httpserver.HTTPServer(application)
    if 'fork' in dir(os):  # fork not supported on Windows...
        server.bind(port)
        server.start(4 * multiprocessing.cpu_count())
        log.app_log.info('Started 4 processes per CPU.')
    else:
        application.listen(port)
        log.app_log.info('Started one processes.')
    ioloop.IOLoop.instance().start()
