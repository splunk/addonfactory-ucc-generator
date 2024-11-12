import import_declare_test

import json
import sys

from splunklib import modularinput as smi


class SERVICE_HIDDEN_FOR_ENTERPRISE(smi.Script):
    def __init__(self):
        super(SERVICE_HIDDEN_FOR_ENTERPRISE, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme('service_hidden_for_enterprise')
        scheme.description = 'Service hidden for enterprise'
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
        for input_name, input_item in inputs.inputs.items():
            input_item['name'] = input_name
            input_items.append(input_item)
        event = smi.Event(
            data=json.dumps(input_items),
            sourcetype='service_hidden_for_enterprise',
        )
        ew.write_event(event)


if __name__ == '__main__':
    exit_code = SERVICE_HIDDEN_FOR_ENTERPRISE().run(sys.argv)
    sys.exit(exit_code)