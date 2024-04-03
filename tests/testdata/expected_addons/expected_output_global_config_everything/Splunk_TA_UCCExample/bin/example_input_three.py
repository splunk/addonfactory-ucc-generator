import import_declare_test

import sys
import json

from splunklib import modularinput as smi
from helper_common import stream_events
from helper_one import validate_input


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

    def validate_input(self, definition):
        return validate_input(self, definition)

    def stream_events(self, inputs, ew):
        return stream_events(self, inputs, ew)


if __name__ == '__main__':
    exit_code = EXAMPLE_INPUT_THREE().run(sys.argv)
    sys.exit(exit_code)