# UI Sub-Project Test Guide

This guide outlines the recommended steps and configuration for testing UI with a UI sub-project as part of a Splunk Technology Add-on (TA), using the Unified Configuration Console (UCC) framework.

---

## Prerequisites

Ensure the following are installed on your system:

- **Node.js** (version ≥ 22)
- **npm** (version ≥ 10)

---

## Step 1: Setup the UI Sub-Project

Setup project as mentioned in [UI Sub-Project Setup Guide](./custom_project_init.md)

## Step 2: Create testing files

Inside your project create testing files with any regular vitest extension (`['**/*.{test,spec}.?(c|m)[jt]s?(x)']`). Testing file can be anywhere inside src directory, as test will use `'src/**/*.{js,jsx,ts,tsx}'` pattern to verify which files are testing ones.

## Step 3: Add testing command

If you are using recommended structure, modify package.json file and any workflow files necessary.
The command that you want to add is `test-ucc-ui`.

The whole modification should be just one line in scripts section:

```json
{
  ...
  "scripts": {
    "ucc-test": "test-ucc-ui"
  },
  ...
}
```

#### package.json

> If you created package json as in `UI Sub-Project Setup Guide` the modifications should look like this.

<details>
  <summary>Modified package.json</summary>

```json
{
  "name": "ui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "ucc-gen": "ucc-gen-ui ta_name=Splunk_TA_Name init_file_dir=src/ucc-ui.ts",
    "ucc-test": "test-ucc-ui"
  },
  "dependencies": {
    "@splunk/add-on-ucc-framework": "^5.65.0",
    "@splunk/react-ui": "^4.42.0",
    "@splunk/splunk-utils": "^3.1.0",
    "@splunk/themes": "^0.23.0",
    "react": "16.14.0",
    "react-dom": "16.14.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.20.0",
    "@types/node": "^22.13.1",
    "@types/react": "16.14.62",
    "@types/react-dom": "16.9.25",
    "typescript": "^5.8.2"
  },
  "overrides": {
    "react": "16.14.0",
    "react-dom": "16.14.0",
    "@types/react": "16.14.62",
    "@types/react-dom": "16.9.25"
  },
  "engines": {
    "node": ">=22",
    "npm": ">=10"
  }
}
```

</details>


## Step 4 Reuse testing functions

To create more advanced UI tests use `renderConfigurationPage`, `renderInputsPage` functions that enables you to easily render each page separately.


### renderConfigurationPage

`renderConfigurationPage(globalConfig, customComponents)` accepts 2 parameters:

1st is **required** parameter referencing **globalConfig.json** file. For testing purposes we recommend to use the same global config that you have configured in your TA, but if there is a substitute can be created and reused in its place.

2nd one is **optional** and it is object of custom components shared in the same way as in [uccInit](./custom_project_init.md#add-to-uccinit) function.


<details>
  <summary>Example usage in test (verifies if account forms opens correctly)</summary>

```ts
import {
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { getGlobalConfig } from "./utils";
import AdvancedInputsTabClass from "../ucc-ui-extensions/AdvancedInputsTab";
import DateInputClass from "../ucc-ui-extensions/DateInput";

it("Should open account addition form", async () => {
  mockResponse();
  renderConfigurationPage(getGlobalConfig(), {
    DateInput: {
      component: DateInputClass,
      type: "control",
    },
    AdvancedInputsTab: {
      component: AdvancedInputsTabClass,
      type: "tab",
    },
  });

  await waitForElementToBeRemoved(() => screen.getByText("Waiting"));

  expect(screen.getByText("Configuration")).toBeInTheDocument();
  const data = await screen.findByText("Mocked Account name");
  expect(data).toBeInTheDocument();
  const newInput = screen.getByRole("button", {
    name: "Add",
  });
  expect(newInput).toBeInTheDocument();

  await userEvent.click(newInput);
  expect(await screen.findByText("Add Accounts")).toBeInTheDocument();
});
```

</details>


### renderInputsPage

`renderInputsPage(globalConfig, customComponents)` accepts the same 2 parameters as previous function where:

1st is **required** parameter referencing **globalConfig.json** file. For testing purposes we recommend to use the same global config that you have configured in your TA, but if there is a substitute can be created and reused in its place.

2nd one is **optional** and it is object of custom components shared in the same way as in [uccInit](./custom_project_init.md#add-to-uccinit) function.


<details>
  <summary>Example usage in test (verifies if account forms opens correctly)</summary>

```ts
import {
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { getGlobalConfig } from "./utils";
import AdvancedInputsTabClass from "../ucc-ui-extensions/AdvancedInputsTab";
import DateInputClass from "../ucc-ui-extensions/DateInput";


it("Should open inputs addition form", async () => {
  mockResponse();
  renderInputsPage(getGlobalConfig(), {
    DateInput: {
      component: DateInputClass,
      type: "control",
    },
    AdvancedInputsTab: {
      component: AdvancedInputsTabClass,
      type: "tab",
    },
  });

  await waitForElementToBeRemoved(() => screen.getByText("Waiting"));

  expect(screen.getByText("Inputs")).toBeInTheDocument();
  const data = await screen.findByText("Mocked Input name");
  expect(data).toBeInTheDocument();
  const newInput = screen.getByRole("button", {
    name: "Create New Input",
  });
  expect(newInput).toBeInTheDocument();

  await userEvent.click(newInput);
  expect(await screen.findByText("Add Example service name")).toBeInTheDocument();
});
```

</details>

## Tips

Code fragments we recommend to use:

### MockData Fetching

For that one we recommend to use [msw](https://mswjs.io/).
<details>
<summary>server initialise file (server.ts)</summary>

```ts
import { setupServer } from "msw/node";
import { afterAll, afterEach } from "vitest";

export const server = setupServer();

server.listen({
  onUnhandledRequest: "warn",
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
```

</details>
Plus additional code to fetch any request/response are needed in tests

<details>
<summary>test usecase</summary>

```ts
function mockResponse() {
  server.use(
    http.get(`/servicesNS/nobody/-/:endpointUrl/:serviceName`, () => {
      return HttpResponse.json(mockServerResponseWithContent);
    }),
    http.get(`/servicesNS/nobody/-/:endpointUrl`, () => {
      return HttpResponse.json(mockServerResponseWithContent);
    })
  );
}

```

</details>

Where returned data follow standard format/structure:
<details>
<summary> Data format</summary>

```ts
export const mockServerResponseWithContent = {
  links: {
    create: `/servicesNS/nobody/Splunk_TA_Example/account/_new`,
  },
  updated: "2023-08-21T11:54:12+00:00",
  entry: [
    {
      id: 1,
      name: "Mocked Input name",
      content: {
        disabled: true,
        fields1: "value1",
        fields2: "value2",
      },
    },
  ],
  messages: [],
};
```

</details>
