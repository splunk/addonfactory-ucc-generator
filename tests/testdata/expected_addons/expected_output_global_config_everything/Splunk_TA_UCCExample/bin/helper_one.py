import json

from splunklib import modularinput as smi


def validate_input(self, definition):
    return


def stream_events(self, inputs, ew):
    input_items = [{'count': len(inputs.inputs)}]
    for input_name, input_item in inputs.inputs.items():
        input_item['name'] = input_name
        input_items.append(input_item)
    event = smi.Event(
        data=json.dumps(input_items),
        sourcetype='example_input_one',
    )
    ew.write_event(event)
