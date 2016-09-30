import os
from helmut.ssh.connection import SSHConnection
from helmut.splunk_factory.splunkfactory import SplunkFactory


class AppKoalaUtils:
    '''
    A Util class with some helper methods.
    '''
    def __init__(self, logger):
        self.logger = logger

        self.logger.info("CLI : In AppKoalaUtils.")

    def get_splunk_instance(self, instance):
        self.logger.info("Getting splunk instance of host: %s", instance['host'])
        ssh_conn = self.get_ssh_connection(instance)
        host_splunk = SplunkFactory.getSplunk(instance['splunk_home'], connection=ssh_conn)
        return host_splunk

    def get_ssh_file_util(self, instance):
        self.logger.info("Getting SSH file util for host: %s", instance['host'])
        ssh_conn = self.get_ssh_connection(instance)
        return ssh_conn.file_utils

    def get_ssh_connection(self, instance):
        # password is not a required csv field
        try:
            password = instance['password']
            return SSHConnection(instance['host'], user=instance['username'], password=password, domain='')
        except KeyError:
            return SSHConnection(instance['host'], user=instance['username'], domain='')

    def test_ssh_connection(self, instance):
        ssh_conn = self.get_ssh_connection(instance)
        try:
            ssh_conn.connect()
            ssh_conn.disconnect()
            return True
        except:
            return False

    def run_cmd(self, instance, cmd, err_msg="", host_splunk=None):
        self.logger.info("On host = %s, running the splunk command: %s", instance['host'], cmd)
        if host_splunk:
            splunk = host_splunk
        else:
            splunk = self.get_splunk_instance(instance)
        code, stdout, stderr = splunk.execute_without_common_flags(cmd)
        if code != 0:
            self.logger.error(err_msg + " STDOUT: %s, STDERR: %s", stdout, stderr)
        return code, stdout, stderr

    def update_file(self, instance, path, append_text, file_util=None):
        '''
        Append the specified text to a remote file.
        If a file_util object is provided, a new one is not created
        If the path to the file does not currently exist, the required directories are created
        '''
        self.logger.info("Updating file on host:%s at path:%s with text: %s", instance['host'], path, append_text)
        if file_util:
            ssh_file_utils = file_util
        else:
            ssh_file_utils = self.get_ssh_file_util(instance)
        file_directory = os.path.dirname(path)
        if not ssh_file_utils.isdir(file_directory):
            ssh_file_utils.create_directory(file_directory)
        ssh_file_utils.write_file_contents(path, append_text, 'a')

    def send_file(self, instance, from_path, to_path):
        '''
        Send a file from a local from_path to a remote to_path.
        If the from_path is a directory, all contents will be sent to the remote instance
        '''
        self.logger.info("Sending file to host:%s from path:%s to path: %s", instance['host'], from_path, to_path)
        ssh_file_utils = self.get_ssh_file_util(instance)
        ssh_file_utils.send(from_path, to_path)
        ssh_file_utils.ssh_connection.close()

    def copy_remote_directory(self, instance, from_path, to_path):
        '''
        Copy a directory on a remote host. from_path and to_path are both directories on the remote host
        '''
        self.logger.info("On host: %s, copying directory %s to %s", instance['host'], from_path, to_path)
        ssh_file_utils = self.get_ssh_file_util(instance)
        ssh_file_utils.copy_directory(from_path, to_path)
        ssh_file_utils.ssh_connection.close()

    def enable_fips(self, instance):
        self.logger.info("Enabling FIPS on host: %s", instance['host'])
        ssh_file_utils = self.get_ssh_file_util(instance)
        if instance['splunk_home'] is None or not ssh_file_utils.isdir(os.path.join(instance['splunk_home'], "bin")):
            self.logger.error("splunk_home is not specified properly for host: %s", instance['host'])
            return

        conf_path = os.path.join(instance['splunk_home'], 'etc', 'splunk-launch.conf')
        fips_text = r"\\nSPLUNK_FIPS\ =\ 1\\n"
        # fips_text = "test"
        self.update_file(instance, conf_path, fips_text)
        ssh_file_utils.ssh_connection.close()

    def enable_remote_login(self, instance):
        self.logger.info("Enabling remote login on host: %s", instance['host'])
        ssh_file_utils = self.get_ssh_file_util(instance)

        if instance['splunk_home'] is None or not ssh_file_utils.isdir(os.path.join(instance['splunk_home'], "bin")):
            self.logger.error("splunk_home is not specified properly for host: %s", instance['host'])
            return

        conf_path = os.path.join(instance['splunk_home'], 'etc', 'system', 'local', 'server.conf')
        stanza_text = r"\\n[general]\\nallowRemoteLogin\ =\ always\\n"
        self.update_file(instance, conf_path, stanza_text)
        ssh_file_utils.ssh_connection.close()

    def set_secret(self, instance, stanza, secret):
        self.logger.info("Setting secret to %s on host: %s", secret, instance['host'])
        ssh_file_utils = self.get_ssh_file_util(instance)

        if instance['splunk_home'] is None or not ssh_file_utils.isdir(os.path.join(instance['splunk_home'], "bin")):
            self.logger.error("splunk_home is not specified properly for host: %s", instance['host'])
            return

        conf_path = os.path.join(instance['splunk_home'], 'etc', 'system', 'local', 'server.conf')
        stanza_text = r"\\n[" + stanza + r"]\\npass4SymmKey\ =\ " + secret + r"\\n"
        self.update_file(instance, conf_path, stanza_text)
        ssh_file_utils.ssh_connection.close()

    def initialize_kv_store(self, instance, password):
        self.logger.info("Setting KVStore settings on host: %s", instance['host'])
        ssh_file_utils = self.get_ssh_file_util(instance)

        if instance['splunk_home'] is None or not ssh_file_utils.isdir(os.path.join(instance['splunk_home'], "bin")):
            self.logger.error("splunk_home is not specified properly for host: %s", instance['host'])
            return

        conf_path = os.path.join(instance['splunk_home'], 'etc', 'system', 'local', 'server.conf')
        stanza_text = r"\\n[kvstore]\\n"
        stanza_text += r"caCertPath=" + os.path.join(instance['splunk_home'], 'etc', 'auth', 'cacert.pem') + r"\\n"
        stanza_text += r"sslKeysPath=" + os.path.join(instance['splunk_home'], 'etc', 'auth', 'server.pem') + r"\\n"
        stanza_text += r"sslKeysPassword=" + password + r"\\n"
        self.update_file(instance, conf_path, stanza_text)
        ssh_file_utils.ssh_connection.close()

    def add_license(self, instance, local_license_path):
        self.logger.info("Installing license on host: %s", instance['host'])
        host_splunk = self.get_splunk_instance(instance)
        if os.path.isfile(local_license_path) and (local_license_path.endswith('.lic') or local_license_path.endswith('.xml')):
            self.send_file(instance, local_license_path, instance['splunk_home'])
        else:
            self.logger.error("The specified license path is not valid: %s", local_license_path)
            return

        license_file = os.path.basename(local_license_path)
        license_path = os.path.join(instance['splunk_home'], license_file)
        cmd = "add license " + license_path + " -auth admin:changeme"
        err_msg = "Failed to add splunk license on host: {0}".format(instance['host'])
        return self.run_cmd(instance, cmd, err_msg, host_splunk=host_splunk)

    def form_url(self, host, port=8089):
        if port is None:
            return 'https://' + host
        return 'https://' + host + ':' + str(port)

