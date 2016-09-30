'''
savedsearches.conf
'''
from ConfBase import ConfBase
from ITSIModule.lib.SearchUtil import SearchUtil


class SavedSearchesConf(ConfBase):

    def __init__(self, name):
        self.stanza_list = []
        self.name = name
        self.search_util = None

    def run_test(self, stanza_util, junit_writer):
        #run saved searches test, this test must be run before parent run_conf_test, because, junit log will be closed after that test run
        self._test_saved_searches(stanza_util, junit_writer)

        # run test against real conf file installed
        super(SavedSearchesConf, self).run_conf_test(stanza_util, junit_writer)

    def _test_saved_searches(self, stanza_util, junit_writer):
        # For all saved searches in savedsearches.conf
        if (self.test != 'true'):
            return

        for stanza in self.stanza_list:
            for item in stanza.items:
                if (item.key == "search" and item.search == "true"):
                    if (self.search_util == None):
                        self.search_util = SearchUtil(item.module_name)
                    self._run_saved_search_test(item, stanza, stanza_util, junit_writer)

    def _run_saved_search_test(self, item, stanza, stanza_util, junit_writer):
        # Read the saved search string from deployed savedsearches.conf instead of from xml file
        # because for a long search string, we might not want to compare the string with deployed search, then xml file
        # search string can be "", at this point, we only run the saved search test.
        try:
            saved_search = stanza_util.get_value_by_key(self.name, stanza.name, item.key)
        except Exception as e:
            # if there is an exception on reading the value, then, we need to fail the test
            error_msg = "Run saved search test, failed to get saved search from {0}".format(stanza.stanza_name)
            junit_writer.write_test_result(error_msg, "Exception {0}".format(e.message))
            return

        test_case = "Test saved search: {0}".format(saved_search)
        if (saved_search.startswith('|') == False):
            saved_search = "search " + saved_search

        result = self.search_util.search(saved_search)
        msg = ''
        if (result != True):
            msg = "Saved search: {0} doesn't return any result".format(item.value)

        junit_writer.write_test_result(test_case, msg)

