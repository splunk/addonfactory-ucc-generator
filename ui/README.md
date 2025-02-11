# UCC-UI

This is a UI library that extends UCC with custom UI components. It provides TypeScript-based components and hooks to build custom user interfaces.

## Getting Started

```bash
npm install --save @splunk/add-on-ucc-framework
# or
yarn add @splunk/add-on-ucc-framework
```

## Usage

Import a base class to extend your custom UI components. If you are using TypeScript, you will have static type support in lifecycle methods.

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { CustomControlBase } from "@splunk/add-on-ucc-framework";

export default class MyCustomControl extends CustomControlBase {
  render() {
    ReactDOM.render(
      <input value={this.data.value} />,
      this.el,
    );
  }


}
```

Refer to [splunk-example-ta](https://github.com/splunk/splunk-example-ta) repository for more examples.
