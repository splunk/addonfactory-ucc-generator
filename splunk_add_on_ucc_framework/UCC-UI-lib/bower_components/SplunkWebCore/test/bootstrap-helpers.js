define(['underscore', 'backbone', 'virtual-module?ns=testing&id=hooksLoader!virtual-module-template'],
    function (_, Backbone, hooksBuilder) {

        var hooks;
        var mochaTest = test; //capture Mocha's global test function

        //ignoring a require error during test loading results in a reduced total test count
        //to cause upstream visibility, insert a fake always-failing test instead
        function requireFailureTest(test, err) {

            var testDesc = 'Test ' + test;
            var testError = err ? (err.message ? err.message : err.toString()) : 'unknown';
            var testFn = function () {
                assert.fail(null, null, testDesc + ' failed during script load, ' +
                    'with error message: ' + testError);
            };

            //suite call arguments
            return [[testDesc, function () {
                mochaTest('require', testFn);
            }]];
        }

        //print suite titles, indented
        function printSuiteTitles(suite, level, lines) {

            level = _.isUndefined(level) ? 0 : level;
            lines = _.isUndefined(lines) ? ['\nTest suite structure:\n'] : lines;

            var line = _.isEmpty(suite.title) ? '<untitled>' : suite.title;
            line += ' (' + suite.tests.length + ')';
            for (var i = 0; i < level; i++) {
                line = '  ' + line;
            }
            lines.push(line);

            _.each(suite.suites, function (s) {
                printSuiteTitles(s, i + 1, lines);
            });

            if (level == 0) {
                console.log(lines.join('\n'));
            }
        }

        //removes any suites/tests added to the root
        function removeRootTests(suite, apps) {
            suite.tests = _.filter(suite.tests, function (t) {
                console.warn('removing test from root suite: ', t.title);
                return false;
            });

            suite.suites = _.filter(suite.suites, function (s) {
                if (!_.contains(apps, s.title)) {
                    console.warn('removing suite from root suite: ', s.title);
                    return false;
                }
                return true;
            });
        }

        //loads app-specific configuration, such as hooks
        function loadAppConfiguration(apps, done) {

            hooks = {};
            _.each(apps, function (app) {
                hooks[app] = {};
            });

            var hooksLoader = hooksBuilder(function (allHooks) {
                _.each(allHooks, function (appHooks) {
                    _.each(appHooks.hooks, function (h) {
                        h.callCounter = 0;
                    });
                    hooks[appHooks.app] = appHooks.hooks;
                });
            });

            //build one promise that resolves after everything was loaded
            var configurations = [hooksLoader];

            Promise.all(configurations).then(done);
        }

        function callHooks(app, hookName, param) {
            if (hooks[app][hookName]) {
                hooks[app][hookName](param);
                hooks[app][hookName].callCounter++;
            }
        }

        function clearBackbone() {
            if (Backbone.History.started) {
                Backbone.history.stop();
            }
        }

        var AssertProxy = function () {
            var callCount = 0, totalCallCount = 0;

            var returnCounts = function () {
                return {
                    current: callCount, total: totalCallCount
                };
            };

            var resetCount = function () {
                callCount = 0;
            };

            this.get = function (target, name) {
                if (name == 'getCallCounts') {
                    return returnCounts;
                } else if (name == 'resetCallCount') {
                    return resetCount;
                } else {
                    callCount++;
                    totalCallCount++;
                    return target[name];
                }
            };
        };

        return {
            requireFailureTest: requireFailureTest,
            printSuiteTitles: printSuiteTitles,
            loadAppConfiguration: loadAppConfiguration,
            clearBackbone: clearBackbone,
            removeRootTests: removeRootTests,
            callHooks: callHooks,
            AssertProxy: AssertProxy
        };
    });
