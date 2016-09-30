__author__ = 'Alan'
import json
import os
import sys
import getopt
import re

import Constants
from TestTemplate import TestTemplate
from DataModelMatcher import DataModelMatcher
from DataModelParser import DataModelParser

class CaseGenerator(object):
    def __init__(self, TA_name):
        self.TA_name = TA_name
        self.TA_p4_folder = TA_name.replace('Splunk_TA_', 'TA-')

    def get_TA_name(self):
        return self.TA_name

    def gen_test_prelude(self, is_prebuilt_panel=False):
        parts = self.TA_name.split('-')
        TYPE = "DM" if is_prebuilt_panel is False else "PrebuiltPanel"
        TEST_NAME = ''.join(part.capitalize() for part in parts)
        TA = self.TA_name.lower().replace('-', '_')
        TA_UTIL = ''
        parts = self.TA_p4_folder.split('-')
        parts.pop(0)
        TA_UTIL = 'TA' + ''.join(part.capitalize() for part in parts) + 'Util'
        TA_NAME = self.TA_name
        GET_AND_INSTALL = 'get_and_install_ta_' + ('_'.join(part.lower() for part in parts))
        return TestTemplate.TEST_PRELUDE % locals()

    def gen_cim_mapping_pivot_test_case(self, cim_model, cim_object, cim_field):
        MODEL = cim_model
        OBJECT = cim_object
        FIELD = cim_field
        return TestTemplate.CIM_MAPPING_PIVOT_TEMPLATE % locals()

    def gen_cim_mapping_test_case(self, cim_model, cim_object, cim_field, cim_search, cim_constraints):
        MODEL = cim_model
        OBJECT = cim_object
        FIELD = cim_field
        SEARCH_KEY, SEARCH_VALUE = cim_search.items()[0]
        CONSTRAINTS = cim_constraints
        return TestTemplate.CIM_MAPPING_TEMPLATE % locals()

    def gen_cim_mapping_test_suite(self, cim_models, exclude_fields='', is_pivot_type = False):
        c = self.gen_test_prelude()

        if is_pivot_type:
            for cim_model, mv in cim_models.items():
                for cim_object, ov in mv.items():
                    for cim_field in ov.get('fields'):
                        c += self.gen_cim_mapping_pivot_test_case(cim_model, cim_object, cim_field)
        elif exclude_fields:
            for cim_model, mv in cim_models.items():
                for cim_object, ov in mv.items():
                    cim_constraints = self.__connect_constraints__(ov['constraints'])
                    for cim_search in ov.get("searches"):
                        if not (cim_model in exclude_fields and cim_object in exclude_fields[cim_model]):
                            continue
                        index = self.__get_search_index__(cim_search, exclude_fields[cim_model][cim_object])
                        if index < 0:
                            continue
                            #TODO: should output the missed search here and analyse it
                        excludes = exclude_fields[cim_model][cim_object][index]['exclude']
                        for cim_field in ov.get('fields'):
                            if cim_field in excludes:
                                continue
                            c += self.gen_cim_mapping_test_case(cim_model,
                                                                cim_object,
                                                                cim_field,
                                                                cim_search,
                                                                cim_constraints)
        else:
            for cim_model, mv in cim_models.items():
                for cim_object, ov in mv.items():
                    cim_constraints = self.__connect_constraints__(ov['constraints'])
                    for cim_search in ov.get("searches"):
                        for cim_field in ov.get('fields'):
                            c += self.gen_cim_mapping_test_case(cim_model,
                                                                cim_object,
                                                                cim_field,
                                                                cim_search,
                                                                cim_constraints)

        c += TestTemplate.TEARDOWN_TEMPLATE
        return c

    def __get_search_index__(self, searches, excludes):
        index = -1
        for i, item in enumerate(excludes):
            if searches == item['search']:
                index = i
                break
        return index

    def __connect_constraints__(self, constraints):
        ret = ''
        length = len(constraints)
        for index, item in enumerate(constraints):
            ret += item
            if index < length -1:
                ret += Constants.CONNECTOR_AND
        return ret

    def write_to_file(self, data, filename):
        if not data:
            return
        with open(filename, 'w') as f:
            f.write(data)

    def gen_prebuilt_panel_search_test_case(self, PANEL_NAME, SEARCH_STRING, SEARCH_STRING_NO):

        return TestTemplate.PREBUILT_PANEL_SEARCH_TEMPLATE % locals()

    def gen_prebuilt_panel_search_test_suite(self, searches):
        if not searches:
            return
        c = self.gen_test_prelude(is_prebuilt_panel=True)
        for panel in searches:
            for panel_name, strings in panel.items():
                for index, search_string in enumerate(strings):
                    search_string = re.sub(r'\\', r'\\\\', search_string)
                    search_string = re.sub(r'"', r'\"', search_string)
                    search_string = re.sub('\n', '\\\n', search_string)
                    c += self.gen_prebuilt_panel_search_test_case(panel_name, search_string, index)
        c += TestTemplate.TEARDOWN_TEMPLATE
        return c
