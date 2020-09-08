define(function(require) {
    // webpack doesn't make things globabl by default
    // promoting this to globabl for backwards compatability
    window.$ = require('jquery');
    window.$C = window.$C || {};
    window.$C.INDEPENDENT_MODE = false;
    var define = require('shim/requirejsDefine');
    var _ = require('underscore');

    var exposedModules = require('./exposedModules');

    _.forEach(exposedModules, function(mod, key) {
        define(key, function() {
            return mod;
        });
    });
});
