// A list of apps that are enbabled for Jasmin tests
var apps = [
    'Splunk_TA_citrix-netscaler'
];

function runTests(test_script_paths) {
    // Add more module if needed
    var paths = {
            app: '../app/Splunk_TA_citrix-netscaler/js',
            boot: '//cdnjs.cloudflare.com/ajax/libs/jasmine/2.4.1/boot',
            jasmine: '//cdnjs.cloudflare.com/ajax/libs/jasmine/2.4.1/jasmine',
            jasmine_html: '//cdnjs.cloudflare.com/ajax/libs/jasmine/2.4.1/jasmine-html'
        };

    // Merge in the test scripts
    for (var test_script in test_script_paths) { paths[test_script] = test_script_paths[test_script]; }

    // Configure RequireJS to shim Jasmine
    require.config({
        paths: paths,
        shim: {
            'jasmine': {
                exports: 'window.jasmineRequire'
            },
            'jasmine_html': {
                deps: ['jasmine'],
                exports: 'window.jasmineRequire'
            },
            'boot': {
                deps: ['jasmine', 'jasmine_html'],
                exports: 'window.jasmineRequire'
            }
        }
    });

    // Define all of your specs here. These are RequireJS modules.
    var dependencies = [];
    // Add the test scripts so that they get loaded
    for(test_script in test_script_paths){
        dependencies.push(test_script);
    }

    // Load Jasmine - This will still create all of the normal Jasmine browser globals unless `boot.js` is re-written to use the
    // AMD or UMD specs. `boot.js` will do a bunch of configuration and attach it's initializers to `window.onload()`. Because
    // we are using RequireJS `window.onload()` has already been triggered so we have to manually call it again. This will
    // initialize the HTML Reporter and execute the environment.
    require(['boot', 'splunkjs/mvc/simplexml/ready!'], function () {

        // Load the specs
        require(dependencies, function () {
            function addStylesheet(filename) {

                // For Internet Explorer, use createStyleSheet since adding a stylesheet using a link tag will not be recognized
                // (http://stackoverflow.com/questions/1184950/dynamically-loading-css-stylesheet-doesnt-work-on-ie)
                if (document.createStyleSheet) {
                    document.createStyleSheet(filename);
                }
                // For everyone else
                else {
                    var link = $('<link>');
                    link.attr({type: 'text/css', rel: 'stylesheet', href: filename});
                    $('head').append(link);
                }
            }

            addStylesheet('//cdnjs.cloudflare.com/ajax/libs/jasmine/2.4.1/jasmine.css');

            // Hide the view content
            $('#dashboard').hide();

            // Reset the body margin because it looks ugly
            $('body').css('margin', '0px');

            // Initialize the HTML Reporter and execute the environment (setup by `boot.js`)
            window.onload();
        });
    });
}

function loadSuitesForApp(app) {
    var promise = $.Deferred();
    var uri = Splunk.util.make_url('static/app/' + app + '/js/tests/tests.json');

    jQuery.ajax({
        url: uri,
        type: 'GET',
        cache: false,
        success: function (result) {
            if (result !== undefined) {
                promise.resolve(result);
            } else {
                promise.reject(result);
            }
        },
        error: function (result) {
            promise.reject(result);
        }
    });
    return promise;
}

/**
 * Start the tests for the app that this file resides in.
 */
function startTests() {
    require(['splunkjs/mvc/utils'], function (SplunkUtil) {
        var suites = apps.map(loadSuitesForApp);

        // wait till all collections have been loaded
        $.when.apply($, suites).done(function () {
            var suite = arguments;
            // merge tests
            var tests = {};
            $.each(suite, function (idx) {
                $.extend(tests, suite[idx]);
            }.bind(tests).bind(suite));
            // run tests
            runTests(tests);
        })
    })();
}

startTests();
