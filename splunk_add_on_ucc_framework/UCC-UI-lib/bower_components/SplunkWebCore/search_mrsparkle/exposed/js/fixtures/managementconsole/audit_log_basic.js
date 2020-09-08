define({
  "entry": [
    {
      "name": "0000000000000006",
      "content": {
        "user": "admin",
        "time": 1465566095.3879,
        "type": "stanza",
        "opType": "delete",
        "action": null,
        "key": {
          "type": "inputs",
          "name": "script:\/\/entrypoint.sh",
          "bundleId": "forwarders",
          "bundleType": "builtin"
        },
        "deployedOn": 1465588385.9941,
        "before": {
          "local": [
            [
              "interval",
              "10"
            ]
          ]
        },
        "deployedBy": "admin",
        "after": null
      }
    },
    {
      "name": "0000000000000005",
      "content": {
        "user": "admin",
        "time": 1465566079.3457,
        "type": "stanza",
        "opType": "insert",
        "action": null,
        "key": {
          "type": "inputs",
          "name": "script:\/\/entrypoint.sh",
          "bundleId": "forwarders",
          "bundleType": "builtin"
        },
        "deployedOn": 1465588385.9941,
        "before": null,
        "deployedBy": "admin",
        "after": {
          "local": [
            [
              "interval",
              "10"
            ]
          ]
        }
      }
    },
    {
      "name": "0000000000000004",
      "content": {
        "user": "admin",
        "time": 1465513304.0845,
        "type": "stanza",
        "opType": "insert",
        "action": null,
        "key": {
          "type": "inputs",
          "name": "tcp:\/\/514",
          "bundleId": "Splunk_TA_nix",
          "bundleType": "app"
        },
        "deployedOn": 1465588385.9941,
        "before": null,
        "deployedBy": "admin",
        "after": {
          "local": [
            [
              "source",
              "source"
            ],
            [
              "connection_host",
              "none"
            ],
            [
              "sourcetype",
              "testst"
            ],
            [
              "index",
              "test"
            ]
          ]
        }
      }
    },
    {
      "name": "0000000000000003",
      "content": {
        "user": "admin",
        "time": 1465512682.8483,
        "type": "app",
        "opType": "insert",
        "action": null,
        "key": {
          "name": "Splunk_TA_nix"
        },
        "deployedOn": 1465588385.9941,
        "before": null,
        "deployedBy": "admin",
        "after": {
          "@version": "5.2.3",
          "groups": [
            "_forwarders"
          ],
          "afterInstallation": null
        }
      }
    },
    {
      "name": "0000000000000002",
      "content": {
        "user": "admin",
        "time": 1465498481.1827,
        "type": "group",
        "opType": "update",
        "action": null,
        "key": {
          "name": "test1"
        },
        "deployedOn": 1465588385.9941,
        "before": {
          "filterType": "whitelist",
          "description": "",
          "machineTypesFilter": "",
          "blacklist": "",
          "whitelist": ""
        },
        "deployedBy": "admin",
        "after": {
          "@type": "custom",
          "@bundle": "_test1",
          "blacklist": "",
          "description": "",
          "filterType": "whitelist",
          "machineTypesFilter": "",
          "@existingTypes": [
            
          ],
          "@memberCount": 0,
          "@apps": [
            
          ],
          "whitelist": "*"
        }
      }
    },
    {
      "name": "0000000000000001",
      "content": {
        "user": "admin",
        "time": 1465498473.8057,
        "type": "group",
        "opType": "insert",
        "action": null,
        "key": {
          "name": "test1"
        },
        "deployedOn": 1465588385.9941,
        "before": null,
        "deployedBy": "admin",
        "after": {
          "filterType": "whitelist",
          "description": "",
          "machineTypesFilter": "",
          "blacklist": "",
          "whitelist": ""
        }
      }
    }
  ],
  "paging": {
    "total": 6,
    "offset": 0,
    "perPage": 30
  }
});