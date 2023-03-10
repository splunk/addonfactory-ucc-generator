We can use this feature to map field values to more meaningful values for display in a table. The category field, for example, stores values such as 1, 2, and 4. Displaying values as they are might confuse the end user; therefore, to avoid confusion, we can map these values to meaningful values, as shown in the example below.

### Usage

```json
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
                "field": "key_id",
                "label": "Key ID"
            },
            {
                "field": "category",
                "label": "Region Category",
                "mapping": {
                    "1": "Global",
                    "2": "US Gov",
                    "4": "China"
                }
            }
        ],
        "actions": [
            "edit",
            "delete"
        ]
    },
    "entity": [
        {
            "field": "name",
            "label": "Name",
            "type": "text",
            "required": true,
        },
        {
            "field": "key_id",
            "label": "Key ID",
            "type": "text",
        },
        {
            "field": "category",
            "label": "Region Category",
            "type": "singleSelect",
            "required": true,
            "defaultValue": 1,
            "options": {
                "disableSearch": true,
                "autoCompleteFields": [
                    {
                        "label": "Global",
                        "value": 1
                    },
                    {
                        "label": "GovCloud",
                        "value": 2
                    },
                    {
                        "label": "China",
                        "value": 4
                    }
                ]
            }
        }
    ]
}
```

### Output

This is how it looks like in the UI:

![image](../images/advanced/custom_mapping_output.png)
