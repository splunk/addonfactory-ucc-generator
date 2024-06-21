---
title: Metadata
---

Metadata contains general information about TA build.

## Metadata Properties

| Property                                                      | Type    | Description                                                                                                                                     |
| ------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| displayName<span class="required-asterisk">\*</span>          | string  | Name displayed for end user.                                                                                                                    |
| name<span class="required-asterisk">\*</span>                 | string  | Name used for API endpoints and all code references separating separating endpoints from any other app.                                         |
| restRoot<span class="required-asterisk">\*</span>             | string  | String used to create API endpoints. <br> Follow patter ```/^\w+$/```                                                                           |
| apiVersion                                                    | string  | Version of used API                                                                                                                             |
| version<span class="required-asterisk">\*</span>              | string  | Build version.                                                                                                                                  |
| schemaVersion                                                 | string  | Version of json schema used in build process.                                                                                                   |
| \_uccVersion                                                  | string  | Version of UCC used during build process                                                                                                        |
| hideUCCVersion                                                | boolean | Hide the label 'Made with UCC' on the Configuration page.                                                                                       |
| checkForUpdates                                               | boolean | Ability to configure app.conf->package.check_for_updates from globalConfig file. Default true                                                   |
| defaultView                                                   | string  | Define which view should be loaded on TA load. One of ``` "inputs" "configuration" "dashboard" "search" ```                                     |
| [os-dependentLibraries](./advanced/os-dependent_libraries.md) | array   | This feature allows you to download and unpack libraries with appropriate binaries for the indicated operating system during the build process. |

