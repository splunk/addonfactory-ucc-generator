'''
StanzaUtil library
'''
import json
from ITSIModule.Package.KPI import KPI
from ITSIModule.Package.DataModel import DataModel
from ITSIModule.Package.AdhocSearch import AdhocSearch
from ITSIModule.Package.BaseSearch import BaseSearch
from ITSIModule.lib.SplunkConn import SplunkConn

class StanzaUtil(object):

    def __init__(self, module_name, username=None, password=None):
        self.module_name = module_name
        self.splunk_conn = SplunkConn(module_name, username, password)
        self.confs = self.splunk_conn.get_confs()

    '''
    Get value of a given key for a specific stanza of a conf file.
    '''
    def get_value_by_key(self, conf_name, stanza_name, key_in_stanza):

        stanza = self.confs[conf_name][stanza_name]

        return stanza[key_in_stanza]

    '''
    Check to see if the key is there in the given conf file under the stanza.
    '''
    def contains_key(self, conf_name, stanza_name, key_in_stanza):

        stanza = self.confs[conf_name][stanza_name]

        return stanza._raw_sdk_stanza.content.has_key(key_in_stanza)

    '''
    return a list of all keys within a givin stanza
    '''
    def get_content_under_stanza(self, conf_name, stanza_name):

        stanza = self.confs[conf_name][stanza_name]

        return stanza._raw_sdk_stanza.content()

    '''
    return stanza list for a given conf file in a specific module
    '''
    def get_stanza_list(self, conf_name):
        #self.__connect()

        stanza_list = []
        for stanza in self.confs[conf_name].items():
            if self.module_name in stanza.name:
                stanza_list.append(stanza.name)

        return stanza_list

    '''
    Check to see if a given stanza is in the conf file.
    '''
    def check_stanza(self, conf_name, stanza_name):
        try:
            check = self.confs[conf_name][stanza_name]
        except Exception:
            return False

        return True

    # called by test routine.
    def get_kpi_list(self, conf_name='itsi_kpi_template'):
        stanzas = self.get_stanza_list(conf_name)
        kpi_list = []

        for stanza in stanzas:
            kpi_val = self.__get_kpi_list_from_stanza(conf_name, stanza, 'kpis')
            try:
                decoder = json.loads(kpi_val)
                conf_kpi_list = self.__get_kpi_list_from_template(decoder)
                for kpi in conf_kpi_list:
                    kpi_list.append(kpi)
            except (ValueError, KeyError, TypeError) as e:
                pass

        return kpi_list

    def __get_kpi_list_from_stanza(self, conf_name, stanza_name, key_in_stanza):
        kpi_val = self.get_value_by_key(conf_name, stanza_name, key_in_stanza)
        return kpi_val

    def __get_kpi_list_from_template(self, decoder):

        kpis = []
        for data in decoder:
            aggregate_statop = data[KPI.AGGREGATE_STATOP]
            kpi_id = data[KPI.KPI_ID]
            search_type = data[KPI.SEARCH_TYPE]
            entity_statop = data[KPI.ENTITY_STATOP]
            kpi_title = data[KPI.TITLE]

            kpi = KPI(kpi_id, search_type, aggregate_statop, entity_statop)
            kpi.set_kpi_title(kpi_title)
            # Based on current design, datamodel blob should always exist in itsi_kpi_template.conf
            # no matter what value each datamodel field has
            # datamodel object is also used by UI tests to get activation rule information
            data_model_dict = data[KPI.DATAMODEL]
            data_model_str = data_model_dict[DataModel.DATAMODEL]
            data_model_field = data_model_dict[DataModel.FIELD]
            data_model_object = data_model_dict[DataModel.OBJECT]
            data_model_owner_field = data_model_dict[DataModel.OWNER_FIELD]
            datamodel = DataModel(data_model_str, data_model_field, data_model_object, data_model_owner_field)
            kpi.set_datamodel(datamodel)

            if (search_type == KPI.SEARCH_TYPE_ADHOC):
                adhoc_search_str = data[AdhocSearch.BASE_SEARCH]
                adhoc_search_title = data[AdhocSearch.TITLE]
                if (AdhocSearch.TARGET_FIELD in data):
                    adhoc_search_target_field = data[AdhocSearch.TARGET_FIELD]
                else:
                    adhoc_search_target_field = ''

                if (data[AdhocSearch.IS_ENTITY_BREAKDOWN] == True):
                    adhoc_search_entity_breakdown = 'True'
                else:
                    adhoc_search_entity_breakdown = 'False'

                adhoc_search_entity_id_fields = data[AdhocSearch.ENTITY_ID_FIELDS]
                adhoc_search_entity_alias_fields = data[AdhocSearch.ENTITY_ALIAS_FILTERING_FIELDS]
                adhoc_search_object = AdhocSearch(adhoc_search_str,
                                                  adhoc_search_title,
                                                  adhoc_search_entity_breakdown,
                                                  adhoc_search_entity_id_fields,
                                                  adhoc_search_entity_alias_fields,
                                                  adhoc_search_target_field
                                                 )
                kpi.set_adhoc_search(adhoc_search_object)
            elif (search_type == KPI.SEARCH_TYPE_BASE_SEARCH):
                base_search_str = data[BaseSearch.BASE_SEARCH_STR]
                base_search_id = data[BaseSearch.BASE_SEARCH_ID]
                base_search_metric = data[BaseSearch.BASE_SEARCH_METRIC]
                base_search = BaseSearch(base_search_str, base_search_id, base_search_metric)
                kpi.set_base_search(base_search)

            kpis.append(kpi)

        return kpis

