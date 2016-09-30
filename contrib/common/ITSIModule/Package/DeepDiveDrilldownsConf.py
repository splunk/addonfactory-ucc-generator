'''
deep_dive_drilldowns.conf object
'''
from ITSIModule.Package import ConfBase


class DeepDiveDrilldownsConf(ConfBase):
    def __init__(self, name):
        self.stanza_list = []
        self.name = name

    def run_test(self, stanza_util, junit_writer):
        # run test against real conf file installed
        super(DeepDiveDrilldownsConf, self).run_conf_test(stanza_util, junit_writer)