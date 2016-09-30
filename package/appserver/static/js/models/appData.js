/*global define,window*/
define([
    'splunk.config',
    'models/Base',
    'app/config/ContextMap'
], function (
    $C,
    BaseModel,
    ContextMap
) {
    var app,
        // if we're using custom root, then app name is @ index 4
        appIdx = ($C.MRSPARKLE_ROOT_PATH) ? 4 : 3,
        Model;

    // if we're running in a browser, just go ahead and grab our
    // app name. We can explicitly set/change it later.
    if (window && window.location && window.location.pathname) {
        app = window.location.pathname.split("/")[appIdx] || app;
    }

    Model = BaseModel.extend({

        defaults: {
            owner: $C.USERNAME,
            //TODO: Change me
            // app: app,
            app: ContextMap.appName,
            custom_rest: ContextMap.restRoot,
            nullStr: 'NULL',
            stanzaPrefix: ContextMap.restRoot
        },

        id: "appData",

        sync: function (method) {
            throw new Error('invalid method: ' + method);
        }
    });
    return new Model({});
});
