import sys
import import_declare_test

from splunklib.searchcommands import \
    dispatch, ReportingCommand, Configuration, Option, validators

from sum import reduce

try:
    from sum import map as module_map
except ImportError:
    module_map = None

@Configuration()
class SumcommandCommand(ReportingCommand):
    """

    ##Syntax
    | sumcommand total=lines linecount

    ##Description
    The total produced is sum(sum(fieldname, 1, n), 1, N) where n = number of fields, N = number of records.

    """

    total = Option(name='total', require=True, validate=validators.Fieldname())

    if module_map is not None:
        @Configuration()
        def map(self, events):
            return module_map(self, events)

    def reduce(self, events):
        return reduce(self, events)

dispatch(SumcommandCommand, sys.argv, sys.stdin, sys.stdout, __name__)