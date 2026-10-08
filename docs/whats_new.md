# What's New

## UCC 7

UCC 7 changes the default Python runtime of generated add-ons. Generated
add-ons target Splunk 9.4 and later and no longer select Python 3.7 by default.

### Generated `python.version` defaults to `python3.9`

`ucc-gen build` now writes `python.version = python3.9` instead of
`python.version = python3` to the generated `inputs.conf`, `restmap.conf`,
`commands.conf`, and `alert_actions.conf`. On Splunk 9.4, `python3` selects
Python 3.7 unless `server.conf` forces Python 3.9.

This affects add-ons that still need the Python 3.7 runtime, for example
add-ons that bundle [OS-dependent libraries](./advanced/os-dependent_libraries.md)
only for Python 3.7. To keep the previous setting, add `pythonVersion` to the
`meta` object in `globalConfig.json`:

```json
{
  "meta": {
    "pythonVersion": "python3"
  }
}
```

On Splunk Enterprise 10.2 and later, `python.required` takes precedence over
`python.version`. To declare Python 3.9 and 3.13 there, also set
`"supportedPythonVersion": ["3.9", "3.13"]`. For details, see
[Python runtime settings](./metadata.md#python-runtime-settings).

### Stricter `supportedPythonVersion` validation

Each `meta.supportedPythonVersion` item must now be a version such as `3.13`,
a comma-separated list such as `3.9, 3.13`, or `latest`. Other values, including
values that contain line breaks, fail the build with a schema validation error.

## UCC 6

This section describes the changes introduced in version 6.0.0 of addonfactory-ucc-generator. The main emphasis of this update is on eliminating outdated, deprecated, and discouraged features. These changes help streamline the codebase, improve maintainability, and ensure that only supported and recommended functionality remains available for developers.

## List of Changes

- Dropped support for Python 3.7
- Removed support for the `.uccignore` feature
- Removed `--ui-source-map` option from the UI
- Removed custom menu component from the UI
- Removed AMD `require` for custom components
- Removed `oauth_field` parameter in OAuth entities from the UI
- Removed `placeholder` usage

### Dropped support for Python 3.7

Current version supports Python 3.9 and above.
Related libraries and dependencies have also been updated accordingly.

```
python = ">=3.9,<3.14"
jinja2 = ">=3.1.6,<4"
jsonschema = "^4.25.0"
packaging = ">=25.0"
```

### Removed support for .uccignore

This feature was deprecated starting from v5.53.0 and has now been removed in UCC 6.

Attempting to use it will result in a build error and the process will exit with code 1.

Equivalent functionality can be achieved using [additional_packaging.py](./additional_packaging.md), specifically with the `cleanup_output_files` feature to remove files after the source code is copied.


### Removed support for `--ui-source-map` flag

The `--ui-source-map` build command flag is no longer supported.

### Removed custom UI menu component

Feature was deprecated and removed as it can be replaced by [Multilevel Menu](./inputs/multilevel_menu.md) feature.

Previous configuration:

```json
{
  "inputs": {
    "title": "Inputs",
    "description": "Manage your data inputs",
    "services": [],
    "table": {
      "actions": ["edit", "delete", "clone"],
      "header": [],
      "moreInfo": []
    },
    "menu": {
      "src": "custom_menu",
      "type": "external"
    }
  }
}
```

and example code:

```js
class CustomMenu {

    /**
    * Custom Menu
    * @constructor
    * @param {Object} globalConfig - Global configuration.
    * @param {element} el - The element of the custom menu.
    * @param {function} setValue - set value of the custom field.
    */
    constructor(globalConfig, el, setValue) {
        this.globalConfig = globalConfig;
        this.el = el;
        this.setValue = setValue;
        this.services = {};
    }

    render() {
        this.el.innerHTML = '<button type="button">Click Me! I am a button for custom menu</button>'
        this.el.onclick = () => {
            this.setValue({
                service: "example_input_one" // The value of service can be the name of any services, specified in the globalConfig file.
            })
        }
    }
}
export default CustomMenu;
```

Similar effect can be achieved with groupsMenu feature.

```json
"groupsMenu": [
{
    "groupName": "example_input", 
    "groupTitle": "Click Me! I am a button for custom menu"
}
],
```


### Removed AMD `require` for custom components

We do not recommend to use requireJS approach anymore. Since new version we recommend to use only [Standard](./custom_ui_extensions/standard/overview.md) or [Context](./custom_ui_extensions/context/overview.md) approach.

As a result of this update, custom references must now include both the `src` and `type` properties and be structured as follows:

``` json
{
    "src": "component_file_name",
    "type": "external"
}
```

### Removal of oauth_field parameter from OAuth

The `oauth_field` is no longer needed in oauth entities, as right now everything is based on `field` property itself.
We advise to remove `oauth_field` property from `globalConfig.json` but if it will end up there, we will remove it during building process.

### Removed placeholder

The placeholder attribute has been removed. We recommend using the "help" attribute as an alternative.
