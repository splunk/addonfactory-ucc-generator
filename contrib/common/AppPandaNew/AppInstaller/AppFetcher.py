import os
import re
import urllib2
from bs4 import BeautifulSoup

class LocalAppFetcher:
    
    def __init__(self, parse_args, logger):

        self.parse_args = parse_args
        self.logger     = logger
        
        self.logger.info("CLI : In Local Apps Fetcher.")
    
    def get_local_apps(self):
        
        local_apps_list = []
        #The case where local app installer is provided.
        if self.parse_args.localappinstaller:
            self.logger.info("CLI : Fetching the Local Apps provided.")
            self.logger.info("CLI : Installing the following apps: %s",
                              self.parse_args.localappinstaller)
            
            for app in self.parse_args.localappinstaller:

                if app.startswith('http'):
                    #Since the URL of app is provided, download the app.
                    app_name = os.path.basename(app)
                    download_app = self.download_app_package(app, app_name)
                    
                    if download_app is not None:
                        local_apps_list.append(download_app)
                else:
                    dir_name = os.path.dirname(app)
                    complete_app = os.path.basename(app)
                    if dir_name == '':
                        matching_apps = [complete_app]
                    else:
                        matching_apps = [re.search(complete_app, f).group(0) for f in os.listdir(dir_name) if os.path.isfile(os.path.join(dir_name, f)) and (re.search(complete_app, f) is not None)]
                    self.logger.info("The number of matching Apps are %s", matching_apps)
                    
                    if len(matching_apps) > 0:    
                        app = os.path.join(dir_name, matching_apps[0])
                        if os.path.exists(app):
                            local_apps_list.append(app)
                        else:
                            self.logger.info("Could not find the path to App %s", app)
                    else:
                        self.logger.info("Could not find the match to App %s", app)
                        
        return local_apps_list

    def download_app_package(self, package_url, package_name=None):
        '''
        Download the file from package URL.
        '''
        try:
            splunk_package_data = urllib2.urlopen(package_url)
            if package_name is None:
                _tmp = splunk_package_data.info()['content-disposition']
                splunk_package_name = re.search('filename=(.+)$', _tmp).group(1)
            else:
                splunk_package_name = package_name
                
            self.logger.info("CLI : The file downloaded is %s", splunk_package_name)
            _file = open(splunk_package_name, 'wb')
            _file.write(splunk_package_data.read())
            _file.close()
            return splunk_package_name

        except:
            print "App Download Failed."
            return None

