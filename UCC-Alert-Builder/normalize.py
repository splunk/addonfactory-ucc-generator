from builtins import zip
import json
import sys
import copy
import itertools

mapping_keys = {
    "activeResponse": "active_response",
    "supportsAdhoc": "supports_adhoc",
    "drilldownUri": "drilldown_uri",
    "entity": "parameters",
    "defaultValue": "default_value",
    "help": "help_string",
    "field": "name",
    "type": "format_type",
    "valueField": "value-field",
    "labelField": "label-field",
    "name": "short_name"
}

mapping_values = {
    "singleSelect": "dropdownlist",
    "singleSelectSplunkSearch": "dropdownlist_splunk_search"
}


def convert_list_to_dict(value_list):
    return_list = {}
    for each_dict in value_list:
        return_list[each_dict["label"]] = each_dict["value"]
    return return_list


def transform_params(parameter_list):
    for param in parameter_list:
        if param["format_type"] in ["dropdownlist", "radio"]:
            a = param.pop("options")
            param["possible_values"] = convert_list_to_dict(a["items"])
        elif param["format_type"] == "dropdownlist_splunk_search":
            value_field = param.pop("value-field")
            label_field = param.pop("label-field")
            search = param.pop("search")
            param["ctrl_props"] = {
                'value-field': value_field,
                'label-field': label_field,
                'search': search
            }


def iterdict(dictionary, result):
    '''
    This function replaces key and value with the ones required by add-on alert builder
    '''
    for key in dictionary:
        if key in mapping_keys:
            value = result.pop(key)
            if sys.version_info > (3, 0):
                result[mapping_keys[key]] = value.encode(
                    'ascii', 'ignore') if isinstance(value, str) else value
            else:
                result[mapping_keys[key]] = value.encode(
                    'ascii', 'ignore') if isinstance(value, unicode) else value
            mapped_key = mapping_keys[key]
        else:
            mapped_key = key

        if isinstance(dictionary[key], dict):
            iterdict(dictionary[key], result[mapped_key])
        elif isinstance(dictionary[key], list):
            for dictionary_item, result_item in zip(dictionary[key], result[mapped_key]):
                if isinstance(dictionary_item, dict):
                    iterdict(dictionary_item, result_item)
        else:
            if result[mapped_key] in mapping_values:
                result[mapped_key] = mapping_values[result[mapped_key]]


def form_main_dict(alert, product_id, short_name):
    '''
    Forms the final dictionary required by add-on alert generator
    '''
    return {
        "product_id": product_id,
        "short_name": short_name,
        "global_settings": "",
        "html_setting": None,
        "build_components": {
            "conf": "True",
            "py": "True",
            "html": "True"
        },
        "schema.content": {
            "product_id": product_id,
            "short_name": short_name,
            "modular_alerts": alert
        }
    }


def normalize(schema_content, product_id, short_name):
    '''
    Process the globalConfig alert schema to generate structure required by add-on alert generator
    '''
    result = copy.deepcopy(schema_content)
    iterdict(schema_content, result)
    for alert in result["alerts"]:
        transform_params(alert["parameters"])
    return form_main_dict(result["alerts"], product_id, short_name)
