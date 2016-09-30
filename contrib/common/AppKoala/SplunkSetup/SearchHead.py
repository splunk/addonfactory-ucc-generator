from SplunkRole import SplunkRole


class SearchHead(SplunkRole):
    def __init__(self, instance, logger, multisite, exceptions):
        SplunkRole.__init__(self, instance, logger, exceptions)
        self.site = instance['site'] if 'site' in instance and multisite else None
        self.role = "search_head"

    def setup(self, rep_port, rep_factor, secret, conf_deployer, indexer_receiving_port, indexers, kvstore_password, is_shc=False):
        try:
            self.logger.info("Setting up search head node: %s", self.host)
            # Forward data to indexers
            for indexer in indexers:
                cmd = "add forward-server " \
                      "{indexer_uri}:{indexer_receiving_port} " \
                      "-auth admin:changeme".format(
                      indexer_uri=indexer.host,
                      indexer_receiving_port=indexer_receiving_port)
                err_msg = "Could not add forward server to {0}:{1}.".format(indexer.host, indexer_receiving_port)
                self.utils.run_cmd(self.instance, cmd, err_msg=err_msg, host_splunk=self.splunk)

            # Set up KVStore
            self.utils.initialize_kv_store(self.instance, kvstore_password)

            if is_shc:
                mgmt_uri = self.utils.form_url(self.host)
                conf_deploy_url = self.utils.form_url(conf_deployer.host)
                cmd = ('init shcluster-config '
                       '-mgmt_uri {mgmt_uri} '
                       '-replication_port {replication_port} '
                       '-replication_factor {replication_factor} '
                       '-secret {secret} '
                       '-conf_deploy_fetch_url {conf_deploy_url} '
                       '-auth admin:changeme').format(
                       mgmt_uri=mgmt_uri,
                       replication_port=rep_port,
                       replication_factor=rep_factor,
                       secret=secret,
                       conf_deploy_url=conf_deploy_url)
                err_msg = "Couldn't initialize shc for host: {0}.".format(self.host)
                self.utils.run_cmd(self.instance, cmd, err_msg, self.splunk)

            self.splunk.restart()
        except Exception, e:
            self.exceptions.append(["Exception found in setup for host:" + self.host, 'Message: ' + e.message])

    def bootstrap_captain(self, search_heads):
        try:
            self.logger.info("Bootstrapping SHC captain on host: %s", self.host)
            servers_list = ""
            for sh in search_heads:
                servers_list = servers_list + self.utils.form_url(sh.host) + ","
            servers_list = servers_list.rstrip(',')
            cmd = 'bootstrap shcluster-captain ' \
                  '-servers_list "{servers_list}" ' \
                  '-auth admin:changeme'.format(
                  servers_list=servers_list)
            err_msg = "Could not bootstrap SHC captain on node: {0}.".format(self.host)
            self.utils.run_cmd(self.instance, cmd, err_msg, self.splunk)
        except Exception, e:
            self.exceptions.append(["Exception found in bootstrap_captain for host:" + self.host, 'Message: ' + e.message])

    def install_apps(self, remote_installer, setup, remove_eventgen):
        self.logger.info("Installing apps on search head")
        self.install_sh_apps(remote_installer, setup=setup, remove_eventgen=remove_eventgen)
        self.splunk.start()

    def connect_sh_to_master(self, master, indexer_secret):
        try:
            self.logger.info("Connecting this search head to indexer master. This host: %s", self.host)
            self.splunk.start()
            # Connect SH to indexer master
            master_uri = self.utils.form_url(master.host)
            site = ('-site ' + self.site + ' ') if self.site else ''
            cmd = ("edit cluster-config -mode searchhead "
                   + site +
                   "-master_uri {master_uri} "
                   "-secret {secret} "
                   "-auth admin:changeme").format(
                   master_uri=master_uri,
                   secret=indexer_secret)
            err_msg = "Failed to connect search head {0} to indexer master.".format(self.host)
            self.utils.run_cmd(self.instance, cmd, err_msg, self.splunk)
            self.splunk.restart()
        except Exception, e:
            self.exceptions.append(["Exception found in connect_sh_to_master for host:" + self.host, 'Message: ' + e.message])

    def connect_sh_to_indexers(self, indexers):
        try:
            self.logger.info("No indexer master, connecting this search head to indexers individually. This host: %s", self.host)
            self.splunk.start()
            # Connect SH to indexers individually
            for i in indexers:
                indexer_uri = self.utils.form_url(i.host)
                cmd = "add search-server " \
                      "-host {indexer_uri} " \
                      "-remoteUsername admin " \
                      "-remotePassword changeme " \
                      "-auth admin:changeme".format(
                      indexer_uri=indexer_uri)
                err_msg = "Failed to connect search head {0} to indexer {1}".format(self.host, i.host)
                self.utils.run_cmd(self.instance, cmd, err_msg, self.splunk)

            self.splunk.restart()
        except Exception, e:
            self.exceptions.append(["Exception found in connect_sh_to_indexers for host:" + self.host, 'Message: ' + e.message])