/**
 * splunk.jquery.csrf_protection.js
 * (c) Splunk Inc. 2009
 *
 * Purpose:
 * This helps prevent malicious cross site reference forgery attacks in xhr requests.
 *
 * Request:
 * Adds the current session ID to the X-Splunk-Session header which is screened for by
 * the application server on POST requests.
 *
 * Response:
 * Handles HTTP 401 responses originating from the appserver.  This response
 * code is sent when the appserver is no longer correctly logged in or when the request
 * does not pass a valid X-Splunk-Session key.  Assumption is to redirect the user to a
 * login page or prompt them to log in.
 *
 * Dependencies:
 * jquery.cookie plugin.
 *
 * Evolution notes:
 * This functionality was originally implemented as a closure around the original jQuery
 * ajax function in an attempt to force CSRF protection on all POST requests. The global
 * ajax events jQuery dispatches were ignored because they can be shutoff by passing in
 * "global: false" in the $.ajax method's options.  However that method did not work correctly
 * under certain circumstances because jQuery internally uses setTimeout to change the
 * order of the operations stack. A potential solution was discovered that required the
 * closure around the original ajax method in this file also be wrapped in a setTimeout
 * call. That fix seemed too brittle, while the use of the global ajax event seemed to
 * be more managable.
 *
 * This method comes with one caveat, the listeners are bound on $(document).ready. This
 * is currently not an issue because init.js only begins to operate after the entire document
 * is loaded, but if for some reason in the future an xhr request is dispatched before the
 * document is loaded CSRF protection may be circumvented.
 *
 * Jquery 1.6.2 update: added ajaxPrefilter() method (available since 1.5) to handle the
 * header injection.
 *
 */

$(function(){
   
    var HEADER_NAME = 'X-Splunk-Form-Key';
    var FORM_KEY = Splunk.util.getFormKey();

    // If the form key is not present, return without 
    // setting up the prefilter. Return instead of throwing
    // because there are some scenarios (Independent Mode)
    // where this is the expected behavior.
    if (!FORM_KEY) {
        return;
    }

    if (jQuery && jQuery.cookie) {
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
                    document.location = Splunk.util.make_url('account/login?return_to=' + encodeURIComponent(pathname + document.location.search));
                    return;
                }
            });
        });
    } else {
        throw "Splunk's jQuery.ajax extension requires jQuery and the jQuery.cookie plugin.";   
    }

});
