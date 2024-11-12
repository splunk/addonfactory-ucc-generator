# Alert Action Scripts

The following files would be created/ updated in the output folder once you executed the `ucc-gen` command:

| File Location | Content Description | Action |
| ------ | ------ | -----|
| output/&lt;YOUR_ADD-ON_NAME&gt;/bin/&lt;NAME_OF_THE_ALERT&gt;.py | The logic that will be executed when the alert action would be executed. | Created |
| output/&lt;YOUR_ADD-ON_NAME&gt;/default/alert_actions.conf | Helps Splunk determine the parameters supported by the alert action when using `sendalert` Splunk command. | A stanza with the name as &lt;NAME_OF_THE_ALERT&gt; is created in this conf file.|
| output/&lt;YOUR_ADD-ON_NAME&gt;/default/data/ui/alerts/&lt;NAME_OF_THE_ALERT&gt;.html | HTML page of the Alert Action that will be rendered in the UI. | Created |

In the python file that is created, below are the methods that you can use or override for varying use cases:

- `process_event()`
    + This is the start point of where you require to write the logic of sending data from Splunk to any other
service via its APIs. Additionally, you can validate the parameters that are provided in the alert action
as client side validation (via JavaScript) isn't allowed in Splunk's alert action's HTML page for
security reasons. <br> Note: This method must be overwritten.
- `get_events()` -> List[dict]
    + Used to get the events that triggered the alert. It returns a list of dictionary. A dictionary points to an event that triggered the alert, and each dictionary has the fields extracted by Splunk.
- `addevent(raw: str, sourcetype: str)`
    + If you are bringing additional information from an outer service, you can write that information using this method. You write a single record using the method. This method will append all the records and will dump it to Splunk when `writeevents()` method is called.
- `writeevents(index: str, host: str, source: str)`
    + All the events added to the queue using `addevent()` method are written to Splunk with the details passed in the arguments.

An example of a script with validations:

```python
import import_declare_test
import sys

from splunktaucclib.alert_actions_base import ModularAlertBase
from splunk_ta_uccexample import modalert_test_alert_helper

class AlertActionWorkertest_alert(ModularAlertBase):

    def __init__(self, ta_name, alert_name):
        super(AlertActionWorkertest_alert, self).__init__(ta_name, alert_name)

    def validate_params(self):


        if not self.get_param("name"):
            self.log_error('name is a mandatory parameter, but its value is None.')
            return False

        if not self.get_param("action"):
            self.log_error('action is a mandatory parameter, but its value is None.')
            return False

        if not self.get_param("account"):
            self.log_error('account is a mandatory parameter, but its value is None.')
            return False
        return True

    def process_event(self, *args, **kwargs):
        status = 0
        try:
            if not self.validate_params():
                return 3
            status = modalert_test_alert_helper.process_event(self, *args, **kwargs)
        except (AttributeError, TypeError) as ae:
            self.log_error("Error: {}. Please double check spelling and also verify that a "
                "compatible version of Splunk_SA_CIM is installed.".format(str(ae)))
            return 4
        except Exception as e:
            msg = "Unexpected error: {}."
            if str(e):
                self.log_error(msg.format(str(e)))
            else:
                import traceback
                self.log_error(msg.format(traceback.format_exc()))
            return 5
        return status

if __name__ == "__main__":
    exitcode = AlertActionWorkertest_alert("Splunk_TA_UCCExample", "test_alert").run(sys.argv)
    sys.exit(exitcode)

```

In this example, `modalert_test_alert_helper`'s `process_event()` method contains the logic of the actions to be
performed when the alert is triggered. It could either be fetch additional information from a service
into Splunk or to send any data from Splunk to a service via its APIs.

### Custom Script for Alert Action

Alternatively, you can provide the `process_event()` and `validate_params()` in the script you mentioned in
the `customScript` parameter in the globalConfig. If the parameter isn't provided in the globalConfig, UCC framework would provide a boiler plate code that you can leverage in writing your logic for alert action.

This script should be present at `<YOUR_ADD-ON_REPOSITORY_PACKAGE>/bin/` in your respository and it should
have `process_event()` function defined. An example declaration could be:

```python

def my_custom_validation(helper):
    # custom validation logic for the params that are passed
    return 0 # for successful custom validations

def process_event(helper, *args, **kwargs):
    if not my_custom_validation(helper):
        return 3
    
    helper.log_info("Alert action test_alert started.")
    # TODO: Implement your alert action logic here

    
    # if clean execution, return 0, 
    # else non-zero number
    return 0

```

This function then can have validations and the alert action logic required for your add-on. The preliminary check for required field validations is already provided by the UCC framework. However, if you have any other validations or pre-checks, you can call that function from `process_event()`.
The `helper` variable would be an object of `splunktaucclib.alert_actions_base.ModularAlertBase` class.
This script would be then be copied to `output/` directory after you execute the `ucc-gen` command.
