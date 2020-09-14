var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var log = require('karma/lib/logger').create('config');

if (!process.env.SPLUNK_HOME || !process.env.SPLUNK_SOURCE) {
    log.error('Need to set $SPLUNK_HOME and $SPLUNK_SOURCE.');
    process.exit(1);
}

module.exports = configFactory({
    basePath: path.join(process.env.SPLUNK_SOURCE),
    appPath: path.join(process.env.SPLUNK_HOME, 'etc', 'apps')
});

function configFactory(paths) {
    return function (config) {
        var fileFilter = !_.isEmpty(config.filter) ? config.filter.split(',') : [];
        var appFilter = !_.isEmpty(config.apps) ? config.apps.split(',') : [];
        var debugFlags = !_.isEmpty(config.debug) ? config.debug.split(',') : [];
        var testApps = findApps(paths, appFilter);

        if (_.isEmpty(testApps)) {
            log.error('No test applications found or enabled.');
            process.exit(1);
        }
        log.info('Enabled applications:', _.keys(testApps).join(', '));

        config.set({
            plugins: ['karma-*', require('./performance-reporter'), require('./webpack-plugin')],

            basePath: paths.basePath,

            frameworks: ['webpack', 'mocha', 'chai-as-promised', 'chai', 'sinon'],

            middleware: ['webpack'],

            files: [
                'web/search_mrsparkle/exposed/js/i18n.js', //i18n helpers
                'web/test/i18n.js', //i18n configuration
                'web/test/test-bootstrap-loader.js' //main loader
                //test files are added per app, below
            ],

            autoWatch: false, //webpack is watching

            //exclusions are added per app, below
            exclude: [],

            client: {
                mocha: {
                    reporter: 'html',
                    ui: 'tdd',
                    bail: false, //fail-fast mode
                    timeout: 20000
                },
                splunk: {
                    testRegexp: '.*\\/(.+)\\/appserver\\/test\\/(.*\\btest_.+)(?:\\.js|\\.es|\\.jsx)$',
                    apps: absoluteAppPaths(paths, testApps),
                    debugFlags: debugFlags,
                    logLevel: config.quietConsole ? config.LOG_ERROR : (config.logLevel || config.LOG_INFO)
                }
            },

            reporters: ['mocha'],

            junitReporter: {
                outputDir: 'web/test/xml_output',
                outputFile: config.junitFilename || 'output.xml',
                useBrowserName: false,

                //not forcing valid java package names, but the dot is used as a separator
                nameFormatter: function (browser, result) {
                    //slice of the global suite and the app suite
                    var name = (result.suite || []).slice(2).concat(result.description);
                    return _.invokeMap(name, 'replace', /\./g, '_').join(': ');
                },
                classNameFormatter: function (browser, result) {
                    var name = _.get(result, 'suite[1]', 'unknown').split('/');
                    name.unshift(_.get(result, 'suite[0]', 'unknown'));
                    return _.invokeMap(name, 'replace', /\./g, '_').join('.');
                }
            },

            mochaReporter: {
                showDiff: true
            },

            logLevel: config.LOG_INFO,

            //cancel current test run on file change
            //note: seems buggy, deactivating for now
            //
            //restartOnFileChange: true,

            browsers: ['PhantomJS'],

            phantomjsLauncher: {
                options: {
                    viewportSize: {width: 1280, height: 800},
                    onCallback: function (call) {
                        if (call && call.name == 'screenshot') {
                            page.render('./screenshots/' + Date.now() + '.png');
                        }
                    }
                }
            },

            customLaunchers: {
                PhantomJSDebug: {
                    base: 'PhantomJS',
                    debug: true
                }
            },

            browserNoActivityTimeout: 30 * 1000
        });

        if (config.saucelabs) {
            if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
                log.error('Environment variables $SAUCE_USERNAME and $SAUCE_ACCESS_KEY have to be set');
                process.exit(1);
            }
            var customLaunchers = {
                'IE11': {
                    base: 'SauceLabs',
                    browserName: 'internet explorer',
                    platform: 'Windows 8.1',
                    version: '11',
                    timeZone: 'Los Angeles'
                },
                'Edge': {
                    base: 'SauceLabs',
                    browserName: 'MicrosoftEdge',
                    platform: 'Windows 10',
                    version: '13',
                    timeZone: 'Los Angeles'
                },
                'Chrome': {
                    base: 'SauceLabs',
                    browserName: 'chrome',
                    version: '50',
                    timeZone: 'Los Angeles'
                },
                'Firefox': {
                    base: 'SauceLabs',
                    browserName: 'firefox',
                    version: '46',
                    timeZone: 'Los Angeles'
                },
                'Safari': {
                    base: 'SauceLabs',
                    browserName: 'safari',
                    platform: 'OS X 10.11',
                    timeZone: 'Los Angeles'
                },
                'iOS': {
                    base: 'SauceLabs',
                    browserName: 'iphone',
                    version: '9.2',
                    timeZone: 'Los Angeles'
                },
                'Android': {
                    base: 'SauceLabs',
                    browserName: 'android',
                    version: '5.1',
                    timeZone: 'Los Angeles'
                }
            };

            config.set({
                customLaunchers: customLaunchers,
                sauceLabs: {
                    testName: 'Splunk Core Unit Tests'
                },
                browsers: Object.keys(customLaunchers),
                reporters: ['dots', 'saucelabs'],
                singleRun: true,
                captureTimeout: 300000,
                browserNoActivityTimeout: 60000
            });
        }
        
        //global, flag-specific configuration
        if (config.coverage || false) {
            //enable and configure karma-coverage
            config.reporters.push('coverage');
            config.coverageReporter = {
                dir: path.join('web', 'test', 'coverage_report'),
                reporters: [
                    {type: 'in-memory'}, //emits coverage_complete when done
                    {type: 'html'} //html output for annotated source
                ]
            };

            //register coverage_complete handler (includes console output)
            config.plugins.push(require('./coverage-plugin'));
            config.frameworks.push('coverage-report');
        }

        //app-specific configuration
        Object.keys(testApps).forEach(function (app) {
            var appPath = testApps[app] + '/';
            var appTestPath = path.join(appPath, 'test');

            //add app test files for each filter, or all of them if no filter is specified
            if (_.isEmpty(fileFilter)) {
                fileFilter.push('**');
            }

            fileFilter.forEach(function (filter) {
                var filterPatterns = [];

                //detect filter sets (e.g. corejs_test:tableui)
                if (_.includes(filter, ':')) {
                    if (filter.startsWith(app + ':')) {
                        var setName = filter.substring((app + ':').length);
                        var filterSets = loadFilterSets(paths, testApps, app);
                        if (_.has(filterSets, setName)) {
                            filterPatterns = filterSets[setName];
                        } else {
                            log.warn('Filter set \'' + setName + '\' not found in app\'s filterset.js, ignoring');
                        }
                    }
                } else {
                    filterPatterns.push(filter);
                }

                filterPatterns.forEach(function (filter) {
                    config.files.push({
                        pattern: path.join(appTestPath, filter),
                        included: false
                    });
                });
            });

            //re-enable the following if tests need to load files from 'support' during runtime
            //
            // make sure to always include test support files
            //config.files.push({
            //    pattern: path.join(appTestPath, 'support', '**'),
            //    included: false
            //});

            //exclusions – this should be read from app config
            if (_.includes(appPath, 'splunkjs_test') && !(config.disableExclusions || false)) {
                //none at the moment
            } else if (_.includes(appPath, 'corejs_test') && !(config.disableExclusions || false)) {
                var corejsExclusions = [

                    //these three have been a constant source of grief - problem appears to have something
                    // to do with jquery animations / setTimeout use.
                    'views/shared/test_responsive_header_page',
                    'views/pivot/config_popups/test_pivot_config_wizard',
                    'widgets/test_widget_slidenav',

                    //TODO: investigate, fail on jenkins
                    'js_charting/**/*',

                    //fail in single mode:

                    //TODO: investigate, seems to do a redirect to dmc/enabler?
                    'routers/managementconsole/test_managementconsole_add_app',

                    //window.$C mod, we could make this work but do we want to?
                    'routers/test_dependency_aggregation_base',

                    //couple of changes due to webpack -> change after migration
                    'require/test_shims',

                    //'jQuery' is not exported to window – not supposed to work any longer -> change after migration
                    'require/test_jquery_1_10_2',
                    'require/test_jquery_1_8_2',
                    'require/test_jquery_1_8_3'
                ];
                corejsExclusions.forEach(function (test) {
                    config.exclude.push(path.join(appTestPath, test) + '.js');
                });
            }
        });


        //patch Karma 404 handling to ignore warnings
        if (!(config.verbose404 || false)) {
            var karmaCommon = require('karma/lib/middleware/common');
            karmaCommon.serve404 = function (response) {
                response.writeHead(404);
                return response.end('NOT FOUND');
            };
        }
    };
}

