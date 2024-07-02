# Components supported by UCC

Components are used by UCC to render the Inputs and Configuration pages. See the following list of the supported components.

For a detailed look at our component implementations and to interact with them in a live environment, visit our <a href="/addonfactory-ucc-generator/storybook">Storybook library</a>.

## `Text`

See the underlying `@splunk/react-ui` component: [`Text`](https://splunkui.splunk.com/Packages/react-ui/Text).

See the following example usage:

```json
{
    "type": "text",
    "label": "Name",
    "validators": [
        {
            "type": "string",
            "errorMsg": "Length of Name should be between 1 to 50 characters.",
            "minLength": 1,
            "maxLength": 50
        },
        {
            "type": "regex",
            "errorMsg": "Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",
            "pattern": "^[a-zA-Z]\\w*$"
        }
    ],
    "options": {
        "placeholder": "Required"
    },
    "field": "name",
    "help": "Enter a unique name for this account.",
    "required": true
}
```

This is how it looks in the UI:

![image](../images/components/text_component_example.png)

## `Text Area`

See the underlying `@splunk/react-ui` component: [`TextArea`](https://splunkui.splunk.com/Packages/react-ui/TextArea).

The `textarea` component is very similar to the `text` component, but allows you to have a multi-line input for text.

### Options

| Property | Type   | Description                        | Default Value |
| -------- | ------ | ---------------------------------- | ------------- |
| rowsMax  | number | Maximum number of rows to display. | 12            |
| rowsMin  | number | Minimum number of rows to display. | 8             |

See the following example:

```json
{
    "type": "textarea",
    "label": "Textarea Field",
    "field": "textarea_field",
    "help": "Help message",
    "options": {
        "rowsMin": 3,
        "rowsMax": 15
    },
    "required": true
}
```

This is how it looks in the UI:

![image](../images/components/textarea_component_example.png)

## `Single Select`

A `singleSelect` is a feature that combines a drop-down box, and/or editable text field, giving the user multiple ways to input or select the desired information.

See the underlying `@splunk/react-ui` components: [`Select`](https://splunkui.splunk.com/Packages/react-ui/Select) or [`Combo Box`](https://splunkui.splunk.com/Packages/react-ui/ComboBox) depending on the `createSearchChoice` option.

When the `createSearchChoice` option is set to true, the Singleselect component becomes a text input with auto-complete.

A clear button is visible to the right of the dropdown when this field is marked as required.

### Options

| Property                                          | Type    | Description                                                                                                                                                                    | Default Value |
| ------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| disableSearch                                     | boolean | It determines whether to show the filter box. When false, the children are automatically filtered based on the label.                                                          | false         |
| createSearchChoice                                | boolean | It allows the user to add arbitrary values.                                                                                                                                    | false         |
| referenceName                                     | string  | Dropdown options will be generated via an API call to the service's restHandler.                                                                                               | -             |
| endpointUrl                                       | string  | Dropdown options will be generated via an API call to that endpoint.                                                                                                           | -             |
| allowList                                         | string  | It only accepts options that match the regex based on the name attribute when received via an API call using `endpointUrl` and `referenceName`. It is applied before denyList. | -             |
| denyList                                          | string  | It filters options that don't match the regex based on the name attribute when received via an API call using `endpointUrl` and `referenceName`.                               | -             |
| labelField                                        | string  | If you use endpointUrl and your data are not simple text data, you can specify here which property of retrieved object should be used.```item.content?.[labelField]```         | -             |
| [dependencies](../advanced/dependent_dropdown.md) | array   | It is used to update the options via an API call when the value of any field in the dependencies list is updated.                                                              | -             |

### See the following example usage

#### Using referenceName option

```json
{
    "type": "singleSelect",
    "label": "Example Account",
    "options": {
        "referenceName": "account"
    },
    "help": "",
    "field": "account",
    "required": true
}
```

This is how it looks in the UI:

![image](../images/components/selectselect_component_example_reference.png)

#### Using autoCompleteFields Options

```json
{
    "type": "singleSelect",
    "label": "Proxy Type",
    "options": {
        "disableSearch": true,
        "autoCompleteFields": [
            {
                "value": "http",
                "label": "http"
            },
            {
                "value": "socks5",
                "label": "socks5"
            }
        ]
    },
    "defaultValue": "http",
    "field": "proxy_type"
}
```

This is how it looks in the UI:

![image](../images/components/selectselect_component_example_autocomplete.png)

#### Using createSearchChoice option

```json
{
    "type": "singleSelect",
    "label": "Index",
    "validators": [
        {
            "type": "string",
            "errorMsg": "Length of index name should be between 1 to 80 characters.",
            "minLength": 1,
            "maxLength": 80
        }
    ],
    "defaultValue": "default",
    "options": {
        "endpointUrl": "data/indexes",
        "denyList": "^_.*$",
        "createSearchChoice": true
    },
    "field": "index",
    "required": true
}
```

This is how it looks in the UI:

![image](../images/components/selectselect_component_example_createSearchChoice.png)

#### Using autoCompleteFields option with groups

```json
{
    "field": "singleSelectTest",
    "label": "Single Select Group Test",
    "type": "singleSelect",
    "options": {
        "createSearchChoice": true,
        "autoCompleteFields": [
            {
                "label": "Group1",
                "children": [
                    {
                        "value": "one",
                        "label": "One"
                    },
                    {
                        "value": "two",
                        "label": "Two"
                    }
                ]
            },
            {
                "label": "Group2",
                "children": [
                    {
                        "value": "three",
                        "label": "Three"
                    },
                    {
                        "value": "four",
                        "label": "Four"
                    }
                ]
            }
        ]
    }
}
```

This is how it looks in the UI:

![image](../images/components/selectselect_component_example_autocomplete_group.png)

## `Checkbox`

See the underlying `@splunk/react-ui` component: [`Switch`](https://splunkui.splunk.com/Packages/react-ui/Switch).

See the following example usage:

```json
{
    "type": "checkbox",
    "label": "Enable",
    "field": "proxy_enabled"
}
```

This is how it looks in the UI:

![image](../images/components/checkbox_component_example.png)

## `CheckboxGroup`

See the following example usage:

```json
{
  "type": "checkboxGroup",
  "label": "CheckboxGroupTitle",
  "field": "api3",
  "options": {
    "groups": [
      {
        "label": "Group 1",
        "options": {
          "isExpandable": true,
          "expand": true
        },
        "fields": ["rowUnderGroup1"]
      },
      {
        "label": "Group 3",
        "options": {
          "isExpandable": true,
          "expand": true
        },
        "fields": ["field223", "160validation"]
      }
    ],
    "rows": [
      {
        "field": "rowWithoutGroup",
        "input": {
          "defaultValue": 1,
          "required": true
        }
      },
      {
        "field": "rowUnderGroup1",
        "checkbox": {
          "label": "Row under Group 1",
          "defaultValue": true
        },
        "input": {
          "defaultValue": 1200,
          "required": false
        }
      },
      {
        "field": "field223",
        "checkbox": {
          "label": "Required field",
          "defaultValue": true
        },
        "input": {
          "required": true
        }
      },
      {
        "field": "160validation",
        "checkbox": {
          "label": "from 1 to 60 validation"
        },
        "input": {
          "validators": [
            {
              "type": "number",
              "range": [1, 60]
            }
          ]
        }
      }
    ]
  }
}
```

This is how it looks in the UI:

![image](../images/components/checkbox_group_mixed_example.png)

The component maps and unmaps values into a single field in the format `fieldName1/fieldValue1,fieldName2/fieldValue2`, but only for checked rows. For the given example, it emits the following value: `rowUnderGroup1/1200,requiredField/10`.

## `Multiple Select`

See the underlying `@splunk/react-ui` component: [`Multiselect`](https://splunkui.splunk.com/Packages/react-ui/Multiselect).

Multiselect allows the user to select multiple options at once.

### Options

| Property                                                | Type    | Description                                                                                                                                                                                              | Default Value |
| ------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| items                                                   | array   | An array of options with a label and a value.                                                                                                                                                            | -             |
| delimiter                                               | string  | It delimits each value of the field with a predefined character. <br>For example, In the data option_a\|option_b, a vertical bar (the pipe character) delimits the two data items option_a and option_b. | comma(`,`)    |
| createSearchChoice                                      | boolean | It allows the user to add arbitrary values.                                                                                                                                                              | false         |
| referenceName                                           | string  | Dropdown options will be generated via an API call to the service's restHandler.                                                                                                                         | -             |
| endpointUrl                                             | string  | Dropdown options will be generated via an API call to that endpoint.                                                                                                                                     | -             |
| allowList                                               | string  | It only accepts options that match the regex based on the name attribute when received via API call using `endpointUrl` and `referenceName`. It is applied before denyList.                              | -             |
| denyList                                                | string  | It filters options that don't match the regex based on the name attribute when received via API call using `endpointUrl` and `referenceName`.                                                            | -             |
| labelField                                              | string  | If you use endpointUrl and your data are not simple text data, you can specify here which property of retrieved object should be used.```item.content?.[labelField]```                                   | -             |
| [dependencies](../advanced/dependent_dropdown.md)       | array   | It is used to update options via an API call when the value of any field in the dependencies list is updated.                                                                                            | -             |
| [autoCompleteFields](#using-autocompletefields-options) | array   | It is used to add options in the Single select or Multiple select component.                                                                                                                             | -             |

See the following example usage:

```json
{
    "type": "multipleSelect",
    "field": "test_multiselect",
    "label": "Test Multiselect",
    "options": {
        "delimiter": "|",
        "items": [
            {
                "value": "option_a",
                "label": "Option A"
            },
            {
                "value": "option_b",
                "label": "Option B"
            }
        ]
    }
}
```

This is how it looks in the UI:

![image](../images/components/multiselect_component_example.png)

## `Radio Bar`

See the underlying `@splunk/react-ui` component: [`RadioBar`](https://splunkui.splunk.com/Packages/react-ui/RadioBar).

RadioBar is a component that provides the ability to select one option out of a group. It can be used when we need to select a field value from a few options.

### Options

| Property                                      | Type  | Description                                                    | Default Value |
| --------------------------------------------- | ----- | -------------------------------------------------------------- | ------------- |
| items<span class="required-asterisk">*</span> | array | This property is an array of options with a label and a value. | -             |

See the following example usage:

```json
{
    "field": "test_radio",
    "label": "Test Radio",
    "type": "radio",
    "defaultValue": "Yes",
    "required": false,
    "options": {
        "items": [
            {
                "value": "yes",
                "label": "Yes"
            },
            {
                "value": "no",
                "label": "No"
            }
        ],
        "display": true
    }
}
```

This is how it looks in the UI:

![image](../images/components/radio_component_example.png)

## `Help Link`

See the underlying `@splunk/react-ui` component: [`Link`](https://splunkui.splunk.com/Packages/react-ui/Link).

It will open the link in a new tab.

### Options

| Property                                     | Type   | Description                                     | Default Value |
| -------------------------------------------- | ------ | ----------------------------------------------- | ------------- |
| text<span class="required-asterisk">*</span> | string | It is a message to be displayed.                | -             |
| link<span class="required-asterisk">*</span> | string | It is a link where the user will be redirected. | -             |

See the following example usage:

```json
{
    "field": "example_help_link",
    "label": "",
    "type": "helpLink",
    "options": {
        "text": "Help Link",
        "link": "https://docs.splunk.com/Documentation",
    }
}
```

This is how it looks in the UI:

![image](../images/components/help_link_component_example.png)

## `File`

See the underlying `@splunk/react-ui` component: [`File`](https://splunkui.splunk.com/Packages/react-ui/File).

By default it supports files that can be opened in text mode or with a text editor, which are files with extensions such as txt, json, xml, yaml, pem, key, crt, etc.

It only sends file content to the server by reading it using the [readAsArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer) method of the FileReader class, and then decoding it into **UTF-8** format, using the [decode](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder/decode) method of the TextDecoder class.

If `options` property contains useBase64Encoding is set up as true, then readAsArrayBuffer method is replaced with [readAsDataURL](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL) and obtained data are correctly proceeded to store only file content (beggining of result is removed, as it contains unwanted informations and pure encoded file content is saved). With that approach any file is stored in **Base64** format.

The file content can be validated using in-built validators such as [string](validators.md#string) and [regex](validators.md#regex), and a custom validator can also be implemented using a [custom hook](../custom_ui_extensions/custom_hook.md) and [saveValidator](../advanced/save_validator.md).

This feature allows you to upload a single file.

### Options

| Property                                                    | Type    | Description                                                                                 | Default Value |
| ----------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- | ------------- |
| fileSupportMessage                                          | string  | It displays a message inside a file component.                                              | -             |
| supportedFileTypes<span class="required-asterisk">\*</span> | array   | It is a list of the file types that the user can upload.                                    | -             |
| maxFileSize                                                 | number  | It sets the maximum file size in KB that a user can upload.                                 | 500KB         |
| useBase64Encoding                                           | boolean | It defines used encoding for files. If true base64 will be used, if false utf-8 is applied. | false         |

See the following example usage:

```json
{
    "type": "file",
    "label": "SA certificate",
    "help": "Upload service account's certificate",
    "field": "service_account",
    "options": {
        "fileSupportMessage": "Support message",
        "supportedFileTypes": ["pem", "txt"],
        "maxFileSize": 100,
        "useBase64Encoding": false
    },
    "validators": [
        {
            "type": "regex",
            "pattern": "(-----BEGIN CERTIFICATE-----(\n|\r|\r\n)([0-9a-zA-Z\+\/=]{64}(\n|\r|\r\n))*([0-9a-zA-Z\+\/=]{1,63}(\n|\r|\r\n))?-----END CERTIFICATE-----)"
        }
    ],
    "encrypted": true,
    "required": true
}
```

This is how it looks in the UI:

![image](../images/components/file_component_example.png)

## `OAuth`

The Oauth type entity enables us to use Oauth2.0 for user authentication. Visit the [Oauth Support](../advanced/oauth_support.md) page to learn more.

## `Interval`

A [Text](#text) field used to specify [interval](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf#Scripted_Input:)
value, i.e. a number greater than or equal to 0, or -1.

<h3> Options </h3>

| Property | Type                         | Description             |
| -------- | ---------------------------- | ----------------------- |
| range    | list of numbers (2 elements) | Range of allowed values |

See the following example:

```json
{
    "type": "interval",
    "label": "Interval",
    "field": "interval",
    "options": {
      "range": [10, 20]
    }
}
```

## `Custom`

Custom type entity enables us to create our own custom inputs within the Form components. As a result, we may include our own custom input fields on the form. Visit the [Custom Control](../custom_ui_extensions/custom_control.md) page to learn more.
