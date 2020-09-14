define(function(require, exports, module) {
    var _ = require("underscore");
    var mvc = require('./mvc');
    var console = require('util/console');
    var Backbone = require("backbone");
    var Settings = require("./settings");
    var viewloggingmixin = require('mixins/viewlogging');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name BaseSplunkView
     * @private
     * @description The **BaseSplunkView** base view class is used for Splunk 
     * views. This class is not designed to be subclassed. Extend 
     * {@link splunkjs.mvc.SimpleSplunkView} instead.
     * @extends splunkjs.mvc.Backbone.View
     * @mixes viewlogging 
     * 
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control.
     * @param {String} options.el - Pre-existing &lt;div&gt; tag in which to render
     * this view.
     * @param {Object} options.settings -  A **Settings** model instance to 
     * use.
     * @param {Object} options.settingsOptions -  Initial options for this 
     * view's **Settings** model.
     * @param {Object} options.* - Initial attributes for this view's 
     * **Settings** model. See the subclass documentation for details.
     * @param {Object} settingsOptions - The initial options for this view's
     * **Settings** model.
     */
    var BaseSplunkView = Backbone.View.extend(/** @lends splunkjs.mvc.BaseSplunkView.prototype */{
        _numConfigureCalls: 0,
        
        /**
         * @protected
         * Names of options that will be excluded from this component's
         * settings model if passed to the constructor.
         */
        omitFromSettings: [],
        _uniqueIdPrefix: 'view_',

        constructor: function(options, settingsOptions) {
            options = options || {};
            settingsOptions = settingsOptions || {};
            
            options.settingsOptions = _.extend(
                options.settingsOptions || {},
                settingsOptions);

            // Internal property to track object lifetime. 
            // With this flag we want to prevent invoking methods / code
            // on already removed instance.
            this._removed = false;
            
            // Get an ID or generate one
            var id = options.id;
            if (id === undefined && options.name) {
                id = options.name;
                console.warn("Use of 'name' to specify the ID of a Splunk model is deprecated.");
            }

            if (id === undefined) {
                id = _.uniqueId(this._uniqueIdPrefix || 'view_');
            }

            this.name = this.id = options.name = options.id = id;

            this.options = _.extend({}, this.options, options);

            // Delegate to Backbone.View's constructor.
            // NOTE: This will call initialize() as a side effect.
            var returned = Backbone.View.prototype.constructor.apply(this, arguments);
            if (this._numConfigureCalls == 0) {
                // initialize() should have called configure() but did not.
                // In this case automatically call configure().
                this.configure();
            }

            // Register self in the global registry
            mvc.Components.registerInstance(this.id, this, { replace: settingsOptions.replace });
            
            return returned;
        },
        
        /**
         * @protected
         * Initializes this view's settings model based on the contents of
         * `this.options`.
         */
        configure: function() {
            this._numConfigureCalls++;
            if (this._numConfigureCalls > 1) {
                throw new Error('BaseSplunkView.configure() called multiple times.');
            }
            
            // We may have received a Settings model instance to use instead
            // of creating our own. If so, we just use it and return immediately.
            var settings = this.options.settings;
            if (settings && (settings instanceof Settings)) {
                this.settings = settings;
                return this;
            }
            
            // Reinterpret remaining view options as settings attributes.
            var localOmitFromSettings = (this.omitFromSettings || []).concat(
                ['model', 'collection', 'el', 'attributes', 
                 'className', 'tagName', 'events', 'settingsOptions']);

            var settingsAttributes = _.omit(this.options, localOmitFromSettings);
            var settingsOptions = this.options.settingsOptions;

            // Now, we create our default settings model.
            this.settings = new Settings(settingsAttributes, settingsOptions);

            return this;
        },
        
        // JIRA: Just invoke configure() from constructor() instead of
        //       relying on subclasses to do it. (Don't forget to update
        //       the doc comment above.) (DVPL-2436)
        /**
         * Initializes this view.
         * 
         * Subclasses are expected to override this method.
         * 
         * All implementations must call {@link splunkjs.mvc.configure | configure}, usually at the beginning
         * of this method.
         */
        initialize: function() {
            Backbone.View.prototype.initialize.apply(this, arguments);
        },
        
        remove: function() {
            this._removed = true;

            this.settings.dispose();

            // Call our super class
            Backbone.View.prototype.remove.apply(this, arguments);
            
            // Remove it from the registry
            if (mvc.Components.getInstance(this.id) === this) {
                mvc.Components.revokeInstance(this.id);
            }
            
            return this;
        },
        
        dispose: function() {
            this.remove();
        },

        setElement: function() {
            // We're doing this in setElement for a few reasons:
            // 1. It means that subclasses won't have to worry about
            // calling our initialize class.
            // 2. It is actually the most robust way to do this, because
            // it means we will catch both construction of new views, as 
            // well as later calls to setElement
            
            // Call our super class
            Backbone.View.prototype.setElement.apply(this, arguments);
            
            // Now that we have our new $el, we can call addClass on it
            this.$el.addClass("splunk-view");
            if (this.className) {
                this.$el.addClass(this.className);
            }
            
            if (!this.$el.attr('id')) {
                this.$el.attr('id', this.id);
            }
            
            return this;
        },
        
        bindToComponentSetting: function(settingName, fn, fnContext) {
            this.listenTo(this.settings, "change:" + settingName, function(model, value, options) {
                var oldComponentName = this.settings.previous(settingName);
                var newComponentName = value;
                
                this.unbindFromComponent(oldComponentName, fn, fnContext);
                this.bindToComponent(newComponentName, fn, fnContext);
            }, this);
            
            var initialComponentName = this.settings.get(settingName);
            this.bindToComponent(initialComponentName, fn, fnContext);
        },

        bindToComponent: function(id, fn, fnContext) {
            // Abort if required parameters are missing
            if (!id || !fn) {
                return this;
            }
            
            // We register on the "change:{id}" event
            this.listenTo(mvc.Components, "change:" + id, fn, fnContext);

            // However, it could be that the component already exists,
            // in which case, we will invoke the callback manually
            if (mvc.Components.has(id)) {
                var ctx = mvc.Components.get(id);
                _.defer(_.bind(function() {
                    if (!this._removed) {
                        fn.apply(fnContext, [mvc.Components, ctx, {}]);
                    }
                }, this));
            }
            
            return this;
        },

        unbindFromComponent: function(id, fn, fnContext) {
            // A component id is required
            if (!id) {
                return this;
            }
            
            // We register on the "change:{id}" event
            mvc.Components.off("change:" + id, fn, fnContext);
            
            return this;
        }
    });

    _.extend(BaseSplunkView.prototype, viewloggingmixin);
    
    return BaseSplunkView;
});
/**
 * Click event.
 *
 * @event
 * @name splunkjs.mvc.TableView#click
 * @property {Boolean} click:row - Fired when a row is clicked.
 * @property {Boolean} click:chart - Fired when a cell is clicked.
 */
