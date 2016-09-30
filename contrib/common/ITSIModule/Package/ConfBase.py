'''
Define ITSI Module conf file base object
'''

from abc import abstractmethod

class ConfBase(object):

    def __init__(self):
        self.test = 'false'
        pass

    def add_stanza(self, stanza_obj):
        self.stanza_list.append(stanza_obj)

    def run_conf_test(self, stanza_util, junit_writer):
        if (self.test == 'false'):
            return

        # run test against real conf file installed
        for stanza in self.stanza_list:
            self.__run_stanza_test(stanza, stanza_util, junit_writer)

    def __run_stanza_test(self, stanza, stanza_util, junit_writer):
        for item in stanza.items:
            item.run_test(stanza_util, junit_writer)

    def set_test(self, test):
        self.test = test

    @abstractmethod
    def run_test(self, stanza_util, junit_writer):
        pass
