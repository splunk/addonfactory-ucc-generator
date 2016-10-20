import {configManager} from 'app/util/configManager';

/*global define,window*/
define([
    'splunk.config',
    'models/Base'
], function (
    $C,
    BaseModel
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

    const {unifiedConfig: {meta}} = configManager;
    Model = BaseModel.extend({

        defaults: {
            owner: $C.USERNAME,
            //TODO: Change me
            // app: app,
            app: meta.name,
            custom_rest: meta.restRoot,
            nullStr: 'NULL',
            stanzaPrefix: meta.restRoot
        },

        id: "appData",

        sync: function (method) {
            throw new Error('invalid method: ' + method);
        }
    });
    return new Model({});
});
