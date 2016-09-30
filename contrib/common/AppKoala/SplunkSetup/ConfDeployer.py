import os
import time
from SplunkRole import SplunkRole


class ConfDeployer(SplunkRole):
    def __init__(self, instance, logger, exceptions):
        SplunkRole.__init__(self, instance, logger, exceptions)
        self.role = "conf_deployer"

    def setup(self, kvstore_password):
        self.logger.info("Setting up configuration deployer")
        self.utils.initialize_kv_store(self.instance, kvstore_password)
        self.splunk.restart()

    def install_apps(self, remote_installer, deploy_target=None, setup=False, remove_eventgen=False, do_not_deploy=False):
        try:
            self.logger.info("Installing apps on conf-deployer")
            self.install_sh_apps(remote_installer, setup=setup, remove_eventgen=remove_eventgen)

            if do_not_deploy:
                self.logger.info("Do_not_deploy_sh_apps is selected, will not apply bundle to search heads")
            else:
                # Moving installed apps from etc/apps to etc/shcluster/apps
                remote_apps_dir = os.path.join(self.splunk_home, 'etc', 'apps')
                remote_shcluster_apps_dir = os.path.join(self.splunk_home, 'etc', 'shcluster', 'apps')
                self.utils.copy_remote_directory(self.instance, remote_apps_dir, remote_shcluster_apps_dir)

                self.splunk.start()

                self.logger.info("Pushing apps from conf_deployer to search heads")
                sh_url = self.utils.form_url(deploy_target.host)
                cmd = "apply shcluster-bundle " \
                      "-target {search_head} " \
                      "-auth admin:changeme " \
                      "--answer-yes".format(
                      search_head=sh_url)
                err_msg = "Error applying shcluster bundle to search heads."
                self.utils.run_cmd(self.instance, cmd, err_msg=err_msg, host_splunk=self.splunk)
        except Exception, e:
            self.exceptions.append(["Exception found in install_apps for host:" + self.host, 'Message: ' + e.message])