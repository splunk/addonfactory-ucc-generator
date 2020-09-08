define([
            'jquery',
            'underscore',
            'splunk.logger',
            'splunk.util'
        ],
        function(
            $,
            _,
            SplunkLogger,
            splunkUtils
        ) {

    var LOG_MODE = splunkUtils.getConfigValue("JS_LOGGER_MODE", "None"),
        LOG_LEVEL = splunkUtils.getConfigValue("JS_LOGGER_LEVEL", "INFO");

    // only need to attach an ajaxPrefilter handler if the logger type and log level indicate it is needed
    if(LOG_MODE !== 'None' && LOG_LEVEL === 'DEBUG') {
        var logger = SplunkLogger.getLogger('ajax_logging.js');

        // black-list of AJAX URLs that should not be logged
        var URL_BLACKLIST = [
            SplunkLogger.mode.Server.END_POINT,
            'services/messages'
        ];

        $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
            var passesBlacklist = _(URL_BLACKLIST).every(function(blacklistUrl) {
                return options.url.indexOf(blacklistUrl) === -1;
            });
            if(passesBlacklist) {
                logger.debug('sending AJAX request to ', options.url);
                logger.trace();
            }
        });
    }

});