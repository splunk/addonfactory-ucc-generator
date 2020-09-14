/**
 * Created by lrong on 1/15/16.
 */
// GET /services/dmc/changes?entityType=stanza
define({
    "entry": [
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
        }
    ],
    "paging": {
        "total": 3,
        "perPage": 30,
        "offset": 0
    }
});