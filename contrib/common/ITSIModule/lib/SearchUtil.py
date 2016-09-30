'''
SearchUtil class
'''
import logging
from SplunkConn import SplunkConn

class SearchUtil(object):
    logger = logging.getLogger('Datamodel search')

    def __init__(self, module_name, username=None, password=None):
        self.module_name = module_name
        self.splunk_conn = SplunkConn(module_name, username, password)

    def search(self, search_string):
        search_util = self.splunk_conn.get_search_util()

        return search_util.checkQueryCountIsGreaterThanZero(search_string)


