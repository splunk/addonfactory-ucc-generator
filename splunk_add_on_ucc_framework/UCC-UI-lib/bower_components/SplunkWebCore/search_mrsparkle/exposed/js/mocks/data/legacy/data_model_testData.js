/**
 * @author jszeto
 * @date 8/2/12
 */
define(function() {
    return (
    {
        "links": {
            "create": "/servicesNS/nobody/search/admin/datamodeleai/_new",
            "desc": "/servicesNS/nobody/search/admin/datamodeleai/desc",
            "report": "/servicesNS/nobody/search/admin/datamodeleai/report"
        },
        "origin": "https://127.0.0.1:9089/servicesNS/nobody/search/admin/datamodeleai",
        "updated": "2013-06-20T16:26:58-07:00",
        "generator": {
            "build": "167502",
            "version": "20130613"
        },
        "entry": [
            {
                "name": "TestDebugger",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/search/admin/datamodeleai/TestDebugger",
                "updated": "2013-06-20T16:26:58-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/search/admin/datamodeleai/TestDebugger",
                    "list": "/servicesNS/nobody/search/admin/datamodeleai/TestDebugger",
                    "edit": "/servicesNS/nobody/search/admin/datamodeleai/TestDebugger",
                    "remove": "/servicesNS/nobody/search/admin/datamodeleai/TestDebugger"
                },
                "author": "nobody",
                "acl": {
                    "app": "search",
                    "can_change_perms": true,
                    "can_list": true,
                    "can_share_app": true,
                    "can_share_global": true,
                    "can_share_user": false,
                    "can_write": true,
                    "modifiable": true,
                    "owner": "nobody",
                    "perms": {
                        "read": [
                            "*"
                        ],
                        "write": [
                            "admin",
                            "power"
                        ]
                    },
                    "removable": false,
                    "sharing": "app"
                },
                "fields": {
                    "required": [],
                    "optional": [
                        "acceleration",
                        "concise",
                        "description",
                        "provisional"
                    ],
                    "wildcard": []
                },
                "content": {
                    "modelName": "TestDebugger",
                    "displayName": "TestDebugger",
                    "objectSummary": {
                        "Transaction-Based": 0,
                        "Interfaces": 0,
                        "Interface Implementations": 0,
                        "Event-Based": 2,
                        "Search-Based": 0
                    },
                    "objects": [
                        {
                            "objectName": "RootObject_1",
                            "children": [
                                "RootObject_2"
                            ],
                            "objectSearch": " | search  (index = _internal) | rename \"status\" AS \"RootObject_1.status\", \"test_boolean\" AS \"RootObject_1.test_boolean\", \"test_hidden\" AS \"RootObject_1.test_hidden\", \"month\" AS \"RootObject_1.month\", \"year\" AS \"RootObject_1.year\", \"is_RootObject_2\" AS \"RootObject_1.is_RootObject_2\", \"is_not_RootObject_2\" AS \"RootObject_1.is_not_RootObject_2\" | rename \"RootObject_1.status\" AS \"status\", \"RootObject_1.test_boolean\" AS \"test_boolean\", \"RootObject_1.test_hidden\" AS \"test_hidden\", \"RootObject_1.month\" AS \"month\", \"RootObject_1.year\" AS \"year\", \"RootObject_1.is_RootObject_2\" AS \"is_RootObject_2\", \"RootObject_1.is_not_RootObject_2\" AS \"is_not_RootObject_2\" | search source=* status=*  | rex field=_time \"^(?<year>)-(?<month>)-\" max_match=1 | eval \"is_RootObject_2\"=if(searchmatch(\"   (eventtype = splunkd-access) \"),1,0) | eval \"is_not_RootObject_2\"=if(searchmatch(\"NOT(    (eventtype = splunkd-access) )\"),1,0) | rename \"status\" AS \"RootObject_1.status\", \"test_boolean\" AS \"RootObject_1.test_boolean\", \"test_hidden\" AS \"RootObject_1.test_hidden\", \"month\" AS \"RootObject_1.month\", \"year\" AS \"RootObject_1.year\", \"is_RootObject_2\" AS \"RootObject_1.is_RootObject_2\", \"is_not_RootObject_2\" AS \"RootObject_1.is_not_RootObject_2\" | fields \"_time\", \"host\", \"sourcetype\", \"source\", \"RootObject_1.status\", \"RootObject_1.test_boolean\", \"RootObject_1.test_hidden\", \"RootObject_1.month\", \"RootObject_1.year\", \"RootObject_1.is_RootObject_2\", \"RootObject_1.is_not_RootObject_2\"",
                            "parentName": "BaseEvent",
                            "autoextractSearch": " (index = _internal) ",
                            "fields": [
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "_time",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": false,
                                    "displayName": "_time",
                                    "type": "timestamp",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "host",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": false,
                                    "displayName": "host",
                                    "type": "string",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "sourcetype",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": false,
                                    "displayName": "sourcetype",
                                    "type": "string",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "fieldSearch": "source=* ",
                                    "multivalue": false,
                                    "required": true,
                                    "fieldName": "source",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": true,
                                    "displayName": "source",
                                    "type": "string",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "fieldSearch": "status=* ",
                                    "multivalue": false,
                                    "required": true,
                                    "fieldName": "status",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": true,
                                    "displayName": "status",
                                    "type": "number",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "test_boolean",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": true,
                                    "displayName": "test_boolean",
                                    "type": "boolean",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "test_hidden",
                                    "hidden": true,
                                    "comment": "",
                                    "editable": true,
                                    "displayName": "test_hidden",
                                    "type": "string",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "RootObject_1",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": false,
                                    "displayName": "RootObject_1",
                                    "type": "objectCount",
                                    "owner": "RootObject_1"
                                }
                            ],
                            "objectSearchNoFields": " | search  (index = _internal) | rename \"status\" AS \"RootObject_1.status\", \"test_boolean\" AS \"RootObject_1.test_boolean\", \"test_hidden\" AS \"RootObject_1.test_hidden\", \"month\" AS \"RootObject_1.month\", \"year\" AS \"RootObject_1.year\", \"is_RootObject_2\" AS \"RootObject_1.is_RootObject_2\", \"is_not_RootObject_2\" AS \"RootObject_1.is_not_RootObject_2\" | rename \"RootObject_1.status\" AS \"status\", \"RootObject_1.test_boolean\" AS \"test_boolean\", \"RootObject_1.test_hidden\" AS \"test_hidden\", \"RootObject_1.month\" AS \"month\", \"RootObject_1.year\" AS \"year\", \"RootObject_1.is_RootObject_2\" AS \"is_RootObject_2\", \"RootObject_1.is_not_RootObject_2\" AS \"is_not_RootObject_2\" | search source=* status=*  | rex field=_time \"^(?<year>)-(?<month>)-\" max_match=1 | eval \"is_RootObject_2\"=if(searchmatch(\"   (eventtype = splunkd-access) \"),1,0) | eval \"is_not_RootObject_2\"=if(searchmatch(\"NOT(    (eventtype = splunkd-access) )\"),1,0) | rename \"status\" AS \"RootObject_1.status\", \"test_boolean\" AS \"RootObject_1.test_boolean\", \"test_hidden\" AS \"RootObject_1.test_hidden\", \"month\" AS \"RootObject_1.month\", \"year\" AS \"RootObject_1.year\", \"is_RootObject_2\" AS \"RootObject_1.is_RootObject_2\", \"is_not_RootObject_2\" AS \"RootObject_1.is_not_RootObject_2\"",
                            "displayName": "RootObject_1",
                            "tsidxNamespace": "datamodel=\"TestDebugger\"",
                            "calculations": [
                                {
                                    "calculationID": "6345b45bda06d5b1f6dd6ab7a464e2fb",
                                    "inputField": "_time",
                                    "expression": "^(?<year>)-(?<month>)-",
                                    "calculationType": "Rex",
                                    "editable": true,
                                    "comment": "",
                                    "outputFields": [
                                        {
                                            "fieldSearch": "",
                                            "multivalue": false,
                                            "required": false,
                                            "fieldName": "month",
                                            "hidden": true,
                                            "comment": "",
                                            "editable": true,
                                            "displayName": "month",
                                            "type": "string",
                                            "owner": "RootObject_1"
                                        },
                                        {
                                            "fieldSearch": "",
                                            "multivalue": false,
                                            "required": false,
                                            "fieldName": "year",
                                            "hidden": false,
                                            "comment": "",
                                            "editable": true,
                                            "displayName": "year",
                                            "type": "string",
                                            "owner": "RootObject_1"
                                        }
                                    ],
                                    "owner": "RootObject_1"
                                },
                                {
                                    "calculationID": "b7dba9dd199fc3fadc1498dcdb97b6af",
                                    "expression": "if(searchmatch(\"   (eventtype = splunkd-access) \"),1,0)",
                                    "calculationType": "Eval",
                                    "editable": false,
                                    "comment": "",
                                    "outputFields": [
                                        {
                                            "fieldSearch": "",
                                            "multivalue": false,
                                            "required": false,
                                            "fieldName": "is_RootObject_2",
                                            "hidden": false,
                                            "comment": "",
                                            "editable": false,
                                            "displayName": "is_RootObject_2",
                                            "type": "childCount",
                                            "owner": "RootObject_1"
                                        }
                                    ],
                                    "owner": "RootObject_1"
                                },
                                {
                                    "calculationID": "536888f27682da8449b79a15cd6f4361",
                                    "expression": "if(searchmatch(\"NOT(    (eventtype = splunkd-access) )\"),1,0)",
                                    "calculationType": "Eval",
                                    "editable": false,
                                    "comment": "",
                                    "outputFields": [
                                        {
                                            "fieldSearch": "",
                                            "multivalue": false,
                                            "required": false,
                                            "fieldName": "is_not_RootObject_2",
                                            "hidden": false,
                                            "comment": "",
                                            "editable": false,
                                            "displayName": "is_not_RootObject_2",
                                            "type": "childCount",
                                            "owner": "RootObject_1"
                                        }
                                    ],
                                    "owner": "RootObject_1"
                                }
                            ],
                            "constraints": [
                                {
                                    "owner": "RootObject_1",
                                    "search": "index = _internal"
                                }
                            ],
                            "comment": "",
                            "previewSearch": " | search  (index = _internal)  source=* status=*  | rex field=_time \"^(?<year>)-(?<month>)-\" max_match=1",
                            "lineage": "RootObject_1"
                        },
                        {
                            "objectName": "RootObject_2",
                            "children": [],
                            "objectSearch": " | search  (index = _internal) | rename \"status\" AS \"RootObject_1.status\", \"test_boolean\" AS \"RootObject_1.test_boolean\", \"test_hidden\" AS \"RootObject_1.test_hidden\", \"clientip\" AS \"RootObject_1.RootObject_2.clientip\", \"month\" AS \"RootObject_1.month\", \"year\" AS \"RootObject_1.year\", \"client_city\" AS \"RootObject_1.RootObject_2.client_city\", \"access_type\" AS \"RootObject_1.RootObject_2.access_type\" | rename \"RootObject_1.status\" AS \"status\", \"RootObject_1.test_boolean\" AS \"test_boolean\", \"RootObject_1.test_hidden\" AS \"test_hidden\", \"RootObject_1.RootObject_2.clientip\" AS \"clientip\", \"RootObject_1.month\" AS \"month\", \"RootObject_1.year\" AS \"year\", \"RootObject_1.RootObject_2.client_city\" AS \"client_city\", \"RootObject_1.RootObject_2.access_type\" AS \"access_type\" | search source=* status=*  | rex field=_time \"^(?<year>)-(?<month>)-\" max_match=1 | search  (eventtype = splunkd-access)  | lookup geoip clientip AS clientip OUTPUT client_city | eval \"access_type\"=if(host == \"sfishel-mbp15.local\", \"local\", \"external\") | rename \"status\" AS \"RootObject_1.status\", \"test_boolean\" AS \"RootObject_1.test_boolean\", \"test_hidden\" AS \"RootObject_1.test_hidden\", \"clientip\" AS \"RootObject_1.RootObject_2.clientip\", \"month\" AS \"RootObject_1.month\", \"year\" AS \"RootObject_1.year\", \"client_city\" AS \"RootObject_1.RootObject_2.client_city\", \"access_type\" AS \"RootObject_1.RootObject_2.access_type\" | fields \"_time\", \"host\", \"sourcetype\", \"source\", \"RootObject_1.status\", \"RootObject_1.test_boolean\", \"RootObject_1.test_hidden\", \"RootObject_1.RootObject_2.clientip\", \"RootObject_1.month\", \"RootObject_1.year\", \"RootObject_1.RootObject_2.client_city\", \"RootObject_1.RootObject_2.access_type\"",
                            "parentName": "RootObject_1",
                            "autoextractSearch": " (index = _internal) ",
                            "fields": [
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "_time",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": false,
                                    "displayName": "_time",
                                    "type": "timestamp",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "host",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": false,
                                    "displayName": "host",
                                    "type": "string",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "sourcetype",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": false,
                                    "displayName": "sourcetype",
                                    "type": "string",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "fieldSearch": "source=* ",
                                    "multivalue": false,
                                    "required": true,
                                    "fieldName": "source",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": true,
                                    "displayName": "source",
                                    "type": "string",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "fieldSearch": "status=* ",
                                    "multivalue": false,
                                    "required": true,
                                    "fieldName": "status",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": true,
                                    "displayName": "status",
                                    "type": "number",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "test_boolean",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": true,
                                    "displayName": "test_boolean",
                                    "type": "boolean",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "test_hidden",
                                    "hidden": true,
                                    "comment": "",
                                    "editable": true,
                                    "displayName": "test_hidden",
                                    "type": "string",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "clientip",
                                    "hidden": true,
                                    "comment": "",
                                    "editable": true,
                                    "displayName": "clientip",
                                    "type": "string",
                                    "owner": "RootObject_1.RootObject_2"
                                },
                                {
                                    "fieldSearch": "",
                                    "multivalue": false,
                                    "required": false,
                                    "fieldName": "RootObject_2",
                                    "hidden": false,
                                    "comment": "",
                                    "editable": false,
                                    "displayName": "RootObject_2",
                                    "type": "objectCount",
                                    "owner": "RootObject_1.RootObject_2"
                                }
                            ],
                            "objectSearchNoFields": " | search  (index = _internal) | rename \"status\" AS \"RootObject_1.status\", \"test_boolean\" AS \"RootObject_1.test_boolean\", \"test_hidden\" AS \"RootObject_1.test_hidden\", \"clientip\" AS \"RootObject_1.RootObject_2.clientip\", \"month\" AS \"RootObject_1.month\", \"year\" AS \"RootObject_1.year\", \"client_city\" AS \"RootObject_1.RootObject_2.client_city\", \"access_type\" AS \"RootObject_1.RootObject_2.access_type\" | rename \"RootObject_1.status\" AS \"status\", \"RootObject_1.test_boolean\" AS \"test_boolean\", \"RootObject_1.test_hidden\" AS \"test_hidden\", \"RootObject_1.RootObject_2.clientip\" AS \"clientip\", \"RootObject_1.month\" AS \"month\", \"RootObject_1.year\" AS \"year\", \"RootObject_1.RootObject_2.client_city\" AS \"client_city\", \"RootObject_1.RootObject_2.access_type\" AS \"access_type\" | search source=* status=*  | rex field=_time \"^(?<year>)-(?<month>)-\" max_match=1 | search  (eventtype = splunkd-access)  | lookup geoip clientip AS clientip OUTPUT client_city | eval \"access_type\"=if(host == \"sfishel-mbp15.local\", \"local\", \"external\") | rename \"status\" AS \"RootObject_1.status\", \"test_boolean\" AS \"RootObject_1.test_boolean\", \"test_hidden\" AS \"RootObject_1.test_hidden\", \"clientip\" AS \"RootObject_1.RootObject_2.clientip\", \"month\" AS \"RootObject_1.month\", \"year\" AS \"RootObject_1.year\", \"client_city\" AS \"RootObject_1.RootObject_2.client_city\", \"access_type\" AS \"RootObject_1.RootObject_2.access_type\"",
                            "displayName": "RootObject_2",
                            "tsidxNamespace": "datamodel=\"TestDebugger\"",
                            "calculations": [
                                {
                                    "calculationID": "6345b45bda06d5b1f6dd6ab7a464e2fb",
                                    "inputField": "_time",
                                    "expression": "^(?<year>)-(?<month>)-",
                                    "calculationType": "Rex",
                                    "editable": true,
                                    "comment": "",
                                    "outputFields": [
                                        {
                                            "fieldSearch": "",
                                            "multivalue": false,
                                            "required": false,
                                            "fieldName": "month",
                                            "hidden": true,
                                            "comment": "",
                                            "editable": true,
                                            "displayName": "month",
                                            "type": "string",
                                            "owner": "RootObject_1"
                                        },
                                        {
                                            "fieldSearch": "",
                                            "multivalue": false,
                                            "required": false,
                                            "fieldName": "year",
                                            "hidden": false,
                                            "comment": "",
                                            "editable": true,
                                            "displayName": "year",
                                            "type": "string",
                                            "owner": "RootObject_1"
                                        }
                                    ],
                                    "owner": "RootObject_1"
                                },
                                {
                                    "calculationID": "a5b56a5a72c689e07a8ccc2acdc40078",
                                    "inputField": "clientip",
                                    "calculationType": "Lookup",
                                    "lookupName": "geoip",
                                    "editable": true,
                                    "comment": "",
                                    "outputFields": [
                                        {
                                            "fieldSearch": "",
                                            "multivalue": false,
                                            "required": false,
                                            "fieldName": "client_city",
                                            "hidden": true,
                                            "comment": "",
                                            "editable": true,
                                            "displayName": "client_city",
                                            "type": "number",
                                            "owner": "RootObject_1.RootObject_2"
                                        }
                                    ],
                                    "lookupField": "clientip",
                                    "owner": "RootObject_1.RootObject_2"
                                },
                                {
                                    "calculationID": "d06ae356fe6a1350d71aadcef4fa1db8",
                                    "expression": "if(host == \"sfishel-mbp15.local\", \"local\", \"external\")",
                                    "calculationType": "Eval",
                                    "editable": true,
                                    "comment": "",
                                    "outputFields": [
                                        {
                                            "fieldSearch": "",
                                            "multivalue": false,
                                            "required": false,
                                            "fieldName": "access_type",
                                            "hidden": false,
                                            "comment": "",
                                            "editable": true,
                                            "displayName": "access_type",
                                            "type": "string",
                                            "owner": "RootObject_1.RootObject_2"
                                        }
                                    ],
                                    "owner": "RootObject_1.RootObject_2"
                                }
                            ],
                            "constraints": [
                                {
                                    "owner": "RootObject_1",
                                    "search": "index = _internal"
                                },
                                {
                                    "owner": "RootObject_1.RootObject_2",
                                    "search": "eventtype = splunkd-access"
                                }
                            ],
                            "comment": "",
                            "previewSearch": " | search  (index = _internal)  source=* status=*  | rex field=_time \"^(?<year>)-(?<month>)-\" max_match=1 | search  (eventtype = splunkd-access)  | lookup geoip clientip AS clientip OUTPUT client_city | eval \"access_type\"=if(host == \"sfishel-mbp15.local\", \"local\", \"external\")",
                            "lineage": "RootObject_1.RootObject_2"
                        }
                    ],
                    "description": "A meaningless data model for debugging purposes",
                    "objectNameList": [
                        "RootObject_1",
                        "RootObject_2"
                    ]
                }
            }
        ],
        "paging": {
            "total": 1,
            "perPage": 30,
            "offset": 0
        },
        "messages": []
    });
});
