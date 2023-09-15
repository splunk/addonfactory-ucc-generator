---
title: Entity 
---

## Entity Properties

| Property                                                      | Type                      | Description                                                                                                                       | Default Value |
| ------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| field<span class="required-asterisk">*</span>                 | string                    | To define a particular entity field.                                                                                              | -             |
| label<span class="required-asterisk">*</span>                 | string                    | It represents a caption for a field in a user interface.                                                                          | -             |
| [type](./components)<span class="required-asterisk">*</span> | string                    | To specify the type of entity to be rendered in inputs or configuration form.                                                     | -             |
| help                                                          | string                    | Help text gives context about a fields input, such as how the input will be used. It is displayed directly under an input field. | -             |
| tooltip                                                       | string                    | Displays a tooltip beside the label.                                                                                              | -             |
| defaultValue                                                  | string, number or boolean | The initial input value.                                                                                                          | -             |
| [options](#common-options)                                    | object                    | To specify an additional attribute for a particular type of entity, such as `items` for a radio bar.                              | -             |
| required                                                      | boolean                   | To specify whether the field is required or not.                                                                                  | false         |
| encrypted                                                     | boolean                   | To encrypt that particular field.                                                                                                 | false         |
| [validators](./validators)                                   | array                     | It is used to validate the values of fields using various validators.                                                             | -             |

> [!WARNING]  
> [Placeholder](https://splunkui.splunkeng.com/Packages/react-ui/Text?section=develop) property is deprecated and will be removed in the next major version.

## Common Options

| Property      | Type    | Description                                                                                                                               | Default Value |
| ------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| placeholder   | string  | The grey text is shown when the input is empty.<br> This option will be removed when Splunk UI deprecates it in their next major release. | -             |
| display       | boolean | Whether show or hide the field.                                                                                                           | true          |
| disableonEdit | boolean | When the form is in edit mode, the field becomes uneditable.                                                                              | false         |
