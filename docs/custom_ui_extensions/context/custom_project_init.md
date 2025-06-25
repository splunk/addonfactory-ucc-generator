# UI Sub-Project Setup Guide

This guide outlines the recommended steps and configuration for initializing a UI sub-project as part of a Splunk Technology Add-on (TA), using the Unified Configuration Console (UCC) framework.

---

## Prerequisites

Ensure the following are installed on your system:

- **Node.js** (version ≥ 22)
- **npm** (version ≥ 10)

---

## Step 1: Initialize the UI Sub-Project

Run the following commands to create a new Node.js project and configure TypeScript:

```bash
npm init -y
npm install --save-dev typescript
npx tsc --init
```

## Step 2: Configure Project Files

After initializing the project, you need to configure essential project files such as tsconfig.json and package.json. These configurations ensure compatibility with TypeScript, React, and the UCC framework used for Splunk TA development.

Below are the recommended contents for these files.

#### tsconfig.json

<details>
  <summary>tsconfig.json </summary>

```json
{
  "compilerOptions": {
    "target": "es2016", /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    "jsx": "react", /* Specify what JSX code is generated. */
    
    /* Modules */
    "module": "commonjs", /* Specify what module code is generated. */
    "allowImportingTsExtensions": true, /* Allow imports to include TypeScript file extensions. Requires '--moduleResolution bundler' and either '--noEmit' or '--emitDeclarationOnly' to be set. */

    /* Emit */
    "noEmit": true, /* Disable emitting files from a compilation. */
    
    /* Interop Constraints */
    "esModuleInterop": true, /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    "forceConsistentCasingInFileNames": true, /* Ensure that casing is correct in imports. */
    
    /* Type Checking */
    "strict": true, /* Enable all strict type-checking options. */
    "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    "noUnusedLocals": true,                           /* Enable error reporting when local variables aren't read. */
    "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read. */
    
    /* Completeness */
    "skipLibCheck": true /* Skip type checking all .d.ts files. */
  }
}
```

</details>


#### package.json

> Note: In the "scripts" section of package.json, update the placeholder **Splunk_TA_Name** to match the exact name of your Splunk Technology Add-on (TA) project.

<details>
  <summary>package.json </summary>
```json
{
  "name": "ui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "ucc-gen": "ucc-gen-ui ta_name=Splunk_TA_Name init_file_dir=src/ucc-ui.ts"
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


#### Additionally

We also recommend to do the following code adaptations.

1. To avoid committing large files or unnecessary dependencies, add the following line to your `.gitignore` file: ```ui/node_modules/```

1. Add following script to `additional_packaging.py`. Thanks to that during building process you do not need to enter UI filder manually inside job.

<details>
  <summary>additional_packaging.py </summary>
    ```python
    import os
    from os import path


    def additional_packaging(addon_name: str) -> None:
        build_ui_script = os.path.join(
            os.path.dirname(os.path.realpath(**file**)), "scripts", "build_ui.sh"
        )
        if path.exists(build_ui_script):
            os.system(f"chmod +x {build_ui_script}")
            return_code = os.system(build_ui_script)
            if return_code != 0:
                os._exit(os.WEXITSTATUS(return_code))

    ```
</details>

Along with creating `build_ui.sh` script containing the following code:

<details>
  <summary>build_ui.sh </summary>

    ```bash

    # !/bin/bash

    # Determine the directory of the script

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    # Check if npm is installed

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

    npm --prefix "$SCRIPT_DIR/../ui" run ucc-gen

    ```
</details>


## Step 3: Create entry file

We recommend creating a src subdirectory to organize your project files.

Inside src, include an entry file named `ucc-ui.ts`, along with a directory called `ucc-ui-extensions` to house all your custom elements.

You can create this structure using the following commands:

```bash
mkdir src
touch ./src/ucc-ui.ts
mkdir ./src/ucc-ui-extensions
```

At the beginning fill ucc-ui.ts with following code:


```typescript
import { uccInit } from "@splunk/add-on-ucc-framework";

uccInit().catch((error) => {
  console.error("Could not load UCC", error);
});

```


## Step 4: Creating example component

As mentioned for components we recommend to create them inside `ucc-ui-extensions` folder.

As an example we can create AdvancedInputsTabClass as a custom tab component.

### Create files

You can create files with following code.

```bash
mkdir ./src/ucc-ui-extensions/AdvancedInputsTab
touch ./src/ucc-ui-extensions/AdvancedInputsTab/index.tsx
touch ./src/ucc-ui-extensions/AdvancedInputsTab/AdvancedInputsTab.tsx
```

### Implement Components

As for the example you can fill those files with following code:

<details>
  <summary>index.tsx </summary>


```typescript
import React from "react";
import ReactDOM from "react-dom";

import { CustomTabBase } from "@splunk/add-on-ucc-framework";

const CustomAdvancedInputsTab = React.lazy(
  () => import("./AdvancedInputsTab.tsx")
);

export default class AdvancedInputsTabClass extends CustomTabBase {
  render(): void {
    ReactDOM.render(
      <React.Suspense fallback={<div></div>}>
        <CustomAdvancedInputsTab />
      </React.Suspense>,
      this.el
    );
  }
}

```

</details>

<details>
  <summary>AdvancedInputsTab.tsx </summary>

```typescript
import React from "react";
import ReactDOM from "react-dom";

import { CustomTabBase } from "@splunk/add-on-ucc-framework";

const CustomAdvancedInputsTab = React.lazy(
  () => import("./AdvancedInputsTab.tsx")
);

export default class AdvancedInputsTabClass extends CustomTabBase {
  render(): void {
    ReactDOM.render(
      <React.Suspense fallback={<div></div>}>
        <CustomAdvancedInputsTab />
      </React.Suspense>,
      this.el
    );
  }
}

```

</details>

### Add to uccInit

After creating custom component last thing to do is to include it in uccInit function.

To include it modify ucc-ui.ts file accordingly

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

## Step 5: Finish

After completing the previous steps, your custom UI should build correctly into directory located from following method execution (if output param is not defined)

```resolve(uiDir, '../output', TA_NAME, 'appserver/static/js/build');```
