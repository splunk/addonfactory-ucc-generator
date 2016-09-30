'''
itsi_kpi_template.conf object
'''
from ConfBase import ConfBase


class ItsiKpiTemplateConf(ConfBase):

    def __init__(self, name):
        self.stanza_list = []
        self.name = name
        self.kpi_list = []

    def run_test(self, stanza_util, junit_writer):
        # run test against real conf file installed
        super(ItsiKpiTemplateConf, self).run_conf_test(stanza_util, junit_writer)