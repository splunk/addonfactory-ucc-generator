# What's New

## UCC 6

This section describes the changes introduced in version 6.0.0 of addonfactory-ucc-generator. The main emphasis of this update is on eliminating outdated, deprecated, and discouraged features. These changes help streamline the codebase, improve maintainability, and ensure that only supported and recommended functionality remains available for developers.

## List of Changes

- Dropped support for Python 3.7
- Removed support for the `.uccignore` feature
- Removed `--ui-source-map` option from the UI
- Removed custom menu component from the UI
- Removed AMD `require` for custom components
- Removed `oauth_field` parameter in OAuth entities from the UI
- Removed placeholder parameter from documentation

### Removed AMD `require` for custom components

We do not recommend to use requireJS approach anymore. Since new version we recommend to use only [Standard](./custom_ui_extensions/standard/overview.md) or [Context](./custom_ui_extensions/context/overview.md) approach.

As a result of this update, custom references must now include both the `src` and `type` properties and be structured as follows:

``` json
{
    "src": "component_file_name",
    "type": "external"
}
```
