
import import_declare_test

import sys

from splunklib import modularinput as smi
from helper_two import stream_events, validate_input


class EXAMPLE_INPUT_TWO(smi.Script):
    def __init__(self):
        super(EXAMPLE_INPUT_TWO, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme('example_input_two')
        scheme.description = 'Example Input Two'
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
                'account',
                required_on_create=True,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'input_two_multiple_select',
                required_on_create=True,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'input_two_checkbox',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'input_two_radio',
                required_on_create=True,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'use_existing_checkpoint',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'start_date',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'example_help_link',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'apis',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'hide_in_ui',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                    'hard_disabled',
                required_on_create=False,
            )
        )
        return scheme

    def validate_input(self, definition: smi.ValidationDefinition):
        return validate_input(definition)

    def stream_events(self, inputs: smi.InputDefinition, ew: smi.EventWriter):
        return stream_events(inputs, ew)


if __name__ == '__main__':
    exit_code = EXAMPLE_INPUT_TWO().run(sys.argv)
    sys.exit(exit_code)