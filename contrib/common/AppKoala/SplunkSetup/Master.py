import os
from SplunkRole import SplunkRole


class Master(SplunkRole):
    def __init__(self, instance, logger, multisite, exceptions):
        SplunkRole.__init__(self, instance, logger, exceptions)
        self.site = instance['site'] if 'site' in instance and multisite else None
        self.role = "master"

    def setup(self, rep_factor, search_factor, secret, available_sites=None):
        try:
            self.logger.info("Setting up master node: %s", self.host)

            if self.site is None:
                # Single-site indexer cluster
                cmd = "edit cluster-config -mode master " \
                      "-replication_factor {index_rep_factor} " \
                      "-search_factor {index_search_factor} " \
                      "-secret {secret} " \
                      "-auth admin:changeme".format(
                      index_rep_factor=rep_factor,
                      index_search_factor=search_factor,
                      secret=secret)
            else:
                # Multi site indexer cluster
                cmd = "edit cluster-config -mode master -multisite true " \
                      "-available_sites {sites} " \
                      "-site {site} " \
                      "-site_replication_factor {rep_factor} " \
                      "-site_search_factor {search_factor} " \
                      "-secret {secret} " \
                      "-auth admin:changeme".format(
                      sites=available_sites,
                      site=self.site,
                      rep_factor=rep_factor,
                      search_factor=search_factor,
                      secret=secret)
            err_msg = 'Error occurred when setting up master node.'
            self.utils.run_cmd(self.instance, cmd, err_msg=err_msg, host_splunk=self.splunk)

            self.splunk.restart()
        except Exception, e:
            self.exceptions.append(["Exception found in setup for host:" + self.host, 'Message: ' + e.message])

    def install_apps(self, remote_installer):
        try:
            self.logger.info("Installing apps on master node")
            local_install_dir = os.path.join(remote_installer.local_temp_indexer_dir, 'master-apps')
            remote_install_dir = os.path.join(self.splunk_home, 'etc')
            remote_installer.push_to_remote_dir(self.instance, local_install_dir, remote_install_dir)

            self.apply_cluster_bundle()
        except Exception, e:
            self.exceptions.append(["Exception found in install_apps for host:" + self.host, 'Message: ' + e.message])

    def apply_cluster_bundle(self):
        try:
            self.logger.info("Pushing apps from master to indexers")
            self.splunk.start()
            cmd = "apply cluster-bundle --answer-yes --skip-validation -auth admin:changeme"
            err_msg = "Failed pushing cluster bundle to indexers."
            self.utils.run_cmd(self.instance, cmd, err_msg, self.splunk)
        except Exception, e:
            self.exceptions.append(["Exception found in apply_cluster_bundle for host:" + self.host, 'Message: ' + e.message])