# Overview


!!! warning "Early Stage Feature"

    This feature is in its early stages. While the main concepts are expected to remain consistent, minor configuration changes may occur in future releases.

The UCC package simplifies the deployment of React applications featuring the Splunk UI by eliminating the need for NodeJS, Yarn, or front-end dependency installations. The core requirement for deployment is a `globalConfig.json` file. While UCC supports a broad range of use cases, there may be scenarios where the provided API options do not fully meet your needs.

For such instances, UCC offers a component context-based loading mechanism. Similar to [standard extensions](../standard/overview.md) (runtime custom JavaScript), this feature enables the invocation of specific functionalities at pivotal moments in the application lifecycle, such as `onChange` and `onRender` events.

**Note:** Unlike standard extensions, this feature requires NodeJS and other libraries to function correctly. However, it facilitates easier and faster development through type checking and type interfaces that describe allowed properties and functionalities.

---

## Integrating Custom Components

### Example `globalConfig.json`

```json
{
  "inputs": {
    "title": "Inputs",
    "description": "Manage your data inputs",
    "services": [
      {
        "name": "example_input_one",
        "title": "Example Input One",
        "hook": {
          "src": "CustomHook",
          "type": "external"
        },
        "entity": [{
          "field": "custom_input_field",
          "label": "My Custom Input",
          "type": "custom",
          "options": {
            "src": "CustomInput",
            "type": "external"
          }
        }]
      }
    ]
  }
}
```

**Key Notes:**

- Specify the `type` key as `external` to indicate that these scripts should use the ESM syntax for module exporting and importing.

---

To integrate custom components, you can configure the `globalConfig.json` file as follows. For example, custom JavaScript files can be located at:

```
ta_directory/ui/src/ui_extensions/
```

## Component Initialization

Although UCC does not directly support components due to its design choices, you can integrate them through JavaScript. Below is an example of integrating a React component to create a custom date picker.

### Example: `CustomComponentDatePicker.ts`

File path:  

```
ta_directory/ui/src/ucc-ui-extensions/CustomComponentDatePicker.ts
```

```javascript
import React from "react";
import ReactDOM from "react-dom";
import { CustomControlBase } from "@splunk/add-on-ucc-framework";
import { DateChangeHandler } from "@splunk/react-ui/Date";

const CustomDateInput = React.lazy(() => import("./DateInput"));

export default class CustomComponentDatePicker extends CustomControlBase {
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
      this.el
    );
  }
}
```

---

### Initializing Components in `ucc-ui.ts`

To initialize front-end code, you need to provide an `uccInit` function in the `ucc-ui.ts` file. The execution must follow the proper format:

```javascript
{
  ComponentNameFromGlobalConfig: {
    component: ComponentClassUsedForRendering,
    type: 'control',
  }
}
```

**Key Properties:**

- `ComponentNameFromGlobalConfig`: Matches the `src` defined in the `globalConfig.json` file.
- `component`: Refers to a component that extends one of the available custom component types (`CustomHookBase`, `CustomControlBase`, `CustomTabBase`, `CustomCellBase`, `CustomRowBase`).
- `type`: Defines the component type. Available types `"hook"`, `"cell"`, `"row"`, `"control"` and `"tab"`.

### Example: `ucc-ui.ts`

File path:  

```
ta_directory/ui/src/ucc-ui.ts
```

```javascript
import { uccInit } from "@splunk/add-on-ucc-framework";
import DateInputClass from "./ucc-ui-extensions/CustomComponentDatePicker";
import AdvancedInputsTabClass from "./ucc-ui-extensions/AdvancedInputsTab";

uccInit({
  DateInput: {
    component: DateInputClass,
    type: 'control',
  },
  AdvancedInputsTab: {
    component: AdvancedInputsTabClass,
    type: 'tab',
  },
}).catch((error) => {
  console.error("Could not load UCC", error);
});
```

---

### Adding Build Commands

To streamline the build process, you may need to adjust the `package.json` file to include a build command:

```javascript
module.exports = {
    //...
    "scripts": {
        "ucc-gen": "ucc-gen-ui ta_name=Splunk_TA_Example init_file_dir=src/ucc-ui.ts",
    },
}
```

The command accepts the following parameters:

| Parameter       | Description                                                                                                                         | Default Value                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ta_name`       | The name of the current TA, used to locate the correct directory in the output folder.                                              | None                                                                                          |
| `init_file_dir` | The file containing the `uccInit` function. While `.ts` files are recommended, `.js` files can also be used for easier transitions. | `src/ucc-ui.ts`                                                                               |
| `output`        | The destination directory containing the TA output and all required files. That will be used with method `resolve(output, TA_NAME, 'appserver/static/js/build')`                                                          | `resolve(uiDir, '../output', TA_NAME, 'appserver/static/js/build')` (relative to the UI code) |

---

## Smooth Build Process

To ensure a smooth build process, follow these steps:

- **Create a `build-ui.sh` Script**

File path:  

```
ta_directory/scripts/build-ui.sh
```

```bash
#!/bin/bash

# Determine the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Node.JS is not installed. Please install Node.JS to continue."
    exit 1
fi

if [ "$CI" = "true" ]; then
    npm --prefix "$SCRIPT_DIR/../ui" ci
else
    npm --prefix "$SCRIPT_DIR/../ui" install
fi

npm --prefix "$SCRIPT_DIR/../ui" run ucc-gen output=$(pwd)
```

- **Extend `additional_packaging.py` to Execute the Script**

File path:  

```
ta_directory/additional_packaging.py
```

```python
import os
from os import path

def additional_packaging(addon_name: str) -> None:
    # ...
    build_ui_script = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "scripts", "build-ui.sh"
    )
    if path.exists(build_ui_script):
        os.system(f"chmod +x {build_ui_script}")
        return_code = os.system(build_ui_script)
        if return_code != 0:
            os._exit(os.WEXITSTATUS(return_code))
```

---

## Best Practices

### Lazy Loading

Currently, all components are loaded directly upon initialization. For larger components, we recommend introducing a lazy loading mechanism within the components themselves.

**Example:**

```javascript
const CustomDateInput = React.lazy(() => import("./DateInput"));
```

This approach imports the final `DateInput` component. The `CustomComponentDatePicker` acts as a wrapper to control rendering and handle data flow.
