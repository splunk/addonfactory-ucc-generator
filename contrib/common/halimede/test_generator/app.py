import logging
import os
import tarfile
import urllib
from time import sleep
from urlparse import urlparse

import sys
from bs4 import BeautifulSoup
from splunklib import client
from splunklib import results
from splunklib.client import Collection

from halimede.splunk_helper.dashboard_parser import SplunkHelper


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class App:
    def __init__(self, url, password=None, app_name=None, app_version=None, extract_searches=False):
        self.host = urlparse(url).hostname
        self.port = 8089
        self.user = 'admin'
        self.password = password
        if password:
            self.password = password
        if app_name:
            self.app = app_name

        service = client.connect(
                host=self.host,
                port=self.port,
                username=self.user,
                password=self.password,
                owner='-',
                app=self.app
        )
        self.s_searches = []
        for saved_search in service.saved_searches.iter():
            if saved_search.access.app == self.app and saved_search['disabled'] == '0':
                self.s_searches.append(saved_search)

        '''define datamodel acceleration jobs'''
        self.d_searches = []
        datamodels = Collection(service=service, path='datamodel/model')
        for datamodel in datamodels:
            model_name = datamodel.name
            self.d_searches.append('_ACCELERATE_DM_' + self.app + '_' + model_name + '_ACCELERATE_')

        print self.d_searches

        # construct the build url
        url_base = 'https://repo.splunk.com/artifactory/Solutions/APP'
        url_context = 'https://repo.splunk.com/artifactory/Solutions/APP/{0}/builds/{1}/{2}/{3}-{4}.spl'
        if app_version:
            app_minor_version = app_version.split('-')[-1]
            app_major_version = app_version.split('-')[0]
            build_url = url_context.format(app_name, app_major_version, app_minor_version, app_name, app_version)
        else:
            build_url = extract_latest_version(url_base, app_name)

        # download the build package for analysis
        spl_file_name = app_name + '.spl'
        if not os.path.exists(spl_file_name):
            urllib.urlretrieve(build_url, spl_file_name)

        # extract content from spl
        if not os.path.exists(app_name):
            spl_file = tarfile.open(spl_file_name)
            spl_file.extractall()
            spl_file.close()

        # prob in xml to find dashboard names
        self.dashboards = SplunkHelper.find_dashboards(self.app)

        # prob in xml to find global searches. Post-process searches are ignored
        self.global_searches = SplunkHelper.find_all_dashboard_searches(self.app, self.dashboards)
        print self.global_searches


def extract_latest_version(url_base, app_name):
    latest_url = url_base + '/' + app_name + '/builds/develop/latest'
    content = urllib.urlopen(latest_url).read()
    html_content = BeautifulSoup(content, "html.parser")
    for a in html_content.find_all("a"):
        if a.text.endswith('.spl'):
            return latest_url + '/' + a.text


if __name__ == '__main__':
    a = App(url='http://localhost:8000/app', password='changeme', app_name='splunk_app_akamai')
