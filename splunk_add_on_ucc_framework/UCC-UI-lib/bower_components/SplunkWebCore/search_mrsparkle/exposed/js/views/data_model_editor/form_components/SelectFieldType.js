/**
 * @author jszeto
 * @date 11/15/12
 *
 * SyntheticSelect control to edit the type attribute of a Field
 *
 * Inputs:
 *     model {models/services/datamodel/private/Field}
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
            className: 'select-field-type',

            initialize: function () {
                var items = [
                                {label: _("String").t(), value: "string"},
                                {label: _("Number").t(), value: "number"},
                                {label: _("Boolean").t(), value: "boolean"},
                                {label: _("IPV4").t(), value: "ipv4"}
                            ];
                
                var defaults = {
                    toggleClassName: 'btn',
                    menuWidth: 'narrow',
                    modelAttribute: 'type',
                    items: items,
                    popdownOptions: {}
                };
    
                _.defaults(this.options, defaults);
                _.defaults(this.options.popdownOptions, defaults.popdownOptions);
                                
                SyntheticSelectControl.prototype.initialize.call(this, this.options);
            }
        });

    });
