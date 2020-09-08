define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/controls/Control',
        'util/general_utils',
        'util/keyboard',
        './SyntheticSliderControl.pcss'
    ],
    function($, _, module, Control, util, keyboard, css) {
        /**
         * @constructor
         * @memberOf views
         * @name SyntheticSliderControl
         * @extends {views.Control}
         *
         * @param {Object} options
         * @param {Backbone.Model} options.model The model to operate on
         * @param {String} options.modelAttribute The attribute on the model to observe and update
         * on selection
         * @param {Number} [options.min = 1] The minimum value selectable on the slider
         * @param {Number} [options.max = 5] The maximum value selectable on the slider
         * @param {Number} [options.step = 1] The step interval amount between selectable values on
         * the slider
         * @param {Array} [options.steps] Allows every step of the slider to be explicitly defined.
         * If this option is defined, it will override any previously defined min, max, and step
         * settings.
         *
         * Each array element should be one of the following:
         *
         * - {String/Number} If the element is a string or number, the element will be used
         * as both he slider step's label and value.
         *
         * - {Object of format { label: String, value: String/Number }} If the element is
         * of the above object format, the element's label property will be used
         * as the slider step's label and the element's value property will be used as the
         * slider's value.
         *
         * Example: ['Low', 'Medium', { label: 'High', value: 10000 }]
         * @param {Boolean} [options.enableStepLabels = true] If a steps array (as defined above) is
         * provided, this determines whether or not to display step labels in the UI as the slider
         * is moved.
         * @param {Number} [options.value = options.min] The default value selected on the slider
         * @param {Number} [options.width = 256] The width of the slider bar in pixels
         * @param {Number} [options.minLabel] The text label displayed next to the minimum slider
         * end
         * @param {Number} [options.maxLabel] The text label displayed next to the maximum slider
         * end
         */
        return Control.extend(/** @lends views.SyntheticSliderControl.prototype */{
            className: 'control slider-control',
            moduleId: module.id,
            initialize: function() {
                var defaults = {
                    min: 1,
                    max: 5,
                    step: 1,
                    steps: [],
                    enableStepLabels: true,
                    width: 256
                };
                _.defaults(this.options, defaults);
                this.setSyntheticSteps();
                this.syncFromModel();
                this.setStyles();
                Control.prototype.initialize.call(this, this.options);
            },
            syntheticStepsMode: false,
            value: 0,
            selected: false,
            notches: 0,
            styles: {
                slider: {
                    height: 0
                },
                sliderBar: {
                    width: 0,
                    height: 0,
                    top: 0,
                    borderRadius: 0
                },
                sliderHandle: {
                    width: 0,
                    height: 0,
                    top: 0,
                    left: 0,
                    borderRadius: 0
                },
                sliderNotch: {
                    height: 0,
                    marginLeftRight: 0
                }
            },
            setSyntheticSteps: function() {
                if (this.options.steps.length) {
                    this.syntheticStepsMode = true;
                    this.options.min = 0;
                    this.options.max = this.options.steps.length - 1;
                    this.options.step = 1;
                    if (this.options.value !== undefined) {
                        this.options.value = this.syntheticToInternalValue(this.options.value);
                    }
                }
            },
            syntheticValueAt: function(index) {
                var syntheticStep = this.options.steps[index];
                return syntheticStep.value || syntheticStep;
            },
            syntheticLabelAt: function(index) {
                var syntheticStep = this.options.steps[index];
                return syntheticStep.label || syntheticStep;
            },
            syntheticToInternalValue: function(syntheticValue) {
                var numSteps = this.options.steps.length;
                for (var i = 0; i < numSteps; i++) {
                    if (this.syntheticValueAt(i) == syntheticValue) {
                        return i;
                    }
                }
                return 0;
            },
            setStyles: function() {
                this.styles.slider.height = this.options.width / 5;
                // Set bar styles
                this.styles.sliderBar.width = this.options.width;
                this.styles.sliderBar.height = this.styles.sliderBar.width / 50;
                this.styles.sliderBar.top = (this.styles.slider.height - this.styles.sliderBar.height) / 2;
                this.styles.sliderBar.borderRadius = this.styles.sliderBar.height / 2;
                // Set handle styles
                this.styles.sliderHandle.width = this.styles.sliderBar.width / 20;
                this.styles.sliderHandle.height = this.styles.sliderHandle.width;
                this.styles.sliderHandle.top = (this.styles.slider.height - this.styles.sliderHandle.height) / 2 - 1;
                this.styles.sliderHandle.borderRadius = this.styles.sliderHandle.width / 2 + 1;
                // Set notch styles
                this.notches = Math.round((this.options.max - this.options.min) / this.options.step) + 1;
                this.styles.sliderNotch.height = this.styles.sliderBar.height * 1.5;
                this.styles.sliderNotch.marginLeftRight = (this.styles.sliderBar.width - 2 * this.styles.sliderHandle.width) / (this.notches - 1);
            },
            activate: function() {
                Control.prototype.activate.apply(this, arguments);
                if (this.options.modelAttribute) {
                    this.syncFromModel();
                }
            },
            startListening: function() {
                Control.prototype.startListening.apply(this, arguments);
                if (this.options.modelAttribute) {
                    this.listenTo(this.options.model, 'change:' + this.options.modelAttribute, this.syncFromModel);
                }
            },
            events: {
                'mousedown .slider': function(e) {
                    this.select();
                    this.update(e);
                    $('body').addClass('text-highlight-disabled');

                    $(window).on('mousemove.slider', function(e) {
                        this.update(e);
                    }.bind(this));

                    $(window).on('mouseup.slider', function() {
                        this.deselect();
                        $('body').removeClass('text-highlight-disabled');
                        $(window).off('.slider');
                    }.bind(this));
                },
                'mousemove .slider': function(e) {
                    this.update(e);
                },
                'keydown .slider-handle': function(e) {
                    if (e.which == keyboard.KEYS.LEFT_ARROW || e.which == keyboard.KEYS.RIGHT_ARROW) {
                        e.preventDefault();
                        this.select();
                        var delta = e.which == keyboard.KEYS.LEFT_ARROW ? -this.options.step : this.options.step;
                        this.value = this.snapToValue(this.value + delta);
                        this.delayedDeselect();
                        this.render();
                        this.$el.find('.slider-handle').focus();
                    }
                }
            },
            delayedDeselect: function() {
                if (!this._delayedDeselect) {
                    this._delayedDeselect = _.debounce(function() {
                        this.deselect();
                    }, 750);
                }
                this._delayedDeselect.apply(this, arguments);
            },
            syncFromModel: function() {
                var modelValue = this.options.model.get(this.options.modelAttribute);
                if (modelValue !== undefined) {
                    var oldValue = this.value;
                    this.value = this.syntheticStepsMode ? this.syntheticToInternalValue(modelValue) : this.snapToValue(parseFloat(modelValue));
                    if (oldValue != this.value) {
                        this.syncToModel();
                    }
                    this.render();
                } else {
                    this.value = this.options.value !== undefined ? this.snapToValue(this.options.value) : this.options.min;
                }
            },
            syncToModel: function() {
                var modelValue = this.options.model.get(this.options.modelAttribute),
                    newModelValue;
                if (this.syntheticStepsMode) {
                    newModelValue = this.syntheticValueAt(this.value);
                    if (modelValue === undefined || modelValue != newModelValue) {
                        this.setValue(newModelValue);
                    }
                } else {
                    newModelValue = this.value.toFixed(3);
                    if (modelValue === undefined || this.snapToValue(parseFloat(modelValue)).toFixed(3) != newModelValue) {
                        this.setValue(newModelValue);
                    }
                }
            },
            select: function() {
                this.selected = true;
                this.render();
            },
            deselect: function() {
                this.selected = false;
                this.syncToModel();
                this.render();
            },
            snapToValue: function(value) {
                var exactValue = Math.min(Math.max(value, this.options.min), this.options.max);
                return Math.round(exactValue / this.options.step) * this.options.step;
            },
            offsetToValue: function(offset) {
                var padding = this.styles.sliderHandle.width / 2;
                var range = this.styles.sliderBar.width - 4 * padding;
                var offsetInRange = offset - padding;
                var valueInRange = offsetInRange / range;
                var trueRange = this.options.max - this.options.min;
                var desiredValue = this.options.min + valueInRange * trueRange;
                return this.snapToValue(desiredValue);
            },
            valueToOffset: function(value) {
                var padding = this.styles.sliderHandle.width / 2;
                var range = this.styles.sliderBar.width - 4 * padding;
                var trueRange = this.options.max - this.options.min;
                var valueInRange = (value - this.options.min) / trueRange;
                return padding + valueInRange * range - 1;
            },
            update: function(e) {
                if (this.selected) {
                    var padding = this.styles.sliderHandle.width / 2;
                    var offset = e.clientX - this.$el.find('.slider-bar').offset().left - padding;
                    this.value = this.offsetToValue(offset);
                    this.render();
                }
            },
            render: function() {
                var currentLabel = this.syntheticStepsMode && this.options.enableStepLabels ? this.syntheticLabelAt(this.value) : undefined;
                this.styles.sliderHandle.left = this.valueToOffset(this.value);
                this.$el.html(_.template(this.template, {
                    currentLabel: currentLabel,
                    width: this.options.width,
                    notches: this.notches,
                    styles: this.styles,
                    sliderHandleClass: this.selected ? 'slider-handle-moving' : '',
                    sliderHandleTooltipClass: this.selected && currentLabel ? 'slider-handle-tooltip' : '',
                    minLabel: this.options.minLabel,
                    maxLabel: this.options.maxLabel
                }));
                return this;
            },
            template: '\
                <div class="slider-container">\
                    <% if (minLabel) { %>\
                        <div class="slider-min-label"><%= minLabel %></div>\
                    <% } %>\
                    <div class="slider" style="width:<%= styles.sliderBar.width %>px;height:<%= styles.slider.height %>px;">\
                        <div class="slider-bar" style="width:<%= styles.sliderBar.width %>px;height:<%= styles.sliderBar.height %>px;top:<%= styles.sliderBar.top %>px;border-radius:<%= styles.sliderBar.borderRadius %>px;">\
                            <% for (var i = 0; i < notches; i++) { %>\
                                <div class="slider-notch" style="height:<%= styles.sliderNotch.height %>px;left:<%= styles.sliderHandle.width + i * styles.sliderNotch.marginLeftRight %>px;"></div>\
                            <% } %>\
                        </div>\
                        <div class="slider-handle <%= sliderHandleTooltipClass %> <%= sliderHandleClass %>" tabindex="0" style="width:<%= styles.sliderHandle.width %>px;height:<%= styles.sliderHandle.height %>px;top:<%= styles.sliderHandle.top %>px;left:<%= styles.sliderHandle.left %>px;border-radius:<%= styles.sliderHandle.borderRadius %>px" data-label="<%- currentLabel %>"></div>\
                    </div>\
                    <% if (maxLabel) { %>\
                        <div class="slider-max-label"><%= maxLabel %></div>\
                    <% } %>\
                </div>\
            '
        });
    }
);
