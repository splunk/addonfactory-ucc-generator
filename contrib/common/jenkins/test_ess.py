"""
Meta
====
    $Id: //splunk/solutions/ess/mainline/test/smoke/test_ess.py#10 $
    $DateTime: 2012/01/15 12:15:31 $
    $Author: dhazekamp $
    $Change: 116520 $
"""

import py
import os
import time
import logging
import marshal
from ESSUtil import ESSUtil
from SplunkCLI import SplunkCLI
from SearchTestUtil import SearchTestUtil
from splunk import auth

class TestESS(object):

    logger = logging.getLogger('TestESS')
    
    def setup_class(self):
        self.logger.setLevel(logging.DEBUG)
        self.splunk_home = os.environ["SPLUNK_HOME"]
        self.logger.debug("SPLUNK_HOME:" + self.splunk_home)
        self.splunk_cli = SplunkCLI(self.splunk_home)
        essutil = ESSUtil(self.splunk_home, self.logger)
        #self.package = essutil.get_and_install_ess()

    def setup_method(self, method):
        self.remote_key = auth.getSessionKey(username='admin', password='changeme', hostPath='')
                
    def test_soln1512(self):
        # run simple search
        result = self.checkQueryCount(self.remote_key, "search index=_internal source=*scheduler.log skipped", 0, '')
        #result = self.checkQueryCount(self.remote_key, "search index=_internal | head 1 | source=*scheduler.logprivileged", 1, '')
        assert result == True
        
    def teardown_class(self):
        self.splunk_cli.stop()
        #os.remove(self.package)
        
    def checkQueryCount(self, key, query, targetCount, hostPath, interval=15, retries = 4):
        tryNum = 0
        search_util = SearchTestUtil()
        while tryNum <= retries:
            result = search_util.checkQueryCounts(query=query, expectedEventCnt=targetCount, key=key, namespace='SplunkEnterpriseSecuritySuite', hostPath=hostPath)
            if result['match']:
                self.logger.debug("Actual count is as expected, it is:%d", result['actualCount'])
                return True
            else:
                self.logger.debug("Actual count is not as expected, it is: %d. Expected: %d.", result['actualCount'], targetCount)
                tryNum += 1
                time.sleep(interval)
        return False
        
