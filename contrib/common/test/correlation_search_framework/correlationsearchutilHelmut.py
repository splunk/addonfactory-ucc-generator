import sys
import os
import logging
import time
import splunk.saved
import splunk.search
from helmut_lib.SearchUtil import SearchUtil
from splunk import auth
from helmut.splunk.local import LocalSplunk
from helmut.manager.jobs import Jobs
from helmut_lib.SearchUtil import SearchUtil
from helmut_lib.StanzaUtil import StanzaUtil


# TODO: Add logging instead of print() calls

from splunk.models.saved_search import SavedSearch

from testutil import TestDefaults
from testutil import SearchManager


class CorrelationSearchManager:

    '''Utility class for managing correlation searches.'''

    def __init__(self, correlation_search, namespace, owner, key, logger):

        self._search_name = correlation_search
        self._namespace = namespace
        self._owner = owner
        self._key = key
        self.logger = logger

        self._correlation_search = SavedSearch.get(
            SavedSearch.build_id(correlation_search, namespace, owner), sessionKey=key)
        self.splunk_home = os.environ["SPLUNK_HOME"]
        self.splunk_cli = LocalSplunk(os.environ["SPLUNK_HOME"])
        self.conn = self.splunk_cli.create_logged_in_connector()
        self.stanza_util = StanzaUtil(
            self.splunk_home, self.splunk_cli, self.logger)

    def enable(self):
        '''
        Enable the correlation search.
        This is required before executing the search the first time,
        but may introduce indeterminacy since there will be a
        local/savedsearches.conf entry following the save.
        '''

        self.logger.info("In Enable")
        settings = {
            "disabled": "false"
        }
        self.stanza_util.update_stanza(
            'savedsearches', self._search_name, namespace=self._namespace, **settings)

    def dispatch(self):
        '''
        Dispatch a correlation search job and wait for completion.
        '''

        # TODO: can this be made to issue the search without rewriting the conf file?
        # TODO: handle real-time serches separately.

        # Set timeout for search slightly higher than our timeout so
        # the search is not finalized prematurely.
        kwargs = {'search': self._search_name,
                  'sessionKey': self._key,
                  'namespace': self._namespace,
                  'owner': self._owner,
                  'triggerActions': 1,
                  'ttl': TestDefaults.TIMEOUT + 200}

        return SearchManager.execute(splunk.saved.dispatchSavedSearch, **kwargs)

    def disable(self):
        '''
        Reset correlation search to previous state if necessary.
        '''

        self.logger.info("In Disable")
        settings = {
            "disabled": "true"
        }
        self.stanza_util.update_stanza(
            'savedsearches', self._search_name, namespace=self._namespace, **settings)


