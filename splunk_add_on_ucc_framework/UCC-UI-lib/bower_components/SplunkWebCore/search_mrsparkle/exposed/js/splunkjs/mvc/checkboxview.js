define(function(require, exports, module) {

    var _ = require('underscore');
    var $ = require('jquery');
    var BaseInputView = require("./baseinputview");

    require("css!../css/checkbox.css");

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name CheckboxView
     * @description The **Checkbox** view displays a checkbox and returns a `Boolean` value indicating whether it is checked.
     * @extends splunkjs.mvc.BaseInputView
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {String} [options.default] - The default value.
     * @param {Boolean} [options.disabled=false] - Indicates whether to disable the view.
     * @param {String} [options.initialValue] - The initial value of the input. 
     * If **default** is specified, it overrides this value. 
     * @param {Object} [options.settings] - The properties of the view. 
     * @param {Boolean} [options.value] - The Boolean value of the checkbox.
     *
     * @example
     * require([
     *     "splunkjs/mvc/checkboxview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(CheckboxView) {
     * 
     *     // Instantiate components
     *     new CheckboxView({
     *         id: "example-checkbox",
     *         default: false,
     *         el: $("#mycheckboxview")
     *     }).render();
     * 
     * });
     */
    var CheckboxView = BaseInputView.extend(/** @lends splunkjs.mvc.CheckboxView.prototype */{
        moduleId: module.id,
        
        className: "splunk-checkbox",
        inputType: "checkbox", 

        options: {
            "default": undefined,
            value: undefined,
            disabled: false
        },

        events: {
            "change input:checkbox": "_onChange"
        },
        
        initialize: function() {
            this.options = _.extend({}, BaseInputView.prototype.options, this.options);
            BaseInputView.prototype.initialize.apply(this, arguments);
            
            // Update view if model changes.
            this.settings.on("change", this.render, this);
            
            // Update model if view changes.
            var that = this;
            this.on("change", function() {
                that.settings.set("value", this.val());
            });
        },

        createView: function() {
            var viz = $("<input type='" + this.inputType + "'>");
            this.$el.html(viz);
            return viz;
        },

        updateView: function(viz, data) {
            this.val(this.settings.get("value") || false);
            return this;
        },

        // Get or set the current input's value.
        val: function(value) {
            var input = $("input", this.$el);
            if (value === undefined) {
                return input.prop('checked');
            }

            if (value !== this.val()) {
                input.prop('checked', Boolean(value));
                this.settings.set("value", Boolean(value));
                this._onChange();
            }
            return this.val();
        }
    });
    
    return CheckboxView;
});
