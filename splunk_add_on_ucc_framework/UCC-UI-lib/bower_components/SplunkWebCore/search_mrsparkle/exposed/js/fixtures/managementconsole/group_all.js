// GET /services/dmc/groups/_all
define({
	"links": {
		"_acl": "/services/dmc/groups/_all/_acl"
	},
	"origin": "https://localhost:8089/services/dmc/groups/_all",
	"updated": "2015-09-11T07:14:52-07:00",
	"generator": {
		"build":"7965de29fa179a8294393362a38cd83876e78878",
		"version":"20150909"
	},
	"entry": [
		{
			"name":"_all",
			"id": "https://localhost:8089/services/dmc/groups/_all",
			"updated": "2015-09-11T07:14:52-07:00",
			"links": {
				"alternate": "/services/dmc/groups/_all",
				"list": "/services/dmc/groups/_all",
				"edit": "/services/dmc/groups/_all"
			},
			"author": "system",
			"acl": {
				"app": "",
				"can_list": true,
				"can_write": true,
				"modifiable": true,
				"owner": "nobody",
				"perms": { 
					"read": [ ],
					"write": [ "admin" ]
				},
				"removable": false,
				"sharing": "system"
			},
			"content": {
				"displayName": "All nodes",
				"description": "Every node in the system",
				"@type": "builtin",
				"internalBundle": "_all",
				"@existingTypes": [
					{ "name": "alert_action", "count": 3 },
					{ "name": "app", "count": 3 },
					{ "name": "audit", "count": 3 },
					{ "name": "authentication", "count": 3 },
					{ "name": "authorize", "count": 3 },
					{ "name": "collections", "count": 3 },
					{ "name": "commands", "count": 3 },
					{ "name": "conf", "count": 3 },
					{ "name": "crawl", "count": 3 },
					{ "name": "data/ui/views", "count": 3 },
					{ "name": "datamodels", "count": 3 },
					{ "name": "datatypesbnf", "count": 3 },
					{ "name": "default-mode", "count": 3 },
					{ "name": "deployed-fwd-mode", "count": 3 },
					{ "name": "distsearch", "count": 3 },
					{ "name": "event_renderers", "count": 3 },
					{ "name": "eventdiscoverer", "count": 3 },
					{ "name": "eventtypes", "count": 3 },
					{ "name": "fields", "count": 3 },
					{ "name": "indexes", "count": 3 },
					{ "name": "inputs", "count": 3 },
					{ "name": "limits", "count": 3 },
					{ "name": "literals", "count": 3 },
					{ "name": "multikv", "count": 3 },
					{ "name": "outputs", "count": 3 },
					{ "name": "pdf_server", "count": 3 },
					{ "name": "perfs", "count": 3 },
					{ "name": "procmon-filters", "count": 3 },
					{ "name": "props", "count": 3 },
					{ "name": "restmap", "count": 3 },
					{ "name": "savedsearches", "count": 3 },
					{ "name": "searchbnf", "count": 3 },
					{ "name": "segmenters", "count": 3 },
					{ "name": "server", "count": 3 },
					{ "name": "serverclass", "count": 3 },
					{ "name": "source-classifier", "count": 3 },
					{ "name": "times", "count": 3 },
					{ "name": "transactiontypes", "count": 3 },
					{ "name": "transforms", "count": 3 },
					{ "name": "ui-prefs", "count": 3 },
					{ "name": "ui-tour", "count": 3 },
					{ "name": "viewstates", "count": 3 },
					{ "name": "web", "count": 3 },
					{ "name": "workflow_actions", "count": 3 }
				],
				"@memberCount": 192
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