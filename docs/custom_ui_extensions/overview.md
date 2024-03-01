The UCC package simplifies the deployment of React applications featuring the Splunk UI by eliminating the need for NodeJS, Yarn, or front-end dependencies installation. The core requirement for deployment is a `globalConfig.json` file. While UCC is designed to support a broad spectrum of use cases, there may be scenarios where the provided API options do not fully meet your needs.

For such instances, UCC has a runtime custom JavaScript loading mechanism. This feature allows for the invocation of specific functionalities at pivotal moments within the application lifecycle, including `onChange` and `onRender` events.

### Integrating Custom JavaScript

Example `globalConfig.json` configuration for custom JS files located at:
```
appserver/static/js/build/custom/CustomHookJSFile.js
appserver/static/js/build/custom/CustomInputJSFile.js
```

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
          "src": "CustomHookJSFile",
          "type": "external"
        },
        "entity": [{
          "field": "custom_input_field",
          "label": "My Custom Input",
          "type": "custom",
          "options": {
            "src": "CustomInputJSFile",
            "type": "external"
          }
        }]
      }
    ]
  }
}
```

Note: Specify the `type` key as `external` to indicate that these scripts should use the ESM syntax for module exporting and importing. Scripts not marked as external or without the type specified will default to the RequireJS (AMD) syntax. Additionally, custom JavaScript files and their modules will not be processed by Webpack.


### React Component Extension

While UCC does not directly support React components due to its design choices, it's possible to integrate React through JavaScript:

#### CustomComponent.js
```js
export default class CustomComponent {
  constructor (globalConfig, el) {
  }

  render () {
    ReactDOM.render(
      <CustomReactInputComponent />,
      this.el
    )
    return this
  }
}
```

You might also need to adjust webpack/rollup config to output files without chunking:

```js
module.exports = {
    //...
    output: {
        path: path.join(__dirname, '../output/Splunk_TA_Name/appserver/static/js/build/custom/'),
        filename: '[name].js',
    },
}
```