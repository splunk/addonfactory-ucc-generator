// GET /services/dmc/groups/__example_node
define({
	"links": {
		"_acl": "/services/dmc/groups/__example_node/_acl"
	},
	"origin": "https://localhost:8089/services/dmc/groups/__example_node",
	"updated": "2015-09-11T07:14:52-07:00",
	"generator": {
		"build":"7965de29fa179a8294393362a38cd83876e78878",
		"version":"20150909"
	},
	"entry": [
		{
			"name":"__example_node",
			"id": "https://localhost:8089/services/dmc/groups/__example_node",
			"updated": "2015-09-11T07:14:52-07:00",
			"links": {
				"alternate": "/services/dmc/groups/__example_node",
				"list": "/services/dmc/groups/__example_node",
				"edit": "/services/dmc/groups/__example_node"
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
				"displayName": "example_node",
				"description": "Node named 'example_node'",
				"@type": "node",
				"internalBundle": "___example_node",
				"instanceName": "example_node",
				"@existingTypes": [
					"indexes",
					"outputs",
					"savedsearches",
					"server",
					"web"
				],
				"@memberCount": 1
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