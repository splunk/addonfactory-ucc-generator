# NOTE: This piece of code is functional but is not being called here. Since pylint has a bug where
#       external custom checker that extend ImportsChecker conflict with ConfigParser. To see this 
#       logic is actually called go to test/tests/static/contrib/pylint/checkers/imports.py. 
#       imports.py has been modified for splunk pylint project

import re

from logilab import astng
from pylint.checkers.imports import ImportsChecker

class SplunkImportChecker(ImportsChecker):
    
    def __init__(self, linter=None):
        self.msgs['R0402'] = ('Unable to import %r because this is not Windows', 
                              'WONTFIX')
        ImportsChecker.__init__(self, linter)
    
    def get_imported_module(self, modnode, importnode, modname):
        try:
            return importnode.do_import_module(modname)
        except astng.InferenceError, ex:
            if re.search('win32|pywin', modname) is not None:
                self.add_message("R0402", args=modname, node=importnode)
            else:
                self.add_message("F0401", args=modname, node=importnode)

def register(linter):
    """required method to auto register this checker """
    linter.register_checker(SplunkImportChecker(linter))