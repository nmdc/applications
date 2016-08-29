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
import subprocess
from os.path import join
from functools import partial
from collections import OrderedDict
from distutils.version import LooseVersion

import sys


def locate_python():
    return os.path.split(sys.executable)[0]


def easy_install_it(what):
    py = locate_python()
    try:
        return subprocess.call([join(py, 'scripts/easy_install'), what])
    except WindowsError, e:
        if '740' in str(e):
            print(' Did you forget to run this script with Administrator rights?')
        raise e


def pip_it(what):
    py = locate_python()
    try:
        return subprocess.call([join(py, 'scripts/pip'), 'install', what])
    except WindowsError, e:
        if '740' in str(e):
            print(' Did you forget to run this script with Administrator rights?')
        raise e


def download_it(url, suffix='.exe', silent_flag='/s'):
    import urllib2
    import tempfile

    print('Downloading file ' + url)
    dl = urllib2.urlopen(url)
    fd, fn = tempfile.mkstemp(suffix=suffix)
    tmpf = open(fn, 'wb')
    os.close(fd)
    try:
        tmpf.write(dl.read())
        tmpf.flush()
        tmpf.close()
        del tmpf
        print('Done downloading!, try installing... '),
        res = subprocess.call([fn, silent_flag])
    except Exception, e:
        os.remove(fn)
        raise e
    os.remove(fn)
    print('Done installing, deleting tempfile: ' + fn)
    if res != 0:
        raise Exception


version_numbers = {
    'setuptools': '0.5',
    'futures': '3',
    'nose': '1.3.0',
    'geojson': '1.0.6',
    'tornado': '3.2',
    'jinja2': '2.7',
    'shapely': '1.3.0',
    'nonexisting': '6.6.6'
}

dependencies = OrderedDict([
    ('setuptools', partial(download_it,
                           'http://pypi.python.org/packages/2.7/s/setuptools/setuptools-0.6c11.win32-py2.7.exe#md5=57e1e64f6b7c7f1d2eddfc9746bbaf20')),
    ('futures', partial(pip_it, 'futures')),
    ('nose', partial(easy_install_it, 'nose>=' + version_numbers['nose'])),
    ('geojson', partial(easy_install_it, 'geojson>=' + version_numbers['geojson'])),
    ('tornado', partial(easy_install_it, 'tornado>=' + version_numbers['tornado'])),
    ('jinja2', partial(easy_install_it, 'jinja2>=' + version_numbers['jinja2'])),
    ('shapely', partial(download_it,
                        'https://pypi.python.org/packages/2.7/S/Shapely/Shapely-1.3.0.win32-py2.7.exe#md5=dc8e5f0085f0d77a370724b3e1226685'))
    # ('nonexisting', partial(easy_install_it, 'nonexisting>=' + version_numbers['nonexisting']))
]
)

needed_module = {
    'setuptools': 'setuptools',
    'futures': 'concurrent.futures',
    'nose': 'nose',
    'geojson': 'geojson',
    'tornado': 'tornado',
    'jinja2': 'jinja2',
    'shapely': 'shapely',
    'nonexisting': 'nonexisting'
}

setup_tool = OrderedDict([
    ('setuptools', partial(download_it,
                           'http://pypi.python.org/packages/2.7/s/setuptools/setuptools-0.6c11.win32-py2.7.exe#md5=57e1e64f6b7c7f1d2eddfc9746bbaf20'))
])

PYTHON_VERSION = '2.7.6'

def check_python_version():
    if LooseVersion(str(sys.version)) < LooseVersion(PYTHON_VERSION):
        raise WindowsError('Detected Python ' + str(LooseVersion(sys.version)) + ' instead of ' + PYTHON_VERSION)


def check_and_install_setuptools():
    for tool in setup_tool:
        try:
            exec ('import ' + tool)
        except ImportError, e:
            try:
                dependencies[tool]()
                print(tool + ' was missing but successfully installed')
            except WindowsError, e:
                print('[FAIL] ' + tool + " " + str(e))
                raise e
        except Exception, e:
            print('[FAIL]' + tool + ' A mysterious error thrown when importing', e)
            raise e


def check_and_install_dependencies(dry_run=False):
    print "Testing for Python package dependencies (warning: works ONLY for python27/win32)"
    import pkg_resources

    for dep in dependencies.keys():
        try:
            exec('import ' + needed_module[dep])
            if LooseVersion(pkg_resources.get_distribution(dep).version) == LooseVersion(version_numbers[dep]):
                print('[OK] ' + dep)
            elif LooseVersion(pkg_resources.get_distribution(dep).version) > LooseVersion(version_numbers[dep]):
                print('[OK] ' + dep + ', newer than required version installed (' + str(LooseVersion(pkg_resources.get_distribution(dep).version)) + ')')
            else:
                try:
                    if not dry_run:
                        dependencies[dep]()
                        print('[OK] ' + dep + ', but needed update to version >= ' + (version_numbers[dep]))
                    else:
                        print('[MAYBE OK] ' + dep + ' needs update. Set dry_run=False for trying an update.')
                except WindowsError, e:
                    print('[Fail] ' + dep + " " + str(e))
        except ImportError:
            try:
                ans = dependencies[dep]()
                if ans != 0:
                    raise WindowsError('does not exist')
                print '[OK] ' + dep + ' was missing but successfully installed'
            except WindowsError, e:
                print('[FAIL] ' + dep + " " + str(e))
        except Exception, e:
            print('[FAIL] ' + dep + " A mysterious error thrown when importing", e)


if __name__ == '__main__':
    try:
        check_python_version()
        check_and_install_setuptools()
        check_and_install_dependencies(dry_run=True)
    except Exception as e:
        print(e)
