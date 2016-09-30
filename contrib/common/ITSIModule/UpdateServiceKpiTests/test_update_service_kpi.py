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

#Update Service KPIs before migration
class TestUpdateServiceKpi():

    def setup_method(self, method):

        logging.basicConfig(level=logging.INFO)
        self.mylogger = logging.getLogger()
        
        self.kpi_test_parameters_xml = os.path.join(os.getcwd(), 'kpi_test_parameters.xml')
        self.service_title = CONFIG.service_title
        self.module_name = CONFIG.module_name
        self.username = CONFIG.username
        self.password = CONFIG.password

        self.splunkd_base_url = 'https://localhost:8089/'
        self.url_encoded_query = '{"$and":%20[{"object_type":%20"service"},%20{"title":%20"' + self.service_title.replace(' ', '%20') + '"}]}'
        self.url = self.splunkd_base_url + 'servicesNS/nobody/SA-ITOA/storage/collections/data/itsi_services/?query=' + self.url_encoded_query

      
    #For each KPI in the service, this test will update the service KPIs with parameters from test file
    #This test will be invoked prior to migration
    def test_update_service_kpi(self):

        try:
                response = requests.get(self.url, auth=(self.username, self.password), verify=False)  
                service_json = json.loads(response.text)
        
        except Exception as e:
                raise e
    
        splunk_web = splunkweb.SplunkWeb()
       
        for kpi in service_json[0].get('kpis'):
            self.mylogger.info('Updating ' + kpi['title'])
            
            if(str(kpi['title']) != 'ServiceHealthScore'):
                
                service_id = service_json[0].get('_key')
                #Get test parameters for that particular KPI
                kpi_item = build_kpi_test_params(self.kpi_test_parameters_xml, self.module_name, kpi['title'],'true')
                
                # Update Service with test parameters
                for key in kpi_item: 
                    try:
                        kpi.update({key: kpi_item[key]})
                        self.mylogger.info('Updating ' +  key + 'with ' + (str)(kpi_item[key]))
                        #issue a POST to update service KPI
                        postargs = {'data': json.dumps(service_json[0])}
                        path = '/en-US/custom/SA-ITOA/itoa_interface/nobody/service/' + service_id
                       
                        response, content = splunk_web.request(path=path, method="POST", body=postargs)

                        assert response.text == None, 'Get Response is not as expected'

                    except Exception as e:
                        raise e

    if __name__ == '__main__':
        self.mylogger.info(' Start Updating Tests')
        pytest.main(args=['-s', os.path.abspath(__file__)])
        self.mylogger.info(' Done executing the tests ')
