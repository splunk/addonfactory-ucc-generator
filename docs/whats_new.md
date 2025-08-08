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

### Removal of oauth_field parameter from OAuth

The `oauth_field` is no longer needed in oauth entities, as right now eveything is based on `field` property itself.
We advice to remove `oauth_field` property from `globalConfig.json` but if it will end up there, we will remove it during building process.
