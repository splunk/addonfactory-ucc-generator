define(function(require, exports, module) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var console = require('util/console');
    var DomTrackerMixin = require('mixins/domtracker');
    var mvc = require('./mvc');
    
    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name BaseManager
     * @private
     * @description The **BaseManager** base class is used for search managers. 
     * This class is not designed to be instantiated directly.
     * @extends splunkjs.mvc.Backbone.Model
     * @mixes domtracker
     */
    var BaseManager = Backbone.Model.extend(/** @lends splunkjs.mvc.BaseManager.prototype */{
        constructor: function(attributes, options) {
            attributes = attributes || {};
            options = options || {};
            
            // Get or generate a name
            var id = options.id || attributes.id;
 
            if (id === undefined) {
                id = options.name || attributes.name;
                if (id !== undefined) {
                    console.log("Use of 'name' to specify the ID of a Splunk model is deprecated.");
                }
            }
            
            if (id === undefined) {
                id = _.uniqueId('manager_');
            }
            
            // Store it on the instance/options
            this.id = this.name = options.name = options.id = id;
            var returned = Backbone.Model.prototype.constructor.apply(this, arguments);
            
            // Register it on the global registry
            mvc.Components.registerInstance(this.id, this, { replace: options.replace });
            
            return returned;
        },
        
        _start: function() {},

        dispose: function() {
            this.stopListeningDOM();
            this.stopListening();

            if (mvc.Components.getInstance(this.id) === this) {
                mvc.Components.revokeInstance(this.id);
            }
        }
    });
    
    _.extend(BaseManager.prototype, DomTrackerMixin);
    
    return BaseManager;
});
/**
 * Search progress event.
 *
 * @event
 * @name splunkjs.mvc.BaseManager#search
 * @property {Boolean} search:cancelled - Fired when the search is cancelled. Changing the properties of the search starts a new one, which may cancel an old search.
 * @property {Boolean} search:done - Fired when the search has finished. Note that this event is never fired for a real-time search.
 * @property {Boolean} search:error - Fired when an error occurs, such as when the user does not provide a search query, the user does not provide a valid name of a saved search, or when a network failure occurs.
 * @property {Boolean} search:failed - Fired when the search job fails.
 * @property {Boolean} search:progress - Fired to indicate search progress.
 * @property {Boolean} search:start - Fired when the search is successfully started.
 */
