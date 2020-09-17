define({
    "paging": {
        "perPage": 30,
        "offset": 0,
        "total": 10
    },
    "entry": [
        {
            "name": "Application",
            "@status": "pending",
            "links": {
                "alternate": "/services/dmc/config/inputs/_server_class_1/wineventlog/Application",
                "delete": "/services/dmc/config/inputs/_server_class_1/wineventlog/Application",
                "edit": "/services/dmc/config/inputs/_server_class_1/wineventlog/Application",
                "disable": "/services/dmc/config/inputs/_server_class_1/wineventlog/Application/disable",
                "list": "/services/dmc/config/inputs/_server_class_1/wineventlog/Application",
                "move": "/services/dmc/config/inputs/_server_class_1/wineventlog/Application/move"
            },
            "acl": {
                "@bundleId": "server_class_1",
                "app": "_server_class_1",
                "@bundleType": "custom"
            },
            "content": {
                "index": "main"
            }
        },
        {
            "name": "Application",
            "@status": "pending",
            "links": {
                "alternate": "/services/dmc/config/inputs/__forwarders/wineventlog/Application",
                "delete": "/services/dmc/config/inputs/__forwarders/wineventlog/Application",
                "edit": "/services/dmc/config/inputs/__forwarders/wineventlog/Application",
                "disable": "/services/dmc/config/inputs/__forwarders/wineventlog/Application/disable",
                "list": "/services/dmc/config/inputs/__forwarders/wineventlog/Application",
                "move": "/services/dmc/config/inputs/__forwarders/wineventlog/Application/move"
            },
            "acl": {
                "@bundleId": "forwarders",
                "app": "__forwarders",
                "@bundleType": "builtin"
            },
            "content": {
                "index": "main"
            }
        },
        {
            "name": "Application",
            "@status": "pending",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Application",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Application",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Application",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Application/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Application",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Application/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "renderXml": "false",
                "index": "wineventlog",
                "start_from": "oldest",
                "current_only": "0",
                "checkpointInterval": "5",
                "disabled": "1"
            }
        },
        {
            "name": "Forwarded Events",
            "@status": "pending",
            "links": {
                "alternate": "/services/dmc/config/inputs/_server_class_1/wineventlog/Forwarded%2520Events",
                "delete": "/services/dmc/config/inputs/_server_class_1/wineventlog/Forwarded%2520Events",
                "edit": "/services/dmc/config/inputs/_server_class_1/wineventlog/Forwarded%2520Events",
                "disable": "/services/dmc/config/inputs/_server_class_1/wineventlog/Forwarded%2520Events/disable",
                "list": "/services/dmc/config/inputs/_server_class_1/wineventlog/Forwarded%2520Events",
                "move": "/services/dmc/config/inputs/_server_class_1/wineventlog/Forwarded%2520Events/move"
            },
            "acl": {
                "@bundleId": "server_class_1",
                "app": "_server_class_1",
                "@bundleType": "custom"
            },
            "content": {
                "index": "main"
            }
        },
        {
            "name": "Forwarded Events",
            "@status": "pending",
            "links": {
                "alternate": "/services/dmc/config/inputs/__forwarders/wineventlog/Forwarded%2520Events",
                "delete": "/services/dmc/config/inputs/__forwarders/wineventlog/Forwarded%2520Events",
                "edit": "/services/dmc/config/inputs/__forwarders/wineventlog/Forwarded%2520Events",
                "disable": "/services/dmc/config/inputs/__forwarders/wineventlog/Forwarded%2520Events/disable",
                "list": "/services/dmc/config/inputs/__forwarders/wineventlog/Forwarded%2520Events",
                "move": "/services/dmc/config/inputs/__forwarders/wineventlog/Forwarded%2520Events/move"
            },
            "acl": {
                "@bundleId": "forwarders",
                "app": "__forwarders",
                "@bundleType": "builtin"
            },
            "content": {
                "index": "main"
            }
        },
        {
            "name": "Security",
            "@status": "pending",
            "links": {
                "alternate": "/services/dmc/config/inputs/__forwarders/wineventlog/Security",
                "delete": "/services/dmc/config/inputs/__forwarders/wineventlog/Security",
                "edit": "/services/dmc/config/inputs/__forwarders/wineventlog/Security",
                "disable": "/services/dmc/config/inputs/__forwarders/wineventlog/Security/disable",
                "list": "/services/dmc/config/inputs/__forwarders/wineventlog/Security",
                "move": "/services/dmc/config/inputs/__forwarders/wineventlog/Security/move"
            },
            "acl": {
                "@bundleId": "forwarders",
                "app": "__forwarders",
                "@bundleType": "builtin"
            },
            "content": {
                "index": "main"
            }
        },
        {
            "name": "Security",
            "@status": "deployed",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Security",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Security",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Security",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Security/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Security",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/Security/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "renderXml": "false",
                "current_only": "0",
                "checkpointInterval": "5",
                "start_from": "oldest",
                "blacklist1": "EventCode=\"4662\" Message=\"Object Type:\\s+(?!groupPolicyContainer)\"",
                "evt_resolve_ad_obj": "1",
                "blacklist2": "EventCode=\"566\" Message=\"Object Type:\\s+(?!groupPolicyContainer)\"",
                "disabled": "1",
                "index": "wineventlog"
            }
        },
        {
            "name": "Setup",
            "@status": "pending",
            "links": {
                "alternate": "/services/dmc/config/inputs/__forwarders/wineventlog/Setup",
                "delete": "/services/dmc/config/inputs/__forwarders/wineventlog/Setup",
                "edit": "/services/dmc/config/inputs/__forwarders/wineventlog/Setup",
                "disable": "/services/dmc/config/inputs/__forwarders/wineventlog/Setup/disable",
                "list": "/services/dmc/config/inputs/__forwarders/wineventlog/Setup",
                "move": "/services/dmc/config/inputs/__forwarders/wineventlog/Setup/move"
            },
            "acl": {
                "@bundleId": "forwarders",
                "app": "__forwarders",
                "@bundleType": "builtin"
            },
            "content": {
                "index": "main"
            }
        },
        {
            "name": "System",
            "@status": "pending",
            "links": {
                "alternate": "/services/dmc/config/inputs/__forwarders/wineventlog/System",
                "delete": "/services/dmc/config/inputs/__forwarders/wineventlog/System",
                "edit": "/services/dmc/config/inputs/__forwarders/wineventlog/System",
                "disable": "/services/dmc/config/inputs/__forwarders/wineventlog/System/disable",
                "list": "/services/dmc/config/inputs/__forwarders/wineventlog/System",
                "move": "/services/dmc/config/inputs/__forwarders/wineventlog/System/move"
            },
            "acl": {
                "@bundleId": "forwarders",
                "app": "__forwarders",
                "@bundleType": "builtin"
            },
            "content": {
                "index": "main"
            }
        },
        {
            "name": "System",
            "@status": "deployed",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/System",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/System",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/System",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/System/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/System",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/wineventlog/System/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "renderXml": "false",
                "index": "wineventlog",
                "start_from": "oldest",
                "current_only": "0",
                "checkpointInterval": "5",
                "disabled": "1"
            }
        }
    ]
});

