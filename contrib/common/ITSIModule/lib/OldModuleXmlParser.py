'''
ModuleXmlParser parses the module_test.xml file, then create the Conf object list which
will be used in ModuleController object
'''
from xml.dom.minidom import parse
import ast
from xml.dom import  minidom
from ITSIModule.Package import *

class OldModuleXmlParser(object):

    def __init__(self, conf_dict, xml_modules):

        self.modules = []   # ITSI module list

        for xml_module in xml_modules:
            module_name = xml_module.getAttribute("name")
            module_object = ModuleObject(module_name)
            xml_conf_files = xml_module.getElementsByTagName("conffile")

            # loop through each conf file
            for file in xml_conf_files:
                conf_name = file.getAttribute("name")
                if conf_name in conf_dict.keys():
                    conf_object = conf_dict[conf_name](conf_name)
                else:
                    logger.error(conf_name + " is not valid")
                    continue

                conf_object.set_test(file.getAttribute("test"))

                # for each conf file, need to get all stanza
                xml_stanzas = file.getElementsByTagName("stanza")

                for xml_stanza in xml_stanzas:
                    stanza_name = xml_stanza.getAttribute("name")
                    stanza_object = Stanza(stanza_name)

                    xml_items = xml_stanza.getElementsByTagName("item")
                    for xml_item in xml_items:
                        key = xml_item.getAttribute("key")
                        val = xml_item.getAttribute("value")
                        kpi_defined = xml_item.getAttribute("kpi_defined")
                        isJson = xml_item.getAttribute("isJson")
                        match = xml_item.getAttribute("match")
                        search = xml_item.getAttribute("search")
                        xml_file_mapping = xml_item.getAttribute("xml_file_mapping")
                        item_object = ItemObject(module_name,conf_name, stanza_name, key, val, match, isJson, kpi_defined, xml_file_mapping, search)
                        stanza_object.items.append(item_object)

                    # add stanza object in conf file object
                    conf_object.add_stanza(stanza_object)

                # parse kpis node
                xml_kpis = xml_module.getElementsByTagName("kpi")
                for xml_kpi in xml_kpis:
                    kpi_id = xml_kpi.getAttribute('id')
                    test_datamodel = xml_kpi.getAttribute('test_datamodel')
                    if not test_datamodel:
                        aggregate_statop = xml_kpi.getElementsByTagName(KPI.AGGREGATE_STATOP)[0].getAttribute('value')
                        entity_statop = xml_kpi.getElementsByTagName(KPI.ENTITY_STATOP)[0].getAttribute('value')
                        datamodel_str = xml_kpi.getElementsByTagName(KPI.DATAMODEL)[0].getAttribute('value')
                        datamodel_dict = ast.literal_eval(datamodel_str)
                        kpi_object = OldKPI()
                        datamodel_object = DataModel(datamodel_dict[DataModel.DATAMODEL], datamodel_dict[DataModel.FIELD],
                                                     datamodel_dict[DataModel.OBJECT], datamodel_dict[DataModel.OWNER_FIELD])
                        kpi_object.set_kpi_template_kpi_id(kpi_id)
                        kpi_object.set_aggregate_statop(aggregate_statop)
                        kpi_object.set_entity_statop(entity_statop)
                        kpi_object.set_datamodel(datamodel_object)
                        kpi_object.set_test_datamodel(test_datamodel)

                        module_object.add_kpi(kpi_object)

                # add conf file into the conf file list
                module_object.add_conf_file(conf_object)

            # add conf files into module
            self.modules.append(module_object)

    def get_itsi_modules(self):
        return self.modules




