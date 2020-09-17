/* eslint-env mocha */
/* eslint no-underscore-dangle: ["error", { "allow": ["__karma__"] }] */
/* eslint no-native-reassign: ["error", {"exceptions": ["suite", "assert"]}] */
/* global assert */

import $ from 'jquery';
import _ from 'underscore';
import helpers from './bootstrap-helpers.js';
import testHelpers from './test-helpers.js';

const config = window.__karma__.config.splunk || {};
const debugFlags = config.debugFlags || [];
const debugLogFileThreshold = 10;

const noop = () => {
};

window.$C = {
    USERNAME: 'admin',
    BUILD_NUMBER: 76838,
    BUILD_PUSH_NUMBER: 0,
    DEFAULT_NAMESPACE: 'search',
    DISPATCH_TIME_FORMAT: '%s.%Q',
    FLASH_MAJOR_VERSION: 9,
    FLASH_MINOR_VERSION: 0,
    FLASH_REVISION_VERSION: 124,
    JS_LOGGER_MODE: 'Firebug',
    JS_LOGGER_MODE_SERVER_END_POINT: 'util/log/js',
    JS_LOGGER_MODE_SERVER_MAX_BUFFER: 100,
    JS_LOGGER_MODE_SERVER_POLL_BUFFER: 1000,
    LOCALE: 'en-US',
    MRSPARKLE_PORT_NUMBER: 8000,
    MRSPARKLE_ROOT_PATH: '',
    NOCACHE: false,
    SPLUNKD_PATH: '/en-US/splunkd/__raw',
    SEARCH_RESULTS_TIME_FORMAT: '%Y-%m-%dT%H:%M:%S.%Q%z',
    SERVER_TIMEZONE_OFFSET: 25200,
    SERVER_ZONEINFO: '### SERIALIZED TIMEZONE FORMAT 1.0;Y-25200 YW 50 44 54;Y-28800 NW 50 53 54;Y-25200 YW 50 57 54;Y-25200 YG 50 50 54;@-1633269600 0;@-1615129200 1;@-1601820000 0;@-1583679600 1;@-880207200 2;@-769395600 3;@-765385200 1;@-687967200 0;@-662655600 1;@-620834400 0;@-608137200 1;@-589384800 0;@-576082800 1;@-557935200 0;@-544633200 1;@-526485600 0;@-513183600 1;@-495036000 0;@-481734000 1;@-463586400 0;@-450284400 1;@-431532000 0;@-418230000 1;@-400082400 0;@-386780400 1;@-368632800 0;@-355330800 1;@-337183200 0;@-323881200 1;@-305733600 0;@-292431600 1;@-273679200 0;@-260982000 1;@-242229600 0;@-226508400 1;@-210780000 0;@-195058800 1;@-179330400 0;@-163609200 1;@-147880800 0;@-131554800 1;@-116431200 0;@-100105200 1;@-84376800 0;@-68655600 1;@-52927200 0;@-37206000 1;@-21477600 0;@-5756400 1;@9972000 0;@25693200 1;@41421600 0;@57747600 1;@73476000 0;@89197200 1;@104925600 0;@120646800 1;@126698400 0;@152096400 1;@162381600 0;@183546000 1;@199274400 0;@215600400 1;@230724000 0;@247050000 1;@262778400 0;@278499600 1;@294228000 0;@309949200 1;@325677600 0;@341398800 1;@357127200 0;@372848400 1;@388576800 0;@404902800 1;@420026400 0;@436352400 1;@452080800 0;@467802000 1;@483530400 0;@499251600 1;@514980000 0;@530701200 1;@544615200 0;@562150800 1;@576064800 0;@594205200 1;@607514400 0;@625654800 1;@638964000 0;@657104400 1;@671018400 0;@688554000 1;@702468000 0;@720003600 1;@733917600 0;@752058000 1;@765367200 0;@783507600 1;@796816800 0;@814957200 1;@828871200 0;@846406800 1;@860320800 0;@877856400 1;@891770400 0;@909306000 1;@923220000 0;@941360400 1;@954669600 0;@972810000 1;@986119200 0;@1004259600 1;@1018173600 0;@1035709200 1;@1049623200 0;@1067158800 1;@1081072800 0;@1099213200 1;@1112522400 0;@1130662800 1;@1143972000 0;@1162112400 1;@1173607200 0;@1194166800 1;@1205056800 0;@1225616400 1;@1236506400 0;@1257066000 1;@1268560800 0;@1289120400 1;@1300010400 0;@1320570000 1;@1331460000 0;@1352019600 1;@1362909600 0;@1383469200 1;@1394359200 0;@1414918800 1;@1425808800 0;@1446368400 1;@1457863200 0;@1478422800 1;@1489312800 0;@1509872400 1;@1520762400 0;@1541322000 1;@1552212000 0;@1572771600 1;@1583661600 0;@1604221200 1;@1615716000 0;@1636275600 1;@1647165600 0;@1667725200 1;@1678615200 0;@1699174800 1;@1710064800 0;@1730624400 1;@1741514400 0;@1762074000 1;@1772964000 0;@1793523600 1;@1805018400 0;@1825578000 1;@1836468000 0;@1857027600 1;@1867917600 0;@1888477200 1;@1899367200 0;@1919926800 1;@1930816800 0;@1951376400 1;@1962871200 0;@1983430800 1;@1994320800 0;@2014880400 1;@2025770400 0;@2046330000 1;@2057220000 0;@2077779600 1;@2088669600 0;@2109229200 1;@2120119200 0;@2140678800 1;$', // eslint-disable-line max-len
    SPLUNKD_FREE_LICENSE: false,
    SPLUNKD_SESSION_KEY: '57c402b171cbf4a4b96c1d235ff98d1a',
    SYSTEM_NAMESPACE: 'system',
    UI_INACTIVITY_TIMEOUT: 60,
    UI_UNIX_START_TIME: 1268701228,
    VERSION_LABEL: '4.1',
    FORM_KEY: '15938876867373032169',
    ENABLE_PIVOT_ADHOC_ACCELERATION: true,
    JSCHART_TRUNCATION_LIMIT: null,
    JSCHART_TRUNCATION_LIMIT_CHROME: 20000,
    JSCHART_TRUNCATION_LIMIT_FIREFOX: 20000,
    JSCHART_TRUNCATION_LIMIT_IE7: 2000,
    JSCHART_TRUNCATION_LIMIT_IE8: 2000,
    JSCHART_TRUNCATION_LIMIT_IE9: 20000,
    JSCHART_TRUNCATION_LIMIT_IE10: 20000,
    JSCHART_TRUNCATION_LIMIT_IE11: 20000,
    JSCHART_TRUNCATION_LIMIT_SAFARI: 20000,
    ENABLE_RISKY_COMMAND_CHECK: true,
    DASHBOARD_HTML_ALLOW_INLINE_STYLES: true,
};
delete require.cache['stubs/splunk.config'];

