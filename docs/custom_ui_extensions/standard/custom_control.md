# Custom Control

The Custom Control feature allows you to display any customised input component in a form. The developer can easily design and render any complex input component with this feature. Modern add-ons frequently require the use of complex input components, and this feature will allow you to use the custom component in the form that is best suited to your needs, without relying on newer releases of UCC for support.

### Properties

| Property     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| globalConfig | It is a hierarchical object that contains the globalConfig file's properties and values.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| el           | The `el` is used to render a custom input element in a form.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| data         | The `data` object holds details regarding the execution: <li>mode - one of create, edit, clone, or config. Defines state of entity form.</li><li>value - value of the field,</li><li>serviceName - name of service where this custom component is being rendered.</li>                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| setValue     | This method is used to set the value of the custom component. <br>**Usage:** `setValue(newValue)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| util         | This is a utility object with various functions that can be used to manipulate the UI. <br>There are 4 associated methods: <ul><li>`clearAllErrorMsg` - removes errors from form logic. Visual aspects wont be reflected until form state update. Message stays until next state update.<br>[Usage](#clearallerrormsg)</li><li>`setErrorFieldMsg` - sets up error message for any field. Message displayed on top of form and incorrect field marked red (you can pass even custom field value). Message stays until next state update.<br>[Usage](#seterrorfieldmsg)</li><li>`setErrorMsg` - sets error message for current custom field, does not mark this field visually.<br>[Usage](#seterrormsg)</li><li>`setState` - handles current state update.<br> [Usage](#setstate)</li></ul> |

### Methods

| Property   | Description                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| render     | is a method which should have logic for the custom component, and it will be executed automatically when the create, edit, or clone actions are performed. |
| validation | This method should contain the validation logic for the value of the custom component.                                                                     |

### Usage

```json
{
    "name": "account",
    "table": {},
    "entity": [
        {
            "type": "custom",
            "label": "Example Custom Control",
            "field": "custom_control_field",
            "help": "This is an example multipleSelect for account entity",
            "options":{
                "src": "custom_control",
                "type": "external"
            },
            "required": true
        },
        {
            "type": "text",
            "label": "Name",
            "field": "name",
            "help": "Enter a unique name for this account.",
            "required": true
        },
    ]
}
```

### Example

```js
class CustomControl {
    /**
     *
     * @constructor
     * @param {object} globalConfig - Global configuration.
     * @param {element} el - The element of the custom row.
     * @param {object} data - Mode, serviceName, and value.
     * @param {string} data.mode - one of `create`, `edit`, `clone`, or `config`
     * @param {string | boolean | number | undefined} data.value - current value of custom field
     * @param {string} data.serviceName - name of service in which custom field is rendered
     * @param {object} util - The utility object.
     * @param {function} setValue - set value of the custom field.
     */
    constructor(globalConfig, el, data, setValue, util) {
        this.globalConfig = globalConfig;
        this.el = el;
        this.data = data;
        this.util = util;
        this.setValue = setValue;
        
        this.onSelectOptionChange = this.onSelectOptionChange.bind(this);
    }

    onSelectOptionChange(event) {
        this.setValue(event.target.value);
    }

    validation(field, value) {
        // Validation logic for value. Return the error message if failed.
        if (value === 'input_two') {
            return 'Wrong value selected.';
        }
    }

    render() {
        let content_html = `
            <select id="custom_control">
                <option value="input_one">Input One</option>
                <option value="input_two">Input Two</option>
            </select>
        `;

        this.el.innerHTML = content_html;
        this.el.addEventListener('change', this.onSelectOptionChange);

        return this;
    }
}

export default CustomControl;
```

> Note: The Javascript file for the custom control should be saved in the custom folder at `appserver/static/js/build/custom/`.

### Output

This is how it looks in the UI:

![image](../../images/custom_ui_extensions/Custom_Control_Output.png)

### Properties usage

#### clearAllErrorMsg

```js
this.util.clearAllErrorMsg(newState) // newState is updated form state
```

or

```js
this.util.clearAllErrorMsg()
```

#### setErrorFieldMsg

```js
this.util.setErrorFieldMsg('customFieldKey', 'Custom Field was filed incorrectly')
```

```js
this.util.setErrorFieldMsg('otherFieldValue', 'Due to custom field changes, action on otherFieldValue is required')
```

#### setErrorMsg

```js
this.util.setErrorMsg('New Error message for current custom field.')
```

#### setState

```js
this.util.setState((oldState) => {
    const newState = {...oldState}
    newState.data.fieldKey = newFieldValue;
    return newState
})
```
