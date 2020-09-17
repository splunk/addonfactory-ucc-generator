/**
 * @author sfishel
 *
 * A custom sub-class of ControlGroup for pivot filter config forms.
 *
 * Creates a synthetic radio control from toggling the type of filter operation.
 */

define([
            'underscore',
            'module',
            'views/shared/controls/ControlGroup'
        ],
        function(
            _,
            module,
            ControlGroup
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
            this.options.label = _('Filter Type').t();
            this.options.controls = [
                {
                    type: 'SyntheticRadio',
                    options: {
                        model: this.model,
                        modelAttribute: 'filterType',
                        items: [
                            {
                                label: _('Match').t(),
                                value: 'match'
                            },
                            {
                                label: _('Limit').t(),
                                value: 'limit'
                            }
                        ]
                    }
                }
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});