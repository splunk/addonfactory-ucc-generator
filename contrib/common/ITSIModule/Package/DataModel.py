'''
datamodel class
'''
import logging
import os
from ITSIModule.lib.SearchUtil import SearchUtil

class DataModel(object):
    DATAMODEL = 'datamodel'
    FIELD = 'field'
    OBJECT = 'object'
    OWNER_FIELD = 'owner_field'

    def __init__(self, datamodel, field, object_name, owner_field):
        self.datamodel = datamodel
        self.field = field
        self.object_name = object_name
        self.owner_field = owner_field

    def compare(self, datamodel_object):
        error_msg = ''

        if (datamodel_object.datamodel != self.datamodel):
            error_msg += "datamodel: actual value:{0}, expected value:{1}".format(datamodel_object.datamodel, self.datamodel)

        if (datamodel_object.field != self.field):
            error_msg += "field: actual value:{0}, expected value:{1}".format(datamodel_object.field, self.field)

        if (datamodel_object.object_name != self.object_name):
            error_msg += "object: actual value:{0}, expected value:{1}".format(datamodel_object.object_name, self.object_name)

        if (datamodel_object.owner_field != self.owner_field):
            error_msg += "owner_field: actual value:{0}, expected value:{1}".format(datamodel_object.owner_field, self.owner_field)

        return error_msg

    def run_test(self, module_name):
        search_string = "| datamodel {0} {1} search | search {2}=*".format(self.datamodel, self.object_name, self.owner_field)
        search_util = SearchUtil(module_name)
        result = search_util.search(search_string)

        msg = ''
        if (result != True):
            msg = "datamodel search: {0} doesn't return any result".format(search_string)

        return msg
