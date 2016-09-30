"""
Module Controller will create expect conf files, also will read the actual conf file from ITSI module
Controller will do the test base on ITSI Module test guide, also, controller can also verify the key/value
pair based on module_test.xml file
"""
from ITSIModule.lib import *


class ModuleController(object):
    """
    module_test_xml: moduel test xml file, this file contains all conf test information which will be used
    as test cases
    """
    def __init__(self, module_test_xml):
        self.module_test_xml = module_test_xml
        self.module_xml_parser = ModuleXmlParser(module_test_xml)
        self.modules = self.module_xml_parser.get_itsi_modules()

    def run_test(self):
        for module in self.modules:
            module.run_test()


def main():
        controller = ModuleController("module_test.xml")
        controller.run_test()

if __name__ == "__main__":
    main()
