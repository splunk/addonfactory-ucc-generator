var _ = require('lodash');

/**
 * A fake Karma-compatible logger that forwards to the actual logger instance.
 * Intended to be used by forked node processes. Also see: webpack-plugin.js
 */
module.exports = _.transform(['debug', 'info', 'warn', 'error'], function (log, level) {
    log[level] = function () {
        process.send({log: [level].concat(_.toArray(arguments))});
    };
}, {});