// how log levels are matched (log.log is treated as INFO due to commonness):
const karmaLevels = ['OFF', 'ERROR', 'WARN', 'INFO', 'INFO', 'DEBUG'];
const consoleLevels = [null, 'error', 'warn', 'log', 'info', 'debug'];

// build a logger that respects karma's active log level - browserConsoleLogOptions doesn't (yet)
if (_.has(window.__karma__, 'log')) {
    const karmaLevelIndex = karmaLevels.lastIndexOf(config.logLevel);
    for (let i = 1; i < consoleLevels.length; i++) {
        const finalLevel = i > karmaLevelIndex ? 'OFF' : karmaLevels[i];
        window.console[consoleLevels[i]] = finalLevel === 'OFF' ? noop : (...args) => {
            window.__karma__.log(finalLevel, args);
        };
    }
}
const log = window.console;

// karma passes all loaded files, extract test files and split by app name
const testFiles = {};
const testRegexp = new RegExp(config.testRegexp, 'i');
Object.keys(window.__karma__.files)
    .filter(file => testRegexp.test(file))
    .forEach(file => {
        const re = testRegexp.exec(file);
        (testFiles[re[1]] = testFiles[re[1]] || []).push(`${re[1]}/${re[2]}`);
    });
const apps = Object.keys(testFiles || {});

// lie about being a touch browser - PhantomJS does this by default
document.documentElement.ontouchstart = noop;


// start the two-step loading process:
// first, utilities are loaded, and any preparations that need to be done before test files are
// required are executed (such as loading test application hooks)
// then, all test files are required and handed over to the test runner

