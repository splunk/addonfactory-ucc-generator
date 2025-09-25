import sys
import import_declare_test

from splunklib.searchcommands import \
    dispatch, ReportingCommand, Configuration, Option, validators

from sum_without_map import reduce

@Configuration()
class SumtwocommandCommand(ReportingCommand):
    """

    ##Syntax
    | sumtwocommand total=lines linecount

    ##Description
    The total produced is sum(sum(fieldname, 1, n), 1, N) where n = number of fields, N = number of records.

    """

    total = Option(name='total', require=True, validate=validators.Fieldname())


    def reduce(self, events):
        return reduce(self, events)

dispatch(SumtwocommandCommand, sys.argv, sys.stdin, sys.stdout, __name__)