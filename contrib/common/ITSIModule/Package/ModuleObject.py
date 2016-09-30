'''
ITSI Module object which contains the conf file
'''
import os
import shutil
import sys
from helmut.splunk.local import LocalSplunk
from ITSIModule.lib.SplunkConn import SplunkConn
from ITSIModule.lib.SSLUtil import SSLUtil
from ITSIModule.lib.StanzaUtil import StanzaUtil
from ITSIModule.lib.JUnitLogFileWriter import JUnitLogFileWriter

class ModuleObject(object):
    def __init__(self, name):
        self.name = name
        self.confList = []
        self.kpi_list = []
        self.splunk_home = os.environ["SPLUNK_HOME"]
        self.ssl_util = SSLUtil()

    def add_conf_file(self, conf_obj):
        self.confList.append(conf_obj)

    def add_kpi(self, kpi):
        self.kpi_list.append(kpi)

    def run_test(self, username = None, password = None, log_path = None):

        stanza_util = StanzaUtil(self.name, username, password)  # Create StanzaUtil object
        kpi_object_list = stanza_util.get_kpi_list()

        if (log_path == None):
            log_path = os.path.join(os.getcwd(), 'result.xml')
        junit_writer= JUnitLogFileWriter("ITSI Module {0} test".format(self.name), log_path)

        installed_conf_list = self._get_conf_list_from_module(self.name)

        for conf in self.confList:
            if (conf.name in installed_conf_list):
                conf.run_test(stanza_util, junit_writer)
            else:
                junit_writer.write_test_result("Check if {0}.conf exists".format(conf), "{0} does not exist".format(conf))

        for kpi in self.kpi_list:
            kpi.run_test(self.name, kpi_object_list, junit_writer)
        
        # After all test run, we need to enable ssl or get back original status
        self.ssl_util.enable_ssl()

    def _get_conf_list_from_module(self, module):
        conf_path = os.path.join(self.splunk_home, 'etc/apps', module, 'default')
        conf_files = os.listdir(conf_path)
        conf_names = []
        for conf in conf_files:
            conf_names.append(conf.split('.')[0])
        return conf_names