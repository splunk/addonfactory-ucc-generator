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
            url: "data/inputs/tcp/raw",
            validation: {
                'ui.name': [
                    {
                        pattern: 'number',
                        msg: _('Port number is required').t(),
                        required: true
                    },
                    {
                        fn: 'checkInputExists'
                    }
                ],
                'ui.sourcetype': [
                    {
                        required: function() {
                            return (this.wizard.get('currentStep') === 'inputsettings') && (!this.get('ui.sourcetype'));
                        },
                        msg: _("Sourcetype value is required.").t()
                    }
                ],
                'ui.host': [
                    {
                        required: function() {
                            return (this.wizard.get('currentStep') === 'inputsettings') && (this.get('ui.connection_host') === 'none');
                        },
                        msg: _("Host value is required.").t()
                    }
                ]
            }
        });
    }
);