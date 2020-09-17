define([
    'jquery',
    'underscore',
    'backbone',
    'util/moment',
    'splunk.util',
    'splunk.logger'
], function($,
            _,
            Backbone,
            Moment,
            SplunkUtil,
            SplunkLogger) {
    /**
     * A simple profiler that track the duration of function calls and send the profiling data back to Splunk via js logging endpoint
     *
     * @example
     *
     *  var profiler = Profiler.get('Dashboard', {profilerProperty1: value});
     *  var module = profile.module('module1', {moduleProperty1: value});
     *  module.log({k1:v1, k2: v2});
     *
     *  using timer:
     *  var timer = module.newTimer();
     *  // some work..
     *  module.log({duration: timer.fromNow()});
     *
     *
     *  profiling functions:
     *
     *  module.profileFunctions(viewInstance, 'render','func1','func2' ...)
     *
     */

    var sprintf = SplunkUtil.sprintf;

    var PerformanceTimer = function() {
        PerformanceTimer.prototype.initialize.apply(this, arguments);
    };
    _.extend(PerformanceTimer.prototype, {
        // we may use performance interface if precise timing is required
        initialize: function(options) {
            options || (options = {});
            options.autoStart !== false && (this.start());
        },
        start: function() {
            this._start = Date.now();
        },
        fromNow: function() {
            if (!this._start) {
                throw new Error('Please start the timer first');
            }
            return Date.now() - this._start;
        }
    });

    var Module = function() {
        Module.prototype.initialize.apply(this, arguments);
    };
    _.extend(Module.prototype, {
        initialize: function(profiler, name, options) {
            options || (options = {});
            this.profiler = profiler;
            this.name = name;
            this.options = options;
        },
        newTimer: function(options) {
            options || (options = {});
            return new PerformanceTimer(_.extend({}, this.options, options));
        },
        profiledFunction: function(funcName, func) {
            var self = this;
            var wrappedFn = _.wrap(func, function(orginalFn) {
                var timer = self.newTimer();
                var args = Array.prototype.slice.call(arguments, 1);
                var ret = orginalFn.apply(this, args);
                self.log({
                    'function': funcName,
                    'duration': timer.fromNow()
                });
                return ret;
            });
            return wrappedFn;
        },
        profileFunctions: function(object) {
            if (typeof object === 'object') {
                var funcs = Array.prototype.slice.call(arguments, 1);
                _.each(funcs, function(funcName) {
                    if (_.isFunction(object[funcName])) {
                        object[funcName] = this.profiledFunction(funcName, object[funcName]);
                    }
                }, this);
            }
        },
        log: function(data) {
            var logger = SplunkLogger.getLogger(this.name);
            var messages = [sprintf('profiler=%s', this.profiler.name)];
            _.each(_.extend({}, this.options, data), function(v, k) {
                messages.push(sprintf('%s=%s', k, v));
            }, this);
            logger[this.options.level](messages.join(', '));
        }
    });

    var Profiler = function() {
        Profiler.prototype.initialize.apply(this, arguments);
    };

    _.extend(Profiler.prototype, Backbone.Events, {
        initialize: function(name, options) {
            this.options = _.defaults(options || {}, {
                level: 'debug'
            });
            this.name = name || 'Unnamed Profiler';
        },
        module: function(name, options) {
            options || (options = {});
            return new Module(this, name, _.extend({}, this.options, options));
        }
    });

    var REGISTRY = {};

    Profiler.get = function(name, options) {
        if (!REGISTRY[name]) {
            REGISTRY[name] = new Profiler(name, options);
        }
        return REGISTRY[name];
    };
    Profiler.clear = function() {
        REGISTRY = {};
    };
    Profiler.isEnabled = function() {
        return "None" != SplunkUtil.getConfigValue("JS_LOGGER_MODE", "None");
    };

    return Profiler;
});