
import sys
import import_declare_test

from splunklib.searchcommands import \
    dispatch, EventingCommand, Configuration, Option, validators
from filter import transform

@Configuration()
class FiltercommandCommand(EventingCommand):
    """

    ##Syntax
    | filter contains='value1' replace='value to be replaced,value to replace with'

    ##Description
    It filters records from the events stream returning only those which has :code:`contains` in them and replaces :code:`replace_array[0]` with :code:`replace_array[1]`.

    """

    contains = Option(name = "contains", require = False, default = "")
    replace_array = Option(name = "replace_array", require = False, default = "")
    
    def transform(self, events):
       # Put your event transformation code here

       return transform(self,events)

dispatch(FiltercommandCommand, sys.argv, sys.stdin, sys.stdout, __name__)