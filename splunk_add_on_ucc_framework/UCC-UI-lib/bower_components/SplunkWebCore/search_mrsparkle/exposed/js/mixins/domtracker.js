define(function(require, exports, module) {
    var _ = require('underscore'),
        jQuery = require('jquery');

    /*
     * Helps to keep tracks of all subscription made by listenToDOM function
     * and allows to stop listening to them by one or all at once 
     * by calling stopListeningDOM. 
     *
     * Note: jQuery elements remove all subscriptions when remove method
     * is called, but when you deal with global elements like body or window
     * this class can be useful.
     */

    var DomTracker = {
        /*
         * Tell an object to listen to a particular event on an jQuery object.
         * The callback will always be called with object as context.
         */
        listenToDOM: function($el, eventName, handler) {
            if(!($el instanceof jQuery)) {
                throw new Error('listenToDOM supports only jQuery objects');
            }

            var domListeners = this._domListeners || (this._domListeners = []);
            var bindedHandler = _.bind(handler, this);
            var eventNames = eventName.split(' ');
            _.each(eventNames, function(eventName) {
                $el.on(eventName, bindedHandler);
                var subscription = {
                    $el: $el, 
                    eventName: eventName, 
                    handler: handler, 
                    bindedHandler: bindedHandler
                };
                domListeners.push(subscription);
            });
        },

        /*
         * Tell an object to stop listening to events on JQuery object.
         */
        stopListeningDOM: function($el, eventName, handler) {
            if($el && !($el instanceof jQuery)) {
                throw new Error('stopListeningDOM supports only jQuery objects');
            }

            var domListeners = this._domListeners || (this._domListeners = []);
            var eventNames = eventName ? eventName.split(' ') : eventName;
            this._domListeners = _.filter(domListeners, function(subscription) {
                if ((!$el || subscription.$el.is($el)) &&
                    (!eventNames || _.indexOf(eventNames, subscription.eventName) >= 0) &&
                    (!handler || subscription.handler === handler)) {
                    subscription.$el.off(subscription.eventName, subscription.bindedHandler);
                    return false;
                }
                return true;
            });
        }
    };

    return DomTracker;
});