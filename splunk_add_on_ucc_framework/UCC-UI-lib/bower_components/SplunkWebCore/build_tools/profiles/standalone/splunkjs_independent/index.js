define(function (require) {
        window.$C = {
            BUILD_NUMBER: 76838
        };

        require('script!framework.i18n');
        var $ = require('jquery');
        var _ = require('underscore');

        var requirejs = require('requirejs');
        var define = require('shim/requirejsDefine');

        //fix url generation for a few edge cases
        var util = require('splunk.util');
        util.make_url = _.wrap(util.make_url, function (fn) {
            var params = _.toArray(arguments).slice(1);
            if (!_.isEmpty(params) && (params[0].indexOf('/static/') === 0 || params[0].indexOf('static/') === 0)) {
                var mainScript = $('script[src$="splunkjs/config.js"], script[src$="splunkjs.min/config.js"]').first();
                if (!_.isEmpty(mainScript)) {
                    var base = mainScript.attr('src').substring(0, mainScript.attr('src').length - 'config.js'.length);
                    var url = params[0].charAt(0) == '/' ? params[0] : ('/' + params[0]);
                    return base + url.substring('/static/'.length);
                }
            }
            return fn.apply(this, params);
        });

        //add splunkjs.config to window (customer entry point)
        require('script!splunkjs/preload');

        //the config function isn't guaranteed to be called, however, it
        // has to be executed at some point to set up window.$C with
        // proper values. also, this has to happen before other modules
        // are loaded, meaning we have to wait for the customer's first
        // require call, and at the same time we have to ensure that
        // splunkjs.config is at least called once

        var requireCalled = false, configCalled = false;
        window.splunkjs.config = _.wrap(window.splunkjs.config, function (fn) {
            fn.apply(this, _.toArray(arguments).slice(1));
            configCalled = true;

            // clear webpack's cache entry for the config module
            delete require.cache['stubs/splunk.config'];
        });

        var originalRequire = window.require;
        window.require = _.wrap(window.require, function (fn) {
            if (!requireCalled) {
                if (!configCalled) {
                    // ensure basic values in window.$C
                    window.splunkjs.config({authenticate: {}});
                }

                //load all exposed modules (to allow the customer to require them)
                _.forEach(require('./exposedModules'), function (mod, key) {
                    define(key, function () {
                        return mod;
                    });
                });

                requireCalled = true;
            }

            return fn.apply(window, _.toArray(arguments).slice(1));
        });
        _.extend(window.require, originalRequire);
    }
);
