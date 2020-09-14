define(function(require, exports, module) {

    var _ = require('underscore');
    var $ = require('jquery');
    var BaseChoiceView = require("./basechoiceview");

    require("css!../css/radio.css");

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name RadioGroupView
     * @description The **RadioGroup** view displays a group of a radio buttons. 
     * This view makes it easier to populate a radio button group from a search, 
     * but it can also be used like a standard HTML radio button group.
     * @extends splunkjs.mvc.BaseChoiceView
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {Object[]} [options.choices=[ ]] -  A static dictionary of options
     * for the radio buttons.
     * If bound to a `managerid`, the static choices specified here are prepended
     * to the dynamic choices from the search.</br>
     * For example:
     *
     *     var mychoices = [
     *         {label:"text1", value: "value1"},
     *         {label:"text2", value: "value2"},
     *         {label:"text3", value: "value3"}
     *     ];
     *
     * @param {String} [options.default] - The value of the default radio button.
     * @param {Boolean} [options.disabled=false] - Indicates whether to disable the view.
     * @param {String} [options.initialValue] - The initial value of the input. 
     * If **default** is specified, it overrides this value. 
     * @param {String} [options.labelField] -  The UI label of the radio button.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind 
     * this control to.
     * @param {Boolean} [options.selectFirstChoice=false] - Indicates whether to 
     * use the first available choice when the user has not made a selection. If
     * the **default** property has been set, that value is used instead.
     * @param {Object} [options.settings] - The properties of the view. 
     * @param {String} [options.value] - The value of the current selection.
     * @param {String} [options.valueField] -  The value, or search field to 
     * provide the value, for the radio buttons in this group.
     *
     * @example
     * require([
     *     "splunkjs/mvc",
     *     "splunkjs/mvc/radiogroupview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(mvc, RadioGroupView) {
     * 
     *     // Instantiate components
     *     new RadioGroupView({
     *         id: "example-radiogroup",
     *         default: "One",
     *         el: $("#myradiogroupview")
     *     }).render();
     * 
     *     // Define choices
     *     var choices = [
     *         {label: " One", value: "One"},
     *         {label:" Two", value: "Two"},
     *         {label:" Three", value: "Three"}];
     *      
     *     // Assign choices to the radio button group
     *     splunkjs.mvc.Components.get("example-radiogroup").settings.set("choices", choices); 
     * 
     * });
     */
    var RadioGroupView = BaseChoiceView.extend(/** @lends splunkjs.mvc.RadioGroupView.prototype */{
        moduleId: module.id,
        className: "splunk-radiogroup splunk-choice-input",
        
        options: {
            valueField: "",
            labelField: "",
            "default": undefined,
            "choices": [],
            selectFirstChoice: false,
            disabled: false,
            value: undefined
        },

        events: {
            "change input:radio": "onDomChange"
        },

        initialize: function() {
            this.options = _.extend({}, BaseChoiceView.prototype.options, this.options);
            BaseChoiceView.prototype.initialize.apply(this, arguments);
        },

        _domVal: function() {
            return this.$("input:radio:checked").val();
        },

        onDomChange: function() {
            this.onUserInput();
            this.val(this._domVal());
        },

        updateDomVal: function(value) {
            this.$('input:radio').prop('checked', false);
            this.$('input:radio[value="' + value + '"]').prop('checked', 'checked');
        },
        
        createView: function() {
            this.$el.empty();
            return $("<fieldset class='splunk-radiogroup-choices'/>").appendTo(this.el);
        },

        updateView: function(viz, data) {
            viz.empty();

            // If there is no data, we don't want to just render a message,
            // because that will look odd. Instead, we render a single radio
            // that will subsequently get disabled (in BaseChoiceView), plus
            // the message.
            if (!data || data.length === 0) {
                data = [{value: "", label: " "}];
            }

            var controlValue = this.settings.get("value");
            var id = this.id;

            _.each(data || [], function(entry, idx) {
                var itemId = id + String(idx);
                // As this control is represented by a group of HTML
                // objects, each object must have its own unique ID.
                var input = $('<input type="radio" />')
                    .attr({name: id, value: entry.value, id: itemId});

                if (entry.value == controlValue) {
                    input.prop({'checked': 'checked'});
                }

                var choice = $('<div class="choice" />')
                    .append(input)
                    .append($('<label />')
                            .attr("for", itemId)
                            .text(_($.trim(entry.label) || entry.value || '').t()));

                viz.append(choice);
            });

            return this;
        }
    });
    
    return RadioGroupView;
});
