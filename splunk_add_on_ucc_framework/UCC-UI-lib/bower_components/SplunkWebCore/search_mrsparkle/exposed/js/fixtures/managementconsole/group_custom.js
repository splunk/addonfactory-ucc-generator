define({
    "links": {
        "create": "/services/dmc/groups/_new",
        "_reload": "/services/dmc/groups/_reload",
        "_acl": "/services/dmc/groups/_acl"
    },
    "origin": "https://localhost:8089/services/dmc/groups",
    "updated": "2015-11-03T07:14:52-07:00",
    "generator": {
        "build":"7965de29fa179a8294393362a38cd83876e78878",
        "version":"20151103"
    },
    "entry": [
        {
            "name":"customGroup",
            "id": "https://localhost:8089/services/dmc/groups/5ee34802-a983-4bff-adfd-c57b2c81bff5",
            "updated": "2015-11-03T07:14:52-07:00",
            "links": {
                "alternate": "/services/dmc/groups/5ee34802-a983-4bff-adfd-c57b2c81bff5",
                "list": "/services/dmc/groups/5ee34802-a983-4bff-adfd-c57b2c81bff5",
                "_reload": "/services/dmc/groups/5ee34802-a983-4bff-adfd-c57b2c81bff5/_reload",
                "edit": "/services/dmc/groups/5ee34802-a983-4bff-adfd-c57b2c81bff5",
                "remove": "/services/dmc/groups/5ee34802-a983-4bff-adfd-c57b2c81bff5"
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
                "@memberCount": 14,
                "blacklistSequence": "1.a2.com, 2.b2.com",
                "@type": "custom",
                "description": "data center 1 forwarders",
                "whitelistSequence": "*.a2.com, *.b2.com*",
                "filterType": "blacklist",
                "machineTypeFilter": "linux-i686, linux-x86_64",
                "displayName": "dc1 fwd"
            }
        },
        {
            "name":"c64403f1-5b4d-407c-beae-ba1568814dc8",
            "id": "https://localhost:8089/services/dmc/groups/c64403f1-5b4d-407c-beae-ba1568814dc8",
            "updated": "2015-11-03T07:14:52-07:00",
            "links": {
                "alternate": "/services/dmc/groups/c64403f1-5b4d-407c-beae-ba1568814dc8",
                "list": "/services/dmc/groups/c64403f1-5b4d-407c-beae-ba1568814dc8",
                "_reload": "/services/dmc/groups/c64403f1-5b4d-407c-beae-ba1568814dc8/_reload",
                "edit": "/services/dmc/groups/c64403f1-5b4d-407c-beae-ba1568814dc8",
                "remove": "/services/dmc/groups/c64403f1-5b4d-407c-beae-ba1568814dc8"
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
                "@memberCount": 9,
                "blacklistSequence": "1.a2.gov, 2.b2.gov",
                "@type": "custom",
                "description": "data center 2 forwarders",
                "whitelistSequence": "*.a2.gov, *.b2.gov*",
                "filterType": "whitelist",
                "machineTypeFilter": "linux-i686",
                "displayName": "dc2 fwd"
            }
        },
        {
            "name":"d7e38e98-afbf-4116-afc1-20c28c087c94",
            "id": "https://localhost:8089/services/dmc/groups/d7e38e98-afbf-4116-afc1-20c28c087c94",
            "updated": "2015-11-03T07:14:52-07:00",
            "links": {
                "alternate": "/services/dmc/groups/d7e38e98-afbf-4116-afc1-20c28c087c94",
                "list": "/services/dmc/groups/d7e38e98-afbf-4116-afc1-20c28c087c94",
                "_reload": "/services/dmc/groups/d7e38e98-afbf-4116-afc1-20c28c087c94/_reload",
                "edit": "/services/dmc/groups/d7e38e98-afbf-4116-afc1-20c28c087c94",
                "remove": "/services/dmc/groups/d7e38e98-afbf-4116-afc1-20c28c087c94"
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
                "@memberCount": 18,
                "blacklistSequence": "",
                "description": "data center 3 forwarders",
                "whitelistSequence": "",
                "filterType": "whitelist",
                "machineTypeFilter": "linux-x86_64",
                "displayName": "dc3 fwd"
            }
        }
    ],
    "paging": {
        "total": 3,
        "perPage": 3,
        "offset": 0
    },
    "messages": []
});
