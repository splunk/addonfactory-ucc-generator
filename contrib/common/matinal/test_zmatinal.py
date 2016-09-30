import os
import sys
import logging

from helmut.splunk.local import LocalSplunk
from helmut.manager.jobs import Jobs
from helmut_lib.SearchUtil import SearchUtil


class TestZMatinal(object):

    logger = logging.getLogger('Run SPL Matinal Checks')

    def setup_class(self):
        self.logger.setLevel(logging.DEBUG)
        self.splunk_home = os.environ["SPLUNK_HOME"]
        self.logger.debug("SPLUNK_HOME:" + self.splunk_home)
        self.logger.info("sys.path: " + str(sys.path))
        self.splunk = LocalSplunk(self.splunk_home)
        self.splunk.restart()

    def setup_method(self, method):
        self.logger.debug("In setup_method: setting up connector")
        self.conn = self.splunk.create_logged_in_connector()
        self.jobs = Jobs(self.conn)
        self.searchutil = SearchUtil(self.jobs, self.logger)

    def test_dateparserverbose_warn(self):
        self.logger.debug("Testing warning message for date parser")
        # run search
        result = self.searchutil.checkQueryCountIsGreaterThanZero("search index=_internal log_level=warn component=dateparserverbose NOT \"Unable to save search history\" | outputcsv append=true bamboo.csv", interval=1, retries=1)
        assert result is False

    def teardown_class(self):
        self.splunk.stop()
