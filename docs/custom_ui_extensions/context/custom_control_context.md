# Custom Control

The Custom Control feature allows you to display any customised input component in a form. The developer can easily design and render any complex input component with this feature. Modern add-ons frequently require the use of complex input components, and this feature will allow you to use the custom component in the form that is best suited to your needs, without relying on newer releases of UCC for support.

### Properties

| Property     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| globalConfig | It is a hierarchical object that contains the globalConfig file's properties and values.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| el           | The `el` is used to render a custom input element in a form.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| data         | The `data` object holds details regarding the execution: <li>mode - one of create, edit, clone, or config. Defines state of entity form.</li><li>value - value of the field,</li><li>serviceName - name of service where this custom component is being rendered.</li>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| setValue     | This method is used to set the value of the custom component. <br>**Usage:** `setValue(newValue)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
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

index.tsx

```typescript
import React from "react";
import ReactDOM from "react-dom";
import { CustomControlBase } from "@splunk/add-on-ucc-framework";
import { DateChangeHandler } from "@splunk/react-ui/Date";

const CustomDateInput = React.lazy(() => import("./DateInput"));

export default class DateInputClass extends CustomControlBase {
  onDateChange: DateChangeHandler = (_event, data) => {
    this.setValue(data.value);
  };

  render() {
    const dateValue = this.data.value;
    const date =
      typeof dateValue === "string" && dateValue.length !== 0
        ? dateValue
        : undefined;

    ReactDOM.render(
      <React.Suspense fallback={<div></div>}>
        <CustomDateInput value={date} onChange={this.onDateChange} />
      </React.Suspense>,
      this.el,
    );
  }
}
```

DateInput.tsx

```typescript
import React from "react";
import DateSuiInput, { DateChangeHandler } from "@splunk/react-ui/Date";

function DateInput(props: { value?: string; onChange: DateChangeHandler }) {
  const today = props.value ?? new Date().toISOString().split("T")[0];

  return <DateSuiInput defaultValue={today} onChange={props.onChange} />;
}

export default DateInput;
```

ucc-ui.tsx

```typescript
import { uccInit } from "@splunk/add-on-ucc-framework";
import DateInputClass from "./ucc-ui-extensions/DateInput";

uccInit({
  DateInput: {
    component: DateInputClass,
    type: "control",
  },
}).catch((error) => {
  console.error("Could not load UCC", error);
});
```


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
