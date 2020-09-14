define(function(require) {
    require('script!contrib/almond');
    var define = require('shim/requirejsDefine');
    var _ = require('underscore');
    var exposedModules = require('./exposedModules');

    _.forEach(exposedModules, function(mod, key) {
        define(key, function() {
            return mod;
        });
    });
});
