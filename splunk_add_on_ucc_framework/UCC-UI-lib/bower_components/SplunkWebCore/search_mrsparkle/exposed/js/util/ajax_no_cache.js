/* Insert a jQuery ajax prefilter that sets options.cache=false for all GET requests
 * This is a preventative measure to avoid an intermittent bug in Chrome 28 (see SPL-71743)
 */ 

define(
    [
        'jquery'
    ],
    function($) {
        if ($) {
            $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
                if (options.type && options.type.toUpperCase() == 'GET' && options.cache === undefined) {
                    options.cache = false;
                }
            });

        } else {
            throw "ajax_no_cache requires jQuery.";   
        }
    }
);
