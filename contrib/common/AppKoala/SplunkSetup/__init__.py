import os
import sys
import threading
from RemoteInstaller import RemoteAppInstaller
from AppUtils.AppPandaUtils import AppPandaUtils
from AppUtils.AppKoalaUtils import AppKoalaUtils
from ConfDeployer import ConfDeployer
from Forwarder import Forwarder
from Indexer import Indexer
from LicenseMaster import LicenseMaster
from Master import Master
from SearchHead import SearchHead
from SplunkRole import SplunkRole
from DeploymentClient import DeploymentClient


class SplunkSetup:

    def __init__(self, arg_parser, csv_parser, logger):
        self.current_threads = []
        self.final_threads = []
        self.csv_parser = csv_parser
        self.arg_parser = arg_parser
        self.logger = logger
        self.utils = AppKoalaUtils(self.logger)
        self.app_panda_utils = AppPandaUtils(self.logger)

        self.servers_list = csv_parser.read()

        self.exceptions = []
        self.search_heads = []
        self.indexers = []
        self.forwarders = []
        self.license_slaves = []
        self.deployment_clients = []
        self.master = None
        self.conf_deployer = None
        self.license_master = None
        self.deployment_server = None

        self.organize_servers(self.servers_list)

        # Phase 0: Set up licensing
        if self.arg_parser.install_license_paths:
            if self.license_master:
                self.license_master.setup(self.arg_parser.install_license_paths)
                print "Set up license master"
                for slave in self.license_slaves:
                    self.start_thread(slave.setup_licensing, None, self.license_master)
            else:
                for slave in self.license_slaves:
                    self.start_thread(slave.setup_licensing, self.arg_parser.install_license_paths, None)
            self.sync_threads()

        # Phase 1: set up master and search heads first
        if self.master:
            if self.arg_parser.sites:
                self.start_thread(self.master.setup, arg_parser.multisite_rep_factor,
                                  arg_parser.multisite_search_factor, arg_parser.indexer_secret,
                                  arg_parser.sites)
            else:
                self.start_thread(self.master.setup, arg_parser.indexer_rep_factor,
                                  arg_parser.indexer_search_factor, arg_parser.indexer_secret)

        for sh in self.search_heads:
            self.start_thread(sh.setup, arg_parser.sh_rep_port, arg_parser.sh_rep_factor,
                              arg_parser.sh_secret, self.conf_deployer,
                              arg_parser.indexer_receiving_port, self.indexers,
                              arg_parser.kvstore_password, self.conf_deployer is not None)
        if self.conf_deployer:
            self.start_thread(self.conf_deployer.setup, arg_parser.kvstore_password)
        self.sync_threads()
        if self.master or self.search_heads:
            print "Finished setup of: "
            if self.master:
                print '- master'
            if self.search_heads:
                print '- search heads'

        # Phase 2: set up indexers and forwarders, bootstrap SHC captain
        for i in self.indexers:
            self.start_thread(i.setup, arg_parser.indexer_receiving_port,
                              arg_parser.indexer_rep_port, arg_parser.indexer_secret, self.master)
        for f in self.forwarders:
            self.start_thread(f.setup, arg_parser.indexer_receiving_port, self.indexers)
        if len(self.search_heads) > 1 and self.conf_deployer:
            self.start_thread(self.search_heads[0].bootstrap_captain, self.search_heads)
        self.sync_threads()
        if self.indexers or self.forwarders or self.conf_deployer:
            print "Finished setup of: "
            if self.indexers:
                print '- indexers'
            if self.forwarders:
                print '- forwarders'
            if len(self.search_heads) > 1 and self.conf_deployer:
                print '- search head captain'
        
        # Phase 2.1: Set-up Deployment clients and deployment servers if any.
        if self.deployment_server:
            for dc in self.deployment_clients:
                self.start_thread(dc.setup, self.deployment_server)
            self.sync_threads()
            print "Finished set-up of Deployment Server & Client"

        # Phase 3: distribute apps to master and conf deployer and push
        if arg_parser.localappinstaller or self.arg_parser.appname:
            sys.stdout.write("Extracting apps locally...")
            self.remote_installer = RemoteAppInstaller(self.logger, self.arg_parser)
            self.remote_installer.install_locally(self.arg_parser.localappinstaller,
                                                  self.arg_parser.appname,
                                                  self.arg_parser.appversion)
            if self.arg_parser.setup:
                self.remote_installer.setup_apps_locally()
            sys.stdout.write("Done\n")

            install_es = bool([app for app in self.remote_installer.all_apps if app.startswith('splunk_app_es-')])
            if self.conf_deployer:
                # Deploy apps to SHC
                self.start_thread(self.conf_deployer.install_apps, self.remote_installer,
                                  self.search_heads[0], arg_parser.setup, len(self.forwarders) > 0,
                                  arg_parser.do_not_deploy_sh_apps)
            else:
                # No SHC, install apps on each SH
                for sh in self.search_heads:
                    self.start_thread(sh.install_apps, self.remote_installer, arg_parser.setup,
                                      len(self.forwarders) > 0)
            if install_es:
                self.sync_threads()
                self.set_up_es()

            installed_sh = None
            if self.conf_deployer or self.search_heads:
                installed_sh = self.conf_deployer or self.search_heads[0]
            if self.master:
                self.remote_installer.move_ta_apps((self.arg_parser.indexer_apps or []), from_sh=installed_sh, base_dir=RemoteAppInstaller.master_dir)
            elif self.indexers:
                self.remote_installer.move_ta_apps((self.arg_parser.indexer_apps or []), from_sh=installed_sh)
            if self.forwarders:
                self.remote_installer.move_ta_apps((self.arg_parser.forwarder_apps or []), from_sh=installed_sh, for_forwarder=True)

            if self.master:
                # Deploy apps to indexer cluster
                self.start_thread(self.master.install_apps, self.remote_installer)
            elif self.indexers:
                # No master, install apps on each indexer
                for i in self.indexers:
                    self.start_thread(i.install_apps, self.remote_installer)
            if self.forwarders:
                for f in self.forwarders:
                    self.start_thread(f.install_apps, self.remote_installer)
            self.sync_threads()

            print "Distributed apps to: "
            if self.forwarders:
                print '- forwarders'
            if self.master:
                print '- master and pushed to indexers.'
            if self.conf_deployer:
                sys.stdout.write('- conf deployer ')
                if not self.arg_parser.do_not_deploy_sh_apps:
                    sys.stdout.write('and pushed to search heads\n')

        # Phase 4: connect SHs to indexer cluster
        if self.search_heads and (self.master or self.indexers):
            if self.master:
                for sh in self.search_heads:
                    self.start_thread(sh.connect_sh_to_master, self.master,
                                      arg_parser.indexer_secret)
            else:
                for sh in self.search_heads:
                    self.start_thread(sh.connect_sh_to_indexers, self.indexers)
            self.sync_threads()
            print "Connected search heads to indexers"

        if self.conf_deployer and self.arg_parser.resync_shc:
            for sh in self.search_heads:
                cmd = "resync shcluster-replicated-config -auth admin:changeme"
                self.utils.run_cmd(sh.instance, cmd)

        # Cleanup
        if self.final_threads:
            self.logger.info("self.final_threads is: " + str(self.final_threads))
            for thread in self.final_threads:
                thread.join()
        if arg_parser.localappinstaller or self.arg_parser.appname:
            self.remote_installer.delete_local_temp_dirs()

        self.logger.info("AppKoala installation complete")
        print "AppKoala installation complete"

    def set_up_es(self):
        # Special case for installing ES 4.0.0 and up.
        self.logger.info("Deploying TAs for ES 4.0.0 and up")
        # Install TAs on forwarders
        forwarders = [f.instance for f in self.forwarders]
        sh_instance = None
        if self.conf_deployer:
            sh_instance = self.conf_deployer.instance
        elif len(self.search_heads) > 0:
            sh_instance = self.search_heads[0].instance
        ta_threads = self.remote_installer.install_tas_from_sh_to_forwarders(sh_instance, forwarders)
        if ta_threads and isinstance(ta_threads, list):
            self.final_threads.extend(ta_threads)
        # Now generate Splunk_TA_ForIndexers and deploy to indexers/indexer master
        if self.master:
            self.remote_installer.install_ta_for_indexers(sh_instance, [self.master.instance], RemoteAppInstaller.master_dir)
        elif self.indexers:
            self.remote_installer.install_ta_for_indexers(sh_instance, [index.instance for index in self.indexers])
        self.logger.info("Done deploying TAs included in ES 4.0.0 and up")

    def organize_servers(self, servers_list):
        multisite = self.arg_parser.sites is not None
        for server in servers_list:
            if 'search_head' in server['role'].split(' '):
                self.search_heads.append(SearchHead(server, self.logger, multisite, self.exceptions))
            if 'indexer' in server['role'].split(' '):
                self.indexers.append(Indexer(server, self.logger, multisite, self.exceptions))
            if 'forwarder' in server['role'].split(' '):
                self.forwarders.append(Forwarder(server, self.logger, self.exceptions))
            if 'master' in server['role'].split(' '):
                self.master = Master(server, self.logger, multisite, self.exceptions)
            if 'conf_deployer' in server['role'].split(' '):
                self.conf_deployer = ConfDeployer(server, self.logger, self.exceptions)
            if 'deployment_server' in server['role'].split(' '):
                self.deployment_server = server['host']
            if 'deployment_client' in server['role'].split(' '):
                self.deployment_clients.append(DeploymentClient(server, self.logger, self.exceptions))
            if 'license_master' in server['role'].split(' '):
                self.license_master = LicenseMaster(server, self.logger, self.exceptions)
            else:
                self.license_slaves.append(SplunkRole(server, self.logger, self.exceptions))

    def start_thread(self, setup_func, *args):
        thread = threading.Thread(target=setup_func, args=args)
        thread.start()
        self.current_threads.append(thread)

    def sync_threads(self):
        for thread in self.current_threads:
            thread.join()
        self.current_threads = []
        if self.exceptions:
            raise Exception(self.exceptions)