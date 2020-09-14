// GET /services/dmc/groups/_search_heads
define({
	"links": {
		"_acl": "/services/dmc/groups/_search_heads/_acl"
	},
	"origin": "https://localhost:8089/services/dmc/groups/_search_heads",
	"updated": "2015-09-11T07:14:52-07:00",
	"generator": {
		"build":"7965de29fa179a8294393362a38cd83876e78878",
		"version":"20150909"
	},
	"entry": [
		{
			"name":"_search_heads",
			"id": "https://localhost:8089/services/dmc/groups/_search_heads",
			"updated": "2015-09-11T07:14:52-07:00",
			"links": {
				"alternate": "/services/dmc/groups/_search_heads",
				"list": "/services/dmc/groups/_search_heads",
				"edit": "/services/dmc/groups/_search_heads"
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
				"displayName": "Search heads",
				"description": "Nodes in the search tier",
				"@type": "builtin",
				"internalBundle": "__search_heads",
				"@existingTypes": [
					{ "name": "data/ui/views", "count": 7 },
					{ "name": "savedsearches", "count": 7 },
					{ "name": "server", "count": 7 },
					{ "name": "twitter", "count": 7 },
					{ "name": "ui-prefs", "count": 7 }
				],
				"@memberCount": 64
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