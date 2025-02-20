# Modify Fields On Change

This feature allows to specify conditions to modify other fields based on current field value change.

### Modification Object Properties

| Property                                            | Type   | Description                                                                                                                       |
| --------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| fieldValue<span class="required-asterisk">\*</span> | string | Value of current field that will trigger the update. Put `[[any_other_value]]` to make update for any other value than specified. |
| mode                                                | string | Mode that adds possibility to use modification only on certain mode. One of ( `create` / `edit` / `clone` / `config` )            |
| fieldsToModify                                      | array  | List of fields modifications that will be applied after com ponent value will match.                                              |

### fieldsToModify Properties

| Property                                         | Type                      | Description                                                  |
| ------------------------------------------------ | ------------------------- | ------------------------------------------------------------ |
| fieldId<span class="required-asterisk">\*</span> | string                    | Used to identify field that modifications will be applied to |
| display                                          | boolean                   | Declares display property of target component                |
| value                                            | string, number or boolean | Declares current value of target component                   |
| disabled                                         | boolean                   | Declares if component should be disabled (enable = false)    |
| required                                         | boolean                   | Declares if component should be required                     |
| help                                             | string                    | Declares help text                                           |
| label                                            | string                    | Declares label text                                          |
| markdownMessage                                  | object                    | Declares markdown message to display                         |

### markdownMessage Properties

| Property                                              | Type   | Description                                                                      |
| ----------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| markdownType<span class="required-asterisk">\*</span> | string | Declare type of markdown. Accepts: "text", "hybrid", "link"                      |
| text<span class="required-asterisk">\*</span>         | string | Used for all types to declare message content                                    |
| color                                                 | string | Used for "text" type to specify color of displayied text. Accepts all CSS colors |
| token                                                 | string | Used for "hybrid" type to declare string that will be swapped into link          |
| linkText                                              | string | Used for "hybrid" type to declare string that will put in place of token         |
| link                                                  | string | Used for "hybrid" and "link" types to declare url that will use for redirection  |

### Usage

<details>
  <summary>Checkbox</summary>

```json
{
    "type": "checkbox",
    "label": "Example Checkbox",
    "field": "account_checkbox",
    "help": "This is an example checkbox for the account entity",
    "modifyFieldsOnValue": [
        {
            "fieldValue": 1,
            "fieldsToModify": [
                {
                    "fieldId": "account_radio",
                    "disabled": false
                },
                {
                    "fieldId": "endpoint",
                    "display": true
                }
            ]
        },
        {
            "fieldValue": 0,
            "mode": "edit",
            "fieldsToModify": [
                {
                    "fieldId": "account_radio",
                    "disabled": true
                },
                {
                    "fieldId": "endpoint",
                    "display": false
                }
            ]
        }
    ]
},
```

</details>

<details>
  <summary>Text input</summary>

```json
{
    "label": "Username",
    "type": "text",
    "help": "Enter the username for this account.",
    "field": "username",
    "modifyFieldsOnValue": [
        {
            "fieldValue": "[[any_other_value]]",
            "fieldsToModify": [
                {
                    "fieldId": "some_other_field",
                    "disabled": false,
                    "display": true,
                    "label": "New label for other values",
                    "value": "New value for other values",
                    "help": "New help for other values",
                    "markdownMessage": {
                        "markdownType": "text",
                        "text": "New markdown message for other values",
                        "color": "red"
                    },
                    "required": false
                }
            ]
        },
        {
            "fieldValue": "a",
            "fieldsToModify": [
                {
                    "fieldId": "some_other_field",
                    "display": true,
                    "disabled": true,
                    "label": "New label for value 'a' as username",
                    "value": "New value for value 'a' as username",
                    "help": "New help for value 'a' as username",
                    "markdownMessage": {
                        "markdownType": "link",
                        "text": "New markdown message for value 'a' as username",
                        "link": "https://splunk.github.io/addonfactory-ucc-generator/"
                    },
                    "required": true
                }
            ]
        },
        {
            "fieldValue": "aa",
            "fieldsToModify": [
                {
                    "fieldId": "some_other_field",
                    "disabled": false,
                    "display": false,
                    "label": "New label for value 'aa' as username",
                    "value":"New value for value 'aa' as username",
                    "help": "New help for value 'aa' as username",
                    "required": true
                }
            ]
        },
        {
            "fieldValue": "aaa",
            "fieldsToModify": [
                {
                    "fieldId": "some_other_field",
                    "disabled": true,
                    "display": true,
                    "label": "New label for value 'aaa' as username",
                    "value": "New value for value 'aaa' as username",
                    "help":  "New help for value 'aaa' as username",
                    "markdownMessage": {
                        "markdownType": "hybrid",
                        "text": "New markdown message token 'aaa' as username",
                        "link": "https://splunk.github.io/addonfactory-ucc-generator/",
                        "token": "token",
                        "linkText": "for value"
                    },
                    "required": true
                }
            ]
        },
        {
            "fieldValue": "aaaa",
            "mode": "edit",
            "fieldsToModify": [
                {
                    "fieldId": "some_other_field",
                    "disabled": false,
                    "display": false,
                    "label": "New label for value 'aaaa' as username used only when editing entity",
                    "value": "New value for value 'aaaa' as username used only when editing entity",
                    "help":  "New help for value 'aaaa' as username used only when editing entity",
                    "markdownMessage": {
                        "markdownType": "text",
                        "text": "markdown message plain text used only when editing entity"
                    },
                    "required": false
                }
            ]
        }
    ]
},
```

</details>

### Troubleshooting

Examples of issue you might encounter

<details>
  <summary>Usage Modification with Checkbox component</summary>

Make sure the fieldValue fields are declared as `1` for any `truthy`(checked) value and `0` for any `falsy`(unchecked) value as it is mapped considering those values. Checkbox by default do not have any value at all, so if you want to consider also this state use `[[any_other_value]]` as it will also consider basic state.

```json
{
    "type": "checkbox",
    "label": "Example Checkbox",
    "field": "account_checkbox",
    "help": "This is an example checkbox for the account entity",
    "modifyFieldsOnValue": [
        {
            "fieldValue": 1,
            "fieldsToModify": [
                {
                    "fieldId": "account_radio",
                    "disabled": false
                },
                {
                    "fieldId": "endpoint",
                    "display": true
                }
            ]
        },
        {
            "fieldValue": 0,
            "mode": "edit",
            "fieldsToModify": [
                {
                    "fieldId": "account_radio",
                    "disabled": true
                },
                {
                    "fieldId": "endpoint",
                    "display": false
                }
            ]
        }
    ]
},
```

</details>
