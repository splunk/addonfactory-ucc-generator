# Tabs

UCC currently supports 2 different types of tabs: "Configuration" and "Inputs".
"Search" tab is included by default.

## Configuration

"Configuration" tab can have multiple different subtabs, for example, a tab
for account configuration (name and API key), proxy configuration and logging 
level configuration.

## Inputs

Holds input configuration information for data collection. 
If we have a variety of input configurations, we can create more than one input service under the input page.

If there are multiple services in the globalConfig file, a dropdown will appear on the Input page.
If there is only one service, a button will be displayed instead of a dropdown list to configure the input.

| Property          | Description |
| ----------------- | ----------- |
| style             | It is used to open the input service form in a page or dialog. The value of the style property can be `page` or `dialog`. <p> Default value is **dialog**. </p>  |

This is how globalConfig looks like without tabs in the inputs page:
```
"pages": {
    "inputs": {
        "title": "Inputs",
        "description": "Manage your data inputs",
        "services": [
            {
                "name": "example_input_one",
                "title": "Example Input",
                "entity": []
            },
            {
                "name": "example_input_two",
                "title": "Example Input Two",
                "entity": []
            }
        ],
        "table": {
            "actions": [
                "edit",
                "enable",
                "delete",
                "clone"
            ],
            "header": [],
            "moreInfo": []
        }
    }
},
```

### Tabs
If there are multiple types of input services and want to use the Tabs feature, each input service is represented by a separate tab. As a result, each input service will have its own tab.

To enable the tabs feature, `table` property must be provided under the services.

Title and Description would change when changing the tab (If provided in the globalConfig file).

```
"pages": {
    "inputs": {
        "title": "Inputs",
        "services": [
            {
                "name": "example_input_one",
                "description": "This is a description for Input One",
                "title": "Example Input",
                "entity": [],
                "table": {
                    "actions": [
                        "edit",
                        "enable",
                        "delete",
                        "clone"
                    ],
                    "header": [],
                    "moreInfo": []
                }
            },
            {
                "name": "example_input_two",
                "description": "This is a description for Input Two",
                "title": "Example Input Two",
                "entity": [],
                "table": {
                    "actions": [
                        "edit",
                        "enable",
                        "delete",
                        "clone"
                    ],
                    "header": [],
                    "moreInfo": [],
                    "customRow":{
                        "type": "external",
                        "src": "CustomRow"
                    }
                }
            }
        ]
    }
},
```

> Note:
>
> If the `table` property is provided in both the `inputs` and the `services`, the following error will be shown. ```instance.pages.inputs is not exactly one from [subschema 0],[subschema 1]```
>
> [Custom menu](https://splunk.github.io/addonfactory-ucc-generator/custom_ui_extensions/custom_menu/) is not supported in the tabs feature.
