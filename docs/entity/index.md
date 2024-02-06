---
title: Entity
---

## Entity Properties

| Property                                                      | Type                      | Description                                                                                                                      | Default Value |
| ------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| field<span class="required-asterisk">\*</span>                | string                    | It defines a particular entity field.                                                                                             | -             |
| label<span class="required-asterisk">\*</span>                | string                    | It represents a caption for a field in a user interface.                                                                         | -             |
| [type](./components)<span class="required-asterisk">\*</span> | string                    | It specifies the type of entity to be rendered in an inputs or configuration form.                                                    | -             |
| help                                                          | string                    | It helps give context about a fields input, such as how the input will be used. It is displayed directly below an input field. | -             |
| tooltip                                                       | string                    | It displays a tool tip beside the label.                                                                                             | -             |
| defaultValue                                                  | string, number or boolean | This property is the initial input value.                                                                                                         | -             | 
| [options](#common-options)                                    | object                    | It specifies an additional attribute for a particular type of entity, such as `items` for a radio bar.                             | -             |
| required                                                      | boolean                   | It specifies whether the field is required or not.                                                                                 | false         |
| encrypted                                                     | boolean                   | It encrypts that particular field.                                                                                                | false         |
| [validators](./validators)                                    | array                     | It is used to validate the values of fields using various validators.                                                            | -             |

> [!WARNING]  
> The [Placeholder](https://splunkui.splunkeng.com/Packages/react-ui/Text?section=develop) attribute is deprecated and will be removed in the next major version. Instead, use the "help" attribute.

## Common Options

| Property            | Type    | Description                                                                       | Default Value |
| ------------------- | ------- | --------------------------------------------------------------------------------- | ------------- |
| placeholder         | string  | (`Deprecated`) The grey text is shown when the input is empty.                      | -             |
| display             | boolean | It chooses whether or not to display the field.                                                   | true          |
| disableonEdit       | boolean | When the form is in edit mode, the field becomes uneditable.                      | false         |
| enable              | boolean | The enable property sets whether a field is enabled or not.                      | true          |
| requiredWhenVisible | boolean | It displays the required field on the UI when it appears. It is used only for visibility. | false         |
