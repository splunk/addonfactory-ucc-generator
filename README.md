### Prerequisite
We uses bower, grunt and webpack to build the Universal Configuration Console.

### Install bower and configure it
Follow the setup steps here: [http://repo.splunk.com/artifactory/webapp/#/artifacts/browse/tree/General/bower | bower setup]
Note: you must install art-resolver to use splunk bower repo
```
npm install -g bower-art-resolver
```

### Use the following command to build an example add-on
```
python update_version.py
cd ./UCC-UI-lib && npm install && bower install
cd ./UCC-example-addon && python setup.py && source ${SPLUNK_HOME}/bin/setSplunkEnv && python build.py
```

### Implementation of a hook feature.

Step 1: Add hook in configuration tab at the entity level.

```
// adding hook in configuration tab

"configuration": {
     "title": "Configurations",
     "description": "Configure your servers and templates.",
      "tabs": [
          {
              "name": "templates",
              "title": "Templates",
               "table": {...
          },
          "entity": [...
          ],
           "hook": {
               "src": "customHook"
          }
       }
    ]
}
```

Step 2: Create custom/customHook.js

* Copy `./UCC-UI-lib/package/appserver/static/js/views/controls/Hook.js` to `${SPLUNK_HOME}/etc/apps/${UCC_GENERATED_APP}/appserver/static/js/build/custom/` folder and rename it to `customHook.js`
* Add app-level business logic in custom code in `customHook.js`.

Note:
* Replace ${SPLUNK_HOME} with real Splunk home path.
* Replace ${UCC_GENERATED_APP} with UCC Generated App name.