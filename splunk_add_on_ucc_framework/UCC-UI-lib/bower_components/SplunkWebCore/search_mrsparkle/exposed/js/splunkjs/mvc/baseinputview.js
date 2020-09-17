define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var SimpleSplunkView = require("./simplesplunkview");

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name BaseInputView
     * @description The **BaseInputView** base input class is used for Splunk 
     * form inputs. This class is not designed to be instantiated directly.
     * @extends splunkjs.mvc.SimpleSplunkView
    */
    var BaseInputView = SimpleSplunkView.extend(/** @lends splunkjs.mvc.BaseInputView.prototype */{

        output_mode: 'json',

        options: {
            disabled: false,
            managerid: null,
            data: "preview"
        },

        initialize: function(options) {
            SimpleSplunkView.prototype.initialize.apply(this, arguments);
            
            // The 'value' setting is always pushed
            this.settings.enablePush("value");
            
            // Handle the default value
            this._onDefaultChange();
            
            this.settings.on("change:disabled", this._onDisable, this);
            this.settings.on("change:default", this._onDefaultChange, this);

            // Trigger a ready event when the input finished loading
            this._onReady(_.bind(this.trigger, this, 'ready'));
        },

        _onReady: function(cb) {
            // Returns a promise which is fulfilled as soon as the input is ready
            // This is typically the case when search-based choices are loaded
            // For inputs that do not need to load data, the promise is resolved immediately
            var dfd;
            if (this.settings.get('managerid')) {
                // Fix SPL-106704, don't create dfd if already have one.
                this._readyDfd = this._readyDfd || $.Deferred();
                dfd = this._readyDfd.promise();
            } else {
                dfd = $.Deferred().resolve();
            }
            if (cb) {
                dfd.always(cb);
            }
            return dfd;
        },

        onDataChanged: function() {
            var ret = SimpleSplunkView.prototype.onDataChanged.apply(this, arguments);
            // Once we get data from the search manager we signal readiness of the input
            if (this._readyDfd) {
                this._readyDfd.resolve();
            }
            return ret;
        },
        
        _onDataChanged: function() {
            var r = SimpleSplunkView.prototype._onDataChanged.apply(this, arguments);
            this.trigger('datachange');
            return r;
        },
        
        _getSelectedData: function() {
            return {
                value: this._getSelectedValue(),
                label: this._getSelectedLabel()
            };
        },
        
        _getSelectedValue: function() {
            return this.val();
        },
        
        _getSelectedLabel: function(){
            return this.settings.get('selectedLabel');
        },

        _onSearchProgress: function(properties) {
            SimpleSplunkView.prototype._onSearchProgress.apply(this, arguments);
            if (this._readyDfd) {
                var content = properties.content || {};
                var previewCount = content.resultPreviewCount || 0;
                // Signal readiness of the input in case the populating search does not return any results
                if (content.isDone && previewCount === 0) {
                    this._readyDfd.resolve();
                }
            }
        },

        _onSearchError: function() {
            if (this._readyDfd) {
                this._readyDfd.reject();
            }
            SimpleSplunkView.prototype._onSearchError.apply(this, arguments);
        },

        _onSearchFailed: function() {
            if (this._readyDfd) {
                this._readyDfd.reject();
            }
            SimpleSplunkView.prototype._onSearchFailed.apply(this, arguments);
        },

        _onDefaultChange: function(model, value, options) {
            var oldDefaultValue = this.settings.previous("default");
                 
            // Initialize value with default, if provided.
            var defaultValue = this.settings.get("default");
            var calledFromConstructor = !model;
            if (defaultValue === undefined && calledFromConstructor) {
                defaultValue = this.settings.get("initialValue")==null ? this.settings.get("seed") : this.settings.get("initialValue");
            }
            
            var currentValue = this.settings.get('value');
            if (defaultValue !== undefined &&
                (_.isEqual(currentValue, oldDefaultValue) || currentValue === undefined))
            {
                this.val(defaultValue);
            }
        },

        _onChange: function(e) {
            this.trigger("change", this.val(), this);
        },

        _onDisable: function(e) {
            var state = this.settings.get("disabled");
            this._disable(state);
        },
        
        _disable: function(state) {
            this.$('input').prop("disabled", state);
        },

        /**
         * Draws the control to the screen. Called on newly-constructed views 
         * for the view to be in a defined state. Called only when you create 
         * the view manually.
         */
        render: function() {
            this._updateView(this._viz, this._data || []);
            return this;
        },

        // Skip the empty data check.  Empty data is acceptable for
        // form objects.

        _updateView: function() {
            var data = this._data || [];
 
            if (!this._viz) {
                this._createView(data); 
            }

            if (!this._viz) {
                return; // Couldn't create the visualization
            }

            this.updateView(this._viz, data);
            this._onDisable();
        },

        createView: function() {
            // Must return true to tell view that a valid
            // visualization exists.
            return true;  
        },

        /**
         * Gets the view's value if passed no parameters. 
         * Sets the view's value if passed a single parameter.
         * @param {String} value - The value to set.
         * @param {String} selector - 
         * @returns {String}
         */
        val: function(value, selector) {
            selector = selector || "input";
            var input = $(selector, this.$el);
            if (value) {
                return input.val(value);
            }
            return input.val();
        },

        // This logic applies what Dashboards expects in order for an input to have a "value" - it is not a generally
        // applicable construct, and should only be used by the Dashboard helpers
        _hasValueForDashboards: function() {
            var value = this.settings.get("value");
            var defaultValue = this.settings.get("default");
            var valueIsDefined = value !== undefined && value !== null;
            return valueIsDefined || defaultValue === undefined || value === defaultValue;
        }
    });
    
    return BaseInputView;
});
/**
 * Change event.
 *
 * @name splunkjs.mvc.BaseSplunkView#change
 * @event
 * @property {Boolean} change - Fired when the value of the view changes.
 */
