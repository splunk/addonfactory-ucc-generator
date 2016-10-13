global_ta_ui_config =
{
    "meta": {
        "name": "Splunk_TA_AOB_test",
        "displayName": "AOB Test",
        "version": "1.0.0",
        "uccVersion": "2.0",
        // "restRoot": "aob_test"  // can not change, generated from name
    },
    "pages": {
        "configuration":  {
            "title": "Configurations",
            "description": "Configure your account, proxy and logging level."
            "tabs": [
                {
                    "type": "account",
                    "title": "Account",
                    //"endpoint": "account",   // rest endpoint, auto generated based on `type` field
                    "table": {      // Single form link proxy and logging does not have this field
                        "header": ["name", "endpoint", "api_uuid"]
                        "actions": [
                            "edit",
                            "delete",
                            "clone"
                        ]
                    }
                    "entity": [
                        {
                            "field": "name",   // cannot change
                            "label": "Name",
                            "type": "text",      // can only be text, password, checkbox, singleSelect, multipleSelect
                            "help": "unique name" // optional
                        },
                        {  // optional
                            "field": "username",
                            "label": "User Name",
                            "type": "text"
                        },
                        { // optional
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
                    "type": "proxy"
                    "title": "Proxy"
                },
                {
                    "type": "custom_abc",
                    "title": "Some settings",
                    "entity": [
                        "type": "singleSelect",  // ediable
                        "field": "internal_name",  // ediable
                        "label": "Lable here",  // ediable
                        "options": { // ediable
                            "disableSearch": true,
                            "autoCompleteFields": [
                                {"label": "http", "value": "http"},
                                {"label": "socks4", "value": "socks4"},
                                {"label": "socks5", "value": "socks5"}
                            ]
                        }
                    ]
                }
            ]

        },
        "inputs": {
            "title": "Inputs",
            "description": "This is description",
            "table": {
                "header": [     // header should contain common fields in all inputs entity fields
                    "name",
                    "index",
                    "sourcetype",
                    "service"   // can not change, special field for indentifying different inputs
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
                    "name": "input1",   // should be unique
                    "title": "Azure Blob",
                    //"endpoint": "input1",   // rest endpoint, auto generated based on `name` field
                    "entity": [
                        {
                            "field": "name",   // cannot change
                            "label": "Input Name",
                            "type": "text"
                        },
                        {
                            "field": "account_name",
                            "label": "Account Name",
                            "type": "singleSelect",  // ediable
                            "options": {
                                "referenceType": "account"
                            }
                        },
                        {
                            "field": "index", // load index from splunk if field equals index
                            "label": "Index",
                            "type": "singleSelect",
                            "options": {

                            }
                        }
                    ]
                },
                {
                    "name:": "input2",
                    "title": "Azure Table",
                    "entities": [
                        // ....
                    ]
                }
            ]
        }
    ]
}
