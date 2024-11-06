## Build an add-on from the exisiting one

After initializing a new add-on, you can continue building your add-on.

> The command used in this task are macOS and Linux specific.

1. Set up and activate the Python virtual environment (skip if you already have an environment):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

1. Install `splunk-add-on-ucc-framework`  (skip if you already installed the libraries):

```bash
pip install splunk-add-on-ucc-framework 
```

> If you use UCC `v5.30.0+`, use the `ucc-gen package` command instead of `slim`. 

1. Run `ucc-gen build` and package it

> Provide a `--ta-version=<version>` parameter if this repository is not version controlled.

```bash
ucc-gen build
slim package output/<add-on-name>
```

> Please use `ucc-gen build` instead of `ucc-gen` if you are using UCC `v5.19.0` or higher.


Now you should see an archive created on the same level as your `globalConfig.json`.

Now you can go to your Splunk instance and install this add-on using the generated archive. 

Open the add-on in your spaln instance, click around and check if it works as intended.

After validating  
that the add-on was loaded correctly and all the basic operations
are working, you can extend the functionality of the input by copying and
pasting the automatically generated modular inputs file into the `package/bin`
folder. The generated inputs use the
[Splunk SDK for Python](https://github.com/splunk/splunk-sdk-python). After you
update the modular input code, you can run `ucc-gen` again, and then `ucc-gen` will
use updated modular inputs from `package/bin` instead of generating new ones.