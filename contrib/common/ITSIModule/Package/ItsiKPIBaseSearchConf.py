'''
itsi_kpi_base_search.conf object
'''
from ConfBase import ConfBase
from ITSIModule.Package.KPI import KPI

class ItsiKPIBaseSearchConf(ConfBase):

    def __init__(self, name):
        self.stanza_list = []
        self.name = name

    def run_test(self, stanza_util, junit_writer):
        kpi_list = stanza_util.get_kpi_list()
        base_search_stanza_name_list = []
        for stanza in self.stanza_list:
            base_search_stanza_name_list.append(stanza.name)

        for kpi in kpi_list:
            # for any of base search KPIs, need to verify if the KPI ID defined in itsi_kpi_basesearch.conf
            if (kpi.search_type == KPI.SEARCH_TYPE_BASE_SEARCH):
                test_case = "Verify basesearch KPI ID {0} is defined in {1}.conf file".format(kpi.kpi_template_kpi_id, self.name)
                if (kpi.base_search.search_id in base_search_stanza_name_list):
                    junit_writer.write_test_result(test_case, '')
                else:
                    junit_writer.write_test_result(test_case,'fail')

        # run test against real conf file installed
        super(ItsiKPIBaseSearchConf, self).run_conf_test(stanza_util, junit_writer)
