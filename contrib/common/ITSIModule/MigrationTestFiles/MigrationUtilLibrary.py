import sys
import getopt
import os
import json
from xml.dom import minidom
from xml.dom.minidom import parse
import logging

#This will parse the KPI test parameter file
#For a given Service, Module, KPI, it will parse out the KPI Parameters to update or validate
#if update_test_param is true, this function will only return KPI metrics that need to be updated
#if update_test param is false, this function will only return KPI metrics that need to be validated
def build_kpi_test_params(kpi_test_parameters_xml, module_name, kpi_title, update_test_param):
       
    kpi_test_params = dict()
    dom = parse(kpi_test_parameters_xml )
    collection = dom.documentElement
    modules = collection.getElementsByTagName("module")

    for module in modules:
            
        if(module.getAttribute("name") == module_name):
            kpis = module.getElementsByTagName("kpi")
            
            for kpi in kpis:    
                if(kpi.getAttribute('id') == kpi_title):  
                    alertlag = kpi.getElementsByTagName('alert_lag')[0]
                    if(alertlag.getAttribute('update') == update_test_param):
                        kpi_test_params['alert_lag'] = alertlag.childNodes[0].data
                            
                    alertperiod = kpi.getElementsByTagName('alert_period')[0]
                    if(alertperiod.getAttribute('update') == update_test_param):  
                        kpi_test_params['alert_period'] = alertperiod.childNodes[0].data
                            
                    searchtype = kpi.getElementsByTagName('search_type')[0]
                    if(searchtype.getAttribute('update') == update_test_param):  
                        kpi_test_params['search_type'] = searchtype.childNodes[0].data 

                    is_service_entity_filter = kpi.getElementsByTagName('is_service_entity_filter')[0]
                    if(is_service_entity_filter.getAttribute('update') == update_test_param):  
                        kpi_test_params['is_service_entity_filter'] = is_service_entity_filter.childNodes[0].data
                        
                    entity_statop = kpi.getElementsByTagName('entity_statop')[0]
                    if(entity_statop.getAttribute('update') == update_test_param):  
                        kpi_test_params['entity_statop'] = entity_statop.childNodes[0].data
                           
                    aggregate_statop = kpi.getElementsByTagName('aggregate_statop')[0]
                    if(aggregate_statop.getAttribute('update') == update_test_param):  
                        kpi_test_params['aggregate_statop'] = aggregate_statop.childNodes[0].data
                     
                    base_search_metric = kpi.getElementsByTagName('base_search_metric')[0]
                    if(base_search_metric.getAttribute('update') == update_test_param):  
                        kpi_test_params['base_search_metric'] = base_search_metric.childNodes[0].data
                        
                    is_entity_breakdown = kpi.getElementsByTagName('is_entity_breakdown')[0]
                    if(is_entity_breakdown.getAttribute('update') == update_test_param):  
                        kpi_test_params['is_entity_breakdown'] = is_entity_breakdown.childNodes[0].data

                    entity_alias_filtering_fields = kpi.getElementsByTagName('entity_alias_filtering_fields')[0]
                    if(entity_alias_filtering_fields.getAttribute('update') == update_test_param):  
                        kpi_test_params['entity_alias_filtering_fields'] = entity_alias_filtering_fields.childNodes[0].data

                    base_search = kpi.getElementsByTagName('base_search')[0]
                    if(base_search.getAttribute('update') == update_test_param):  
                        kpi_test_params['base_search'] = base_search.childNodes[0].data
                        
         
    return kpi_test_params

        