import logging
import re
import xml.etree.cElementTree as ET

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class SplunkHelper:
    def __init__(self, path):
        self.app_path = path

    @classmethod
    def find_dashboards(cls, app_path):
        dashboards = []
        default_xml_path = app_path + '/default/data/ui/nav/default.xml'
        tree = ET.ElementTree(file=default_xml_path)
        for element in tree.getroot():
            if element.tag == 'view' and element.attrib['name'] != 'configure':
                dashboards.append(element.attrib['name'])
            elif element.tag == 'collection' and element.attrib['label'] != 'Search':
                for e in element:
                    if e.tag == 'view':
                        dashboards.append(e.attrib['name'])
        return dashboards

    @classmethod
    def find_global_searches(cls, app_path, dashboards):
        global_searches = {}
        root_xml_path = app_path + '/default/data/ui/views/'
        for dashboard in dashboards:
            dashboard_searches = {}
            tree = ET.ElementTree(file=root_xml_path+dashboard+'.xml')
            for element in tree.getroot():
                if element.tag == 'search' and not element.attrib.has_key('base'):
                    search_name = dashboard + '_' + element.attrib['id']
                    for e in element:
                        if e.tag == 'query':
                            search_text = re.sub('(\$[^\$]+\$)', '*', e.text).strip(' \n')
                            dashboard_searches[search_name] = search_text
            global_searches[dashboard] = dashboard_searches
        return global_searches

    @classmethod
    def find_all_dashboard_searches(cls, app_path, dashboards):
        all_searches = {}
        root_xml_path = app_path + '/default/data/ui/views/'
        for dashboard in dashboards:
            dashboard_searches = {}
            tree = ET.ElementTree(file=root_xml_path+dashboard+'.xml')
            for element in tree.getroot():
                if element.tag == 'search' and not element.attrib.has_key('base'):
                    search_name = dashboard + '_' + element.attrib['id']
                    for e in element:
                        if e.tag == 'query':
                            search_text = re.sub('(\$[^\$]+\$)', '*', e.text).strip(' \n')
                            if search_text.startswith('`'):
                                search_text = "| search " + search_text
                            dashboard_searches[search_name] = search_text
                elif element.tag == 'searchTemplate':
                    search_name = dashboard + '_template'
                    search_text = re.sub('(\$[^\$]+\$)', '*', element.text).strip(' \n')
                    if search_text.startswith('`'):
                        search_text = "| search " + search_text
                    dashboard_searches[search_name] = search_text

            for input in tree.iter('input'):
                search_name = dashboard + '_'
                search_text = ''
                hasSearch = 0
                for element in input:
                    if element.tag == 'label':
                        if element.text:
                            search_name += element.text
                    elif element.tag == 'search' and not element.attrib.has_key('base'):
                        for e in element:
                            if e.tag == 'query':
                                search_text = re.sub('(\$[^\$]+\$)', '*', e.text).strip(' \n')
                                hasSearch = 1
                    elif element.tag == 'populatingSearch':
                        search_text = re.sub('(\$[^\$]+\$)', '*', element.text).strip(' \n')
                        hasSearch = 1
                if hasSearch == 1:
                    if search_text.startswith('`'):
                        search_text = "| search " + search_text
                    dashboard_searches[search_name] = search_text
            for input in tree.iter('single'):
                search_name = dashboard + '_'
                search_text = ''
                hasSearch = 0
                for element in input:
                    if element.tag == 'title':
                        search_name += element.text
                    elif element.tag == 'search' and not element.attrib.has_key('base'):
                        for e in element:
                            if e.tag == 'query':
                                search_text = re.sub('(\$[^\$]+\$)', '*', e.text).strip(' \n')
                                hasSearch = 1
                    elif element.tag == 'searchTemplate':
                        search_text = re.sub('(\$[^\$]+\$)', '*', element.text).strip(' \n')
                        hasSearch = 1
                if hasSearch == 1:
                    if search_text.startswith('`'):
                        search_text = "| search " + search_text
                    dashboard_searches[search_name] = search_text
            for input in tree.iter('chart'):
                search_name = dashboard + '_'
                search_text = ''
                hasSearch = 0
                for element in input:
                    if element.tag == 'title':
                        search_name += element.text
                    elif element.tag == 'search' and not element.attrib.has_key('base'):
                        for e in element:
                            if e.tag == 'query':
                                search_text = re.sub('(\$[^\$]+\$)', '*', e.text).strip(' \n')
                                hasSearch = 1
                    elif element.tag == 'searchTemplate':
                        search_text = re.sub('(\$[^\$]+\$)', '*', element.text).strip(' \n')
                        hasSearch = 1
                if hasSearch == 1:
                    if search_text.startswith('`'):
                        search_text = "| search " + search_text
                    dashboard_searches[search_name] = search_text
            all_searches[dashboard] = dashboard_searches
        return all_searches


