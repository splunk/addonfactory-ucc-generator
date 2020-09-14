/**
 * @author sfishel
 *
 * A custom sub-class of ControlGroup for pivot cell config forms.
 *
 * Creates a synthetci radio control for toggling whether the sparklines are displayed or not.
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
            this.options.label = _('Display').t();
            this.options.controls = [
                {
                    type: 'SyntheticRadio',
                    options: {
                        model: this.model,
                        modelAttribute: 'sparkline',
                        items: [
                            {
                                label: _('Number').t(),
                                value: 'false'
                            },
                            {
                                label: _('Sparkline').t(),
                                value: 'true'
                            }
                        ]
                    }
                }
            ];
            this.options.enabled = false;
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});