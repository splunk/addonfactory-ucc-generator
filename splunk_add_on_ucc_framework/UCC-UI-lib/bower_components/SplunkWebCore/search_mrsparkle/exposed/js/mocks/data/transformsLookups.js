define([], function() {

        var TRANSFORMS_LOOKUPS = {
            "links": {
                "create": "\/services\/data\/transforms\/lookups\/_new",
                "_reload": "\/services\/data\/transforms\/lookups\/_reload"
            },
            "origin": "https:\/\/127.0.0.1:9089\/services\/data\/transforms\/lookups",
            "updated": "2013-05-16T15:57:14-07:00",
            "generator": {
                "build": "163821",
                "version": "20130516"
            },
            "entry": [
                {
                    "name": "airlinelookup",
                    "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airlinelookup",
                    "updated": "2013-05-16T15:57:14-07:00",
                    "links": {
                        "alternate": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airlinelookup",
                        "list": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airlinelookup",
                        "_reload": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airlinelookup\/_reload",
                        "edit": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airlinelookup",
                        "disable": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airlinelookup\/disable"
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
                        "sharing": "global"
                    },
                    "content": {
                        "CAN_OPTIMIZE": true,
                        "CLEAN_KEYS": true,
                        "DEFAULT_VALUE": "",
                        "DEST_KEY": "",
                        "FORMAT": "",
                        "KEEP_EMPTY_VALS": false,
                        "LOOKAHEAD": "4096",
                        "MV_ADD": false,
                        "REGEX": "",
                        "SOURCE_KEY": "_raw",
                        "WRITE_META": "0",
                        "disabled": false,
                        "eai:acl": null,
                        "eai:appName": "search",
                        "eai:userName": "admin",
                        "filename": "airline_lookup.csv",
                        "type": "file"
                    }
                },
                {
                    "name": "airportgeolookup",
                    "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportgeolookup",
                    "updated": "2013-05-16T15:57:14-07:00",
                    "links": {
                        "alternate": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportgeolookup",
                        "list": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportgeolookup",
                        "_reload": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportgeolookup\/_reload",
                        "edit": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportgeolookup",
                        "disable": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportgeolookup\/disable"
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
                        "sharing": "global"
                    },
                    "content": {
                        "CAN_OPTIMIZE": true,
                        "CLEAN_KEYS": true,
                        "DEFAULT_VALUE": "",
                        "DEST_KEY": "",
                        "FORMAT": "",
                        "KEEP_EMPTY_VALS": false,
                        "LOOKAHEAD": "4096",
                        "MV_ADD": false,
                        "REGEX": "",
                        "SOURCE_KEY": "_raw",
                        "WRITE_META": "0",
                        "disabled": false,
                        "eai:acl": null,
                        "eai:appName": "search",
                        "eai:userName": "admin",
                        "filename": "airport_geo_lookup.csv",
                        "type": "file"
                    }
                },
                {
                    "name": "airportlookup",
                    "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportlookup",
                    "updated": "2013-05-16T15:57:14-07:00",
                    "links": {
                        "alternate": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportlookup",
                        "list": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportlookup",
                        "_reload": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportlookup\/_reload",
                        "edit": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportlookup",
                        "disable": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airportlookup\/disable"
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
                        "sharing": "global"
                    },
                    "content": {
                        "CAN_OPTIMIZE": true,
                        "CLEAN_KEYS": true,
                        "DEFAULT_VALUE": "",
                        "DEST_KEY": "",
                        "FORMAT": "",
                        "KEEP_EMPTY_VALS": false,
                        "LOOKAHEAD": "4096",
                        "MV_ADD": false,
                        "REGEX": "",
                        "SOURCE_KEY": "_raw",
                        "WRITE_META": "0",
                        "disabled": false,
                        "eai:acl": null,
                        "eai:appName": "search",
                        "eai:userName": "admin",
                        "filename": "airport_lookup.csv",
                        "type": "file"
                    }
                },
                {
                    "name": "airports",
                    "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airports",
                    "updated": "2013-05-16T15:57:14-07:00",
                    "links": {
                        "alternate": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airports",
                        "list": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airports",
                        "_reload": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airports\/_reload",
                        "edit": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airports",
                        "disable": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/airports\/disable"
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
                        "sharing": "global"
                    },
                    "content": {
                        "CAN_OPTIMIZE": true,
                        "CLEAN_KEYS": true,
                        "DEFAULT_VALUE": "",
                        "DEST_KEY": "",
                        "FORMAT": "",
                        "KEEP_EMPTY_VALS": false,
                        "LOOKAHEAD": "4096",
                        "MV_ADD": false,
                        "REGEX": "",
                        "SOURCE_KEY": "_raw",
                        "WRITE_META": "0",
                        "disabled": false,
                        "eai:acl": null,
                        "eai:appName": "search",
                        "eai:userName": "admin",
                        "filename": "airports.csv",
                        "type": "file"
                    }
                },
                {
                    "name": "cancellationlookup",
                    "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/cancellationlookup",
                    "updated": "2013-05-16T15:57:14-07:00",
                    "links": {
                        "alternate": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/cancellationlookup",
                        "list": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/cancellationlookup",
                        "_reload": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/cancellationlookup\/_reload",
                        "edit": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/cancellationlookup",
                        "disable": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/cancellationlookup\/disable"
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
                        "sharing": "global"
                    },
                    "content": {
                        "CAN_OPTIMIZE": true,
                        "CLEAN_KEYS": true,
                        "DEFAULT_VALUE": "",
                        "DEST_KEY": "",
                        "FORMAT": "",
                        "KEEP_EMPTY_VALS": false,
                        "LOOKAHEAD": "4096",
                        "MV_ADD": false,
                        "REGEX": "",
                        "SOURCE_KEY": "_raw",
                        "WRITE_META": "0",
                        "disabled": false,
                        "eai:acl": null,
                        "eai:appName": "search",
                        "eai:userName": "admin",
                        "filename": "cancellation_lookup.csv",
                        "type": "file"
                    }
                },
                {
                    "name": "dnslookup",
                    "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/dnslookup",
                    "updated": "2014-01-27T12:28:25-08:00",
                    "links": {
                        "alternate": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/dnslookup",
                        "list": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/dnslookup",
                        "_reload": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/dnslookup\/_reload",
                        "edit": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/dnslookup",
                        "disable": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/dnslookup\/disable"
                    },
                    "author": "nobody",
                    "acl": {
                        "app": "system",
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
                                "admin"
                            ]
                        },
                        "removable": false,
                        "sharing": "system"
                    },
                    "content": {
                        "CAN_OPTIMIZE": true,
                        "CLEAN_KEYS": true,
                        "DEFAULT_VALUE": "",
                        "DEST_KEY": "",
                        "FORMAT": "",
                        "KEEP_EMPTY_VALS": false,
                        "LOOKAHEAD": "4096",
                        "MV_ADD": false,
                        "REGEX": "",
                        "SOURCE_KEY": "_raw",
                        "WRITE_META": "False",
                        "disabled": false,
                        "eai:acl": null,
                        "eai:appName": "search",
                        "eai:userName": "admin",
                        "external_cmd": "external_lookup.py clienthost clientip",
                        "fields_array": ["clienthost","clientip"],
                        "type": "external"
                    }
                },
                {
                    "name": "sid_lookup",
                    "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/sid_lookup",
                    "updated": "2013-05-16T15:57:14-07:00",
                    "links": {
                        "alternate": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/sid_lookup",
                        "list": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/sid_lookup",
                        "_reload": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/sid_lookup\/_reload",
                        "edit": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/sid_lookup",
                        "disable": "\/servicesNS\/nobody\/system\/data\/transforms\/lookups\/sid_lookup\/disable"
                    },
                    "author": "nobody",
                    "acl": {
                        "app": "system",
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
                                "admin"
                            ]
                        },
                        "removable": false,
                        "sharing": "system"
                    },
                    "content": {
                        "CAN_OPTIMIZE": true,
                        "CLEAN_KEYS": true,
                        "DEFAULT_VALUE": "",
                        "DEST_KEY": "",
                        "FORMAT": "",
                        "KEEP_EMPTY_VALS": false,
                        "LOOKAHEAD": "4096",
                        "MV_ADD": false,
                        "REGEX": "",
                        "SOURCE_KEY": "_raw",
                        "WRITE_META": "0",
                        "disabled": false,
                        "eai:acl": null,
                        "eai:appName": "search",
                        "eai:userName": "admin",
                        "filename": "sid_lookup.csv",
                        "max_matches": 1,
                        "min_matches": 1,
                        "type": "file"
                    }
                },
                {
                    "name": "weekdaylookup",
                    "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/weekdaylookup",
                    "updated": "2013-05-16T15:57:14-07:00",
                    "links": {
                        "alternate": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/weekdaylookup",
                        "list": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/weekdaylookup",
                        "_reload": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/weekdaylookup\/_reload",
                        "edit": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/weekdaylookup",
                        "disable": "\/servicesNS\/nobody\/demo_bubbles\/data\/transforms\/lookups\/weekdaylookup\/disable"
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
                        "sharing": "global"
                    },
                    "content": {
                        "CAN_OPTIMIZE": true,
                        "CLEAN_KEYS": true,
                        "DEFAULT_VALUE": "",
                        "DEST_KEY": "",
                        "FORMAT": "",
                        "KEEP_EMPTY_VALS": false,
                        "LOOKAHEAD": "4096",
                        "MV_ADD": false,
                        "REGEX": "",
                        "SOURCE_KEY": "_raw",
                        "WRITE_META": "0",
                        "disabled": false,
                        "eai:acl": null,
                        "eai:appName": "search",
                        "eai:userName": "admin",
                        "filename": "weekday_lookup.csv",
                        "type": "file"
                    }
                },
                {
                    "name": "warriors_roster",
                    "id": "https:\/\/127.0.0.1:9089\/servicesNS\/nobody\/ui_components_testing\/data\/transforms\/lookups\/warriors_roster",
                    "updated": "2014-01-27T12:28:25-08:00",
                    "links": {
                        "alternate": "\/servicesNS\/nobody\/ui_components_testing\/data\/transforms\/lookups\/warriors_roster",
                        "list": "\/servicesNS\/nobody\/ui_components_testing\/data\/transforms\/lookups\/warriors_roster",
                        "_reload": "\/servicesNS\/nobody\/ui_components_testing\/data\/transforms\/lookups\/warriors_roster\/_reload",
                        "edit": "\/servicesNS\/nobody\/ui_components_testing\/data\/transforms\/lookups\/warriors_roster",
                        "remove": "\/servicesNS\/nobody\/ui_components_testing\/data\/transforms\/lookups\/warriors_roster",
                        "move": "\/servicesNS\/nobody\/ui_components_testing\/data\/transforms\/lookups\/warriors_roster\/move",
                        "disable": "\/servicesNS\/nobody\/ui_components_testing\/data\/transforms\/lookups\/warriors_roster\/disable"
                    },
                    "author": "admin",
                    "acl": {
                        "app": "ui_components_testing",
                        "can_change_perms": true,
                        "can_list": true,
                        "can_share_app": true,
                        "can_share_global": true,
                        "can_share_user": true,
                        "can_write": true,
                        "modifiable": true,
                        "owner": "admin",
                        "perms": {
                            "read": [
                                "*"
                            ],
                            "write": [
                                "*"
                            ]
                        },
                        "removable": true,
                        "sharing": "global"
                    },
                    "content": {
                        "CAN_OPTIMIZE": true,
                        "CLEAN_KEYS": true,
                        "DEFAULT_VALUE": "",
                        "DEST_KEY": "",
                        "FORMAT": "",
                        "KEEP_EMPTY_VALS": false,
                        "LOOKAHEAD": "4096",
                        "MV_ADD": false,
                        "REGEX": "",
                        "SOURCE_KEY": "_raw",
                        "WRITE_META": "False",
                        "disabled": false,
                        "eai:acl": null,
                        "eai:appName": "search",
                        "eai:userName": "admin",
                        "fields_array": [
                            "Number",
                            "First",
                            "Last",
                            "Position"
                        ],
                        "filename": "warriors.csv",
                        "type": "file"
                    }
                }
            ],
            "paging": {
                "total": 10,
                "perPage": 30,
                "offset": 0
            },
            "messages": [

            ]
        };

        return {TRANSFORMS_LOOKUPS:TRANSFORMS_LOOKUPS};
    }
);