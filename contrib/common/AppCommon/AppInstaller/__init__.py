import os
from AppUtils.AppPandaUtils import AppPandaUtils
from AppInstall import AppInstall
from TAAppsFetcher import TAAppsFetcher
from AppFetcher import LocalAppFetcher, ServerAppFetcher


class AppInstaller:
    '''
    A class that installs the specified Splunk apps appropriately.
    '''
    def __init__(self, logger, arg_parser, splunk_home, local_apps=None, fetch_apps=None, app_versions=None,
                 from_artifactory=False, build_numbers=None, app_status=None, setup=False, no_splunk=False):
        self.splunk_home = splunk_home
        self.setup = setup
        self.no_splunk = no_splunk
        self.logger = logger
        self.util = AppPandaUtils(self.logger)
        self.logger.info("APP CLI : In Splunk App Installer.")
        self.all_apps = []
        self.download_apps_list = []
        self.arg_parser = arg_parser
        self.local_app_fetcher = LocalAppFetcher(arg_parser, logger)
        self.server_app_fetcher = ServerAppFetcher(arg_parser, logger)

        #The case where local app installer is provided.
        if self.arg_parser.localappinstaller:
            local_apps_list = self.local_app_fetcher.get_local_apps()
            self.all_apps.extend(local_apps_list)
            self.logger.info("The local Apps List is %s", local_apps_list)

        #The case where app is to be installed from build server.
        if self.arg_parser.appname:
            self.download_apps_list = self.server_app_fetcher.get_remote_apps()
            self.all_apps.extend(self.download_apps_list)
            self.logger.info("The Server download apps list is %s", self.download_apps_list)

        #Start installation of all the apps that are downloaded.
        if len(self.all_apps) > 0:
            self.start_apps_installation(self.all_apps)
            if not self.no_splunk:
                print "Success - Apps Install."

    def start_apps_installation(self, app_package_files):
        '''
        Starts the App installation.
        '''
        self.logger.info("The following App(s) will be installed : %s", app_package_files)
        
        if app_package_files is None or len(app_package_files) == 0:
            print "App Install Failed"
            return
        
        #1. Now Stop Splunk
        #2. Extract all the apps.
        #3. Restart Splunk.
        if not self.no_splunk:
            self.util.stop_splunk(self.splunk_home)
        
        for package in app_package_files:
            #This will install the App and setup if needed.
            app_install = AppInstall(self.logger, self.arg_parser, self.splunk_home, package)
        
        if not self.no_splunk:
            self.util.start_splunk(self.splunk_home)

        #Now that the Apps are Installed, we can Set-up the Apps if needed.
        if self.setup:
            from SetupApp import SetupApp

            setup_app  = SetupApp(self.arg_parser, self.logger)
            setup_app.setup_apps(app_package_files)

            #Setup is Complete Restart Splunk.s
            self.util.restart_splunk(self.splunk_home)

        if len(self.download_apps_list) > 0:
            for app in self.download_apps_list:
                if not app.startswith('splunk_app_es-'):
                    os.remove(app)
