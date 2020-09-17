define(
    [
        'models/services/authorization/Role',
        'collections/SplunkDsBase',
        'models/shared/fetchdata/EAIFetchData'
    ],
    function(Model, BaseCollection, EAIFetchData) {
        return BaseCollection.extend({
            FREE_PAYLOAD: {
                "links": {
                    "create": "/services/authorization/roles/_new"
                },
                "generator": {
                },
                "entry": [
                    {
                        "name": "admin",
                        "links": {
                            "alternate": "/services/authorization/roles/admin",
                            "list": "/services/authorization/roles/admin",
                            "edit": "/services/authorization/roles/admin",
                            "remove": "/services/authorization/roles/admin"
                        },
                        "author": "system",
                        "acl": {
                            "app": "",
                            "can_list": true,
                            "can_write": true,
                            "modifiable": false,
                            "owner": "system",
                            "perms": {
                                "read": [
                                    "*"
                                ],
                                "write": [
                                    "*"
                                ]
                            },
                            "removable": false,
                            "sharing": "system"
                        },
                        "content": {
                            "capabilities": [],
                            "cumulativeRTSrchJobsQuota": 400,
                            "cumulativeSrchJobsQuota": 200,
                            "defaultApp": "",
                            "eai:acl": null,
                            "imported_capabilities": [],
                            "imported_roles": [],
                            "imported_rtSrchJobsQuota": 20,
                            "imported_srchDiskQuota": 500,
                            "imported_srchFilter": "",
                            "imported_srchIndexesAllowed": [
                                "*"
                            ],
                            "imported_srchIndexesDefault": [
                                "main"
                            ],
                            "imported_srchJobsQuota": 10,
                            "imported_srchTimeWin": -1,
                            "rtSrchJobsQuota": 100,
                            "srchDiskQuota": 10000,
                            "srchFilter": "*",
                            "srchIndexesAllowed": [
                                "*",
                                "_*"
                            ],
                            "srchIndexesDefault": [
                                "main",
                                "os"
                            ],
                            "srchJobsQuota": 50,
                            "srchTimeWin": 0
                        }
                    }
                ],
                "paging": {
                    "total": 1,
                    "perPage": 30,
                    "offset": 0
                },
                "messages": []
            },
            initialize: function(models, options) {
                options = options || {};
                options.fetchData = options.fetchData || new EAIFetchData({count:0});
                BaseCollection.prototype.initialize.call(this, models, options);
            },
            url: 'authorization/roles',
            model: Model
        });
    }
);
