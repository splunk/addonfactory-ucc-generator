class TestTemplate():
    TA_UTIL_TEMPLATE = '''
import os
import logging
from helmut_lib.InstallUtil import InstallUtil

class TA%(TACapitalized)sUtil:

    def __init__(self, splunk_home, logger):
        """
        Constructor of the TA-%(TACapitalized)s object.
        """
        self.logger = logger
        self.splunk_home = splunk_home
        self.package_id = "%(TAPackageId)s"

    def get_and_install_ta_%(TALowerUnderscore)s(self):

        self.soln_root = os.environ["SOLN_ROOT"]
        self.logger.info("SOLN_ROOT:" + self.soln_root)

        install_util = InstallUtil("TA/TA-%(TALower)s", self.splunk_home)
        package = install_util.get_solution()
        install_util.install_solution(package)
        return package
'''


    TEST_PRELUDE = """
import os
import sys
import logging
import subprocess as SP

from helmut.splunk.local import LocalSplunk
from helmut.manager.jobs import Jobs
from helmut_lib.SearchUtil import SearchUtil


class Test%(TEST_NAME)s(object):

    fh = logging.FileHandler('butler.log')
    fh.setLevel(logging.DEBUG)
    logger = logging.getLogger('Test %(TA)s')
    logger.addHandler(fh)

    def setup_class(self):
        self.logger.setLevel(logging.DEBUG)
        self.splunk_home = os.environ["SPLUNK_HOME"]
        self.logger.debug("SPLUNK_HOME:" + self.splunk_home)
        self.logger.info("sys.path: " + str(sys.path))
        self.splunk = LocalSplunk(self.splunk_home)
        self.splunk.start()

    def setup_method(self, method):
        self.logger.debug("In setup_method: setting up connector")
        self.conn = self.splunk.create_logged_in_connector()
        self.jobs = Jobs(self.conn)
        self.searchutil = SearchUtil(self.jobs, self.logger)

    # Use btool to check all conf files
    # Need self.splunk_home defined to get splunk command path
    def test_btool_check_conf(self):
        btool_cmd = os.path.join(self.splunk_home, 'bin', 'splunk') + ' cmd btool check'

        self.logger.debug('Execute btool check: ' + btool_cmd)
        (so, se) = SP.Popen(btool_cmd, stdout=SP.PIPE, stderr=SP.PIPE, shell=True).communicate()

        self.logger.debug('btool stdout: ' + so)
        self.logger.debug('btool stderr: ' + se)

        assert len(so) == 0
        assert len(se) == 0

    # Check ERROR in logs under index of _internal
    def test_error_in_log(self):
        self.logger.debug('Execute btool check: _internal log errors')
        
        result = self.searchutil.checkQueryCountIsGreaterThanZero("search index=_internal CASE(ERROR) sourcetype!=splunkd_ui_access AND sourcetype!=splunk_web_access AND sourcetype!=splunk_web_service AND sourcetype!=splunkd_access AND sourcetype!=splunkd| dedup sourcetype| table sourcetype")
        assert result == False
        """

    SOURCETYPE_TEMPLATE = """
    def test_sourcetype_%(SOURCETYPE_FORMATTED)s(self):
        self.logger.debug("Testing %(SOURCETYPE)s.")

        # run search
        result = self.searchutil.checkQueryCountIsGreaterThanZero("search %(SOURCETYPE)s", interval=2, retries=2)
        assert result is True
        """

    EVENTTYPE_TEMPLATE = """
    def test_eventtype_%(EVENTTYPE_FORMATTED)s(self):
        self.logger.debug("Testing eventtype %(EVENTTYPE)s.")

        # run search
        result = self.searchutil.checkQueryCountIsGreaterThanZero("search eventtype=\\"%(EVENTTYPE)s\\"", interval=2, retries=2)
        assert result is True
        """

    EVENTTYPE_TAG_TEMPLATE = """
    def test_%(FIELD)s_%(EVENTTYPE_FORMATTED)s_tag_%(TAG)s(self):
        self.logger.debug("Testing %(FIELD)s=%(EVENTTYPE)s tag=%(TAG)s.")

        # run search
        result = self.searchutil.checkQueryCountIsGreaterThanZero("search %(FIELD)s=\\"%(EVENTTYPE)s\\" tag=\\"%(TAG)s\\"", interval=2, retries=2)
        assert result is True
        """

    PROPS_TEMPLATE = """
    def test_props_sourcetype_%(SOURCETYPE_FORMATTED)s_field_%(FIELD)s(self):
        self.logger.debug("Testing %(SOURCETYPE)s field=%(FIELD)s.")

        # run search
        result = self.searchutil.checkQueryCountIsGreaterThanZero("search %(SOURCETYPE)s %(FIELD)s=*", interval=2, retries=2)
        assert result is True
        """

    FIELD_TEMPLATE = """
    def test_props_field_%(FIELD)s(self):
        self.logger.debug("Testing field=%(FIELD)s.")

        # run search
        result = self.searchutil.checkQueryCountIsGreaterThanZero("search %(FIELD)s=*", interval=2, retries=2)
        assert result is True
        """

    PROPS_REGEX_TEMPLATE = """
    def test_props_sourcetype_%(SOURCETYPE_FORMATTED)s_field_%(FIELD)s_regex(self):
        self.logger.debug("Testing %(SOURCETYPE)s field=%(FIELD)s against regex: %(REGEX)s.")

        # run search
        result = self.searchutil.checkQueryContainsRegex("search %(SOURCETYPE)s %(FIELD)s!=\\"\\" | table %(FIELD)s", '%(FIELD)s', '%(REGEX)s', retries=1)
        assert result is True
        """

    FIELD_REGEX_TEMPLATE = """
    def test_props_field_%(FIELD)s_regex(self):
        self.logger.debug("Testing field=%(FIELD)s against regex: %(REGEX)s.")

        # run search
        result = self.searchutil.checkQueryContainsRegex("search * %(FIELD)s!=\\"\\" | table %(FIELD)s", '%(FIELD)s', '%(REGEX)s', retries=1)
        assert result is True
        """

    TEAR_DOWN_TEMPLATE = """
    def teardown_class(self):
        self.splunk.stop()
        """