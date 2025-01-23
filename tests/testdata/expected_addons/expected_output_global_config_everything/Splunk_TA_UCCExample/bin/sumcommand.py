import sys
import import_declare_test

from splunklib.searchcommands import \
    dispatch, ReportingCommand, Configuration, Option, validators
from sum import map, reduce

@Configuration()
class SumcommandCommand(ReportingCommand):
    """

    ##Syntax
    | sum total=lines linecount

    ##Description
    The total produced is sum(sum(fieldname, 1, n), 1, N) where n = number of fields, N = number of records.

    """

    total = Option(name = "total",require = True, validate = validators.Fieldname(), default = "")
    

    @Configuration()
    def map(self, events):
        # Put your streaming preop implementation here, or remove the map method,
        # if you have no need for a streaming preop

        return map(self,events)

    def reduce(self, events):

        # Put your reporting implementation
        return reduce(self,events)

dispatch(SumcommandCommand, sys.argv, sys.stdin, sys.stdout, __name__)