define([
        'jquery',
        'underscore',
        'module',
        'views/shared/controls/TextControl'
    ],
    function(
        $,
        _,
        module,
        TextControl
    ){
        /**
        * @constructor
        * @memberOf views
        * @name SliderControl
        * @description Control wrapper around a native input of type range. 
        * 
        * **Note**: This has not been well tested.
        * 
        * @extends {views.TextControl}
        * 
        * @param {Object} options
        * @param {String} options.modelAttribute The attribute on the model to observe and update on
        * selection
        * @param {Backbone.Model} options.model The model to operate on
        * @param {Number} [options.min = 0] The minimum allowed value.
        * @param {Number} [options.max = 100] The maximum allowed value.
        * @param {Number} [options.step = 1] The step to apply when buttons/arrow keys are used.
        * @param {String} [options.inputClassName] A class name to apply to the input element
        */
        return TextControl.extend(/** @lends views.SliderControl.prototype */{


            moduleId: module.id,
            initialize: function() {
                var defaults = {
                        min: '0',
                        max: '100',
                        step: '1',
                        inputClassName: '',
                        enabled: true
                };
                _.defaults(this.options, defaults);
                
                TextControl.prototype.initialize.apply(this, arguments);
            },
            events: _.extend({}, TextControl.prototype.events, {
                'change input[type=range]': function(e) {
                    this.setValue($(e.target).val(), false);
                }
            }),
            disable: function() {
                this.$('input').prop('disabled', true);
                TextControl.prototype.disable.call(this);
            },
            enable: function() {
                this.$('input').prop('disabled', false);
                TextControl.prototype.enable.call(this);
            },
            render: function() {
                if (!this.el.innerHTML) {
                    TextControl.prototype.render.call(this);
                    this.$el.prepend(_.template(this.sliderTemplate, {
                      options: this.options,
                      value: this._value
                    }));
                } else {
                    this.$('input').val(this._value);
                }
            },
            sliderTemplate: '\
                <input  class="slider <%= options.inputClassName %>" type="range" \
                min="<%- options.min %>" max="<%- options.max %>" \
                step="<%- options.step %>" value="<%- value %>" />\
            '
        });
    }
);
