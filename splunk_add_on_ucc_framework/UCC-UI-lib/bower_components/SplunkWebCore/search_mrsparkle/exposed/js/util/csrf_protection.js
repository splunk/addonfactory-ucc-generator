define(
    [
        'jquery',
        'splunk.util'
    ],
    function($, splunkUtils) {
        var HEADER_NAME = 'X-Splunk-Form-Key';
        var FORM_KEY = splunkUtils.getFormKey();

        // If the form key is not present, return without 
        // setting up the prefilter. Return instead of throwing
        // because there are some scenarios (Independent Mode)
        // where this is the expected behavior.
        if (!FORM_KEY) {
            return;
        }

        if ($) {
            $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
                if (options['type'] && options['type'].toUpperCase() == 'GET') return;
                jqXHR.setRequestHeader(HEADER_NAME, FORM_KEY);
            });

            $(document).ready(function() {
                $(document).bind('ajaxError', function(event, xhr, opts, err) {
                    // because we'll get a 401 when logout is clicked, prevent 
                    // /en-US/account/login?return_to=/en-US/account/logout from happening
                    var pathname = window.location.pathname;
                    if (xhr.status === 401 && pathname.indexOf('/account/logout') === -1) {
                        document.location = splunkUtils.make_url('account/login?return_to=' + encodeURIComponent(pathname + document.location.search));
                        return;
                    }
                });
            });
        } else {
            throw "Splunk's jQuery.ajax extension requires jQuery.";   
        }
    }
);
