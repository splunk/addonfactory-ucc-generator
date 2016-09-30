import os
import re
import sys
import pickle
import urllib2
import platform
from Utils import AppPandaUtils
from abc import ABCMeta, abstractmethod
from Utils.BranchMapping import BranchMapping

class AbstractAppPandaSplunkInstaller:
    '''
    The base abstract class for Installing Splunk on Windows, Linux 
    and Darwin platforms. 
    '''
    __metaclass__ = ABCMeta
        
    def __init__(self, parse_args, logger):
        self.parse_args         = parse_args
        self.logger             = logger
        self.app_panda_utils    = AppPandaUtils(self.logger)

    def get_platform(self):
        '''
        Get the local platform.
        '''
        return sys.platform
    
    def store_app_panda_data(self):
        '''
        Stores the information of current Splunk install by pickling it.
        This is used when next instance of App Panda runs.
        '''
        self.logger.info("CLI : STORING THE CURRENT INSTALL INFO BY PICKLING.")
        app_panda_data_dir = os.path.expanduser(os.path.join('~','apppanda'))
        if not os.path.exists(app_panda_data_dir):
            os.mkdir(app_panda_data_dir)
        
        app_panda_data_file = open(os.path.join(app_panda_data_dir,"apppanda.pkl"), "wb")
        pickle.dump(self.parse_args, app_panda_data_file)
        app_panda_data_file.close()
    
    def get_app_panda_data(self):
        '''
        Retrieve the app-panda data from the previous apppanda.py
        run.
        '''
        self.logger.info("CLI : GETTING THE CURRENT INSTALL INFO BY UN-PICKLING.")
        app_panda_data = os.path.expanduser(os.path.join('~','apppanda','apppanda.pkl'))
        
        if os.path.exists(app_panda_data):
            app_panda_data_file = open(app_panda_data, "rb")
            app_panda_options = pickle.load( app_panda_data_file)
            app_panda_data_file.close()
            return app_panda_options
        else:
            return None
    
    def get_splunk_pkg_url(self, branch=None, version=None):
        '''
        Get the Splunk package url.
        '''
        if version == None and branch == None:
            self.logger.info("CLI : Installing current as the version and branch are not provided.")
            version = 'next'
            
        self.logger.info("CLI : Creating the URL for Build fetcher.")
        
        build_fetcher_url   = "http://releases.splunk.com/cgi-bin/splunk_build_fetcher.py"
        deliver_as          = "DELIVER_AS=file"

        #Set the Platform Package.
        if self.parse_args.plat_pkg:
            plat_pkg_value = 'PLAT_PKG=%s'%(self.parse_args.plat_pkg)
        else:
            architecture = platform.architecture()[0]
            if architecture == '64bit':
                if sys.platform == 'darwin':
                    plat_pkg_value = 'PLAT_PKG=darwin-64.tgz'
                elif sys.platform == 'win32':
                    plat_pkg_value = 'PLAT_PKG=x64-release.msi'
                else:
                    plat_pkg_value = 'PLAT_PKG=Linux-x86_64.tgz'
            else:
                if sys.platform == 'darwin':
                    plat_pkg_value = 'PLAT_PKG=darwin-64.tgz'
                elif sys.platform == 'win32':
                    plat_pkg_value = 'PLAT_PKG=x86-release.msi'
                else:
                    plat_pkg_value = 'PLAT_PKG=Linux-x86_64.tgz'
        
        #Set the Product we want to install from build fetcher.
        if self.parse_args.product:
            product_value = 'PRODUCT=%s'%(self.parse_args.product)
        else:
            product_value = 'PRODUCT=splunk'
        
        #If version is set use it by getting the respective branch mapping 
        #and get the the appropriate build to install.
        branch_version_value = ''
        if version:
            branch_mapping = BranchMapping(self.logger, version)
            mapping = branch_mapping.get_pseudo_panda_wrapper()
            self.logger.info("CLI : The pseudo branch mapping is %s", mapping)
            
            build_version = mapping.get(version)
            
            if build_version is not None:
                if build_version.startswith("{"):
                    branch_version_value = 'BRANCH=%s'%(build_version.strip('{}'))
                else:
                    branch_version_value = 'VERSION=%s'%(build_version)
            else:
                #Version is not found so Special Case it.
                branch_version_value = 'VERSION=%s'%(version)
        
        elif branch:
            branch_version_value = 'BRANCH=%s'%(branch)
        
        return ''.join([build_fetcher_url, '?', product_value, '&', deliver_as, '&', plat_pkg_value, '&', branch_version_value])
    
    def download_splunk_package(self, package_url, package_name=None):
        '''
        Download the file from package URL and save it on file system.
        '''
        try:
            self.logger.info("Trying to download Splunk Package from URL %s", package_url)
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
            return None
    
    def install_splunk_license(self, default=True):
        '''
        Install Splunk License.
        '''
        licenses_to_install = []
        if default:
            soln_root = os.environ.get('SOLN_ROOT', None)
            if soln_root is None:
                print "SOLN_ROOT is not set in environment, skipping installing default Splunk License"
                return
            
            default_license = os.path.join(soln_root, 'common', 'test', 'data', 'licenses', '5TB-1.lic')
            if self.verify_license(default_license):
                licenses_to_install.append(default_license)
            else:
                self.logger.info("LICENSE NOT INSTALLED")
                print "Could not verify license %s" %(default_license)
        else:
            licenses_list = self.parse_args.install_license
            
            if len(licenses_list) > 0:
                for license in licenses_list:
                    if self.verify_license(license):
                        licenses_to_install.append(license)
                    else:
                        self.logger.info("Could not Verify license %s", license)
                        print "Could not Install License %s"%(license)
        
        if len(licenses_to_install) > 0:   
            self.logger.info("CLI : Installing Splunk Licenses from %s", licenses_to_install)
            
            if sys.platform == 'win32':
                splunk_path = os.path.join(self.parse_args.splunk_home, 'bin', 'splunk.exe')
            else:
                splunk_path = os.path.join(self.parse_args.splunk_home, 'bin', 'splunk')
            
            for license in licenses_to_install:
                _cmd = [splunk_path, 'add', 'licenses', license]
                _cmd.extend(['-auth', 'admin:changeme', '--accept-license', '--no-prompt', '--answer-yes'])
                self.app_panda_utils.run_cmd(_cmd, required=True)
                print "Installed License %s"%(license)
                
            self.logger.info("Completed installing License... Restarting Splunk")
                
    def verify_license(self, license):
        '''
        Verify the license.
        '''
        (folder, ext) = os.path.splitext(license)
        
        return (ext == '.lic' or ext == '.xml') and os.path.exists(license)
    
    def get_local_installer_file(self, localsplunkinstaller):
        '''
        Get the path to the local splunk installer provided
        '''
        installerfile = None
        remove_package = False
        self.logger.info("CLI : LocalSplunkInstaller is provided")

        if localsplunkinstaller.startswith('http'):
            self.logger.info("CLI : URL of LocalSplunkInstaller %s is provided", localsplunkinstaller)
            splunk_installer_name = os.path.basename(localsplunkinstaller)
            installerfile = self.download_splunk_package(localsplunkinstaller, splunk_installer_name)
            remove_package = True
            
            if  self.verify_local_splunk_installer(installerfile) == False:
                return
        else: 
            self.logger.info("CLI : Local filesystem Path to LocalSplunkInstaller %s is provided", localsplunkinstaller)
            if  self.verify_local_splunk_installer(localsplunkinstaller) == False:
                return
            installerfile = localsplunkinstaller
        
        return (installerfile, remove_package)

    @abstractmethod
    def install_splunk(self, update=False, branch=None, version=None):
        
        raise NotImplementedError("install_splunk method is abstract.")
    
    @abstractmethod
    def verify_local_splunk_installer(self):
        
        raise NotImplementedError("verifiy_local_splunk_installer is abstract.")
    
    @abstractmethod
    def uninstall_splunk(self):
        
        raise NotImplementedError("uninstall_splunk method is abstract.")