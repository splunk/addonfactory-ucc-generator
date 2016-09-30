'''
search class
'''
import logging
import os
from ITSIModule.lib.SearchUtil import SearchUtil

class AdhocSearch(object):
    BASE_SEARCH = 'base_search'
    TITLE = 'title'
    TARGET_FIELD = 'target_field'
    IS_ENTITY_BREAKDOWN = 'is_entity_breakdown'
    ENTITY_ID_FIELDS = 'entity_id_fields'
    ENTITY_ALIAS_FILTERING_FIELDS = 'entity_alias_filtering_fields'

    # target_field is optional, some modules do not have this field
    def __init__(self, base_search, title, is_entity_breakdown, entity_id_fields, entity_alias_filtering_fields, target_field=''):
        self.base_search = base_search
        self.title = title
        self.target_field = target_field
        self.is_entity_breakdown = is_entity_breakdown
        self.entity_id_fields = entity_id_fields
        self.entity_alias_filtering_fields = entity_alias_filtering_fields

    def compare(self, search_object):
        error_msg = ''
        if (search_object.base_search != self.base_search):
            error_msg += "base_search: actual value:{0}, expect value:{1}".format(search_object.base_search, self.base_search)
	
        if (search_object.title != self.title):
            error_msg += "title: actual value:{0}, expect value:{1}".format(search_object.title, self.title)

        if (self.target_field != ''):
            if (search_object.target_field != self.target_field):
                error_msg += "target_field: actual value:{0}, expect value:{1}".format(search_object.target_field, self.target_field)
        
        if (bool(search_object.is_entity_breakdown) != bool(self.is_entity_breakdown)):
            error_msg += "is_entity_breakdown: actual value:{0}, expect value:{1}".format(search_object.is_entity_breakdown, self.is_entity_breakdown)
        else:
            if (search_object.entity_id_fields != self.entity_id_fields):
				error_msg += "entity_id_fields: actual value:{0}, expect value:{1}".format(search_object.entity_id_fields, self.entity_id_fields)

            if (search_object.entity_alias_filtering_fields != self.entity_alias_filtering_fields):
				error_msg += "entity_alias_filtering_fields: actual value:{0}, expect value:{1}".format(search_object.entity_alias_filtering_fields, self.entity_alias_filtering_fields)

        return error_msg

    def run_test(self, module_name):
        if (self.target_field != ''):
            search_string = "search {0} {1}=*".format(self.base_search, self.target_field)
        else:
            search_string = self.base_search
        search_util = SearchUtil(module_name)
        result = search_util.search(search_string)

        msg = ''
        if (result != True):
            msg = "search: {0} doesn't return any result".format(search_string)

        return msg
