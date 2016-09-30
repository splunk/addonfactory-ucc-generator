__author__ = 'Zimo'
import os
import pprint
import re

import Constants
from ConstraintsComparer import ConstraintsComparer


RE_AS = re.compile(" +(?:AS|as) +(\w+)")
RE_EVAL = re.compile("(?<=EVAL-)(\w+)")
RE_OUTPUT = re.compile("(?:OUTPUT +|OUTPUTNEW +)(.+)")
RE_WITH_OUTPUT = re.compile("[^\ \,]+(?=\ *\,|$)")
RE_WITHOUT_OUTPUT = re.compile("(?<=\,)\ *([^\,\ ]+)")
RE_EXTRACT = re.compile("\?P?\<([^\<]+)\>")
RE_STANZA = re.compile("^\s*\[([^\]\[]+)\]")
RE_KEY = re.compile("[\S]+(?= *\=)")
RE_VALUE = re.compile("(?<=\=).+")
RE_COMMENT = re.compile("^\s*\#")
RE_EMPTY = re.compile("^\s*$")
RE_SOURCETYPE = re.compile(" [\(\) ]?sourcetype\ *=\ *[\"|\']?([0-9a-zA-Z_\-\:]+)[\"|\']?")
RE_CONSTRAINTS = re.compile("search\ *=\ *([^\r\n]+)\n?")

