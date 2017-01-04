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
npm run update-version
npm run build
```
