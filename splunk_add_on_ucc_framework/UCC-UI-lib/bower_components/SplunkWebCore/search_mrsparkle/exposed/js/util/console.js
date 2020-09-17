define([
            'jquery',
            'underscore',
            'util/console_dev',
            'splunk.logger',
            'splunk.util'
        ],
        function(
            $,
            _,
            devConsole,
            SplunkLogger,
            splunkUtils
        ) {

    var LOG_MODE = splunkUtils.getConfigValue("JS_LOGGER_MODE", "None"),
        LOG_LEVEL = splunkUtils.getConfigValue("JS_LOGGER_LEVEL", "INFO"),
        EMPTY = function() { };

    if(LOG_MODE === 'Firebug') {
        // if Function.prototype.bind is supported natively, we can use it to properly respect log levels
        // if not, it would result in log statements having incorrect source file names, so don't do it
        if(typeof devConsole.log.bind === 'function' && devConsole.log.bind.toString().indexOf('native code') > -1) {
            return ({
                trace: LOG_LEVEL === 'DEBUG' ? devConsole.trace.bind(devConsole) : EMPTY,
                debug: LOG_LEVEL === 'DEBUG' ? devConsole.debug.bind(devConsole) : EMPTY,
                log: LOG_LEVEL in { INFO: true, DEBUG: true } ? devConsole.log.bind(devConsole) : EMPTY,
                info: LOG_LEVEL in { INFO: true, DEBUG: true } ? devConsole.info.bind(devConsole) : EMPTY,
                warn: LOG_LEVEL !== 'ERROR' ? devConsole.warn.bind(devConsole) : EMPTY,
                error: devConsole.error.bind(devConsole)
            });
        }
        return devConsole;
    }
    return SplunkLogger.getLogger(splunkUtils.getConfigValue('USERNAME', '') + ':::' + window.location.href);

});