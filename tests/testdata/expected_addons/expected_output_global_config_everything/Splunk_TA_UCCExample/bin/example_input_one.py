import import_declare_test

import sys
import inspect

from splunklib import modularinput as smi
from helper_one import stream_events, validate_input


class EXAMPLE_INPUT_ONE(smi.Script):
    def __init__(self):
        super(EXAMPLE_INPUT_ONE, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme('example_input_one')
        scheme.description = 'Example Input One'
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
                'input_one_checkbox',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'input_one_radio',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'dependent_dropdown',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'singleSelectTest',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'multipleSelectTest',
                required_on_create=False,
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
                'object',
                required_on_create=True,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'object_fields',
                required_on_create=True,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'order_by',
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
                'limit',
                required_on_create=False,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'example_textarea_field',
                required_on_create=True,
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
        return self.call_with_args(validate_input, definition)

    def stream_events(self, inputs: smi.InputDefinition, ew: smi.EventWriter):
        return self.call_with_args(stream_events, inputs, ew)

    def call_with_args(self, method, *args):
        method_args_list = inspect.getfullargspec(method).args

        if len(method_args_list) == len(args) + 1:
            return method(self, *args)

        return method(*args)


if __name__ == '__main__':
    exit_code = EXAMPLE_INPUT_ONE().run(sys.argv)
    sys.exit(exit_code)
