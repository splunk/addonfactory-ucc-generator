__author__ = 'Zimo'

import xml.etree.ElementTree as ET
import re
import os
import string
import sys

class PrebuiltPanelSearch(object):
    def __init__(self, TA_path):
        self.TA_path = TA_path
        self.panel_path = os.path.join(TA_path, 'default', 'data', 'ui', 'panels')
        # self.TA_name = TA_path[TA_path.index("Splunk_TA"): len(TA_path)].replace('/', '')
        self.TA_name = re.search("((TA|ta)-[0-9-_A-Za-z]+)/", TA_path).group(1)
        self.TA_name = re.sub("(TA|ta)-", "Splunk_TA_", self.TA_name)
        self.__panels__ = []

    def get_TA_name(self):
        return self.TA_name

    def parse(self):
        if not os.path.isdir(self.panel_path):
            print 'Not available path'
            return
        for file_name in os.listdir(self.panel_path):
            file_path = os.path.join(self.panel_path, file_name)
            title = self.getFileName(file_name)
            if os.path.isfile(file_path) and title:
                self.__panels__.append({title: self.getSearchStrings(file_path)})
        return self.__panels__

    def getFileName(self, name):
        regex = re.compile("([A-Za-z0-9_]*)\.xml$")
        return regex.findall(name)[0] if len(regex.findall(name)) else False

    def findSearch(self, element, search_strings):
        if element.tag == 'search':
            ele_query = element.find('query')
            if ele_query is not None:
                search_string = ele_query.text
                if element.find('earliest') is not None and element.find('earliest').text is not None:
                    str_earliest = "earliest=" + element.find('earliest').text + " "
                    search_string = str_earliest + search_string
                if element.find('latest') is not None and element.find('latest').text is not None:
                    str_latest = "latest=" + element.find('latest').text + " "
                    search_string = str_latest + search_string
                search_string = "search " + search_string
                search_strings.append(search_string)
            elif 'ref' in element.attrib:
                search_string = "| savedsearch \"" + element.attrib['ref'] + "\""
                search_strings.append(search_string)
        elif element.tag == 'searchString':
            search_string = "search " + element.text
            search_strings.append(search_string)
            # TODO: there could be peer elements <earliestTime/> <latestTime/> to handle
        else:
            # print element.tag
            pass

        children = element.getchildren()
        for child in children:
            self.findSearch(child, search_strings)


    def getSearchStrings(self, file_path):
        tree = ET.parse(file_path)
        root = tree.getroot()
        search_strings = []
        self.findSearch(root, search_strings)

        print file_path, ': ', search_strings
        return search_strings
