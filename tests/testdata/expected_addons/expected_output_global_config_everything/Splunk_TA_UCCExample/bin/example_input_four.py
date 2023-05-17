import import_declare_test

import sys
import json

from splunklib import modularinput as smi

class EXAMPLE_INPUT_FOUR(smi.Script):

    def __init__(self):
        super(EXAMPLE_INPUT_FOUR, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme('example_input_four')
        scheme.description = 'Example Input Four'
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
        
        scheme.add_argument(
            smi.Argument(
                'interval',
                required_on_create=True,
            )
        )
        
        return scheme

    def validate_input(self, definition):
        return

    def stream_events(self, inputs, ew):
        input_items = [{'count': len(inputs.inputs)}]
        for input_name, input_item in inputs.inputs.items():
            input_item['name'] = input_name
            input_items.append(input_item)
        event = smi.Event(
            data=json.dumps(input_items),
            sourcetype='example_input_four',
        )
        ew.write_event(event)


if __name__ == '__main__':
    exit_code = EXAMPLE_INPUT_FOUR().run(sys.argv)
    sys.exit(exit_code)