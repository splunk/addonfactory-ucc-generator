/**
 * @author sfishel
 *
 * A custom sub-class of ControlGroup for pivot filter config forms.
 *
 * Renders a drop-down of limit type options, a text input for limit amount, and - depending on the value of the
 * model's limitByDataType - a drop-down for the limit stats function if applicable.
 */

define([
            'module',
            'underscore',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/SyntheticSelectControl',
            'views/shared/controls/TextControl',
            'views/shared/controls/Control'
        ],
        function(
            module,
            _,
            ControlGroup,
            SyntheticSelectControl,
            TextControl,
            Control
        ) {

    return ControlGroup.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model {Model} the model to operate on
         * }
         */

        initialize: function() {
            this.options.label = _('Limit').t();
            this.stringStatsFnControl = new SyntheticSelectControl({
                model: this.model,
                modelAttribute: 'limitStatsFn',
                className: Control.prototype.className + ' input-append',
                toggleClassName: 'btn',
                menuWidth: 'narrow',
                popdownOptions: {
                    detachDialog: true
                },
                items: [
                    {
                        value: 'count',
                        label: _('counts').t()
                    },
                    {
                        value: 'dc',
                        label: _('distinct counts').t()
                    }
                ]
            });
            this.numberStatsFnControl = new SyntheticSelectControl({
                model: this.model,
                modelAttribute: 'limitStatsFn',
                className: Control.prototype.className + ' input-append',
                toggleClassName: 'btn',
                menuWidth: 'narrow',
                popdownOptions: {
                    detachDialog: true
                },
                items: [
                    {
                        value: 'count',
                        label: _('counts').t()
                    },
                    {
                        value: 'dc',
                        label: _('distinct counts').t()
                    },
                    {
                        value: 'sum',
                        label: _('sums').t()
                    },
                    {
                        value: 'avg',
                        label: _('averages').t()
                    }
                ]
            });
            this.limitAmountControl = new TextControl({
                model: this.model,
                modelAttribute: 'limitAmount',
                className: Control.prototype.className + ' input-prepend',
                inputClassName: this.options.inputClassName || 'input-very-small'
            });

            this.options.controls = [
                {
                    type: 'SyntheticSelect',
                    options: {
                        model: this.model,
                        modelAttribute: 'limitType',
                        className: Control.prototype.className + ' input-prepend',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        popdownOptions: {
                            detachDialog: true
                        },
                        items: [
                            {
                                value: 'highest',
                                label: _('Highest').t()
                            },
                            {
                                value: 'lowest',
                                label: _('Lowest').t()
                            }
                        ]
                    }
                },
                this.limitAmountControl,
                this.stringStatsFnControl,
                this.numberStatsFnControl
            ];

            this.model.on('change:limitByDataType', this.handleLimitByDataTypeChange, this);
            ControlGroup.prototype.initialize.call(this, this.options);
        },

        handleLimitByDataTypeChange: function() {
            var limitByDataType = this.model.get('limitByDataType');
            if(limitByDataType === 'string' || limitByDataType === 'ipv4') {
                this.limitAmountControl.$el.addClass('input-append');
                this.stringStatsFnControl.wake().$el.css({ display: 'inline-block' });
                this.numberStatsFnControl.sleep().$el.hide();
                // Make sure the statsFn is compatible with the new data type (SPL-74163).
                if(!(this.model.get('limitStatsFn') in { count: true, dc: true })) {
                    this.model.set({ limitStatsFn: 'count' });
                }
            }
            else if(limitByDataType === 'number') {
                this.limitAmountControl.$el.addClass('input-append');
                this.stringStatsFnControl.sleep().$el.hide();
                this.numberStatsFnControl.wake().$el.css({ display: 'inline-block' });
            }
            else {
                this.limitAmountControl.$el.removeClass('input-append');
                this.stringStatsFnControl.sleep().$el.hide();
                this.numberStatsFnControl.sleep().$el.hide();
                // Make sure the statsFn is compatible with the new data type (SPL-74163).
                var isObjectCount = limitByDataType === 'objectCount' || limitByDataType === 'childCount';
                if(isObjectCount && this.model.get('limitStatsFn') !== 'count') {
                    this.model.set({ limitStatsFn: 'count' });
                }
            }
        },

        render: function() {
            ControlGroup.prototype.render.call(this);
            this.handleLimitByDataTypeChange();
            return this;
        }

    });

});