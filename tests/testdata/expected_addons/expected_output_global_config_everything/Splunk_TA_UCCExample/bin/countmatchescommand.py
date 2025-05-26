import sys
import import_declare_test

from splunklib.searchcommands import \
    dispatch, StreamingCommand, Configuration, Option, validators
from countmatches import stream

@Configuration()
class CountmatchescommandCommand(StreamingCommand):

    fieldname = Option(name='fieldname', require=True, validate=validators.Fieldname())
    pattern = Option(name='pattern', require=True, validate=validators.RegularExpression())

    def stream(self, events):
        return stream(self, events)

dispatch(CountmatchescommandCommand, sys.argv, sys.stdin, sys.stdout, __name__)