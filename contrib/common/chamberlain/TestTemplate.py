__author__ = 'Alan'
class TestTemplate():

    TEST_PRELUDE = """
import os
import sys
import logging
import time

from helmut.splunk.local import LocalSplunk
from helmut.manager.jobs import Jobs
from helmut_lib.SearchUtil import SearchUtil

class Test%(TYPE)s%(TEST_NAME)s(object):

    logger = logging.getLogger('Test %(TA)s')


    def setup_class(self):
        self.logger.setLevel(logging.DEBUG)
        self.splunk_home = os.environ["SPLUNK_HOME"]
        self.logger.debug("SPLUNK_HOME:" + self.splunk_home)
        self.logger.info("sys.path: " + str(sys.path))
        self.splunk = LocalSplunk(self.splunk_home)
        self.splunk.restart()
        time.sleep(30)

    def setup_method(self, method):
        self.logger.debug("In setup_method: setting up connector")
        self.conn = self.splunk.create_logged_in_connector()
        self.jobs = Jobs(self.conn)
        self.searchutil = SearchUtil(self.jobs, self.logger)
        """

    CIM_MAPPING_PIVOT_TEMPLATE = """
    def test_dm_mapping_pivot_%(MODEL)s_%(OBJECT)s_%(FIELD)s(self):
        self.logger.debug("Testing DM mapping pivot %(MODEL)s->%(OBJECT)s->%(FIELD)s")
        # run search
        result = self.searchutil.checkQueryCountIsGreaterThanZero("| pivot %(MODEL)s %(OBJECT)s count(%(FIELD)s) as ct", field_name="ct", interval=2, retries=2)
        if not result:
            self.logger.error("Failed search string: | pivot %(MODEL)s %(OBJECT)s count(%(FIELD)s) as ct")
        assert result == True
    """

    CIM_MAPPING_TEMPLATE = """
    def test_dm_mapping_%(MODEL)s_%(OBJECT)s_%(FIELD)s_%(SEARCH_KEY)s_%(SEARCH_VALUE)s(self):
        self.logger.debug("Testing DM mapping %(MODEL)s->%(OBJECT)s->%(FIELD)s")
        # run search
        result = self.searchutil.checkQueryCountIsGreaterThanZero("search %(SEARCH_KEY)s=%(SEARCH_VALUE)s %(CONSTRAINTS)s %(FIELD)s=*", interval=1, retries=1)
        if not result:
            self.logger.error("Failed search string: %(SEARCH_KEY)s=%(SEARCH_VALUE)s %(CONSTRAINTS)s %(FIELD)s=*")
        assert result == True
    """

    PREBUILT_PANEL_SEARCH_TEMPLATE = """
    def test_prebuilt_panel_%(PANEL_NAME)s_no_%(SEARCH_STRING_NO)s(self):
        self.logger.debug("Testing prebuilt panel %(PANEL_NAME)s and search string %(SEARCH_STRING_NO)s")
        # run search
        result = self.searchutil.checkQueryCountIsGreaterThanZero("%(SEARCH_STRING)s", interval=1, retries=1)
        if not result:
            self.logger.error("Failed search string: %(SEARCH_STRING)s")
        assert result == True
    """

    TEARDOWN_TEMPLATE = """
    def teardown_class(self):
        self.splunk.stop()
    """


