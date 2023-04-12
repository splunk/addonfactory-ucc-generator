# UCC-related libraries

There are two UCC-related libraries:

* [`solnlib`](https://github.com/splunk/addonfactory-solutions-library-python)
* [`splunktaucclib`](https://github.com/splunk/addonfactory-ucc-library)

## `solnlib`

`solnlib` contains a number of functions and classes that can be used during
the add-on development. The documentation can be found
[here](https://splunk.github.io/addonfactory-solutions-library-python).

Commonly used modules are:

* `log` - file-based logging to `$SPLUNK_HOME/var/log/splunk` folder
* `modular_input.checkpointers` - contains classes to manage checkpoints

Below is the example of the code that can be used to get a logger for a
specific add-on.

```python
import logging

from solnlib import log


def logger_for_input(input_name: str) -> logging.Logger:
    return log.Logs().get_logger(f"<add-on name>_{input_name}")
```

## `splunktaucclib`

`splunktaucclib` powers backend of the add-on.
