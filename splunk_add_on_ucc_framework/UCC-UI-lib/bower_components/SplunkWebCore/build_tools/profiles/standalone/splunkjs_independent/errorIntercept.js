//Previously this was part of splunkjs/preload, and was enabled using
//require.config - we now replace splunk.error during (webpack) compilation

// splunk.error is a legacy module which ignores JS_LOGGER_MODE = None
// and always patches window.onerror to log to the splunk server
// However, in this context, the splunkweb server is not available. 
// In order to re-patch window.onerror not to log to the server,
// this intercepts imports of splunk.error and patches the window's
// error handler to do nothing. 

define(function () {
    // Repatch window.onerror to override patch by error.js (splunk.error)
    window.onerror = function (e) {
        // Ignore errors similarly to JS_LOGGER_MODE = None

        // This is for test use only. If the test sets up an
        // error function on window, we call it.
        if (window._SPLUNK_TEST_ERROR) {
            window._SPLUNK_TEST_ERROR();
        }
    };
    return {};
});