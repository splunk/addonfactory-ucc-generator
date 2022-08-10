# UCC usage

Let's assume that you want to create a Splunk add-on with UI to specify
Splunk index that is going to be used in the add-on. Let's also assume
that you do not want to show indexes that are for internal use only
(like, `_internal`).

For this you can create a globalConfig.json file and specify that you
want one configuration tab called "Global Settings", one UI component on
that tab that will handle index management and store selected index in
specific add-on configuration file.

You also need a package folder and `app.manifest` inside it.

As well as `README.txt` and `LICENSE.txt` files inside package folder. Those
files may be empty to simplify the showcase of UCC.

To be able to utilise UI features of an add-on you need to create lib
folder in package folder and create `requirements.txt`.

Now you are ready to run `ucc-gen` command. If you don't have it
installed, please refer to installation section.

The structure of the add-on before running `ucc-gen` command should be
like this:

    ├── globalConfig.json
    └── package
        ├── LICENSE.txt
        ├── README.txt
        ├── app.manifest
        └── lib
            └── requirements.txt

Let's assume we want to generate an add-on with version 1.0.0, to
achieve that we run:

```
ucc-gen --ta-version=1.0.0
```

After that, output folder should be created. It should contain
`Splunk_TA_choose_index` folder. And the structure of
`Splunk_TA_choose_index` is following:

    Splunk_TA_choose_index
    ├── LICENSE.txt
    ├── README
    │   └── splunk_ta_choose_index_settings.conf.spec
    ├── README.txt
    ├── VERSION
    ├── app.manifest
    ├── appserver
    │   ├── static
    │   │   └── js
    │   │       └── build
    │   │           ├── 0.js
    │   │           ├── 0.licenses.txt
    │   │           ├── 1.js
    │   │           ├── 1.licenses.txt
    │   │           ├── 3.js
    │   │           ├── 3.licenses.txt
    │   │           ├── 4.js
    │   │           ├── 4.licenses.txt
    │   │           ├── entry_page.js
    │   │           ├── entry_page.licenses.txt
    │   │           └── globalConfig.json
    │   └── templates
    │       └── base.html
    ├── bin
    │   ├── Splunk_TA_choose_index_rh_settings.py
    │   └── import_declare_test.py
    ├── lib
    │   ├── <libraries>
    │   └── ...
    └── default
        ├── app.conf
        ├── data
        │   └── ui
        │       ├── nav
        │       │   └── default.xml
        │       └── views
        │           └── configuration.xml
        ├── restmap.conf
        ├── splunk_ta_choose_index_settings.conf
        └── web.conf

Now it's time to package our add-on and install it to Splunk. To install
slim refer to steps.

To package this particular add-on run:

```
slim package output/Splunk_TA_choose_index
```

After it runs, you should see an archive created in the root folder of
your add-on. In our case, it should have name:
`Splunk_TA_choose_index-1.0.0.tar.gz`.

This is an archive that can be loaded into Splunk through "Apps >
Manage Apps > Install app from file" interface.

Once you load it and restart Splunk, you can go to "Apps > Splunk
Add-on to choose index" and see interface like this one.

![image](images/splunk_add_on_choose_index.png)
