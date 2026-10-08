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
| hideUCCVersion                                                | boolean | Hide the label 'Made with UCC' on the Configuration page.                                                                                       |
| checkForUpdates                                               | boolean | Ability to configure `app.conf->package.check_for_updates` from globalConfig file. Default `true`.                                              |
| defaultView                                                   | string  | Define which view should be loaded on TA load. One of `"inputs"`, `"configuration"`, `"dashboard"` or `"search"`. Default `configuration`.      |
| navColor                                                      | string  | Optional hex color for the app icon background in generated `default/data/ui/nav/default.xml`, for example `#65A637`.                           |
| [os-dependentLibraries](./advanced/os-dependent_libraries.md) | array   | This feature allows you to download and unpack libraries with appropriate binaries for the indicated operating system during the build process. |
| supported_themes                                              | array   | This feature is allows you provide the themes supported by your add-on. Supported values: `light`, `dark`. No default.                          |
| pythonVersion | string | Value written to `python.version` in generated `inputs.conf`, `restmap.conf`, `commands.conf`, and `alert_actions.conf`. Supported values: `python3.9` (default) and `python3`. See [Python runtime settings](#python-runtime-settings). |
| supportedPythonVersion | array | Versions written to `python.required` in the same generated files, for example `["3.9", "3.13"]`. Each item is a version such as `3.13`, a comma-separated list such as `3.9, 3.13`, or `latest`. No default. See [Python runtime settings](#python-runtime-settings). |
| isVisible | boolean | This option allows you to create apps which are not visible by default by setting isVisible=false. Default: true if globalConfig file exists in the repository, else false. |
| showFooter | boolean | This option allows you to display the footer component on every page of add-on. Default: true if globalConfig file exists in the repository, else false. |

## Python runtime settings

Splunk selects the Python interpreter for an input, REST handler, custom search
command, or alert action from two settings in its `.conf` stanza:

- `python.version` is used by Splunk 9.4 and 10.0. Splunk Enterprise 10.2
  deprecates it.
- `python.required` is used by Splunk Enterprise 10.2 and later, where it takes
  precedence over `python.version`. Earlier versions ignore it.

`meta.pythonVersion` sets `python.version` and `meta.supportedPythonVersion`
sets `python.required`. To run on Python 3.9 on Splunk 9.4 and 10.0, and to
declare Python 3.9 and 3.13 on Splunk Enterprise 10.2 and later, add both
properties to the existing `meta` object in `globalConfig.json`:

```json
{
  "meta": {
    "pythonVersion": "python3.9",
    "supportedPythonVersion": ["3.9", "3.13"]
  }
}
```

Each generated stanza then contains:

```ini
python.version = python3.9
python.required = 3.9, 3.13
```

When `pythonVersion` is omitted, UCC writes `python.version = python3.9`. When
`supportedPythonVersion` is absent or empty, UCC omits `python.required`.

Set `"pythonVersion": "python3"` only if the add-on must keep the setting that
UCC generated before version 7. On Splunk 9.4, `python3` selects Python 3.7,
unless the `python.version` setting in `server.conf` is `force_python3` (the
default), which runs Python 3.9 regardless of the stanza value.

Other UCC settings with similar names control different things:

| Setting | Controls | Example |
|---------|----------|---------|
| `meta.pythonVersion` | `python.version` in generated `.conf` files | `"python3.9"` |
| `meta.supportedPythonVersion` | `python.required` in generated `.conf` files | `["3.9", "3.13"]` |
| [`os-dependentLibraries[].python_version`](./advanced/os-dependent_libraries.md) | Python version of the wheels that `pip` downloads for an OS-dependent library | `"39"` |
| [`--python-binary-name`](./commands.md) | Python interpreter that `ucc-gen build` uses to install libraries from `requirements.txt` | `python3` |
