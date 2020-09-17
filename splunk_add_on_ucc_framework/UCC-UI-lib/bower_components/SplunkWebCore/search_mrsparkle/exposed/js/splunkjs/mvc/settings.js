define(function(require, exports, module) {
    var TokenAwareModel = require('./tokenawaremodel');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name Settings
     * @description The **Settings** base input class contains the Settings model
     * for SplunkJS components.
     * @extends splunkjs.mvc.TokenAwareModel
    */
    var Settings = TokenAwareModel.extend(/** @lends splunkjs.mvc.Settings.prototype */{
        sync: function() { return false; }
    });
    
    return Settings;
});
