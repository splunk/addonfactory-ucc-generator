import os
import sys
import socket
from helmut.splunk.local import LocalSplunk
from AppUtils.AppPandaUtils import AppPandaUtils


class SetupApp:
    '''
    This class sets-up apps so that they can be used on Nightly's
    for running tests directly.
    '''
    def __init__(self, splunk_home, logger):
        
        self.logger = logger
        self.splunk_home = splunk_home
        self.utils = AppPandaUtils(self.logger)
        self.logger.info("CLI : Starting to Setup apps installed.")
            
    def setup_apps(self, app_package_names):

        self.logger.info("Starting to set-up Apps")

        for app in app_package_names:

            #Case for EventGen:
            if os.path.basename(app).startswith('SA-Eventgen'):
                self.setup_Eventgen()
            #Case for ES
            elif os.path.basename(app).startswith('splunk_app_installer_es'):
                self.setup_es()
            #Case for ITSI
            elif os.path.basename(app).startswith('itsi') or os.path.basename(app).startswith("splunk_app_grayskull"):
                self.setup_itsi()
            #Case for Stream
            elif os.path.basename(app).startswith('stream'):
                self.setup_stream()
    
    def setup_Eventgen(self):
        
        self.logger.info("Setting-up SA-Eventgen.")
        if os.path.exists(os.path.join(self.splunk_home, 'etc', 'apps', 'SA-Eventgen')):
            file_path   = os.path.join(self.splunk_home, 'etc', "apps", "SA-Eventgen", "local")
            file_name   = 'inputs.conf'
            if sys.platform.startswith("win"):
                append_text = '\n[script://.\\bin\\eventgen.py]\n'
            else:
                append_text = '\n[script://./bin/eventgen.py]\n'
            
            append_text     += 'disabled = false\n'
            self.utils.update_file(file_path, file_name, append_text)
        
            #Special Case for Windows where input.conf.windows has to be copies to input.conf
        
        else:
            return
    
    def setup_es(self):
        
        self.logger.info("Setting-up ES App.")
        splunk_cli = LocalSplunk(self.splunk_home)
        return_code, stdout, stderr = splunk_cli.execute_without_common_flags(
            "  search  \"| testessinstall\"  -auth  admin:changeme")
        self.logger.info(" stderr: " + stderr)
            
        if os.path.exists(os.path.join(self.splunk_home, 'etc', 'apps', 'SplunkEnterpriseSecuritySuite')):
            file_path   = os.path.join(self.splunk_home, 'etc', "apps", "SplunkEnterpriseSecuritySuite", "local")
            file_name   = 'app.conf'
            append_text = '\n[install]\n'
            append_text += 'is_configured=True\n'
            self.utils.update_file(file_path, file_name, append_text)
            self.setup_extreme_search()
        else:
            return
    
    def setup_extreme_search(self):
        
        extreme_bin_dir = os.path.join(
            self.splunk_home, 'etc', 'apps', 'Splunk_SA_ExtremeSearch', 'bin')
        
        if not os.path.exists(extreme_bin_dir):
            return
        for d in os.listdir(extreme_bin_dir):
            if os.path.isfile(os.path.join(extreme_bin_dir, d)):
                os.chmod(os.path.join(extreme_bin_dir, d), 0644)
            self.logger.info(
                "updated permissions for '%s'", os.path.join(extreme_bin_dir, d))

        extreme_64bit_dir = os.path.join(
            self.splunk_home, 'etc', 'apps', 'Splunk_SA_ExtremeSearch', 'bin', 'Linux', '64bit')
        
        if not os.path.exists(extreme_64bit_dir):
            return
        for d in os.listdir(extreme_64bit_dir):
            if os.path.isfile(os.path.join(extreme_64bit_dir, d)):
                os.chmod(os.path.join(extreme_64bit_dir, d), 0555)
            self.logger.info(
                "updated permissions for '%s'", os.path.join(extreme_64bit_dir, d))
    
    def setup_itsi(self):

        self.logger.info("Setting-up ES App.")
        if os.path.exists(os.path.join(self.splunk_home, 'etc', 'apps', 'itsi')):
            server_url  =  "https://" + socket.gethostname() + ":8089"
            curl_cmd    = "curl -k --user admin:changeme --data"
            restcall1   = "/servicesNS/nobody/itsi/configs/conf-app/install"
            restcall2   = "/servicesNS/nobody/itsi/admin/itsi/general_settings"
            
            cmd1        = curl_cmd + " is_configured=1 " + server_url + restcall1
            cmd2        = curl_cmd + " IT_do_install=1 " + server_url + restcall2
            
            os.system(cmd1)
            os.system(cmd2)
        else:
            return
    
    def setup_stream(self):
        self.logger.info("In Setup Stream")

        if os.path.exists(os.path.join(self.splunk_home, 'etc', 'apps', 'Splunk_TA_stream')):
            file_path   = os.path.join(self.splunk_home, 'etc', 'apps', 'Splunk_TA_stream', 'local')
            file_name   = 'inputs.conf'

            stream_url = "http://"+socket.gethostname()+ ":8000/splunk-es/en-us/custom/splunk_app_stream/"

            append_text = '\n[streamfwd://streamfwd]\n'
            append_text += stream_url + '\n'
            append_text += "disabled=False\n"

            self.utils.update_file(file_path, file_name, append_text) 
        else:
            return
