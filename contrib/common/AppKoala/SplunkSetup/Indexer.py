import os
from SplunkRole import SplunkRole


class Indexer(SplunkRole):
    def __init__(self, instance, logger, multisite, exceptions):
        SplunkRole.__init__(self, instance, logger, exceptions)
        self.site = instance['site'] if 'site' in instance and multisite else None
        self.role = "indexer"

    def setup(self, receiving_port, rep_port, secret, master=None):
        try:
            self.logger.info("Setting up indexer node: %s", self.host)
            # enable listening
            cmd = "enable listen " + receiving_port + " -auth admin:changeme"
            err_msg = "Couldn't enable listening for host: {0} on port: {1}.".format(self.host, receiving_port)
            self.utils.run_cmd(self.instance, cmd, err_msg, self.splunk)

            # connect to master node
            if master:
                master_uri = self.utils.form_url(master.host)
                multisite = ("-site " + self.site) if self.site else ""
                cmd = ('edit cluster-config -mode slave '
                       '-master_uri {master_uri} '
                       '-replication_port {replication_port} '
                       '-secret {secret} '
                       + multisite +
                       ' -auth admin:changeme').format(
                    master_uri=master_uri,
                    replication_port=rep_port,
                    secret=secret)
                err_msg = "Failed cluster configuration on indexer: {0}.".format(self.host)
                self.utils.run_cmd(self.instance, cmd, err_msg=err_msg, host_splunk=self.splunk)
            self.splunk.restart()
        except Exception, e:
            self.exceptions.append(["Exception found in setup for host:" + self.host, 'Message: ' + e.message])

    def install_apps(self, remote_installer):
        try:
            self.logger.info("Installing apps on indexer node: %s", self.host)
            local_install_dir = os.path.join(remote_installer.local_temp_indexer_dir, 'apps')
            remote_install_dir = os.path.join(self.splunk_home, 'etc')
            remote_installer.push_to_remote_dir(self.instance, local_install_dir, remote_install_dir)

            self.splunk.start()
        except Exception, e:
            self.exceptions.append(["Exception found in install_apps for host:" + self.host, 'Message: ' + e.message])
