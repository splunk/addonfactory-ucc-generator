__author__ = "Zimo"

import Constants



class FieldsComparer(object):
    def __init__(self, actual_fields, expected_models, TA_path, TA_name, logger):
        self.actual_fields = actual_fields
        self.expected_models = expected_models
        self.TA_name = TA_name
        self.CIM_fields_usage = self.TA_name + "-DMFieldsUsage"
        self.TA_path = TA_path
        self.logger = logger
        self.excluded_fields = {}
        self.actualInExpectedBySourcetype = {}

        self.__sort_actual_fields__()
        self.__sort_expected_fields__()
        self.__prepare_actual_fields_record__()

    def __prepare_actual_fields_record__(self):
        for item in self.actual_fields:
            item["actualInExpected"] = []
            for i in range(0, len(item[Constants.FIELDS])):
                item["actualInExpected"].append(False)

    def compare_fields(self):
        pvalue = "\n**DM Fields Usage in \""+self.TA_path+"\"**\n\n"
        print pvalue
        self.__print_to_file__(pvalue, mode='w')

        for model_key, model in self.expected_models.items():
            for model_obj_key, model_obj in model.items():
                for search in model_obj[Constants.SEARCHES]:
                    actual_indexes = self.__match_eventtype__(search)
                    for actual_index in actual_indexes:
                        self.__print_comparison_title__(eventtype=self.actual_fields[actual_index][Constants.EVENTTYPE],
                                                         sourcetype=self.actual_fields[actual_index][Constants.SOURCETYPE],
                                                         model_obj=model_obj_key,
                                                         model=model_key)
                        exclude_fields = self.__print_fields_comparison__(actual_fields=self.actual_fields[actual_index][Constants.FIELDS],
                                                         expected_fields=model_obj[Constants.FIELDS],
                                                         index_eventtype=actual_index)
                        if model_key not in self.excluded_fields:
                            self.excluded_fields[model_key] = {}
                        if model_obj_key not in self.excluded_fields[model_key]:
                            self.excluded_fields[model_key][model_obj_key] = []
                        exclude_item = {'search': search, 'exclude': exclude_fields}
                        self.excluded_fields[model_key][model_obj_key].append(exclude_item)

        self.logger.info("Fields comparing done")

    def get_excluded_fields(self):
        return self.excluded_fields

    def __sort_expected_fields__(self):
        for model_key, model in self.expected_models.items():
            for model_obj_key, model_obj in model.items():
                if Constants.FIELDS not in model_obj:
                    continue
                model_obj[Constants.FIELDS].sort()

    def __sort_actual_fields__(self):
        for item in self.actual_fields:
            if Constants.FIELDS not in item:
                continue
            item[Constants.FIELDS].sort()

    def __print_comparison_title__(self, eventtype, sourcetype, model_obj, model):
        length = max(len("Eventtype: "+eventtype),len("Sourcetype: "+sourcetype),
                     len("Data Model Object: "+model_obj), len("Data Model: "+model))
        pvalue = ("="*length+"\n"
                  "Data Model: "+model+"\n"
                  "Data Model Object: "+model_obj+"\n"
                  "Sourcetype: "+sourcetype+"\n"
                  "Eventtype: "+ eventtype+"\n"+"="*length+"\n"+' '*39
                +"Actual Fields          |          Expected Fields"+"\n"+(" "*39)+"-"*23+"|"+ "-"*25+"\n"
        )

        print pvalue
        self.__print_to_file__(pvalue)

    def __record_field_using__(self, index_field, index_eventtype):
        sourcetype = self.actual_fields[index_eventtype][Constants.SOURCETYPE]
        if sourcetype not in self.actualInExpectedBySourcetype:
            self.actualInExpectedBySourcetype[sourcetype] \
                = {'records': self.actual_fields[index_eventtype]["actualInExpected"],
                   'fields': self.actual_fields[index_eventtype][Constants.FIELDS]}


        self.actual_fields[index_eventtype]["actualInExpected"][index_field] = True
        self.actualInExpectedBySourcetype[sourcetype]['records'][index_field] = True

    def __print_fields_comparison__(self, actual_fields, expected_fields, index_eventtype):
        len_actual =len(actual_fields)
        len_expected = len(expected_fields)
        length = len_actual + len_expected
        index_actual = 0
        index_expected = 0
        exclude = []
        for index in range(0,length):
            actual_field = actual_fields[index_actual] if index_actual < len_actual else Constants.BIGGER_STRING
            expected_field = expected_fields[index_expected] if index_expected < len_expected else Constants.BIGGER_STRING

            if actual_field == expected_field:
                if actual_field == Constants.BIGGER_STRING:
                    break
                pvalue = (Constants.PRINT_SPACE*(Constants.FIELDS_LENGTH-len(actual_field)) + actual_field
                          +Constants.CONNECTOR_EQUAL + expected_field)
                print pvalue
                self.__print_to_file__(pvalue+'\n')

                self.__record_field_using__(index_field=index_actual, index_eventtype=index_eventtype)
                index_actual += 1
                index_expected += 1
            elif actual_field < expected_field:
                pvalue = Constants.PRINT_SPACE*(Constants.FIELDS_LENGTH-len(actual_field)) + actual_field
                print pvalue
                self.__print_to_file__(pvalue+'\n')
                index_actual += 1
            else:
                pvalue = Constants.PRINT_SPACE*(Constants.FIELDS_LENGTH+5) + expected_field
                print pvalue
                self.__print_to_file__(pvalue+'\n')
                exclude.append(expected_field)
                index_expected += 1
        return exclude

    def __has_unfound_fields__(self, records):
        ret = False
        for record in records:
            if record == False:
                ret = True
                break
        return ret

    def print_none_model_fields(self):
        for key, value in self.actualInExpectedBySourcetype.items():
            if not self.__has_unfound_fields__(value['records']) == True:
                continue
            self.__print_sourcetype__(key)
            for index_record, record in enumerate(value['records']):
                if record == False:
                    print value[Constants.FIELDS][index_record]
                    self.__print_to_file__(value[Constants.FIELDS][index_record]+'\n')
            print ""
            self.__print_to_file__('\n')

        # for item in self.actual_fields:
        #     if not self.__has_unfound_fields__(item["actualInExpected"]) == True:
        #         continue
        #     self.__print_sourcetype_eventtype__(item[Constants.EVENTTYPE], item[Constants.SOURCETYPE])
        #     for index_record, record in enumerate(item["actualInExpected"]):
        #         if record == False:
        #             print item[Constants.FIELDS][index_record]
        #             self.__print_to_file__(item[Constants.FIELDS][index_record]+'\n')
        #     print ""
        #     self.__print_to_file__('\n')

    def __print_sourcetype__(self, sourcetype):
        length = len("Sourcetype: "+sourcetype)
        pvalue = ("="*length+"\n"
                  "Actual NOT in Expected Fields"+"\n"
                  "Sourcetype: "+sourcetype+"\n"+"="*length+"\n"
        )
        print pvalue
        self.__print_to_file__(pvalue)

    def __print_sourcetype_eventtype__(self, eventtype, sourcetype):
        length = max(len("Eventtype: "+eventtype),len("Sourcetype: "+sourcetype))
        pvalue = ("="*length+"\n"
                  "Actual NOT in Expected Fields"+"\n"
                  "Sourcetype: "+sourcetype+"\n"
                  "Eventtype: "+ eventtype+"\n"+"="*length+"\n"
        )
        print pvalue
        self.__print_to_file__(pvalue)

    def __print_to_file__(self, data, mode="a"):
        with open(self.CIM_fields_usage, mode) as f:
            f.write(data)

    def __match_eventtype__(self, search):
        indexes = []
        for index, item in enumerate(self.actual_fields):
            if Constants.EVENTTYPE not in item or Constants.EVENTTYPE not in search:
                continue
            if item[Constants.EVENTTYPE] == search[Constants.EVENTTYPE]:
                indexes.append(index)
        return indexes


