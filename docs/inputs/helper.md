---
title: Input Helper Module
---

Input scripts are regenerated during every build step, in order to keep the arguments
and options up to date with the global config. To not discard changes made by developers,
additional helper modules were introduced. Those modules must contain
`validate_input` and `stream_events` methods (see [example below](#module-content)).
They are created if they do not exist, but they are not updated by UCC.
A script then imports such a module and calls the two methods.

Helper files are placed in the `bin` directory. The default module name is `{input_name}_helper`
(the file: `{input_name}_helper.py`). In order to use a different module name, specify
`inputHelperModule` parameter.

### Usage

```json
"pages": {
    "inputs": {
        "services": [
            {
                "name": "example_input_one",
                "title": "Example Input",
                "entity": [],
                "inputHelperModule": "my_module"
            }
        ]
    }
},
```

This will create `my_module.py` (if it does not exist) file in the `bin` directory.
The input script `example_input_one` will import this module and call its methods.

If the parameter was not specified, the default value `{name}_helper` would be used
(in this case the value would be `example_input_one_helper` so the file would be
named `example_input_one_helper.py`).

### Module content

The file must contain the following two functions:

- `validate_input(definition: smi.ValidationDefinition)`
- `stream_events(inputs: smi.InputDefinition, event_writer: smi.EventWriter)`

```python
from splunklib import modularinput as smi


def validate_input(definition: smi.ValidationDefinition):
    ...


def stream_events(inputs: smi.InputDefinition, event_writer: smi.EventWriter):
    ...
```

The two methods' bodies should be filled by the developer.
