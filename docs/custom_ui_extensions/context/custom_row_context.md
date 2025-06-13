# Custom Row

When a row is expanded on the Inputs table or Configuration Table, Custom Row is utilized to incorporate a customized element. By clicking on the icon provided on the left side of each row, the input-specific details are displayed.

### Properties

| Property     | Description                                                                           |
| ------------ | ------------------------------------------------------------------------------------- |
| globalConfig | is a hierarchical object that contains the globalConfig file's properties and values. |
| el           | is used to render a customized element on the Inputs table when a row is expanded.    |
| serviceName  | is the name of the service/tab specified in the globalConfig file.                    |
| row          | is the object of the record for which the CustomRowInput constructor is called.       |

### Methods

| Property  | Description                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| render    | is a method which contains the logic to display the custom row component. This method is automatically executed when the row is expanded |
| getDLRows | is a method which contains the logic to update the custom row values, return a key-value pair.                                           |

> Note

> - Atleast one method should be present
> - If both method is present then the getDLRows method have the high priority.

### Usage

globalConfig.json

```json
"inputs": {
    "title": "Inputs",
    "description": "Manage your data inputs",
    "services": [],
    "table": {
        "actions": ["edit", "delete", "clone"],
        "header": [],
        "customRow": {
            "src": "custom_input_row",
            "type": "external"
        }
    }
}
```


### Example

index.tsx

```typescript
import { CustomRowBase, RowDataFields } from "@splunk/add-on-ucc-framework";
import React from "react";
import ReactDOM from "react-dom";

const AdvancedRow = React.lazy(() => import("./AdvancedRow"));

export default class AdvancedRowClass extends CustomRowBase {
  getDLRows(): RowDataFields {
    return {
      ...this.row,
      ...Object.fromEntries(
        Object.entries(this.row).map(([key, value]) => [
          key,
          key === "interval" ? `${value} sec` : value,
        ])
      ),
    };
  }

  render(): void {
    ReactDOM.render(
      <React.Suspense fallback={<div></div>}>
        <AdvancedRow row={this.row} />
      </React.Suspense>,
      this.el
    );
  }
}

```

AdvancedRow.tsx

```typescript
import React from "react";
import { SplunkThemeProvider } from "@splunk/themes";
import { RowDataFields } from "@splunk/add-on-ucc-framework";
import Table from "@splunk/react-ui/Table";

export const AdvancedRow = ({ row }: { row: RowDataFields }) => {
  return (
    <SplunkThemeProvider>
      <Table.Row>
        {Object.entries(row).map(([key, value]) => {
          // Skip the __toggleShowSpinner field
          if (key === "__toggleShowSpinner") {
            return null;
          }
          // Render each field in a Table.Cell
          return (
            <Table.Cell key={key} data-testid={`cell-${key}`}>
              {typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : String(value)}
            </Table.Cell>
          );
        })}
      </Table.Row>
    </SplunkThemeProvider>
  );
};

export default AdvancedRow;

```

ucc-ui.tsx

```typescript
import { uccInit } from "@splunk/add-on-ucc-framework";
import AdvancedRow from "./ucc-ui-extensions/AdvancedRow";

uccInit({
  AdvancedRow: {
    component: AdvancedRow,
    type: "row",
  },
}).catch((error) => {
  console.error("Could not load UCC", error);
});

```
