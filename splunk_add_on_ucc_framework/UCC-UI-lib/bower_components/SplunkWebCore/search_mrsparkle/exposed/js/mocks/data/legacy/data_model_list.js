/**
 * @author jszeto
 * @date 8/1/12
 */

define(function() {
    return (
    {
        "links": {
            "create": "/servicesNS/-/-/admin/datamodeleai/_new",
            "desc": "/servicesNS/-/-/admin/datamodeleai/desc",
            "report": "/servicesNS/-/-/admin/datamodeleai/report"
        },
        "origin": "https://127.0.0.1:9089/servicesNS/-/-/admin/datamodeleai",
        "updated": "2013-05-23T18:54:27-07:00",
        "generator": {
            "build": "164888",
            "version": "20130523"
        },
        "entry": [
            {
                "name": "Debugger",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/search/admin/datamodeleai/Debugger",
                "updated": "2013-05-23T18:54:27-07:00",
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
                            "admin",
                            "power"
                        ],
                        "write": [
                            "admin",
                            "power"
                        ]
                    },
                    "removable": false,
                    "sharing": "global"
                },
                "content": {
                    "modelName": "Debugger",
                    "objectNameList": [
                        "RootObject_1",
                        "RootObject_2"
                    ],
                    "description": "A meaningless data model for debugging purposes",
                    "displayName": "Debugger",
                    "objectSummary": {
                        "Interface Implementations": 0,
                        "Interfaces": 0,
                        "Event-Based": 2,
                        "Transaction-Based": 0,
                        "Search-Based": 0
                    }
                }
            },
            {
                "name": "FAA",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/demo_bubbles/admin/datamodeleai/FAA",
                "updated": "2013-05-23T18:54:27-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/demo_bubbles/admin/datamodeleai/FAA",
                    "list": "/servicesNS/nobody/demo_bubbles/admin/datamodeleai/FAA",
                    "edit": "/servicesNS/nobody/demo_bubbles/admin/datamodeleai/FAA",
                    "remove": "/servicesNS/nobody/demo_bubbles/admin/datamodeleai/FAA"
                },
                "author": "nobody",
                "acl": {
                    "app": "demo_bubbles",
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
                    "acceleration": "{\"enabled\": true, \"earliest_time\": \"-1mon\"}",
                    "description": "{\"modelName\": \"FAA\", \"objectNameList\": [\"flights\", \"cancelled_flights\", \"cancelled_carrier\", \"cancelled_weather\", \"cancelled_nas\", \"cancelled_security\", \"delayed\", \"delay_carrier\", \"delay_weather\", \"delay_nas\", \"delay_security\", \"delay_late_aircraft\", \"arrival_on_time\", \"diverted\", \"fly_return_flights\", \"dest_reached_diverted\", \"dest_not_reached_diverted\", \"flight_path\"], \"description\": \"Data model for the FAA data set\", \"displayName\": \"Federal Aviation Administration\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 17, \"Transaction-Based\": 1, \"Search-Based\": 0}}",
                    "eai:acl": null,
                    "eai:appName": "demo_bubbles",
                    "eai:digest": "99cfdd4af3744ee97a8ec9091623c60b",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            },
            {
                "name": "FantasyBasketball",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/search/admin/datamodeleai/FantasyBasketball",
                "updated": "2013-05-23T18:54:27-07:00",
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
                    "sharing": "global"
                },
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"modelName\": \"FantasyBasketball\", \"objectNameList\": [\"PlayerStatLine\"], \"description\": \"NBA Fantasy Basketball statistics\", \"displayName\": \"Fantasy Basketball\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 1, \"Transaction-Based\": 0, \"Search-Based\": 0}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "21d28781e80ebd524a586165a6d04193",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            },
            {
                "name": "JSONInterface",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/search/admin/datamodeleai/JSONInterface",
                "updated": "2013-05-23T18:54:27-07:00",
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
                    "acceleration": "{\"enabled\": true, \"earliest_time\": \"-1w\"}",
                    "description": "{\"modelName\": \"JSONInterface\", \"objectNameList\": [\"HTTP_Request\", \"ApacheRequest\", \"IISRequest\", \"HTTP_Success\", \"HTTP_Error\", \"Pageview\"], \"description\": \"Description of the Interface Example goes here\", \"displayName\": \"JSON Interface Example\", \"objectSummary\": {\"Interface Implementations\": 2, \"Interfaces\": 4, \"Event-Based\": 0, \"Transaction-Based\": 0, \"Search-Based\": 0}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "7e6029576251ebedd8838e833f5b5461",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            },
            {
                "name": "On_Time_On_Time_Performance",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/search/admin/datamodeleai/On_Time_On_Time_Performance",
                "updated": "2013-05-23T18:54:27-07:00",
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
                    "acceleration": "{\"enabled\": true, \"earliest_time\": \"-1w\"}",
                    "description": "{\"modelName\": \"On_Time_On_Time_Performance\", \"objectNameList\": [\"On_Time_On_Time_Performance\"], \"description\": \"FAA Data\", \"displayName\": \"On_Time_On_Time_Performance\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 0, \"Transaction-Based\": 0, \"Search-Based\": 1}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "015964a2f9be6aac864707e3dd7a6b2b",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            },
            {
                "name": "SessionOfSessions",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/bubbles/admin/datamodeleai/SessionOfSessions",
                "updated": "2013-05-23T18:54:27-07:00",
                "links": {
                    "alternate": "/servicesNS/nobody/bubbles/admin/datamodeleai/SessionOfSessions",
                    "list": "/servicesNS/nobody/bubbles/admin/datamodeleai/SessionOfSessions",
                    "edit": "/servicesNS/nobody/bubbles/admin/datamodeleai/SessionOfSessions",
                    "remove": "/servicesNS/nobody/bubbles/admin/datamodeleai/SessionOfSessions"
                },
                "author": "nobody",
                "acl": {
                    "app": "bubbles",
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
                            "*"
                        ]
                    },
                    "removable": false,
                    "sharing": "global"
                },
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"modelName\": \"SessionOfSessions\", \"objectNameList\": [\"HTTP_Request\", \"ApacheAccessSearch\", \"IISAccessSearch\", \"HTTP_Success\", \"HTTP_Error\", \"HTTP_Redirect\", \"Pageview\", \"AssetAccess\", \"DocAccess\", \"MediaAccess\", \"PodcastDownload\", \"WebSession\", \"SessionOfSessions\"], \"description\": \"Test data model with Session of Sessions.\", \"displayName\": \"Session Of Sessions\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 11, \"Transaction-Based\": 2, \"Search-Based\": 0}}",
                    "eai:acl": null,
                    "eai:appName": "bubbles",
                    "eai:digest": "bf5bdb4c1f4e9fd3c0e623b56fdb89f7",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            },
            {
                "name": "Simple_Model",
                "id": "https://127.0.0.1:9089/servicesNS/admin/bubbles/admin/datamodeleai/Simple_Model",
                "updated": "2013-05-23T18:54:27-07:00",
                "links": {
                    "alternate": "/servicesNS/admin/bubbles/admin/datamodeleai/Simple_Model",
                    "list": "/servicesNS/admin/bubbles/admin/datamodeleai/Simple_Model",
                    "edit": "/servicesNS/admin/bubbles/admin/datamodeleai/Simple_Model",
                    "remove": "/servicesNS/admin/bubbles/admin/datamodeleai/Simple_Model"
                },
                "author": "admin",
                "acl": {
                    "app": "bubbles",
                    "can_change_perms": true,
                    "can_list": true,
                    "can_share_app": true,
                    "can_share_global": true,
                    "can_share_user": true,
                    "can_write": true,
                    "modifiable": true,
                    "owner": "admin",
                    "perms": null,
                    "removable": false,
                    "sharing": "user"
                },
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"modelName\": \"Simple_Model\", \"objectNameList\": [\"main\", \"nofields\"], \"description\": \"\", \"displayName\": \"Simple Model\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 1, \"Transaction-Based\": 1, \"Search-Based\": 0}}",
                    "eai:acl": null,
                    "eai:appName": "bubbles",
                    "eai:digest": "a77640ca8ed7cedbb80a7db37dc0efb1",
                    "eai:type": "models",
                    "eai:userName": "admin"
                }
            },
            {
                "name": "Syslog_Debugger",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/search/admin/datamodeleai/Syslog_Debugger",
                "updated": "2013-05-23T18:54:27-07:00",
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
                    "description": "{\"modelName\": \"Syslog_Debugger\", \"objectNameList\": [\"Syslog_Base\"], \"description\": \"A meaningless data model for debugging purposes\", \"displayName\": \"Syslog Debugger\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 1, \"Transaction-Based\": 0, \"Search-Based\": 0}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "af35d71122ac18e1ac60b935cffbfc9d",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            },
            {
                "name": "WebIntelligence",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/search/admin/datamodeleai/WebIntelligence",
                "updated": "2013-05-23T18:54:27-07:00",
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
                    "acceleration": "{\"enabled\": true, \"earliest_time\": \"-1mon\"}",
                    "description": "{\"modelName\": \"WebIntelligence\", \"objectNameList\": [\"HTTP_Request\", \"ApacheAccessSearch\", \"IISAccessSearch\", \"HTTP_Success\", \"HTTP_Error\", \"HTTP_Redirect\", \"Pageview\", \"AssetAccess\", \"DocAccess\", \"MediaAccess\", \"PodcastDownload\", \"WebSession\", \"User\", \"newfake\", \"ggeee\", \"own\", \"New_Transaction\", \"r\", \"f\"], \"description\": \"Data model for web analytics.\", \"displayName\": \"Web Intelligence\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 13, \"Transaction-Based\": 5, \"Search-Based\": 1}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "007c5c8ec7d608ebef915aaeed8504fc",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            },
            {
                "name": "WebIntelligenceNew",
                "id": "https://127.0.0.1:9089/servicesNS/admin/search/admin/datamodeleai/WebIntelligenceNew",
                "updated": "2013-05-23T18:54:27-07:00",
                "links": {
                    "alternate": "/servicesNS/admin/search/admin/datamodeleai/WebIntelligenceNew",
                    "list": "/servicesNS/admin/search/admin/datamodeleai/WebIntelligenceNew",
                    "edit": "/servicesNS/admin/search/admin/datamodeleai/WebIntelligenceNew",
                    "remove": "/servicesNS/admin/search/admin/datamodeleai/WebIntelligenceNew"
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
                    "removable": false,
                    "sharing": "user"
                },
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"modelName\": \"WebIntelligenceNew\", \"objectNameList\": [\"HTTP_Request\", \"ApacheAccessSearch\", \"IISAccessSearch\", \"HTTP_Success\", \"HTTP_Error\", \"HTTP_Redirect\", \"Pageview\", \"AssetAccess\", \"DocAccess\", \"MediaAccess\", \"PodcastDownload\", \"WebSession\", \"User\"], \"description\": \"Data model for web analytics.\", \"displayName\": \"Web Intelligence Dolly\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 11, \"Transaction-Based\": 1, \"Search-Based\": 1}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "d714f450e0da6ccd80c79c1960167194",
                    "eai:type": "models",
                    "eai:userName": "admin"
                }
            },
            {
                "name": "simpleWebIntelligenceModel",
                "id": "https://127.0.0.1:9089/servicesNS/nobody/search/admin/datamodeleai/simpleWebIntelligenceModel",
                "updated": "2013-05-23T18:54:27-07:00",
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
                    "description": "{\"modelName\": \"simpleWebIntelligenceModel\", \"objectNameList\": [\"HTTP_Request\", \"HTTP_Success\", \"HTTP_NonSuccess\", \"Pageview\"], \"description\": \"Data model for web analytics.\", \"displayName\": \"Simple Web Intelligence\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 4, \"Transaction-Based\": 0, \"Search-Based\": 0}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "4b8806c1482de60048ce427571cd188e",
                    "eai:type": "models",
                    "eai:userName": "nobody"
                }
            },
            {
                "name": "user1DM",
                "id": "https://127.0.0.1:9089/servicesNS/user1/search/admin/datamodeleai/user1DM",
                "updated": "2013-05-23T18:54:27-07:00",
                "links": {
                    "alternate": "/servicesNS/user1/search/admin/datamodeleai/user1DM",
                    "list": "/servicesNS/user1/search/admin/datamodeleai/user1DM",
                    "edit": "/servicesNS/user1/search/admin/datamodeleai/user1DM",
                    "remove": "/servicesNS/user1/search/admin/datamodeleai/user1DM"
                },
                "author": "user1",
                "acl": {
                    "app": "search",
                    "can_change_perms": true,
                    "can_list": true,
                    "can_share_app": true,
                    "can_share_global": true,
                    "can_share_user": true,
                    "can_write": true,
                    "modifiable": true,
                    "owner": "user1",
                    "perms": null,
                    "removable": false,
                    "sharing": "user"
                },
                "content": {
                    "acceleration": "{\"enabled\": false}",
                    "description": "{\"modelName\": \"user1DM\", \"objectNameList\": [], \"description\": \"Created by User1 in search app\", \"displayName\": \"User1's DM\", \"objectSummary\": {\"Interface Implementations\": 0, \"Interfaces\": 0, \"Event-Based\": 0, \"Transaction-Based\": 0, \"Search-Based\": 0}}",
                    "eai:acl": null,
                    "eai:appName": "search",
                    "eai:digest": "86ab5d4c7494b10d58a9e1e5d0561690",
                    "eai:type": "models",
                    "eai:userName": "user1"
                }
            }
        ],
        "messages": []
    });

});

