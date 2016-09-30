'''
Stanza item object
'''
import json
import os
from ITSIModule.lib import *

class ItemObject(object):

    def __init__(self, module_name, conf_name, stanza_name, key, val, match, isJson, kpi_defined, xml_file_mapping, search):
        self.module_name = str(module_name)
        self.conf_name = str(conf_name)
        self.stanza_name = str(stanza_name)
        self.key = str(key)
        self.isJson = isJson
        self.kpi_defined = kpi_defined
        self.match = match
        self.value = str(val)
        self.xml_file_mapping = xml_file_mapping
        self.search = search

    def run_test(self, stanza_util, junit_writer):
        '''
        running tests:
        1. verify the key
        2. verify value:
           verify if Json value is valid
           verify the match
           if it's KPI list, need to verify if the kpi list is defined in kpi_template file
        '''
        self._verify_key(stanza_util, junit_writer)
        self._verify_value(stanza_util, junit_writer)

    def _verify_key(self, stanza_util, junit_writer):
        # verify key

        test_case = "Test [key]{0} defined in [{1}] from {2}.conf".format(self.key, self.stanza_name, self.conf_name)

        # Verify key
        if (stanza_util.contains_key(self.conf_name, self.stanza_name, self.key) == False):
            junit_writer.write_test_result(test_case, "key:{0} is not found".format(self.key))
            return       # if key is not there, no need continue
        else:
            junit_writer.write_test_result(test_case, "")     # test pass, error message is empty

    def _verify_value(self, stanza_util, junit_writer):
        # read value
        try:
            val = stanza_util.get_value_by_key(self.conf_name, self.stanza_name, self.key)
        except Exception as e:
            test_case = "Test [key]{0}'s value defined in [{1}] from {2}.conf".format(self.key, self.stanza_name, self.conf_name)
            junit_writer.write_test_result(test_case, "Exception {0}".format(e.message))
            return       # something wrong here, simply return

        # test if it's Json, if it's Json, need to verify it's valid format, however, don't need to check value
        # if it's not Json, then need to verify the value
        if (self.isJson == "true"):
            test_case = "Test Json format for [key]{0}'s value defined in [{1}] from {2}.conf".format(self.key, self.stanza_name, self.conf_name)
            try:
                data = json.loads(val)
                junit_writer.write_test_result(test_case, "")
            except ValueError:
                junit_writer.write_test_result(test_case, " Invalid Json format")
        elif (self.value != None and self.value !=''):   #if it's not Json and it's not empty, we need to compare the value
            test_case = "Test {0} for [key]{1} defined in [{2}] from {3}.conf".format(self.value, self.key, self.stanza_name, self.conf_name)

            if (self.value == 'true'):
                self.value = '1'
            if (self.value == 'false'):
                self.value = '0'

            if (self.value == val):
                junit_writer.write_test_result(test_case, "")
            else:
                junit_writer.write_test_result(test_case, "value {0} doesn't match {1}".format(self.value, val))
                return            # if value doesn't match, we don't need to do further test.

        # if the value needs to be match a stanza name in the given conf file
        if (self.match != None and self.match != ''):
            save_search_token = 'savedsearch '
            match_stanzas = self.value
            index = self.value.find(save_search_token)

            if (index != -1):     # for saved search match, we need to match actual saved search
                index += len(save_search_token)
                match_stanzas = self.value[index:]
            match_stanzas = match_stanzas.split(',')     # there could be multiple matches which is separated by ','

            for match_stanza in match_stanzas:
                match_stanza = match_stanza.strip()    # remove leading and trailing spaces

                # for entity_source_templates, we need to add entity_source_templates:// in front of value as stanza name it should match
                if (self.key == 'entity_source_templates'):
                    match_stanza = 'entity_source_template://' + match_stanza
                test_case = "Test {0} for [key]{1} defined in [{2}] from {3}.conf,  matches {4}'s stanza ".format(self.value,self.key, self.stanza_name, self.conf_name, match_stanza)

                if (stanza_util.check_stanza(self.match, match_stanza) == True):
                    junit_writer.write_test_result(test_case, "")
                else:
                    junit_writer.write_test_result(test_case, " does not match {0}.conf's any stanzas".format(self.conf_name))

        # if the it's itsi_module_viz, if xml_file_mapping is true, need to verify the name is mapping the xml file name.
        if (self.xml_file_mapping != None and self.xml_file_mapping == 'true'):
            #TO Do
            viz_panel_items = self.value.split(',')
            viz_panel_xml_file_list = []
            for i in viz_panel_items:
                viz_panel_xml_file_list.append(i.split(':')[1])

            xml_file_list = self._get_panel_xml_file_list()

            for item in viz_panel_xml_file_list:
                test_case = 'Check if {0} has a mapping xml file'
                error_msg = ''
                if item in xml_file_list:
                    pass
                else:
                    error_msg = ''.format('{0} does not have a mapping xml file', item)

                junit_writer.write_test_result(test_case, error_msg)


        # Test KPI list to make sure it's in kpi template
        if (self.kpi_defined != None and self.kpi_defined !=''):
            # the kpi is separated by ',', this list is the same as installed conf file, it's been verified on above test.
            kpi_list = self.value.split(',')
            kpi_defined_object_list = stanza_util.get_kpi_list(self.kpi_defined)
            kpi_defined_list = []
            for kpi_object in kpi_defined_object_list:
                kpi_defined_list.append(kpi_object.kpi_template_kpi_id)

            for kpi in kpi_list:
                test_case = " Test kpi {0} for [key]{1} defined in [{2}] from {3}.conf is defined in {4}".format(kpi, self.key, self.stanza_name, self.conf_name, self.kpi_defined)
                if kpi in kpi_defined_list:
                    junit_writer.write_test_result(test_case, "")
                else:
                    junit_writer.write_test_result(test_case, "kpi is not defined in {0}".format(self.kpi_defined))

        junit_writer.close()

    def _get_panel_xml_file_list(self):
        '''
        right now, hard code the panel xml path: [module]/default/data/ui/panels
        '''
        xml_file_dir = os.path.join(os.environ["SPLUNK_HOME"], 'etc/apps', self.module_name, 'default/data/ui/panels')
        file_list = []
        for file in os.listdir(xml_file_dir):
            if file.endswith('.xml'):
                file_without_ext = os.path.splitext(file)[0]
                file_list.append(file_without_ext)

        return file_list





