import os
import sys
import socket
from helmut.splunk.local import LocalSplunk
from Utils import AppPandaUtils


class SetupApp:
    '''
    This class sets-up apps so that they can be used on Nightly's
    for running tests directly.
    '''
    def __init__(self, parse_args, logger):

        self.logger = logger
        self.parse_args = parse_args
        self.utils = AppPandaUtils(self.logger)
        self.logger.info("CLI : Starting to Setup apps installed.")

    def setup_apps(self, app_package_names):

        self.logger.info("Starting to set-up Apps")

        for app in app_package_names:

            # Case for EventGen:
            if os.path.basename(app).startswith('SA-Eventgen'):
                self.setup_Eventgen()
            # Case for ES
            elif os.path.basename(app).startswith('splunk_app_installer_es'):
                self.setup_es()
            # Case for ITSI
            elif os.path.basename(app).startswith('itsi') or os.path.basename(app).startswith("splunk_app_grayskull"):
                self.setup_itsi()
            # Case for Stream
            elif os.path.basename(app).startswith('stream'):
                self.setup_stream()
            # Case for ESHC
            elif os.path.basename(app).startswith('splunk_app_eshealthcheck'):
                self.setup_eshc()

    def setup_Eventgen(self):

        try:
            self.logger.info("Setting up NEW SA-Eventgen from modinput.")
            import requests
            r = requests.post('https://localhost:8089/servicesNS/nobody/SA-Eventgen/data/inputs/eventgen_modinput/main/enable',
                              auth=('admin', 'changeme'), verify=False)
            self.logger.info("The result of enabling SA-Eventgen modinput is %s, %s", r.status_code, r.content)
            assert r.status_code == requests.codes.ok

        except:

            self.logger.info("Setting-up OLD SA-Eventgen.")
            if os.path.exists(os.path.join(self.parse_args.splunk_home, 'etc', 'apps', 'SA-Eventgen')):
                file_path = os.path.join(self.parse_args.splunk_home, 'etc', "apps", "SA-Eventgen", "local")
                file_name = 'inputs.conf'
                if sys.platform.startswith("win"):
                    stanza = 'script://.\\bin\\eventgen.py'
                else:
                    stanza = 'script://./bin/eventgen.py'

            settings = {"disabled": "false"}
            self.utils.add_stanza_data(user='nobody', app='SA-Eventgen', conf='inputs', stanza=stanza, **settings)

    def setup_es(self):

        self.logger.info("Setting-up ES App.")
        splunk_cli = LocalSplunk(self.parse_args.splunk_home)
        return_code, stdout, stderr = splunk_cli.execute_without_common_flags(
            "  search  \"| testessinstall\"  -auth  admin:changeme")

        if os.path.exists(os.path.join(self.parse_args.splunk_home, 'etc', 'apps', 'SplunkEnterpriseSecuritySuite')):
            settings = {"is_configured": "True"}
            self.utils.create_stanza(user='nobody', app='SplunkEnterpriseSecuritySuite', conf='app', stanza='install')
            self.utils.add_stanza_data(user='nobody', app='SplunkEnterpriseSecuritySuite', conf='app', stanza='install',
                                       **settings)
            self.setup_extreme_search()
        else:
            return

    def setup_extreme_search(self):

        extreme_bin_dir = os.path.join(
            self.parse_args.splunk_home, 'etc', 'apps', 'Splunk_SA_ExtremeSearch', 'bin')

        if not os.path.exists(extreme_bin_dir):
            return
        for d in os.listdir(extreme_bin_dir):
            if os.path.isfile(os.path.join(extreme_bin_dir, d)):
                os.chmod(os.path.join(extreme_bin_dir, d), 0644)
            self.logger.info(
                "updated permissions for '%s'", os.path.join(extreme_bin_dir, d))

        extreme_64bit_dir = os.path.join(
            self.parse_args.splunk_home, 'etc', 'apps', 'Splunk_SA_ExtremeSearch', 'bin', 'Linux', '64bit')

        if not os.path.exists(extreme_64bit_dir):
            return
        for d in os.listdir(extreme_64bit_dir):
            if os.path.isfile(os.path.join(extreme_64bit_dir, d)):
                os.chmod(os.path.join(extreme_64bit_dir, d), 0555)
            self.logger.info(
                "updated permissions for '%s'", os.path.join(extreme_64bit_dir, d))

    def setup_itsi(self):

        self.logger.info("Setting-up ES App.")
        if os.path.exists(os.path.join(self.parse_args.splunk_home, 'etc', 'apps', 'itsi')):
            server_url = "https://" + socket.gethostname() + ":8089"
            curl_cmd = "curl -k --user admin:changeme --data"
            restcall1 = "/servicesNS/nobody/itsi/configs/conf-app/install"
            restcall2 = "/servicesNS/nobody/itsi/admin/itsi/general_settings"

            cmd1 = curl_cmd + " is_configured=1 " + server_url + restcall1
            cmd2 = curl_cmd + " IT_do_install=1 " + server_url + restcall2

            os.system(cmd1)
            os.system(cmd2)
        else:
            return

    def setup_stream(self):
        self.logger.info("In Setup Stream")

        if os.path.exists(os.path.join(self.parse_args.splunk_home, 'etc', 'apps', 'Splunk_TA_stream')):
            file_path = os.path.join(self.parse_args.splunk_home, 'etc', 'apps', 'Splunk_TA_stream', 'local')
            file_name = 'inputs.conf'

            stream_url = "http://"+socket.gethostname() + ":8000/splunk-es/en-us/custom/splunk_app_stream/"

            append_text = '\n[streamfwd://streamfwd]\n'
            append_text += stream_url + '\n'
            append_text += "disabled=False\n"

            self.utils.update_file(file_path, file_name, append_text)
        else:
            return

    def setup_eshc(self):
        self.logger.info("In Setup ESHC")

        if os.path.exists(os.path.join(self.parse_args.splunk_home, 'etc', 'apps', 'splunk_app_eshealthcheck')):
            settings = {"is_configured": "True"}
            self.utils.create_stanza(user='nobody', app='splunk_app_eshealthcheck', conf='app', stanza='install')
            self.utils.add_stanza_data(user='nobody', app='splunk_app_eshealthcheck', conf='app',
                                       stanza='install', **settings)

            hostname = socket.gethostname()

            settings = {'definition': '"{}"'.format(hostname), 'disabled': 0}
            self.utils.create_stanza(user='nobody', app='splunk_app_eshealthcheck', conf='macros',
                                     stanza='search_heads')
            self.utils.add_stanza_data(user='nobody', app='splunk_app_eshealthcheck', conf='macros',
                                       stanza='search_heads', **settings)

            settings = {'definition': '"{}"'.format(hostname), 'disabled': 0}
            self.utils.create_stanza(user='nobody', app='splunk_app_eshealthcheck', conf='macros', stanza='indexers')
            self.utils.add_stanza_data(user='nobody', app='splunk_app_eshealthcheck', conf='macros', stanza='indexers',
                                       **settings)
        else:
            self.logger.error("No eshc app folder found in $SPLUNK_HOME/etc/apps")
            return
