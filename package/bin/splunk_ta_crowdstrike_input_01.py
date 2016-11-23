
import sys
import json

from splunklib import modularinput as smi


class SplunkTACrowdstrikeInput01(smi.Script):

    def __init__(self):
        super(SplunkTACrowdstrikeInput01, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme('splunk_ta_crowdstrike_input_01')
        scheme.description = 'Splunk Add-on Crowdstrike Input 01'
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
                'account',
                required_on_create=True,
            )
        )
        scheme.add_argument(
            smi.Argument(
                'app_id',
            )
        )
        scheme.add_argument(
            smi.Argument(
                'start_offset',
            )
        )

        return scheme

    def validate_input(self, definition):
        return

    def stream_events(self, inputs, ew):
        input_items = [{'count': len(inputs.inputs)}]
        for input_name, input_item in inputs.inputs.iteritems():
            input_item['name'] = input_name
            input_items.append(input_item)
        event = smi.Event(
            data=json.dumps(input_items),
            sourcetype='ta:Crowdstrike:inputs:01',
        )
        ew.write_event(event)

if __name__ == '__main__':
    exit_code = SplunkTACrowdstrikeInput01().run(sys.argv)
    sys.exit(exit_code)
