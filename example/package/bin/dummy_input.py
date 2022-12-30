import import_declare_test
import sys
import json

from splunklib import modularinput as smi


class DUMMY_INPUT(smi.Script):

    def __init__(self):
        super(DUMMY_INPUT, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme('dummy_input')
        scheme.description = 'Dummy input'
        scheme.use_external_validation = True
        scheme.streaming_mode_xml = True
        scheme.use_single_instance = True

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
        for input_name, input_item in inputs.inputs.items():
            dummy_data_to_ingest = [
                {"hello": "world", "from_input": input_name},
                {"dummy": "data"},
            ]
            event = smi.Event(
                data=json.dumps(dummy_data_to_ingest, ensure_ascii=False, default=str),
                sourcetype='dummy_input',
            )
            ew.write_event(event)


if __name__ == '__main__':
    exit_code = DUMMY_INPUT().run(sys.argv)
    sys.exit(exit_code)
