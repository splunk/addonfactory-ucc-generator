"""
Meta
====
    $Id: //splunk/solutions/common/test/EventgenUtil.py#12 $
    $DateTime: 2011/03/20 23:04:29 $
    $Author: dzakharov $
    $Change: 96913 $
"""


import os
import time
import logging

class EventgenUtil:

    def __init__(self, splunk_home, logger):
        """
        Constructor of the EventgenUtil object.
        """
        self.logger = logger
        self.splunk_home = splunk_home

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
        


