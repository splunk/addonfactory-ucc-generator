# Dashboard

UCC introduces a support for a dashboard page (available from v5.27.0).
The dashboard page configuration is generated if `ucc-gen init` command is used.
The dashboard page is optional, you can delete it from configuration if you
don't need it in your add-on.

The dashboard page provides some additional information about the add-on
operations to increase the visibility into what is add-on is actually doing
under the hood.

As of now, 3 pre-built panels are supported:

* Add-on version
* Events ingested by sourcetype
* Errors in the add-on

> Note: if you change the dashboard page (Edit button) after the add-on is
> installed, the changes go to `local` folder, and you will see your version
> of the dashboard even if you update an add-on.

To be able to add a dashboard page to an existing add-on, you need to adjust your 
globalConfig file and include a new page "dashboard" there. Here is an example:

```json
{
    "pages": {
        "configuration": {
            "tabs": [
                ...
            ],
            "title": "Configuration",
            "description": "Set up your add-on"
        },
        "inputs": {
            "services": [
                ...
            ],
            "title": "Inputs",
            "description": "Manage your data inputs",
            "table": {
                ...
            }
        },
        "dashboard": {
            "panels": [
                {
                    "name": "addon_version"
                },
                {
                    "name": "events_ingested_by_sourcetype"
                },
                {
                    "name": "errors_in_the_addon"
                }
            ]
        }
    },
    "meta": {
      ...
    }
}
```

### Add-on version

Executes the following search:

```
| rest services/apps/local/<addon_name> splunk_server=local | fields version
```

> Note: <addon_name> is being replaced by the actual value during the build time.

### Events ingested by sourcetype

Executes the following search:

```
index=_internal source=*<addon_name>* action=events_ingested
| timechart avg(n_events) by sourcetype_ingested
```

> Note: <addon_name> is being replaced by the actual value during the build time.

This search assumes specific data format in the internal logs to fill the panel with
data.

It's recommended to utilize `solnlib.log`'s [`events_ingested` function](https://github.com/splunk/addonfactory-solutions-library-python/blob/3045f9d15398fac0bd6740645ba119250ead129b/solnlib/log.py#L253).

### Errors in the add-on

Executes the following search:

```
index=_internal source=*<addon_name>* ERROR
```

> Note: <addon_name> is being replaced by the actual value during the build time.
