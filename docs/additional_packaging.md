# `additional_packaging.py` file

To extend the build process, you can create a `additional_packaging.py` file in the same file level where you have your globalConfig file.

This file should at least have:

- the `cleanup_output_files` function, which accepts `output_path` (str), `add-on name` (str) as its arguments.
- the `additional_packaging` function, which accepts `add-on name` (str) as its only argument.

First the `cleanup_output_files` function would be called from `ucc-gen` build process and then `additional_packaging` function.

See the following example for proper usage:

- Build custom UI after `ucc-gen` finishes all its necessary steps.
- Use a workaround for a `ucc-gen` feature that has not been implemented.

## Example

Below is an example of additional_package.py containing both the implementations of functions.

```python
--8<-- "tests/testdata/test_addons/package_global_config_everything_uccignore/additional_packaging.py"
```
