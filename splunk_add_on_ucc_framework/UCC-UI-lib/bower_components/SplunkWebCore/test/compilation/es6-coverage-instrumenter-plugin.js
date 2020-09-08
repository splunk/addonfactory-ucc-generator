var _ = require('lodash');
var fs = require('fs');
var istanbulInstrument = require('istanbul-lib-instrument');

var log = require('./child-log');

var preventPattern = /.*\/(contrib|stub|mocks|shim)\/.*/;

/**
 * Based on istanbuljs/babel-plugin-istanbul - uses its own exclusion mechanism
 *
 * A Babel plugin that uses istanbul to instrument a module's source code if
 * its name matches the currently active coverage pattern set. Certain files
 * are excluded from coverage (stubs, mocks, ...)
 *
 * @param config - Active Babel config
 * @returns - A Babel visitor forwarding to istanbul, if current file isn't excluded
 */
module.exports = function (config) {
    var t = config.types;

    return {
        visitor: {
            Program: {
                enter: function (path) {
                    this.__dv__ = null;
                    var realPath = getRealpath(this.file.opts.filename);
                    if (shouldInstrument(realPath, this.opts)) {
                        log.info('ES6-Instrumenting', realPath);
                        this.__dv__ = istanbulInstrument.programVisitor(t, realPath);
                        this.__dv__.enter(path);
                    } else {
                        log.debug('Not ES6-instrumenting', realPath);
                    }
                },
                exit: function (path) {
                    if (!this.__dv__) {
                        return;
                    }
                    this.__dv__.exit(path);
                }
            }
        }
    };
};

function shouldInstrument(file, opts) {
    var included = _.some(opts.coverageSourcePaths, function (sourcePath) {
        return _.startsWith(file, sourcePath);
    });

    included = included && _.some(opts.coveragePatterns, function (pattern) {
            return new RegExp(pattern).test(file);
        });

    return included && !preventPattern.test(file);
}

function getRealpath(n) {
    try {
        return fs.realpathSync(n) || n;
    } catch (e) {
        return n;
    }
}
