global_ta_ui_config =
{
    "meta_data": {
        "ta_name": "Splunk_TA_AOB_test",
        "ta_display_name": "AOB Test",
        "version": "1.0.0",
        "ucc_version": "2.0"
    },
    "pages_config": {
        "configuration":  {
            "page_title": "Configurations",
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
        {
            "page_name": "inputs",
            "page_title": "Inputs",
            "inputs": [
                {
                    "input_name": "input1",
                    "input_title": "Azure Blob",
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
