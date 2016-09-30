'''
ModuleXmlParser parses the module_test.xml file, then create the Conf object list which
will be used in ModuleController object
'''
from xml.dom.minidom import parse
import ast
from xml.dom import  minidom
from ITSIModule.lib.ArgUtil import *
from ITSIModule.lib.NewModuleXmlParser import NewModuleXmlParser
from ITSIModule.lib.OldModuleXmlParser import OldModuleXmlParser
from ITSIModule.lib.SSLUtil import SSLUtil
from ITSIModule.lib.StanzaUtil import StanzaUtil
from ITSIModule.Package import *

class ModuleXmlParser(object):

    def __init__(self, xml_file):
        self.modules = []   # ITSI module list

        doc = minidom.parse(xml_file)
        xml_modules = doc.getElementsByTagName("module")
        conf_dict = {'app':AppConf, 'deep_dive_drilldowns':DeepDiveDrilldownsConf,
                     'inputs':InputsConf, 'itsi_da':ItsiDaConf,
                     'itsi_kpi_template':ItsiKpiTemplateConf, 'savedsearches':SavedSearchesConf,
                     'itsi_module_viz':ItsiModuleVizConf,
                     'itsi_kpi_base_search':ItsiKPIBaseSearchConf,
                     'itsi_service_template': ItsiServiceTemplateConf}

        # check module version number
        module_name = xml_modules[0].getAttribute("name")
        ssl_util = SSLUtil()

        if (module_name):
            # before we call stanza_util get, we need to disable ssl first.
            ssl_util.disable_ssl()
            stanza_util = StanzaUtil(module_name)
            version = stanza_util.get_value_by_key('app', 'launcher', 'version')

            if (compare_version(version, "2.3.0") < 0):
                self.module_xml_parser = OldModuleXmlParser(conf_dict, xml_modules)
            else:
                self.module_xml_parser = NewModuleXmlParser(conf_dict, xml_modules)

    def get_itsi_modules(self):
        return self.module_xml_parser.get_itsi_modules()





