
define([
            'underscore',
            'backbone',
            'splunk.logger',
            'splunk.util'
        ],
        function(
            _,
            Backbone,
            SplunkLogger,
            splunkUtils
        ) {

    var logMode = splunkUtils.getConfigValue("JS_LOGGER_MODE", "None"),
        logLevel = splunkUtils.getConfigValue("JS_LOGGER_LEVEL", "INFO"),
        shouldAttachLogging = (logMode !== 'None' && logLevel === 'DEBUG'),
        // don't attach loggers to events that will be very chatty
        domEventBlacklist = ['mousemove', 'scroll'],
        logger = null;

    /**
     * 
     * Mixin to add logging to a Backbone View
     *
     * This mixin will add logging statements to each DOM event handler in the view's "events" hash,
     * but only if logging is enabled and the log level is DEBUG.
     *
     * In the case where logging should not be added this code is designed to do as little work as possible.  Attaching
     * logging should not cause any changes in behavior.
     *
     * Usage:
     *
     *     var MyView = Backbone.View.extend({
     *         // view code here
     *     });
     *     _.extend(MyView.prototype, viewloggingmixin);
     * 
     * @mixin viewlogging
     */
    var viewlogging = {

        /**
         * An override of delegateEvents, which will wrap each event handler in a new function that 
         * will log a useful message and then invoke the original handler
         * @param  {Object} events
         *
         * @memberOf viewlogging
         */
        delegateEvents: function(events) {
            // if logging should not be attached, this should be an effective no-op
            if(!shouldAttachLogging) {
                return Backbone.View.prototype.delegateEvents.call(this, events);
            }
            events = events || _.result(this, 'events');
            // if there are no events declared, again fall through to the Backbone implementation
            if(!events) {
                return Backbone.View.prototype.delegateEvents.call(this, events);
            }
            var wrappedEvents = {};
            // loop over each eventName-handler pair, making sure to normalize the fact that the handler could be a
            // function or the string name of an instance member, replace the handler with a wrapper function
            // and call the Backbone implementation with the wrapped version of the handlers
            _(events).each(function(handler, eventName) {
                var normalizedHandler = _.isFunction(handler) ? handler : this[handler];
                if(_.isFunction(normalizedHandler) && _(domEventBlacklist).indexOf(eventName) === -1) {
                    var viewId = this.moduleId + '/' + this.cid;
                    wrappedEvents[eventName] = function() {
                        if(!logger) {
                            logger = SplunkLogger.getLogger('viewlogging.js');
                        }
                        logger.debug('view ' + viewId + ' is handling event ' + eventName.replace(/\s+/g, ' '));
                        // "this" here will be the context that Backbone uses to invoke the handler
                        normalizedHandler.apply(this, arguments);
                    };
                }
                // in the case where normalizedHandler is for some reason not a function, it is not safe to create the
                // wrapper, but make sure to be non-destructive
                else {
                    wrappedEvents[eventName] = handler;
                }
            }, this);
            return Backbone.View.prototype.delegateEvents.call(this, wrappedEvents);
        }

    };

    return viewlogging;

});