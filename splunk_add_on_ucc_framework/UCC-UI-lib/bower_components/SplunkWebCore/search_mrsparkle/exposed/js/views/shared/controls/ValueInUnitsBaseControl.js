/**
 * @author jszeto
 * @date 11/10/2014
 *
 * @description Allows the user to input a single value in a given unit type.
 * Contains a TextControl and a SyntheticSelectControl. This maps to a single model attribute.
 *
 * For example, say the control represents time. The SelectControl contains the values "seconds, minutes, hours, days".
 * The TextControl contains the number of that unit. In this way, the user can specify 5 seconds, or 2 hours.
 *
 * Inputs:
 *
 *     modelAttribute {string}
 */

define(
    [
        'underscore',
        'views/Base',
        'views/shared/controls/Control',
        'views/shared/controls/TextControl',
        'views/shared/controls/SyntheticSelectControl',
        'module',
        'splunk.util'
    ],
    function(
        _,
        BaseView,
        Control,
        TextControl,
        SyntheticSelectControl,
        module,
        splunk_util
    )
    {

        return Control.extend({
            moduleId: module.id,
            className: 'value-in-units-base-control input-append',

            initialize: function(options) {
                Control.prototype.initialize.call(this, options);
                options = options || {};
                this.$el.addClass(options.className);

                // Create the sub controls
                // Pass in the modelAttribute but not the model. This will add data-name to textNumber to support
                // automated testing
                this.children.textNumber = new TextControl({
                    modelAttribute: this.options.modelAttribute,
                    enabled: splunk_util.normalizeBoolean(this.options.enabled)
                });

                this.children.selectUnit = new SyntheticSelectControl({
                    items: this.options.items,
                    className: 'btn-group select-time-unit',
                    toggleClassName: 'btn',
                    menuWidth: 'narrow',
                    defaultValue: 's',
                    popdownOptions: {
                        attachDialogTo: '.modal:visible',
                        scrollContainer: '.modal:visible .modal-body:visible'
                    },
                    enabled: !!this.options.enabled
                });

                this.children.textNumber.on("change", this.childControlChangeHandler, this);
                this.children.selectUnit.on("change", this.childControlChangeHandler, this);
            },

            // When the sub control values change, change the value of this control.
            childControlChangeHandler: function() {
                this.setValue(this.getValueFromChildren(), false);
            },

            // Take a value and apply it to the sub controls
            applyValueToChildren: function(value) {
                // Subclasses should implement
            },

            // Get the value from the sub controls
            getValueFromChildren: function() {
                // Subclasses should implement
            },

            enable: function() {
                Control.prototype.enable.apply(this, arguments);
                this.options.enabled = true;
                this.children.textNumber.enable();
                this.children.selectUnit.enable();
            },
            
            disable: function() {
                Control.prototype.disable.apply(this, arguments);
                this.options.enabled = false;
                this.children.textNumber.disable();
                this.children.selectUnit.disable();
            },
            
            render: function() {
                if (!this.el.innerHTML) {
                    var html = _(this.template).template({ });
                    this.$el.html(html);

                    this.$(".text-number-placeholder").replaceWith(this.children.textNumber.render().el);
                    this.$(".select-unit-placeholder").replaceWith(this.children.selectUnit.render().el);
                }

                this.applyValueToChildren(this.getValue());

                return this;
            },

            template: '\
                <span class="text-number-placeholder"></span>\
                <span class="select-unit-placeholder"></span>\
            '

        });

    });