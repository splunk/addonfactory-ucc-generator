define(function(require, exports, module) {
    var _ = require("underscore");
    var Backbone = require("backbone");
    var console = require("util/console");
    var BaseTokenModel = require("./basetokenmodel");
    
    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name Registry
     * @description The **Registry** class contains a set of globally-registered
     * component instances. Components are usually views, managers, or token models.
     *
     * &nbsp;&nbsp;&nbsp;&nbsp;**Note**  To allow the **SearchBar** view to 
     * modify its search manager, you must use tokens or set up a change handler.
     * 
     * @extends splunkjs.mvc.BaseSplunkView
     *
     */
    var Registry = Backbone.Model.extend(/** @lends splunkjs.mvc.Registry.prototype */{
        initialize: function() {
            // We always create a single model called 'default' - it is used
            // as the default token model
            this.registerInstance("default", this._createTokenModel("default"));
        },
        
        createError: function(message) {
            return message;
        },
        
        /**
         * Registers a view, search manager, or token model in the Splunk registry.
         *
         * @param {String} id - The component ID.
         * @param {String} [component] - The component name.
         * @param {Object} [options] - Options.
         * @returns {Object} An instance of the component.
         */
        registerInstance: function(id, component, options) {
            options = options || {};
            
            // Make sure we got passed in a valid ID.
            if (!id) {
                throw new Error("You must pass in an ID when registering an instance.");
            }
            
            // If we don't want to replace the current component at that ID,
            // and there is one already registered, then throw an error.
            // Otherwise, we'll replace it.
            if (this.has(id) && !options.replace) {
                throw new Error(this.createError("Already have instance with id: " + id));
            }
            
            // This will replace the old one with the new one if a component
            // with this ID already exists, or just set it for the first time.
            this.set(id, component, options);
            return component;
        },

        revokeInstance: function(id, options) {
            this.unset(id, options);
        },
        
        hasInstance: function(id) {
            return this.has(id);
        },
        
        // 
        // @param id                The id of the instance to return.
        // @param options           (Optional).
        // @param options.create    Whether to create a new token model with
        //                          the given name if the specified instance
        //                          does not exist.
        // @return                  The specified instance, or a falsy value
        //                          if the instance does not exist and
        //                          options.create is omitted or false.

        /**
         * Returns the token model in an HTML dashboard.
         *
         * @param {String} id - The component ID.
         * @param {String} [component] - The component name.
         * @param {Object} [options] - Options.
         * @param {Boolean} [options.create] - Indicates whether to create a new
         * token model with the given name if the specified instance does not exist.
         * @returns {Object} The token model, or a falsy value if the instance 
         * does not exist and `options.create` is omitted or false.
         */
        getInstance: function(id, options) {
            options = options || {};
            
            // If an instance with this id doesn't exist,
            // figure out whether we want to create one or not.
            if (!this.has(id)) {
                if (options.create) {
                    this.registerInstance(id, this._createTokenModel(id));
                }
                else {
                    console.error(this.createError("No instance with id: " + id));
                }
            }
            
            return this.get(id);
        },
        
        getInstances: function() {
            return _.values(this.attributes);
        },
        
        getInstanceNames: function() {
            return _.keys(this.attributes);
        },

        _createTokenModel: function(id) {
            var namespaceModel = new BaseTokenModel();
            namespaceModel.id = id;
            return namespaceModel;
        }
    });
    
    return Registry;
});
