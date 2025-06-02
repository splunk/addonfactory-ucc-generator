# Custom Cell

A Custom Cell is used to update the content of a table cell.

`customCell` attribute will be used in the table header on the inputs and configuration page.

## Properties

| Property     | Description                                                                           |
| ------------ | ------------------------------------------------------------------------------------- |
| globalConfig | is a hierarchical object that contains the globalConfig file's properties and values. |
| el           | is used to render a custom cell element in a table.                                   |
| serviceName  | is the name of the service/tab specified in the globalConfig file.                    |
| row          | is the object of the record for which the CustomRowInput constructor is called.       |
| field        | is the name of the field as specified in the globalConfig file.                       |

## Methods

| Property | Description                                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| render   | is a method which should have logic for the custom cell component, and it will be executed automatically when the create, edit, or clone actions performed. |

## Usage

Modify files accordingly:

### globalConfig.json

```json
{
    "name": "account",
    "title": "Account",
    "entity": [],
    "table": {
        "actions": ["edit", "delete", "clone"],
        "header": [{
            "label": "Name",
            "field": "name"
        }, {
            "label": "Auth Type",
            "field": "auth_type"
        }, {
            "label": "Test Custom Cell",
            "field": "test_custom_cell",
            "customCell": {
                "src": "CustomInputCell",
                "type": "external"
            }
        }]
    }
}
```

### Component Example

Index.tsx

```typescript
import React from "react";
import { CustomCellBase, GlobalConfig, RowDataFields } from "@splunk/add-on-ucc-framework";
import ReactDOM from "react-dom";

const CustomDateInput = React.lazy(() => import("./AdvancedCell.tsx"));

export default class AdvancedCellClass extends CustomCellBase {
  constructor(
    globalConfig: GlobalConfig,
    serviceName: string,
    el: HTMLElement,
    row: RowDataFields,
    field: string
  ) {
    super(globalConfig, serviceName, el, row, field);
  }

  render() {
    ReactDOM.render(
      <React.Suspense fallback={<div>Loading ...</div>}>
        <CustomDateInput value={this.row.account_multiple_select} />
      </React.Suspense>,
      this.el
    );
  }
}


```

AdvancedCell.tsx

```typescript
import React from "react";
import { AcceptableFormValueOrNull } from ".";
import { SplunkThemeProvider } from "@splunk/themes";

export const AdvancedCell = ({
  value,
}: {
  value: AcceptableFormValueOrNull;
}) => {
  return (
    <SplunkThemeProvider>
      <div>
        {value === null || value === undefined || value === "" ? (
          <span>No value</span>
        ) : (
          <span>{String(value)}</span>
        )}
      </div>
    </SplunkThemeProvider>
  );
};

export default AdvancedCell;

```

ucc-ui.ts

```typescript
import { uccInit } from "@splunk/add-on-ucc-framework";
import AdvancedCellClass from "./ucc-ui-extensions/AdvancedCell";

uccInit({
  AdvancedInputsTab: {
    component: AdvancedCellClass,
    type: "cell",
  },
}).catch((error) => {
  console.error("Could not load UCC", error);
});
```
