#!/usr/bin/env python

import json
import os
import re
import sys
import urllib2

from bs4 import BeautifulSoup

def get_app_name():
    if os.path.exists("build.json"):
        with open('build.json') as fp:
            app_name = json.load(fp)['name']
    else:
        with open('build.properties') as fp:
            for line in fp:
                line = line.strip()
                if line.startswith("package.name"):
                    _, app_name = line.split("=")

    if app_name.startswith("splunk_app"):
        return app_name
    elif app_name.startswith("Splunk_TA"):
        app_name = app_name.split("_")
        return "-".join(app_name[1:])
    elif app_name == "SA-ModularInput-PowerShell": # special for powershell
        return "TA-powershell"

class ServerAppFetcher():
    def __init__(self):
        self.artifactory_server = "http://repo.splunk.com/artifactory/Solutions/"

    def get_artifactory_url(self, app_name):
        print "CLI : In Artifactory Fetcher"

        if app_name.startswith('TA'):
            repo_name = "TA/"
        elif app_name.startswith('SA'):
            repo_name = "SA/"
        elif app_name.startswith('DA') or app_name.startswith('da'):
            repo_name = "DA/"
        else:
            repo_name = "APP/"

        app_url = self.artifactory_server + repo_name + app_name + '/' + 'builds'
        app_url += '/' + 'develop' + '/' + 'latest' + '/'
        print "CLI : app_url is ", app_url

        try:
            releases_url  = urllib2.urlopen(app_url)
            releases_html = releases_url.read()
            releases_soup = BeautifulSoup(releases_html, "html.parser")
            app_build     = [link.text for link in releases_soup.find_all('a') if (link.text.endswith('.spl') or link.text.endswith('.tgz'))]

            if len(app_build) == 0:
                return None
            else:
                app_url += app_build[0]

            return app_url
        except:
            return None

    def download_app_package(self, app_name):
        '''
        Download the file from package URL.
        '''
        package_url = self.get_artifactory_url(app_name)

        print package_url

        try:
            splunk_package_data = urllib2.urlopen(package_url)
            _tmp = splunk_package_data.info()['content-disposition']
            splunk_package_name = re.search('filename="(.+)".+$', _tmp).group(1)

            print "CLI : The file downloaded is ", splunk_package_name

            _file = open(splunk_package_name, 'wb')
            _file.write(splunk_package_data.read())
            _file.close()
            return splunk_package_name

        except:
            print "App Install Failed."
            return None

if __name__ == '__main__':
    app_cert = "/usr/local/bamboo/appinspect/checkapp.py"

    basedir = os.getcwd()
    os.chdir(basedir)

    app_name = get_app_name()

    app_fetcher = ServerAppFetcher()
    splunk_package_name = app_fetcher.download_app_package(app_name)

    os.system("python " + app_cert + " " + basedir + "/" + splunk_package_name)