// transfer test helpers to window, apply a minor patch to Mocha
testHelpers.activate();

// load per-app configuration (hooks)
helpers.loadAppConfiguration(apps, () => {
    // Webpack and corejs_test tests:
    // Quite a few of our tests mock certain modules by defining them before they're loaded,
    // essentially relying on webpack's cache mechanism to provide the mocked version instead of
    // loading the actual source file. In a scenario where only a single test file is ever loaded,
    // this is fine, but now that multiple tests have to coexist, this causes clashes: What if a
    // test defines something that breaks another test? To isolate tests properly, all loaded
    // modules are removed from webpack's cache after every single test file. The modules are
    // inserted back into the cache before tests from this test file are executed.
    // Compared to the previous (RequireJS-based) implementation, request.cache is official,
    // documented API.

    // Hooks and helpers have already loaded a few files - this is the initial set, and its modules
    // are never removed from the cache because hooks might have modified them. However, a few
    // special cases require manual cleaning if testing apps are combined, which might cause
    // problems down the line.

    _.each([
        // for corejs_test/models/test_config, if splunkjs_test is also active
        'models/config',
        // coexistence corejs_test tests and splunkjs_test jobtracker setup hook
        'models/Base', 'models/search/Job', 'validation/ValidationMixin',
        // for corejs_test require/test_jquery_2_1_0
        // 'contrib/jquery-2.1.0'
    ], modName => {
        delete require.cache[modName];
    });

    const savedModules = {};
    const initialModules = Object.keys(require.cache);

    // a few modules really don't like being loaded multiple times, exclude them
    const blacklist = [
        // because document.registerElement doesn't support multiple calls
        /webcomponents\/forminputs\/Splunk.*/,
    ].concat(initialModules);

    function undefineModules(testPath) {
        let definedModules = Object.keys(require.cache);
        if (!_.isEmpty(definedModules)) {
            const willUndefine = _.reject(definedModules, modName =>
                _.some(blacklist, b => (_.isRegExp(b) ? b.test(modName) : b === modName))
            );

            savedModules[testPath] = _.pick(require.cache, willUndefine);
            _.each(willUndefine, mod => {
                delete require.cache[mod];
            });
            definedModules = _.intersection(definedModules, blacklist);
        }
    }

    // for each app, execute single require calls for each test files

    const mochaSuite = suite;
    const tests = {};

    // iterates over apps loading a single app each, moving them to 'tests'
    function loadAppTests(done) {
        const app = apps.shift();
        let fileCount;

        // iterates over testFiles for the current app, loading a single test
        // each step, moving it to tests[app]
        function loadNextTest() {
            const file = testFiles[app].shift();
            if (file) {
                let testSuites = [];
                const testName = file.substr(app.length + 1);

                // override mocha's suite to capture suite calls in test files
                // we'll add custom pre/post file handlers later on before
                // calling the original suite function
                suite = (...args) => {
                    testSuites.push(args);
                };

                // get rid of 'backbone history already started' errors
                helpers.clearBackbone();

                helpers.callHooks(app, 'loadFileSetup');

                const testLoadDone = () => {
                    tests[app].push([file.substr(app.length + 1), testSuites]);

                    undefineModules(`${app}/${testName}`);
                    loadNextTest();
                };

                const testLoadError = err => {
                    window.onerror(err);
                    testLoadDone();
                };

                window.onerror = err => {
                    window.onerror = null;

                    log.warn(`Error during test file loading: ${file}`);
                    if (window.dump) {
                        dump(err); // eslint-disable-line no-undef
                    }

                    testSuites = helpers.requireFailureTest(testName, err);
                };

                const progress = `progress ${Math.round((tests[app].length / fileCount) * 100)}%`;
                const testSrc = `/webpack/${app}/${testName}-bundle.js`;
                const logLevel = fileCount >= debugLogFileThreshold ? 'info' : 'debug';
                log[logLevel](`Loading: ${file} - ${progress}`);

                const testScript = document.createElement('script');
                testScript.setAttribute('src', testSrc);
                testScript.addEventListener('load', testLoadDone);
                testScript.addEventListener('error', testLoadError);
                document.body.appendChild(testScript);
            } else {
                log.debug(`Loaded tests for app: ${app}, count: ${tests[app].length}`);

                loadAppTests(done);
            }
        }

        if (app) {
            // ensure tests are sorted (reproducibility)
            testFiles[app].sort();
            fileCount = testFiles[app].length;

            helpers.callHooks(app, 'loadSetup');

            tests[app] = [];
            loadNextTest();
        } else {
            suite = mochaSuite;

            log.debug('All tests loaded, starting execution');
            done();
        }
    }

    function runTests() {
        function restoreModules(app, file) {
            // it's not necessary to remove all modules from the cache - we're replacing the
            // 'current' versions (of all modules that the current test is using) anyway

            const testPath = `${app}/${file}`;
            _.extend(require.cache, savedModules[testPath]);
            delete savedModules[testPath];
        }

        const nativeAssert = assert;
        const timings = {};

        _.each(tests, (appTests, app) => {
            timings[app] = {};

            /* eslint-disable prefer-arrow-callback, func-names */
            mochaSuite(app, function () {
                suiteSetup(_.partial(helpers.callHooks, app, 'appSetup'));
                suiteTeardown(_.partial(helpers.callHooks, app, 'appTeardown'));

                _.each(appTests, testSuites => {
                    mochaSuite(testSuites[0], function () {
                        setup(function () {
                            helpers.callHooks(app, 'testSetup');
                            if (_.isFunction(assert.resetCallCount)) {
                                assert.resetCallCount();
                            }
                        });

                        teardown(function () {
                            helpers.callHooks(app, 'testTeardown');
                            if (_.isFunction(assert.getCallCounts)
                                && assert.getCallCounts().current === 0) {
                                log.warn('Zero assert calls in test', this.currentTest.title);
                            }
                        });

                        suiteSetup(function () {
                            restoreModules(app, testSuites[0]);
                            timings[app][testSuites[0]] = performance.now();

                            helpers.callHooks(app, 'fileSetup', testSuites[0]);
                        });

                        suiteTeardown(function () {
                            helpers.callHooks(app, 'fileTeardown', testSuites[0]);
                            timings[app][testSuites[0]] =
                                Math.round(performance.now() - timings[app][testSuites[0]]);
                        });

                        _.each(testSuites[1], savedSuite => {
                            mochaSuite.apply(this, savedSuite);
                        });
                    });
                });
            });
            /* eslint-enable prefer-arrow-callback, func-names */
        });

        // remove all styles loaded by tests, except mocha.css (debug mode)
        suiteSetup(function () { // eslint-disable-line prefer-arrow-callback, func-names
            this.timeout(30 * 1000);

            for (let i = 0; i < document.styleSheets.length; i++) {
                const sheet = document.styleSheets[i];
                if (!(_.isString(sheet.href) && sheet.href.indexOf('mocha/mocha.css') !== -1)) {
                    $(sheet.ownerNode).remove();
                    i--;
                }
            }
        });

        // ensure no test added root suites/tests (test calls without wrapping suites,
        // runtime suite calls)
        helpers.removeRootTests(mocha.suite, Object.keys(tests));

        // if enabled, instruct mocha to tell us about global leaks
        if (_.contains(debugFlags, 'globals')) {
            // but exclude some common functions which our tests occasionally stub/restore
            // https://github.com/sinonjs/sinon/issues/143
            log.info('Enabling global leak detection');
            mocha.globals(['open', 'getSelection']);
            mocha.checkLeaks();
        }

        // if enabled, print a tree of all loaded test suites
        if (_.contains(debugFlags, 'suites')) {
            helpers.printSuiteTitles(mocha.suite);
        }

        if (_.contains(debugFlags, 'assertCount')) {
            if (!_.has(window, 'Proxy')) {
                log.warn('Browser doesn\'t support Proxy, not enabling assertion counting');
            } else {
                log.info('Enabling assertion counting');
                assert = new Proxy(nativeAssert, new helpers.AssertProxy());
                suiteTeardown(function () { // eslint-disable-line prefer-arrow-callback, func-names
                    log.info('Total assertion count:', assert.getCallCounts().total);
                });
            }
        }

        // send performance results back to Karma server
        suiteTeardown(function () { // eslint-disable-line prefer-arrow-callback, func-names
            window.__karma__.info({ splunk: 'timings', timings });
        });

        // kick-off time!
        window.__karma__.start();
    }

    loadAppTests(runTests);
});
