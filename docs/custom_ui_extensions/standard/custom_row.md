# Custom Row

When a row is expanded on the Inputs table or Configuration Table, Custom Row is utilized to incorporate a customized element. By clicking on the icon provided on the left side of each row, the input-specific details are displayed.

### Properties

| Property     | Description                                                                           |
| ------------ | ------------------------------------------------------------------------------------- |
| globalConfig | is a hierarchical object that contains the globalConfig file's properties and values. |
| el           | is used to render a customized element on the Inputs table when a row is expanded.    |
| serviceName  | is the name of the service/tab specified in the globalConfig file.                    |
| row          | is the object of the record for which the CustomRowInput constructor is called.       |

### Methods

| Property  | Description                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| render    | is a method which contains the logic to display the custom row component. This method is automatically executed when the row is expanded |
| getDLRows | is a method which contains the logic to update the custom row values, return a key-value pair.                                           |

> Note

> - Atleast one method should be present
> - If both method is present then the getDLRows method have the high priority.

### Usage

```
"inputs": {
    "title": "Inputs",
    "description": "Manage your data inputs",
    "services": [],
    "table": {
        "actions": ["edit", "delete", "clone"],
        "header": [],
        "customRow": {
            "src": "custom_input_row",
            "type": "external"
        }
    }
}
```

### Example

```js
--8<-- "tests/testdata/test_addons/package_global_config_everything/package/appserver/static/js/build/custom/custom_input_row.js"
```

> Note:

> - The content should be included in the JavaScript file named by customRow.src property in globalConfig (see usage for details).
> - The Javascript file for the custom control should be saved in the custom folder at `appserver/static/js/build/custom/`.

### Output

This is how it looks in the UI:

![image](../../images/custom_ui_extensions/standard/custom_Row_Output.png)
