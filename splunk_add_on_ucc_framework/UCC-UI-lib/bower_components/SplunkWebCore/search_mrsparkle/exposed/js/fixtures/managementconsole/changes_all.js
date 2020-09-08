/**
 * Created by lrong on 1/15/16.
 */
// GET /services/dmc/changes
define({
    "entry": [
        {
            "content": {
                "state": "pending",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "app",
                "entityName": "TA_Linux",
                "operation": "install",
                "app.location.before": null,
                "app.location.after": "Server Role: Forwarders",
                "app.hasUpload": false
            },
            "name": "pending_change"
        },
        {
            "content": {
                "state": "pending",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "app",
                "entityName": "TA_Linux",
                "operation": "uninstall",
                "app.location.before": "Server Role: Forwarders",
                "app.location.after": null,
                "app.hasUpload": false
            },
            "name": "app_change_2"
        },
        {
            "content": {
                "state": "pending",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "app",
                "entityName": "TA_Linux",
                "operation": "update",
                "app.location.before": "Server Role: Forwarders",
                "app.location.after": "Server Role: Forwarders",
                "app.hasUpload": true
            },
            "name": "app_change_3"
        },
        {
            "content": {
                "state": "pending",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "stanza",
                "entityName": "New Stanza",
                "operation": "new",
                "stanza.context": "Server Role: Forwarders",
                "stanza.target": "inputs",
                "stanza.before": null,
                "stanza.after": [["a", "1"], ["b", "4"]],
                "stanza.attrRemoved": null,
                "stanza.attrAdded": [["a", "1"], ["b", "4"]],
                "stanza.attrUpdated": null
            },
            "name": "stanza_change_1"
        },
        {
            "content": {
                "state": "pending",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "stanza",
                "entityName": "New Stanza",
                "operation": "delete",
                "stanza.context": "Server Class: server_class_1",
                "stanza.target": "outputs",
                "stanza.before": [["a", "1"], ["b", "4"]],
                "stanza.after": null,
                "stanza.attrRemoved": null,
                "stanza.attrAdded": null,
                "stanza.attrUpdated": null
            },
            "name": "stanza_change_2"
        },
        {
            "content": {
                "state": "pending",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "stanza",
                "entityName": "New Stanza",
                "operation": "modify",
                "stanza.context": "Node: abc",
                "stanza.target": "alert_actions",
                "stanza.before": [["a", "1"], ["b", "4"], ["foo", "4"], ["bar", "4"]],
                "stanza.after": [["a", "3"], ["b", "1"]],
                "stanza.attrRemoved": ["foo", "bar"],
                "stanza.attrAdded": null,
                "stanza.attrUpdated": [["a", "3"], ["b", "1"]]
            },
            "name": "stanza_change_3"
        },
        {
            "content": {
                "state": "pending",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "serverClass",
                "entityName": "server_class_1",
                "operation": "create",
                "serverClass.whitelist.before": null,
                "serverClass.whitelist.after": ["dmc*", "185.2.3.*", "fwdr-*"],
                "serverClass.blacklist.before": null,
                "serverClass.blacklist.after": [],
                "serverClass.machineType.before": null,
                "serverClass.machineType.after": []
            },
            "name": "serverClass_change_1"
        },
        {
            "content": {
                "state": "pending",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "serverClass",
                "entityName": "server_class_1",
                "operation": "delete",
                "serverClass.whitelist.before": ["dmc*", "185.2.3.*", "fwdr-*"],
                "serverClass.whitelist.after": null,
                "serverClass.blacklist.before": [],
                "serverClass.blacklist.after": null,
                "serverClass.machineType.before": [],
                "serverClass.machineType.after": null
            },
            "name": "serverClass_change_2"
        },
        {
            "content": {
                "state": "pending",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "serverClass",
                "entityName": "server_class_1",
                "operation": "modify",
                "serverClass.whitelist.before": ["dmc*"],
                "serverClass.whitelist.after": ["dmc*", "185.2.3.*", "fwdr-*"],
                "serverClass.blacklist.before": [],
                "serverClass.blacklist.after": [],
                "serverClass.machineType.before": [],
                "serverClass.machineType.after": ["darwin-x86_64"]
            },
            "name": "serverClass_change_3"
        },
        {
            "content": {
                "state": "deployed",
                "deployedOn": "2015-10-09T13:40:20.703158",
                "deployedBy": "admin",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "app",
                "entityName": "TA_Linux",
                "operation": "install",
                "app.location.before": null,
                "app.location.after": "Server Role: Forwarders",
                "app.hasUpload": false
            },
            "name": "deployed_change_1"
        },
        {
            "content": {
                "state": "deployed",
                "deployedOn": "2015-10-09T13:55:20.703158",
                "deployedBy": "admin",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "stanza",
                "entityName": "New Stanza",
                "operation": "delete",
                "stanza.context": "Server Class: server_class_1",
                "stanza.target": "outputs",
                "stanza.before": [["a", "1"], ["b", "4"]],
                "stanza.after": null,
                "stanza.attrRemoved": null,
                "stanza.attrAdded": null,
                "stanza.attrUpdated": null
            },
            "name": "deployed_change_2"
        },
        {
            "content": {
                "state": "deployed",
                "deployedOn": "2015-10-09T13:40:20.703158",
                "deployedBy": "admin",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "serverClass",
                "entityName": "server_class_1",
                "operation": "delete",
                "serverClass.whitelist.before": ["dmc*", "185.2.3.*", "fwdr-*"],
                "serverClass.whitelist.after": null,
                "serverClass.blacklist.before": [],
                "serverClass.blacklist.after": null,
                "serverClass.machineType.before": [],
                "serverClass.machineType.after": null
            },
            "name": "deployed_change_3"
        },
        {
            "content": {
                "state": "deployed",
                "deployedOn": "2015-10-09T13:40:20.703158",
                "deployedBy": "admin",
                "editTime": "2015-10-09T13:23:20.703158",
                "editUser": "admin",
                "entityType": "serverClass",
                "entityName": "server_class_1",
                "operation": "modify",
                "serverClass.whitelist.before": ["dmc*"],
                "serverClass.whitelist.after": ["dmc*", "185.2.3.*", "fwdr-*"],
                "serverClass.blacklist.before": [],
                "serverClass.blacklist.after": [],
                "serverClass.machineType.before": [],
                "serverClass.machineType.after": ["darwin-x86_64"]
            },
            "name": "deployed_change_4"
        }
    ],
    "paging": {
        "total": 13,
        "perPage": 30,
        "offset": 0
    }
});