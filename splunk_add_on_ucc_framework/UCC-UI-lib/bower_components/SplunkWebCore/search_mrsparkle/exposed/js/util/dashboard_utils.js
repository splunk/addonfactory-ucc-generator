/**
 * utility class that used in dashboard rendering
 */
define([
    'jquery',
    'underscore',
    'splunk.config',
    'util/general_utils'
], function($, _, SplunkConfig, GeneralUtils) {
    return {
        /**
         * Get app and source out of a string
         * Example Usage:
         * 'myapp:file','defaultApp'  -> {app:'myapp',src:'file'}
         * 'file','defaultApp'  -> {app:'defaultApp',src:'file'}
         * 'myapp:folder/file.js'  -> {app:'myapp',src:'folder/file.js'}
         * 'myapp:file:others'  -> {app:'myapp',src:'file:others'}
         */
        getAppAndSource: function(path, defaultApp) {
            var ret = {
                app: defaultApp
            };
            if (_.isString(path)) {
                var parts = path.split(':');
                if (parts.length === 1) {
                    ret.src = parts[0];
                }
                else if (parts.length === 2) {
                    ret.app = parts[0];
                    ret.src = parts.slice(1).join(':');
                }
            }
            return ret;
        },

        /**
         * Determine whether inline stylesheets are allowed for inline HTML elements in dashboards. This is determined
         * by examining the splunk.config ($C) from the server
         * @returns {Boolean} true if inline stylesheets are allowed, otherwise false
         */
        allowInlineStyles: function() {
            return GeneralUtils.normalizeBoolean(SplunkConfig['DASHBOARD_HTML_ALLOW_INLINE_STYLES'], {"default": true});
        }
    };
});