global_ta_ui_config =
{
    "meta_data": {
        "ta_name": "Splunk_TA_AOB_test",
        "ta_display_name": "AOB Test",
        "version": "1.0.0",
        "ucc_version": "2.0"
    },
    "pages_config": [
        {
            "page_name": "configuration", // cannot change
            "page_title": "Configurations",
            "controls": [
                {
                    "type": "tab_group",  // cannot change
                    "options": {
                        "tabs": [
                            { // optional
                                "tab_name": "account", // can only be account, logging, proxy, custom_XYZ...
                                "tab_title": "Accounts",
                                "controls": [
                                    {
                                        "type": "editable_table",  // cannot change
                                        "options": {
                                            "rest": "rest_account", // cannot change
                                            "entity": [
                                                {
                                                    "name": "name",   // cannot change
                                                    "title": "Name",
                                                    "type": "id"   // cannot change
                                                },
                                                {  // optional
                                                    "name": "username",
                                                    "title": "User Name",
                                                    "type": "textbox", // can only be textbox, encrypted_textbox
                                                    "options": {
                                                        "max_len": 30,
                                                        "min_len": 1
                                                    }
                                                },
                                                { // optional
                                                    "name": "password",
                                                    "title": "Password",
                                                    "type": "encrypted_textbox",
                                                    "options": {
                                                        "max_len": 30,
                                                        "min_len": 1
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            { // optional
                                "tab_name": "logging",  // cannot change
                                "tab_title": "Logging", // ediable
                                "controls": [ // cannot change
                                    {
                                        "type": "widget.logging" // cannot change
                                        "options": {
                                            "rest": "rest_logging"  // cannot change
                                        }
                                    }
                                ]
                            },
                            {// optional
                                "tab_name": "proxy", // cannot change
                                "tab_title": "Proxy",// ediable
                                "controls": [
                                    "type": "widget.proxy"// cannot change
                                    "options": {
                                        "rest": "reset_proxy"  // cannot change
                                    }
                                ]
                            },
                            {
                                "tab_name": "custom_tab1",  // ediable
                                "tab_title": "Custom Tab",  // ediable
                                "controls": [
                                    {
                                        "type": "form",   // must be form
                                        "options": {
                                            "rest": "rest_custom1"
                                            "controls": [
                                                "type": "textbox, encrypted_textbox, drop_downlist",  // ediable
                                                "name": "internal_name",  // ediable
                                                "title": "Lable here",  // ediable
                                                "options": { // ediable

                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            {
                                "tab_name": "custom_tab2",  // ediable
                                "tab_title": "Custom Tab2",  // ediable
                                "controls": [  // ediable
                                    {
                                        "type": "form",  // cannot change
                                        "options": {
                                        }
                                    }
                                ]
                            }

                        ]
                    }
                }
            ]
        },
        {
            "page_name": "inputs",
            "page_title": "Inputs",
            "controls": [
                { // mandotary, cannot add more
                    "type": "multiple_editable_table",  // cannot change
                    "options": {
                        "inputs": [
                            {
                                "input_name": "input1",
                                "input_title": "Azure Blob",
                                "rest": "rest_input1"
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
                },
            ]
        }
    ]
}
