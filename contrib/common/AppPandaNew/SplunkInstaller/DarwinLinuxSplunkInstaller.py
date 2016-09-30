import os
import sys
import time
import shutil
import tarfile
import tempfile
from glob import glob
from SplunkInstaller import AbstractAppPandaSplunkInstaller
from subprocess import check_output

from Utils import AppPandaUtils

class DarwinLinuxSplunkInstaller(AbstractAppPandaSplunkInstaller):
    """
    This class handles the installation and uninstallation of Splunk
    on Darwin and Linux OS's.
    """
    def __init__(self, parse_args, logger):
        
        AbstractAppPandaSplunkInstaller.__init__(self, parse_args, logger)
        self.previous_splunk_args = self.get_app_panda_data()
        self.logger.info("CLI : Starting the DARWIN/LINUX Splunk Installer.")
    
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
            #The case where we get splunk from build fetcher.
            self.logger.info("CLI : Trying to Install Splunk from Build Server")
            
            splunk_package_url = self.get_splunk_pkg_url(branch, version)
            if splunk_package_url == None:
                self.logger.info("CLI : Could not get the Package URL.")
                return
            else:
                self.logger.info("CLI : The PACKAGE URL is %s", splunk_package_url)
                self.installer_file = self.download_splunk_package(splunk_package_url)
                remove_package = True

        if self.installer_file == None:
            self.logger.info("CLI : Splunk Package file is not found/downloaded.")
            print "Failed"
            return
        
        if tarfile.is_tarfile(self.installer_file) == False:
            print "Failed"
            return

        #Extract the contents of the installer to tempdir and copy to splunk_home.
        temp_dir = tempfile.mkdtemp()
        splunk_app = tarfile.open(self.installer_file, "r:gz").extractall(temp_dir)
        
        if not update:
            shutil.copytree(glob('%s/*' % temp_dir)[0], self.parse_args.splunk_home)
        else:
            self.logger.info("UPDATING SPLUNK!!")
            cmd = "cp -rf " + os.path.join(temp_dir, "splunk","* ") + self.parse_args.splunk_home
            os.system(cmd)

        self.app_panda_utils.remove_directory(temp_dir)
        
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
                self.kill_mongod()
                self.app_panda_utils.remove_directory(self.previous_splunk_args.splunk_home)
                
                #Wait and see if $SPLUNK_HOME/var directory is created(It could be...in some cases).
                time.sleep(15)
                if os.path.exists(self.previous_splunk_args.splunk_home):
                    self.logger.info("CLI : Looks like Splunk was not cleaned properly, doing it again!")
                    self.app_panda_utils.remove_directory(self.previous_splunk_args.splunk_home)
                    
    def verify_local_splunk_installer(self, installer_file):
        '''
        Verify the Splunk installer to match the platform.
        '''
        self.logger.info("CLI : Verifying local installer  %s", self.parse_args.localsplunkinstaller)
        if os.path.exists(installer_file):
            installer_name=os.path.basename(installer_file)
            if sys.platform.startswith('darwin'):
                return installer_name.find("darwin") != -1
            elif sys.platform.startswith('linux'):
                return installer_name.find("Linux") != -1
            else:
                print "Failed"
                return False
        else:
            print "Failed"
            return False
    
    def kill_mongod(self):
        '''
        Kill Mongod if it's running.
        '''
        try:
            mongod_running = check_output(["pgrep", "mongod"]).split()
            for p in mongod_running:
                os.system("kill " + int(p))
        except:
            print "MongoD is not running. Not needed to force Kill it."
        