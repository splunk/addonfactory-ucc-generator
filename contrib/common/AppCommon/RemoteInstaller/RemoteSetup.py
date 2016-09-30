import os
import sys
import socket
import tempfile
from AppUtils.AppPandaUtils import AppPandaUtils
from AppUtils.AppKoalaUtils import AppKoalaUtils


class RemoteSetup:
    '''
    This class sets-up apps so that they can be used on Nightlys for running tests directly.
    '''
    def __init__(self, logger, local_dir):
        self.logger = logger
        self.local_dir = local_dir

        self.utils = AppKoalaUtils(self.logger)
        self.panda_utils = AppPandaUtils(self.logger)
        self.logger.info("CLI : Starting to Setup apps installed.")

    def setup_apps_locally(self, app_package_names):
        for app in app_package_names:
            if os.path.basename(app).startswith('splunk_app_installer_es'):
                self.setup_local_es()
            elif os.path.basename(app).startswith('SA-Eventgen'):
                # First determine if target is windows
                self.setup_local_eventgen(sys.platform.startswith("win"))

    def setup_apps_remotely(self, app_package_names, instance):
        for app in app_package_names:
            #Case for ES
            if os.path.basename(app).startswith('splunk_app_installer_es'):
                self.setup_es(instance)
            # Case for ES 4.0.0 and up
            elif os.path.basename(app).startswith('splunk_app_es-'):
                self.setup_4_0_es(instance)
            #Case for ITSI
            elif os.path.basename(app).startswith('itsi') or os.path.basename(app).startswith("splunk_app_grayskull"):
                self.setup_itsi(instance)
            #Case for Stream
            elif os.path.basename(app).startswith('stream'):
                self.setup_stream(instance)

    def setup_es(self, instance):
        self.logger.info("Setting-up ES App.")
        remote_splunk = self.utils.get_splunk_instance(instance)
        remote_splunk.start()
        cmd = "search \"| testessinstall\" -auth admin:changeme"
        err_msg = "Error in testessinstall search call."
        self.utils.run_cmd(instance, cmd, err_msg, remote_splunk)

        # Edit app.conf locally and then copy it to the remote instance
        local_path = os.path.join(self.local_dir, 'etc', "apps", "SplunkEnterpriseSecuritySuite", "local")
        file_name = 'app.conf'
        append_text = '\n[install]\n'
        append_text += 'is_configured=True\n'
        self.panda_utils.update_file(local_path, file_name, append_text)

        remote_path = os.path.join(instance['splunk_home'], 'etc', 'apps', 'SplunkEnterpriseSecuritySuite')
        self.utils.send_file(instance, local_path, remote_path)

    def setup_4_0_es(self, instance):
        self.logger.info("Setting-up ES 4.0.0 and up")

        # Enable some correlation searches
        corr_search_dict = {
            "Access - Brute Force Access Behavior Detected - Rule": 'SA-AccessProtection',
            "Access - Default Account Usage - Rule": 'SA-AccessProtection',
            "Access - Excessive Failed Logins - Rule": 'SA-AccessProtection',
            "Access - Inactive Account Usage - Rule": 'SA-AccessProtection',
            "Access - Insecure Or Cleartext Authentication - Rule": 'SA-AccessProtection',
            "Audit - Anomalous Audit Trail Activity Detected - Rule": 'SA-AuditAndDataProtection',
            "Audit - Expected Host Not Reporting - Rule": 'SA-AuditAndDataProtection',
            "Audit - Personally Identifiable Information Detection - Rule": 'SA-AuditAndDataProtection',
            "Endpoint - Anomalous New Processes - Rule": 'SA-EndpointProtection',
            "Endpoint - Anomalous New Services - Rule": 'SA-EndpointProtection',
            "Endpoint - High Number Of Infected Hosts - Rule": 'DA-ESS-EndpointProtection',
            "Endpoint - High Or Critical Priority Host With Malware - Rule": 'DA-ESS-EndpointProtection',
            "Endpoint - Host Sending Excessive Email - Rule": 'DA-ESS-EndpointProtection',
            "Endpoint - Outbreak Observed - Rule": 'SA-EndpointProtection',
            "Endpoint - Prohibited Process Detection - Rule": 'SA-EndpointProtection',
            "Endpoint - Prohibited Service Detection - Rule": 'SA-EndpointProtection',
            "Identity - Activity from Expired User Identity - Rule": 'SA-IdentityManagement',
            "Network - High Volume of Traffic from High or Critical Host - Rule": 'DA-ESS-NetworkProtection',
            "Network - Substantial Increase in an Event - Rule": 'SA-NetworkProtection',
            "Network - Substantial Increase in Port Activity (By Destination) - Rule": 'SA-NetworkProtection',
            "Network - Unapproved Port Activity Detected - Rule": 'DA-ESS-NetworkProtection',
            "Network - Unroutable Host Activity - Rule": 'DA-ESS-NetworkProtection',
            "Network - Unusual Volume of Network Activity - Rule": 'DA-ESS-NetworkProtection',
            "Threat - Watchlisted Events - Rule": 'SA-ThreatIntelligence',
            "Threat - Threat List Activity - Rule": 'DA-ESS-ThreatIntelligence'
        }
        self.enable_remote_correlation_searches(instance, corr_search_dict)
        self.logger.info('Enabled ES correlation searches')

    def setup_itsi(self, instance):
        self.logger.info("Setting-up ITSI App.")
        file_util = self.utils.get_ssh_file_util(instance)
        if file_util.isdir(os.path.join(instance['splunk_home'], 'etc', 'apps', 'itsi')):
            server_url = self.utils.form_url(instance['host'])
            curl_cmd = "curl -k --user admin:changeme --data"
            restcall1 = "/servicesNS/nobody/itsi/configs/conf-app/install"
            restcall2 = "/servicesNS/nobody/itsi/admin/itsi/general_settings"

            cmd1 = curl_cmd + " is_configured=1 " + server_url + restcall1
            cmd2 = curl_cmd + " IT_do_install=1 " + server_url + restcall2

            os.system(cmd1)
            os.system(cmd2)
        else:
            return

    def setup_stream(self, instance):
        self.logger.info("In Setup Stream")
        file_util = self.utils.get_ssh_file_util(instance)

        if file_util.isdir(os.path.join(instance['splunk_home'], 'etc', 'apps', 'Splunk_TA_stream')):
            file_path = os.path.join(instance['splunk_home'], 'etc', 'apps', 'Splunk_TA_stream', 'local', 'inputs.conf')
            stream_url = "http://" + instance['host'] + ":8000/splunk-es/en-us/custom/splunk_app_stream/"

            append_text = r'\\n[streamfwd://streamfwd]\\n'
            append_text += stream_url + r'\\n'
            append_text += r"disabled=False\\n"

            self.utils.update_file(instance, file_path, append_text)
        else:
            return

    def setup_local_eventgen(self, on_windows=False):
        # Check if remote machine is linux or windows, and then set up appropriately
        self.logger.info("Setting-up SA-Eventgen.")
        if os.path.exists(os.path.join(self.local_dir, 'etc', 'apps', 'SA-Eventgen')):
            if on_windows:
                # On Windows, input.conf.windows has to be copied to input.conf first
                windows_conf = os.path.join(self.local_dir, 'etc', "apps", "SA-Eventgen", "default", "inputs.conf.windows")
                inputs_conf = os.path.join(self.local_dir, 'etc', "apps", "SA-Eventgen", "default", "inputs.conf")
                self.panda_utils.copy_file(windows_conf, inputs_conf)

                append_text = '\n[script://.\\bin\\eventgen.py]\n'
            else:
                append_text = '\n[script://./bin/eventgen.py]\n'
            append_text += 'disabled = false\n'
            file_path = os.path.join(self.local_dir, 'etc', "apps", "SA-Eventgen", "local")
            file_name = 'inputs.conf'
            self.panda_utils.update_file(file_path, file_name, append_text)

        else:
            return
        pass

    def setup_local_es(self):
        self.logger.info("Setting up extreme search directory permissions locally")
        if self.local_dir is None:
            self.logger.error("Error - local temporary apps directory not specified for app setup")
            return

        extreme_bin_dir = os.path.join(self.local_dir, 'etc', 'apps', 'Splunk_SA_ExtremeSearch', 'bin')
        if not os.path.exists(extreme_bin_dir):
            return
        for d in os.listdir(extreme_bin_dir):
            if os.path.isfile(os.path.join(extreme_bin_dir, d)):
                os.chmod(os.path.join(extreme_bin_dir, d), 0644)
            self.logger.info(
                "updated permissions for '%s'", os.path.join(extreme_bin_dir, d))

        extreme_64bit_dir = os.path.join(self.local_dir, 'etc', 'apps', 'Splunk_SA_ExtremeSearch', 'bin', 'Linux', '64bit')
        if not os.path.exists(extreme_64bit_dir):
            return
        for d in os.listdir(extreme_64bit_dir):
            if os.path.isfile(os.path.join(extreme_64bit_dir, d)):
                os.chmod(os.path.join(extreme_64bit_dir, d), 0555)
            self.logger.info(
                "updated permissions for '%s'", os.path.join(extreme_64bit_dir, d))

        self.logger.info("Enabling ES correlation searches locally")
        self.enable_correlation_search("Access - Brute Force Access Behavior Detected - Rule", 'SA-AccessProtection')
        self.enable_correlation_search("Access - Cleartext Password At Rest - Rule", 'SA-AccessProtection')
        self.enable_correlation_search("Access - Completely Inactive Account - Rule", 'SA-AccessProtection')
        self.enable_correlation_search("Access - Default Account Usage - Rule", 'SA-AccessProtection')
        self.enable_correlation_search("Access - Default Accounts At Rest - Rule", 'SA-AccessProtection')
        self.enable_correlation_search("Access - Excessive Failed Logins - Rule", 'SA-AccessProtection')
        self.enable_correlation_search("Access - High or Critical Priority Individual Logging into Infected Machine - Rule", 'DA-ESS-AccessProtection')
        self.enable_correlation_search("Access - Inactive Account Usage - Rule", 'SA-AccessProtection')
        self.enable_correlation_search("Access - Insecure Or Cleartext Authentication - Rule", 'SA-AccessProtection')
        self.enable_correlation_search("Audit - Anomalous Audit Trail Activity Detected - Rule", 'SA-AuditAndDataProtection')
        self.enable_correlation_search("Audit - Expected Host Not Reporting - Rule", 'SA-AuditAndDataProtection')
        self.enable_correlation_search("Audit - Personally Identifiable Information Detection - Rule", 'SA-AuditAndDataProtection')
        self.enable_correlation_search("Endpoint - Anomalous New Listening Port - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Anomalous New Processes - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Anomalous New Services - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - High Number Of Infected Hosts - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - High Number of Hosts Not Updating Malware Signatures - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - High Or Critical Priority Host With Malware - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Host With Excessive Number Of Processes - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Host Sending Excessive Email - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Host With Excessive Number Of Listening Ports - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Host With Excessive Number Of Services - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Host With Multiple Infections - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Anomalous User Account Creation - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Recurring Malware Infection - Rule", 'SA-EndpointProtection')
        self.enable_correlation_search("Endpoint - Old Malware Infection - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Outbreak Observed - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Prohibited Process Detection - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Prohibited Service Detection - Rule", 'DA-ESS-EndpointProtection')
        self.enable_correlation_search("Endpoint - Should Timesync Host Not Syncing - Rule", 'SA-EndpointProtection')
        self.enable_correlation_search("Identity - Activity from Expired User Identity - Rule", 'DA-ESS-IdentityManagement')
        self.enable_correlation_search("Network - High Volume of Traffic from High or Critical Host - Rule", 'DA-ESS-NetworkProtection')
        self.enable_correlation_search("Network - Policy Or Configuration Change - Rule", 'SA-NetworkProtection')
        self.enable_correlation_search("Network - Substantial Increase in an Event - Rule", 'DA-ESS-NetworkProtection')
        self.enable_correlation_search("Network - Substantial Increase in Port Activity (By Destination) - Rule", 'DA-ESS-NetworkProtection')
        self.enable_correlation_search("Network - Unapproved Port Activity Detected - Rule", 'DA-ESS-NetworkProtection')
        self.enable_correlation_search("Network - Unroutable Host Activity - Rule", 'DA-ESS-NetworkProtection')
        self.enable_correlation_search("Network - Unusual Volume of Network Activity - Rule", 'DA-ESS-NetworkProtection')
        self.enable_correlation_search("Network - Vulnerability Scanner Detection (by event) - Rule", 'SA-NetworkProtection')
        self.enable_correlation_search("Network - Vulnerability Scanner Detection (by targets) - Rule", 'SA-NetworkProtection')
        self.enable_correlation_search("Threat - Watchlisted Events - Rule", 'SA-ThreatIntelligence')
        self.enable_correlation_search("Threat - Threat List Activity - Rule", 'SA-ThreatIntelligence')

    def enable_correlation_search(self, stanza, app):
        enable_text = "\ndisabled=false\n"
        app_path = os.path.join(self.local_dir, 'etc', 'apps', app, 'local')
        file = 'savedsearches.conf'
        append_text = "\n[" + stanza + "]" + enable_text
        self.panda_utils.update_file(app_path, file, append_text)

    def enable_remote_correlation_searches(self, instance, corr_dict):
        # We create a file_util object here so that only 1 ssh connection is made
        ssh_file_util = self.utils.get_ssh_file_util(instance)
        for stanza in corr_dict:
            self.logger.info("Enabling correlation search on search head (" + instance['host'] + "): " + stanza)
            app = corr_dict[stanza]
            # Escaping spaces and parentheses in the text is required to work well with helmut
            stanza = stanza.replace(' ', '\ ')
            stanza = stanza.replace('(', '\(')
            stanza = stanza.replace(')', '\)')
            enable_text = r"\\n[" + stanza + r"]\\ndisabled=false\\n"
            remote_conf_path = os.path.join(instance['splunk_home'], 'etc', 'apps', app, 'local', 'savedsearches.conf')
            self.utils.update_file(instance, remote_conf_path, enable_text, ssh_file_util)
