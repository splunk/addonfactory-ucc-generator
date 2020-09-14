/**
 * @author jszeto
 * @date 2/15/13
 *
 * A Control for specifying a unit and amount of time. For example, 4s, 5d, or 1y.
 * This control is comprised of a TextControl and a SyntheticSelectControl
 *
 * TODO [JCS] Move this into the shared components directory?
 *
 * Inputs:
 *
 *     modelAttribute {string} Used to identify the control for automated testing
 */
define(
    [
        'underscore',
        'views/Base',
        'views/shared/controls/Control',
        'views/shared/controls/TextControl',
        'views/shared/controls/SyntheticSelectControl',
        'module'
    ],
    function(
        _,
        BaseView,
        Control,
        TextControl,
        SyntheticSelectControl,
        module
        )
    {

        return Control.extend({
            moduleId: module.id,
            className: 'simple-time-picker-control input-append',

            initialize: function(options) {
                Control.prototype.initialize.call(this, options);
                options = options || {};
                this.$el.addClass(options.className);

                // Create the sub controls
                // Pass in the modelAttribute but not the model. This will add data-name to textTimeValue to support
                // automated testing
                this.children.textTimeValue = new TextControl({modelAttribute: this.options.modelAttribute});

                this.children.selectTimeUnit = new SyntheticSelectControl({items: [
                    {value: 's', label: _('Seconds').t()},
                    {value: 'm', label: _('Minutes').t()},
                    {value: 'h', label: _('Hours').t()},
                    {value: 'd', label: _('Days').t()},
                    {value: 'w', label: _('Weeks').t()},
                    {value: 'mon', label: _('Months').t()},
                    {value: 'q', label: _('Quarters').t()},
                    {value: 'y', label: _('Years').t()}],
                    className: 'btn-group select-time-unit',
                    toggleClassName: 'btn',
                    menuWidth: 'narrow',
                    defaultValue: 's'
                });

                this.children.textTimeValue.on("change", this.childControlChangeHandler, this);
                this.children.selectTimeUnit.on("change", this.childControlChangeHandler, this);
            },

            // When the sub control values change, change the value of this control.
            childControlChangeHandler: function() {
                this.setValue(this.getValueFromChildren(), false);
            },

            // Take a value and apply it to the sub controls
            applyValueToChildren: function(value) {
                if (!_.isUndefined(value)) {
                    var splitIndex = value.search(/[a-z]+/);
                    if (splitIndex != -1) {
                        this.children.textTimeValue._setValue(value.slice(0, splitIndex), true, true);
                        this.children.selectTimeUnit._setValue(value.slice(splitIndex), true, true);
                    }
                }
            },

            // Get the value from the sub controls
            getValueFromChildren: function() {
                // The time value must be an integer.
                var timeValue = this.children.textTimeValue.getValue().replace(/[^0-9]/g, '');
                // If a valid time value can't be parsed, ignore the time unit and return nothing.
                if (!timeValue) {
                    return '';
                }
                return timeValue + this.children.selectTimeUnit.getValue();
            },

            render: function() {
                if (!this.el.innerHTML) {
                    var html = _(this.template).template({ });
                    this.$el.html(html);

                    this.$(".time-value-placeholder").replaceWith(this.children.textTimeValue.render().el);
                    this.$(".time-unit-placeholder").replaceWith(this.children.selectTimeUnit.render().el);
                }

                this.applyValueToChildren(this.getValue());

                return this;
            },

            template: '\
                <span class="time-value-placeholder"></span>\
                <span class="time-unit-placeholder"></span>\
            '

        });

    });

