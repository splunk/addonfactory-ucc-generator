---
title: Input Helper Module
---

# Input Helper Module

Input scripts are regenerated during every build step, in order to keep the arguments
and options up to date with the global config. To not discard changes made by developers,
additional helper modules were introduced. Those modules must contain
`validate_input` and `stream_events` methods (see [example below](#module-content)).
They are created if they do not exist, but they are not updated by UCC.
A script then imports such a module and calls the two methods.

Helper files are placed in the `bin` directory. In order to use helper files, specify
`inputHelperModule` parameter. This will create a new file: `{inputHelperModule}.py`.

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

Alternatively, if you want to have access to the instance of the input script class,
you can also add the `self` parameter to the methods:

```python
from splunklib import modularinput as smi


def validate_input(self, definition: smi.ValidationDefinition):
    ...


def stream_events(self, inputs: smi.InputDefinition, event_writer: smi.EventWriter):
    ...
```

Instead of `self`, you can also use any other name, but it must be the first parameter.
