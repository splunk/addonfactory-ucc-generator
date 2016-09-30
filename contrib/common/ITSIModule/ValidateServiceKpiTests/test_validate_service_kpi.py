import sys
import getopt
import os
import json
import requests
import splunkweb
from xml.dom import minidom
from xml.dom.minidom import parse
import pytest
import logging
from MigrationUtilLibrary import *
import logging
import conftest

CONFIG = pytest.config

#Validate Service KPIs after migration
class TestValidateServiceKpi():

    def setup_method(self, method):

        logging.basicConfig(level=logging.DEBUG)
        self.mylogger = logging.getLogger()
       
        self.kpi_test_parameters_xml = os.path.join(os.getcwd(), 'kpi_test_parameters.xml')
        self.service_title = CONFIG.service_title
        self.module_name = CONFIG.module_name
        self.username = CONFIG.username
        self.password = CONFIG.password

        self.splunkd_base_url = 'https://localhost:8089/'
        self.url_encoded_query = '{"$and":%20[{"object_type":%20"service"},%20{"title":%20"' + self.service_title.replace(' ', '%20') + '"}]}'
        self.url = self.splunkd_base_url + 'servicesNS/nobody/SA-ITOA/storage/collections/data/itsi_services/?query=' + self.url_encoded_query

   
    def test_validate_service_kpi(self):

        #Issue a GET to get the service json to validate the KPIs
        try:
            response = requests.get(self.url, auth=(self.username, self.password), verify=False)  
            service_json = json.loads(response.text)
        
        except Exception as e:
            raise e

        for kpi in service_json[0].get('kpis'):
            service_id = service_json[0].get('_key')
            #Validate each test specified in the XML file when the service KPI was updated
            kpi_item = build_kpi_test_params(self.kpi_test_parameters_xml, self.module_name, kpi['title'],'true')

            for key in kpi_item:  
                if((str)(kpi_item[key]) == (str)(kpi[key])):
                    self.mylogger.info('Matched' + (str)(kpi_item[key]) + ' from test file and ' + (str)(kpi[key]) + ' from service KPI')
                else:
                    self.mylogger.info('Comparing failed for ' +  (str)(kpi_item[key]) + ' from test file and ' + (str)(kpi[key]) + ' from service KPI')

                assert ((str)(kpi_item[key]) == (str)(kpi[key])), "Service KPI value did not match expected value"

            #Validate each test specified in the XML file when the service KPI was not updated
            kpi_item = build_kpi_test_params(self.kpi_test_parameters_xml, self.module_name, kpi['title'],'false')

            for key in kpi_item: 
                if((str)(kpi_item[key]) == (str)(kpi[key])):
                    self.mylogger.info('Matched' + (str)(kpi_item[key]) + ' from test file and ' + (str)(kpi[key]) + ' from service KPI')
                else:
                    self.mylogger.info('Comparing failed for ' +  (str)(kpi_item[key]) + ' from test file and ' + (str)(kpi[key]) + ' from service KPI')

                assert str(kpi_item[key]) == (str)(kpi[key]), "Service KPI value did not match expected value"
                
    if __name__ == '__main__':
        self.mylogger.info(' Start Validation Tests')
        pytest.main(args=['-s', os.path.abspath(__file__)])
        self.mylogger.info(' Done executing the tests ')