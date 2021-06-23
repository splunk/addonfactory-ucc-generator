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
It is a service for generating Splunk Add-ons which is easily customizable and flexible.
UCC provides basic UI template for creating Addon's UI.
It is helpful to control the activity by using hooks and other functionalities.

Features
--------
* Generate UCC based addons for your Splunk Technology Add-ons

Installation
------------
splunk-add-on-ucc-framework can be installed via pip from PyPI:

.. code-block:: console

    pip3 install splunk-add-on-ucc-framework
