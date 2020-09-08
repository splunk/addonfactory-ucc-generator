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
            this.options.label = _('False Label').t();
            this.options.controls = [
                {
                    type: 'Text',
                    options: {
                        model: this.model,
                        modelAttribute: 'falseLabel',
                        placeholder: _('optional').t(),
                        inputClassName: 'input-medium'
                    }
                }
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

    });