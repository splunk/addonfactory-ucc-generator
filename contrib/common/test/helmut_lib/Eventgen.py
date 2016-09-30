import os
import time
import logging
from InstallUtilNew import InstallUtilNew
from StanzaUtil import StanzaUtil
from helmut.splunk.local import LocalSplunk

class Eventgen:

    def __init__(self, splunk_home, logger):
        """
        Constructor of the EventgenUtil object.
        """
        self.logger = logger
        self.splunk_home = splunk_home
        self.splunk = LocalSplunk(self.splunk_home)
        self.stanza_util = StanzaUtil(self.splunk_home, self.splunk, self.logger)

    def get_and_install(self):
        eventgen_install_util = InstallUtilNew("SA-Eventgen", self.splunk_home, self.logger)
        eventgen_package = eventgen_install_util.get_solution()
        eventgen_install_util.install_solution(eventgen_package)

    def get_and_install_eventgen2(self):
        self.logger.info("Install SA-Eventgen2")
        eventgen_install_util = InstallUtilNew("SA-Eventgen2", self.splunk_home, self.logger)
        eventgen_package = eventgen_install_util.get_solution()
        eventgen_install_util.install_solution(eventgen_package)

    def enable(self, ta_package_id=''):
        self.splunk.create_logged_in_connector(set_as_default=True, sharing='app', owner='admin', app='SA-Eventgen', namespace='admin:SA-Eventgen')
        stanza = self.splunk.confs()['inputs']['script://./bin/eventgen.py']
        stanza['disabled'] = False

        if ta_package_id:
            settings = {"disabled" : "False"}
            self.stanza_util.update_stanza('eventgen', "global", namespace=ta_package_id, **settings)

    def disable(self, ta_package_id=''):
        self.splunk.create_logged_in_connector(set_as_default=True, sharing='app', owner='admin', app='SA-Eventgen', namespace='admin:SA-Eventgen')
        stanza = self.splunk.confs()['inputs']['script://./bin/eventgen.py']
        stanza['disabled'] = True

        if ta_package_id:
            settings = {"disabled" : "True"}
            self.stanza_util.update_stanza('eventgen', "global", namespace=ta_package_id, **settings)

    def enable_modularinput(self):
        self.splunk.create_logged_in_connector(set_as_default=True, sharing='app', owner='admin', app='SA-Eventgen', namespace='admin:SA-Eventgen')
        stanza = self.splunk.confs()['inputs']['eventgen_modinput://main']
        stanza['disabled'] = False

    def disable_modularinput(self):
        self.splunk.create_logged_in_connector(set_as_default=True, sharing='app', owner='admin', app='SA-Eventgen', namespace='admin:SA-Eventgen')
        stanza = self.splunk.confs()['inputs']['eventgen_modinput://main']
        stanza['disabled'] = True

    def set_sourcetype(self, sourcetype):
        self.splunk.create_logged_in_connector(set_as_default=True, sharing='app', owner='admin', app='SA-Eventgen', namespace='admin:SA-Eventgen')
        stanza = self.splunk.confs()['inputs']['script://./bin/eventgen.py']
        stanza['sourcetype'] = sourcetype

    def run_eventgen(self):

        def wait_until_empty(dir, sleep_time):
            time.sleep(sleep_time)
            while True:
                listdir = os.listdir(dir)
                if len(listdir) == 0:
                    break
                else:
                    self.logger.debug("Spool directory is not empty.")
                    for l in listdir:
                        self.logger.debug("It contains: " + l)
                        time.sleep(sleep_time)

        eventgen_cmd = 'echo debug | ' + os.path.join(self.splunk_home, 'bin', 'splunk') + ' cmd python ' + os.path.join(self.splunk_home, 'etc', 'apps', 'SA-Eventgen', 'bin', 'eventgen.py')
        self.logger.debug("Executing: " + eventgen_cmd)
        os.system(eventgen_cmd)
        #determine if var/spool/splunk dir is empty
        spool_dir = os.path.join(self.splunk_home, 'var', 'spool', 'splunk')
        wait_until_empty(spool_dir, 3)



