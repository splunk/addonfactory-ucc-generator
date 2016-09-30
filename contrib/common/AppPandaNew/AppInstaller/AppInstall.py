import os
import sys
import glob
from Utils import AppPandaUtils

class AppInstall:
    
    def __init__(self, parse_args, app_package, update, logger):
        self.parse_args = parse_args
        self.package    = app_package
        self.logger     = logger
        self.utils      = AppPandaUtils(self.logger)
        self.update     = update
        
        self.install_app()
        
    def install_app(self):

        '''
        Install Splunk App.
        '''

        self.logger.info("CLI : STARTING TO INSTALL APP %s.", self.package)
        print "Installing the following App - ",self.package

        #Handle the case where we have local apps for installation
        if self.utils.verify_splunk_app_file(self.package) == False:
            self.logger.info("CLI : Verification failed for the App %s installation path/file", self.package)
            return
        
        #Now since the file is verified, install the app.
        #App Installation is done through REST endpoint with the exception of ITSI and OLD ES.
        if os.path.basename(self.package).startswith('itsi') or os.path.basename(self.package).startswith("splunk_app_grayskull") \
         or os.path.basename(self.package).startswith('splunk_app_installer_es') or os.path.basename(self.package).startswith('splunk_app_vmware') \
         or os.path.basename(self.package).startswith('splunk_app_for_vmware') or os.path.basename(self.package).startswith('splunk_app_netapp') \
         or os.path.basename(self.package).startswith('splunk_add_on_for_vmware'):
            self.install_app_using_extraction(self.package)
        else:
            self.install_app_using_rest(self.package)

    def install_app_using_rest(self, package):
        '''
        Install App using REST API call.
        '''
        self.utils.install_app_package(package, self.update)

        #Setup ES by running | testessinstall command.
        if package.find('splunk_app_es') != -1 or package.find('splunk_app_pci') != -1:
            self.logger.info("CLI : Setting Up ES 4.0 and greater")
            if sys.platform == 'win32':
                cmd = os.path.join(self.parse_args.splunk_home, "bin", "splunk.exe")
            else:
                cmd = os.path.join(self.parse_args.splunk_home, "bin", "splunk")

            cmd += " search \"|testessinstall\" -auth admin:changeme"
            self.logger.info("Running testessinstall %s", cmd)
            os.system(cmd)

    def install_app_using_extraction(self, package):
        '''
        Install App by NOT using Splunk REST API.
        '''
        temp_dir = self.utils.extract_app_package(package)
        orig_temp_dir = temp_dir

        splunk_app_destination  = os.path.join(self.parse_args.splunk_home, "etc", "apps")
        splunk_deployment_apps  = os.path.join(self.parse_args.splunk_home, "etc", 'deployment-apps')

        #Special case for itsi as it unzips to etc/apps.
        if os.path.basename(package).startswith('itsi') or os.path.basename(package).startswith("splunk_app_grayskull"):

            if not self.parse_args.itsi_deploy_one_app:
                pass
            else:
                self.logger.info("Copying one App SA-AppInstallation")

            self.utils.copy_app_contents(temp_dir, splunk_app_destination)
        #Special case for Enterprise security.
        elif os.path.basename(package).startswith('splunk_app_installer_es'):
            current_dir = os.getcwd()
            os.chdir(os.path.join(temp_dir, 'SplunkEnterpriseSecurityInstaller', 'default', 'src'))
            base_file = glob.glob("*.zip")[0]

            self.logger.info("CLI : The SplunkEnterpriseSecurityInstaller zip is %s", base_file)
            os.chdir(current_dir)
            self.utils.extract_zip_file(os.path.join(temp_dir, 'SplunkEnterpriseSecurityInstaller', 'default', 'src', base_file), temp_dir)

            self.utils.copy_app_contents(os.path.join(temp_dir, 'etc', 'apps'), splunk_app_destination)
            self.utils.copy_app_contents(os.path.join(temp_dir, 'etc', 'deployment-apps'), splunk_deployment_apps)
            
            '''elif os.path.basename(self.package).startswith('splunk_app_vmware') or os.path.basename(self.package).startswith('splunk_app_netapp'):
            self.utils.copy_app_contents(os.path.join(temp_dir, 'etc', 'apps'), splunk_app_destination)
            self.utils.remove_directory(orig_temp_dir)'''

        elif os.path.basename(self.package).startswith('splunk_app_for_vmware') or os.path.basename(self.package).startswith('splunk_add_on_for_vmware') or os.path.basename(self.package).startswith('splunk_app_netapp'):
            self.utils.copy_app_contents(temp_dir, splunk_app_destination)
            self.utils.remove_directory(orig_temp_dir)