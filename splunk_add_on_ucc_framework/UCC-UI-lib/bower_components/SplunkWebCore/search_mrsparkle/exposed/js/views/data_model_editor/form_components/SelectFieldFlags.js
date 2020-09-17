/**
 * @author jszeto
 * @date 11/16/12
 *
 * SyntheticSelect control for setting the hidden and required attributes of a Field
 *
 * Inputs:
 *     model {models/services/datamodel/private/Field}
 *
 */

define(
    [
        'jquery',
        'underscore',
        'views/shared/controls/SyntheticSelectControl',
        'module'
    ],
    function(
        $,
        _,
        SyntheticSelectControl,
        module
        )
    {
        return SyntheticSelectControl.extend({
            moduleId: module.id,
            className: 'select-field-flags',

            initialize: function () {
                var items = [
                    {label: _("Optional").t(), value: "optional"},
                    {label: _("Required").t(), value: "required"},
                    {label: _("Hidden").t(), value: "hidden"},
                    {label: _("Hidden & Required").t(), value: "hidden,required"}
                ];

                var defaults = {
                    toggleClassName: 'btn',
                    menuWidth: 'narrow',
                    modelAttribute: '',
                    items: items,
                    popdownOptions: {}
                };
    
                _.defaults(this.options, defaults);
                _.defaults(this.options.popdownOptions, defaults.popdownOptions);
                            
                SyntheticSelectControl.prototype.initialize.call(this, this.options);
            },

            registerListeners: function() {
                this.model.on("change:hidden", this.render, this);
                this.model.on("change:required", this.render, this);
            },

            setValueFromModel: function(render) {
                var selectedValue = 'optional';
                var hidden = this.model.get('hidden');
                var required = this.model.get('required');

                if(hidden && required) {
                    selectedValue = 'hidden,required';
                }
                else if(hidden) {
                    selectedValue = 'hidden';
                }
                else if(required) {
                    selectedValue = 'required';
                }

                // TODO [JCS] This really should be refactored better since we are repeating logic from the base class
                this._setValue(selectedValue, render);
                return this;
            },

            getUpdatedModelAttributes: function() {
                var hidden = false;
                var required = false;
                var selectedValue = this.getValue();

                if(selectedValue === 'hidden,required') {
                    hidden = true;
                    required = true;
                }
                else if(selectedValue === 'hidden') {
                    hidden = true;
                }
                else if(selectedValue === 'required') {
                    required = true;
                }

                return { hidden: hidden, required: required };
            }
        });

    });
