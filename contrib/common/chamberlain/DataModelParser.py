__author__ = 'Zimo'
import json
import os
import sys

import Constants
from ConstraintsComparer import ConstraintsComparer

class DataModelContainer(object):
    def __init__ (self, json):
        if type(json["objects"]) is not list:
            return
        self.depth = 0
        self.container = []
        self.__parse__(json["objects"])

    def __parse__ (self, objects):
        for object in objects:
            add_level = -1
            if object["parentName"] == Constants.BASE_EVENT or object["parentName"] == Constants.BASE_SEARCH:
                add_level = 0
            else:
                found = False
                for level in self.container:
                    if found:
                        break
                    for element in level:
                        if element["objectName"] == object["parentName"]:
                            found = True
                            add_level = self.container.index(level) + 1
                            if "children" not in element:
                                element["children"] = []
                            element["children"].append(object)
                            if "constraints" in element:
                                if "constraints" not in object:
                                    object["constraints"] = []
                                object["constraints"].extend(element["constraints"])
                            if "fields" in element:
                                if "fields" not in object:
                                    object["fields"] = []
                                if "calculations" not in object:
                                    object["calculations"] = []
                                object["fields"].extend(element["fields"])
                                object["calculations"].extend(element["calculations"])
                            break
            self.__add_object__(object, add_level)

    def __add_level__ (self):
        self.depth += 1
        self.container.append([])

    def __add_object__ (self, object, add_level):
        if add_level > self.depth - 1:
            self.__add_level__()
        object['level'] = add_level
        self.container[add_level].append(object)



class DataModelParser(object):
    def __init__ (self, path, logger):
        self.logger = logger
        default_path = os.getenv('SPLUNK_HOME')+'/etc/apps/Splunk_SA_CIM/default/data/models/'
        self.path = path if len(path) > 0 else default_path
        self.logger.debug("Data Model path: {0}".format(self.path))
        files = os.listdir(self.path)
        self.files = []
        self.models = {}
        self.data_models_file_name = "DataModelTree"
        self.data_models_overlap = []

        for file in files:
            file_name, file_extension = os.path.splitext(file)
            if (file_extension == Constants.JSON_EXTENSION):
                self.files.append(file)
                data_model = self.__parse_file__(file)
                try:
                    self.models[file_name] = DataModelContainer(data_model)
                except:
                    continue

    def __parse_file__ (self, file):
        file_content = open(self.path+'/'+file)
        try:
            json_data = json.load(file_content)
        except:
            self.logger.error("Error found in JSON file {0}".format(file_content.name))
            return
        file_content.close()

        return json_data

    def __print_children__(self, parent):
        level = parent['level']
        if level > 0:
            # print (parent['level'])*Constants.PRINT_TAB + Constants.PRINT_DASH + parent['objectName']
            self.__print_to_file__((parent['level'])*Constants.PRINT_TAB + Constants.PRINT_DASH + parent['objectName']+'\n')
        else:
            # print Constants.PRINT_TAB + parent['objectName']
            self.__print_to_file__(Constants.PRINT_TAB + parent['objectName']+'\n')
        if 'children' in parent and parent['children'] > 1:
            for child in parent['children']:
                self.__print_children__(child)

    def print_data_models(self):
        self.__print_to_file__('\n'+"**Data Model from \""+self.path+'\"**'+'\n'*2, 'w')
        for key, model in self.models.items():
            length = len(key)
            self.__print_to_file__(' '+key+'\n')
            self.__print_to_file__((2 + length)*"="+'\n')
            for element in model.container[0]:
                self.__print_children__(element)
                self.__print_to_file__('\n')
            self.__print_to_file__('\n')

    def __print_to_file__(self, data, mode='a'):
        with open(self.data_models_file_name, mode) as f:
            f.write(data)
        f.close()

    def _check_dm_obj_pair_rep(self, dm_obj, dm_obj_1, pairs):
        ret = False
        for pair in pairs:
            if (pair[0]['objectName'] == dm_obj['objectName'] \
                and pair[0]['dataModel'] == dm_obj['dataModel']) \
            and (pair[1]['objectName'] == dm_obj_1['objectName'] \
                and pair[1]['dataModel'] == dm_obj_1['dataModel']):
                ret = True
                break
            elif (pair[1]['objectName'] == dm_obj['objectName'] \
                and pair[1]['dataModel'] == dm_obj['dataModel']) \
            and (pair[0]['objectName'] == dm_obj_1['objectName'] \
                and pair[0]['dataModel'] == dm_obj_1['dataModel']):
                ret = True
                break
        return ret


    def get_dm_overlap(self):
        if self.data_models_overlap:
            return self.data_models_overlap
        all_dm_objs = []
        for model_name, model_content in self.models.items():
            for level in model_content.container:
                for dm_obj in level:
                    dm_obj['dataModel'] = model_name
                    all_dm_objs.append(dm_obj)
        pairs = []
        for dm_obj in all_dm_objs:
            for dm_obj_1 in all_dm_objs:
                if dm_obj['dataModel'] == dm_obj_1['dataModel']:
                    continue
                if self._check_dm_obj_pair_rep(dm_obj, dm_obj_1, pairs):
                    continue
                constraints = ConstraintsComparer.compare_dd(dm_obj['constraints'], dm_obj_1['constraints'])
                if not constraints == False:
                    dm_obj['dataModelPair'] = dm_obj_1['dataModelPair'] = '{} vs {}'.format(dm_obj['dataModel'], dm_obj_1['dataModel'])
                    pair = (dm_obj, dm_obj_1)
                    pairs.append(pair)
        self.data_models_overlap = pairs
        return self.data_models_overlap

    def print_dm_overlap(self):
        self.get_dm_overlap()
        print_buff = '\n**Data Model Overlap Based on Tag Attachment**\n'
        dm_pair_name = ''
        for pair in self.data_models_overlap:
            if dm_pair_name != pair[0]['dataModelPair']:
                print_buff += (1 + len(pair[0]['dataModelPair']))*"=" + '\n'
                print_buff += 'Data Model Conflict\n{}\n'.format(pair[0]['dataModelPair'])
                print_buff += (1 + len(pair[0]['dataModelPair']))*"=" + '\n'
                dm_pair_name = pair[0]['dataModelPair']
            print_buff += 'OBJECTS:\n  {} vs {}\nCONSTRAINTS:\n  {} vs {}\n\n'.format(pair[0]['objectName'], pair[1]['objectName'], \
                            json.dumps(pair[0]['constraints']), json.dumps(pair[1]['constraints']))
        self.__print_to_file__(print_buff)
        print print_buff


