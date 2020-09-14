define(function(require) {
    var requirejs = require('requirejs');
    var define = require('shim/requirejsDefine');
    var splunkUtil = require('splunk.util')
    var _ = require('underscore');

    require('script!profiles/shared');

    requirejs.config({
        baseUrl: splunkUtil.make_url('static/js')
    });

    var exposedModules = require('./exposedModules');

    _.forEach(exposedModules, function(mod, key) {
        define(key, function() {
            return mod;
        });
    });
});
