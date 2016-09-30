import json

import xmltodict

class CaseSuites(object):
    def __init__(self, junit_files):
        self.junit_files = junit_files

    def junit2json(self):
        xml_dict_list = []
        for junit_file in self.junit_files:
            with open(junit_file) as fh:
                xml_dict = xmltodict.parse(fh, encoding="utf-8", attr_prefix="", cdata_key="text")
                xml_dict = json.loads(json.dumps(xml_dict))
                xml_dict_list.append(xml_dict)

        return xml_dict_list
