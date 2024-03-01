---
title: Inputs
---

The input page stores configuration information for data collection. Multiple inputs can be created on the Inputs page.

Developers are required to add services in the global config file to create a new Input. If multiple services are provided, a dropdown field will appear on the Inputs page. In contrast, a button will be displayed for a single service.

### Properties

| Property                                                                  | Type   | Description                                                                                            |
| ------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| title<span class="required-asterisk">\*</span>                            | string | -                                                                                                      |
| description                                                               | string | It provides a brief summary of an inputs page.                                                         |
| [subDescription](../advanced/sub_description.md)                          | object | It provides broader description of an inputs page.                                                     |
| menu                                                                      | object | This property allows you to enable the [custom menu].(../custom_ui_extensions/custom_menu.md) feature. |
| [table](../table.md)                                                      | object | It displays input stanzas in a tabular format.                                                         |
| groupsMenu                                                                | array  | This property allows you to enable the [multi-level menu](./multilevel_menu.md) feature.               |
| [services](#services-properties)<span class="required-asterisk">\*</span> | array  | It specifies a list of modular inputs.                                                                 |

### Services Properties

| Property                                                              | Type   | Description                                                                                                                                                                                                   |
| --------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name<span class="required-asterisk">\*</span>                         | string | It defines the particular service name.                                                                                                                                                                       |
| title<span class="required-asterisk">\*</span>                        | string | It shows the title of the service.                                                                                                                                                                            |
| subTitle                                                              | string | It shows the subtitle (or additional information) of the service.                                                                                                                                             |
| [entity](../entity/index.md)<span class="required-asterisk">\*</span> | array  | It is a list of fields and their properties.                                                                                                                                                                  |
| [groups](../advanced/groups_feature.md)                               | array  | It is used to divide forms into distinct sections, each comprising relevant fields.                                                                                                                           |
| style                                                                 | string | By specifying this property in the global configuration file, the forms can either be opened as a new page or in a dialog. <br>Supported values are "page" or "dialog". <br> The default value is **dialog**. |
| options                                                               | object | This property allows you to enable the [saveValidator](../advanced/save_validator.md) feature.                                                                                                                |
| hook                                                                  | object | It is used to add custom behaviour to forms. Visit the [Custom Hook](../custom_ui_extensions/custom_hook.md) page to learn more.                                                                              |
| [warning](../advanced/custom_warning.md)                              | object | It is used to add the custom warning message for each of the modes of 'create', 'edit', 'config', and 'clone'. The message is displayed on the form.                                                          |
| conf                                                                  | string | TBD                                                                                                                                                                                                           |
| restHandlerName                                                       | string | TBD                                                                                                                                                                                                           |
| restHandlerModule                                                     | string | TBD                                                                                                                                                                                                           |
| restHandlerClass                                                      | string | TBD                                                                                                                                                                                                           |

### Usage

This is how the global configuration looks like without tabs:

```json
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

### Output

This is how it looks like in the UI:

![image](../images/inputs/Introduction_Output.png)
