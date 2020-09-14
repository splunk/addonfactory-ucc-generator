// preload.js is executed immediately when splunkjs/config is required
// when the framework is run in a compiled mode.
// 
// JIRA: Make splunkjs.config() available even when running in splunkweb
//       with use_built_files:false. (DVPL-3551)

// Create splunkjs global
if (!window.splunkjs) {
    window.splunkjs = {};
}

(function() {

    /**
     * Configures the SplunkJS Stack.
     * 
     * Accepts a dictionary with the following keys:
     *  - proxyPath:
     *      Absolute URL path of the server-side proxy to splunkd.
     *      If omitted, no proxy will be used to communicate with splunkd.
     *      Instead, splunkd will be directly accessed via CORS at <scheme>://<host>:<port>/.
     *  - scheme:
     *      Scheme of the splunkd server to connect to. Either 'https' or 'http'.
     *      Default: 'https'
     *  - host:
     *      Hostname of the splunkd server to connect to.
     *      Default: 'localhost'
     *  - port:
     *      Port of the splunkd server to connect to.
     *      Default: 8089
     *  - authenticate:
     *      Either (1) a function of signature `(done)` that logs in to splunkd and
     *                 then invokes the callback `done`. The signature of `done` is
     *                 `(err, {sessionKey: <key>, username: <username>})`. A falsy 
                       `err` is interpreted as success.
     *          or (2) a dictionary of {username: 'admin', password: 'changeme'}
     *      If a dictionary is passed, an default authentication function will be
     *      generated internally.
     *      Required. Example: {username: 'admin', password: 'changeme'}
     *  - onSessionExpired:
     *      A function of signature `(authFunction, done)` that will be called upon session
     *      timeout. The original authenticate function (possibly generated) is passed as `authFunction`
     *      Default: if no onSessionExpired is provided, the original authenticate will be used.      
     *  - app:
     *      Default app in which Splunk entities will be accessed.
     *      Default: 'search'
     *  - locale:
     *      Language code for the locale in which the UI should be displayed.
     *      Default: 'en-us'
     *  - freeLicense:
     *      Whether Splunk is using the free license.
     *      Default: false
     *  - onDrilldown:
     *      A function of signature `(params, newWindow)` that will be called as the
     *      default drilldown action for controls. `params` are the parameters to
     *      send to the target view. `newWindow` is whether to open the target view
     *      in a new window.
     *      Default: no-op
     *  - custom:
     *      Accepts additional keys. Only use this if instructed by Splunk Support.
     */
    window.splunkjs.config = function(params) {
        
        if (!params.authenticate) {
            throw new Error('splunkjs.config: Missing required key: authenticate');
        }

        if (params.onSessionExpired && (typeof(params.onSessionExpired) !== "function")) {
            throw new Error("splunkjs.config: Must be a function: onSessionExpired");  
        }

        // This path is used if there is no proxyPath set
        var splunkdPath = (params.scheme || 'https') 
            + '://' 
            + (params.host || 'localhost')
            + ':'
            + (params.port || '8089');

        var app = params.app || 'search';
        var freeLicense = params.hasOwnProperty('freeLicense')
            ? params.freeLicense
            : false;
        
        // Define global client-side configuration
        window.$C = {
            'SPLUNKD_PATH': params.proxyPath || splunkdPath,
            'SPLUNKD_IS_PROXIED': params.proxyPath ? true : false,
            'SCHEME': params.scheme || 'https',
            'HOST': params.host || 'localhost',
            'PORT': params.port || 8089,
            'AUTHENTICATE': params.authenticate || {username: 'admin', password: 'changeme'},
            'ON_SESSION_EXPIRED': params.onSessionExpired,
            
            'LOCALE': params.locale || 'en-us',
            
            'APP': app,
            'APP_DISPLAYNAME': app,
            
            // These get set in login
            'SERVER_ZONEINFO': null,
            'USERNAME': null,
            'USER_DISPLAYNAME': null,

            // NOTE: Can derive from (service.info.get('isFree', '0') != '0').
            //       Currently we're requiring the user to specify this explicitly.
            'SPLUNKD_FREE_LICENSE': freeLicense,

            // In independent mode we provide a silent no-op function
            'ON_DRILLDOWN': params.onDrilldown || function() {},
            
            // Constants
            'JS_LOGGER_MODE': 'None',

            // Signal that the framework is running in independent mode.
            // In particular that means that the URL structure is different than in other modes.
            // 
            // It is safe to signal this unconditionally in the splunkjs.config() function because it is
            // currently only ever called from independent-mode HTML pages.
            // This may change in the future.
            'INDEPENDENT_MODE': true
        };
        
        // Extend client-side configuration with custom variables
        if (params.custom) {
            for (var key in params.custom) {
                var value = params.custom[key];
                window.$C[key] = value;
            }
        }
    };
})();