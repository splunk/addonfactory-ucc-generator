import import_declare_test

import json
import sys
from time import time

from splunklib import modularinput as smi
from solnlib import log

logger = log.Logs().get_logger('splunk_ta_uccexample_three')


class EXAMPLE_INPUT_THREE(smi.Script):
    def __init__(self):
        super(EXAMPLE_INPUT_THREE, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme('example_input_three')
        scheme.description = 'Example Input Three'
        scheme.use_external_validation = True
        scheme.streaming_mode_xml = True
        scheme.use_single_instance = False

        scheme.add_argument(
            smi.Argument(
                'name',
                title='Name',
                description='Name',
                required_on_create=True
            )
        )
        return scheme

    def validate_input(self, definition: smi.ValidationDefinition):
        return

    def stream_events(self, inputs: smi.InputDefinition, ew: smi.EventWriter):
        input_items = [{'count': len(inputs.inputs)}]
        input_name_1 = ""
        for input_name, input_item in inputs.inputs.items():
            input_item['name'] = input_name
            input_name_1 = input_name
            input_items.append(input_item)
        
        sourcetype = f'example_input_three-st--{input_name_1.split("://")[-1]}'
        host = f'host--{input_name_1.split("://")[-1]}'
        source = f'example_input_three-s--{input_name_1.split("://")[-1]}'

        event = smi.Event(
            data=json.dumps(input_items),
            sourcetype=sourcetype,
            host=host,
            source=source,
        )
        log.events_ingested(logger, input_name_1, sourcetype,
                            str(time())[-3:], "main", "no_account_4", host)
        ew.write_event(event)


if __name__ == '__main__':
    exit_code = EXAMPLE_INPUT_THREE().run(sys.argv)
    sys.exit(exit_code)