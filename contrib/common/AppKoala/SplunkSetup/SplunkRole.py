import os
from AppUtils.AppKoalaUtils import AppKoalaUtils
from AppUtils.AppPandaUtils import AppPandaUtils
from abc import ABCMeta


class SplunkRole(object):
    __metaclass__ = ABCMeta

    def __init__(self, instance, logger, exceptions):
        self.instance = instance
        self.logger = logger
        self.exceptions = exceptions
        self.host = instance['host']
        self.username = instance['username']
        self.splunk_home = instance['splunk_home']
        self.role = 'default_role'
        
        self.utils = AppKoalaUtils(self.logger)
        self.panda_utils = AppPandaUtils(self.logger)
        self.splunk = self.utils.get_splunk_instance(instance)
        
    def install_sh_apps(self, remote_installer, setup=False, remove_eventgen=False):
        '''
        This function installs apps on the remote SH or conf-deployer, depending on the environment
        * Most apps are extracted locally and copied to the remote machine
        * ES 4.0.0+ must be installed on the remote machine directly
        '''
        try:
            if len(remote_installer.all_apps) != 0:
                self.logger.info("Installing search head apps on remote host: %s", self.host)
                local_temp_dir = remote_installer.local_temp_dir
                local_apps_dir = os.path.join(local_temp_dir, 'etc', 'apps')
                local_deployment_apps_dir = os.path.join(local_temp_dir, 'etc', 'deployment-apps')
                remote_install_dir = os.path.join(self.splunk_home, 'etc')

                remote_installer.push_to_remote_dir(self.instance, local_apps_dir, remote_install_dir)
                remote_installer.push_to_remote_dir(self.instance, local_deployment_apps_dir, remote_install_dir)
                if remove_eventgen:
                    # Remove eventgen from search heads
                    file_util = self.utils.get_ssh_file_util(self.instance)
                    eventgen_dir = os.path.join(self.splunk_home, 'etc', 'apps', 'SA-Eventgen')
                    file_util.force_remove_directory(eventgen_dir)

                splunk_restarted = False
                # If ES 4.0 and up is one of the apps installed, perform special ES install steps
                es_app = [app for app in remote_installer.all_apps if app.find('splunk_app_es-') != -1]
                if es_app:
                    es_app = es_app[0]
                    local_es_path = os.path.join(os.getcwd(), es_app)
                    self.utils.send_file(self.instance, local_es_path, self.splunk_home)
                    remote_es_path = os.path.join(self.splunk_home, es_app)
                    remote_installer.install_es_4_0_and_up(self.instance, remote_es_path)
                    splunk_restarted = True

                if setup:
                    if not splunk_restarted:
                        self.splunk.restart()
                    remote_installer.setup_remote_apps(self.instance)
        except Exception, e:
            self.exceptions.append(["Exception found in install_sh_apps for host:" + self.host, 'Message: ' + e.message])

    def setup_licensing(self, license_paths=None, license_master=None):
        try:
            if license_master:
                self.logger.info("Connecting license slave %s to master", self.host)
                license_master_uri = self.utils.form_url(license_master.host)
                cmd = "edit licenser-localslave " \
                      "-master_uri {license_master_uri} " \
                      "-auth admin:changeme".format(
                    license_master_uri=license_master_uri)
                err_msg = "Failed to set up license slave on instance: {0}".format(self.host)
                self.utils.run_cmd(self.instance, cmd, err_msg, self.splunk)
            elif license_paths:
                self.logger.info("License master not specified, installing license directly on host: %s", self.host)
                for license_path in license_paths:
                    self.utils.add_license(self.instance, license_path)
                self.splunk.restart()
        except Exception, e:
            self.exceptions.append(["Exception found in setup_licensing for host:" + self.host, 'Message: ' + e.message])