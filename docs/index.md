# Overview

splunk-add-on-ucc-framework is a framework to generate UI based Splunk
Add-ons. It includes UI, Rest handler, Modular input, Oauth, Alert
action templates.

> After UCC 5.2 Python 2 specific libraries are not supported anymore.
> :   This means if the add-on has package/lib/py2/requirements.txt they
>     will not be installed while running ucc-gen command. Therefore
>     modular inputs that are supposed to run on Python 2 will not be
>     supported by UCC.
>

Available as a GitHub action here:
<https://github.com/splunk/addonfactory-ucc-generator-action>

## What is UCC?

UCC stands for Universal Configuration Console. The purpose of having a
framework for add-on generation is to simplify the process of add-on
creation for the developers. UCC 5.X uses SplunkUI which is a new UI
framework based on React.

## Features

-   Generate UCC based addons for your Splunk Technology Add-ons

## Installation

splunk-add-on-ucc-framework can be installed via pip from PyPI:

```
pip3 install splunk-add-on-ucc-framework
```
