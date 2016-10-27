import {normalEscape, mappingServiceName} from 'app/util/format';
import {sortAlphabetical, sortNumerical} from 'app/util/sort';

/*global define,window*/
define([
    'lodash',
    'app/views/controls/TextDisplayControl',
    'views/shared/controls/TextControl',
    'app/views/controls/SingleInputControl',
    'app/views/controls/SingleInputControlEx',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/shared/controls/SyntheticRadioControl',
    'app/views/controls/MultiSelectInputControl',
    'app/models/Input',
    'app/models/Account',
    'app/collections/Inputs'
], function (
    _,
    TextDisplayControl,
    TextControl,
    SingleInputControl,
    SingleInputControlEx,
    SyntheticCheckboxControl,
    SyntheticRadioControl,
    MultiSelectInputControl,
    Input,
    Account,
    Inputs
) {
    return {
        "input": {
           "title": "Input",
           "caption": {
               title: "Inputs",
               description: 'Create data inputs to collect falcon host data from CrowdStrike.',
               enableButton: true,
               singleInput: true,
               buttonId: "addInputBtn",
               buttonValue: "Create New Input",
               enableHr: true
           },
           generateSortHandler: (stateModel) => {
               var sort_dir = stateModel.get('sortDirection'),
                   sort_key = stateModel.get('sortKey');

               return {
                   'name': (a, b) => sortAlphabetical(a.entry.get(sort_key), b.entry.get(sort_key), sort_dir),
                   'index': (a, b) => sortAlphabetical(a.entry.content.get(sort_key), b.entry.content.get(sort_key), sort_dir),
                   'interval': (a, b) => sortNumerical(a.entry.content.get(sort_key), b.entry.content.get(sort_key), sort_dir),
                   'disabled': function (a, b) {
                       var textA = a.entry.content.get('disabled') ? 1 : 0,
                           textB = b.entry.content.get('disabled') ? 1 : 0;
                       if (sort_dir === 'asc') {
                           return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                       }
                       return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                   },
                   'service': function (a, b) {
                       var textA = mappingServiceName(a.id);
                           textB = mappingServiceName(b.id);
                       if (sort_dir === 'asc') {
                           return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                       }
                       return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                   }
               };
           },
           "header": [
               {
                   "field": "name",
                   "label": "Name",
                   "sort": true,
                   mapping: normalEscape
               },
               {
                   "field": "service",
                   "label": "Service",
                   "sort": true,
                   mapping: model => mappingServiceName(model.id)
               },
                {
                   "field": "account",
                   "label": "Account",
                   "sort":true,
                   mapping: normalEscape
               },
               {
                   "field": "interval",
                   "label": "Interval",
                   "sort": true,
                   mapping: normalEscape
               },
               {
                   "field": "index",
                   "label": "Index",
                   "sort": true,
                   mapping: normalEscape
               },
               {
                   "field": "disabled",
                   "label": "Status",
                   "sort": true,
                   mapping: function (field) {
                       return field ? "Disabled" : "Enabled";
                   }
               }
           ],
           "moreInfo": [
               {
                   "field": "name",
                   "label": "Name",
                   mapping: normalEscape
               },
               {
                   "field": "account",
                   "label": "Account",
                   mapping: normalEscape
               },
               {
                   "field": "start_offset",
                   "label": "Start Offset",
                   mapping: normalEscape
               },
               // Common fields
               {
                   "field": "interval",
                   "label": "Interval",
                   mapping: normalEscape
               },
               {
                   "field": "index",
                   "label": "Index",
                   mapping: normalEscape
               },
               {
                   "field": "disabled",
                   "label": "Status",
                   mapping: function (field) {
                       return field ? "Disabled" : "Enabled";
                   }
               }
           ],
           "services": {
               "input": {
                   "title": "Falcon Host",
                   "model": Input,
                   "url": "",
                   "collection": Inputs,
                   "entity": [
                       {
                           "field": "name",
                           "label": "Name",
                           "type": TextControl,
                           "required": true,
                           "help": "Enter a unique name for each crowdstrike falcon host data input."
                       },
                       {
                           "field": "account",
                           "label": "Account",
                           "type": SingleInputControl,
                           "required": true,
                           "options": {}
                       },
                       {
                           "field": "start_offset",
                           "label": "Start Offset",
                           "type": TextControl,
                           "required": true,
                           "defaultValue": "0"
                       },
                       {
                           "field": "interval",
                           "label": "Interval",
                           "type": TextControl,
                           "required": true,
                           "defaultValue": "60",
                           "help": "Time interval of input in seconds."
                       },
                       {
                           "field": "index",
                           "label": "Index",
                           "type": SingleInputControlEx,
                           "required": true,
                           "defaultValue": "default"
                       }
                   ],
                   "actions": [
                       "edit",
                       "delete",
                       "enable",
                       "clone"
                   ]
               }
           },
           filters: [
               {key: 'name'},
               {key: 'service', mapping: d => mappingServiceName(d.id)},
               {key: 'account'},
               {key: 'url'},
               {key: 'start_offset'},
               {key: 'index'},
               {key: 'interval'},
               {key: 'status', mapping: d => d.entry.content.get('disabled') ? 'Disabled' : 'Enabled'}
           ]
        },
        "account": {
            "model": Account,
            "title": "Crowdstrike Account",
            "header": [
                {
                    "field": "name",
                    "label": "Name",
                    "sort": true,
                    mapping: normalEscape
                },
                {
                    "field": "endpoint",
                    "label": "Endpoint",
                    "sort": true,
                    mapping: normalEscape
                },
                {
                    "field": "api_uuid",
                    "label": "API UUID",
                    "sort": true,
                    mapping: normalEscape
                }
            ],
            "entity": [
                {
                    "field": "name",
                    "label": "Name",
                    "type": TextControl,
                    "required": true,
                    "help": "Enter a unique name for each Crowdstrike falcon host account."
                },
                {
                    "field": "endpoint",
                    "label": "Endpoint",
                    "type": TextControl,
                    "required": true,
                    "defaultValue":"https://firehose.crowdstrike.com/sensors/entities/datafeed/v1",
                    "options": {
                        "enabled": false,
                        "placeholder": "https://firehose.crowdstrike.com/sensors/entities/datafeed/v1"
                    }
                },
                {
                    "field": "api_uuid",
                    "label": "API UUID",
                    "type": TextControl,
                    "required": true
                },
                {
                    "field": "api_key",
                    "label": "API Key",
                    "type": TextControl,
                    "required": true,
                    "encrypted": true
                }
            ],
            "refLogic": function (model, refModel) {
                return model.entry.attributes.name === refModel.entry.content.attributes.server;
            },
            "actions": [
                "edit",
                "delete",
                "clone"
            ],
            "tag": "server"
        },

        "proxy": {
            "title": "Proxy",
            "entity": [
                {"field": "proxy_enabled", "label": "Enable", "type": "checkbox"},
                {
                    "field": "proxy_type",
                    "label": "Proxy Type",
                    "type": "singleSelect",
                    "options": {
                        "disableSearch": true,
                        "autoCompleteFields": [
                            {"label": "http", "value": "http"},
                            {"label": "socks4", "value": "socks4"},
                            {"label": "socks5", "value": "socks5"}
                        ]
                    },
                    "defaultValue": "http"
                },
                {"field": "proxy_url", "label": "Host", "type": "text"},
                {"field": "proxy_port", "label": "Port", "type": "text"},
                {"field": "proxy_username", "label": "Username", "type": "text"},
                {
                    "field": "proxy_password",
                    "label": "Password",
                    "type": "text",
                    "encrypted": true,
                    "associated": "username"
                }
            ]
        },
        "logging": {
            "entity": [
                {
                    "field": "loglevel",
                    "label": "Log Level",
                    "type": "singleSelect",
                    "options": {
                        "disableSearch": true,
                        "autoCompleteFields": [
                            {"label": "INFO", "value": "INFO"},
                            {"label": "DEBUG", "value": "DEBUG"},
                            {"label": "ERROR", "value": "ERROR"}
                        ]
                    },
                    "defaultValue": "INFO"
                }
            ]
        }
    };
});
