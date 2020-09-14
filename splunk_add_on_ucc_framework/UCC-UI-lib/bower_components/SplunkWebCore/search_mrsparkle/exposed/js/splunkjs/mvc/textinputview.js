define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var BaseInputView = require("./baseinputview");

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name TextInputView
     * @description The **TextInput** view displays an editable text box.
     * Does not report changes to the displayed value on a keypress until focus 
     * is lost or the user presses Enter.
     * @extends splunkjs.mvc.BaseInputView
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {String} [options.default] - The value to display on startup.
     * @param {Boolean} [options.disabled=false] - Indicates whether to disable the view.
     * @param {String} [options.initialValue] - The initial value of the input. 
     * If **default** is specified, it overrides this value. 
     * @param {Object} [options.settings] - The properties of the view.
     * @param {String} [options.type="text"] - The type of text field. To display 
     * characters as asterisks (*), set this value to "password".
     * @param {String} [options.value] - The value of the text field.
     *
     * @example
     * require([
     *     "splunkjs/mvc",
     *     "splunkjs/mvc/textinputview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(mvc, TextInputView) {
     * 
     *     // Instantiate components
     *     new TextInputView({
     *         id: "example-textinput",
     *         value: mvc.tokenSafe("$myTextValue$"),
     *         default: "type here",
     *         el: $("#mytextinputview")
     *     }).render();
     * 
     * });
     */
    var TextInputView = BaseInputView.extend(/** @lends splunkjs.mvc.TextInputView.prototype */{
        moduleId: module.id,
        
        className: "splunk-textinput",

        options: {
            "default": undefined,
            "type": "text",
            seed: undefined,
            value: undefined,
            disabled: false
        },

        events: {
            "change input": "_onDomValueChange"
        },
        
        initialize: function() {
            this.options = _.extend({}, BaseInputView.prototype.options, this.options);
            BaseInputView.prototype.initialize.apply(this, arguments);
            
            // Update view if model changes
            this.settings.on("change:value", this._onValueChange, this);
            this.settings.on("change", this.render, this);
            this.settings.on("change:type", this._onTypeChange, this);

            // Update model if view changes
            var that = this;
            this.on("change", function() {
                that.settings.set("value", that.val());
            });

            // Only types available to this object
            if (! _.contains(["text", "password"], this.settings.get("type"))) {
                this.settings.set("type", "text");
            }
            
            this._inputId = (this.id + '-input');
        },
        
        _onDomValueChange: function() {
            var input = $("input", this.$el);
            this.val(input.val());
        },
        
        _onValueChange: function(ctx, value, options) {
            var input = $("input", this.$el);
            input.val(this.settings.get("value"));
            
            this._onChange();
        },

        _onTypeChange: function() {
            this.clearView();
            this.render();
        },
        
        getInputId: function() {
            return this._inputId;  
        },

        createView: function() {
            var viz = $(_.template(
                "<input type='<%= type %>' id='<%= id %>' value='<%- value %>'/>", 
                {
                    type: this.settings.get("type"),
                    id: this._inputId,
                    value: this.settings.get("value")
                }
            ));
            this.$el.html(viz);
            return viz;
        },

        updateView: function(data, viz) {
            return this;
        },

        val: function(value) {
            var input = $("input", this.$el);
            if (arguments.length === 0) {
                return this.settings.get("value");
            }

            if (value !== this.settings.get("value")) {
                input.val(value || "");
                this.settings.set("value", value);
            }
            
            return this.val();
        },

        // This logic applies what Dashboards expects in order for an input to have a "value" - it is not a generally
        // applicable construct, and should only be used by the Dashboard helpers
        _hasValueForDashboards: function() {
            var value = this.settings.get("value");
            var defaultValue = this.settings.get("default");
            var valueIsDefined = value !== undefined && value !== null && value !== '';
            return valueIsDefined || defaultValue === undefined || value === defaultValue;
        }
    });
    
    return TextInputView;
});
