import os
from Utils import AppPandaUtils

BundledApps = {
    'es' : ['DA-ESS-*', 'SA-*', 'Splunk_SA_*', 'Splunk_TA_*', 'TA-*', 'SplunkEnterpriseSecuritySuite'],
    'itsi' : ['DA-ITSI-*', 'SA-*']
    }

class AppUninstaller:
    '''
    Handle Un-Installation of Splunk Apps.
    '''

    def __init__(self, args, logger):

        self.args = args
        self.logger = logger
        self.apps_to_delete = self.args.uninstall_apps
        self.utils = AppPandaUtils(self.logger)
        self.uninstall_apps()
        
    def uninstall_apps(self):
        '''
        Uninstall Splunk Apps.
        0. Get the list of apps to Uninstall.
        1. Goto $SPLUNK_HOME/etc/apps.
        2. Remove the app(s).
        3. Restart Splunk.
        '''
        if self.apps_to_delete is None:
            return

        self.logger.info("CLI : In Uninstallation of Apps %s", self.apps_to_delete)

        apps_for_deletion = []

        #Form a list of all the apps to delete.
        for app in self.apps_to_delete:
            if app.lower() == 'es' or app == 'app-ess' or app.lower() == 'pci' or app == 'app-pci':
                apps_for_deletion.extend(BundledApps.get('es', None))
            elif app.lower() == 'itsi':
                apps_for_deletion.extend(BundledApps.get('itsi', None))
            else:
                apps_for_deletion.append(app)

            self.logger.info("Deleting the following list of apps %s", apps_for_deletion)

            print "Stopping Splunk!!"
            self.utils.stop_splunk(self.args.splunk_home)
            self.remove_app_dirs(apps_for_deletion)
        
        print "Starting Splunk!!"
        self.utils.start_splunk(self.args.splunk_home)
        print "Completed Uninstallation of Apps"

    def remove_app_dirs(self, app_dirs):
        '''
        Delete App Directories and restart splunk.
        '''
        self.logger.info("Removing the directories now!")
        curr_dir = os.getcwd()
        splk_apps_dir = os.path.join(self.args.splunk_home, 'etc', 'apps')
        
        for app in app_dirs:
            os.chdir(splk_apps_dir)
            print "Removing the following app(s) %s" %(app)
            _cmd = "rm -rf " + app
            os.system(_cmd)

        os.chdir(curr_dir)
            
    