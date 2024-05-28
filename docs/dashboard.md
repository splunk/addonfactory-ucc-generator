# Dashboard

## Overview

UCC introduces a monitoring dashboard page, which is available from v5.42.0.

Page is fully based on the UDF framework (Unified Dashboard Framework) and Splunk UI components. More information can be found [here](https://splunkui.splunk.com/Packages/dashboard-docs/?path=%2FIntroduction).

The dashboard page configuration is generated if the `ucc-gen init` command is used.
The dashboard page is optional, you can delete it from configuration if you
don't need it in your add-on.

The dashboard page provides some additional information about the add-on
operations to increase the visibility into what the add-on is actually doing
under the hood.

As of now, 3 pre-built panels are supported:

* Overview
* Data ingestion
* Errors in the add-on.

**IMPORTANT**: To fully use the panels available on the monitoring dashboard, use the `solnlib.log`'s [`events_ingested` function](https://github.com/splunk/addonfactory-solutions-library-python/blob/v4.14.0/solnlib/log.py#L253), available from **version 4.14**, to record events.

The above function takes 5 positional parameters which are:

* logger
* modular_input_name
* sourcetype
* n_events
* index

and 2 optional named parameters:

* account
* host

If you additionally provide `account` and `host` arguments - you will get a better visibility in your dashboard.
Additionally, as `modular_input_name` you should pass the full input in the format **demo_input://my_input_1**.

Example of a logging function:

```python
from solnlib import log


log.events_ingested(
    logger,
    "demo_input://my_input1",
    "my_sourcetype",
    2,
    "my_index",
    account="my_account"
)
```

as a reference, you can check the input in the demo add-on described [here](quickstart.md/#initialize-new-add-on).

To be able to add a monitoring dashboard page to an existing add-on, you need to adjust your
globalConfig file and include a new "dashboard" page there. See the following example:

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
                    "name": "default"
                }
            ]
        }
    },
    "meta": {
      ...
    }
}
```

## Migration path

XML-based dashboard will be migrated during the build process. All the necessary changes will be made automatically.

## Custom components

UCC also supports adding your own components to the dashboard.
To do this, create a **custom_dashboard.json** file in the add-on's root directory (at the same level as globalConfig.json).

This definition json file must be created according to the UDF framework standards described [here](https://splunkui.splunk.com/Packages/dashboard-docs/?path=%2FIntroduction)

**dashboard_components.xml** location:

```
<TA>
 ├── package
 ...
 ├── custom_dashboard.json
 ├── globalConfig.json
 ...
```

Sample **dashboard_components.xml** structure:

```json
{
  "visualizations": {
    "custom_dashboard_main_label": {
      "type": "splunk.markdown",
      "options": {
        "markdown": "# My custom dashboard",
        "fontSize": "extraLarge"
      }
    },
    "custom_addon_version_label": {
      "type": "splunk.markdown",
      "options": {
        "markdown": "# Add-on version:",
        "fontSize": "large"
      }
    },
    "custom_addon_version": {
      "type": "splunk.singlevalue",
      "options": {
        "majorFontSize": 34,
        "backgroundColor": "transparent"
      },
      "dataSources": {
        "primary": "custom_addon_version_ds"
      }
    },
    "custom_events_ingested_label": {
      "type": "splunk.markdown",
      "options": {
        "markdown": "# Events ingested by sourcetype:",
        "fontSize": "default"
      }
    },
    "custom_events_ingested": {
      "type": "splunk.line",
      "options": {
        "xAxisVisibility": "hide",
        "seriesColors": [
          "#A870EF"
        ],
        "yAxisTitleText": "Events ingested"
      },
      "title": "Events ingested by sourcetype",
      "dataSources": {
        "primary": "custom_events_ingested_ds"
      }
    }
  },
  "dataSources": {
    "custom_addon_version_ds": {
      "type": "ds.search",
      "options": {
        "query": "| rest services/apps/local/demo_addon_for_splunk splunk_server=local | fields version"
      }
    },
    "custom_events_ingested_ds": {
      "type": "ds.search",
      "options": {
        "query": "index=_internal source=*demo_addon* action=events_ingested\n| timechart sum(n_events) by sourcetype_ingested",
        "queryParameters": {
          "earliest": "$events_ingested_time.earliest$",
          "latest": "$events_ingested_time.latest$"
        }
      }
    }
  },
  "inputs": {
    "custom_events_ingested_input": {
      "options": {
        "defaultValue": "-7d,now",
        "token": "events_ingested_time"
      },
      "title": "Time",
      "type": "input.timerange"
    }
  },
  "layout": {
    "type": "grid",
    "globalInputs": [
      "custom_events_ingested_input"
    ],
    "structure": [
      {
        "item": "custom_dashboard_main_label",
        "position": {
          "x": 20,
          "y": 500,
          "w": 300,
          "h": 50
        }
      },
      {
        "item": "custom_addon_version_label",
        "position": {
          "x": 20,
          "y": 530,
          "w": 100,
          "h": 50
        }
      },
      {
        "item": "custom_addon_version",
        "position": {
          "x": 80,
          "y": 515,
          "w": 100,
          "h": 50
        }
      },
      {
        "item": "custom_events_ingested_label",
        "position": {
          "x": 20,
          "y": 550,
          "w": 100,
          "h": 50
        }
      },
      {
        "item": "custom_events_ingested",
        "position": {
          "x": 20,
          "y": 580,
          "w": 600,
          "h": 150
        }
      }
    ]
  }
}
```

Next, you have to add the **custom** panel to your dashboard page in globalConfig.json.

```json
{
...
        "dashboard": {
            "panels": [
                {
                    "name": "default"
                },
                {
                    "name": "custom"
                }
            ]
        }
...
}
```

By default, the custom dashboard will be added as an additional tab under the overview section.

![img.png](images/custom_dashboard.png)

It is possible to enable only a custom panel. To do this, remove the "default" element from globalConfig.json.

```json
{
...
        "dashboard": {
            "panels": [
                {
                    "name": "custom"
                }
            ]
        }
...
}
```
