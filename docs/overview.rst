Overview
========
splunk-add-on-ucc-framework is a framework to generate UI based Splunk Add-ons.
It includes UI, Rest handler, Modular input, Oauth, Alert action templates.

.. note::
    After UCC 5.2 Python 2 specific libraries are not supported anymore.
    This means if the add-on has :code:`package/lib/py2/requirements.txt` they will
    not be installed while running :code:`ucc-gen` command. Therefore modular inputs
    that are supposed to run on Python 2 will not be supported by UCC.

What is UCC?
------------
UCC stands for Universal Configuration Console.
The purpose of having a framework for add-on generation is to simplify the
process of add-on creation for the developers.
UCC 5.X uses SplunkUI which is a new UI framework based on React.

Features
--------
* Generate UCC based addons for your Splunk Technology Add-ons

.. _installation:

Installation
------------
splunk-add-on-ucc-framework can be installed via pip from PyPI:

.. code-block:: console

    pip3 install splunk-add-on-ucc-framework
