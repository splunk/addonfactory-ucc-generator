// GET /services/dmc/stanzas/__search_heads/data%2Fui%2Fviews?count=2
define({
	"links": {
		"create": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/_new",
		"_reload": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/_reload", 
		"_acl": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/_acl"
	},
	"origin": "https://localhost:8089/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews",
	"updated": "2015-09-11T07:14:52-07:00",
	"generator": {
		"build":"7965de29fa179a8294393362a38cd83876e78878",
		"version":"20150909"
	},
	"entry": [
		{
			"name":"example_dashboard",
			"id": "https://localhost:8089/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard",
			"updated": "2015-09-11T07:14:52-07:00",
			"links": {
				"alternate": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard",
				"list": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard",
				"_reload": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard/_reload",
				"edit": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard"
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
				"bundle": "__search_heads",
				"type": "data/ui/views",
				"isFile": true,
				"default": {
					"content": "<view isVisible=\"false\" > <label>Internal Admin Nav</label> <module name=\"Message\" layoutPanel=\"messaging\"> <param name=\"filter\">*</param> <param name=\"clearOnJobDispatch\">False</param> <param name=\"maxSize\">1</param> </module> <module name=\"AccountBar\" layoutPanel=\"appHeader\"> <param name=\"mode\">lite</param> </module> <module name=\"LiteBar\" layoutPanel=\"liteHeader\"></module> </view>"
				},
				"local": null
			}
		},
		{
			"name":"example_dashboard2",
			"id": "https://localhost:8089/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard2",
			"updated": "2015-09-11T07:14:52-07:00",
			"links": {
				"alternate": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard2",
				"list": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard2",
				"_reload": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard2/_reload",
				"edit": "/services/dmc/stanzas/__search_heads/data%2Fui%2Fviews/example_dashboard2"
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
				"bundle": "__search_heads",
				"type": "data/ui/views",
				"isFile": true,
				"default": null,
				"local": {
					"content": "<view isVisible=\"false\" > <label>Internal Admin Nav</label> <module name=\"Message\" layoutPanel=\"messaging\"> <param name=\"filter\">*</param> <param name=\"clearOnJobDispatch\">False</param> <param name=\"maxSize\">1</param> </module> <module name=\"AccountBar\" layoutPanel=\"appHeader\"> <param name=\"mode\">lite</param> </module> <module name=\"LiteBar\" layoutPanel=\"liteHeader\"></module> </view>"
				}
			}
		}
	],
	"paging": {
		"total": 226,
		"perPage": 2,
		"offset": 0
	},
	"messages": []
});