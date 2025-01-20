
import sys
import import_declare_test

from splunklib.searchcommands import \
    dispatch, StreamingCommand, Configuration, Option, validators
from countmatches import stream

@Configuration()
class CountmatchescommandCommand(StreamingCommand):
    """

    ##Syntax

    ##Description

    """

    fieldname = Option(name = "fieldname",require = True, validate = validators.Fieldname(), default = "")
    pattern = Option(name = "pattern",require = True, validate = validators.RegularExpression(), default = "")
    

    def stream(self, events):
        # Put your event transformation code here
        return stream(self,events)

dispatch(CountmatchescommandCommand, sys.argv, sys.stdin, sys.stdout, __name__)