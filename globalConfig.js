window.globalConfig =
{
    "meta": {
        "name": "Splunk_TA_crowdstrike",
        "displayName": "AOB Test",
        "version": "1.0.0",
        "uccVersion": "2.0",
        "restRoot": "ta_crowdstrike"
    },
    "pages": {
        "configuration":  {
            "title": "Configurations",
            "description": "Configure your account, proxy and logging level.",
            "tabs": [
                {
                    "type": "account",
                    "title": "Account",
                    "table": {
                        "header": ["name", "endpoint", "api_uuid"],
                        "actions": [
                            "edit",
                            "delete",
                            "clone"
                        ]
                    },
                    "entity": [
                        {
                            "field": "name",
                            "label": "Name",
                            "type": "text",
                            "help": "unique name"
                        },
                        {
                            "field": "username",
                            "label": "User Name",
                            "type": "text"
                        },
                        {
                            "field": "password",
                            "label": "Password",
                            "type": "password"
                        }
                    ]
                },
                {
                    "type": "logging",
                    "title": "Logging"
                },
                {
                    "type": "proxy",
                    "title": "Proxy"
                },
                {
                    "type": "custom_abc",
                    "title": "Some settings",
                    "entity": [
                        {
                            "type": "singleSelect",
                            "field": "internal_name",
                            "label": "Lable here",
                            "options": {
                                "disableSearch": true,
                                "autoCompleteFields": [
                                    {"label": "http", "value": "http"},
                                    {"label": "socks4", "value": "socks4"},
                                    {"label": "socks5", "value": "socks5"}
                                ]
                            }
                        }
                    ]
                }
            ]

        },
        "inputs": {
            "title": "Inputs",
            "description": "This is description",
            "table": {
                "header": [
                    "name",
                    "index",
                    "sourcetype",
                    "service"
                ],
                "moreInfo": [
                    "name",
                    "index",
                    "input1_field1",
                    "input1_field2",
                    "input2_field1",
                    "input2_field2"
                ],
                "actions": [
                    "edit",
                    "delete",
                    "clone"
                ]
            },
            "services": [
                {
                    "name": "ta_crowdstrike_falcon_host_inputs",
                    "title": "Falcon Host Input",
                    "entity": [
                        {
                            "field": "name",
                            "label": "Input Name",
                            "type": "text"
                        },
                        {
                            "field": "account_name",
                            "label": "Account Name",
                            "type": "text",
                            "options": {
                                "referenceType": "account"
                            }
                        },
                        {
                            "field": "index",
                            "label": "Index",
                            "type": "singleSelect",
                            "options": {

                            }
                        }
                    ]
                }
            ]
        }
    }
}
