# Splunk Web

Hey there. Welcome to the Splunk Web project sources. Here's a little overview of the directory structure:

`$SPLUNK_SOURCE/web` (this is where you are, it also corresponds to `$SPLUNK_HOME/share/splunk` in the built Splunk instance)

- `search_mrsparkle/`
    * `exposed`: all the static assets that our webserver will serve
    * `exposed/js`: javascript sources
    * `exposed/js/contrib`: 3rd party javascript libs
    * `exposed/pcss`: Sources for our base stylesheets (in PostCSS format)
    * `exposed/css`: This is where the legacy compiled stylesheets will go (PostCSS -> CSS)
    * `exposed/build`: This is where built files will go
    * `templates`: contains Mako templates
    * `templates/qunit/testing`: contains unit tests


## Common Development Mode

To configure your ui development environment:

```
$ splunk cmd npm run dev-setup
```

To bring dependencies up to date:

```
$ splunk cmd npm install
```

To test that everything is working, use the karma test script

```
$ splunk cmd npm test
```

For active development, this builds and watches the enterprise pages. Use `start:lite` for the lite pages.

```
$ splunk cmd npm start
```

To build all web assets:

```
$ splunk cmd npm run build
```

or:

```
$ splunk cmd npm run build:dev
```

## Advanced Development Mode
The development build script lives at `$SPLUNK_SOURCE/web/build_tools/build.js`. It requires a target
 profile and accepts a variety of options. There are two directories for profiles: All of the profiles in 
 `$SPLUNK_SOURCE/web/build_tools/profiles` are built during the product build process, and their artifacts
 ship with the product. Profiles in `standalone` are excluded from this.
 
 The most commonly used profile is `pages_enterprise.config.js`, which is aliased above with the npm 'start'
 script. It builds all of the core pages for enterprise.

### Usage
This script enables source
maps, watch mode, live reload, and other developer niceties. The script lives in
`$SPLUNK_SOURCE/web/build_tools/build.js` and has a `--help` option that displays a
usage guide:

```
$ cd $SPLUNK_SOURCE/web/build_tools
$ splunk cmd node build --help
```

### Typical Development Set-up

* -d, --dev Development mode means no code minification and the addition of
 source maps.
* -w, --watch Watch mode will watch the necessary files for changes and rebuild
on a change. Webpack provides very good caching of built code, so in watch mode
it only has to rebuild the files that have changed. It is much faster than
rebuilding everything.
* -r, --live-reload Live-reload will automatically refresh the browser as soon
as a build completes. This should only be used with watch mode.
* -f, --filter <RegExp> You can use a filter to build a subset of the pages.

### Building and Watching a particular page

If you are working on one particular page, builds can be made faster and less
resource intensive by adding a filter. The filter should be a regular expression,
and the script will build all pages for which the regular expression matches.

For example, to build just the search page in dev mode with live reload:

```
$ cd $SPLUNK_SOURCE/web/build_tools
$ splunk cmd node build profiles.pages_enterprise.config.js -dwr --filter search$
```

### Building CSS

```
$ cd $SPLUNK_SOURCE/web/build_tools
$ splunk cmd node build profiles/css_base_enterprise.config.js
$ splunk cmd node build profiles/css_legacy.config.js
$ splunk cmd node build profiles/css_legacy_skin.config.js
$ splunk cmd node build profiles/css_splunk_components_enterprise.config.js
```

### Building an app

To build an app with webpack, simply pass in the app directory with the -a flag

```
$ splunk cmd node web/build -a app_dir/
```


## Run CoreJS unit tests

Details about unit testing: [https://confluence.splunk.com/display/PROD/QUnit](https://confluence.splunk.com/display/PROD/QUnit)

### In the browser

Run all unit tests in the browser:

[http://localhost:8000/en-US/debug/qunit/bubbles/](http://localhost:8000/en-US/debug/qunit/bubbles/)

Or run a subset of all unit tests by appending a prefix to the URL `/debug/qunit/bubbles/<prefix>`, for example:

[http://localhost:8000/en-US/debug/qunit/bubbles/views/pivot/](http://localhost:8000/en-US/debug/qunit/bubbles/views/pivot/)

### On the commandline using Grunt

Set up Grunt: [https://confluence.splunk.com/display/PROD/Using+Grunt](https://confluence.splunk.com/display/PROD/Using+Grunt)

```
$ grunt unitTest
```

Filter tests to run:

```
$ grunt unitTest --filter=**/views/pivot/**/*.html
```

## Run SplunkJS unit tests

Details about SplunkJS testing can be found [here](https://confluence.splunk.com/pages/viewpage.action?pageId=35326866) and
[here](https://confluence.splunk.com/display/PROD/Testing+Unification+Proposal).

Quick start:

```
$ cd $SPLUNK_SOURCE/web/test
$ splunk cmd npm install
$ splunk cmd npm install -g karma-cli
$ karma start --single-run
```

This assumes you have configured node/npm as described above [(Using Grunt)](https://confluence.splunk.com/display/PROD/Using+Grunt).

## Create a new page

The scaffold generator can create all the necessary files for a new page or view in the product and helps you get you started quickly.

- Create new page:
```
$ splunk cmd python $SPLUNK_SOURCE/python-site/splunk/generate.py page
```
- Create new view:
```
$ splunk cmd python $SPLUNK_SOURCE/python-site/splunk/generate.py view
```

## Code Style

See our [Javascript Styleguide](docs/style-guide-pg1.md) when writing ES6 and React or our 
[Javascript Code Conventions on Confluence](https://confluence.splunk.com/display/PROD/Client+Engineering%3A+JavaScript+Code+Conventions)
for the guideline for old-style code.


### Run the code linter

To verify that all the javascript sources follow our code quality guidelines, run the code linter:

```
$ npm run lint
```

## Build and publish the SplunkWebCore bower component from source

Prerequisite: The product must have been successfully built.

1. Update bower.json version number.
2. Go to the web directory:
```
$ cd $SPLUNK_SOURCE/web
```
3. tar the web directory:
```
$ tar -cvzf SplunkWebCore.tar.gz .
```
4. Push it to artifactory:
```
$ curl -u'<username:password>' -XPUT https://repo.splunk.com/artifactory/bower-solutions-local/SplunkWebCore.tar.gz -T SplunkWebCore.tar.gz
```
