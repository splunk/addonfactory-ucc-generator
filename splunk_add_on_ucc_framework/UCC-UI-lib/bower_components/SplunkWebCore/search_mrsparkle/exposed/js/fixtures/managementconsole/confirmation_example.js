define({
    "entry": [
        {
            "content": {
                "taskId": "7CACE970-2651-4154-9E37-FB085973C179",
                "changedBy": "system",
                "commandId": "B1B28BDE-FB66-44E8-BB55-FE3BD8021028",
                "stageId": "B5207E8E-5FB4-4D7D-A941-8FE517D39797",
                "changedAt": 1466016654.62477,
                "payload": {
                    "question_type": "deployment_server_migration",
                    "data": {
                        "timestamp": 1466016654.17734,
                        "confs": [
                            [
                                "system",
                                "local",
                                "serverclass.conf"
                            ]
                        ],
                        "apps": {
                            "appp": {
                                "messages": [
                                    "Could not find application under /Users/lrong/splunk/develop/etc/deployment-apps/appp."
                                ],
                                "canMigrate": false
                            },
                            "routemap": {
                                "messages": [
                                    "Could not find application under /Users/lrong/splunk/develop/etc/deployment-apps/routemap."
                                ],
                                "canMigrate": false
                            },
                            "badapp": {
                                "messages": [
                                    "Key blacklist.1=rarity is unsupported for app.",
                                    "Key blacklist.0=ronnie is unsupported for app.",
                                    "Key filterType=whitelist is unsupported for app.",
                                    "Could not find application under /Users/lrong/splunk/develop/etc/deployment-apps/badapp."
                                ],
                                "canMigrate": false
                            }
                        },
                        "groups": {
                            "_forwarders": {
                                "messages": [],
                                "canMigrate": true,
                                "migrated": {
                                    "machineTypesFilter": "",
                                    "description": "",
                                    "whitelist": "*",
                                    "blacklist": "",
                                    "name": "group_1466016654_forwarders",
                                    "filterType": "whitelist"
                                }
                            },
                            "class1": {
                                "messages": [],
                                "canMigrate": true,
                                "migrated": {
                                    "machineTypesFilter": "",
                                    "description": "",
                                    "whitelist": "185.2.3.*, fwdr-*",
                                    "blacklist": "ronnie, rarity",
                                    "name": "class1",
                                    "filterType": "whitelist"
                                }
                            },
                            "class1blacklist": {
                                "messages": [
                                    "Value blacklist is not supported for key filterType (possible values are whitelist)."
                                ],
                                "canMigrate": false
                            }
                        }
                    },
                    "choices": [
                        {
                            "description": "Backup and migrate",
                            "key": "m"
                        },
                        {
                            "description": "Backup and skip migration",
                            "key": "s"
                        }
                    ],
                    "question": [
                        "Found existing Deployment Server settings. How do you want to continue migration?",
                        "Note:",
                        " All serverclass.conf configuration files",
                        " (excluding $SPLUNK_ETC/system/default)",
                        " and $SPLUNK_ETC/deployment-apps folder",
                        " will be backed up in place with extension .1466016654.bak.",
                        " Migration may trigger all deployment clients to redownload all applications."
                    ]
                },
                "executeAfter": 1466016654.62483,
                "state": "interactive",
                "createdAt": 1466016654.62477,
                "type": "confirm"
            },
            "name": "B1B28BDE-FB66-44E8-BB55-FE3BD8021028"
        }
    ],
    "paging": {
        "offset": 0,
            "total": 1,
            "perPage": 1
    }
});