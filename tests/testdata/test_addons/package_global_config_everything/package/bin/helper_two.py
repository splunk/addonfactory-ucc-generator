import json

from splunklib import modularinput as smi


def validate_input(definition: smi.ValidationDefinition):
    return


def stream_events(self, inputs: smi.InputDefinition, ew: smi.EventWriter):
    # INPUT 2
    input_items = [{'count': len(inputs.inputs)}]
    for input_name, input_item in inputs.inputs.items():
        input_item['name'] = input_name
        input_items.append(input_item)
    event = smi.Event(
        data=json.dumps(input_items),
        sourcetype='example_input_two',
    )
    ew.write_event(event)
