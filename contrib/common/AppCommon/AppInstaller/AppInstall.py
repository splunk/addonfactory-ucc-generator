import os
import glob
from AppUtils.AppPandaUtils import AppPandaUtils


class AppInstall:
    
    def __init__(self, logger, parse_args, splunk_home, app_package):
        self.splunk_home = splunk_home
        self.package    = app_package
        self.logger     = logger
        self.utils      = AppPandaUtils(self.logger)
        self.parse_args = parse_args
        
        self.install_app()
        
    def install_app(self):

        '''
        Install Splunk App.
        '''

        self.logger.info("CLI : STARTING TO INSTALL APP %s.", self.package)

        #Handle the case where we have local apps for installation
        if self.utils.verify_splunk_app_file(self.package) == False:
            self.logger.info("CLI : Verification failed for the App %s installation path/file", self.package)
            return
        
        #Now since the file is verified, install the app.        
        temp_dir = self.utils.extract_app_package(self.package)
        orig_temp_dir = temp_dir

        splunk_app_destination  = os.path.join(self.splunk_home, "etc", "apps")
        splunk_deployment_apps  = os.path.join(self.splunk_home, "etc", 'deployment-apps')
        
        #Special case for itsi as it unzips to etc/apps.
        if os.path.basename(self.package).startswith('itsi') or os.path.basename(self.package).startswith("splunk_app_grayskull"):

            if not self.parse_args.itsi_deploy_one_app:
                pass
            else:
                self.logger.info("Copying one App SA-AppInstallation")
                
            self.utils.copy_app_contents(temp_dir, splunk_app_destination)

        #Special case for Enterprise security.
        elif os.path.basename(self.package).startswith('splunk_app_installer_es'):
            current_dir = os.getcwd()
            os.chdir(os.path.join(temp_dir, 'SplunkEnterpriseSecurityInstaller', 'default', 'src'))
            base_file = glob.glob("*.zip")[0]

            self.logger.info("CLI : The SplunkEnterpriseSecurityInstaller zip is %s", base_file)
            os.chdir(current_dir)

            self.utils.extract_zip_file(os.path.join(temp_dir, 'SplunkEnterpriseSecurityInstaller', 'default', 'src', base_file), temp_dir)
            
            self.utils.copy_app_contents(os.path.join(temp_dir, 'etc', 'apps'), splunk_app_destination)
            self.utils.copy_app_contents(os.path.join(temp_dir, 'etc', 'deployment-apps'), splunk_deployment_apps)
        # If the app is ES 4.0.0+, do not extract
        # Otherwise, extract the app to etc/apps
        elif not os.path.basename(self.package).startswith('splunk_app_es-'):
            self.utils.copy_app_contents(temp_dir, splunk_app_destination)

        self.utils.remove_directory(orig_temp_dir)
