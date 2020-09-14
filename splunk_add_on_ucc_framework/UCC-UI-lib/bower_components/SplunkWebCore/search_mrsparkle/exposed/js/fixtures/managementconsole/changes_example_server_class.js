/**
 * Created by lrong on 1/15/16.
 */
// GET /services/dmc/changes?entityType=serverClass
define({
    "entry": [
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
        }
    ],
    "paging": {
        "total": 3,
        "perPage": 30,
        "offset": 0
    }
});