/*define(function() {
    return (
     [
         {
             "content": {
                 "description": "Description for the banner model.",
                 "editable": true,
                 "modelName": "Banner",
                 "displayName": "Banner"
             }
         },
         {
             "content": {
                 "description": "Call Detail Records",
                 "editable": false,
                 "modelName": "CDR",
                 "displayName": "Call Detail Records"
             }
         },
         {
             "content": {
                 "description": "A meaningless data model for debugging purposes",
                 "editable": true,
                 "modelName": "Debugger",
                 "displayName": "Debugger"
             }
         },
         {
             "content": {
                 "description": "Federal Aviation Administration Model",
                 "editable": false,
                 "modelName": "FAA",
                 "displayName": "Federal Aviation Administration"
             }
         },
         {
             "content": {
                 "description": "Description of the Interface Example goes here",
                 "editable": false,
                 "modelName": "InterfaceExample",
                 "displayName": "Interface Example"
             }
         },
         {
             "content": {
                 "description": "FAA Data",
                 "editable": true,
                 "modelName": "On_Time_On_Time_Performance",
                 "displayName": "On_Time_On_Time_Performance"
             }
         },
         {
             "content": {
                 "description": "Data model for Salesforce.com data.",
                 "editable": true,
                 "modelName": "Salesforce",
                 "displayName": "Salesforce"
             }
         },
         {
             "content": {
                 "description": "Test data model with Session of Sessions.",
                 "editable": true,
                 "modelName": "SessionOfSessions",
                 "displayName": "Session Of Sessions"
             }
         },
         {
             "content": {
                 "description": "A meaningless data model for debugging purposes",
                 "editable": true,
                 "modelName": "Syslog_Debugger",
                 "displayName": "Syslog Debugger"
             }
         },
         {
             "content": {
                 "description": "Data model for web analytics.",
                 "editable": true,
                 "modelName": "WebIntelligence",
                 "displayName": "Web Intelligence"
             }
         },
         {
             "content": {
                 "description": "Microsoft Exchange Server Email Logs",
                 "editable": false,
                 "modelName": "emailModel",
                 "displayName": "Email Logs"
             }
         },
         {
             "content": {
                 "description": "2012 Sales Opportunities",
                 "editable": false,
                 "modelName": "sfdc12",
                 "displayName": "Sales Force"
             }
         }
    ]);
});*/
