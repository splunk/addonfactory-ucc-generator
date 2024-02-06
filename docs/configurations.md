The `Configuration` tab can have multiple subtabs, for example, a tab for
account configuration (to configure the account by adding account credentials),
proxy configuration, and logging level configuration.

### Configuration Properties

| Property                                                          | Type   | Description                                             |
| ----------------------------------------------------------------- | ------ | ------------------------------------------------------- |
| title<span class="required-asterisk">\*</span>                    | string | -                                                       |
| description                                                       | string | It provides a brief summary of an configuration page.    |
| [subDescription](./advanced/sub_description)                     | object | It provides a broader description of an configuration page. |
| [tabs](#tabs-properties)<span class="required-asterisk">\*</span> | array  | It specifies a list of tabs.                               |

### Tabs properties

| Property                                                     | Type   | Description                                                                                                                                                                                        |
| ------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name<span class="required-asterisk">\*</span>                | string | It defines the particular tab name.                                                                                                                                                                 |
| title<span class="required-asterisk">\*</span>               | string | It show the title of the tab.                                                                                                                                                                      |
| [entity](../entity)<span class="required-asterisk">\*</span> | array  | It is a list of fields and their properties.                                                                                                                                                             |
| [table](../table)                                            | object | It displays accounts stanza in the table.                                                                                                                                                                |
| style                                                        | string | By specifying this property in the global configuration file, the forms can either be opened as a new page or in a dialog. <br>The supported values are "page" or "dialog". <br> The default value is **dialog**. |
| options                                                      | object | This property allows you to enable the [saveValidator](../advanced/save_validator) feature.                                                                                                        |
| hook                                                         | object | It is used to add custom behaviour to forms. Visit the [Custom Hook](../custom_ui_extensions/custom_hook) page to learn more.                                                                      |
| [warning](./advanced/custom_warning.md)                      | object | It is used to add a custom warning message for each of the modes 'create', 'edit', 'config', and 'clone', with the message is displayed on the form.                                                                     |
| conf                                                         | string | TBD                                                                                                                                                                                                |
| restHandlerName                                              | string | TBD                                                                                                                                                                                                |
| restHandlerModule                                            | string | TBD                                                                                                                                                                                                |
| restHandlerClass                                             | string | TBD                                                                                                                                                                                                |
| customTab                                                    | Object | This property allows you to enable the [custom tab](../custom_ui_extensions/custom_tab) feature.                                                                                                   |

### Usage

```json
"configuration": {
    "title": "Configuration",
    "description": "Set up your add-on",
    "tabs": [
        {
            "name": "account",
            "title": "Account",
            "table": {},
            "entity": []
        },
        {
            "name": "proxy",
            "title": "Proxy",
            "entity": [],
            "options": {
                "saveValidator": ""
            }
        }
    ]
}
```

### Output

This is how table looks in the UI:

![image](images/configuration/configuration_with_table_output.png)

This is how form looks in the UI:

![image](images/configuration/configuration_without_table_output.png)
