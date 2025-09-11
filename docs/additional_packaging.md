# `additional_packaging.py` file

To extend the build process, create a `additional_packaging.py` file in the root directory of your source code — that is, the same level where your package directory is located.

This file should have either of the below two functions:

- the `cleanup_output_files` function, which accepts `output_path` (str), `add-on name` (str) as its arguments.
- the `additional_packaging` function, which accepts `add-on name` (str) as its only argument.

First the `cleanup_output_files` function would be called from `ucc-gen` build process and then `additional_packaging` function.

See the following example for proper usage:

- Build custom UI after `ucc-gen` finishes all its necessary steps.
- Use a workaround for a `ucc-gen` feature that has not been implemented.

## Example

Below is an example of additional_packaging.py containing both the implementations of functions.

```python
--8<-- "tests/testdata/test_addons/package_global_config_everything/additional_packaging.py"
```
