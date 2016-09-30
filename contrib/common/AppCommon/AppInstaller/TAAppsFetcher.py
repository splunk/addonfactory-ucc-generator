import urllib2
from bs4 import BeautifulSoup

class TAAppsFetcher:
    
    def __init__(self, logger):
        self.logger = logger
        self.ta_server = "http://ta-build-sec.sv.splunk.com"
        self.apps_build_server = "http://apps-build:8081"
        
        self.logger.info("CLI : In TA APPS Fetcher...")

    def get_url(self, app_name, version='latest', specific_version=None):
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
            releases_url = urllib2.urlopen(app_url)
            releases_html = releases_url.read()
            releases_soup = BeautifulSoup(releases_html)
        
            app_build = [link.text for link in releases_soup.find_all('a') if (link.text.endswith('.spl') or link.text.endswith('.tgz'))]
        
            if len(app_build) != 1:
                return None
            else:
                app_url += app_build[0]
        
            return app_url
        except:
            return None
