# Testing UI Components in UCC Framework

This guide shows you how to test custom UI components in your Splunk Technology Add-on (TA) using the Unified Configuration Console (UCC) framework.

---

## What You'll Need

Before starting, make sure you have:

- **Node.js** version 22 or higher
- **npm** version 10 or higher

---

## Getting Started

### 1. Set Up Your UI Project

First, create your UI sub-project by following the [UI Sub-Project Setup Guide](./custom_project_init.md).

### 2. Create Your Test Files

Create test files anywhere in your `src` directory. Use any of these file extensions:

- `.test.js`, `.test.ts`, `.test.jsx`, `.test.tsx`
- `.spec.js`, `.spec.ts`, `.spec.jsx`, `.spec.tsx`

The testing framework will automatically find files matching the pattern `src/**/*.{js,jsx,ts,tsx}`.

### 3. Add the Test Command

Update your `package.json` file to include the test command:

```json
{
  "scripts": {
    "ucc-test": "test-ucc-ui"
  }
}
```

#### Complete package.json Example

If you followed the UI Sub-Project Setup Guide, your `package.json` should look like this:

<details>
  <summary>View complete package.json</summary>

```json
{
  "name": "ui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "build": "ucc-gen-ui ta_name=Splunk_TA_Name init_file_dir=src/ucc-ui.ts",
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

---

## Testing Your UI Components

The UCC framework provides two main functions to help you test your pages:

### Testing Configuration Pages

Use `renderConfigurationPage()` to test your configuration pages (like account settings).

**Parameters:**

- `globalConfig` (required): Your globalConfig.json file content
- `customComponents` (optional): Object containing your custom UI components

**Example:**

```typescript
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { it, expect } from "vitest";
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

  // Wait for page to load
  await waitForElementToBeRemoved(() => screen.getByText("Waiting"));

  // Check if page elements are present
  expect(screen.getByText("Configuration")).toBeInTheDocument();
  expect(await screen.findByText("Mocked Account name")).toBeInTheDocument();
  
  // Test clicking the Add button
  const addButton = screen.getByRole("button", { name: "Add" });
  expect(addButton).toBeInTheDocument();
  
  await userEvent.click(addButton);
  expect(await screen.findByText("Add Accounts")).toBeInTheDocument();
});
```

### Testing Input Pages

Use `renderInputsPage()` to test your input pages (like data input configurations).

**Parameters:** Same as `renderConfigurationPage()`

- `globalConfig` (required): Your globalConfig.json file content
- `customComponents` (optional): Object containing your custom UI components

**Example:**

```typescript
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { it, expect } from "vitest";
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

  // Wait for page to load
  await waitForElementToBeRemoved(() => screen.getByText("Waiting"));

  // Check if page elements are present
  expect(screen.getByText("Inputs")).toBeInTheDocument();
  expect(await screen.findByText("Mocked Input name")).toBeInTheDocument();
  
  // Test clicking the Create button
  const createButton = screen.getByRole("button", { name: "Create New Input" });
  expect(createButton).toBeInTheDocument();
  
  await userEvent.click(createButton);
  expect(await screen.findByText("Add Example service name")).toBeInTheDocument();
});
```

---

## Testing Best Practices

### Mock API Responses

We recommend using [MSW (Mock Service Worker)](https://mswjs.io/) to mock API calls in your tests.

**1. Set up the server (server.ts):**

```typescript
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

**2. Mock responses in your tests:**

```typescript
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

**3. Use standard response format:**

```typescript
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

---

## Running Your Tests

Once everything is set up, run your tests with:

```bash
npm run ucc-test
```

This will execute all test files in your `src` directory and show you the results.
