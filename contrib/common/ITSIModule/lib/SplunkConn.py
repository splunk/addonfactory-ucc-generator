'''
Singleton Splunk connection class
'''
import os
import logging
from helmut.splunk.local import LocalSplunk
from helmut_lib.SearchUtil import SearchUtil
from helmut.manager.jobs import Jobs
from helmut.manager.confs import Confs
from ITSIModule.lib.singleton import singleton

@singleton
class SplunkConn(object):

    def __init__(self, module_name, enable_ssl, username=None, password=None):
        self.module_name = module_name
        self.splunk_home = os.environ["SPLUNK_HOME"]
        #logger.debug("SPLUNK_HOME:" + self.splunk_home)
        self.splunk_cli = LocalSplunk(self.splunk_home)
        # turn off the ssl certificate checking
        self.splunk_cli._is_splunkd_ssl = enable_ssl
        if (username == None or password == None):
            username = 'admin'
            password = 'changeme'
        self.username = username
        self.password = password
        self.conn = None

        self.__connect()

    def __connect(self):
        if (self.module_name is not None):
            namespace = self.username + ':' + self.module_name
        else:
            namespace = None

        self.conn = self.splunk_cli.create_logged_in_connector(
            set_as_default=True, password=self.password, sharing='app', owner=self.username, app=self.module_name, namespace=namespace)

    def get_confs(self):
        #confs = Confs(self.conn)
        confs = self.splunk_cli.confs()
        return confs

    def get_search_util(self):
        logger = logging.getLogger('Search')
        jobs = Jobs(self.conn)
        search_util = SearchUtil(jobs, logger)

        return search_util
