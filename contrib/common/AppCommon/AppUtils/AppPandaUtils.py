import os
import sys
import shutil
import tarfile
import zipfile
import tempfile
from subprocess import Popen, PIPE
import warnings
try:
    import requests
except:
    pass


class AppPandaUtils:
    '''
    A Util class with some helper methods.
    '''
    def __init__(self, logger):
        self.platform           = sys.platform
        self.splunk_bin_path    = None
        self.start_cmd          = ["start"]
        self.stop_cmd           = ["stop"]
        self.restart_cmd        = ["restart"]
        self.start_options      = ["--accept-license", "--no-prompt", "--answer-yes"]
        self.auto_ports         = ["--auto-ports"]
        self.logger             = logger
                
        self.logger.info("CLI : In AppPandaUtils.")
            
    def start_splunk(self, splunk_home=None, first_run=False, auto_ports=False):
        '''
        Start Splunk.
        '''
        
        self.logger.info("CLI : In START SPLUNK.")
        if splunk_home is None or (os.path.exists(os.path.join(splunk_home, 'bin')) == False):
            self.logger.info("Splunk Home is None/does not exist, cannot start Splunk.")
            return
        
        if self.platform == 'win32':
            splunk_bin_path = [os.path.join(splunk_home, "bin", "splunk.exe")]
        else:
            splunk_bin_path = [os.path.join(splunk_home, "bin", "splunk")]
            
        start_command   = splunk_bin_path + self.start_cmd
        if first_run:
            self.logger.info("CLI : FIRST RUN START SPLUNK.")
            start_command += self.start_options
            if auto_ports:
                start_command += self.auto_ports
        
        if self.platform == 'win32':
            self.run_cmd(start_command, required=False, cwd=None, is_shell=True)
        else:
            self.run_cmd(start_command, required=False)
            
    def stop_splunk(self, splunk_home=None):
        '''
        Stop Splunk
        '''
        
        self.logger.info("CLI : Stopping Splunk.")
        if splunk_home is None or (os.path.exists(os.path.join(splunk_home, 'bin')) == False):
            self.logger.info("Splunk Home is None/does not exist, cannot Stop Splunk.")
            return

        if self.platform == 'win32':
            splunk_bin_path = [os.path.join(splunk_home, "bin", "splunk.exe")]
        else:
            splunk_bin_path = [os.path.join(splunk_home, "bin", "splunk")]

        stop_command    = splunk_bin_path + self.stop_cmd
        if self.platform == 'win32':
            self.run_cmd(stop_command, required=False, cwd=None, is_shell=True)
        else:
            self.run_cmd(stop_command, required=False)
                                
    def restart_splunk(self, splunk_home=None):
        '''
        Restart Splunk
        '''
        self.logger.info("CLI : In RE-START SPLUNK.")        
        if splunk_home is None or (os.path.exists(os.path.join(splunk_home, 'bin')) == False):
            self.logger.info("Splunk Home is None/does not exist, cannot restart Splunk.")
            return
        
        if self.platform == 'win32':
            splunk_bin_path = [os.path.join(splunk_home, "bin", "splunk.exe")]
        else:
            splunk_bin_path = [os.path.join(splunk_home, "bin", "splunk")]

        restart_command    = splunk_bin_path + self.restart_cmd
        self.logger.info("RESTART COMMANDS IS %s", restart_command)
        
        if self.platform == 'win32':
            self.run_cmd(restart_command, required=False, cwd=None, is_shell=True)
        else:
            self.run_cmd(restart_command, required=False)
            
    def enable_fips(self, splunk_home):
        '''
        Enable FIPS.
        '''
        self.logger.info("CLI : In Enable FIPS.")
        if splunk_home is None or (os.path.exists(splunk_home) == False):
            self.logger.info("Splunk Home is None/does not exist, cannot set FIPS.")
            return

        file_path   = os.path.join(splunk_home, 'etc')
        file_name   = 'splunk-launch.conf'
        append_text = "\nSPLUNK_FIPS = 1\n"
        self.update_file(file_path, file_name, append_text)
    
    def enable_allowRemoteLogin(self, splunk_home):
        '''
        Enable Remote Login.
        '''
        self.logger.info("CLI : In Enable RemoteLogin.")
        if splunk_home is None or (os.path.exists(splunk_home) == False):
            self.logger.info("Splunk Home is None/does not exist, cannot enable Remote Login.")
            return

        file_path   = os.path.join(splunk_home, 'etc', 'system', 'local')
        file_name   = 'server.conf'
        append_text = "[general]\nallowRemoteLogin=always\n"
        self.update_file(file_path, file_name, append_text)
            
    def update_splunkdb_path(self, splunk_home, splunkdb):
        '''
        Set the splunk_db path to the one specified in args.
        '''
        self.logger.info("CLI : Updating Splunkdb.")
        
        if splunk_home is None or (os.path.exists(splunk_home) == False):
            self.logger.info("Splunk Home is None/does not exist, cannot set Splunkdb path.")
            return
        
        file_path   = os.path.join(splunk_home, 'etc')
        file_name   = 'splunk-launch.conf'
        append_text = "\nSPLUNK_DB = %s\n"%(splunkdb)
        self.update_file(file_path, file_name, append_text)
    
    def clean_splunkdb(self, previous_splunk_db_path):
        '''
        Remove the Splunk DB from the previous installation.
        '''
        self.logger.info("CLI : In Clean Splunkdb.")
        self.logger.info("The Splunkdb path is %s", previous_splunk_db_path)
        if os.path.exists(previous_splunk_db_path):
            self.remove_directory(previous_splunk_db_path)
    
    def run_cmd(self, cmd, required=False, cwd=None, is_shell=False):
        '''
        Run a command cmd.
        '''
        _proc       = Popen(cmd, stderr=PIPE, stdout=PIPE, cwd=None, shell=is_shell)
        (so, se)    = _proc.communicate()
        _ret = {'STDOUT' : so, 'STDERR' : se, 'RETURN_CODE' : _proc.returncode}
        self.logger.info("Run Command result is %s", _ret)

        if required:
            if _ret['RETURN_CODE'] != 0:
                sys.exit('Error running cmd: "%s", returned: %s' % (cmd, _ret['RETURN_CODE']))

        return _ret
    
    def remove_directory(self, splunk_dir):
        '''
        Remove a complete directory.
        '''
        self.logger.info("CLI : In Remove Directory.")

        if os.path.isdir(splunk_dir):
            for root, dirs, files in os.walk(splunk_dir, topdown=True):
                os.chmod(root, 0777)
                for file in files:
                    os.chmod(os.path.join(root, file), 0777)
                    
                for dir in dirs:
                    os.chmod(os.path.join(root, dir), 0777)
            shutil.rmtree(splunk_dir)

            if os.path.lexists(splunk_dir):
                sys.exit(1)
        else:
            sys.exit(1)
    
    def update_file(self, file_path, file_name, append_text, write=False):
        '''
        Update any file.
        '''
        self.logger.info("CLI : In Update File.")
        file_update = os.path.join(file_path, file_name)
        if not os.path.exists(os.path.dirname(file_update)):
            os.makedirs(os.path.dirname(file_update))
        
        if write:
            with open(file_update, 'w') as file_opened:
                file_opened.write(append_text)
        else:
            with open(file_update, 'a') as file_opened:
                file_opened.write(append_text)

    def copy_file(self, src_path, dest_path):
        '''
        Copy a file to another location
        '''
        self.logger.info("CLI : In Copy File.")
        path, dest_file = os.path.split(dest_path)
        if not os.path.exists(os.path.dirname(path)):
            os.makedirs(os.path.dirname(path))
        shutil.copy(src_path, dest_path)

    def extract_zip_file(self, file_name, dest_dir):
        '''
        Extract ZIP file.
        '''
        #If the Apps are .zip files then use the below.
        self.logger.info("CLI : In extract ZIP file.")
        zip_file = zipfile.ZipFile(file_name)
        zip_file.extractall(path=dest_dir)

    def extract_tar_file(self, file_name, dest_dir):
        '''
        Extract TAR file.
        '''
        #If the apps are .spl or tgz then do the below.
        self.logger.info("CLI : In extract TAR file.")
        splunk_app = tarfile.open(file_name, "r:gz")
        splunk_app.extractall(dest_dir)
        splunk_app.close()

    def verify_splunk_app_file(self, app_install_path):
        '''
        Verfiy Splunk app installer file.
        '''
        self.logger.info("CLI : Verifying Splunk App file %s", app_install_path)
        if os.path.exists(app_install_path) and (tarfile.is_tarfile(app_install_path) or zipfile.is_zipfile(app_install_path)):
            return True
        else:
            print "Failed - App Install."
            return False
    
    def copy_app_contents(self, src, dest):
        '''
        Copy app's extracted contents from 
        src to dest.
        '''
        #Get the App that is present in temp_dir.
        self.logger.info("CLI : Copying app contents")
        all_dirs = os.listdir(src)
        
        for dirs in all_dirs:
            if os.path.isdir(os.path.join(src,dirs)) is True:
                #If upgrading app, remove the existing app dir.
                if os.path.exists(os.path.join(dest, dirs)):
                    shutil.rmtree(os.path.join(dest, dirs))
                shutil.copytree(os.path.join(src, dirs), os.path.join(dest, dirs))
            else:
                #If upgrading app, remove the existing app file.
                if os.path.exists(os.path.join(dest, dirs)):
                    os.remove(os.path.join(dest, dirs))
                shutil.copyfile(os.path.join(src, dirs), os.path.join(dest, dirs))
    
    def extract_app_package(self, app_package):
        '''
        Extract app package.
        '''
        self.logger.info("CLI : Extracting app package %s", app_package)
        temp_dir = tempfile.mkdtemp()

        if tarfile.is_tarfile(app_package):

            self.extract_tar_file(app_package, temp_dir)

        if  zipfile.is_zipfile(app_package):

            self.extract_zip_file(app_package, temp_dir)
        
        return temp_dir

    def install_app_package(self, app_package_path, url):
        '''
        Installs the specified app package via splunk's services/apps/local REST endpoint
        '''
        self.logger.info("CLI : Installing app package via REST %s", app_package_path)
        app_info = {'name': app_package_path, 'filename': 'true'}
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')
            r = requests.post('https://' + url + ':8089/services/apps/local', data=app_info, auth=('admin', 'changeme'), verify=False)
            self.logger.info('got request: %s', r.text)
            if r.status_code != 200:
                r.raise_for_status()