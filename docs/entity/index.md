---
title: Entity
---

## Entity Properties

| Property                                                         | Type                      | Description                                                                                                                      | Default Value |
|------------------------------------------------------------------|---------------------------|----------------------------------------------------------------------------------------------------------------------------------|---------------|
| field<span class="required-asterisk">\*</span>                   | string                    | To define a particular entity field.                                                                                             | -             |
| label<span class="required-asterisk">\*</span>                   | string                    | It represents a caption for a field in a user interface.                                                                         | -             |
| [type](./components.md)<span class="required-asterisk">\*</span> | string                    | To specify the type of entity to be rendered in inputs or configuration form.                                                    | -             |
| help                                                             | string                    | Help text gives context about a fields input, such as how the input will be used. It is displayed directly below an input field. | -             |
| tooltip                                                          | string                    | Displays a tooltip beside the label.                                                                                             | -             |
| defaultValue                                                     | string, number or boolean | The initial input value.                                                                                                         | -             |
| [options](#common-options)                                       | object                    | To specify an additional attribute for a particular type of entity, such as `items` for a radio bar.                             | -             |
| required                                                         | boolean                   | To specify whether the field is required or not.                                                                                 | false         |
| encrypted                                                        | boolean                   | To encrypt that particular field.                                                                                                | false         |
| [validators](./validators.md)                                    | array                     | It is used to validate the values of fields using various validators.                                                            | -             |
| [modifyFieldsOnValue](./modifyFieldsOnValue.md)                  | array                     | It is used to speficy values and parameters that will influence visually other entities.                                         | -             |

> [!WARNING]  
> The [Placeholder](https://splunkui.splunk.com/Packages/react-ui/Text?section=develop) attribute is deprecated and will be removed in the next major version.
> The placeholder text is no longer displayed in the UI. Instead, use the `help` attribute.

## Common Options

| Property            | Type    | Description                                                                            | Default Value |
|---------------------|---------|----------------------------------------------------------------------------------------|---------------|
| placeholder         | string  | (`Deprecated`) The grey text is shown when the input is empty.                         | -             |
| display             | boolean | It chooses whether or not to display the field.                                        | true          |
| disableonEdit       | boolean | When the form is in edit mode, the field becomes unable to be edited.                  | false         |
| enable              | boolean | The enable property sets whether a field is enabled or not.                            | true          |
| requiredWhenVisible | boolean | It makes the field required on the UI when it appears. It is used only for visibility. | false         |
