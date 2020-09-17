define(function(require, exports, module) {
    var splunkUtils = require("splunk.util");

    function enableCSRFProtection($) {
        // Most of this code is taken verbatim from Django docs:
        // https://docs.djangoproject.com/en/dev/ref/contrib/csrf/

        // Add CSRF info
        function csrfSafeMethod(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }

        var djangoPort = splunkUtils.getConfigValue('DJANGO_PORT_NUMBER', null);
        var splunkwebPort = splunkUtils.getConfigValue('MRSPARKLE_PORT_NUMBER');
        var csrfCookiePort = splunkUtils.getConfigValue('CSRFCOOKIE_PORT', djangoPort);
        var portNumber = csrfCookiePort || splunkwebPort;
        var cookieName = "django_csrftoken_" + portNumber;
        var djangoCookie = splunkUtils.getCookie(cookieName);
        var splunkwebCookie = splunkUtils.getFormKey();

        $.ajaxPrefilter(function(options, originalOptions, xhr) {
            if (!options.hasOwnProperty("crossDomain")) {
                options.crossDomain = false;
            }

            var type = options["type"] || "";
            if (!csrfSafeMethod(type)) {
                if (djangoCookie) {
                    xhr.setRequestHeader("X-CSRFToken", djangoCookie);
                }
                if (splunkwebCookie) {
                    xhr.setRequestHeader("X-Splunk-Form-Key", splunkwebCookie);
                }
            }
        });
    }

    function enableUnauthorizationRedirection($, loginURL, logoutURL) {
        $(document).bind('ajaxError', function(ev, xhr, opts, err) {
            var pathname = window.location.pathname;

            if (xhr.status === 401 && pathname.indexOf(logoutURL) === -1) {
                var returnTo = encodeURIComponent(pathname + document.location.search);
                document.location = loginURL + "?return_to=" + returnTo;
            }
        });
    }

    return {
        enableCSRFProtection: enableCSRFProtection,
        enableUnauthorizationRedirection: enableUnauthorizationRedirection
    };
});
