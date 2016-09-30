import os
import re
import sys
import tarfile
import urllib2
import zipfile

splunk_pkg_url = 'http://sc-build.sv.splunk.com:8081/cgi-bin/app_build_fetcher.py?SOLN=ES&DELIVER_AS=file'

_pkg = urllib2.urlopen(splunk_pkg_url)
pkg_name = re.search('filename=(.+)$', _pkg.info()['content-disposition']).group(1)
print 'Splunk package name: %s' % pkg_name

_file = open(pkg_name, 'wb')
_file.write(_pkg.read())
_file.close()

_tar = tarfile.open(pkg_name)

for name in _tar.getnames():
    if re.search('splunk_app.+zip', name):
        _name = os.path.basename(name)
        _file = _tar.extractfile(name)
        _zip = open(_name, 'wb')
        _zip.write(_file.read())
        _zip.close()

zipfile.ZipFile(_name).extractall(sys.argv[1])
