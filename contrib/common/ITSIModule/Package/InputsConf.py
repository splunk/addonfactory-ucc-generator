'''
inputs.conf object
'''
from ConfBase import ConfBase

class InputsConf(ConfBase):
    def __init__(self, name):
        self.stanza_list = []
        self.name = name

    def run_test(self, stanza_util, junit_writer):
        # run test against real conf file installed
        super(InputsConf, self).run_conf_test(stanza_util, junit_writer)