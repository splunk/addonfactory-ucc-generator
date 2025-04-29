import import_declare_test

import sys
import json

from splunklib import modularinput as smi

import os
import traceback
import requests
from datetime import datetime
from splunklib import modularinput as smi
from solnlib import conf_manager
from solnlib import log
from solnlib.modular_input import checkpointer
from splunktaucclib.modinput_wrapper import base_modinput as base_mi

bin_dir = os.path.basename(__file__)
app_name = os.path.basename(os.path.dirname(os.getcwd()))


class ModInputDEMO_INPUT(base_mi.BaseModInput):

    def __init__(self):
        use_single_instance = False
        super(ModInputDEMO_INPUT, self).__init__(
            app_name, "demo_input", use_single_instance
        )
        self.global_checkbox_fields = None

    def get_scheme(self):
        scheme = smi.Scheme("demo_input")
        scheme.description = "demo_input"
        scheme.use_external_validation = True
        scheme.streaming_mode_xml = True
        scheme.use_single_instance = False

        scheme.add_argument(
            smi.Argument(
                "name", title="Name", description="Name", required_on_create=True
            )
        )
        scheme.add_argument(
            smi.Argument(
                "example_date",
                required_on_create=True,
            )
        )

        return scheme

    def validate_input(self, definition):
        """validate the input stanza"""
        """Implement your own validation logic to validate the input stanza configurations"""
        pass

    def get_app_name(self):
        return "Splunk_TA_UCCExample"

    def collect_events(helper, ew):
        helper.log_info("Starting demo_date_input.")

        example_date = helper.get_arg("example_date")

        if not example_date:
            helper.log_info("example_date is None. Returning...")
            return

        data = {"org_date": example_date, "org_date_type": str(type(example_date))}

        dt = datetime.strptime(example_date, "%Y-%m-%d")
        unix_epoch = int(dt.timestamp())

        data["unix_epoch"] = str(unix_epoch)

        event = helper.new_event(
            source=helper.get_input_type(),
            index=helper.get_output_index(),
            time=int(datetime.now().timestamp()),
            sourcetype="ucc:example:date",
            data=json.dumps(data),
        )
        ew.write_event(event)
        helper.log_info(
            f"Event {data} successfully written to Splunk index '{helper.get_output_index()}'."
        )

    def get_account_fields(self):
        account_fields = []
        return account_fields

    def get_checkbox_fields(self):
        checkbox_fields = []
        return checkbox_fields

    def get_global_checkbox_fields(self):
        if self.global_checkbox_fields is None:
            checkbox_name_file = os.path.join(bin_dir, "global_checkbox_param.json")
            try:
                if os.path.isfile(checkbox_name_file):
                    with open(checkbox_name_file, "r") as fp:
                        self.global_checkbox_fields = json.load(fp)
                else:
                    self.global_checkbox_fields = []
            except Exception as e:
                self.log_error(
                    "Get exception when loading global checkbox parameter names. "
                    + str(e)
                )
                self.global_checkbox_fields = []
        return self.global_checkbox_fields


if __name__ == "__main__":
    exit_code = ModInputDEMO_INPUT().run(sys.argv)
    sys.exit(exit_code)
