/**
 * @author sfishel
 *
 * A custom sub-class of ControlGroup for pivot config forms label inputs.
 *
 * Renders a text input control for the label with the model's default label as placeholder text.
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
            this.options.label = _('Label').t();
            this.options.controls = [
                {
                    type: 'Text',
                    options: {
                        model: this.model,
                        modelAttribute: 'label',
                        placeholder: _('optional').t(),
                        inputClassName: 'input-pivot-label'
                    }
                }
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});