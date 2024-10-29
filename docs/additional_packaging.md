# `additional_packaging.py` file

To extend the build process, you can create a `additional_packaging.py` file in the same file level where you have your globalConfig file.

This file should have:

- the `additional_packaging` function, which accepts add-on name as its only argument.
- the `cleanup_output_files` function, which accepts output_path (str), add-on name (str) and an optional list containing resolved paths from .uccignore if they are still used post the deprecation.

First the `cleanup_output_files` function would be called from `ucc-gen` build process and then `additional_packaging` function.

See the following example for proper usage:

- Build custom UI after `ucc-gen` finishes all its necessary steps.
- Use a workaround for a `ucc-gen` feature that has not been implemented.

## Example

Below is an example of additional_package.py containing both the implementations of functions.

```py
from typing import List, Optional
from os.path import sep, remove

def additional_packaging(ta_name: str) -> None:
    pass

def cleanup_output_files(output_path: str, ta_name: str) -> None:
    delete_file = sep.join([output_path, ta_name, "default", "redundant.config"])
    remove(delete_file)

```
