define(['underscore'], function (_) {
    var mochaSuite = suite; //capture Mocha's global suite function

    function mockModules(list_of_module_locations, mock_location) {
        //webpack transforms calls to this helper at define-time
        console.warn('Calling this function at runtime is deprecated');
    }

    //QUnit copies additional properties to the test context - simulate this behavior
    // signature is typically 'util, hooks', but might be 'util, util, hooks', hooks are optional
    function enableUtil() {
        var args = [{}].concat(_.toArray(arguments));
        var utilInstance = _.extend.apply(_, args);

        suiteSetup(function () {
            var that = this;

            Object.keys(utilInstance)
                .filter(function (key) {
                    return !_.contains(['setup', 'teardown', 'suiteSetup', 'suiteTeardown'], key);
                })
                .forEach(function (key) {
                    that[key] = utilInstance[key];
                });
        });

        if (utilInstance.suiteSetup) {
            suiteSetup(utilInstance.suiteSetup);
        }

        if (utilInstance.suiteTeardown) {
            suiteTeardown(utilInstance.suiteTeardown);
        }

        if (utilInstance.setup) {
            setup(utilInstance.setup);
        }

        if (utilInstance.teardown) {
            teardown(utilInstance.teardown);
        }
    }

    //tell PhantomJS to save a screenshot - also see karma.conf.js, where the call is handled
    function phantomJsScreenshot() {
        //silently ignore screenshot requests if the current browser isn't PhantomJS
        if (_.isUndefined(window.top.callPhantom)) {
            return;
        }
        
        window.top.callPhantom({name: 'screenshot'});
    }

    //this is the only patch we apply to Mocha – it's idempotent and doesn't change the signature, so
    // should be fairly future-proof. Strictly speaking it's optional, but it prevents broken classname
    // attributes in XML output if empty suite titles are used
    function mochaSuitePatch() {
        return function () {
            var args = _.toArray(arguments);

            //ensure proper classname attributes in XML output (Mocha idiosyncrasy)
            if (args[0] === '') {
                console.warn('empty suite name detected, replacing');
                args[0] = 'Untitled';
            }

            return mochaSuite.apply(this, args);
        };
    }

    function activate() {
        window.mockModuleLocationsGen = mockModules;
        window.util = enableUtil;
        window.screenshot = phantomJsScreenshot;
        window.suite = mochaSuitePatch();
    }

    return {activate: activate};
});