function findApps(paths, appFilter) {
    //finds test applications in paths.appPath, which can be absolute or relative (from paths.basePath)
    //returns an object where app names are keys and paths to them are values. paths are relative from
    //paths.basePath
    //also replaces symlinks by realpath-ing paths

    var appPath = path.isAbsolute(paths.appPath) ? paths.appPath :
        path.resolve(path.join(paths.basePath, paths.appPath));

    return fs.readdirSync(appPath).reduce(function (apps, app) {
        if (_.isEmpty(appFilter) || _.includes(appFilter, app)) {
            try {
                if (fs.statSync(path.join(appPath, app, 'appserver', 'test')).isDirectory()) {
                    apps[app] = path.relative(paths.basePath,
                        fs.realpathSync(path.join(appPath, app, 'appserver')));
                }
            }
            catch (e) {
            }
        }
        return apps;
    }, {});
}

function absoluteAppPaths(paths, testApps) {
    //takes results from findApps and makes the paths absolute

    return _.mapValues(testApps, function (appPath) {
        return path.resolve(paths.basePath, appPath);
    });
}

function loadFilterSets(paths, testApps, app) {
    var resolvedPath = path.resolve(paths.basePath, testApps[app]);
    try {
        return require(path.join(resolvedPath, 'test', 'support', 'filtersets') + '.js');
    } catch (e) {
        log.error('No (or invalid) filtersets.js file for app', app);
        return {};
    }
}


//override timezone to fix certain tests on systems with a local timezone other than Pacific
//tested on Mac OS X with PhantomJS, Chrome, Firefox – does NOT work with: Safari
process.env['TZ'] = 'US/Pacific';

//allow others to build a config similar to this one, using custom paths
module.exports.configFactory = configFactory;
