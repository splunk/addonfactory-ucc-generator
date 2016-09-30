import os
import shutil
import tempfile
from SplunkInstaller import AbstractAppPandaSplunkInstaller

from Utils import AppPandaUtils

class WindowsSplunkInstaller(AbstractAppPandaSplunkInstaller):

    def __init__(self, parse_args, logger):
        """
        The class handles the installation and un-installation of Splunk
        on Windows OS.
        """
        AbstractAppPandaSplunkInstaller.__init__(self, parse_args, logger)
        self.previous_splunk_args = self.get_app_panda_data()
        self.logger.info("Starting the WINDOWS Splunk Installer.")
    
    def install_splunk(self, update=False, branch=None, version=None):
        '''
        If local Splunk install file is provided, we use this 
        and discard other Splunk install options
        '''
    
        self.logger.info("CLI : STARTING TO INSTALL SPLUNK:")
        self.installer_file = None
        remove_package = False
        
        if  self.parse_args.localsplunkinstaller:
            #The case where local splunk installer is provided.
            self.installer_file, remove_package = self.get_local_installer_file(self.parse_args.localsplunkinstaller)
        else:
            #The case where we get Splunk from build fetcher.
            self.logger.info("CLI :Trying to install Splunk from build server")
            splunk_package_url = self.get_splunk_pkg_url(branch, version)
            
            if splunk_package_url == None:
                self.logger.info("CLI : Could not get the Package URL.")
                print "Failed"
                return
            else:
                self.logger.info("CLI : The PACKAGE URL is %s", splunk_package_url)
                self.installer_file = self.download_splunk_package(splunk_package_url)
                remove_package = True

        if self.installer_file == None:
            self.logger.info("CLI : Splunk Package file is not found/downloaded.")
            print "Failed"
            return

        _cmd = "msiexec /i "+ self.installer_file +" AGREETOLICENSE=yes"+" INSTALLDIR="+self.parse_args.splunk_home+" LAUNCHSPLUNK=0 /qn"
        self.app_panda_utils.run_cmd(cmd=_cmd, required=True, cwd=None, is_shell=True)
        
        if update:
            #If update remove the old installer and move the new one.
            os.remove(os.path.join(self.parse_args.splunk_home,"Uninstaller.msi"))
            shutil.copyfile(self.installer_file, os.path.join(self.parse_args.splunk_home,"Uninstaller.msi"))  
        else:
            #Move the installer.msi so use it to uninstall the next time.
            shutil.copyfile(self.installer_file, os.path.join(self.parse_args.splunk_home,"Uninstaller.msi"))

        #Remove the install package if it is downloaded from server.
        print "Installing the following Splunk - ",self.installer_file
        if remove_package == True:
            os.remove(self.installer_file)

        print "Success - Splunk Install..."
        
    def uninstall_splunk(self):
        '''
        Uninstall Splunk.
        '''
        #Previous app panda has the location where splunk is installed previously.
        self.logger.info("CLI : STARTING TO UN-INSTALL SPLUNK:")
        if self.previous_splunk_args is None:
            return
        
        if self.previous_splunk_args.splunk_home != None:
            if os.path.exists(self.previous_splunk_args.splunk_home):
                self.app_panda_utils.stop_splunk(self.previous_splunk_args.splunk_home)
            
            if os.path.exists(os.path.join(self.previous_splunk_args.splunk_home, 'Uninstaller.msi')):
                _cmd = "msiexec /x "+os.path.join(self.previous_splunk_args.splunk_home, 'Uninstaller.msi')+" /qn REMOVE=all RebootYesNo=No"
                self.app_panda_utils.run_cmd(cmd=_cmd, required=True, cwd=None, is_shell=True)

    def verify_local_splunk_installer(self, installer_file):
        self.logger.info("CLI : Verifying local installer  %s", self.parse_args.localsplunkinstaller)

        '''
        Verify the Splunk installer to match the platform.
        '''
        self.logger.info("CLI : Verifying local installer  %s", self.parse_args.localsplunkinstaller)
        if os.path.exists(installer_file):
            installer_name=os.path.basename(installer_file)
            return installer_name.find(".msi") != -1
        else:
            print "Failed"
            return False