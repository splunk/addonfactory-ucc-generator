/**
 * Created by lrong on 1/15/16.
 */
// GET /services/dmc/changes?entityType=app
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
        }
    ],
    "paging": {
        "total": 3,
        "perPage": 30,
        "offset": 0
    }
});