class CorrelationSearchTest:

    def __init__(self,
                 correlation_search,
                 namespace,
                 unique_id_field,
                 uuid,
                 owner,
                 key):
        '''Construct a Correlation Search test.

        Parameters:
        @param correlation_search: the correlation search name
        @param namespace: the namespace to execute the search in
        @param unique_id_field: a field in the data that wil be augmented with a unique identifier
        @param uuid: a unique identifier to use when verifying Notable Event creation
        @param owner: the owner to execute the searches as (will be used to obtain Splunk credentials)
        @param key: a Splunk session key
        '''

        self._correlation_search = correlation_search
        self._namespace = namespace
        self._unique_id_field = unique_id_field
        self._uuid = uuid
        self._owner = owner
        self._key = key

        self.logger = logging.getLogger('CorrelationSearchTest')
        self.logger.setLevel(logging.DEBUG)

        self.splunk_home = os.environ["SPLUNK_HOME"]
        self.logger.debug("SPLUNK_HOME:" + self.splunk_home)
        self.splunk_cli = LocalSplunk(self.splunk_home)

        self.conn = self.splunk_cli.create_logged_in_connector()
        self.jobs = Jobs(self.conn)
        self.searchutil = SearchUtil(self.jobs, self.logger)

        self._manager = CorrelationSearchManager(
            self._correlation_search, self._namespace, self._owner, self._key, self.logger)

    def _execute_correlation_search(self):
        '''
        Enable and execute a correlation search.
        Wait for a timeout period
        '''

        print "=== Executing correlation search ==="
        self._manager.enable()

        for i in range(0, 2):
            try:
                job = self._manager.dispatch()
                if job.count >= 1:
                    break
            except:
                self.logger.debug(
                    "In Executing Correlation search '%s' time", i)

        print job.count
        self._manager.disable()

    def _verify_notable_event_creation(self, search=None):
        '''
        Validate that a Notable Event was created based on the results of
        the correlation search just executed.

        '''

        # The self._unique_id_field is the name of a field that has been
        # augmented with a unique identifier. Search for this specifically
        # so that we can ensure that the Notable Event we find is the one
        # we just created. If the notable event search needs to be overridden,
        # use the value passed in as a parameter.
        time.sleep(10)
        if search is None:
            if self._unique_id_field == "_raw":
                search = "search index=notable %s" % (self._uuid)
            else:
                search = "search index=notable %s=%s" % (
                    self._unique_id_field, self._uuid)

        print "=== Validating notable event creation ==="

        kwargs = {'search': search,
                  'hostPath': None,
                  'sessionKey': self._key,
                  'namespace': self._namespace,
                  'owner': self._owner}

        return SearchManager.execute(splunk.search.dispatch, **kwargs)

    def _verify_risk_modifier_creation(self, search=None):
        '''
        Validate that a Notable Event was created based on the results of
        the correlation search just executed.

        '''

        # The self._unique_id_field is the name of a field that has been
        # augmented with a unique identifier. Search for this specifically
        # so that we can ensure that the Notable Event we find is the one
        # we just created. If the notable event search needs to be overridden,
        # use the value passed in as a parameter.

        self.logger.debug(" In _verify_risk_modifier_creation ")
        #| rest /services/saved/searches count=0 | where like(title,"%Rule") AND (isnull('action.risk') OR 'action.risk'!="1") | table title
        if self._correlation_search not in ("Asset - Asset Ownership Unspecified - Rule", "Audit - Failed Threat List Download - Rule", "Audit - Potential Gap in Data - Rule",
                                            "Endpoint - High Number of Hosts Not Updating Malware Signatures - Rule", "Endpoint - High Number Of Infected Hosts - Rule", "Network - Unusual Volume of Network Activity - Rule",
                                            "Threat - Same Error On Many Systems - Rule", "Alert - High Severity Generated Alert - Rule", "Alert - Critical Severity Generated Alert - Rule", "Application State - Processes Cpu Load High - Rule",
                                            "Application State - Critical Services - Rule", "Authentication - Brute Force Access Behavior Detected - Rule", "Authentication - Excessive Failed Logins - Rule", "Authentication - Insecure Or Cleartext Authentication - Rule",
                                            "Authentication - Default Account Usage - Rule"):
            self.logger.debug(" Search should have risk modifier ")
            search = "search index=risk search_name=\"%s\"" % (
                self._correlation_search)
        else:
            self.logger.info("Risk Modifier is not enabled")
            return

        kwargs = {'search': search,
                  'hostPath': None,
                  'sessionKey': self._key,
                  'namespace': self._namespace,
                  'owner': self._owner}

        job = SearchManager.execute(splunk.search.dispatch, **kwargs)
        self.logger.debug(" job.count  '%s'", job.count)
        assert job.count >= 1

    def execute(self, risk_only=False):
        ''' Performs the following steps (appropriate for schedule search only)

        1) Enable a Correlation Search.
        2) Dispatch the Correlation Search
        3) Disable the Correlation Search
        4) Search for Notable Events created by the just-executed Correlation Search
        5) Return the Notable Event search job for any necessary post-processing.
        '''
        for i in range(0, 2):
            try:
                self._execute_correlation_search()
                self._verify_risk_modifier_creation()
                if risk_only == False:
                    job = self._verify_notable_event_creation()
                    if job.count >= 1:
                        return job
            except:
                self.logger.debug(" In Execute '%s' time", i)

        self._verify_risk_modifier_creation()
        if risk_only == False:
            return self._verify_notable_event_creation()

    def executeTestAndValidate(self, field_values, raw_field_values=None):

        results = self.searchutil.getRealtimeNotableSearchResults(
            self._correlation_search, interval=120, retries=5)
        self.logger.debug("Results ===> %s ", results)
        if len(results) == 0:
            return False
        for event in results:
            self.logger.debug("Event ===> %s ", event)
            self.logger.debug("Event keys ===> %s ", event.keys())
            self.logger.debug("Event value ===> %s ", event['_raw'])
            for key, value in field_values.iteritems():
                if str(event[key]) != value:
                    self.logger.debug(
                        "Expected Value for Key %s : %s, Actual Value: %s.", key, value, str(event[key]))
                    return False
            if (raw_field_values is not None):
                for i in raw_field_values:
                    self.logger.debug("Event ===> %s ", i)
                    if i not in str(event['_raw']):
                        self.logger.debug(
                            "Expected raw Field Value  %s is not present in _raw  %s data", i, str(event['_raw']))
                        raw_data = str(event['_raw'])
                        raw_list = raw_data.split(',')
                        expected_data_list = i.split('=')
                        self.logger.debug(
                            "Expected data list %s data", expected_data_list[0])
                        for data in raw_list:
                            self.logger.debug("raw list %s data", data)
                            if expected_data_list[0] in data:
                                actual_data_list = data.split('=')
                                assert int(actual_data_list[1]) > 0
                                return True
                    if i in str(event['_raw']):
                        self.logger.debug(
                            "Expected raw Field Value  %s is  present in _raw  data", i)
                        return True

                return False
        return True

    def validateFieldSubstitution(self, search=None):

        if search is not None:
            search = "search index=notable %s" % (search)
        else:
            return

        print "=== Validating Field Substitution ==="

        kwargs = {'search': search,
                  'hostPath': None,
                  'sessionKey': self._key,
                  'namespace': self._namespace,
                  'owner': self._owner}

        job = SearchManager.execute(splunk.search.dispatch, **kwargs)
        assert job.count >= 1


