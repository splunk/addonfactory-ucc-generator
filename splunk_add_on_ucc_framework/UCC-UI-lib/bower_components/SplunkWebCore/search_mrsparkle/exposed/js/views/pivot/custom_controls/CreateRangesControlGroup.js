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

        initialize: function() {
            this.options.label = _('Create Ranges').t();
            this.options.controls = [
                {
                    type: 'SyntheticRadio',
                    options: {
                        model: this.model,
                        modelAttribute: 'display',
                        items: [
                            {
                                label: _('Yes').t(),
                                value: 'ranges'
                            },
                            {
                                label: _('No').t(),
                                value: 'all'
                            }
                        ]
                    }
                }
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});
