var _ = require('lodash');
var istanbul = require('istanbul');

var log = require('./child-log');

var instrumenter = new istanbul.Instrumenter();
var preventPattern = /.*\/(contrib|stub|mocks|shim)\/.*/;

/**
 * A webpack loader that uses istanbul to instrument a module's source code if
 * its name matches the currently active coverage pattern set. Certain files
 * are excluded from coverage (stubs, mocks, ...)
 *
 * This only works for ES5 files. For ES6, see es6-coverage-instrumenter-plugin
 *
 * @param source - module source code
 * @returns - instrumented or unmodified module source code
 */
module.exports = function (source) {
    var resource = this.resource;
    this.cacheable();

    var included = _.some(this.options.unitTesting.coveragePatterns, function (pattern) {
        return new RegExp(pattern).test(resource);
    });

    included = included && !preventPattern.test(resource);

    if (included) {
        log.info('ES5-Instrumenting', resource);
        //an async version of this function exists but is not public API
        return instrumenter.instrumentSync(source, resource);
    } else {
        log.debug('Not ES5-instrumenting', resource);
        return source;
    }
};