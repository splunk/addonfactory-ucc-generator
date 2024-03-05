# UCC-related libraries

There are two UCC-related libraries:

* [`solnlib`](https://github.com/splunk/addonfactory-solutions-library-python)
* [`splunktaucclib`](https://github.com/splunk/addonfactory-ucc-library)

## `solnlib`

`solnlib` contains a number of functions and classes that can be used during
add-on development. The documentation can be found
[here](https://splunk.github.io/addonfactory-solutions-library-python).

Commonly used modules are:

* `log` is for file-based logging to the `$SPLUNK_HOME/var/log/splunk` folder.
* `modular_input.checkpointers` contains classes to manage checkpoints.

See the following example of code that can be used to get a logger for a
specific add-on:

```python
import logging

from solnlib import log


def logger_for_input(input_name: str) -> logging.Logger:
    return log.Logs().get_logger(f"<add-on name>_{input_name}")
```

## `splunktaucclib`

`splunktaucclib` powers the backend of the add-on.
