# SplunkJS independent mode

This directory contains resources related to the independent mode build of SplunkJS.

## How to build

* Make sure you have a working dev setup (`npm install` ...)
* Execute `npm run build:splunkjs-independent` in `web`
* Output is in `web/search_mrsparkle/exposed/build/splunkjs_independent`

## In this directory

* `assets`: contains files intended for inclusion in the final package (license, readme, ...)
* `tests`: a set of internal test files we're using to manually verify that independent mode is working properly

The easiest way to run the tests is to download and install the Splunk JS SDK, edit the `createHandler(...)` call in
 `bin/cli.js` to point to the location of the extracted package/built files. Then copy the `tests` directory there,
 and run `node bin/cli.js runserver`. This will spawn a webserver that automatically `/proxy`-ies calls to Splunk.

## Related

* web/scripts/build-splunkjs-independent.js
* web/build_tools/profiles/splunkjs_independent(.config.js)
* https://confluence.splunk.com/display/PROD/Web+Framework+Getting+Started
