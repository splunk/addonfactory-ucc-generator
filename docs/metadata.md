---
title: globalConfig Meta Data
---

# Metadata

Metadata contains general information about add-on build.

## Metadata Properties

| Property                                                      | Type    | Description                                                                                                                                     |
|---------------------------------------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| displayName<span class="required-asterisk">\*</span>          | string  | Name displayed for end user.                                                                                                                    |
| name<span class="required-asterisk">\*</span>                 | string  | Name used for API endpoints and all code references separating endpoints from any other app. Please refer to [app.conf/[package]/id](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Appconf#.5Bpackage.5D) for more details. |
| restRoot<span class="required-asterisk">\*</span>             | string  | String used to create API endpoints, allows alphanumeric and `-` characters.                                                                    |
| apiVersion                                                    | string  | [Deprecated] Version of used API.                                                                                                               |
| version<span class="required-asterisk">\*</span>              | string  | Version of the add-on.                                                                                                                          |
| schemaVersion                                                 | string  | Version of JSON schema used in build process.                                                                                                   |
| \_uccVersion                                                  | string  | Version of UCC used during build process. Set by UCC itself.                                                                                    |
| hideUCCVersion                                                | boolean | Hide the label 'Made with UCC' on the Configuration page.                                                                                       |
| checkForUpdates                                               | boolean | Ability to configure `app.conf->package.check_for_updates` from globalConfig file. Default `true`.                                              |
| defaultView                                                   | string  | Define which view should be loaded on TA load. One of `"inputs"`, `"configuration"`, `"dashboard"` or `"search"`. Default `configuration`.      |
| [os-dependentLibraries](./advanced/os-dependent_libraries.md) | array   | This feature allows you to download and unpack libraries with appropriate binaries for the indicated operating system during the build process. |
| supported_themes                                              | array   | This feature is allows you provide the themes supported by your add-on. Supported values: `light`, `dark`. No default.                          |
| supportedPythonVersion                                              | array   | This feature allows you to specify which python version your app would use (for Splunk v10.1 and above). No default.                          |
| isVisible | boolean | This option allows you to create apps which are not visible by default by setting isVisible=false. Default: true if globalConfig file exists in the repository, else false. |
| showFooter | boolean | This option allows you to display the footer component on every page of add-on. Default: true if globalConfig file exists in the repository, else false. |
