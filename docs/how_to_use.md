# How To Use

## Prerequisites

-   `globalConfig.json`
-   `package` folder
-   `git` for automatic versioning (when no `ta-version` argument is
    specified)

Example of globalConfig.json and package folder can be found at
<https://github.com/splunk/splunk-add-on-for-ucc-example>.

The JSON schema for the `globalConfig.json` can be found 
[here](https://github.com/splunk/addonfactory-ucc-base-ui/blob/main/src/main/webapp/schema/schema.json).

## Steps

-   Use Python virtual environment:
    -  `python3 -m venv .venv`
    -  `source .venv/bin/activate`        
-   Install `splunk-add-on-ucc-framework`.
-   Run the `ucc-gen` command.
-   The final addon package will be generated, in the `output` folder.

ucc-gen supports the following params:

-   source - [optional] folder containing the `app.manifest` and app
    source.
-   config - [optional] path to the configuration file, defaults to
    `globalConfig.json` in the parent directory of source provided.
-   ta-version - [optional] override current version of TA, default
    version is version specified in `globalConfig.json`. Splunkbase
    compatible version of SEMVER will be used by default.
-   python-binary-name - [optional] Python binary name to use when
    installing Python libraries.

```
pip install splunk-packaging-toolkit
slim package output/<package_ID>
```

After completing the packaging slim should also output path to the
package for distribution.

## What ucc-gen does

-   Cleans the output folder.
-   Retrieve the package ID of addon.
-   Copy UCC template directory under `output/<package_ID>` directory.
-   Copy globalConfig.json file to
    `output/<package_ID>/appserver/static/js/build` directory.
-   Collect and install Addon's requirements into
    `output/<package_ID>/lib` directory of addon's package.
-   For the addon's requirements, packages are installed according to
    following table:
    -   `lib/requirements.txt` - install Python3 compatible packages into
        `output/<package_ID>/lib`
    -   Removes `setuptools*`, `bin*`, `pip*`, `distribute*`, `wheel*` if 
        they exist from `output/<package_ID>/lib`
    -   Removes execute bit from every file under `output/<package_ID>/lib`
-   Replace tokens in views.
-   Copy addon's `package/*` to `output/<package_ID>/*` directory.
-   If an addon requires some additional configurations in packaging
    than implement the steps in `additional_packaging.py`

