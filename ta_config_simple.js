global_ta_ui_config =
{
    "meta": {
        "name": "Splunk_TA_AOB_test",
        "displayName": "AOB Test",
        "version": "1.0.0",
        "uccVersion": "2.0",
        "restRoot": "aob_test"
    },
    "pages": {
        "configuration":  {
            "title": "Configurations",
            "description": "Configure your account, proxy and logging level."
            "tabs": [
                {
                    "type": "account",
                    "title": "Account",
                    "entity": [
                        {
                            "name": "name",   // cannot change
                            "title": "Name",
                            "type": "id"   // cannot change
                        },
                        {  // optional
                            "name": "username", // cannot change
                            "title": "User Name",
                            "options": {
                                "max_len": 30,
                                "min_len": 1
                            }
                        },
                        { // optional
                            "name": "password",
                            "title": "Password",
                            "options": {
                                "max_len": 30,
                                "min_len": 1
                            }
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
                    "controls": [
                        "type": "textbox, encrypted_textbox, drop_downlist",  // ediable
                        "name": "internal_name",  // ediable
                        "title": "Lable here",  // ediable
                        "options": { // ediable

                        }
                    ]
                },
                {
                    "type": "custom_abc",
                    "title": "Some settings",
                    "controls": [
                        "type": "textbox, encrypted_textbox, drop_downlist",  // ediable
                        "name": "internal_name",  // ediable
                        "title": "Lable here",  // ediable
                        "options": { // ediable

                        }
                    ]
                }
            ]

        },
        "inputs": {
            "title": "Inputs",
            "description": "This is description",
            "inputs": [
                {
                    "name": "input1",   // should be unique
                    "title": "Azure Blob",
                    "endpoint": "input1",   // rest endpoint
                    "entity": [
                        {
                            "name": "name",   // cannot change
                            "title": "Input Name",
                            "type": "id"   // cannot change
                        },
                        {
                            "name": "account_name",
                            "title": "Account Name",//
                            "type": "textbox, encrypted_textbox, drop_downlist",  // ediable
                            "options": {
                                "is_dynamic": "true",
                                "rest": "rest_account"
                            }
                        },
                        {
                            "name": "index",
                            "title": "Index",
                            "type": "drop_downlist",
                            "options": {
                                "is_dynamic": "true",
                                "rest": "rest_index"
                            }
                        },
                        {
                            // dito
                        }
                    ]

                },
                {
                    "input_name:": "input2",
                    "input_title": "Azure Table",
                    "rest": "rest_input2",
                    "entities": [
                        // ....
                    ]
                }
            ]
        }
    ]
}
