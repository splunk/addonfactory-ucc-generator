The Adaptive Response framework provides a mechanism for running preconfigured actions
within the Splunk platform or by integrating with external applications.
These actions can be automatically triggered by correlation search results or manually
run on an ad hoc basis from the Incident Review dashboard inside the Enterpise Security app. You can read more about this framework [here](https://docs.splunk.com/Documentation/ES/latest/Admin/Setupadaptiveresponse).

In case your add-on is integrated with Enterprise Security, you can define the configurations in
the alert action details in your add-on's `globalConfig` and it will create the necessary triggers for it.

### Adaptive Response Properties

| Property                                                                  | Type   | Description                                                                                            |
|---------------------------------------------------------------------------|--------|--------------------------------------------------------------------------------------------------------|
| task<span class="required-asterisk">\*</span>    | string | The function or functions performed by the modular action.|
| subject<span class="required-asterisk">\*</span>    | string | The object or objects that the modular action's task(s) can be performed on (i.e. "endpoint.file"). |
| category<span class="required-asterisk">\*</span>    | array | The category or categories the modular action belongs to. |
| technology<span class="required-asterisk">\*</span>    | string | The technology or technologies that the modular action supports. |
| supportsAdhoc    | boolean | Specifies if the modular action supports adhoc invocations. Default: false |
| supportsCloud    | boolean | Specifies if the modular actions supports the "cloud" model. Default: true |
| drilldownUri    | string | Specifies a custom target for viewing the events outputted as a result of the action. Custom target can specify app and/or view depending on syntax. |
| sourcetype    | string | The sourcetype in which the result of the AR alert action would be written to. The value is updated in the alert action script. If you don't specify any value you can update your alert action script manually once it is generated. |

An example of adaptive response in globalConfig:

```json
"alerts": [
    {
        "name": "test_alert",
        "label": "Test Alert",
        "description": "Description for test Alert Action",
        "iconFileName": "test icon.png",
        "adaptiveResponse": {
            "task": [
                "Create",
                "Update"
            ],
            "supportsAdhoc": true,
            "supportsCloud": true,
            "subject": [
                "endpoint"
            ],
            "category": [
                "Information Conveyance",
                "Information Portrayal"
            ],
            "technology": [
                {
                    "version": [
                        "1.0.0"
                    ],
                    "product": "Test Incident Update",
                    "vendor": "Splunk"
                }
            ],
            "drilldownUri": "search?q=search%20index%3D\"_internal\"&earliest=0&latest=",
            "sourcetype": "test:incident"
        },
        "entity": [ "..." ]
    }
]
```

The above would create an attribute in `output/<YOUR_ADDON_NAME>/default/alert_action.conf` as following:

```conf
[test_alert]
label = Test Alert
description = Description for test Alert Action
icon_path = test icon.png
is_custom = 1
param._cam = {"task": ["Create", "Update"], "subject": ["endpoint"], "category": ["Information Conveyance", "Information Portrayal"], "technology": [{"version": ["1.0.0"], "product": "Test Incident Update", "vendor": "Splunk"}], "supports_adhoc": true, "supports_cloud": true, "drilldown_uri": "search?q=search%20index%3D\"_internal\"&earliest=0&latest="}
# ... rest of the properties mentioned in the alert action configuration
```

You can refer this [dev documentation](https://dev.splunk.com/enterprise/docs/devtools/enterprisesecurity/adaptiveresponseframework) for details on updating alert action scripts such that they can be used in the Adaptive Response framework.
