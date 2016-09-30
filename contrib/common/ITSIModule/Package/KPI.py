'''
KPI class contains most important KPI properties which will be used for test purpose
There are three ways to do KPI search: datamodel, adhoc_search, base_search, but only one of these searches can be used at runtime.
'''

class KPI(object):
    AGGREGATE_STATOP = 'aggregate_statop'
    ENTITY_STATOP = 'entity_statop'
    SEARCH_TYPE = 'search_type'
    KPI_ID = 'kpi_template_kpi_id'
    DATAMODEL = 'datamodel'      # module_test.xml tag for DataModel object
    BASE_SEARCH = 'base_search'  # module_test.xml tag for BaseSearch object
    ADHOC_SEARCH = 'adhoc_search' # module_test.xml tag for AdhocSearch object
    TITLE = 'title'
    SEARCH_TYPE_ADHOC = 'adhoc'
    SEARCH_TYPE_DATAMODEL = 'datamodel'
    SEARCH_TYPE_BASE_SEARCH = 'shared_base'

    def __init__(self, kpi_id, search_type, aggregate_statop, entity_statop, test=None):
        self.kpi_template_kpi_id = kpi_id
        self.search_type = search_type
        self.aggregate_statop = aggregate_statop
        self.entity_statop = entity_statop
        self.test = test
        self.datamodel = None
        self.base_search = None
        self.adhoc_search = None
        self.kpi_title = ''

    def set_aggregate_statop(self, statop):
        self.aggregate_statop = statop

    def set_datamodel(self, datamodel):
        self.datamodel = datamodel

    def set_adhoc_search(self, adhoc_search):
        self.adhoc_search = adhoc_search

    def set_entity_statop(self, statop):
        self.entity_statop = statop

    def set_kpi_template_kpi_id(self, kpi_id):
        self.kpi_template_kpi_id = kpi_id

    def set_search_type(self, search_type):
        self.search_type = search_type

    def set_kpi_title(self, title):
        self.kpi_title = title

    def set_base_search(self, base_search):
        self.base_search = base_search

    '''
    Based on search type, return the search object.
    '''
    def search_object(self):
        if (self.search_type == KPI.SEARCH_TYPE_DATAMODEL):
            return self.datamodel
        elif (self.search_type == KPI.SEARCH_TYPE_BASE_SEARCH):
            return self.base_search
        elif (self.search_type == KPI.SEARCH_TYPE_ADHOC):
            return self.adhoc_search

    def run_test(self, module_name, kpi_object_list, junit_writer):
        # verify all fields defined in xml file are the same as defined in itsi_kpi_template
        found = False
        test_case = "Test KPI {0}".format(self.kpi_template_kpi_id)
        error_msg = ''

        for kpi_object in kpi_object_list:
            if (kpi_object.kpi_template_kpi_id == self.kpi_template_kpi_id):
                found = True
                if (kpi_object.aggregate_statop != self.aggregate_statop):
                    error_msg += "aggregate_statop, actual value:{0}, expected value:{1} ".format(kpi_object.aggregate_statop, self.aggregate_statop)

                if (kpi_object.entity_statop != self.entity_statop):
                    error_msg += "entity_statop, actual value:{0}, expected value:{1} ".format(kpi_object.entity_statop, self.entity_statop)

                if (kpi_object.search_type != self.search_type):
                    error_msg += "search_type, actual value:{0}, expected value:{1} ".format(kpi_object.search_type, self.search_type)
                else:
                    error_msg += self.search_object().compare(kpi_object.search_object())

        if (found != True):
            error_msg += "Can't find KPI:{0}".format(self.kpi_template_kpi_id)

        junit_writer.write_test_result(test_case, error_msg)

        if (self.test == 'true'):
            test_case = "KPI {0} search test".format(self.kpi_template_kpi_id)
            result = self.search_object().run_test(module_name)
            junit_writer.write_test_result(test_case, result)

        junit_writer.close()
