define(function(require) {
    var requirejs = require('requirejs');
    var define = require('shim/requirejsDefine');
    var _ = require('underscore');

    require('script!profiles/shared');
    require('script!splunkjs/preload');
    require('script!framework.i18n');

    requirejs.config({
        baseUrl: window.requirejsBaseUrl
    });

    define('underscore', function() {
        return _;
    });

    requirejs(['splunkjs/generated/urlresolver'], function(resolver) {
        window.urlresolver = resolver;
        var exposedModules = require('splunkjs/mvc/exposedModules');
        _.forEach(exposedModules, function(mod, key) {
            define(key, function() {
                return mod;
            });
        });
        requirejs(['splunkjs/ready!']);
    });
});
