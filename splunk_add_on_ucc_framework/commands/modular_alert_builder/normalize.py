#
# Copyright 2023 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import copy
from typing import Any, Dict, List

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
    "name": "short_name",
}

mapping_values = {
    "singleSelect": "dropdownlist",
    "singleSelectSplunkSearch": "dropdownlist_splunk_search",
}


def convert_list_to_dict(value_list: List[Any]) -> Dict[str, Any]:
    return_list = {}
    for each_dict in value_list:
        return_list[each_dict["label"]] = each_dict["value"]
    return return_list


def transform_params(parameter_list: List[Any]) -> None:
    for param in parameter_list:
        if param["format_type"] in ["dropdownlist", "radio"]:
            options = param.pop("options")
            param["possible_values"] = convert_list_to_dict(options["items"])
        elif param["format_type"] == "dropdownlist_splunk_search":
            value_field = param.pop("value-field")
            label_field = param.pop("label-field")
            search = param.pop("search")
            param["ctrl_props"] = {
                "value-field": value_field,
                "label-field": label_field,
                "search": search,
            }
            try:
                # `options` field is optional for `dropdownlist_splunk_search`
                # type.
                options = param.pop("options")
            except KeyError:
                options = None
            if options is not None:
                earliest_time = None
                latest_time = None
                options_items = options.get("items")
                for item in options_items:
                    if item.get("label") == "earliest":
                        earliest_time = item.get("value")
                    if item.get("label") == "latest":
                        latest_time = item.get("value")
                if earliest_time is not None:
                    param["ctrl_props"]["earliest"] = earliest_time
                if latest_time is not None:
                    param["ctrl_props"]["latest"] = latest_time


def iterdict(dictionary: Dict[str, Any], result: Dict[str, Any]) -> None:
    """
    This function replaces key and value with the ones required by add-on alert builder
    """
    for key in dictionary:
        if key in mapping_keys:
            value = result.pop(key)
            result[mapping_keys[key]] = value
            mapped_key = mapping_keys[key]
        else:
            mapped_key = key

        if isinstance(dictionary[key], dict):
            iterdict(dictionary[key], result[mapped_key])
        elif isinstance(dictionary[key], list):
            for dictionary_item, result_item in zip(
                dictionary[key], result[mapped_key]
            ):
                if isinstance(dictionary_item, dict):
                    iterdict(dictionary_item, result_item)
        else:
            if result[mapped_key] in mapping_values:
                result[mapped_key] = mapping_values[result[mapped_key]]


def normalize(
    original_schema_content: List[Dict[str, Any]], short_name: str
) -> Dict[str, Any]:
    """
    Process the globalConfig alert schema to generate structure required by add-on alert generator
    """
    schema_content = {
        "alerts": original_schema_content,
    }
    result = copy.deepcopy(schema_content)
    iterdict(schema_content, result)
    for alert in result["alerts"]:
        transform_params(alert["parameters"])
    return {
        "short_name": short_name,
        "schema.content": {
            "short_name": short_name,
            "modular_alerts": result["alerts"],
        },
    }
