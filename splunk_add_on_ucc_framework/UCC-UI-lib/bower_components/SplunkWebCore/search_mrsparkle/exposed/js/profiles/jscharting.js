//splunk cmd node $SPLUNK_HOME/lib/node_modules/requirejs/bin/r.js -o jscharting.js
({
    baseUrl: '../',
    preserveLicenseComments: false,
    name: 'contrib/almond',
    stubModules: [],
    optimize: 'uglify2',
    uglify2: {
        mangle: {
            except: ['_']
        }
    },
    include: ['js_charting/js_charting'],
    wrap: {
        start: ' ',
        end: 'require("splunk").JSCharting = require("js_charting/js_charting");'
    },
    out: '../build/jscharting.js',
    paths: {

        // jQuery and contrib plugins
        'jquery': 'stubs/jquery',

        // other contrib libraries
        'underscore': 'require/underscore',
        'highcharts': 'contrib/highcharts-4.0.4/highcharts',
        'highcharts.runtime_patches': 'contrib/highcharts-4.0.4/runtime_patches',
        'moment': 'contrib/moment',

        // Splunk legacy
        'splunk': 'stubs/splunk',
        'splunk.util': 'stubs/splunk.util',
        'splunk.i18n': 'stubs/i18n',
        'splunk.config': 'stubs/splunk.config',
        'splunk.logger': 'stubs/splunk.logger',
        'strftime': 'stubs/strftime'

    },
    shim: {
        highcharts: {
            deps: ['jquery', 'highcharts.runtime_patches'],
            exports: 'Highcharts',
            init: function($, runtimePatches) {
                runtimePatches.applyPatches(this.Highcharts);
                return this.Highcharts;
            }
        }
    }
})
