'''
BaseSearch class
'''
import logging
import os
from ITSIModule.lib.SearchUtil import SearchUtil

class BaseSearch(object):
    BASE_SEARCH_STR = 'base_search'
    BASE_SEARCH_ID = 'base_search_id'
    BASE_SEARCH_METRIC = 'base_search_metric'

    def __init__(self, search_str, search_id, search_metric):
        '''
        :param search_str: such as: tag=oshost tag=performance tag=memory
        :param search_id:  such as: DA-ITSI-OS_Performance_CPU
        :param search_metric: such as: wait_threads_count
        :return:
        '''
        self.search_str = search_str
        self.search_id = search_id
        self.search_metric = search_metric

    def compare(self, basesearch_object):
        error_msg = ''

        if (basesearch_object.search_str != self.search_str):
            error_msg += "basesearch string: actual value:{0}, expected value:{1}".format(basesearch_object.search_str, self.search_str)

        if (basesearch_object.search_id != self.search_id):
            error_msg += "search_id: actual value:{0}, expected value:{1}".format(basesearch_object.search_id, self.search_id)

        if (basesearch_object.search_metric != self.search_metric):
            error_msg += "search_metric: actual value:{0}, expected value:{1}".format(basesearch_object.search_metric, self.search_metric)

        return error_msg

    def run_test(self, module_name):
        search_string = "search {0} | search {1}=*".format(self.search_str, self.search_metric)
        search_util = SearchUtil(module_name)
        result = search_util.search(search_string)

        msg = ''
        if (result != True):
            msg = "KPI search: {0} doesn't return any results".format(search_string)

        return msg

