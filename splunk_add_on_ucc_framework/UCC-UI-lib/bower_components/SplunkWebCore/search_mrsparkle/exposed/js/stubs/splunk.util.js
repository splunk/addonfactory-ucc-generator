define(['jquery', 'splunk', 'splunk.config'], function($, Splunk, config) {
    return $.extend({ sprintf: window.sprintf }, window.Splunk.util);
});