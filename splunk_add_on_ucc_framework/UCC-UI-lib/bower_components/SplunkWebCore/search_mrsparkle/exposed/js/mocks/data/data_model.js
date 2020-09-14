define(function() {
    var DM_NEW_RESPONSE_UNPARSED =
    {
        "links":{
            "create":"/services/datamodel/model/_new",
            "_reload":"/services/datamodel/model/_reload",
            "_acl":"/services/datamodel/model/_acl"
        },
        "origin":"https://localhost:8000/services/datamodel/model",
        "updated":"2016-07-20T13:34:25-07:00",
        "generator":{
            "build":"9a9c772bbfdeda614a1f165108a5631a29b2f321",
            "version":"20160718"
        },
        "entry":[
            {
                "name":"_new",
                "id":"https://localhost:8000/servicesNS/admin/search/datamodel/model/_new",
                "updated":"2016-07-20T13:34:25-07:00",
                "links":{
                    "alternate":"/servicesNS/admin/search/datamodel/model/_new",
                    "list":"/servicesNS/admin/search/datamodel/model/_new",
                    "_reload":"/servicesNS/admin/search/datamodel/model/_new/_reload",
                    "edit":"/servicesNS/admin/search/datamodel/model/_new",
                    "remove":"/servicesNS/admin/search/datamodel/model/_new",
                    "move":"/servicesNS/admin/search/datamodel/model/_new/move"
                },
                "author":"admin",
                "acl":{
                    "app":"search",
                    "can_change_perms":true,
                    "can_list":true,
                    "can_share_app":true,
                    "can_share_global":true,
                    "can_share_user":true,
                    "can_write":true,
                    "modifiable":true,
                    "owner":"admin",
                    "perms":{
                        "read":[
                            "*"
                        ],
                        "write":[
                            "*"
                        ]
                    },
                    "removable":true,
                    "sharing":"user"
                },
                "fields":{
                    "required":[
                        "name"
                    ],
                    "optional":[
                        "acceleration",
                        "acceleration.backfill_time",
                        "acceleration.cron_schedule",
                        "acceleration.earliest_time",
                        "acceleration.hunk.compression_codec",
                        "acceleration.hunk.dfs_block_size",
                        "acceleration.hunk.file_format",
                        "acceleration.manual_rebuilds",
                        "acceleration.max_concurrent",
                        "acceleration.max_time",
                        "acceleration.schedule_priority",
                        "concise",
                        "dataset.commands",
                        "dataset.description",
                        "dataset.display.currentCommand",
                        "dataset.display.datasummary.earliestTime",
                        "dataset.display.datasummary.latestTime",
                        "dataset.display.diversity",
                        "dataset.display.limiting",
                        "dataset.display.mode",
                        "dataset.display.sample_ratio",
                        "dataset.fields",
                        "dataset.type",
                        "description",
                        "provisional",
                        "search"
                    ],
                    "wildcard":[

                    ]
                },
                "content":{
                    "acceleration":"{\"enabled\":false,\"earliest_time\":\"\",\"cron_schedule\":\"*/5 * * * *\",\"max_time\":3600,\"backfill_time\":\"\",\"manual_rebuilds\":false,\"max_concurrent\":2,\"schedule_priority\":\"default\",\"hunk.file_format\":\"\",\"hunk.dfs_block_size\":0,\"hunk.compression_codec\":\"\"}",
                    "dataset.commands":"",
                    "dataset.description":"",
                    "dataset.display.currentCommand":"",
                    "dataset.display.datasummary.earliestTime":"",
                    "dataset.display.datasummary.latestTime":"",
                    "dataset.display.diversity":"latest",
                    "dataset.display.limiting":"100000",
                    "dataset.display.mode":"table",
                    "dataset.display.sample_ratio":"1",
                    "dataset.fields":"",
                    "dataset.type":"datamodel",
                    "eai:acl":null,
                    "name":""
                }
            }
        ],
        "paging":{
            "total":0,
            "perPage":30,
            "offset":0
        },
        "messages":[

        ]
    };


    var DM_LIST_RESPONSE_UNPARSED = {
        "links": {
            "create": "/servicesNS/admin/search/admin/datamodeleai/_new"
        },
        "origin": "https://127.0.0.1:8589/servicesNS/admin/search/admin/datamodeleai",
        "updated": "2013-05-22T08:57:13-07:00",
        "generator": {
            "build": "164066",
            "version": "20130518"
        },
        "entry": [
            {
                "name": "Debugger",
                "id": "https://127.0.0.1:8589/servicesNS/nobody/search/admin/datamodeleai/Debugger",
                "updated": "2013-05-22T08:57:13-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/search/admin/datamodeleai/Debugger",
                    "list": "/servicesNS/nobody/search/admin/datamodeleai/Debugger",
                    "edit": "/servicesNS/nobody/search/admin/datamodeleai/Debugger",
                    "remove": "/servicesNS/nobody/search/admin/datamodeleai/Debugger"
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
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"description\": \"A meaningless data model for debugging purposes\", \"objectNameList\": [\"RootObject_1\", \"RootObject_2\"], \"objectSummary\": {\"Event-Based\": 2, \"Search-Based\": 0, \"Interface Implementations\": 0, \"Interfaces\": 0, \"Transaction-Based\": 0}, \"displayName\": \"Debugger\", \"modelName\": \"Debugger\"}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "6dbff661883cc09df9aed2e52b69bd6c",
                    "eai:type": "models",
                    "eai:userName": "admin"
                }
            },
            {
                "name": "FantasyBasketball",
                "id": "https://127.0.0.1:8589/servicesNS/nobody/search/admin/datamodeleai/FantasyBasketball",
                "updated": "2013-05-22T08:57:13-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/search/admin/datamodeleai/FantasyBasketball",
                    "list": "/servicesNS/nobody/search/admin/datamodeleai/FantasyBasketball",
                    "edit": "/servicesNS/nobody/search/admin/datamodeleai/FantasyBasketball",
                    "remove": "/servicesNS/nobody/search/admin/datamodeleai/FantasyBasketball"
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
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"description\": \"NBA Fantasy Basketball statistics\", \"objectNameList\": [\"PlayerStatLine\"], \"objectSummary\": {\"Event-Based\": 1, \"Search-Based\": 0, \"Interface Implementations\": 0, \"Interfaces\": 0, \"Transaction-Based\": 0}, \"displayName\": \"Fantasy Basketball\", \"modelName\": \"FantasyBasketball\"}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "21d28781e80ebd524a586165a6d04193",
                    "eai:type": "models",
                    "eai:userName": "admin"
                }
            },
            {
                "name": "JSONInterface",
                "id": "https://127.0.0.1:8589/servicesNS/nobody/search/admin/datamodeleai/JSONInterface",
                "updated": "2013-05-22T08:57:13-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/search/admin/datamodeleai/JSONInterface",
                    "list": "/servicesNS/nobody/search/admin/datamodeleai/JSONInterface",
                    "edit": "/servicesNS/nobody/search/admin/datamodeleai/JSONInterface",
                    "remove": "/servicesNS/nobody/search/admin/datamodeleai/JSONInterface"
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
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"description\": \"Description of the Interface Example goes here\", \"objectNameList\": [\"HTTP_Request\", \"ApacheRequest\", \"IISRequest\", \"HTTP_Success\", \"HTTP_Error\", \"Pageview\"], \"objectSummary\": {\"Event-Based\": 0, \"Search-Based\": 0, \"Interface Implementations\": 2, \"Interfaces\": 4, \"Transaction-Based\": 0}, \"displayName\": \"JSON Interface Example\", \"modelName\": \"JSONInterface\"}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "cef8d8cafbc60c4d16c1b3ce2dffdfe4",
                    "eai:type": "models",
                    "eai:userName": "admin"
                }
            },
            {
                "name": "On_Time_On_Time_Performance",
                "id": "https://127.0.0.1:8589/servicesNS/nobody/search/admin/datamodeleai/On_Time_On_Time_Performance",
                "updated": "2013-05-22T08:57:13-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/search/admin/datamodeleai/On_Time_On_Time_Performance",
                    "list": "/servicesNS/nobody/search/admin/datamodeleai/On_Time_On_Time_Performance",
                    "edit": "/servicesNS/nobody/search/admin/datamodeleai/On_Time_On_Time_Performance",
                    "remove": "/servicesNS/nobody/search/admin/datamodeleai/On_Time_On_Time_Performance"
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
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"description\": \"FAA Data\", \"objectNameList\": [\"On_Time_On_Time_Performance\"], \"objectSummary\": {\"Event-Based\": 0, \"Search-Based\": 1, \"Interface Implementations\": 0, \"Interfaces\": 0, \"Transaction-Based\": 0}, \"displayName\": \"On_Time_On_Time_Performance\", \"modelName\": \"On_Time_On_Time_Performance\"}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "60a8f8ac7c934d7e1dad614ad0efeb47",
                    "eai:type": "models",
                    "eai:userName": "admin"
                }
            },
            {
                "name": "simpleWebIntelligenceModel",
                "id": "https://127.0.0.1:8589/servicesNS/nobody/search/admin/datamodeleai/simpleWebIntelligenceModel",
                "updated": "2013-05-22T08:57:13-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/search/admin/datamodeleai/simpleWebIntelligenceModel",
                    "list": "/servicesNS/nobody/search/admin/datamodeleai/simpleWebIntelligenceModel",
                    "edit": "/servicesNS/nobody/search/admin/datamodeleai/simpleWebIntelligenceModel",
                    "remove": "/servicesNS/nobody/search/admin/datamodeleai/simpleWebIntelligenceModel"
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
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"description\": \"Data model for web analytics.\", \"objectNameList\": [\"HTTP_Request\", \"HTTP_Success\", \"HTTP_NonSuccess\", \"Pageview\"], \"objectSummary\": {\"Event-Based\": 4, \"Search-Based\": 0, \"Interface Implementations\": 0, \"Interfaces\": 0, \"Transaction-Based\": 0}, \"displayName\": \"Simple Web Intelligence\", \"modelName\": \"simpleWebIntelligenceModel\"}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "4b8806c1482de60048ce427571cd188e",
                    "eai:type": "models",
                    "eai:userName": "admin"
                }
            },
            {
                "name": "Syslog_Debugger",
                "id": "https://127.0.0.1:8589/servicesNS/nobody/search/admin/datamodeleai/Syslog_Debugger",
                "updated": "2013-05-22T08:57:13-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/search/admin/datamodeleai/Syslog_Debugger",
                    "list": "/servicesNS/nobody/search/admin/datamodeleai/Syslog_Debugger",
                    "edit": "/servicesNS/nobody/search/admin/datamodeleai/Syslog_Debugger",
                    "remove": "/servicesNS/nobody/search/admin/datamodeleai/Syslog_Debugger"
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
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"description\": \"A meaningless data model for debugging purposes\", \"objectNameList\": [\"Syslog_Base\"], \"objectSummary\": {\"Event-Based\": 1, \"Search-Based\": 0, \"Interface Implementations\": 0, \"Interfaces\": 0, \"Transaction-Based\": 0}, \"displayName\": \"Syslog Debugger\", \"modelName\": \"Syslog_Debugger\"}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "af35d71122ac18e1ac60b935cffbfc9d",
                    "eai:type": "models",
                    "eai:userName": "admin"
                }
            },
            {
                "name": "WebIntelligence",
                "id": "https://127.0.0.1:8589/servicesNS/nobody/search/admin/datamodeleai/WebIntelligence",
                "updated": "2013-05-22T08:57:13-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/search/admin/datamodeleai/WebIntelligence",
                    "list": "/servicesNS/nobody/search/admin/datamodeleai/WebIntelligence",
                    "edit": "/servicesNS/nobody/search/admin/datamodeleai/WebIntelligence",
                    "remove": "/servicesNS/nobody/search/admin/datamodeleai/WebIntelligence"
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
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"description\": \"Data model for web analytics.\", \"objectNameList\": [\"HTTP_Request\", \"ApacheAccessSearch\", \"IISAccessSearch\", \"HTTP_Success\", \"HTTP_Error\", \"HTTP_Redirect\", \"Pageview\", \"AssetAccess\", \"DocAccess\", \"MediaAccess\", \"PodcastDownload\", \"WebSession\", \"User\"], \"objectSummary\": {\"Event-Based\": 11, \"Search-Based\": 1, \"Interface Implementations\": 0, \"Interfaces\": 0, \"Transaction-Based\": 1}, \"displayName\": \"Web Intelligence\", \"modelName\": \"WebIntelligence\"}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "b8ebd9315dddf8a5e572187f57ddc9de",
                    "eai:type": "models",
                    "eai:userName": "admin"
                }
            }
        ],
        "paging": {
            "total": 7,
            "perPage": 30,
            "offset": 0
        },
        "messages": []
    };

    var DM_LIST_RESPONSE_PARSED = [
        {
            "entry": [
                {
                    "name": "Debugger",
                    "id": "https://localhost:8589/services/admin/datamodeleai/Debugger",
                    "updated": "2013-03-14T15:34:10-07:00",
                    "links": {
                        "alternate": "/services/admin/datamodeleai/Debugger",
                        "list": "/services/admin/datamodeleai/Debugger",
                        "edit": "/services/admin/datamodeleai/Debugger",
                        "remove": "/services/admin/datamodeleai/Debugger"
                    },
                    "author": "system",
                    "acl": {
                        "app": "",
                        "can_list": true,
                        "can_write": true,
                        "modifiable": false,
                        "owner": "system",
                        "perms": {
                            "read": [
                                "*"
                            ],
                            "write": [
                                "*"
                            ]
                        },
                        "removable": false,
                        "sharing": "system"
                    },
                    "content": {
                        "description": "{\"objects\": {\"Transaction-Based\": 0, \"Search-Based\": 0, \"Event-Based\": 2, \"Interface Implementations\": 0, \"Interfaces\": 0}, \"displayName\": \"Debugger\", \"modelName\": \"Debugger\", \"description\": \"A meaningless data model for debugging purposes\", \"editable\": true}"
                    }
                }
            ]
        },
        {
            "entry": [
                {
                    "name": "FantasyBasketball",
                    "id": "https://localhost:8589/services/admin/datamodeleai/FantasyBasketball",
                    "updated": "2013-03-14T15:34:10-07:00",
                    "links": {
                        "alternate": "/services/admin/datamodeleai/FantasyBasketball",
                        "list": "/services/admin/datamodeleai/FantasyBasketball",
                        "edit": "/services/admin/datamodeleai/FantasyBasketball",
                        "remove": "/services/admin/datamodeleai/FantasyBasketball"
                    },
                    "author": "system",
                    "acl": {
                        "app": "",
                        "can_list": true,
                        "can_write": true,
                        "modifiable": false,
                        "owner": "system",
                        "perms": {
                            "read": [
                                "*"
                            ],
                            "write": [
                                "*"
                            ]
                        },
                        "removable": false,
                        "sharing": "system"
                    },
                    "content": {
                        "description": "{\"objects\": {\"Transaction-Based\": 0, \"Search-Based\": 0, \"Event-Based\": 1, \"Interface Implementations\": 0, \"Interfaces\": 0}, \"displayName\": \"Fantasy Basketball\", \"modelName\": \"FantasyBasketball\", \"description\": \"NBA Fantasy Basketball statistics\", \"editable\": true}"
                    }
                }
            ]
        },
        {
            "entry": [
                {
                    "name": "InterfaceExample",
                    "id": "https://localhost:8589/services/admin/datamodeleai/InterfaceExample",
                    "updated": "2013-03-14T15:34:10-07:00",
                    "links": {
                        "alternate": "/services/admin/datamodeleai/InterfaceExample",
                        "list": "/services/admin/datamodeleai/InterfaceExample",
                        "edit": "/services/admin/datamodeleai/InterfaceExample",
                        "remove": "/services/admin/datamodeleai/InterfaceExample"
                    },
                    "author": "system",
                    "acl": {
                        "app": "",
                        "can_list": true,
                        "can_write": true,
                        "modifiable": false,
                        "owner": "system",
                        "perms": {
                            "read": [
                                "*"
                            ],
                            "write": [
                                "*"
                            ]
                        },
                        "removable": false,
                        "sharing": "system"
                    },
                    "content": {
                        "description": "{\"objects\": {\"Transaction-Based\": 0, \"Search-Based\": 0, \"Event-Based\": 0, \"Interface Implementations\": 2, \"Interfaces\": 4}, \"displayName\": \"Interface Example\", \"modelName\": \"InterfaceExample\", \"description\": \"Description of the Interface Example goes here\", \"editable\": false}"
                    }
                }
            ]
        }
    ];

    var DM_LIST_JSON = [
        {
            "displayName": "Sales Force",
            "modelName": "sfdc12",
            "editable": false,
            "description": "2012 Sales Opportunities"
        },
        {
            "displayName": "Web Intelligence",
            "modelName": "WebIntelligence",
            "editable": true,
            "description": "Data model for web analytics."
        },
        {
            "displayName": "Salesforce",
            "modelName": "Salesforce",
            "editable": true,
            "description": "Data model for Salesforce.com data."
        },
        {
            "displayName": "Session Of Sessions",
            "modelName": "SessionOfSessions",
            "editable": true,
            "description": "Test data model with Session of Sessions."
        },
        {
            "displayName": "Debugger",
            "modelName": "Debugger",
            "editable": true,
            "description": "A meaningless data model for debugging purposes"
        },
        {
            "displayName": "Banner",
            "modelName": "Banner",
            "editable": true,
            "description": "Description for the banner model."
        },
        {
            "displayName": "Syslog Debugger",
            "modelName": "Syslog_Debugger",
            "editable": true,
            "description": "A meaningless data model for debugging purposes"
        },
        {
            "displayName": "Interface Example",
            "modelName": "InterfaceExample",
            "editable": false,
            "description": "Description of the Interface Example goes here"
        },
        {
            "displayName": "On_Time_On_Time_Performance",
            "modelName": "On_Time_On_Time_Performance",
            "editable": true,
            "description": "FAA Data"
        }
    ];

    var SEARCH_FIELD_SUMMARY_UNPARSED = {"earliest_time":"1969-12-31T16:00:00.000-08:00","latest_time":"1969-12-31T16:00:00.000-08:00","duration":0,"event_count":718,"fields":{"abandoned_channels":{"count":10,"numeric_count":10,"distinct_count":1,"is_exact":true,"relevant":false,"min":"0","max":"0","mean":0,"stdev":0,"modes":[{"value":"0","count":10,"is_exact":true}]}}};

    var DM_WEB_INTELLIGENCE_UNPARSED = {
        "links": {
            "create": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/_new"
        },
        "origin": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/search\/admin\/datamodeleai",
        "updated": "2013-05-17T12:05:55-07:00",
        "generator": {
            "build": "163821",
            "version": "20130516"
        },
        "entry": [
            {
                "name": "WebIntelligence",
                "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence",
                "updated": "2013-05-17T12:05:55-07:00",
                "links": {
                    "alternate": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence",
                    "list": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence",
                    "edit": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence",
                    "remove": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence"
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
                    "required": [

                    ],
                    "optional": [
                        "acceleration",
                        "concise",
                        "description",
                        "namespace",
                        "object",
                        "owner",
                        "pivot",
                        "provisional",
                        "sharing"
                    ],
                    "wildcard": [
                        "perms\\..*"
                    ]
                },
                "content": {
                    "acceleration": "{\"earliest_time\": \"-1mon\", \"enabled\": true}",
                    "description": "{\"objectNameList\": [\"HTTP_Request\", \"ApacheAccessSearch\", \"IISAccessSearch\", \"HTTP_Success\", \"HTTP_Error\", \"HTTP_Redirect\", \"Pageview\", \"AssetAccess\", \"DocAccess\", \"MediaAccess\", \"PodcastDownload\", \"WebSession\", \"User\"], \"modelName\": \"WebIntelligence\", \"objects\": [{\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"is_not_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"is_IISAccessSearch\\\" AS \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"is_not_IISAccessSearch\\\" AS \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"is_HTTP_Success\\\" AS \\\"HTTP_Request.is_HTTP_Success\\\", \\\"is_not_HTTP_Success\\\" AS \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"is_HTTP_Error\\\" AS \\\"HTTP_Request.is_HTTP_Error\\\", \\\"is_not_HTTP_Error\\\" AS \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"is_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"is_not_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_not_HTTP_Redirect\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.is_ApacheAccessSearch\\\" AS \\\"is_ApacheAccessSearch\\\", \\\"HTTP_Request.is_not_ApacheAccessSearch\\\" AS \\\"is_not_ApacheAccessSearch\\\", \\\"HTTP_Request.is_IISAccessSearch\\\" AS \\\"is_IISAccessSearch\\\", \\\"HTTP_Request.is_not_IISAccessSearch\\\" AS \\\"is_not_IISAccessSearch\\\", \\\"HTTP_Request.is_HTTP_Success\\\" AS \\\"is_HTTP_Success\\\", \\\"HTTP_Request.is_not_HTTP_Success\\\" AS \\\"is_not_HTTP_Success\\\", \\\"HTTP_Request.is_HTTP_Error\\\" AS \\\"is_HTTP_Error\\\", \\\"HTTP_Request.is_not_HTTP_Error\\\" AS \\\"is_not_HTTP_Error\\\", \\\"HTTP_Request.is_HTTP_Redirect\\\" AS \\\"is_HTTP_Redirect\\\", \\\"HTTP_Request.is_not_HTTP_Redirect\\\" AS \\\"is_not_HTTP_Redirect\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | eval \\\"is_ApacheAccessSearch\\\"=if(searchmatch(\\\"  (sourcetype = access_*) \\\"),1,0) | eval \\\"is_not_ApacheAccessSearch\\\"=if(searchmatch(\\\"NOT(   (sourcetype = access_*) )\\\"),1,0) | eval \\\"is_IISAccessSearch\\\"=if(searchmatch(\\\"  (sourcetype = iis*) \\\"),1,0) | eval \\\"is_not_IISAccessSearch\\\"=if(searchmatch(\\\"NOT(   (sourcetype = iis*) )\\\"),1,0) | eval \\\"is_HTTP_Success\\\"=if(searchmatch(\\\"  (status = 2*) \\\"),1,0) | eval \\\"is_not_HTTP_Success\\\"=if(searchmatch(\\\"NOT(   (status = 2*) )\\\"),1,0) | eval \\\"is_HTTP_Error\\\"=if(searchmatch(\\\"  (status = 4*) \\\"),1,0) | eval \\\"is_not_HTTP_Error\\\"=if(searchmatch(\\\"NOT(   (status = 4*) )\\\"),1,0) | eval \\\"is_HTTP_Redirect\\\"=if(searchmatch(\\\"  (status = 3*) \\\"),1,0) | eval \\\"is_not_HTTP_Redirect\\\"=if(searchmatch(\\\"NOT(   (status = 3*) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"is_not_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"is_IISAccessSearch\\\" AS \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"is_not_IISAccessSearch\\\" AS \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"is_HTTP_Success\\\" AS \\\"HTTP_Request.is_HTTP_Success\\\", \\\"is_not_HTTP_Success\\\" AS \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"is_HTTP_Error\\\" AS \\\"HTTP_Request.is_HTTP_Error\\\", \\\"is_not_HTTP_Error\\\" AS \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"is_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"is_not_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_not_HTTP_Redirect\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\", \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"HTTP_Request.is_HTTP_Success\\\", \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"HTTP_Request.is_HTTP_Error\\\", \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"HTTP_Request.is_not_HTTP_Redirect\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"6fd4c8e45540dae54c7d44717057ee89\", \"expression\": \"if(searchmatch(\\\"  (sourcetype = access_*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_ApacheAccessSearch\", \"fieldName\": \"is_ApacheAccessSearch\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"648fe13df9c123d95e510075c8f98498\", \"expression\": \"if(searchmatch(\\\"NOT(   (sourcetype = access_*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_ApacheAccessSearch\", \"fieldName\": \"is_not_ApacheAccessSearch\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"90e94407291d4c55b68c9eda6874743d\", \"expression\": \"if(searchmatch(\\\"  (sourcetype = iis*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_IISAccessSearch\", \"fieldName\": \"is_IISAccessSearch\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"619fcfde6c1e39b7aaf2745695e6ad4d\", \"expression\": \"if(searchmatch(\\\"NOT(   (sourcetype = iis*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_IISAccessSearch\", \"fieldName\": \"is_not_IISAccessSearch\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"78c19fdc5e57e5910615bfd964a106db\", \"expression\": \"if(searchmatch(\\\"  (status = 2*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_HTTP_Success\", \"fieldName\": \"is_HTTP_Success\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"9ce870506357d42b57ae7ec573359092\", \"expression\": \"if(searchmatch(\\\"NOT(   (status = 2*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_HTTP_Success\", \"fieldName\": \"is_not_HTTP_Success\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"358adc61f3677f789609d4b13f0eebec\", \"expression\": \"if(searchmatch(\\\"  (status = 4*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_HTTP_Error\", \"fieldName\": \"is_HTTP_Error\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"6a07e4a02d40b57555ada20db2c80a2b\", \"expression\": \"if(searchmatch(\\\"NOT(   (status = 4*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_HTTP_Error\", \"fieldName\": \"is_not_HTTP_Error\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"35b3fc152ff3f20e479467a4bc4a9c3a\", \"expression\": \"if(searchmatch(\\\"  (status = 3*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_HTTP_Redirect\", \"fieldName\": \"is_HTTP_Redirect\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"614cc70c3d7d75142da978e8cf9043ed\", \"expression\": \"if(searchmatch(\\\"NOT(   (status = 3*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_HTTP_Redirect\", \"fieldName\": \"is_not_HTTP_Redirect\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"HTTP_Request\", \"fieldName\": \"HTTP_Request\"}], \"parentName\": \"BaseEvent\", \"comment\": \"\", \"lineage\": \"HTTP_Request\", \"children\": [\"ApacheAccessSearch\", \"IISAccessSearch\", \"HTTP_Success\", \"HTTP_Error\", \"HTTP_Redirect\"], \"displayName\": \"HTTP_Request\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country\", \"objectName\": \"HTTP_Request\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"is_not_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"is_IISAccessSearch\\\" AS \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"is_not_IISAccessSearch\\\" AS \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"is_HTTP_Success\\\" AS \\\"HTTP_Request.is_HTTP_Success\\\", \\\"is_not_HTTP_Success\\\" AS \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"is_HTTP_Error\\\" AS \\\"HTTP_Request.is_HTTP_Error\\\", \\\"is_not_HTTP_Error\\\" AS \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"is_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"is_not_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_not_HTTP_Redirect\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.is_ApacheAccessSearch\\\" AS \\\"is_ApacheAccessSearch\\\", \\\"HTTP_Request.is_not_ApacheAccessSearch\\\" AS \\\"is_not_ApacheAccessSearch\\\", \\\"HTTP_Request.is_IISAccessSearch\\\" AS \\\"is_IISAccessSearch\\\", \\\"HTTP_Request.is_not_IISAccessSearch\\\" AS \\\"is_not_IISAccessSearch\\\", \\\"HTTP_Request.is_HTTP_Success\\\" AS \\\"is_HTTP_Success\\\", \\\"HTTP_Request.is_not_HTTP_Success\\\" AS \\\"is_not_HTTP_Success\\\", \\\"HTTP_Request.is_HTTP_Error\\\" AS \\\"is_HTTP_Error\\\", \\\"HTTP_Request.is_not_HTTP_Error\\\" AS \\\"is_not_HTTP_Error\\\", \\\"HTTP_Request.is_HTTP_Redirect\\\" AS \\\"is_HTTP_Redirect\\\", \\\"HTTP_Request.is_not_HTTP_Redirect\\\" AS \\\"is_not_HTTP_Redirect\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | eval \\\"is_ApacheAccessSearch\\\"=if(searchmatch(\\\"  (sourcetype = access_*) \\\"),1,0) | eval \\\"is_not_ApacheAccessSearch\\\"=if(searchmatch(\\\"NOT(   (sourcetype = access_*) )\\\"),1,0) | eval \\\"is_IISAccessSearch\\\"=if(searchmatch(\\\"  (sourcetype = iis*) \\\"),1,0) | eval \\\"is_not_IISAccessSearch\\\"=if(searchmatch(\\\"NOT(   (sourcetype = iis*) )\\\"),1,0) | eval \\\"is_HTTP_Success\\\"=if(searchmatch(\\\"  (status = 2*) \\\"),1,0) | eval \\\"is_not_HTTP_Success\\\"=if(searchmatch(\\\"NOT(   (status = 2*) )\\\"),1,0) | eval \\\"is_HTTP_Error\\\"=if(searchmatch(\\\"  (status = 4*) \\\"),1,0) | eval \\\"is_not_HTTP_Error\\\"=if(searchmatch(\\\"NOT(   (status = 4*) )\\\"),1,0) | eval \\\"is_HTTP_Redirect\\\"=if(searchmatch(\\\"  (status = 3*) \\\"),1,0) | eval \\\"is_not_HTTP_Redirect\\\"=if(searchmatch(\\\"NOT(   (status = 3*) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"is_not_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"is_IISAccessSearch\\\" AS \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"is_not_IISAccessSearch\\\" AS \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"is_HTTP_Success\\\" AS \\\"HTTP_Request.is_HTTP_Success\\\", \\\"is_not_HTTP_Success\\\" AS \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"is_HTTP_Error\\\" AS \\\"HTTP_Request.is_HTTP_Error\\\", \\\"is_not_HTTP_Error\\\" AS \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"is_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"is_not_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_not_HTTP_Redirect\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.ApacheAccessSearch\", \"search\": \"sourcetype = access_*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.ApacheAccessSearch\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"ApacheAccessSearch\", \"fieldName\": \"ApacheAccessSearch\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.ApacheAccessSearch\", \"children\": [], \"displayName\": \"ApacheAccessSearch\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*) \", \"objectName\": \"ApacheAccessSearch\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.IISAccessSearch\", \"search\": \"sourcetype = iis*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = iis*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.IISAccessSearch\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"IISAccessSearch\", \"fieldName\": \"IISAccessSearch\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.IISAccessSearch\", \"children\": [], \"displayName\": \"IISAccessSearch\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = iis*) \", \"objectName\": \"IISAccessSearch\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = iis*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"is_not_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"is_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"is_not_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.is_Pageview\\\" AS \\\"is_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\" AS \\\"is_not_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\" AS \\\"is_AssetAccess\\\", \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" AS \\\"is_not_AssetAccess\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)  | eval \\\"is_Pageview\\\"=if(searchmatch(\\\"  (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) \\\"),1,0) | eval \\\"is_not_Pageview\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) )\\\"),1,0) | eval \\\"is_AssetAccess\\\"=if(searchmatch(\\\"  (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) \\\"),1,0) | eval \\\"is_not_AssetAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"is_not_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"is_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"is_not_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\", \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"calculationID\": \"a72cd929b09b86ac70ab80c23c43f1c8\", \"expression\": \"if(searchmatch(\\\"  (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_Pageview\", \"fieldName\": \"is_Pageview\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"calculationID\": \"69919610a3f32078bec4d0a808beead5\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_Pageview\", \"fieldName\": \"is_not_Pageview\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"calculationID\": \"f050461abfd5a801f66d9f9d02a989e2\", \"expression\": \"if(searchmatch(\\\"  (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_AssetAccess\", \"fieldName\": \"is_AssetAccess\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"calculationID\": \"1f197b98405688a248f660b4df02c576\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_AssetAccess\", \"fieldName\": \"is_not_AssetAccess\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"HTTP_Success\", \"fieldName\": \"HTTP_Success\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success\", \"children\": [\"Pageview\", \"AssetAccess\"], \"displayName\": \"HTTP_Success\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*) \", \"objectName\": \"HTTP_Success\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"is_not_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"is_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"is_not_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.is_Pageview\\\" AS \\\"is_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\" AS \\\"is_not_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\" AS \\\"is_AssetAccess\\\", \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" AS \\\"is_not_AssetAccess\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)  | eval \\\"is_Pageview\\\"=if(searchmatch(\\\"  (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) \\\"),1,0) | eval \\\"is_not_Pageview\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) )\\\"),1,0) | eval \\\"is_AssetAccess\\\"=if(searchmatch(\\\"  (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) \\\"),1,0) | eval \\\"is_not_AssetAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"is_not_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"is_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"is_not_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Error\", \"search\": \"status = 4*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 4*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Error\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"HTTP_Error\", \"fieldName\": \"HTTP_Error\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Error\", \"children\": [], \"displayName\": \"HTTP_Error\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 4*) \", \"objectName\": \"HTTP_Error\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 4*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Redirect\", \"search\": \"status = 3*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 3*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Redirect\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"HTTP_Redirect\", \"fieldName\": \"HTTP_Redirect\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Redirect\", \"children\": [], \"displayName\": \"HTTP_Redirect\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 3*) \", \"objectName\": \"HTTP_Redirect\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 3*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.Pageview\", \"search\": \"uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.Pageview\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"Pageview\", \"fieldName\": \"Pageview\"}], \"parentName\": \"HTTP_Success\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.Pageview\", \"children\": [], \"displayName\": \"Pageview\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) \", \"objectName\": \"Pageview\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"search\": \"uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"is_not_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"is_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"is_not_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\" AS \\\"is_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\" AS \\\"is_not_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\" AS \\\"is_MediaAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" AS \\\"is_not_MediaAccess\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)  | eval \\\"is_DocAccess\\\"=if(searchmatch(\\\"  (uri_path=*.doc OR uri_path=*.pdf) \\\"),1,0) | eval \\\"is_not_DocAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.doc OR uri_path=*.pdf) )\\\"),1,0) | eval \\\"is_MediaAccess\\\"=if(searchmatch(\\\"  (uri_path=*.avi OR uri_path=*.swf) \\\"),1,0) | eval \\\"is_not_MediaAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.avi OR uri_path=*.swf) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"is_not_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"is_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"is_not_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"calculationID\": \"ca8f57e21850a59c9680b0cf095eba42\", \"expression\": \"if(searchmatch(\\\"  (uri_path=*.doc OR uri_path=*.pdf) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_DocAccess\", \"fieldName\": \"is_DocAccess\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"calculationID\": \"0d66830d9823e3667dd9b2eef0d603db\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path=*.doc OR uri_path=*.pdf) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_DocAccess\", \"fieldName\": \"is_not_DocAccess\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"calculationID\": \"039546a4cc716493be30d901deaec65b\", \"expression\": \"if(searchmatch(\\\"  (uri_path=*.avi OR uri_path=*.swf) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_MediaAccess\", \"fieldName\": \"is_MediaAccess\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"calculationID\": \"42c8fe4a8bbf2deee4dc6665739e347d\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path=*.avi OR uri_path=*.swf) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_MediaAccess\", \"fieldName\": \"is_not_MediaAccess\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"AssetAccess\", \"fieldName\": \"AssetAccess\"}], \"parentName\": \"HTTP_Success\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"children\": [\"DocAccess\", \"MediaAccess\"], \"displayName\": \"AssetAccess\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) \", \"objectName\": \"AssetAccess\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"is_not_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"is_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"is_not_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\" AS \\\"is_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\" AS \\\"is_not_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\" AS \\\"is_MediaAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" AS \\\"is_not_MediaAccess\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)  | eval \\\"is_DocAccess\\\"=if(searchmatch(\\\"  (uri_path=*.doc OR uri_path=*.pdf) \\\"),1,0) | eval \\\"is_not_DocAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.doc OR uri_path=*.pdf) )\\\"),1,0) | eval \\\"is_MediaAccess\\\"=if(searchmatch(\\\"  (uri_path=*.avi OR uri_path=*.swf) \\\"),1,0) | eval \\\"is_not_MediaAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.avi OR uri_path=*.swf) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"is_not_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"is_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"is_not_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"search\": \"uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.DocAccess\", \"search\": \"uri_path=*.doc OR uri_path=*.pdf\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.doc OR uri_path=*.pdf)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.DocAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"DocAccess\", \"fieldName\": \"DocAccess\"}], \"parentName\": \"AssetAccess\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.AssetAccess.DocAccess\", \"children\": [], \"displayName\": \"DocAccess\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.doc OR uri_path=*.pdf) \", \"objectName\": \"DocAccess\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.doc OR uri_path=*.pdf)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"search\": \"uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"search\": \"uri_path=*.avi OR uri_path=*.swf\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"is_not_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\" AS \\\"is_PodcastDownload\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" AS \\\"is_not_PodcastDownload\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)  | eval \\\"is_PodcastDownload\\\"=if(searchmatch(\\\"  (uri_path=*.itpc OR uri_path=*.xml) \\\"),1,0) | eval \\\"is_not_PodcastDownload\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.itpc OR uri_path=*.xml) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"is_not_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"calculationID\": \"4486e992b7e91e56990371d40ba0280e\", \"expression\": \"if(searchmatch(\\\"  (uri_path=*.itpc OR uri_path=*.xml) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_PodcastDownload\", \"fieldName\": \"is_PodcastDownload\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"calculationID\": \"ee37ecc068257bb9fc7b793f5b3cc718\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path=*.itpc OR uri_path=*.xml) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_PodcastDownload\", \"fieldName\": \"is_not_PodcastDownload\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"MediaAccess\", \"fieldName\": \"MediaAccess\"}], \"parentName\": \"AssetAccess\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"children\": [\"PodcastDownload\"], \"displayName\": \"MediaAccess\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf) \", \"objectName\": \"MediaAccess\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"is_not_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\" AS \\\"is_PodcastDownload\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" AS \\\"is_not_PodcastDownload\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)  | eval \\\"is_PodcastDownload\\\"=if(searchmatch(\\\"  (uri_path=*.itpc OR uri_path=*.xml) \\\"),1,0) | eval \\\"is_not_PodcastDownload\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.itpc OR uri_path=*.xml) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"is_not_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"search\": \"uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"search\": \"uri_path=*.avi OR uri_path=*.swf\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.PodcastDownload\", \"search\": \"uri_path=*.itpc OR uri_path=*.xml\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)   (uri_path=*.itpc OR uri_path=*.xml)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.PodcastDownload\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"PodcastDownload\", \"fieldName\": \"PodcastDownload\"}], \"parentName\": \"MediaAccess\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.PodcastDownload\", \"children\": [], \"displayName\": \"PodcastDownload\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)   (uri_path=*.itpc OR uri_path=*.xml) \", \"objectName\": \"PodcastDownload\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)   (uri_path=*.itpc OR uri_path=*.xml)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"objectsToGroup\": [\"ApacheAccessSearch\"], \"tsidxNamespace\": \"\", \"constraints\": [], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | transaction mvlist=t keepevicted=f clientip useragent | search *| rename \\\"landingpage\\\" AS \\\"WebSession.landingpage\\\", \\\"exitpage\\\" AS \\\"WebSession.exitpage\\\" | rename \\\"WebSession.landingpage\\\" AS \\\"landingpage\\\", \\\"WebSession.exitpage\\\" AS \\\"exitpage\\\" | eval \\\"landingpage\\\"=mvindex(uri,0) | eval \\\"exitpage\\\"=mvindex(uri,-1) | rename \\\"landingpage\\\" AS \\\"WebSession.landingpage\\\", \\\"exitpage\\\" AS \\\"WebSession.exitpage\\\" | fields \\\"eventcount\\\", \\\"duration\\\", \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"uri\\\", \\\"uri_path\\\", \\\"status\\\", \\\"clientip\\\", \\\"referer\\\", \\\"useragent\\\", \\\"user\\\", \\\"bytes\\\", \\\"kb\\\", \\\"clientip_lon\\\", \\\"clientip_lat\\\", \\\"clientip_city\\\", \\\"clientip_region\\\", \\\"clientip_country\\\", \\\"WebSession.landingpage\\\", \\\"WebSession.exitpage\\\"\", \"groupByFields\": [\"clientip\", \"useragent\"], \"calculations\": [{\"owner\": \"WebSession\", \"calculationID\": \"4870e56e2cedab482a226a8232f569b8\", \"expression\": \"mvindex(uri,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"WebSession\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"landingpage\", \"fieldName\": \"landingpage\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"WebSession\", \"calculationID\": \"229004ee3d95e6b4a09e5e5dfa391a22\", \"expression\": \"mvindex(uri,-1)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"WebSession\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"exitpage\", \"fieldName\": \"exitpage\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEventSet\", \"hidden\": false, \"fieldSearch\": \"eventcount=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"eventcount\", \"fieldName\": \"eventcount\"}, {\"owner\": \"BaseEventSet\", \"hidden\": false, \"fieldSearch\": \"duration=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"duration\", \"fieldName\": \"duration\"}, {\"owner\": \"BaseEventSet\", \"hidden\": false, \"fieldSearch\": \"_time=* \", \"type\": \"timestamp\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"kb\", \"fieldName\": \"kb\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_country\", \"fieldName\": \"clientip_country\"}, {\"owner\": \"WebSession\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"WebSession\", \"fieldName\": \"WebSession\"}], \"parentName\": \"BaseTransaction\", \"comment\": \"\", \"transactionMaxTimeSpan\": \"\", \"lineage\": \"WebSession\", \"children\": [], \"transactionMaxPause\": \"\", \"displayName\": \"WebSession\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | transaction mvlist=t keepevicted=f clientip useragent | search * | eval \\\"landingpage\\\"=mvindex(uri,0) | eval \\\"exitpage\\\"=mvindex(uri,-1)\", \"objectName\": \"WebSession\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | transaction mvlist=t keepevicted=f clientip useragent | search *| rename \\\"landingpage\\\" AS \\\"WebSession.landingpage\\\", \\\"exitpage\\\" AS \\\"WebSession.exitpage\\\" | rename \\\"WebSession.landingpage\\\" AS \\\"landingpage\\\", \\\"WebSession.exitpage\\\" AS \\\"exitpage\\\" | eval \\\"landingpage\\\"=mvindex(uri,0) | eval \\\"exitpage\\\"=mvindex(uri,-1) | rename \\\"landingpage\\\" AS \\\"WebSession.landingpage\\\", \\\"exitpage\\\" AS \\\"WebSession.exitpage\\\"\"}, {\"baseSearch\": \" _time=* host=* source=* sourcetype=* uri=* status<600 clientip=* referer=* useragent=* (sourcetype = access_* OR source = *.log) | eval userid=clientip | stats first(_time) as earliest, last(_time) as latest, list(uri_path) as uri_list by userid\", \"tsidxNamespace\": \"\", \"constraints\": [], \"objectSearch\": \" _time=* host=* source=* sourcetype=* uri=* status<600 clientip=* referer=* useragent=* (sourcetype = access_* OR source = *.log) | eval userid=clientip | stats first(_time) as earliest, last(_time) as latest, list(uri_path) as uri_list by userid| rename \\\"earliest\\\" AS \\\"User.earliest\\\", \\\"latest\\\" AS \\\"User.latest\\\", \\\"uri_list\\\" AS \\\"User.uri_list\\\" | rename \\\"User.earliest\\\" AS \\\"earliest\\\", \\\"User.latest\\\" AS \\\"latest\\\", \\\"User.uri_list\\\" AS \\\"uri_list\\\" | search earliest=* latest=* uri_list=*  | rename \\\"earliest\\\" AS \\\"User.earliest\\\", \\\"latest\\\" AS \\\"User.latest\\\", \\\"uri_list\\\" AS \\\"User.uri_list\\\" | fields \\\"User.earliest\\\", \\\"User.latest\\\", \\\"User.uri_list\\\"\", \"calculations\": [], \"fields\": [{\"owner\": \"User\", \"hidden\": false, \"fieldSearch\": \"earliest=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"earliest\", \"fieldName\": \"earliest\"}, {\"owner\": \"User\", \"hidden\": false, \"fieldSearch\": \"latest=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"latest\", \"fieldName\": \"latest\"}, {\"owner\": \"User\", \"hidden\": false, \"fieldSearch\": \"uri_list=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_list\", \"fieldName\": \"uri_list\"}, {\"owner\": \"User\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"User\", \"fieldName\": \"User\"}], \"parentName\": \"BaseSearch\", \"comment\": \"\", \"lineage\": \"User\", \"children\": [], \"displayName\": \"User\", \"previewSearch\": \" _time=* host=* source=* sourcetype=* uri=* status<600 clientip=* referer=* useragent=* (sourcetype = access_* OR source = *.log) | eval userid=clientip | stats first(_time) as earliest, last(_time) as latest, list(uri_path) as uri_list by userid | search earliest=* latest=* uri_list=* \", \"objectName\": \"User\", \"objectSearchNoFields\": \" _time=* host=* source=* sourcetype=* uri=* status<600 clientip=* referer=* useragent=* (sourcetype = access_* OR source = *.log) | eval userid=clientip | stats first(_time) as earliest, last(_time) as latest, list(uri_path) as uri_list by userid| rename \\\"earliest\\\" AS \\\"User.earliest\\\", \\\"latest\\\" AS \\\"User.latest\\\", \\\"uri_list\\\" AS \\\"User.uri_list\\\" | rename \\\"User.earliest\\\" AS \\\"earliest\\\", \\\"User.latest\\\" AS \\\"latest\\\", \\\"User.uri_list\\\" AS \\\"uri_list\\\" | search earliest=* latest=* uri_list=*  | rename \\\"earliest\\\" AS \\\"User.earliest\\\", \\\"latest\\\" AS \\\"User.latest\\\", \\\"uri_list\\\" AS \\\"User.uri_list\\\"\"}], \"displayName\": \"Web Intelligence\", \"description\": \"Data model for web analytics.\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 11, \"Search-Based\": 1, \"Transaction-Based\": 1}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:attributes": "{'wildcardFields': [], 'optionalFields': ['digest'], 'requiredFields': ['eai:data']}",
                    "eai:digest": "7824262e440f6db6a0ac3e01453a8d38",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            }
        ],
        "paging": {
            "total": 1,
            "perPage": 30,
            "offset": 0
        },
        "messages": [

        ]
    };

    var DM_WEB_INTELLIGENCE_PARSED = JSON.parse(DM_WEB_INTELLIGENCE_UNPARSED.entry[0].content.description);
    DM_WEB_INTELLIGENCE_PARSED.acceleration = JSON.parse(DM_WEB_INTELLIGENCE_UNPARSED.entry[0].content.acceleration);

    var DM_WEB_INTELLIGENCE_UNPARSED_NO_ACCELERATION = {
        "links": {
            "create": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/_new"
        },
        "origin": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/search\/admin\/datamodeleai",
        "updated": "2013-05-17T12:05:55-07:00",
        "generator": {
            "build": "163821",
            "version": "20130516"
        },
        "entry": [
            {
                "name": "WebIntelligence",
                "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence",
                "updated": "2013-05-17T12:05:55-07:00",
                "links": {
                    "alternate": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence",
                    "list": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence",
                    "edit": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence",
                    "remove": "\/servicesNS\/nobody\/search\/admin\/datamodeleai\/WebIntelligence"
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
                    "required": [

                    ],
                    "optional": [
                        "acceleration",
                        "concise",
                        "description",
                        "namespace",
                        "object",
                        "owner",
                        "pivot",
                        "provisional",
                        "sharing"
                    ],
                    "wildcard": [
                        "perms\\..*"
                    ]
                },
                "content": {
                    "acceleration": "{\"earliest_time\": \"-1mon\", \"enabled\": false}",
                    "description": "{\"objectNameList\": [\"HTTP_Request\", \"ApacheAccessSearch\", \"IISAccessSearch\", \"HTTP_Success\", \"HTTP_Error\", \"HTTP_Redirect\", \"Pageview\", \"AssetAccess\", \"DocAccess\", \"MediaAccess\", \"PodcastDownload\", \"WebSession\", \"User\"], \"modelName\": \"WebIntelligence\", \"objects\": [{\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"is_not_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"is_IISAccessSearch\\\" AS \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"is_not_IISAccessSearch\\\" AS \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"is_HTTP_Success\\\" AS \\\"HTTP_Request.is_HTTP_Success\\\", \\\"is_not_HTTP_Success\\\" AS \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"is_HTTP_Error\\\" AS \\\"HTTP_Request.is_HTTP_Error\\\", \\\"is_not_HTTP_Error\\\" AS \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"is_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"is_not_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_not_HTTP_Redirect\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.is_ApacheAccessSearch\\\" AS \\\"is_ApacheAccessSearch\\\", \\\"HTTP_Request.is_not_ApacheAccessSearch\\\" AS \\\"is_not_ApacheAccessSearch\\\", \\\"HTTP_Request.is_IISAccessSearch\\\" AS \\\"is_IISAccessSearch\\\", \\\"HTTP_Request.is_not_IISAccessSearch\\\" AS \\\"is_not_IISAccessSearch\\\", \\\"HTTP_Request.is_HTTP_Success\\\" AS \\\"is_HTTP_Success\\\", \\\"HTTP_Request.is_not_HTTP_Success\\\" AS \\\"is_not_HTTP_Success\\\", \\\"HTTP_Request.is_HTTP_Error\\\" AS \\\"is_HTTP_Error\\\", \\\"HTTP_Request.is_not_HTTP_Error\\\" AS \\\"is_not_HTTP_Error\\\", \\\"HTTP_Request.is_HTTP_Redirect\\\" AS \\\"is_HTTP_Redirect\\\", \\\"HTTP_Request.is_not_HTTP_Redirect\\\" AS \\\"is_not_HTTP_Redirect\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | eval \\\"is_ApacheAccessSearch\\\"=if(searchmatch(\\\"  (sourcetype = access_*) \\\"),1,0) | eval \\\"is_not_ApacheAccessSearch\\\"=if(searchmatch(\\\"NOT(   (sourcetype = access_*) )\\\"),1,0) | eval \\\"is_IISAccessSearch\\\"=if(searchmatch(\\\"  (sourcetype = iis*) \\\"),1,0) | eval \\\"is_not_IISAccessSearch\\\"=if(searchmatch(\\\"NOT(   (sourcetype = iis*) )\\\"),1,0) | eval \\\"is_HTTP_Success\\\"=if(searchmatch(\\\"  (status = 2*) \\\"),1,0) | eval \\\"is_not_HTTP_Success\\\"=if(searchmatch(\\\"NOT(   (status = 2*) )\\\"),1,0) | eval \\\"is_HTTP_Error\\\"=if(searchmatch(\\\"  (status = 4*) \\\"),1,0) | eval \\\"is_not_HTTP_Error\\\"=if(searchmatch(\\\"NOT(   (status = 4*) )\\\"),1,0) | eval \\\"is_HTTP_Redirect\\\"=if(searchmatch(\\\"  (status = 3*) \\\"),1,0) | eval \\\"is_not_HTTP_Redirect\\\"=if(searchmatch(\\\"NOT(   (status = 3*) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"is_not_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"is_IISAccessSearch\\\" AS \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"is_not_IISAccessSearch\\\" AS \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"is_HTTP_Success\\\" AS \\\"HTTP_Request.is_HTTP_Success\\\", \\\"is_not_HTTP_Success\\\" AS \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"is_HTTP_Error\\\" AS \\\"HTTP_Request.is_HTTP_Error\\\", \\\"is_not_HTTP_Error\\\" AS \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"is_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"is_not_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_not_HTTP_Redirect\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\", \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"HTTP_Request.is_HTTP_Success\\\", \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"HTTP_Request.is_HTTP_Error\\\", \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"HTTP_Request.is_not_HTTP_Redirect\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"6fd4c8e45540dae54c7d44717057ee89\", \"expression\": \"if(searchmatch(\\\"  (sourcetype = access_*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_ApacheAccessSearch\", \"fieldName\": \"is_ApacheAccessSearch\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"648fe13df9c123d95e510075c8f98498\", \"expression\": \"if(searchmatch(\\\"NOT(   (sourcetype = access_*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_ApacheAccessSearch\", \"fieldName\": \"is_not_ApacheAccessSearch\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"90e94407291d4c55b68c9eda6874743d\", \"expression\": \"if(searchmatch(\\\"  (sourcetype = iis*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_IISAccessSearch\", \"fieldName\": \"is_IISAccessSearch\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"619fcfde6c1e39b7aaf2745695e6ad4d\", \"expression\": \"if(searchmatch(\\\"NOT(   (sourcetype = iis*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_IISAccessSearch\", \"fieldName\": \"is_not_IISAccessSearch\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"78c19fdc5e57e5910615bfd964a106db\", \"expression\": \"if(searchmatch(\\\"  (status = 2*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_HTTP_Success\", \"fieldName\": \"is_HTTP_Success\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"9ce870506357d42b57ae7ec573359092\", \"expression\": \"if(searchmatch(\\\"NOT(   (status = 2*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_HTTP_Success\", \"fieldName\": \"is_not_HTTP_Success\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"358adc61f3677f789609d4b13f0eebec\", \"expression\": \"if(searchmatch(\\\"  (status = 4*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_HTTP_Error\", \"fieldName\": \"is_HTTP_Error\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"6a07e4a02d40b57555ada20db2c80a2b\", \"expression\": \"if(searchmatch(\\\"NOT(   (status = 4*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_HTTP_Error\", \"fieldName\": \"is_not_HTTP_Error\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"35b3fc152ff3f20e479467a4bc4a9c3a\", \"expression\": \"if(searchmatch(\\\"  (status = 3*) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_HTTP_Redirect\", \"fieldName\": \"is_HTTP_Redirect\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"calculationID\": \"614cc70c3d7d75142da978e8cf9043ed\", \"expression\": \"if(searchmatch(\\\"NOT(   (status = 3*) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_HTTP_Redirect\", \"fieldName\": \"is_not_HTTP_Redirect\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"HTTP_Request\", \"fieldName\": \"HTTP_Request\"}], \"parentName\": \"BaseEvent\", \"comment\": \"\", \"lineage\": \"HTTP_Request\", \"children\": [\"ApacheAccessSearch\", \"IISAccessSearch\", \"HTTP_Success\", \"HTTP_Error\", \"HTTP_Redirect\"], \"displayName\": \"HTTP_Request\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country\", \"objectName\": \"HTTP_Request\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"is_not_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"is_IISAccessSearch\\\" AS \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"is_not_IISAccessSearch\\\" AS \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"is_HTTP_Success\\\" AS \\\"HTTP_Request.is_HTTP_Success\\\", \\\"is_not_HTTP_Success\\\" AS \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"is_HTTP_Error\\\" AS \\\"HTTP_Request.is_HTTP_Error\\\", \\\"is_not_HTTP_Error\\\" AS \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"is_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"is_not_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_not_HTTP_Redirect\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.is_ApacheAccessSearch\\\" AS \\\"is_ApacheAccessSearch\\\", \\\"HTTP_Request.is_not_ApacheAccessSearch\\\" AS \\\"is_not_ApacheAccessSearch\\\", \\\"HTTP_Request.is_IISAccessSearch\\\" AS \\\"is_IISAccessSearch\\\", \\\"HTTP_Request.is_not_IISAccessSearch\\\" AS \\\"is_not_IISAccessSearch\\\", \\\"HTTP_Request.is_HTTP_Success\\\" AS \\\"is_HTTP_Success\\\", \\\"HTTP_Request.is_not_HTTP_Success\\\" AS \\\"is_not_HTTP_Success\\\", \\\"HTTP_Request.is_HTTP_Error\\\" AS \\\"is_HTTP_Error\\\", \\\"HTTP_Request.is_not_HTTP_Error\\\" AS \\\"is_not_HTTP_Error\\\", \\\"HTTP_Request.is_HTTP_Redirect\\\" AS \\\"is_HTTP_Redirect\\\", \\\"HTTP_Request.is_not_HTTP_Redirect\\\" AS \\\"is_not_HTTP_Redirect\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | eval \\\"is_ApacheAccessSearch\\\"=if(searchmatch(\\\"  (sourcetype = access_*) \\\"),1,0) | eval \\\"is_not_ApacheAccessSearch\\\"=if(searchmatch(\\\"NOT(   (sourcetype = access_*) )\\\"),1,0) | eval \\\"is_IISAccessSearch\\\"=if(searchmatch(\\\"  (sourcetype = iis*) \\\"),1,0) | eval \\\"is_not_IISAccessSearch\\\"=if(searchmatch(\\\"NOT(   (sourcetype = iis*) )\\\"),1,0) | eval \\\"is_HTTP_Success\\\"=if(searchmatch(\\\"  (status = 2*) \\\"),1,0) | eval \\\"is_not_HTTP_Success\\\"=if(searchmatch(\\\"NOT(   (status = 2*) )\\\"),1,0) | eval \\\"is_HTTP_Error\\\"=if(searchmatch(\\\"  (status = 4*) \\\"),1,0) | eval \\\"is_not_HTTP_Error\\\"=if(searchmatch(\\\"NOT(   (status = 4*) )\\\"),1,0) | eval \\\"is_HTTP_Redirect\\\"=if(searchmatch(\\\"  (status = 3*) \\\"),1,0) | eval \\\"is_not_HTTP_Redirect\\\"=if(searchmatch(\\\"NOT(   (status = 3*) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_ApacheAccessSearch\\\", \\\"is_not_ApacheAccessSearch\\\" AS \\\"HTTP_Request.is_not_ApacheAccessSearch\\\", \\\"is_IISAccessSearch\\\" AS \\\"HTTP_Request.is_IISAccessSearch\\\", \\\"is_not_IISAccessSearch\\\" AS \\\"HTTP_Request.is_not_IISAccessSearch\\\", \\\"is_HTTP_Success\\\" AS \\\"HTTP_Request.is_HTTP_Success\\\", \\\"is_not_HTTP_Success\\\" AS \\\"HTTP_Request.is_not_HTTP_Success\\\", \\\"is_HTTP_Error\\\" AS \\\"HTTP_Request.is_HTTP_Error\\\", \\\"is_not_HTTP_Error\\\" AS \\\"HTTP_Request.is_not_HTTP_Error\\\", \\\"is_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_HTTP_Redirect\\\", \\\"is_not_HTTP_Redirect\\\" AS \\\"HTTP_Request.is_not_HTTP_Redirect\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.ApacheAccessSearch\", \"search\": \"sourcetype = access_*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.ApacheAccessSearch\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"ApacheAccessSearch\", \"fieldName\": \"ApacheAccessSearch\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.ApacheAccessSearch\", \"children\": [], \"displayName\": \"ApacheAccessSearch\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*) \", \"objectName\": \"ApacheAccessSearch\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.IISAccessSearch\", \"search\": \"sourcetype = iis*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = iis*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.IISAccessSearch\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"IISAccessSearch\", \"fieldName\": \"IISAccessSearch\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.IISAccessSearch\", \"children\": [], \"displayName\": \"IISAccessSearch\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = iis*) \", \"objectName\": \"IISAccessSearch\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = iis*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"is_not_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"is_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"is_not_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.is_Pageview\\\" AS \\\"is_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\" AS \\\"is_not_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\" AS \\\"is_AssetAccess\\\", \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" AS \\\"is_not_AssetAccess\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)  | eval \\\"is_Pageview\\\"=if(searchmatch(\\\"  (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) \\\"),1,0) | eval \\\"is_not_Pageview\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) )\\\"),1,0) | eval \\\"is_AssetAccess\\\"=if(searchmatch(\\\"  (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) \\\"),1,0) | eval \\\"is_not_AssetAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"is_not_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"is_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"is_not_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\", \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"calculationID\": \"a72cd929b09b86ac70ab80c23c43f1c8\", \"expression\": \"if(searchmatch(\\\"  (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_Pageview\", \"fieldName\": \"is_Pageview\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"calculationID\": \"69919610a3f32078bec4d0a808beead5\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_Pageview\", \"fieldName\": \"is_not_Pageview\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"calculationID\": \"f050461abfd5a801f66d9f9d02a989e2\", \"expression\": \"if(searchmatch(\\\"  (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_AssetAccess\", \"fieldName\": \"is_AssetAccess\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"calculationID\": \"1f197b98405688a248f660b4df02c576\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_AssetAccess\", \"fieldName\": \"is_not_AssetAccess\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"HTTP_Success\", \"fieldName\": \"HTTP_Success\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success\", \"children\": [\"Pageview\", \"AssetAccess\"], \"displayName\": \"HTTP_Success\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*) \", \"objectName\": \"HTTP_Success\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"is_not_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"is_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"is_not_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.is_Pageview\\\" AS \\\"is_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\" AS \\\"is_not_Pageview\\\", \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\" AS \\\"is_AssetAccess\\\", \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\" AS \\\"is_not_AssetAccess\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)  | eval \\\"is_Pageview\\\"=if(searchmatch(\\\"  (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) \\\"),1,0) | eval \\\"is_not_Pageview\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) )\\\"),1,0) | eval \\\"is_AssetAccess\\\"=if(searchmatch(\\\"  (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) \\\"),1,0) | eval \\\"is_not_AssetAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_Pageview\\\", \\\"is_not_Pageview\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_Pageview\\\", \\\"is_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_AssetAccess\\\", \\\"is_not_AssetAccess\\\" AS \\\"HTTP_Request.HTTP_Success.is_not_AssetAccess\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Error\", \"search\": \"status = 4*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 4*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Error\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"HTTP_Error\", \"fieldName\": \"HTTP_Error\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Error\", \"children\": [], \"displayName\": \"HTTP_Error\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 4*) \", \"objectName\": \"HTTP_Error\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 4*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Redirect\", \"search\": \"status = 3*\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 3*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Redirect\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"HTTP_Redirect\", \"fieldName\": \"HTTP_Redirect\"}], \"parentName\": \"HTTP_Request\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Redirect\", \"children\": [], \"displayName\": \"HTTP_Redirect\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 3*) \", \"objectName\": \"HTTP_Redirect\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 3*)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.Pageview\", \"search\": \"uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.Pageview\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"Pageview\", \"fieldName\": \"Pageview\"}], \"parentName\": \"HTTP_Success\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.Pageview\", \"children\": [], \"displayName\": \"Pageview\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp) \", \"objectName\": \"Pageview\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"search\": \"uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"is_not_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"is_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"is_not_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\" AS \\\"is_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\" AS \\\"is_not_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\" AS \\\"is_MediaAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" AS \\\"is_not_MediaAccess\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)  | eval \\\"is_DocAccess\\\"=if(searchmatch(\\\"  (uri_path=*.doc OR uri_path=*.pdf) \\\"),1,0) | eval \\\"is_not_DocAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.doc OR uri_path=*.pdf) )\\\"),1,0) | eval \\\"is_MediaAccess\\\"=if(searchmatch(\\\"  (uri_path=*.avi OR uri_path=*.swf) \\\"),1,0) | eval \\\"is_not_MediaAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.avi OR uri_path=*.swf) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"is_not_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"is_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"is_not_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"calculationID\": \"ca8f57e21850a59c9680b0cf095eba42\", \"expression\": \"if(searchmatch(\\\"  (uri_path=*.doc OR uri_path=*.pdf) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_DocAccess\", \"fieldName\": \"is_DocAccess\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"calculationID\": \"0d66830d9823e3667dd9b2eef0d603db\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path=*.doc OR uri_path=*.pdf) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_DocAccess\", \"fieldName\": \"is_not_DocAccess\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"calculationID\": \"039546a4cc716493be30d901deaec65b\", \"expression\": \"if(searchmatch(\\\"  (uri_path=*.avi OR uri_path=*.swf) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_MediaAccess\", \"fieldName\": \"is_MediaAccess\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"calculationID\": \"42c8fe4a8bbf2deee4dc6665739e347d\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path=*.avi OR uri_path=*.swf) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_MediaAccess\", \"fieldName\": \"is_not_MediaAccess\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"AssetAccess\", \"fieldName\": \"AssetAccess\"}], \"parentName\": \"HTTP_Success\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"children\": [\"DocAccess\", \"MediaAccess\"], \"displayName\": \"AssetAccess\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp) \", \"objectName\": \"AssetAccess\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"is_not_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"is_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"is_not_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\" AS \\\"is_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\" AS \\\"is_not_DocAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\" AS \\\"is_MediaAccess\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\" AS \\\"is_not_MediaAccess\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)  | eval \\\"is_DocAccess\\\"=if(searchmatch(\\\"  (uri_path=*.doc OR uri_path=*.pdf) \\\"),1,0) | eval \\\"is_not_DocAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.doc OR uri_path=*.pdf) )\\\"),1,0) | eval \\\"is_MediaAccess\\\"=if(searchmatch(\\\"  (uri_path=*.avi OR uri_path=*.swf) \\\"),1,0) | eval \\\"is_not_MediaAccess\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.avi OR uri_path=*.swf) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_DocAccess\\\", \\\"is_not_DocAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_DocAccess\\\", \\\"is_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_MediaAccess\\\", \\\"is_not_MediaAccess\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.is_not_MediaAccess\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"search\": \"uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.DocAccess\", \"search\": \"uri_path=*.doc OR uri_path=*.pdf\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.doc OR uri_path=*.pdf)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.DocAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"DocAccess\", \"fieldName\": \"DocAccess\"}], \"parentName\": \"AssetAccess\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.AssetAccess.DocAccess\", \"children\": [], \"displayName\": \"DocAccess\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.doc OR uri_path=*.pdf) \", \"objectName\": \"DocAccess\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.doc OR uri_path=*.pdf)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"search\": \"uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"search\": \"uri_path=*.avi OR uri_path=*.swf\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"is_not_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\" AS \\\"is_PodcastDownload\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" AS \\\"is_not_PodcastDownload\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)  | eval \\\"is_PodcastDownload\\\"=if(searchmatch(\\\"  (uri_path=*.itpc OR uri_path=*.xml) \\\"),1,0) | eval \\\"is_not_PodcastDownload\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.itpc OR uri_path=*.xml) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"is_not_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"calculationID\": \"4486e992b7e91e56990371d40ba0280e\", \"expression\": \"if(searchmatch(\\\"  (uri_path=*.itpc OR uri_path=*.xml) \\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_PodcastDownload\", \"fieldName\": \"is_PodcastDownload\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"calculationID\": \"ee37ecc068257bb9fc7b793f5b3cc718\", \"expression\": \"if(searchmatch(\\\"NOT(   (uri_path=*.itpc OR uri_path=*.xml) )\\\"),1,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"childCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"is_not_PodcastDownload\", \"fieldName\": \"is_not_PodcastDownload\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"MediaAccess\", \"fieldName\": \"MediaAccess\"}], \"parentName\": \"AssetAccess\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"children\": [\"PodcastDownload\"], \"displayName\": \"MediaAccess\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf) \", \"objectName\": \"MediaAccess\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"is_not_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\" AS \\\"is_PodcastDownload\\\", \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\" AS \\\"is_not_PodcastDownload\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)  | eval \\\"is_PodcastDownload\\\"=if(searchmatch(\\\"  (uri_path=*.itpc OR uri_path=*.xml) \\\"),1,0) | eval \\\"is_not_PodcastDownload\\\"=if(searchmatch(\\\"NOT(   (uri_path=*.itpc OR uri_path=*.xml) )\\\"),1,0) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\", \\\"is_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_PodcastDownload\\\", \\\"is_not_PodcastDownload\\\" AS \\\"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.is_not_PodcastDownload\\\"\"}, {\"tsidxNamespace\": \"\", \"constraints\": [{\"owner\": \"HTTP_Request\", \"search\": \"sourcetype=access_* OR sourcetype=iis*\"}, {\"owner\": \"HTTP_Request.HTTP_Success\", \"search\": \"status = 2*\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess\", \"search\": \"uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess\", \"search\": \"uri_path=*.avi OR uri_path=*.swf\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.PodcastDownload\", \"search\": \"uri_path=*.itpc OR uri_path=*.xml\"}], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)   (uri_path=*.itpc OR uri_path=*.xml)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"HTTP_Request.uri\\\", \\\"HTTP_Request.uri_path\\\", \\\"HTTP_Request.status\\\", \\\"HTTP_Request.clientip\\\", \\\"HTTP_Request.referer\\\", \\\"HTTP_Request.useragent\\\", \\\"HTTP_Request.user\\\", \\\"HTTP_Request.bytes\\\", \\\"HTTP_Request.kb\\\", \\\"HTTP_Request.clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\", \\\"HTTP_Request.clientip_region\\\", \\\"HTTP_Request.clientip_country\\\"\", \"calculations\": [{\"owner\": \"HTTP_Request\", \"calculationID\": \"dbb5190566649a6db116d1eed5274a3f\", \"expression\": \"ROUND(bytes\/1000)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"KiloBytes\", \"fieldName\": \"kb\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"HTTP_Request\", \"lookupField\": \"clientip\", \"outputFields\": [{\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lon=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"lookupOutputFieldName\": \"client_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_lat=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"lookupOutputFieldName\": \"client_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_city=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_city\", \"lookupOutputFieldName\": \"client_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_region=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_region\", \"lookupOutputFieldName\": \"client_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip_country=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip_country\", \"lookupOutputFieldName\": \"client_country\", \"fieldName\": \"clientip_country\"}], \"calculationID\": \"66c4c09f7402315596588dadde2ac1d8\", \"lookupName\": \"geoip\", \"comment\": \"\", \"inputField\": \"clientip\", \"calculationType\": \"GeoIP\"}], \"fields\": [{\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"timestamp\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseEvent\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"uri_path=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"status=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"clientip=* \", \"type\": \"ipv4\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"referer=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"useragent=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"ipv4\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"HTTP_Request\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"number\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.PodcastDownload\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"PodcastDownload\", \"fieldName\": \"PodcastDownload\"}], \"parentName\": \"MediaAccess\", \"comment\": \"\", \"lineage\": \"HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.PodcastDownload\", \"children\": [], \"displayName\": \"PodcastDownload\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)   (uri_path=*.itpc OR uri_path=*.xml) \", \"objectName\": \"PodcastDownload\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*) | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\" | rename \\\"HTTP_Request.uri\\\" AS \\\"uri\\\", \\\"HTTP_Request.uri_path\\\" AS \\\"uri_path\\\", \\\"HTTP_Request.status\\\" AS \\\"status\\\", \\\"HTTP_Request.clientip\\\" AS \\\"clientip\\\", \\\"HTTP_Request.referer\\\" AS \\\"referer\\\", \\\"HTTP_Request.useragent\\\" AS \\\"useragent\\\", \\\"HTTP_Request.user\\\" AS \\\"user\\\", \\\"HTTP_Request.bytes\\\" AS \\\"bytes\\\", \\\"HTTP_Request.kb\\\" AS \\\"kb\\\", \\\"HTTP_Request.clientip_lon\\\" AS \\\"clientip_lon\\\", \\\"HTTP_Request.clientip_lat\\\" AS \\\"clientip_lat\\\", \\\"HTTP_Request.clientip_city\\\" AS \\\"clientip_city\\\", \\\"HTTP_Request.clientip_region\\\" AS \\\"clientip_region\\\", \\\"HTTP_Request.clientip_country\\\" AS \\\"clientip_country\\\" | search uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (status = 2*)   (uri_path!=*.php OR uri_path!=*.html OR uri_path!=*.shtml OR uri_path!=*.rhtml OR uri_path!=*.asp)   (uri_path=*.avi OR uri_path=*.swf)   (uri_path=*.itpc OR uri_path=*.xml)  | rename \\\"uri\\\" AS \\\"HTTP_Request.uri\\\", \\\"uri_path\\\" AS \\\"HTTP_Request.uri_path\\\", \\\"status\\\" AS \\\"HTTP_Request.status\\\", \\\"clientip\\\" AS \\\"HTTP_Request.clientip\\\", \\\"referer\\\" AS \\\"HTTP_Request.referer\\\", \\\"useragent\\\" AS \\\"HTTP_Request.useragent\\\", \\\"user\\\" AS \\\"HTTP_Request.user\\\", \\\"bytes\\\" AS \\\"HTTP_Request.bytes\\\", \\\"kb\\\" AS \\\"HTTP_Request.kb\\\", \\\"clientip_lon\\\" AS \\\"HTTP_Request.clientip_lon\\\", \\\"clientip_lat\\\" AS \\\"HTTP_Request.clientip_lat\\\", \\\"clientip_city\\\" AS \\\"HTTP_Request.clientip_city\\\", \\\"clientip_region\\\" AS \\\"HTTP_Request.clientip_region\\\", \\\"clientip_country\\\" AS \\\"HTTP_Request.clientip_country\\\"\"}, {\"objectsToGroup\": [\"ApacheAccessSearch\"], \"tsidxNamespace\": \"\", \"constraints\": [], \"objectSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | transaction mvlist=t keepevicted=f clientip useragent | search *| rename \\\"landingpage\\\" AS \\\"WebSession.landingpage\\\", \\\"exitpage\\\" AS \\\"WebSession.exitpage\\\" | rename \\\"WebSession.landingpage\\\" AS \\\"landingpage\\\", \\\"WebSession.exitpage\\\" AS \\\"exitpage\\\" | eval \\\"landingpage\\\"=mvindex(uri,0) | eval \\\"exitpage\\\"=mvindex(uri,-1) | rename \\\"landingpage\\\" AS \\\"WebSession.landingpage\\\", \\\"exitpage\\\" AS \\\"WebSession.exitpage\\\" | fields \\\"eventcount\\\", \\\"duration\\\", \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"uri\\\", \\\"uri_path\\\", \\\"status\\\", \\\"clientip\\\", \\\"referer\\\", \\\"useragent\\\", \\\"user\\\", \\\"bytes\\\", \\\"kb\\\", \\\"clientip_lon\\\", \\\"clientip_lat\\\", \\\"clientip_city\\\", \\\"clientip_region\\\", \\\"clientip_country\\\", \\\"WebSession.landingpage\\\", \\\"WebSession.exitpage\\\"\", \"groupByFields\": [\"clientip\", \"useragent\"], \"calculations\": [{\"owner\": \"WebSession\", \"calculationID\": \"4870e56e2cedab482a226a8232f569b8\", \"expression\": \"mvindex(uri,0)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"WebSession\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"landingpage\", \"fieldName\": \"landingpage\"}], \"calculationType\": \"Eval\"}, {\"owner\": \"WebSession\", \"calculationID\": \"229004ee3d95e6b4a09e5e5dfa391a22\", \"expression\": \"mvindex(uri,-1)\", \"comment\": \"\", \"outputFields\": [{\"owner\": \"WebSession\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"exitpage\", \"fieldName\": \"exitpage\"}], \"calculationType\": \"Eval\"}], \"fields\": [{\"owner\": \"BaseEventSet\", \"hidden\": false, \"fieldSearch\": \"eventcount=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"eventcount\", \"fieldName\": \"eventcount\"}, {\"owner\": \"BaseEventSet\", \"hidden\": false, \"fieldSearch\": \"duration=* \", \"type\": \"number\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"duration\", \"fieldName\": \"duration\"}, {\"owner\": \"BaseEventSet\", \"hidden\": false, \"fieldSearch\": \"_time=* \", \"type\": \"timestamp\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"_time\", \"fieldName\": \"_time\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"host\", \"fieldName\": \"host\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"source\", \"fieldName\": \"source\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"sourcetype\", \"fieldName\": \"sourcetype\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"uri\", \"fieldName\": \"uri\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"uri_path\", \"fieldName\": \"uri_path\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"status\", \"fieldName\": \"status\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip\", \"fieldName\": \"clientip\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"referer\", \"fieldName\": \"referer\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"useragent\", \"fieldName\": \"useragent\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"user\", \"fieldName\": \"user\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"bytes\", \"fieldName\": \"bytes\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"kb\", \"fieldName\": \"kb\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_lon\", \"fieldName\": \"clientip_lon\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_lat\", \"fieldName\": \"clientip_lat\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_city\", \"fieldName\": \"clientip_city\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_region\", \"fieldName\": \"clientip_region\"}, {\"owner\": \"BaseTransaction\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"string\", \"multivalue\": true, \"required\": false, \"comment\": \"\", \"displayName\": \"clientip_country\", \"fieldName\": \"clientip_country\"}, {\"owner\": \"WebSession\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"WebSession\", \"fieldName\": \"WebSession\"}], \"parentName\": \"BaseTransaction\", \"comment\": \"\", \"transactionMaxTimeSpan\": \"\", \"lineage\": \"WebSession\", \"children\": [], \"transactionMaxPause\": \"\", \"displayName\": \"WebSession\", \"previewSearch\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | transaction mvlist=t keepevicted=f clientip useragent | search * | eval \\\"landingpage\\\"=mvindex(uri,0) | eval \\\"exitpage\\\"=mvindex(uri,-1)\", \"objectName\": \"WebSession\", \"objectSearchNoFields\": \" | search  (sourcetype=access_* OR sourcetype=iis*)  uri=* uri_path=* status=* clientip=* referer=* useragent=*  | eval \\\"kb\\\"=ROUND(bytes\/1000) | lookup geoip clientip AS clientip OUTPUT client_lon AS clientip_lon client_lat AS clientip_lat client_city AS clientip_city client_region AS clientip_region client_country AS clientip_country | search  (sourcetype = access_*)  | transaction mvlist=t keepevicted=f clientip useragent | search *| rename \\\"landingpage\\\" AS \\\"WebSession.landingpage\\\", \\\"exitpage\\\" AS \\\"WebSession.exitpage\\\" | rename \\\"WebSession.landingpage\\\" AS \\\"landingpage\\\", \\\"WebSession.exitpage\\\" AS \\\"exitpage\\\" | eval \\\"landingpage\\\"=mvindex(uri,0) | eval \\\"exitpage\\\"=mvindex(uri,-1) | rename \\\"landingpage\\\" AS \\\"WebSession.landingpage\\\", \\\"exitpage\\\" AS \\\"WebSession.exitpage\\\"\"}, {\"baseSearch\": \" _time=* host=* source=* sourcetype=* uri=* status<600 clientip=* referer=* useragent=* (sourcetype = access_* OR source = *.log) | eval userid=clientip | stats first(_time) as earliest, last(_time) as latest, list(uri_path) as uri_list by userid\", \"tsidxNamespace\": \"\", \"constraints\": [], \"objectSearch\": \" _time=* host=* source=* sourcetype=* uri=* status<600 clientip=* referer=* useragent=* (sourcetype = access_* OR source = *.log) | eval userid=clientip | stats first(_time) as earliest, last(_time) as latest, list(uri_path) as uri_list by userid| rename \\\"earliest\\\" AS \\\"User.earliest\\\", \\\"latest\\\" AS \\\"User.latest\\\", \\\"uri_list\\\" AS \\\"User.uri_list\\\" | rename \\\"User.earliest\\\" AS \\\"earliest\\\", \\\"User.latest\\\" AS \\\"latest\\\", \\\"User.uri_list\\\" AS \\\"uri_list\\\" | search earliest=* latest=* uri_list=*  | rename \\\"earliest\\\" AS \\\"User.earliest\\\", \\\"latest\\\" AS \\\"User.latest\\\", \\\"uri_list\\\" AS \\\"User.uri_list\\\" | fields \\\"User.earliest\\\", \\\"User.latest\\\", \\\"User.uri_list\\\"\", \"calculations\": [], \"fields\": [{\"owner\": \"User\", \"hidden\": false, \"fieldSearch\": \"earliest=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"earliest\", \"fieldName\": \"earliest\"}, {\"owner\": \"User\", \"hidden\": false, \"fieldSearch\": \"latest=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"latest\", \"fieldName\": \"latest\"}, {\"owner\": \"User\", \"hidden\": false, \"fieldSearch\": \"uri_list=* \", \"type\": \"string\", \"multivalue\": false, \"required\": true, \"comment\": \"\", \"displayName\": \"uri_list\", \"fieldName\": \"uri_list\"}, {\"owner\": \"User\", \"hidden\": false, \"fieldSearch\": \"\", \"type\": \"objectCount\", \"multivalue\": false, \"required\": false, \"comment\": \"\", \"displayName\": \"User\", \"fieldName\": \"User\"}], \"parentName\": \"BaseSearch\", \"comment\": \"\", \"lineage\": \"User\", \"children\": [], \"displayName\": \"User\", \"previewSearch\": \" _time=* host=* source=* sourcetype=* uri=* status<600 clientip=* referer=* useragent=* (sourcetype = access_* OR source = *.log) | eval userid=clientip | stats first(_time) as earliest, last(_time) as latest, list(uri_path) as uri_list by userid | search earliest=* latest=* uri_list=* \", \"objectName\": \"User\", \"objectSearchNoFields\": \" _time=* host=* source=* sourcetype=* uri=* status<600 clientip=* referer=* useragent=* (sourcetype = access_* OR source = *.log) | eval userid=clientip | stats first(_time) as earliest, last(_time) as latest, list(uri_path) as uri_list by userid| rename \\\"earliest\\\" AS \\\"User.earliest\\\", \\\"latest\\\" AS \\\"User.latest\\\", \\\"uri_list\\\" AS \\\"User.uri_list\\\" | rename \\\"User.earliest\\\" AS \\\"earliest\\\", \\\"User.latest\\\" AS \\\"latest\\\", \\\"User.uri_list\\\" AS \\\"uri_list\\\" | search earliest=* latest=* uri_list=*  | rename \\\"earliest\\\" AS \\\"User.earliest\\\", \\\"latest\\\" AS \\\"User.latest\\\", \\\"uri_list\\\" AS \\\"User.uri_list\\\"\"}], \"displayName\": \"Web Intelligence\", \"description\": \"Data model for web analytics.\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 11, \"Search-Based\": 1, \"Transaction-Based\": 1}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:attributes": "{'wildcardFields': [], 'optionalFields': ['digest'], 'requiredFields': ['eai:data']}",
                    "eai:digest": "7824262e440f6db6a0ac3e01453a8d38",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            }
        ],
        "paging": {
            "total": 1,
            "perPage": 30,
            "offset": 0
        },
        "messages": [

        ]
    };


    var WI_FLATTENED_HIERARCHY = [
        {
            "objectName": "HTTP_Request",
            "displayName": "HTTP_Request",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request",
            "depth": 0
        },
        {
            "objectName": "ApacheAccessSearch",
            "displayName": "ApacheAccessSearch",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.ApacheAccessSearch",
            "depth": 1
        },
        {
            "objectName": "IISAccessSearch",
            "displayName": "IISAccessSearch",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.IISAccessSearch",
            "depth": 1
        },
        {
            "objectName": "HTTP_Success",
            "displayName": "HTTP_Success",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.HTTP_Success",
            "depth": 1
        },
        {
            "objectName": "Pageview",
            "displayName": "Pageview",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.HTTP_Success.Pageview",
            "depth": 2
        },
        {
            "objectName": "AssetAccess",
            "displayName": "AssetAccess",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.HTTP_Success.AssetAccess",
            "depth": 2
        },
        {
            "objectName": "DocAccess",
            "displayName": "DocAccess",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.HTTP_Success.AssetAccess.DocAccess",
            "depth": 3
        },
        {
            "objectName": "MediaAccess",
            "displayName": "MediaAccess",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.HTTP_Success.AssetAccess.MediaAccess",
            "depth": 3
        },
        {
            "objectName": "PodcastDownload",
            "displayName": "PodcastDownload",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.PodcastDownload",
            "depth": 4
        },
        {
            "objectName": "HTTP_Error",
            "displayName": "HTTP_Error",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.HTTP_Error",
            "depth": 1
        },
        {
            "objectName": "HTTP_Redirect",
            "displayName": "HTTP_Redirect",
            "rootParent": "BaseEvent",
            "lineage": "HTTP_Request.HTTP_Redirect",
            "depth": 1
        },
        {
            "objectName": "User1",
            "displayName": "User1",
            "rootParent": "BaseEvent",
            "lineage": "User1",
            "depth": 0
        },
        {
            "objectName": "WebSession",
            "displayName": "WebSession",
            "rootParent": "BaseTransaction",
            "lineage": "WebSession",
            "depth": 0
        },
        {
            "objectName": "User",
            "displayName": "User",
            "rootParent": "BaseSearch",
            "lineage": "User",
            "depth": 0
        }
    ];

    var WI_GROUPED_FLATTENED_HIERARCHY = {
        "BaseEvent": [
            {
                "objectName": "HTTP_Request",
                "displayName": "HTTP_Request",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request",
                "depth": 0
            },
            {
                "objectName": "ApacheAccessSearch",
                "displayName": "ApacheAccessSearch",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.ApacheAccessSearch",
                "depth": 1
            },
            {
                "objectName": "IISAccessSearch",
                "displayName": "IISAccessSearch",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.IISAccessSearch",
                "depth": 1
            },
            {
                "objectName": "HTTP_Success",
                "displayName": "HTTP_Success",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.HTTP_Success",
                "depth": 1
            },
            {
                "objectName": "Pageview",
                "displayName": "Pageview",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.HTTP_Success.Pageview",
                "depth": 2
            },
            {
                "objectName": "AssetAccess",
                "displayName": "AssetAccess",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.HTTP_Success.AssetAccess",
                "depth": 2
            },
            {
                "objectName": "DocAccess",
                "displayName": "DocAccess",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.HTTP_Success.AssetAccess.DocAccess",
                "depth": 3
            },
            {
                "objectName": "MediaAccess",
                "displayName": "MediaAccess",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.HTTP_Success.AssetAccess.MediaAccess",
                "depth": 3
            },
            {
                "objectName": "PodcastDownload",
                "displayName": "PodcastDownload",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.HTTP_Success.AssetAccess.MediaAccess.PodcastDownload",
                "depth": 4
            },
            {
                "objectName": "HTTP_Error",
                "displayName": "HTTP_Error",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.HTTP_Error",
                "depth": 1
            },
            {
                "objectName": "HTTP_Redirect",
                "displayName": "HTTP_Redirect",
                "rootParent": "BaseEvent",
                "lineage": "HTTP_Request.HTTP_Redirect",
                "depth": 1
            },
            {
                "objectName": "User1",
                "displayName": "User1",
                "rootParent": "BaseEvent",
                "lineage": "User1",
                "depth": 0
            }
        ],
        "BaseTransaction": [
            {
                "objectName": "WebSession",
                "displayName": "WebSession",
                "rootParent": "BaseTransaction",
                "lineage": "WebSession",
                "depth": 0
            }
        ],
        "BaseSearch": [
            {
                "objectName": "User",
                "displayName": "User",
                "rootParent": "BaseSearch",
                "lineage": "User",
                "depth": 0
            }
        ]
    };

    var WI_DEPTH_FIRST_MAPPED = [
        {
            "name": "HTTP_Request",
            "depth": 0
        },
        {
            "name": "ApacheAccessSearch",
            "depth": 1
        },
        {
            "name": "IISAccessSearch",
            "depth": 1
        },
        {
            "name": "HTTP_Success",
            "depth": 1
        },
        {
            "name": "Pageview",
            "depth": 2
        },
        {
            "name": "AssetAccess",
            "depth": 2
        },
        {
            "name": "DocAccess",
            "depth": 3
        },
        {
            "name": "MediaAccess",
            "depth": 3
        },
        {
            "name": "PodcastDownload",
            "depth": 4
        },
        {
            "name": "HTTP_Error",
            "depth": 1
        },
        {
            "name": "HTTP_Redirect",
            "depth": 1
        },
        {
            "name": "User1",
            "depth": 0
        },
        {
            "name": "WebSession",
            "depth": 0
        },
        {
            "name": "User",
            "depth": 0
        }
    ];

    var PAGEVIEW_FIELD_LIST = [
        {
            "displayName": "_time",
            "fieldName": "_time",
            "type": "timestamp",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "host",
            "fieldName": "host",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "source",
            "fieldName": "source",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "sourcetype",
            "fieldName": "sourcetype",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "uri",
            "fieldName": "uri",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "uri_path",
            "fieldName": "uri_path",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "status",
            "fieldName": "status",
            "type": "number",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "clientip",
            "fieldName": "clientip",
            "type": "ipv4",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "referer",
            "fieldName": "referer",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "useragent",
            "fieldName": "useragent",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "Pageview",
            "fieldName": "Pageview",
            "type": "objectCount",
            "hidden": false,
            "required": false,
            "owner": "HTTP_Request.HTTP_Success.Pageview"
        }
    ];

    var PAGEVIEW_CALCULATION_LIST = [
        {
            "lookupField": "clientip",
            "comment": "",
            "lookupName": "geoip",
            "owner": "HTTP_Request",
            "outputFields": [
                {
                    "displayName": "Longitude",
                    "fieldName": "clientip_lon",
                    "type": "number",
                    "localizedType": "Number",
                    "hidden": false,
                    "required": true,
                    "owner": "HTTP_Request",
                    "editable": true
                },
                {
                    "displayName": "Latitude",
                    "fieldName": "clientip_lat",
                    "type": "number",
                    "localizedType": "Number",
                    "hidden": false,
                    "required": true,
                    "owner": "HTTP_Request",
                    "editable": true
                },
                {
                    "displayName": "City",
                    "fieldName": "clientip_City",
                    "type": "string",
                    "localizedType": "String",
                    "hidden": false,
                    "required": true,
                    "owner": "HTTP_Request",
                    "editable": true
                },
                {
                    "displayName": "Region",
                    "fieldName": "clientip_Region",
                    "type": "string",
                    "localizedType": "String",
                    "hidden": false,
                    "required": true,
                    "owner": "HTTP_Request",
                    "editable": true
                },
                {
                    "displayName": "Country",
                    "fieldName": "clientip_Country",
                    "type": "string",
                    "localizedType": "String",
                    "hidden": false,
                    "required": true,
                    "owner": "HTTP_Request",
                    "editable": true
                }
            ],
            "calculationType": "GeoIP",
            "expandedType": "Geo IP",
            "inputField": "clientip",
            "editable": true
        }
    ];

    var PAGEVIEW_REPORT_FIELDS = [
        {
            "displayName": "Count of Pageview",
            "fieldName": "Pageview",
            "type": "objectCount",
            "hidden": false,
            "required": false,
            "owner": "HTTP_Request.HTTP_Success.Pageview"
        },
        {
            "displayName": "_time",
            "fieldName": "_time",
            "type": "timestamp",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "clientip",
            "fieldName": "clientip",
            "type": "ipv4",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "host",
            "fieldName": "host",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "referer",
            "fieldName": "referer",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "source",
            "fieldName": "source",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "sourcetype",
            "fieldName": "sourcetype",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "status",
            "fieldName": "status",
            "type": "number",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "uri",
            "fieldName": "uri",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "uri_path",
            "fieldName": "uri_path",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "useragent",
            "fieldName": "useragent",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        }
    ];

    var PAGEVIEW_GROUPED_REPORT_FIELDS =

    {
        "objectCount": [
            {
                "displayName": "Count of Pageview",
                "fieldName": "Pageview",
                "type": "objectCount",
                "hidden": false,
                "required": false,
                "owner": "HTTP_Request.HTTP_Success.Pageview"
            }
        ],
        "timestamp": [
            {
                "displayName": "_time",
                "fieldName": "_time",
                "type": "timestamp",
                "hidden": false,
                "required": false,
                "owner": "BaseEvent"
            }
        ],
        "other": [
            {
                "displayName": "clientip",
                "fieldName": "clientip",
                "type": "ipv4",
                "hidden": false,
                "required": true,
                "owner": "HTTP_Request"
            },
            {
                "displayName": "host",
                "fieldName": "host",
                "type": "string",
                "hidden": false,
                "required": false,
                "owner": "BaseEvent"
            },
            {
                "displayName": "referer",
                "fieldName": "referer",
                "type": "string",
                "hidden": false,
                "required": true,
                "owner": "HTTP_Request"
            },
            {
                "displayName": "source",
                "fieldName": "source",
                "type": "string",
                "hidden": false,
                "required": false,
                "owner": "BaseEvent"
            },
            {
                "displayName": "sourcetype",
                "fieldName": "sourcetype",
                "type": "string",
                "hidden": false,
                "required": false,
                "owner": "BaseEvent"
            },
            {
                "displayName": "status",
                "fieldName": "status",
                "type": "number",
                "hidden": false,
                "required": true,
                "owner": "HTTP_Request"
            },
            {
                "displayName": "uri",
                "fieldName": "uri",
                "type": "string",
                "hidden": false,
                "required": true,
                "owner": "HTTP_Request"
            },
            {
                "displayName": "uri_path",
                "fieldName": "uri_path",
                "type": "string",
                "hidden": false,
                "required": true,
                "owner": "HTTP_Request"
            },
            {
                "displayName": "useragent",
                "fieldName": "useragent",
                "type": "string",
                "hidden": false,
                "required": true,
                "owner": "HTTP_Request"
            }
        ]
    };

    var PAGEVIEW_INHERITED_FIELDS = [
        {
            "displayName": "_time",
            "fieldName": "_time",
            "type": "timestamp",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "host",
            "fieldName": "host",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "source",
            "fieldName": "source",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "sourcetype",
            "fieldName": "sourcetype",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "uri",
            "fieldName": "uri",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "uri_path",
            "fieldName": "uri_path",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "status",
            "fieldName": "status",
            "type": "number",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "clientip",
            "fieldName": "clientip",
            "type": "ipv4",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "referer",
            "fieldName": "referer",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "useragent",
            "fieldName": "useragent",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        }
    ];

    var PAGEVIEW_OWN_FIELDS = [];

    var PAGEVIEW_CONSTRAINTS_BY_OWNER = [
        {
            "owner": "HTTP_Request",
            "search": "sourcetype=access_* OR sourcetype=iis*"
        },
        {
            "owner": "HTTP_Request.HTTP_Success",
            "search": "status = 2*"
        },
        {
            "owner": "HTTP_Request.HTTP_Success.Pageview",
            "search": "uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp"
        }
    ];

    var PAGEVIEW_OWN_CONSTRAINT = {
        "owner": "HTTP_Request.HTTP_Success.Pageview",
        "search": "uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp"
    };

    var PAGEVIEW_INHERITED_CONSTRAINTS = [
            {
                "owner": "HTTP_Request",
                "search": "sourcetype=access_* OR sourcetype=iis*"
            },
            {
                "owner": "HTTP_Request.HTTP_Success",
                "search": "status = 2*"
            }
        ];

    var PAGEVIEW_ALL_PRIMITIVE_FIELDS = [
        {
            "displayName": "_time",
            "fieldName": "_time",
            "type": "timestamp",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "host",
            "fieldName": "host",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "source",
            "fieldName": "source",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "sourcetype",
            "fieldName": "sourcetype",
            "type": "string",
            "hidden": false,
            "required": false,
            "owner": "BaseEvent"
        },
        {
            "displayName": "uri",
            "fieldName": "uri",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "uri_path",
            "fieldName": "uri_path",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "status",
            "fieldName": "status",
            "type": "number",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "clientip",
            "fieldName": "clientip",
            "type": "ipv4",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "referer",
            "fieldName": "referer",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        },
        {
            "displayName": "useragent",
            "fieldName": "useragent",
            "type": "string",
            "hidden": false,
            "required": true,
            "owner": "HTTP_Request"
        }
    ];

    var PAGEVIEW_PREVIEW_SEARCH = '"     uri=* status=* clientip=* referer=* useragent=*   (status < 600)  (status = 2*)  (uri_path=*.php OR uri_path=*.html OR uri_path=*.shtml OR uri_path=*.rhtml OR uri_path=*.asp)  | lookup geoip clientip OUTPUT client_city client_country client_lat client_lon client_region | fields _time, host, source, sourcetype, uri, status, clientip, referer, useragent, uri_path, Pageview, client_city, client_country, client_lat, client_lon, client_region | fields _time,host,source,sourcetype,uri,status,clientip,referer,useragent,client_city,client_country,client_lat,client_lon,client_region,uri_path"';

    var GEOIP_CALCULATION =
    {
        "calculationID": "nmo3z3oaul6xn7b9",
        "calculationType": "GeoIP",
        "comment": "",
        "editable": true,
        "inputField": "clientip",
        "outputFields": [
            {
                "comment": "",
                "displayName": "Longitude",
                "editable": true,
                "fieldName": "clientip_lon",
                "fieldSearch": "clientip_lon=* ",
                "hidden": false,
                "lookupOutputFieldName": "lon",
                "multivalue": false,
                "owner": "HTTP_Request",
                "required": true,
                "type": "number"
            },
            {
                "comment": "",
                "displayName": "Latitude",
                "editable": true,
                "fieldName": "clientip_lat",
                "fieldSearch": "clientip_lat=* ",
                "hidden": false,
                "lookupOutputFieldName": "lat",
                "multivalue": false,
                "owner": "HTTP_Request",
                "required": true,
                "type": "number"
            },
            {
                "comment": "",
                "displayName": "City",
                "editable": true,
                "fieldName": "clientip_City",
                "fieldSearch": "clientip_City=* ",
                "hidden": false,
                "lookupOutputFieldName": "City",
                "multivalue": false,
                "owner": "HTTP_Request",
                "required": true,
                "type": "string"
            },
            {
                "comment": "",
                "displayName": "Region",
                "editable": true,
                "fieldName": "clientip_Region",
                "fieldSearch": "clientip_Region=* ",
                "hidden": false,
                "lookupOutputFieldName": "Region",
                "multivalue": false,
                "owner": "HTTP_Request",
                "required": true,
                "type": "string"
            },
            {
                "comment": "",
                "displayName": "Country",
                "editable": true,
                "fieldName": "clientip_Country",
                "fieldSearch": "clientip_Country=* ",
                "hidden": false,
                "lookupOutputFieldName": "Country",
                "multivalue": false,
                "owner": "HTTP_Request",
                "required": true,
                "type": "string"
            }
        ],
        "owner": "HTTP_Request"
    };


    var DM_DEBUGGER_UNPARSED = {
        "entry": [
            {
                "content": {
                    "displayName": "Debugger Display",
                    "objects": [
                        {
                            "constraints": [
                                {
                                    "search": "",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "search": "",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "search": "",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "search": "",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "search": "status=*",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "search": "",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "search": "",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "search": "",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "search": "",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "search": "index = _internal",
                                    "owner": "RootObject_1"
                                }
                            ],
                            "objectSearch": "     status=*     (index = _internal)  | rex field=_time \"^(?<year>)-(?<month>)-\"  | fields _time, host, source, sourcetype, status, test_boolean, test_hidden, is_RootObject_2, RootObject_1, month, year",
                            "parentName": "BaseEvent",
                            "displayName": "RootObject_1",
                            "fields": [
                                {
                                    "constraints": [],
                                    "owner": "BaseEvent",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "_time",
                                    "type": "timestamp"
                                },
                                {
                                    "constraints": [],
                                    "owner": "BaseEvent",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "host",
                                    "type": "string"
                                },
                                {
                                    "constraints": [],
                                    "owner": "BaseEvent",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "source",
                                    "type": "string"
                                },
                                {
                                    "constraints": [],
                                    "owner": "BaseEvent",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "sourcetype",
                                    "type": "string"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_1",
                                    "required": true,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "status",
                                    "type": "number"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_1",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "test_boolean",
                                    "type": "boolean"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_1",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": true,
                                    "fieldName": "test_hidden",
                                    "type": "string"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_1",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "is_RootObject_2",
                                    "type": "childCount"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_1",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "RootObject_1",
                                    "type": "objectCount"
                                }
                            ],
                            "objectName": "RootObject_1",
                            "calculations": [
                                {
                                    "expression": "^(?<year>)-(?<month>)-",
                                    "calculationType": "Rex",
                                    "inputField": "_time",
                                    "outputFields": [
                                        {
                                            "constraints": [],
                                            "owner": "RootObject_1",
                                            "required": false,
                                            "multivalue": false,
                                            "hidden": true,
                                            "fieldName": "month",
                                            "type": "string"
                                        },
                                        {
                                            "constraints": [],
                                            "owner": "RootObject_1",
                                            "required": false,
                                            "multivalue": false,
                                            "hidden": false,
                                            "fieldName": "year",
                                            "type": "string"
                                        }
                                    ],
                                    "owner": "RootObject_1"
                                }
                            ],
                            "children": [
                                "RootObject_2"
                            ]
                        },
                        {
                            "constraints": [
                                {
                                    "search": "",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "search": "",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "search": "",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "search": "",
                                    "owner": "BaseEvent"
                                },
                                {
                                    "search": "status=*",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "search": "",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "search": "",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "search": "",
                                    "owner": "RootObject_2"
                                },
                                {
                                    "search": "",
                                    "owner": "RootObject_2"
                                },
                                {
                                    "search": "index = _internal",
                                    "owner": "RootObject_1"
                                },
                                {
                                    "search": "eventtype = splunkd-access",
                                    "owner": "RootObject_2"
                                }
                            ],
                            "objectSearch": "     status=*     (index = _internal)  (eventtype = splunkd-access)  | rex field=_time \"^(?<year>)-(?<month>)-\"  | lookup geoip clientip OUTPUT client_city | eval access_type=if(host == \"sfishel-mbp15.local\", \"local\", \"external\") | fields _time, host, source, sourcetype, status, test_boolean, test_hidden, clientip, RootObject_2, month, year, client_city, access_type",
                            "parentName": "RootObject_1",
                            "displayName": "RootObject_2",
                            "fields": [
                                {
                                    "constraints": [],
                                    "owner": "BaseEvent",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "_time",
                                    "type": "timestamp"
                                },
                                {
                                    "constraints": [],
                                    "owner": "BaseEvent",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "host",
                                    "type": "string"
                                },
                                {
                                    "constraints": [],
                                    "owner": "BaseEvent",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "source",
                                    "type": "string"
                                },
                                {
                                    "constraints": [],
                                    "owner": "BaseEvent",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "sourcetype",
                                    "type": "string"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_1",
                                    "required": true,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "status",
                                    "type": "number"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_1",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "test_boolean",
                                    "type": "boolean"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_1",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": true,
                                    "fieldName": "test_hidden",
                                    "type": "string"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_2",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": true,
                                    "fieldName": "clientip",
                                    "type": "string"
                                },
                                {
                                    "constraints": [],
                                    "owner": "RootObject_2",
                                    "required": false,
                                    "multivalue": false,
                                    "hidden": false,
                                    "fieldName": "RootObject_2",
                                    "type": "objectCount"
                                }
                            ],
                            "objectName": "RootObject_2",
                            "calculations": [
                                {
                                    "expression": "^(?<year>)-(?<month>)-",
                                    "calculationType": "Rex",
                                    "inputField": "_time",
                                    "outputFields": [
                                        {
                                            "constraints": [],
                                            "owner": "RootObject_1",
                                            "required": false,
                                            "multivalue": false,
                                            "hidden": true,
                                            "fieldName": "month",
                                            "type": "string"
                                        },
                                        {
                                            "constraints": [],
                                            "owner": "RootObject_1",
                                            "required": false,
                                            "multivalue": false,
                                            "hidden": false,
                                            "fieldName": "year",
                                            "type": "string"
                                        }
                                    ],
                                    "owner": "RootObject_1"
                                },
                                {
                                    "calculationType": "Lookup",
                                    "inputField": "clientip",
                                    "outputFields": [
                                        {
                                            "constraints": [],
                                            "owner": "RootObject_2",
                                            "required": false,
                                            "multivalue": false,
                                            "hidden": true,
                                            "fieldName": "client_city",
                                            "type": "number"
                                        }
                                    ],
                                    "owner": "RootObject_2",
                                    "lookupName": "geoip"
                                },
                                {
                                    "expression": "if(host == \"sfishel-mbp15.local\", \"local\", \"external\")",
                                    "calculationType": "Eval",
                                    "outputFields": [
                                        {
                                            "constraints": [],
                                            "owner": "RootObject_2",
                                            "required": false,
                                            "multivalue": false,
                                            "hidden": false,
                                            "fieldName": "access_type",
                                            "type": "string"
                                        }
                                    ],
                                    "owner": "RootObject_2"
                                }
                            ],
                            "children": []
                        }
                    ],
                    "modelName": "Debugger",
                    "editable": false,
                    "description": "A meaningless data model for debugging purposes"
                },
                "links": {
                    "alternate": "/en-US/splunkd/__raw/servicesNS/owner/app/datamodel/Debugger"
                }
            }
        ]
    };

    var DM_DEBUGGER_PARSED = {
        "displayName": "Debugger Display",
        "description": "A meaningless data model for debugging purposes",
        "editable": false,
        "modelName": "Debugger",
        "objects": [
            {
                "fields": [
                    {
                        "required": false,
                        "fieldName": "_time",
                        "hidden": false,
                        "owner": "BaseEvent",
                        "type": "timestamp",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "host",
                        "hidden": false,
                        "owner": "BaseEvent",
                        "type": "string",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "source",
                        "hidden": false,
                        "owner": "BaseEvent",
                        "type": "string",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "sourcetype",
                        "hidden": false,
                        "owner": "BaseEvent",
                        "type": "string",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": true,
                        "fieldName": "status",
                        "hidden": false,
                        "owner": "RootObject_1",
                        "type": "number",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "test_boolean",
                        "hidden": false,
                        "owner": "RootObject_1",
                        "type": "boolean",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "test_hidden",
                        "hidden": true,
                        "owner": "RootObject_1",
                        "type": "string",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "is_RootObject_2",
                        "hidden": false,
                        "owner": "RootObject_1",
                        "type": "childCount",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "RootObject_1",
                        "hidden": false,
                        "owner": "RootObject_1",
                        "type": "objectCount",
                        "constraints": [],
                        "multivalue": false
                    }
                ],
                "calculations": [
                    {
                        "owner": "RootObject_1",
                        "inputField": "_time",
                        "expression": "^(?<year>)-(?<month>)-",
                        "calculationType": "Rex",
                        "outputFields": [
                            {
                                "required": false,
                                "fieldName": "month",
                                "hidden": true,
                                "owner": "RootObject_1",
                                "type": "string",
                                "constraints": [],
                                "multivalue": false
                            },
                            {
                                "required": false,
                                "fieldName": "year",
                                "hidden": false,
                                "owner": "RootObject_1",
                                "type": "string",
                                "constraints": [],
                                "multivalue": false
                            }
                        ]
                    }
                ],
                "objectSearch": "     status=*     (index = _internal)  | rex field=_time \"^(?<year>)-(?<month>)-\" ",
                "children": [
                    "RootObject_2"
                ],
                "displayName": "RootObject_1",
                "objectName": "RootObject_1",
                "parentName": "BaseEvent",
                "constraints": [
                    {
                        "owner": "BaseEvent",
                        "search": ""
                    },
                    {
                        "owner": "BaseEvent",
                        "search": ""
                    },
                    {
                        "owner": "BaseEvent",
                        "search": ""
                    },
                    {
                        "owner": "BaseEvent",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_1",
                        "search": "status=*"
                    },
                    {
                        "owner": "RootObject_1",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_1",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_1",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_1",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_1",
                        "search": "index = _internal"
                    }
                ]
            },
            {
                "fields": [
                    {
                        "required": false,
                        "fieldName": "_time",
                        "hidden": false,
                        "owner": "BaseEvent",
                        "type": "timestamp",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "host",
                        "hidden": false,
                        "owner": "BaseEvent",
                        "type": "string",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "source",
                        "hidden": false,
                        "owner": "BaseEvent",
                        "type": "string",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "sourcetype",
                        "hidden": false,
                        "owner": "BaseEvent",
                        "type": "string",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": true,
                        "fieldName": "status",
                        "hidden": false,
                        "owner": "RootObject_1",
                        "type": "number",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "test_boolean",
                        "hidden": false,
                        "owner": "RootObject_1",
                        "type": "boolean",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "test_hidden",
                        "hidden": true,
                        "owner": "RootObject_1",
                        "type": "string",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "clientip",
                        "hidden": true,
                        "owner": "RootObject_2",
                        "type": "string",
                        "constraints": [],
                        "multivalue": false
                    },
                    {
                        "required": false,
                        "fieldName": "RootObject_2",
                        "hidden": false,
                        "owner": "RootObject_2",
                        "type": "objectCount",
                        "constraints": [],
                        "multivalue": false
                    }
                ],
                "calculations": [
                    {
                        "owner": "RootObject_1",
                        "inputField": "_time",
                        "expression": "^(?<year>)-(?<month>)-",
                        "calculationType": "Rex",
                        "outputFields": [
                            {
                                "required": false,
                                "fieldName": "month",
                                "hidden": true,
                                "owner": "RootObject_1",
                                "type": "string",
                                "constraints": [],
                                "multivalue": false
                            },
                            {
                                "required": false,
                                "fieldName": "year",
                                "hidden": false,
                                "owner": "RootObject_1",
                                "type": "string",
                                "constraints": [],
                                "multivalue": false
                            }
                        ]
                    },
                    {
                        "owner": "RootObject_2",
                        "inputField": "clientip",
                        "lookupName": "geoip",
                        "calculationType": "Lookup",
                        "outputFields": [
                            {
                                "required": false,
                                "fieldName": "client_city",
                                "hidden": true,
                                "owner": "RootObject_2",
                                "type": "number",
                                "constraints": [],
                                "multivalue": false
                            }
                        ]
                    },
                    {
                        "owner": "RootObject_2",
                        "expression": "if(host == \"sfishel-mbp15.local\", \"local\", \"external\")",
                        "calculationType": "Eval",
                        "outputFields": [
                            {
                                "required": false,
                                "fieldName": "access_type",
                                "hidden": false,
                                "owner": "RootObject_2",
                                "type": "string",
                                "constraints": [],
                                "multivalue": false
                            }
                        ]
                    }
                ],
                "objectSearch": "     status=*     (index = _internal)  (eventtype = splunkd-access)  | rex field=_time \"^(?<year>)-(?<month>)-\"  | lookup geoip clientip OUTPUT client_city | eval access_type=if(host == \"sfishel-mbp15.local\", \"local\", \"external\")",
                "children": [],
                "displayName": "RootObject_2",
                "objectName": "RootObject_2",
                "parentName": "RootObject_1",
                "constraints": [
                    {
                        "owner": "BaseEvent",
                        "search": ""
                    },
                    {
                        "owner": "BaseEvent",
                        "search": ""
                    },
                    {
                        "owner": "BaseEvent",
                        "search": ""
                    },
                    {
                        "owner": "BaseEvent",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_1",
                        "search": "status=*"
                    },
                    {
                        "owner": "RootObject_1",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_1",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_2",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_2",
                        "search": ""
                    },
                    {
                        "owner": "RootObject_1",
                        "search": "index = _internal"
                    },
                    {
                        "owner": "RootObject_2",
                        "search": "eventtype = splunkd-access"
                    }
                ]
            }
        ]
    };

    var DM_DEBUGGER_FLATTENED_OBJECTS = [
        {
            "objectName": "RootObject_1",
            "displayName": "RootObject_1",
            "rootParent": "BaseEvent",
            "depth": 0
        },
        {
            "objectName": "RootObject_2",
            "displayName": "RootObject_2",
            "rootParent": "BaseEvent",
            "depth": 1
        }
    ];

    var ONE_OBJECT = {
        objects: [
            {
                objectName: 'object-one',
                displayName: 'display-name-one',
                parentName: 'BaseEvent'
            }
        ]
    };

    var TWO_OBJECTS = {
        objects: [
            {
                objectName: 'object-one',
                displayName: 'display-name-changed',
                parentName: 'BaseEvent'
            },
            {
                objectName: 'object-two',
                displayName: 'display-name-two',
                parentName: 'BaseEvent'
            }
        ]
    };

    var OBJECT_WITH_ONE_CALCULATION = {
        objects: [
            {
                objectName: 'object-one',
                displayName: 'first',
                parentName: 'BaseEvent',
                calculations: [
                    {
                        calculationID: 'calc-id-one',
                        calculationType: 'Lookup'
                    }
                ]
            }
        ]
    };

    var OBJECT_WITH_TWO_CALCULATIONS = {
        objects: [
            {
                objectName: 'object-one',
                displayName: 'second',
                parentName: 'BaseEvent',
                calculations: [
                    {
                        calculationID: 'calc-id-one',
                        calculationType: 'Eval'
                    },
                    {
                        calculationID: 'calc-id-two',
                        calculationType: 'Lookup'
                    }
                ]
            }
        ]
    };

    var OBJECT_WITH_ONE_FIELD = {
        objects: [
            {
                objectName: 'object-one',
                parentName: 'BaseEvent',
                fields: [
                    {
                        fieldName: 'field-one',
                        displayName: 'display-name-one'
                    }
                ]
            }
        ]
    };

    var OBJECT_WITH_TWO_FIELDS = {
        objects: [
            {
                objectName: 'object-one',
                parentName: 'BaseEvent',
                fields: [
                    {
                        fieldName: 'field-one',
                        displayName: 'display-name-changed'
                    },
                    {
                        fieldName: 'field-two',
                        displayName: 'display-name-two'
                    }
                ]
            }
        ]
    };

    var OBJECT_WITH_SINGLE_FIELD_CALCULATION = {
        objects: [
            {
                objectName: 'object-one',
                parentName: 'BaseEvent',
                calculations: [
                    {
                        calculationID: 'calc-id-one',
                        outputFields: [
                            {
                                fieldName: 'field-one',
                                displayName: 'display-name-one'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    var OBJECT_WITH_TWO_FIELD_CALCULATION = {
        objects: [
            {
                objectName: 'object-one',
                parentName: 'BaseEvent',
                calculations: [
                    {
                        calculationID: 'calc-id-one',
                        outputFields: [
                            {
                                fieldName: 'field-one',
                                displayName: 'display-name-changed'
                            },
                            {
                                fieldName: 'field-two',
                                displayName: 'display-name-two'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    var DM_SIMPLE_UNPARSED = {
        "links": {
            "create": "\/servicesNS\/admin\/search\/datamodel\/model\/_new",
            "desc": "\/servicesNS\/admin\/search\/datamodel\/model\/desc",
            "report": "\/servicesNS\/admin\/search\/datamodel\/model\/report"
        },
        "origin": "https:\/\/127.0.0.1:9089\/servicesNS\/admin\/search\/datamodel\/model",
        "updated": "2014-01-06T15:48:08-08:00",
        "generator": {
            "build": "191312",
            "version": "20131230"
        },
        "entry": [
            {
                "name": "SimpleModel",
                "id": "https:\/\/127.0.0.1:9089\/servicesNS\/admin\/search\/datamodel\/model\/SimpleModel",
                "updated": "2014-01-06T15:48:08-08:00",
                "links": {
                    "alternate": "\/servicesNS\/admin\/search\/datamodel\/model\/SimpleModel",
                    "list": "\/servicesNS\/admin\/search\/datamodel\/model\/SimpleModel",
                    "edit": "\/servicesNS\/admin\/search\/datamodel\/model\/SimpleModel",
                    "remove": "\/servicesNS\/admin\/search\/datamodel\/model\/SimpleModel"
                },
                "author": "admin",
                "acl": {
                    "app": "search",
                    "can_change_perms": true,
                    "can_list": true,
                    "can_share_app": true,
                    "can_share_global": true,
                    "can_share_user": true,
                    "can_write": true,
                    "modifiable": true,
                    "owner": "admin",
                    "perms": null,
                    "removable": true,
                    "sharing": "user"
                },
                "fields": {
                    "required": [

                    ],
                    "optional": [
                        "acceleration",
                        "concise",
                        "description",
                        "provisional"
                    ],
                    "wildcard": [

                    ]
                },
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"description\": \"\", \"displayName\": \"SimpleModel\", \"modelName\": \"SimpleModel\", \"objectNameList\": [\"root\"], \"objectSummary\": {\"Event-Based\": 1, \"Interface Implementations\": 0, \"Interfaces\": 0, \"Search-Based\": 0, \"Transaction-Based\": 0}, \"objects\": [{\"autoextractSearch\": \" (index=_internal\\n) \", \"calculations\": [{\"calculationID\": \"rannxcp1us\", \"calculationType\": \"Rex\", \"comment\": \"\", \"editable\": true, \"expression\": \"(?<splunkd>splunkd)\", \"inputField\": \"uri_path\", \"outputFields\": [{\"comment\": \"\", \"displayName\": \"SplunkD\", \"editable\": true, \"fieldName\": \"splunkd\", \"fieldSearch\": \"\", \"hidden\": false, \"multivalue\": false, \"owner\": \"root\", \"required\": false, \"type\": \"string\"}], \"owner\": \"root\"}], \"children\": [], \"comment\": \"\", \"constraints\": [{\"owner\": \"root\", \"search\": \"index=_internal\\n\"}], \"displayName\": \"root\", \"fields\": [{\"comment\": \"\", \"displayName\": \"_time\", \"editable\": false, \"fieldName\": \"_time\", \"fieldSearch\": \"\", \"hidden\": false, \"multivalue\": false, \"owner\": \"BaseEvent\", \"required\": false, \"type\": \"timestamp\"}, {\"comment\": \"\", \"displayName\": \"host\", \"editable\": false, \"fieldName\": \"host\", \"fieldSearch\": \"\", \"hidden\": false, \"multivalue\": false, \"owner\": \"BaseEvent\", \"required\": false, \"type\": \"string\"}, {\"comment\": \"\", \"displayName\": \"source\", \"editable\": false, \"fieldName\": \"source\", \"fieldSearch\": \"\", \"hidden\": false, \"multivalue\": false, \"owner\": \"BaseEvent\", \"required\": false, \"type\": \"string\"}, {\"comment\": \"\", \"displayName\": \"sourcetype\", \"editable\": false, \"fieldName\": \"sourcetype\", \"fieldSearch\": \"\", \"hidden\": false, \"multivalue\": false, \"owner\": \"BaseEvent\", \"required\": false, \"type\": \"string\"}, {\"comment\": \"\", \"displayName\": \"uri_path\", \"editable\": true, \"fieldName\": \"uri_path\", \"fieldSearch\": \"uri_path=* \", \"hidden\": false, \"multivalue\": false, \"owner\": \"root\", \"required\": true, \"type\": \"string\"}, {\"comment\": \"\", \"displayName\": \"root\", \"editable\": false, \"fieldName\": \"root\", \"fieldSearch\": \"\", \"hidden\": false, \"multivalue\": false, \"owner\": \"root\", \"required\": false, \"type\": \"objectCount\"}], \"lineage\": \"root\", \"objectName\": \"root\", \"objectSearch\": \" | search  (index=_internal\\n) | rename \\\"uri_path\\\" AS \\\"root.uri_path\\\", \\\"splunkd\\\" AS \\\"root.splunkd\\\" | rename \\\"root.uri_path\\\" AS \\\"uri_path\\\", \\\"root.splunkd\\\" AS \\\"splunkd\\\" | search uri_path=*  | rex field=\\\"uri_path\\\" \\\"(?<splunkd>splunkd)\\\" max_match=1 | rename \\\"uri_path\\\" AS \\\"root.uri_path\\\", \\\"splunkd\\\" AS \\\"root.splunkd\\\" | fields \\\"_time\\\", \\\"host\\\", \\\"source\\\", \\\"sourcetype\\\", \\\"root.uri_path\\\", \\\"root.splunkd\\\"\", \"objectSearchNoFields\": \" | search  (index=_internal\\n) | rename \\\"uri_path\\\" AS \\\"root.uri_path\\\", \\\"splunkd\\\" AS \\\"root.splunkd\\\" | rename \\\"root.uri_path\\\" AS \\\"uri_path\\\", \\\"root.splunkd\\\" AS \\\"splunkd\\\" | search uri_path=*  | rex field=\\\"uri_path\\\" \\\"(?<splunkd>splunkd)\\\" max_match=1 | rename \\\"uri_path\\\" AS \\\"root.uri_path\\\", \\\"splunkd\\\" AS \\\"root.splunkd\\\"\", \"parentName\": \"BaseEvent\", \"previewSearch\": \" | search  (index=_internal\\n)  uri_path=*  | rex field=\\\"uri_path\\\" \\\"(?<splunkd>splunkd)\\\" max_match=1\", \"tsidxNamespace\": \"\"}]}",
                    "displayName": "SimpleModel",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:attributes": "{'optionalFields': ['acceleration', 'acceleration.cron_schedule', 'acceleration.earliest_time', 'eai:data'], 'wildcardFields': [], 'requiredFields': []}",
                    "eai:digest": "06c181de313ddbd3bd3d59d5ca50fa9d",
                    "eai:type": "datamodels",
                    "eai:userName": "admin"
                }
            }
        ],
        "paging": {
            "total": 1,
            "perPage": 30,
            "offset": 0
        },
        "messages": [

        ]
    };

    return {
        DM_NEW_RESPONSE_UNPARSED: DM_NEW_RESPONSE_UNPARSED,
        DM_LIST_RESPONSE_UNPARSED: DM_LIST_RESPONSE_UNPARSED,
        DM_LIST_RESPONSE_PARSED: DM_LIST_RESPONSE_PARSED,
        DM_LIST_JSON: DM_LIST_JSON,
        SEARCH_FIELD_SUMMARY_UNPARSED: SEARCH_FIELD_SUMMARY_UNPARSED,
        DM_WEB_INTELLIGENCE_UNPARSED: DM_WEB_INTELLIGENCE_UNPARSED,
        DM_WEB_INTELLIGENCE_PARSED: DM_WEB_INTELLIGENCE_PARSED,
        DM_WEB_INTELLIGENCE_UNPARSED_NO_ACCELERATION: DM_WEB_INTELLIGENCE_UNPARSED_NO_ACCELERATION,
        WI_FLATTENED_HIERARCHY: WI_FLATTENED_HIERARCHY,
        WI_GROUPED_FLATTENED_HIERARCHY: WI_GROUPED_FLATTENED_HIERARCHY,
        WI_DEPTH_FIRST_MAPPED: WI_DEPTH_FIRST_MAPPED,
        PAGEVIEW_FIELD_LIST: PAGEVIEW_FIELD_LIST,
        PAGEVIEW_CALCULATION_LIST: PAGEVIEW_CALCULATION_LIST,
        PAGEVIEW_REPORT_FIELDS: PAGEVIEW_REPORT_FIELDS,
        PAGEVIEW_GROUPED_REPORT_FIELDS: PAGEVIEW_GROUPED_REPORT_FIELDS,
        PAGEVIEW_INHERITED_FIELDS: PAGEVIEW_INHERITED_FIELDS,
        PAGEVIEW_OWN_FIELDS: PAGEVIEW_OWN_FIELDS,
        PAGEVIEW_CONSTRAINTS_BY_OWNER: PAGEVIEW_CONSTRAINTS_BY_OWNER,
        PAGEVIEW_OWN_CONSTRAINT: PAGEVIEW_OWN_CONSTRAINT,
        PAGEVIEW_INHERITED_CONSTRAINTS: PAGEVIEW_INHERITED_CONSTRAINTS,
        PAGEVIEW_ALL_PRIMITIVE_FIELDS: PAGEVIEW_ALL_PRIMITIVE_FIELDS,
        PAGEVIEW_PREVIEW_SEARCH: PAGEVIEW_PREVIEW_SEARCH,
        GEOIP_CALCULATION: GEOIP_CALCULATION,
        DM_DEBUGGER_UNPARSED: DM_DEBUGGER_UNPARSED,
        DM_DEBUGGER_PARSED: DM_DEBUGGER_PARSED,
        DM_DEBUGGER_FLATTENED_OBJECTS: DM_DEBUGGER_FLATTENED_OBJECTS,
        ONE_OBJECT: ONE_OBJECT,
        TWO_OBJECTS: TWO_OBJECTS,
        OBJECT_WITH_ONE_CALCULATION: OBJECT_WITH_ONE_CALCULATION,
        OBJECT_WITH_TWO_CALCULATIONS: OBJECT_WITH_TWO_CALCULATIONS,
        OBJECT_WITH_ONE_FIELD: OBJECT_WITH_ONE_FIELD,
        OBJECT_WITH_TWO_FIELDS: OBJECT_WITH_TWO_FIELDS,
        OBJECT_WITH_SINGLE_FIELD_CALCULATION: OBJECT_WITH_SINGLE_FIELD_CALCULATION,
        OBJECT_WITH_TWO_FIELD_CALCULATION: OBJECT_WITH_TWO_FIELD_CALCULATION,
        DM_SIMPLE_UNPARSED: DM_SIMPLE_UNPARSED
    };
});