class SavedSearchTest:

    def __init__(self,
                 saved_search,
                 post_process,
                 namespace,
                 owner,
                 key):
        '''Construct a Saved Search test.

        Parameters:
        @param saved_search: the saved search name
        @param namespace: the namespace to execute the search in
        @param owner: the owner to execute the searches as (will be used to obtain Splunk credentials)
        @param key: a Splunk session key
        '''

        self._saved_search = saved_search
        self._post_process = post_process
        self._namespace = namespace
        self._owner = owner
        self._key = key

        self.logger = logging.getLogger('SavedSearchTest')
        self.logger.setLevel(logging.DEBUG)

        self.splunk_home = os.environ["SPLUNK_HOME"]
        self.logger.debug("SPLUNK_HOME:" + self.splunk_home)
        self.splunk_cli = LocalSplunk(self.splunk_home)

        self.conn = self.splunk_cli.create_logged_in_connector()
        self.jobs = Jobs(self.conn)
        self.searchutil = SearchUtil(self.jobs, self.logger)

    def _execute_saved_search(self):
        '''
        Execute a saved search.
        Wait for a timeout period
        '''

        self.logger.debug(
            " In _execute_saved_search for '%s' ", self._saved_search)
        if(self._post_process != None):
            search = "| savedsearch \"%s\" | %s " % (
                self._saved_search, self._post_process)
        else:
            search = "| savedsearch \"%s\" " % (self._saved_search)

        kwargs = {'search': search,
                  'hostPath': None,
                  'sessionKey': self._key,
                  'namespace': self._namespace,
                  'owner': self._owner,
                  'ttl': TestDefaults.TIMEOUT + 200}
        job = SearchManager.execute(splunk.search.dispatch, **kwargs)

        if ("Summary Gen" in self._saved_search or "Identity - Make Categories - Lookup Gen" in self._saved_search):
            assert job.resultCount >= 1
        else:
            # To exclude messages like 'xsCreateDDContext-W-127: Original context email_volume_1h_noncorp by class americas in
            # container email_volume_1h_noncorp does not exist  so one will be
            # created' from actual errors
            if "error" in job.messages:
                assert "will be created" in job.messages['error'][0]
            assert job.count >= 1
        return job

    def _verify_tracker_file(self, tracker_file_name, query_count, search=None):

        if(search != None):
            search1 = " | inputlookup append=T %s | %s " % (
                tracker_file_name, search)
        else:
            search1 = " | inputlookup append=T %s " % (tracker_file_name)

        print "=== Validating tracker file ==="

        self.remote_key = auth.getSessionKey(
            username='admin', password='changeme', hostPath='')

        if (int(query_count) == 0):
            print "===query_count is 0 ==="
            return self.searchutil.checkQueryCountIsGreaterThanZero(search1,  interval=120, max_time=120)
        else:
            return self.searchutil.checkQueryCount(search1, query_count, interval=120, max_time=120)

    def _verify_name_space(self, name_space_name):

        time.sleep(10)
        search = " | tstats count from  %s " % (name_space_name)

        print "=== Validating name space ==="

        self.remote_key = auth.getSessionKey(
            username='admin', password='changeme', hostPath='')

        return self.searchutil.checkQueryFieldValueIsGreaterThanZero(search, 'count', self._namespace)

    def _verify_context(self, search):

        time.sleep(10)

        print "=== Validating name space ==="

        self.remote_key = auth.getSessionKey(
            username='admin', password='changeme', hostPath='')

        return self.searchutil.checkQueryCountIsGreaterThanZero(query=search,  max_time=120)

    def executeAndVerify(self, tracker_file_name, query_count, search=None):
        ''' Performs the following steps (appropriate for schedule search only)

        1) Enable a Correlation Search.
        2) Dispatch the Correlation Search
        3) Disable the Correlation Search
        4) Search for Notable Events created by the just-executed Correlation Search
        5) Return the Notable Event search job for any necessary post-processing.
        '''
        self._execute_saved_search()

        return self._verify_tracker_file(tracker_file_name, query_count, search)

    def executeAndVerifyTsidxNs(self, name_space_name):
        self._execute_saved_search()

        return self._verify_name_space(name_space_name)

    def executeAndVerifyContextGen(self, search):
        self._execute_saved_search()

        return self._verify_context(search)

    def execute(self):
        return self._execute_saved_search()
