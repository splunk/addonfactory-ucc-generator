# `additional_packaging.py` file

To extend the build process, you can create a `additional_packaging.py` file in the same file level where you have your globalConfig file.

This file should have the `additional_packaging` function, which accepts add-on name as its only argument.

See the following example for proper usage: 

* Build custom UI after `ucc-gen` finishes all its necessary steps.
* Use a workaround for a `ucc-gen` feature that has not been implemented.
