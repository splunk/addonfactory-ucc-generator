import os
import sys
import threading
from helmut.splunk_package.package import SPLUNK
from AppUtils.AppKoalaUtils import AppKoalaUtils
from AppUtils.BranchMapping import BranchMapping


class SplunkInstaller:
    
    def __init__(self, arg_parser, csv_parser, logger):
        self.current_threads = []
        self.csv_parser = csv_parser
        self.arg_parser = arg_parser
        self.logger = logger
        self.utils = AppKoalaUtils(self.logger)
        
        self.logger.info("Starting Splunk Installer.")
        self.servers_list = csv_parser.read()
        self.logger.info("servers_list is currently %s", self.servers_list)

        self.check_connections()
        if arg_parser.test_connections:
            # Do not set up Splunk
            print "All ssh connections were successful"
            return

        self.exceptions = []
        self.start_running()

        if self.arg_parser.uninstall_splunk:
            print "Uninstalled Splunk on all instances"
        if self.arg_parser.stop_splunk:
            print "Stopped Splunk on all instances"

    def check_connections(self):
        exceptions = []
        self.logger.info("Testing ssh connection to all instances")
        for instance in self.servers_list:
            thread = threading.Thread(target=self.test_connection, args=(instance, exceptions))
            thread.start()
            self.current_threads.append(thread)
        for th in self.current_threads:
            th.join()
        self.current_threads = []
        if exceptions:
            raise IOError('Could not connect to hosts: {0}'.format(exceptions))

    def start_running(self):
        if self.arg_parser.version:
            branch_mapping = BranchMapping(self.logger)
            mapping = branch_mapping.pseudo_panda_wrapper
            self.logger.info("CLI : The pseudo branch mapping is %s", mapping)
        else:
            mapping = None
        self.logger.info("Starting the multithreaded Splunk Install on all instances")

        for instance in self.servers_list:
            thread = threading.Thread(target=self.start_install, args=(instance, mapping))
            thread.start()
            self.current_threads.append(thread)
        for th in self.current_threads:
            th.join()
        self.current_threads = []
        if self.exceptions:
            raise Exception(self.exceptions)

    def test_connection(self, instance, exceptions):
        if not self.utils.test_ssh_connection(instance):
            exceptions.append("{0}".format(instance['host']))

    def start_install(self, instance, mapping=None):
        try:
            host_splunk = self.utils.get_splunk_instance(instance)

            if self.arg_parser.stop_splunk:
                self.logger.info("Stopping Splunk on host: %s", instance['host'])
                host_splunk.stop()
                return

            if not self.arg_parser.keep_splunk:
                self.logger.info("Uninstalling Splunk on host: %s", instance['host'])
                host_splunk.uninstall()
                if self.arg_parser.uninstall_splunk:
                    return

                self.logger.info("Installing Splunk on host: %s", instance['host'])
                # If local_splunk_installer is specified, install the package from
                # the specified url or local path
                if self.arg_parser.local_splunk_installer:
                    local_splunk_pkg = self.arg_parser.local_splunk_installer
                    self.logger.debug("Installing Splunk via local installer: " + local_splunk_pkg)
                    if local_splunk_pkg.startswith('http'):
                        host_splunk.install_from_url(url=local_splunk_pkg)
                    else:
                        file_util = self.utils.get_ssh_file_util(instance)
                        if not file_util.isdir(instance['splunk_home']):
                            file_util.create_directory(instance['splunk_home'])

                        remote_splunk_path = os.path.join(os.path.dirname(instance['splunk_home']),
                                                          os.path.basename(local_splunk_pkg))
                        file_util.send(local_splunk_pkg, remote_splunk_path)
                        self.logger.debug("Remote splunk path: " + remote_splunk_path)
                        host_splunk.install_from_archive(archive_path=remote_splunk_path)
                        file_util.delete_file(remote_splunk_path)

                # If version is set, use it by getting the respective branch mapping
                # and get the the appropriate build to install.
                elif self.arg_parser.version:
                    build_version = mapping.get(self.arg_parser.version)

                    if build_version is not None:
                        if build_version.startswith("{"):
                            branch_val = build_version.strip('{}')
                            host_splunk.install_nightly(branch=branch_val, build=None, package_type=SPLUNK )
                        else:
                            # Straight splunk version
                            host_splunk.install_release(version=build_version, package_type=SPLUNK)
                    else:
                        #Version is not found so Special Case it.
                        host_splunk.install_release(version=self.arg_parser.version, package_type=SPLUNK)

                # If branch is specified, fetch the latest build of the specified branch
                elif self.arg_parser.branch:
                    host_splunk.install_nightly(branch=self.arg_parser.branch, build=None, package_type=SPLUNK )

                # Default: install latest splunk
                else:
                    host_splunk.install_nightly(package_type=SPLUNK)

                if self.arg_parser.enable_fips:
                    self.utils.enable_fips(instance)

                if self.arg_parser.install_splunk_only:
                    host_splunk.start()
                    return

                self.utils.enable_remote_login(instance)

                if 'search_head' in instance['role'] or 'conf_deployer' in instance['role']:
                    self.utils.set_secret(instance, 'shclustering', self.arg_parser.sh_secret)
                elif 'indexer' in instance['role'] or 'master' in instance['role']:
                    self.utils.set_secret(instance, 'clustering', self.arg_parser.indexer_secret)
                self.logger.info("Completed Splunk install on %s instance", instance)
            else:
                self.logger.info("Keep Splunk is true so skipping Splunk install for %s instance", instance)
            host_splunk.start()
        except Exception, e:
            self.exceptions.append(["Exception found when installing Splunk on host: " + instance['host'], "Message: " + e.message])