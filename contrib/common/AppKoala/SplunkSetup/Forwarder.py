import os
from SplunkRole import SplunkRole


class Forwarder(SplunkRole):
    def __init__(self, instance, logger, exceptions):
        SplunkRole.__init__(self, instance, logger, exceptions)
        self.role = "forwarder"

    def setup(self, indexer_receiving_port, indexers):
        try:
            self.logger.info("Setting up forwarder host: %s", self.host)
            # Configure forwarding to all indexers
            for indexer in indexers:
                cmd = "add forward-server " \
                      "{indexer_uri}:{indexer_receiving_port} " \
                      "-auth admin:changeme".format(
                      indexer_uri=indexer.host,
                      indexer_receiving_port=indexer_receiving_port)
                err_msg = "Could not add forward server to {0}:{1}.".format(indexer.host, indexer_receiving_port)
                self.utils.run_cmd(self.instance, cmd, err_msg, self.splunk)
        except Exception, e:
            self.exceptions.append(["Exception found in setup for host:" + self.host, 'Message: ' + e.message])

    def install_apps(self, remote_installer):
        try:
            self.logger.info("Installing apps on forwarder")
            local_install_dir = os.path.join(remote_installer.local_temp_forwarder_dir, 'apps')
            remote_install_dir = os.path.join(self.splunk_home, 'etc')
            remote_installer.push_to_remote_dir(self.instance, local_install_dir, remote_install_dir)
            self.splunk.start()
        except Exception, e:
            self.exceptions.append(["Exception found in install_apps for host:" + self.host, 'Message: ' + e.message])