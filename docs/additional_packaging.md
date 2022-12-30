# `additional_packaging.py` file

To extend the build process, you can create `additional_packaging.py` file in the same file level where you have your globalConfig file.

This file should have `additional_packaging` function which accepts 1 argument: add-on name.

Example of how to utilize it:

* Build custom UI after `ucc-gen` finishes all its necessary steps.
* Workaround a `ucc-gen` feature which was not implemented.
