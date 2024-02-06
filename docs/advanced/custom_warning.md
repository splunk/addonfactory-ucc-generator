This feature allows us to pass broarder description on Input and Configuration page displayed under main description.

### Warning Properties

| Property | Type   | Description                               |
| -------- | ------ | ----------------------------------------- |
| create   | object | Warning object definition for create form |
| edit     | object | Warning object definition for edit form   |
| clone    | object | Warning object definition for clone form  |
| config   | object | Warning object definition for config form |

### Warning Object Properties

| Property                                         | Type    | Description                                                                                 |
| ------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------- |
| message<span class="required-asterisk">\*</span> | string  | Text used for that description, you can put \n to add a breakline                           |
| alwaysDisplay                                    | boolean | Force warning to be always displayed, even after input changes. Default value is **false**. |

### Usage

```json
"warning": {
    "create": {
        "message": "Some warning for create form",
        "alwaysDisplay": true
    },
    "edit": {
        "message": "Some warning for edit form "
    },
    "clone": {
        "message": "Some warning for clone form"
    }
},
```
