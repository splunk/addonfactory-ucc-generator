'''
KPI class contains most important KPI properties which will be used for test purpose
'''

class OldKPI(object):
    AGGREGATE_STATOP = 'aggregate_statop'
    ENTITY_STATOP = 'entity_statop'
    KPI_ID = 'kpi_template_kpi_id'
    DATAMODEL = 'datamodel'
    TITLE = 'title'

    def __init__(self):
        self.aggregate_statop = ''
        self.datamodel = None
        self.entity_statop = ''
        self.kpi_template_kpi_id = ''
        self.test_datamodel = 'false'
        self.kpi_title = ''

    def set_aggregate_statop(self, statop):
        self.aggregate_statop = statop

    def set_datamodel(self, datamodel):
        self.datamodel = datamodel

    def set_entity_statop(self, statop):
        self.entity_statop = statop

    def set_kpi_template_kpi_id(self, kpi_id):
        self.kpi_template_kpi_id = kpi_id

    def set_test_datamodel(self, test_datamodel):
        self.test_datamodel = test_datamodel

    def set_kpi_title(self, title):
        self.kpi_title = title

    def run_test(self, module_name, kpi_object_list, junit_writer):
        # verify all fields defined in xml file are the same as defined in itsi_kpi_template
        found = False
        test_case = "Test KPI {0}".format(self.kpi_template_kpi_id)
        error_msg = ''

        for kpi_object in kpi_object_list:
            if (kpi_object.kpi_template_kpi_id == self.kpi_template_kpi_id):
                found = True
                if (kpi_object.aggregate_statop != self.aggregate_statop):
                    error_msg += "aggregate_statop, actual value:{0}, expect value:{1} ".format(kpi_object.aggregate_statop, self.aggregate_statop)

                if (kpi_object.entity_statop != self.entity_statop):
                    error_msg += "entity_statop, actual value:{0}, expect value:{1} ".format(kpi_object.entity_statop, self.entity_statop)

                error_msg += self.datamodel.compare(kpi_object.datamodel)

        if (found != True):
            error_msg += "Can't find KPI:{0}".format(self.kpi_template_kpi_id)

        junit_writer.write_test_result(test_case, error_msg)

        if (self.test_datamodel == 'true'):
            test_case = "KPI {0} datamodel search test".format(self.kpi_template_kpi_id)
            result = self.datamodel.run_test(module_name)
            junit_writer.write_test_result(test_case, result)

        junit_writer.close()