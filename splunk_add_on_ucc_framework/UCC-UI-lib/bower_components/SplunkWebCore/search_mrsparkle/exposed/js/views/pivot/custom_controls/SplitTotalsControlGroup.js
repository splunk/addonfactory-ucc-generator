/**
 * @author sfishel
 *
 * A custom sub-class of ControlGroup for pivot row/column split config forms.
 *
 * Creates a synthetic radio control for toggling whether the results should include totals or not.
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
         *     report <models.pivot.PivotReport> the pivot report model
         * }
         */

        initialize: function(options) {
            this.options.label = _('Totals').t();
            this.options.controls = [
                {
                    type: 'SyntheticRadio',
                    options: {
                        model: this.model,
                        modelAttribute: options.elementType === 'row' ? 'showRowSummary' : 'showColSummary',
                        items: [
                            {
                                label: _('Yes').t(),
                                value: 'true'
                            },
                            {
                                label: _('No').t(),
                                value: 'false'
                            }
                        ]
                    }
                }
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});