import sys
import import_declare_test

from splunklib.searchcommands import \
    dispatch, GeneratingCommand, Configuration, Option, validators
from generatetext import generate

@Configuration()
class GeneratetextcommandCommand(GeneratingCommand):
    """

    ##Syntax
    mycommand count=<event_count> text=<string>

    ##Description
     This command generates COUNT occurrences of a TEXT string.

    """
    count = Option(name="count", require=True, validate=validators.Integer(minimum=5, maximum=10), default="")
    text = Option(name="text", require=True, default="")
    

    def generate(self):
       return generate(self)

dispatch(GeneratetextcommandCommand, sys.argv, sys.stdin, sys.stdout, __name__)