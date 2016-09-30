import os
import shutil
import tempfile
import threading
from AppUtils.AppPandaUtils import AppPandaUtils
from AppUtils.AppKoalaUtils import AppKoalaUtils
from AppInstaller import AppInstaller
from RemoteSetup import RemoteSetup


class RemoteAppInstaller:
    '''
    A class that installs the specified apps to the specified host
    '''

    master_dir = 'master-apps'
    default_dir = 'apps'

    def __init__(self, logger, arg_parser):
        self.logger = logger
        self.local_temp_dir = tempfile.mkdtemp()
        self.local_temp_indexer_dir = tempfile.mkdtemp()
        self.local_temp_forwarder_dir = tempfile.mkdtemp()
        self.ta_to_forwarders_dir = tempfile.mkdtemp()
        self.all_apps = []
        self.downloaded_apps = []
        self.utils = AppKoalaUtils(self.logger)
        self.panda_utils = AppPandaUtils(self.logger)
        self.arg_parser = arg_parser
        self.logger.info("In RemoteAppInstaller")

    def install_locally(self, local_apps, fetch_apps, app_versions):
        self.logger.info("Installing apps locally at the temporary directory: %s", self.local_temp_dir)
        apps_dir = os.path.join(self.local_temp_dir, 'etc', 'apps')
        deployment_apps_dir = os.path.join(self.local_temp_dir, 'etc', 'deployment-apps')
        os.makedirs(apps_dir)
        os.makedirs(deployment_apps_dir)
        app_installs = AppInstaller(self.logger, self.arg_parser, self.local_temp_dir, local_apps, fetch_apps, app_versions, setup=False, no_splunk=True)
        self.all_apps = app_installs.all_apps
        self.downloaded_apps = app_installs.download_apps_list
        self.logger.info("Done installing locally. all_apps is: %s", self.all_apps)

    def move_ta_apps(self, non_ta_apps, from_sh=None, base_dir=default_dir, for_forwarder=False):
        if for_forwarder:
            temp_tas_dir = os.path.join(self.local_temp_forwarder_dir, base_dir)
            self.logger.info("In move_ta_apps() for forwarders")
        else:
            temp_tas_dir = os.path.join(self.local_temp_indexer_dir, base_dir)
            self.logger.info("In move_ta_apps() for the master/indexers. base_dir: %s", base_dir)
        os.makedirs(temp_tas_dir)
        local_apps_dir = os.path.join(self.local_temp_dir, 'etc', 'apps')

        if from_sh:
            remote_sh = self.utils.get_ssh_file_util(from_sh.instance)
            sh_apps_string = remote_sh.get_list_of_files_in_dir(os.path.join(from_sh.splunk_home, 'etc', 'apps'))
            sh_apps = sh_apps_string.replace('\'', '').replace(' ', '')[1:-1].split(',')
            for app in sh_apps:
                if app in non_ta_apps and app not in os.listdir(local_apps_dir):
                    remote_sh.retrieve(os.path.join(from_sh.splunk_home, 'etc', 'apps', app),
                                       os.path.join(local_apps_dir, app))
                    self.logger.info("Retrieved app from search head to install on indexer/forwarder: %s ", app)
            remote_sh.ssh_connection.close()

        for dir in os.listdir(local_apps_dir):
            if dir.startswith('TA-') or dir.startswith('Splunk_TA_') or dir in non_ta_apps or (for_forwarder and dir.startswith('SA-Eventgen')):
                local_ta_dir = os.path.join(local_apps_dir, dir)
                if not os.path.isdir(local_ta_dir):
                    continue
                shutil.copytree(local_ta_dir, os.path.join(temp_tas_dir, dir))

        # Special case for SA-ForIndexers (For ES 3.3.x and lower)
        sa_for_indexers = os.path.join(self.local_temp_dir, 'etc', 'deployment-apps', 'SA-ForIndexers')
        if os.path.isdir(sa_for_indexers):
            if base_dir == self.master_dir:
                # If there is an indexer master,
                # SA-ForIndexers/indexes.conf goes in etc/master-apps/_cluster/local
                indexes_conf_file = os.path.join(sa_for_indexers, 'default', 'indexes.conf')
                os.makedirs(os.path.join(temp_tas_dir, '_cluster', 'local'))
                shutil.copyfile(indexes_conf_file, os.path.join(temp_tas_dir, '_cluster', 'local', 'indexes.conf'))
            elif base_dir == self.default_dir:
                # Install SA-ForIndexers in etc/apps
                shutil.copytree(sa_for_indexers, os.path.join(temp_tas_dir, 'SA-ForIndexers'))

    def push_to_remote_dir(self, instance, local_dir, remote_dir):
        self.logger.info("Pushing apps from local dir: %s to remote dir: %s", local_dir, remote_dir)
        host_splunk = self.utils.get_splunk_instance(instance)
        host_splunk.stop()
        self.utils.send_file(instance, local_dir, remote_dir)

    def setup_apps_locally(self):
        self.logger.info("Setting up apps locally")
        remote_setup = RemoteSetup(self.logger, self.local_temp_dir)
        remote_setup.setup_apps_locally(self.all_apps)

    def setup_remote_apps(self, instance):
        self.logger.info("Setting up apps remotely on host: %s", instance['host'])
        remote_setup = RemoteSetup(self.logger, self.local_temp_dir)
        remote_setup.setup_apps_remotely(self.all_apps, instance)
        self.utils.get_splunk_instance(instance).restart()

    def install_es_4_0_and_up(self, instance, remote_es_path):
        remote_splunk = self.utils.get_splunk_instance(instance)
        remote_splunk.start()

        self.panda_utils.install_app_package(remote_es_path, instance['host'])
        self.logger.info("ES version is 4.0+, performing special setup on: %s", instance['host'])
        cmd = "search \"|testessinstall\" -auth admin:changeme"
        err_msg = "Error in testessinstall search call."
        self.utils.run_cmd(instance, cmd, err_msg, remote_splunk)

        # Enable SA-UEBA app
        temp_dir = tempfile.mkdtemp()
        conf_dir = os.path.join(temp_dir, 'local')
        os.mkdir(conf_dir)
        enable_text = "\n[install]\nstate=enabled\n"
        self.panda_utils.update_file(conf_dir, 'app.conf', enable_text)
        ueba_path = os.path.join(instance['splunk_home'], 'etc', 'apps', 'SA-UEBA')
        self.utils.send_file(instance, conf_dir, ueba_path)
        self.logger.info("Enabled UEBA app")

        remote_splunk.restart()

    def install_ta_for_indexers(self, search_head, indexers, apps_dir=default_dir):
        '''
        Sends the make_ta_for_indexers script to the remote instance and executes it, generating
        Splunk_TA_ForIndexers.spl. Then fetches spl and deploys it to the indexers as needed
        '''
        self.logger.info("Generating TA_ForIndexers and installing on indexer tier")
        generate_ta_script = "generate_ta_forindexers.py"
        if not indexers or not search_head:
            return
        soln_root = os.environ.get('SOLN_ROOT', None)
        if soln_root is None:
            if generate_ta_script in os.listdir('.'):
                ta_script_path = os.path.join(os.getcwd(), generate_ta_script)
            else:
                self.logger.info("Error: Could not push generate_ta_forindexers.py to search head since SOLN_ROOT is not found in the environment.")
                print "SOLN_ROOT is not set in environment, skipping installing Splunk_TA_ForIndexers on indexer tier"
                return
        else:
            ta_script_path = os.path.join(soln_root, 'common', 'AppKoala', generate_ta_script)

        splunk_instance = self.utils.get_splunk_instance(search_head)
        sh_file_util = splunk_instance.fileutils
        sh_file_util.send(ta_script_path, search_head['splunk_home'])
        splunk_instance.start()

        cmd = 'cmd python ' + os.path.join(search_head['splunk_home'], generate_ta_script)
        err_msg = "Received error when generating TA_ForIndexers on search head"
        self.utils.run_cmd(search_head, cmd, err_msg, host_splunk=splunk_instance)

        ta_forindexers_dir = os.path.join(search_head['splunk_home'], 'etc', 'apps', 'SA-Utils', 'local', 'data', 'appmaker')
        sh_apps_string = sh_file_util.get_list_of_files_in_dir(ta_forindexers_dir)
        self.logger.info("Files in search head's local/data/appmaker: " + sh_apps_string)
        forindexers_app = sh_apps_string.replace('\'', '').replace(' ', '')[1:-1].split(',')[-1]
        self.logger.info("TA_ForIndexers app spl: " + forindexers_app)
        sh_file_util.retrieve(os.path.join(ta_forindexers_dir, forindexers_app), os.getcwd())
        temp_dir = self.panda_utils.extract_app_package(os.path.join(os.getcwd(), forindexers_app))
        os.remove(forindexers_app)
        sh_file_util.ssh_connection.close()

        threads = []
        for indexer in indexers:
            remote_apps_dir = os.path.join(indexer['splunk_home'], 'etc', apps_dir)
            local_forindexer = os.path.join(temp_dir, os.listdir(temp_dir)[0])
            thread = threading.Thread(target=self.send_tas, args=(indexer, local_forindexer, remote_apps_dir, False))
            thread.start()
            threads.append(thread)
        for thread in threads:
            thread.join()

    def install_tas_from_sh_to_forwarders(self, search_head, forwarders):
        '''
        First download TAs from the search head/conf deployer instance, then
        distribute them to the specified remote instances
        '''
        # If ES was not installed, skip this function
        es_spl_prefix = 'splunk_app_es-'
        if len([app for app in self.all_apps if app.startswith(es_spl_prefix)]) == 0:
            return
        if search_head is None or forwarders is None or len(forwarders) == 0:
            return

        self.logger.info("Installing TAs from search head to forwarders")
        apps_ta_dir = os.path.join(self.ta_to_forwarders_dir, 'apps')
        os.mkdir(apps_ta_dir)

        download_tas_path = os.path.join(search_head['splunk_home'], 'etc', 'apps')
        sh_file_util = self.utils.get_ssh_file_util(search_head)
        sh_apps_string = sh_file_util.get_list_of_files_in_dir(download_tas_path)
        sh_apps = sh_apps_string.replace('\'', '').replace(' ', '')[1:-1].split(',')
        for app in sh_apps:
            if app.startswith("Splunk_TA_") or app.startswith("TA-"):
                sh_file_util.retrieve(os.path.join(download_tas_path, app), apps_ta_dir)
        self.logger.info("Downloaded the following apps: " + str(os.listdir(apps_ta_dir)))
        sh_file_util.ssh_connection.close()

        threads = []
        for forwarder in forwarders:
            forwarder_app_path = os.path.join(forwarder['splunk_home'], 'etc')
            thread = threading.Thread(target=self.send_tas, args=(forwarder, apps_ta_dir, forwarder_app_path))
            thread.start()
            threads.append(thread)

        # If splunk_app_es was downloaded, remove it
        for app in self.downloaded_apps:
            if app.startswith('splunk_app_es-'):
                os.remove(app)

        return threads

    def send_tas(self, remote_instance, local_ta_dir, remote_dir, restart=True):
        self.logger.info("Sending TAs to remote instance: " + remote_instance['host'])
        self.utils.send_file(remote_instance, local_ta_dir, remote_dir)
        if restart:
            self.utils.get_splunk_instance(remote_instance).restart()
        self.logger.info("Completed sending TAs to forwarder: " + remote_instance['host'])

    def delete_local_temp_dirs(self):
        self.panda_utils.remove_directory(self.local_temp_dir)
        self.panda_utils.remove_directory(self.local_temp_indexer_dir)
        self.panda_utils.remove_directory(self.local_temp_forwarder_dir)
        self.panda_utils.remove_directory(self.ta_to_forwarders_dir)
        self.local_temp_dir = None
        self.local_temp_indexer_dir = None
        self.local_temp_forwarder_dir = None
        self.ta_to_forwarders_dir = None
