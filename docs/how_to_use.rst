How To Use
==========

Prerequisites
-------------

* :code:`globalConfig.json`
* :code:`package` folder
* :code:`git` for automatic versioning (when no :code:`ta-version` argument is specified)

Example of :code:`globalConfig.json` and :code:`package` folder can be found at https://github.com/splunk/splunk-add-on-for-ucc-example.

.. _steps:

Steps
-----

* Install :code:`splunk-add-on-ucc-framework` if it is not installed.
* Run the :code:`ucc-gen` command.
* The final addon package will be generated, in the :code:`output` folder.

:code:`ucc-gen` supports the following params:

* :code:`source` - [optional] folder containing the app.manifest and app source.
* :code:`config` - [optional] path to the configuration file, defaults to :code:`globalConfig.json` in the parent directory of source provided.
* :code:`ta-version` - [optional] override current version of TA, default version is version specified in :code:`globalConfig.json`. Splunkbase compatible version of SEMVER will be used by default.

.. code-block:: console

    pip install splunk-packaging-toolkit
    slim package output/<package_ID>

After completing the packaging slim should also output path to the package for distribution.

What ucc-gen does
-----------------

* Cleans the :code:`output` folder.
* Retrieve the package ID of addon.
* Copy UCC template directory under :code:`output/<package_ID>` directory.
* Copy :code:`globalConfig.json` file to :code:`output/<package_ID>/appserver/static/js/build` directory.
* Collect and install Addon's requirements into :code:`output/<package_ID>/lib` directory of addon's package.
* For the addon's requirements, packages are installed according to following table:

  * :code:`lib/requirements.txt` - install Python3 compatible packages into :code:`output/<package_ID>/lib`

* Replace tokens in views.
* Copy addon's :code:`package/*` to :code:`output/<package_ID>/*` directory.
* If an addon requires some additional configurations in packaging than implement the steps in :code:`additional_packaging.py`