class ServerAppFetcher(LocalAppFetcher):
    
    def __init__(self, parse_args, logger, artifactory=False):
        LocalAppFetcher.__init__(self, parse_args, logger)
        
        self.ta_server  = "http://ta-build-sec.sv.splunk.com"
        self.apps_build_server = "http://apps-build:8081"
        self.sc_build_server = "http://sc-build.sv.splunk.com:8081/cgi-bin/app_build_fetcher.py?"
        self.artifactory_server = "http://repo.splunk.com/artifactory/Solutions/"

        if artifactory:
            self.parse_args.artifactorypull = True

        self.logger.info("CLI : In Server App Fetcher.")

    def get_remote_apps(self):
    
        download_apps_list = []
        if self.parse_args.appname:

            if self.parse_args.appversion is None:
                self.parse_args.appversion = []

            if self.parse_args.build_numbers is None:
                self.parse_args.build_numbers = []
            
            if self.parse_args.app_status is None:
                self.parse_args.app_status = []

            #App Details has the tuple of( App Name, App Specific Version) that can be used to download an App.
            #Eg: ('ES', 'latest')
            app_details = map(None, self.parse_args.appname, self.parse_args.appversion, self.parse_args.build_numbers, self.parse_args.app_status)

            DELIVER_AS = "DELIVER_AS=file" + "&"

            for (app, specific_version, build_number, app_status) in app_details:

                #Get the url of the app here.
                downloaded_app = None
                
                if self.parse_args.artifactorypull:
                    
                    if app.lower() == 'es':
                        app = 'app-ess'
                    
                    if app.lower() == 'itsi':
                        app = 'app-itsi'

                    app_url = self.get_artifactory_url(app, build_number=build_number, specific_version=specific_version, app_status=app_status)

                    if app_url is not None:
                        self.logger.info("CLI : The App is Downloaded from %s", app_url)
                        app_name = os.path.basename(app_url)
                        downloaded_app = self.download_app_package(app_url, app_name)
                        assert downloaded_app is not None
                
                if downloaded_app is None:
                
                    if app.startswith('TA-') or app.startswith('dbx'):
                    
                        app_url = self.get_server_url(app, specific_version=specific_version)
                    
                        if app_url is not None:
                            self.logger.info("APP CLI : The App is Downloaded from %s", app_url)
                            app_name = os.path.basename(app_url)
                            downloaded_app = self.download_app_package(app_url, app_name)
                    
                #TA app not found in ta-sec-build. Try sc-build.sv.splunk.com:
                if downloaded_app is None:
                    #Special case for Stream as its stores as cloudmeter on build.
                    if app.lower() == 'stream':
                        SOLN = "SOLN=cloudmeter" + "&"
                    else:
                        SOLN = "SOLN=" + app + '&'
                
                    if specific_version is None or specific_version == 'latest':
                        VERSION = "VERSION=latest" + "&"
                        SPECIFIC_VERSION = "SPECIFIC_VERSION=latest"
                    else:
                        VERSION = "VERSION=specific_version" + "&"
                        SPECIFIC_VERSION = "SPECIFIC_VERSION=" + specific_version
                
                    app_url = self.sc_build_server + SOLN + DELIVER_AS + VERSION + SPECIFIC_VERSION 
                    self.logger.info("APP CLI : The App is Downloaded from %s", app_url)
                    
                    downloaded_app = self.download_app_package(app_url)

                if downloaded_app is not None:
                    download_apps_list.append(downloaded_app)
                    
        return download_apps_list

    def get_server_url(self, app_name, version='latest', specific_version=None):
        '''
        Get the URL to the version or specific version of the app.
        Version - latest or releases
        specific_version 3.3.0 ,1.1.0, etc.
        '''
        if app_name.startswith('dbx'):
            app_url = self.apps_build_server + '/' + app_name
        else:
            app_url = self.ta_server + '/' + app_name
        
        if specific_version is None or specific_version == 'latest': 
            app_url += '/latest' + '/'
        else:
            
            if not app_name.startswith('dbx'):
                app_url += '/releases'
            
            if len(specific_version) != 5:
                return None
            
            app_specific_dir = specific_version[0:3] + '.x'
            app_url += '/' + app_specific_dir + '/' + specific_version + '/'
        
        try:
            releases_url    = urllib2.urlopen(app_url)
            releases_html   = releases_url.read()
            releases_soup   = BeautifulSoup(releases_html, 'html.parser')
        
            app_build =   [link.text for link in releases_soup.find_all('a') if (link.text.endswith('.spl') or link.text.endswith('.tgz'))]
        
            if len(app_build) != 1:
                return None
            else:
                app_url += app_build[0]
        
            return app_url
        except:
            return None
    
    def get_max_from_url(self, url):
        '''
        A helper function that just looks at all the
        releases and return the max(latest) one.
        '''
        releases_url    = urllib2.urlopen(url)
        releases_html   = releases_url.read()
        releases_soup   = BeautifulSoup(releases_html, 'html.parser')
        app_build =   [link.text for link in releases_soup.find_all('a') if link!='../']
        
        if len(app_build) == 0:
            self.logger.info("Could not find any builds in url %s", url)
            print "Could not find builds in %s URL" % (url)
            return

        return max(app_build)

    def get_latest_released_app_url(self, app_base_url=None):
        '''
        Get the latest released app_url from artifactory.
        '''
        assert app_base_url is not None
        self.logger.info("Getting latest released app from baseUrl %s", app_base_url)

        temp_url = app_base_url + '/' + 'releases'
        app_release_outer = self.get_max_from_url(temp_url)
        temp_url += '/' + app_release_outer
        self.logger.info("Release url %s", temp_url)
        
        app_release_inner = self.get_max_from_url(temp_url)
        
        temp_url += '/' + app_release_inner
        self.logger.info("Release url %s", temp_url)

        return temp_url

    def get_artifactory_url(self, app_name, build_number=None, specific_version=None, app_status=None):

        self.logger.info("CLI : In Artifactory Fetcher")
        
        if app_name.lower().startswith('ta'):
            repo_name = "TA/"
        elif app_name.lower().startswith('sa'):
            repo_name = "SA/"
        elif app_name.lower().startswith('da'):
            repo_name = "DA/"
        else:
            repo_name = "APP/"

        #The Base URL where the apps exist. Try both lowercase and normal url's.
        try:
            app_url = self.artifactory_server + repo_name + app_name.lower()
            url_exists = urllib2.urlopen(app_url)
        except:
            app_url = self.artifactory_server + repo_name + app_name
        
        if specific_version is None or specific_version == 'latest':
            #The case where specific version (--app_versions 4.1.0) is not provided. 
            app_url += '/' + 'builds' + '/' + 'develop' + '/'
            
            if build_number is not None:
                app_url += build_number + '/'
            else:
                app_url += 'latest' + '/'

        elif specific_version is not None and app_status == "develop":
            app_url += '/' + 'builds' + '/' + specific_version + '/'
            if build_number is not None:
                app_url += build_number + '/'
            else:
                app_url += 'latest' + '/'

        else:
            #The case where app_version is provided.
            if len(specific_version) != 5 and specific_version != 'released':
                print "app_version must be x.x.x or released."
                return None

            if specific_version == 'released':
                app_url = self.get_latest_released_app_url(app_url)
                print "Downloading LATEST RELEASED %s app from %s URL" %(app_name, app_url)

            else:
                app_specific_dir = specific_version[0:3] + '.x'
                app_url +=  '/' + 'releases' + '/' + app_specific_dir + '/' + specific_version + '/'
                print "Downloading RELEASED %s VERSION %s app from %s URL" %(specific_version, app_name, app_url)

        self.logger.info("CLI : Final app_url is %s", app_url)

        try:
            releases_url    = urllib2.urlopen(app_url)
            releases_html   = releases_url.read()
            releases_soup   = BeautifulSoup(releases_html, 'html.parser')
            app_build =   [link.text for link in releases_soup.find_all('a') if (link.text.endswith('.spl') or link.text.endswith('.tgz'))]

            if len(app_build) == 0:
                return None
            else:
                app_url += app_build[0]  
            
            return app_url
        except:
            return None