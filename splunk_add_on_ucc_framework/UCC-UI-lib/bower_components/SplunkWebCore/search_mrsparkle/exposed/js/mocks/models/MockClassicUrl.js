/**
 * @author sfishel
 *
 * A mock for the singleton classicUrl model.
 * Exposes methods for simulating back/next button events, and inspecting the history entries that are created.
 */

define(['jquery', 'underscore', 'mocks/models/MockModel', 'mocks/adapters/MockAdapter'], function($, _, MockModel, MockAdapter) {

    var MockClassicUrl = MockModel.extend({

        initialize: function(attributes) {
            MockModel.prototype.initialize.call(this, attributes);
            this.restore();
        },

        save: function(attributes, options) {
            options = options || {};
            if(!options.replaceState) {
                this.simulatePushState();
            }
            var that = this;
            return MockModel.prototype.save.call(this, attributes, options).then(function() {
                if(true || !options.replaceState) {
                    that.nextPushState = $.extend(true, {}, that.attributes);
                }
            });
        },

        previous: function() {
            var currentState = $.extend(true, {}, this.attributes),
                previousState = this.prevStack.pop();

            this.nextStack.push(currentState);
            this.clear({ silent: true });
            this.set(previousState);
            this.nextPushState = $.extend(true, {}, previousState);
        },

        next: function() {
            var currentState = $.extend(true, {}, this.attributes),
                nextState = this.nextStack.pop();

            this.prevStack.push(currentState);
            this.clear({ silent: true });
            this.set(nextState);
            this.nextPushState = $.extend(true, {}, nextState);
        },

        restore: function() {
            this.prevStack = [];
            this.nextStack = [];
            this.clear();
            this.nextPushState = {};
            this.sync = new MockAdapter();
        },

        getPrevHistorySize: function() {
            return this.prevStack.length;
        },

        getNextHistorySize: function() {
            return this.nextStack.length;
        },

        simulatePushState: function() {
            this.prevStack.push(this.nextPushState);
            this.nextStack = [];
        }

    });

    return new MockClassicUrl();

});