class DataModelMatcher(object):
    def __init__(self, TA_path, logger):
        self.TA_path = TA_path
        self.logger = logger
        # self.TA_name = TA_path[TA_path.index("Splunk_TA"): len(TA_path)].replace('/', '')
        self.TA_name = os.path.basename(os.path.normpath(self.TA_path))
        self.conf_path = TA_path + '/default'
        self.tags_path = self.conf_path + '/tags.conf'
        self.props_path = self.conf_path + '/props.conf'
        self.eventtypes_path = self.conf_path + '/eventtypes.conf'
        self.transforms_path = self.conf_path + '/transforms.conf'
        self.lookups_path = TA_path + '/lookups'
        self.tags = {}
        self.eventtypes = {}
        self.expected_models = None
        self.CIM_mapping_results_file = self.TA_name + '-DMMappingResults'
        self.unmatched_tags = []

        self.tags = self.__scan_tags__()
        self.eventtypes = self.__scan_eventtypes__()
        self.transforms = self.__scan_transforms__()
        self.lookups = self.__scan_lookups__()
        # scan all other conf and lookups preparing for props scan
        self.props = self.__scan_props__()

        sourcetypes = self.__eventtypes_to_sourcetypes__()
        self.actual_fields = []
        self.__sourcetypes_to_fields__(sourcetypes)
        self.constraints_comparer = ConstraintsComparer()
        self.expected_dm_overlap = []

    def get_TA_name(self):
        return self.TA_name

    def __eventtypes_to_sourcetypes__(self):
        sourcetypes = []
        for tag_eventtype in self.tags:
            if Constants.TAGS_CONF_SEPC['EVENTTYPE'] not in tag_eventtype['search']:
                continue
            for sourcetype_eventtype in self.eventtypes:
                if tag_eventtype['search']['eventtype'] == sourcetype_eventtype['eventtype']:
                    if 'sourcetype' in sourcetype_eventtype['search'] and sourcetype_eventtype['search']['sourcetype'] not in sourcetypes:
                        sourcetypes.append({'sourcetype': sourcetype_eventtype['search']['sourcetype'], 'eventtype': sourcetype_eventtype['eventtype']})
        return sourcetypes

    def __appendFields__(self, sourcetype, eventtype, fields):
        index_match = -1
        for index, sourcetype_eventtype in enumerate(self.actual_fields):
            if sourcetype_eventtype[Constants.SOURCETYPE] == sourcetype and sourcetype_eventtype[Constants.EVENTTYPE] == eventtype:
                index_match = index
                break
        if index_match == -1:
            index_match == len(self.actual_fields)
            self.actual_fields.append({Constants.SOURCETYPE: sourcetype,
                                        Constants.EVENTTYPE: eventtype,
                                        Constants.FIELDS: []})
        for field in fields:
            found = False
            for existing_field in self.actual_fields[index_match][Constants.FIELDS]:
                if field == existing_field:
                    found = True
                    break
            if not found:
                self.actual_fields[index_match][Constants.FIELDS].append(field)



    def __sourcetypes_to_fields__(self, sourcetypes):
        for eventtype_sourcetype in sourcetypes:
            for prop_sourcetype in self.props:
                if 'sourcetype' not in prop_sourcetype:
                    continue
                # TODO: here needs regular expressions comparison
                for e_sourcetype in eventtype_sourcetype['sourcetype']:
                    eventtype_sourcetype_wildcard = e_sourcetype.find('*')
                    prop_sourcetype_wildcard = prop_sourcetype['sourcetype'].find('*')
                    match = False
                    if eventtype_sourcetype_wildcard < 0 and prop_sourcetype_wildcard < 0:
                        match = (e_sourcetype == prop_sourcetype['sourcetype'])
                    elif eventtype_sourcetype_wildcard >= 0 and prop_sourcetype_wildcard < 0:
                        regex = re.compile(e_sourcetype)
                        match = regex.search(prop_sourcetype['sourcetype']) is not None
                    elif eventtype_sourcetype_wildcard < 0 and prop_sourcetype_wildcard >= 0:
                        regex = re.compile(prop_sourcetype['sourcetype'])
                        match = regex.search(e_sourcetype) is not None
                    else:
                        self.logger.debug("Too complex eventtype definition of " + e_sourcetype['sourcetype'] \
                              +" and too complex sourcetype stanza " + prop_sourcetype['sourcetype'] \
                              + ", not support cases automated generation so far.")

                    if match:
                        self.__appendFields__(sourcetype = prop_sourcetype['sourcetype'],
                                     eventtype = eventtype_sourcetype['eventtype'],
                                     fields = prop_sourcetype['fields'])

    def __scan_props__(self):
        fo = open(self.props_path)
        line_no = -1
        ret_list = []
        for line in fo.readlines():
            if RE_COMMENT.findall(line) or RE_EMPTY.findall(line):
                continue
            elif RE_STANZA.findall(line):
                line_no += 1
                is_sourcetype = True
                for key, value in Constants.PROPS_CONF_SPEC_STANZA.items():
                    if value == Constants.PROPS_CONF_SPEC_STANZA['CONNECTOR']:
                        continue
                    if value == Constants.PROPS_CONF_SPEC_STANZA['SOURCETYPE']:
                        continue
                    prefix_index = line[1:].find(value+Constants.PROPS_CONF_SPEC_STANZA['CONNECTOR'])
                    if prefix_index > -1:
                        ret_list.append({value: line[1+len(value)+len(Constants.PROPS_CONF_SPEC_STANZA['CONNECTOR']):len(line)-2]})
                        is_sourcetype = False
                        break
                if is_sourcetype:
                    raw = re.compile("\[(.*)\]").findall(line)[0]
                    std = re.sub("(?<!\\\)\*", ".*", raw)
                    ret_list.append({Constants.PROPS_CONF_SPEC_STANZA['SOURCETYPE']: std})
            else :
                if not 'fields' in ret_list[line_no]:
                    ret_list[line_no]['fields'] = []
                regex_matched = False
                re_fields = []
                if line.find(Constants.PROPS_CONF_SPEC_OPERATION['RENAME']) > -1:
                    ret_list.pop()
                    line_no -= 1
                    continue
                elif line.find(Constants.PROPS_CONF_SPEC_OPERATION['FIELDALIAS']) > -1:
                    regex_matched = True
                    re_fields = RE_AS.findall(line)
                elif line.find(Constants.PROPS_CONF_SPEC_OPERATION['EVAL']) > -1:
                    regex_matched = True
                    re_fields = RE_EVAL.findall(line)
                elif line.find(Constants.PROPS_CONF_SPEC_OPERATION['LOOKUP']) > -1:
                    regex_matched = True
                    outputs = RE_OUTPUT.findall(line)
                    if len(outputs) > 0:
                        re_fields = RE_WITH_OUTPUT.findall(outputs[0])
                    else:
                        str_after_equal = re.compile("\=.*").findall(line)[0]
                        transform, str_fields = re.compile("\=\ *([^\ \,]+)\ +(.*)").findall(str_after_equal)[0]
                        excluded_fields = [re.compile("[^\ \,]+").findall(str_fields)[0]]
                        excluded_fields.extend(RE_WITHOUT_OUTPUT.findall(str_fields))
                        re_fields = []
                        if self.transforms.has_key(transform):
                            content_stanza = self.transforms[transform]
                            # check key "filename"
                            if content_stanza.has_key('filename'):
                                # report all fields in the csv file
                                filename = content_stanza['filename'] = content_stanza['filename'].replace(" ", "")
                                if not os.path.isfile(os.path.join(self.lookups_path, filename)):
                                    self.error("ERROR: Using un-existing lookup file ", content_stanza['filename'])
                                else:
                                    re_fields.extend(self.lookups[content_stanza['filename']]['fields'])
                            elif content_stanza.has_key('FORMAT'):
                                # extract fields in FORMAT value
                                cp_fields = re.compile("(\S+)(?=\:\:\S+)").findall(content_stanza['FORMAT'])
                                if len(cp_fields) > 0:
                                    re_fields.extend(cp_fields)
                                    #TODO: could get field like $1 which needs modification in the generated results
                                else:
                                    re_fields.append(content_stanza['FORMAT'].replace(" ", ""))
                        for field in excluded_fields:
                            re_fields.remove(field)
                elif line.find(Constants.PROPS_CONF_SPEC_OPERATION['EXTRACT']) > -1:
                    regex_matched = True
                    re_fields = RE_EXTRACT.findall(line)
                elif line.find(Constants.PROPS_CONF_SPEC_OPERATION['REPORT']) > -1:
                    if not self.__has_transforms__():
                        continue
                    regex_matched = True
                    regex = re.compile("(?<=\=).*")
                    str_stanzas = regex.findall(line)[0]
                    trans_stanzas = str_stanzas.replace(" ", "").split(",")
                    re_fields = []
                    for stanza in trans_stanzas:
                        if self.transforms.has_key(stanza):
                            content_stanza = self.transforms[stanza]
                            # check key "filename"
                            if content_stanza.has_key('filename'):
                                # report all fields in the csv file
                                filename = content_stanza['filename'] = content_stanza['filename'].replace(" ", "")
                                if not os.path.isfile(os.path.join(self.lookups_path, filename)):
                                    self.logger.error("ERROR: Using un-existing lookup file ", content_stanza['filename'])
                                    continue
                                re_fields.extend(self.lookups[content_stanza['filename']]['fields'])
                            elif content_stanza.has_key('FORMAT'):
                                # extract fields in FORMAT value
                                cp_fields = re.compile("(\S+)(?=\:\:\S+)").findall(content_stanza['FORMAT'])
                                if len(cp_fields) > 0:
                                    re_fields.extend(cp_fields)
                                    #TODO: could get field like $1 which needs modification in the generated results
                                else:
                                    re_fields.append(content_stanza['FORMAT'].replace(" ", ""))
                if regex_matched:
                    ret_list[line_no]['fields'].extend(re_fields)
        return ret_list

    def __has_lookups__(self):
        return True if os.path.isdir(self.lookups_path) else False

    def __scan_lookups__(self):
        if not self.__has_lookups__():
            return
        ret_list = {}
        file_list = os.listdir(self.lookups_path)
        for file_name in file_list:
            if not file_name.endswith(".csv"):
                continue
            fo = open(os.path.join(self.lookups_path,file_name))
            str_fields = fo.readline()
            fields = str_fields.replace(" ", "").replace("\n", "").replace("\r", "").split(",")
            ret_list[file_name] = {"fields": fields}
        return ret_list

    def __has_transforms__(self):
        return True if os.path.isfile(self.transforms_path) else False

    def __scan_transforms__(self):
        if not self.__has_transforms__():
            return
        fo = open(self.transforms_path)
        ret_list = {}
        current_stanza = ""
        for line in fo.readlines():
            if RE_COMMENT.findall(line) or RE_EMPTY.findall(line):
                continue
            array_stanza = RE_STANZA.findall(line)
            if len(array_stanza) > 0:
                stanza = array_stanza[0]
                ret_list[stanza] = {}
                current_stanza = stanza
                continue
            array_key = RE_KEY.findall(line)
            if len(array_key) > 0:
                key = array_key[0]
                value = RE_VALUE.findall(line)
                ret_list[current_stanza][key] = value[0]
        return ret_list

    def __scan_eventtypes__(self):
        fo = open(self.eventtypes_path)
        line_no = -1
        ret_list = []
        for line in fo.readlines():
            if RE_COMMENT.findall(line) or RE_EMPTY.findall(line):
                continue
            elif RE_STANZA.findall(line):
                line_no += 1
                ret_list.append({'eventtype': RE_STANZA.findall(line)[0]})
            else:
                sourcetypes = RE_SOURCETYPE.findall(line)
                constraints = RE_CONSTRAINTS.findall(line)
                sourcetype_count = len(sourcetypes)
                if sourcetype_count > 0:
                    # TODO: should not just choose the last sourcetype, the search could be very complex, such as '(sourcetype="f5_bigip:irule:http" OR sourcetype="f5:bigip:ltm:http:irule")'
                    sourcetype = re.sub("(?<!\\\)\*", ".*", sourcetypes[sourcetype_count-1])
                else:
                    sourcetype = ''
                # the return value should be
                # [{eventtype: <eventtype_value>, sourcetype: <sourcetype_value>, search:{ sourcetype: <sourcetype: <sourcetype_value>, constraints: <constraints_value>}}]

                ret_list[line_no]['sourcetype'] = sourcetypes
                ret_list[line_no]['search'] = {'sourcetype': sourcetypes, 'constraints': constraints[0]}
        return ret_list

    def __scan_tags__(self):
        fo = open(self.tags_path)
        line_no = -1
        ret_list = []
        for line in fo.readlines():
            if RE_COMMENT.findall(line) or RE_EMPTY.findall(line):
                continue
            elif RE_STANZA.findall(line):
                regex = re.compile("\[\s*(\S+)\s*=\s*(\S+)\s*\]")
                if not regex.search(line):
                    self.logger.debug("Invalid pattern found for this line: {0}".format(line))
                    continue
                line_no += 1
                key_value = regex.search(line).groups()
                ret_list.append({'search': {key_value[0]: key_value[1]}})
            else :
                if not 'tags' in ret_list[line_no]:
                    ret_list[line_no]['tags'] = []
                tag_enabled = self.__get_tag__(line)
                if tag_enabled[1] == Constants.ENABLED:
                    ret_list[line_no]['tags'].append('tag=%s' % tag_enabled[0])
                elif not tag_enabled[1] == Constants.DISABLED:
                    raise Exception("Tag definition error in line %s" % line)

        return ret_list

    def __get_tag__(self, string):
        regex_tag_enabled = re.compile("^\s*(\S+)\s*=\s*(\S+)")
        tag_enabled = regex_tag_enabled.search(string).groups()
        return tag_enabled

    def get_expected_models(self, dm_parser):
        if self.expected_models != None:
            return self.expected_models
        expected_models = {}
        for i in self.tags:
            parents = []
            found = False
            for model_key, model in dm_parser.models.items():
                for j in reversed(model.container):
                    for k in j:
                        if k['objectName'].encode() in parents:
                            parents.append(k['parentName'].encode())
                            continue
                        constraints = self.constraints_comparer.compare_td(i['tags'], k['constraints'])
                        if constraints != False:
                            found = True
                            if model_key not in expected_models:
                                expected_models[model_key] = {}
                            fieldNames = []
                            calculationFieldNames = []
                            for field in k['fields']:
                                new_field = field['fieldName'].encode()
                                if not self._field_exist_(fieldNames, new_field):
                                    fieldNames.append(new_field)
                            for calculation in k['calculations']:
                                if "outputFields" not in calculation:
                                    continue
                                for outputField in calculation['outputFields']:
                                    calculationFieldNames.append(outputField['fieldName'].encode())

                            if model_key not in expected_models or k['objectName'].encode() not in expected_models[model_key]:
                                expected_models[model_key][k['objectName'].encode()] = {'searches': [],
                                                                                        'fields': fieldNames+calculationFieldNames,
                                                                                        'constraints': constraints}
                            expected_models[model_key][k['objectName'].encode()]['searches'].append(i['search'])
                            parents.append(k['parentName'].encode())
            if found == False:
                self.unmatched_tags.append(i)

        self.expected_models = expected_models
        return self.expected_models

    def _field_exist_(self, fields, new_field):
        for field in fields:
            if field == new_field:
                return True
        return False

    def get_unused_tags(self):
        return self.unmatched_tags

    def print_unused_tags(self):
        if len(self.unmatched_tags) < 1:
            return
        pvalue = "====================== Unused Tags in tags.conf of " + self.TA_name + " ======================"
        self.__print_to_file__('\n'+pvalue+'\n'*2)
        pvalue = pprint.pformat(self.unmatched_tags)
        self.__print_to_file__(pvalue+'\n')

    def get_actual_fields(self):
        return self.actual_fields

    def print_expected_models(self):
        pvalue = "====================== Data Models of " + self.TA_name + " ======================"
        self.__print_to_file__('\n'+pvalue+'\n'*2, mode='w')
        pvalue = pprint.pformat(self.expected_models)
        self.__print_to_file__(pvalue+'\n')

    def __print_to_file__(self, data, mode='a'):
        with open(self.CIM_mapping_results_file, mode) as f:
            f.write(data)

    def _check_dm_pair_record(self, dmo, dmo_1, record):
        ret = False
        if dmo['dataModel'] == dmo_1['dataModel']:
            ret = True
        else:
            for i in record:
                if dmo['objectName'] == i[0] and dmo_1['objectName'] == i[1] or \
                   dmo['objectName'] == i[1] and dmo_1['objectName'] == i[0]:
                    ret = True
                    break
            if ret == False:
                record.append((dmo['objectName'], dmo_1['objectName']))
        return ret


    def get_expected_dm_obj_overlap(self, dm_overlap):
        if self.expected_dm_overlap:
            return self.expected_dm_overlap
        flat_expected_models = self._flat_expected_models()
        expected_model_pairs = []
        record = []
        ret = []
        for dmo in flat_expected_models:
            for dmo_1 in flat_expected_models:
                if self._check_dm_pair_record(dmo, dmo_1, record):
                    continue
                expected_model_pairs.append((dmo, dmo_1))

        for do in dm_overlap:
            for emp in expected_model_pairs:
                if not (do[0]['dataModel'] == emp[0]['dataModel'] and do[1]['dataModel'] == emp[1]['dataModel']) and \
                   not (do[1]['dataModel'] == emp[0]['dataModel'] and do[0]['dataModel'] == emp[1]['dataModel']):
                    continue
                if (do[0]['objectName'] == emp[0]['objectName'] and do[1]['objectName'] == emp[1]['objectName']) or \
                   (do[1]['objectName'] == emp[0]['objectName'] and do[0]['objectName'] == emp[1]['objectName']):
                    ret.append(emp)
        self.expected_dm_overlap = ret
        return self.expected_dm_overlap

    def _flat_expected_models(self):
        ret = []
        for dm_name, dm in self.expected_models.items():
            for dmo_name, dmo in dm.items():
                obj = {'objectName': dmo_name, 'dataModel': dm_name}
                obj.update(dmo)
                ret.append((obj))
        return ret


    def print_dm_overlap(self, dm_overlap):
        expected_dm_overlap = self.get_expected_dm_obj_overlap(dm_overlap)
        buff = '\n====================== Data Model Overlap Based on Tag Attachment ======================\n'
        dmp_name = ''
        for dmp in expected_dm_overlap:
            temp_dmp_name = '{} vs {}'.format(dmp[0]['dataModel'], dmp[1]['dataModel'])
            if dmp_name != temp_dmp_name:
                buff += (1 + len(temp_dmp_name))*"=" + '\n'
                buff += 'Data Model Conflict\n{}\n'.format(temp_dmp_name)
                buff += (1 + len(temp_dmp_name))*"=" + '\n'
                dmp_name = temp_dmp_name
            buff += 'OBJECTS:\n  {} vs {}\nCONSTRAINTS:\n  {} vs {}\n'.format(dmp[0]['objectName'], dmp[1]['objectName'], \
                            dmp[0]['constraints'], dmp[1]['constraints'])
            buff += 'FIELDS:\n'
            for field in dmp[0]['fields']:
                for field_1 in dmp[1]['fields']:
                    if field == field_1:
                        buff += '  {}\n'.format(field)
                        break
            buff += '\n'
        self.__print_to_file__(buff)
        print buff