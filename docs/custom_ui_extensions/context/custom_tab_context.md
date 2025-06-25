# Custom Tab

Custom Tab feature can be used to render any customized UI component in the Configuration tabs. With this feature, you can design and render any complex input with ease. This is an advanced feature and can be leveraged with limitless functionalities. Modern add-ons are receiving complex use cases and this feature will allow you to design the UI perfectly for your case without having to depend on newer releases of UCC for support.

### Properties

| Property | Description                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------- |
| tab      | is an object with the properties and values of a custom tab object from the global config file. |
| el       | is used to render a customized component on the Configuration tabs.                             |

### Methods

| Property | Description                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| render   | is a method which should have logic for the custom component, and it will be executed automatically when the configuration page is rendered. |

### Usage

```json
"configuration": {
    "title": "Configuration",
    "descriptions": "Set up your add-on",
    "tabs": [
        {
            "name": "account",
            "title": "Account",
            "entity": [],
            "table": {}
        },
        {
            "name": "logging",
            "title": "Logging",
            "entity": []
        },
        {
            "name": "proxy",
            "title": "Proxy",
            "entity": []
        },
        {
            "name": "custom_tab",
            "title": "Customized Tab",
            "customTab": {
                "src": "custom_tab",
                "type": "external"
            }
        }
    ]
}
```

### Example

index.tsx

```typescript
import React from "react";
import ReactDOM from "react-dom";

import { CustomTabBase } from "@splunk/add-on-ucc-framework";

const CustomAdvancedInputsTab = React.lazy(
  () => import("./AdvancedInputsTab.tsx"),
);

export default class AdvancedInputsTabClass extends CustomTabBase {
  render(): void {
    ReactDOM.render(
      <React.Suspense fallback={<div></div>}>
        <CustomAdvancedInputsTab />
      </React.Suspense>,
      this.el,
    );
  }
}

```

AdvancedInputsTab.tsx

```typescript
import React from "react";
import Table from "@splunk/react-ui/Table";
import { SplunkThemeProvider } from "@splunk/themes";

import Message from "@splunk/react-ui/Message";

export function AdvancedInputsTab() {
  const { data, error } = {
    error: { message: "No data" },
    data: { entry: [] },
  }; // Replace with actual data fetching logic

  const inputs = data?.entry;

  return (
    <SplunkThemeProvider>
      {error && <Message type="error">{error.message}</Message>}
      {data && (
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell align="right">Interval</Table.HeadCell>
            <Table.HeadCell>Account</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {inputs?.map(
              (row: {
                name: string;
                content: {
                  disabled: boolean;
                  interval: string;
                  account: string;
                };
              }) => (
                <Table.Row key={row.name} disabled={row.content.disabled}>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell align="right">{row.content.interval}</Table.Cell>
                  <Table.Cell>{row.content.account}</Table.Cell>
                </Table.Row>
              )
            )}
          </Table.Body>
        </Table>
      )}
    </SplunkThemeProvider>
  );
}

export default AdvancedInputsTab;

```

ucc-ui.ts

```typescript
import { uccInit } from "@splunk/add-on-ucc-framework";
import AdvancedInputsTabClass from "./ucc-ui-extensions/AdvancedInputsTab";

uccInit({
  AdvancedInputsTab: {
    component: AdvancedInputsTabClass,
    type: "tab",
  },
}).catch((error) => {
  console.error("Could not load UCC", error);
});

```
