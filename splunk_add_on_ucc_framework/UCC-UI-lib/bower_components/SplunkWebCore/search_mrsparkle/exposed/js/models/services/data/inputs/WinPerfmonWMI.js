define(
    [
        'underscore',
        'models/services/data/inputs/BaseInputModel'
    ],
    function (
        _,
        BaseInputModel
    ) {
        return BaseInputModel.extend({
            url: "data/inputs/win-wmi-collections",
            validation: {
                'ui.name': [
                    {
                        required: true,
                        msg: _("Collection name is required.").t()
                    },
                    {
                        fn: 'checkInputExists'
                    }
                ],
                'ui.lookup_host': [
                    {
                        required: true,
                        msg: _("Target host must be selected.").t()
                    }
                ],
                'ui.classes': [
                    {
                        required: true,
                        msg: _("A performance object must be selected.").t()
                    }
                ],
                'ui.interval': [
                    {
                        required: true,
                        pattern: 'number',
                        msg: _('Enter a number for the Interval field.').t()
                    }
                ],
                'ui.host': [
                    {
                        required: function() {
                            return this.wizard.get('currentStep') === 'inputsettings';
                        },
                        msg: _("Host value is required.").t()
                    }
                ]
            }
        });
    }
);