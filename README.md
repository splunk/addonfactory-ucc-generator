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

Note: Replace ${SPLUNK_HOME} with real Splunk home path.
