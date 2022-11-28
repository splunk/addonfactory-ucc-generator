# Other UCC-related components

To be able to fully utilize the power of UCC, other libraries should be used.
Below is the list of the libraries which can be used with the modular input code.  

### splunklib

[`splunklib`](https://github.com/splunk/splunk-sdk-python) - official Splunk SDK for Python.
It can be utilized as a base for the modular input code.
Below is the example of how it can look like.

```python
import sys

import import_declare_test  # should be before splunklib to load all the libraries from lib folder
from splunklib import modularinput as smi


class ModularInputName(smi.Script):
    def __init__(self):
        super().__init__()

    def get_scheme(self):
        ...

    def validate_input(self, definition):
        ...

    def stream_events(self, inputs: smi.InputDefinition, event_writer: smi.EventWriter):
        ...


if __name__ == "__main__":
    exit_code = ModularInputName().run(sys.argv)
    sys.exit(exit_code)
```

### solnlib

[`solnlib`](https://github.com/splunk/addonfactory-solutions-library-python) - 
solnlib or solutions library can be used to interact with Splunk itself. You
can find its documentation [here](https://splunk.github.io/addonfactory-solutions-library-python/).
It contains a bunch of useful classes and functions to simplify add-on development.

If you want to log what happens in your add-on, you may be interested in the 
`log` [module](https://splunk.github.io/addonfactory-solutions-library-python/log/) 
from `solnlib`.

The code snippet which you may use, when you want each input to have a separate log file.

```python
import logging

from solnlib import log


def logger_for_input(input_name: str) -> logging.Logger:
    return log.Logs().get_logger(f"<add-on name>_{input_name}")
```

Then in the modular input code, particular in `stream_events` method you can 
use it in a following way.

```python
import import_declare_test  # should be before splunklib to load all the libraries from lib folder
from splunklib import modularinput as smi


class ModularInputName(smi.Script):
    def __init__(self):
        super().__init__()

    def get_scheme(self):
        ...

    def validate_input(self, definition):
        ...

    def stream_events(self, inputs: smi.InputDefinition, event_writer: smi.EventWriter):
        for input_name, input_item in inputs.inputs.items():
            logger = logger_for_input(input_name)
            logger.setLevel("INFO")
            logger.log("Hello world from Splunk add-on")
            ...
```
