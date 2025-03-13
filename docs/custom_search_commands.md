# Custom Search Command

Custom search commands are user-defined [SPL](https://docs.splunk.com/Splexicon:SPL) (Splunk Search Processing Language) commands that enable users to add custom functionality to their Splunk searches.


## Generation of custom search command

A new tag has been introduced in globalConfig (same indent level as of `meta` tag) named `customSearchCommand` where you need to define the configuration for the custom search command.

### Minimal definition

```json
"customSearchCommand": [
    {
        "commandName": "mycommandname",
        "fileName": "mycommandlogic.py",
        "commandType": "generating",
        "arguments": [
            {
                "name": "argument_name",
                "validate": {
                    "type": "Fieldname"
                },
                "required": true
            },
            {
                "name": "argument_two"
            }
        ]
    }
]
```

This configuration will generate a template Python file named `mycommandname.py`, which imports logic from the `mycommandlogic.py` file and automatically updates the `commands.conf` file as shown below:

```
[mycommandname]
filename = mycommandname.py
chunked = true
python.version = python3
```

 **NOTE:**
   If the file specified in the `fileName` field does not exist in the `<YOUR_ADDON/bin>` directory, the build will fail.

### Attributes for `customSearchCommand` tag

| Property                 | Type   | Description |
| ------------------------ | ------ | ------------------------------------ |
| commandName<span class="required-asterisk">\*</span>  | string  | Name of the custom search command |
| fileName<span class="required-asterisk">\*</span>     | string  | Name of the Python file which contains logic of custom search command  |
| commandType<span class="required-asterisk">\*</span>  | string  | Specify type of custom search command. Four types of commands are allowed, `streaming`,`generating`,`reporting` and `eventing`. |
| arguments<span class="required-asterisk">\*</span>    | object  | Arguments which can be passed to custom search command. |
| requiredSearchAssistant                               | boolean | Specifies whether search assistance is required for the custom search command. Default: false. |
| usage                                                 | string  | Defines the usage of custom search command. It can be one of `public`, `private` and `deprecated`.  |
| description                                           | string  | Provide description of the custom search command.   |
| syntax                                                | string  | Provide syntax for custom search command   |

To generate a custom search command, the following attributes must be defined in globalConfig: `commandName`, `commandType`, `fileName`, and `arguments`. Based on the provided commandType, UCC will generate a template Python file and integrate the user-defined logic into it.

If `requiredSearchAssistant` is set to True, the `syntax`, `description`, and `usage` attributes are mandatory, as they are essential for generating `searchbnf.conf` file.

**NOTE:**
    The user-defined Python file must include specific functions based on the command type:

- For `Generating` command, the Python file must include a `generate` function.
- For `Streaming` command, the Python file must include a `stream` function.
- For `Eventing` command, the Python file must include a `transform` function.
- For `Reporting` command, the Python file must include a `reduce` function, and optionally a `map` function if a streaming pre-operation is required.

## Arguments

| Property                                                              | Type   | Description   |
| --------------------------------------------------------------------- | ------ | ------------------------------------------------------- |
| name<span class="required-asterisk">\*</span>                         | string | Name of the argument  |
| defaultValue                                                          | string/number | Default value of the argument.  |
| required                                                              | string |  Specify if the argument is required or not. |
| validate                                                              | object | Specify validation for the argument. It can be any of `Integer`, `Float`, `Boolean`, `RegularExpression` or `FieldName`. |

UCC currently supports five types of validations provided by `splunklib` library:

- IntegerValidator
    + you can optionally define `minimum` and `maximum` properties.
- FloatValidator
    + you can optionally define `minimum` and `maximum` properties.
- BooleanValidator
    + no additional properties required.
- RegularExpressionValidator
    + no additional properties required.
- FieldnameValidator
    + no additional properties required.

For more information, refer [splunklib API docs](https://splunk-python-sdk.readthedocs.io/en/latest/searchcommands.html)

For example:

```json
"arguments": [
    {
        "name": "count",
        "required": true,
        "validate": {
            "type": "Integer",
            "minimum": 1,
            "maximum": 10
        },
        "default": 5
    },
    {
        "name": "test",
        "required": true,
        "validate": {
            "type": "Fieldname"
        }
    },
    {
        "name": "percent",
        "validate": {
            "type": "Float",
            "minimum": "85.5"
        }

    }
]

```

## Example

``` json
{
    "meta": {...}
    "customSearchCommand": [
        {
            "commandName": "testcommand",
            "fileName": "commandlogic.py",
            "commandType": "streaming",
            "requiredSearchAssistant": true,
            "description": "This is a test command",
            "syntax": "| testcommand fieldname=<Name of field> pattern=<Valid regex pattern>",
            "usage": "public",
            "arguments": [
                {
                    "name": "fieldname",
                    "validate": {
                        "type": "Fieldname"
                    }
                },
                {
                    "name": "pattern",
                    "validate": {
                        "type": "RegularExpression"
                    },
                    "required": true
                }
            ]
        }
    ],
    "pages": {...}
}
```

Generated python file named `testcommand.py`:

``` python
import sys
import import_declare_test

from splunklib.searchcommands import \
    dispatch, StreamingCommand, Configuration, Option, validators
from commandlogic import stream

@Configuration()
class testcommandCommand(StreamingCommand):
    """

    ##Syntax
    This is a test command

    ##Description
    | testcommand fieldname=<Name of field> pattern=<Valid regex pattern>

    """

    fieldname = Option(name = "fieldname",require = False, validate = validators.Fieldname(), default = "")
    pattern = Option(name = "pattern",require = True, validate = validators.RegularExpression(), default = "")
    

    def stream(self, events):
        # Put your event transformation code here
        return stream(self,events)

dispatch(testcommandCommand, sys.argv, sys.stdin, sys.stdout, __name__)
```

Generated stanza in `commands.conf` file

```
[testcommand]
filename = testcommand.py
chunked = true
python.version = python3
```

Generated stanza in `searchbnf.conf` file

```
[testcommand]
syntax = | testcommand fieldname=<Name of field> pattern=<Valid regex pattern>
description = This is a test command.
usage = public
```
