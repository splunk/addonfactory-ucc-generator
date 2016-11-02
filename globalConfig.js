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
                    "name": "account",
                    "title": "Account",
                    "table": {
                        "header": [
                            {
                                "field": "name",
                                "label": "Name"
                            },
                            {
                                "field": "endpoint",
                                "label": "Endpoint"
                            },
                            {
                                "field": "api_uuid",
                                "label": "API UUID"
                            }
                        ],
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
                            "required": true,
                            "help": "Enter a unique name for each Crowdstrike falcon host account."
                        },
                        {
                            "field": "endpoint",
                            "label": "Endpoint",
                            "type": "text",
                            "required": true,
                            "defaultValue": "https://firehose.crowdstrike.com/sensors/entities/datafeed/v1",
                            "options": {
                                "enabled": false,
                                "placeholder": "https://firehose.crowdstrike.com/sensors/entities/datafeed/v1"
                            }
                        },
                        {
                            "field": "api_uuid",
                            "label": "API UUID",
                            "type": "text",
                            "required": true
                        },
                        {
                            "field": "api_key",
                            "label": "API Key",
                            "type": "text",
                            "required": true,
                            "encrypted": true
                        }
                    ]
                },
                {
                    "name": "logging",
                    "title": "Logging",
                    "entity": [
                        {
                            "field": "loglevel",
                            "label": "Log Level",
                            "type": "singleSelect",
                            "options": {
                                "disableSearch": true,
                                "autoCompleteFields": [
                                    {"label": "INFO", "value": "INFO"},
                                    {"label": "DEBUG", "value": "DEBUG"},
                                    {"label": "ERROR", "value": "ERROR"}
                                ]
                            },
                            "defaultValue": "INFO"
                        }
                    ]
                },
                {
                    "name": "proxy",
                    "title": "Proxy",
                    "entity": [
                        {
                            "field": "proxy_enabled",
                            "label": "Enable",
                            "type": "checkbox"
                        },
                        {
                            "field": "proxy_type",
                            "label": "Proxy Type",
                            "type": "singleSelect",
                            "options": {
                                "disableSearch": true,
                                "autoCompleteFields": [
                                    {"label": "http", "value": "http"},
                                    {"label": "socks4", "value": "socks4"},
                                    {"label": "socks5", "value": "socks5"}
                                ]
                            },
                            "defaultValue": "http"
                        },
                        {"field": "proxy_url", "label": "Host", "type": "text"},
                        {"field": "proxy_port", "label": "Port", "type": "text"},
                        {"field": "proxy_username", "label": "Username", "type": "text"},
                        {
                            "field": "proxy_password",
                            "label": "Password",
                            "type": "text",
                            "encrypted": true
                        }
                    ]
                },
                {
                    "name": "custom_abc",
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
                        },
                        {
                            "field": "name",
                            "label": "Name",
                            "type": "text",
                            "help": "Enter a unique name for each crowdstrike falcon host data input."
                        },
                        {
                            "field": "account",
                            "label": "Account",
                            "type": "singleSelect",
                            "options": {
                                "referenceName": "account"
                            }
                        },
                        {
                            "field": "start_offset",
                            "label": "Start Offset",
                            "type": "text",
                            "defaultValue": "0"
                        },
                        {
                            "field": "interval",
                            "label": "Interval",
                            "type": "text",
                            "defaultValue": "60",
                            "help": "Time interval of input in seconds."
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
                    {
                        "field": "name",
                        "label": "Name",
                    },
                    {
                        "field": "account",
                        "label": "Account",
                    },
                    {
                        "field": "start_offset",
                        "label": "Start Offset",
                    },
                    {
                        "field": "interval",
                        "label": "Interval",
                    },
                    {
                        "field": "index",
                        "label": "Index"
                    },
                    {
                        "field": "disabled",
                        "label": "Status"
                    }
                ],
                "moreInfo": [
                    {
                        "field": "name",
                        "label": "Name",
                    },
                    {
                        "field": "account",
                        "label": "Account",
                    },
                    {
                        "field": "start_offset",
                        "label": "Start Offset",
                    },
                    // Common fields
                    {
                        "field": "interval",
                        "label": "Interval",
                    },
                    {
                        "field": "index",
                        "label": "Index"
                    },
                    {
                        "field": "disabled",
                        "label": "Status"
                    }
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
                            "label": "Name",
                            "type": "text",
                            "help": "Enter a unique name for each crowdstrike falcon host data input."
                        },
                        {
                            "field": "account",
                            "label": "Account",
                            "type": "singleSelect",
                            "options": {
                                "referenceName": "account"
                            }
                        },
                        {
                            "field": "start_offset",
                            "label": "Start Offset",
                            "type": "text",
                            "defaultValue": "0"
                        },
                        {
                            "field": "interval",
                            "label": "Interval",
                            "type": "text",
                            "defaultValue": "60",
                            "help": "Time interval of input in seconds."
                        },
                        {
                            "field": "index",
                            "label": "Index",
                            "type": "singleSelect",
                            "defaultValue": "default"
                        }
                    ]
                },
                {
                    "name": "ta_crowdstrike_falcon_host_inputs",
                    "title": "Falcon Host Input test",
                    "entity": [
                        {
                            "field": "name",
                            "label": "Name",
                            "type": "text",
                            "help": "Enter a unique name for each crowdstrike falcon host data input."
                        },
                        {
                            "field": "account",
                            "label": "Account",
                            "type": "singleSelect",
                            "options": {
                                "customizedUrl": "ta_crowdstrike/account"
                            }
                        },
                        {
                            "field": "start_offset",
                            "label": "Start Offset",
                            "type": "text",
                            "defaultValue": "0"
                        },
                        {
                            "field": "interval",
                            "label": "Interval",
                            "type": "text",
                            "defaultValue": "60",
                            "help": "Time interval of input in seconds."
                        }
                    ]
                }
            ]
        }
    }
}
