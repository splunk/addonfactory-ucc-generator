import os
import re
import sys
from Utils import AppPandaUtils
from AppInstall import AppInstall
from AppFetcher import LocalAppFetcher, ServerAppFetcher

class AppInstaller:
    '''
    The class that parses the command line argumants and 
    installs the Splunk apps appropriately.
    '''
    def __init__(self, parse_args, logger):
        self.parse_args = parse_args
        self.logger     = logger
        self.util       = AppPandaUtils(self.logger)
        self.logger.info("APP CLI : In Splunk App Installer.")
        self.all_apps   = []
        self.download_apps_list = []
        self.local_app_fetcher = LocalAppFetcher(parse_args, logger)
        self.server_app_fetcher = ServerAppFetcher(parse_args, logger)
        self.restart = False
        self.update = parse_args.update

        #The case where local app installer is provided.
        if self.parse_args.localappinstaller:
            local_apps_list = self.local_app_fetcher.get_local_apps()
            
            self.all_apps.extend(local_apps_list)
            self.logger.info("The local Apps List is %s", local_apps_list)
        
        #The case where app is to be installed from build server.
        if self.parse_args.appname:
            self.download_apps_list = self.server_app_fetcher.get_remote_apps()
            self.all_apps.extend(self.download_apps_list)
            self.logger.info("The Server download apps list is %s", self.download_apps_list)
            
        #Start installation of all the apps that are downloaded.
        if len(self.all_apps) > 0: 
            self.start_apps_installation(self.all_apps)
            print "Success - Apps Install."
            
    def start_apps_installation(self, app_package_files, local_app=False):
        '''
        Starts the App installation.
        '''
        self.logger.info("The following App(s) will be installed : %s", app_package_files)
        
        if app_package_files is None or len(app_package_files) == 0:
            print "App Install Failed"
            return
 
        for package in app_package_files:
            app_install = AppInstall(self.parse_args, package, self.update, self.logger)
        
        self.util.restart_splunk(self.parse_args.splunk_home)

        #Now that the Apps are Installed, we can Set-up the Apps if needed.
        if self.parse_args.setup:
            from SetupApp import SetupApp
            
            setup_app  = SetupApp(self.parse_args, self.logger)
            setup_app.setup_apps(app_package_files)
            
            #Setup is Complete Restart Splunk.
            self.util.restart_splunk(self.parse_args.splunk_home)

        if len(self.download_apps_list) > 0:
            for app in self.download_apps_list:            
                os.remove(app)