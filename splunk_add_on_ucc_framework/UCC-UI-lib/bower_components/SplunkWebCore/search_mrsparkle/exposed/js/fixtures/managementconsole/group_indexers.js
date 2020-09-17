// GET /services/dmc/groups/_indexers
define({
	"links": {
		"_acl": "/services/dmc/groups/_indexers/_acl"
	},
	"origin": "https://localhost:8089/services/dmc/groups/_indexers",
	"updated": "2015-09-11T07:14:52-07:00",
	"generator": {
		"build":"7965de29fa179a8294393362a38cd83876e78878",
		"version":"20150909"
	},
	"entry": [
		{
			"name":"_indexers",
			"id": "https://localhost:8089/services/dmc/groups/_indexers",
			"updated": "2015-09-11T07:14:52-07:00",
			"links": {
				"alternate": "/services/dmc/groups/_indexers",
				"list": "/services/dmc/groups/_indexers",
				"edit": "/services/dmc/groups/_indexers"
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
				"displayName": "Indexers",
				"description": "Nodes in the indexing tier",
				"@type": "builtin",
				"internalBundle": "__indexers",
				"@existingTypes": [
					{ "name": "alerts", "count": 4 },
					{ "name": "indexes", "count": 4 },
					{ "name": "props", "count": 4 },
					{ "name": "savedsearches", "count": 4 },
					{ "name": "server", "count": 4 },
					{ "name": "transforms", "count": 4 }
				],
				"@memberCount": 128
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