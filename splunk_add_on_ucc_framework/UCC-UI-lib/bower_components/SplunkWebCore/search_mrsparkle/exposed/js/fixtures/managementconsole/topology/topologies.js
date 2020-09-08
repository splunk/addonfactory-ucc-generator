
define({
    "paging": {
        "perPage": 1,
        "offset": 0,
        "total": 1
    },
    "entry": [
        {
            "name": "E95C0BEC-3196-419B-94CE-EEDC77D0F235",
            "content": {
                "task": {
                    "taskId": "D81E8C02-3DD5-407C-B4F0-6F8F618FCC55",
                    "state": "completed"
                },
                "topologyName": "default",
                "topologyId": "E95C0BEC-3196-419B-94CE-EEDC77D0F235",
                "createdAt": 1458080546.32627,
                "changedAt": 1458080546.32627,
                "forwarders": {
                    "count": 0
                },
                "changedBy": "system",
                "clusters": [
                    {
                        "secret": {
                            "_secureStorageKey": "DCA0E13D-0941-46F3-836E-C8730D43AD23"
                        },
                        "type": "idxc",
                        "conf": {},
                        "master": {
                            "instanceId": "695FCB77-988D-44D7-97AD-D8BD5D82A5C6"
                        },
                        "membersCount": 0
                    },
                    {
                        "secret": {
                            "_secureStorageKey": "B5FAABAA-D861-4E39-856C-0A82B68EBCFD"
                        },
                        "type": "shc",
                        "deployer": {
                            "instanceId": "695FCB77-988D-44D7-97AD-D8BD5D82A5C6"
                        },
                        "membersCount": 5,
                        "bootstrappedTime": 1458084182.32171,
                        "conf": {}
                    }
                ]
            }
        }
    ]
});