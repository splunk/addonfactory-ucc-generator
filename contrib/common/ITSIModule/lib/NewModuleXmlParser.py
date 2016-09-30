'''
NewModuleXmlParser parses the module_test.xml file (version>=2.3.0, then create the Conf object list which
will be used in ModuleController object
'''
from xml.dom.minidom import parse
import ast
from xml.dom import  minidom
from ITSIModule.Package import *

class NewModuleXmlParser(object):

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

                # add conf file into the conf file list
                module_object.add_conf_file(conf_object)
            # parse kpis node
            xml_kpis = xml_module.getElementsByTagName("kpi")
            for xml_kpi in xml_kpis:

                kpi_id = xml_kpi.getAttribute('id')
                test = xml_kpi.getAttribute('test')
                aggregate_statop = xml_kpi.getElementsByTagName(KPI.AGGREGATE_STATOP)[0].getAttribute('value')
                entity_statop = xml_kpi.getElementsByTagName(KPI.ENTITY_STATOP)[0].getAttribute('value')
                search_type = xml_kpi.getElementsByTagName(KPI.SEARCH_TYPE)[0].getAttribute('value')
                kpi_object = KPI(kpi_id, search_type, aggregate_statop, entity_statop, test)

                # parse datamodel
                # datamodel is must to have based on current design
                if (xml_kpi.getElementsByTagName(KPI.DATAMODEL) != None and len(xml_kpi.getElementsByTagName(KPI.DATAMODEL)) != 0):
                    datamodel_str = xml_kpi.getElementsByTagName(KPI.DATAMODEL)[0].getAttribute('value')
                    datamodel_dict = ast.literal_eval(datamodel_str)
                    datamodel_object = DataModel(datamodel_dict[DataModel.DATAMODEL], datamodel_dict[DataModel.FIELD], datamodel_dict[DataModel.OBJECT], datamodel_dict[DataModel.OWNER_FIELD])
                    kpi_object.set_datamodel(datamodel_object)

                # parse adhoc_search, either adhoc search or base_search
                if (xml_kpi.getElementsByTagName(KPI.ADHOC_SEARCH) != None and len(xml_kpi.getElementsByTagName(KPI.ADHOC_SEARCH)) != 0):
                    adhoc_search_str = xml_kpi.getElementsByTagName(KPI.ADHOC_SEARCH)[0].getAttribute('value')
                    adhoc_search_dict = ast.literal_eval(adhoc_search_str)
                    adhoc_search_object = AdhocSearch(adhoc_search_dict[AdhocSearch.BASE_SEARCH], adhoc_search_dict[AdhocSearch.TITLE], adhoc_search_dict[AdhocSearch.IS_ENTITY_BREAKDOWN], adhoc_search_dict[AdhocSearch.ENTITY_ID_FIELDS],adhoc_search_dict[AdhocSearch.ENTITY_ALIAS_FILTERING_FIELDS], adhoc_search_dict[AdhocSearch.TARGET_FIELD])
                    kpi_object.set_adhoc_search(adhoc_search_object)
                # parse base_search
                elif (xml_kpi.getElementsByTagName(KPI.BASE_SEARCH) != None and len(xml_kpi.getElementsByTagName(KPI.BASE_SEARCH)) != 0):
                    basesearch_str = xml_kpi.getElementsByTagName(KPI.BASE_SEARCH)[0].getAttribute('value')
                    basesearch_dict = ast.literal_eval(basesearch_str)
                    basesearch_object = BaseSearch(basesearch_dict[BaseSearch.BASE_SEARCH_STR], basesearch_dict[BaseSearch.BASE_SEARCH_ID],basesearch_dict[BaseSearch.BASE_SEARCH_METRIC])
                    kpi_object.set_base_search(basesearch_object)

                module_object.add_kpi(kpi_object)
            # add conf files into module
            self.modules.append(module_object)

    def get_itsi_modules(self):
        return self.modules





