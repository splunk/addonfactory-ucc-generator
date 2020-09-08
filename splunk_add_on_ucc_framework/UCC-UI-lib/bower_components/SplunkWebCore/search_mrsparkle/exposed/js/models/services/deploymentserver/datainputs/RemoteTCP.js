define(
    [
        'underscore',
        'models/services/data/inputs/BaseInputModel'
    ],
    function(_, BaseInputModel) {
        return BaseInputModel.extend({
            url: "deployment/server/setup/data/inputs/tcp/remote_raw",
            validation: {
                'ui.name': [
                    {
                        pattern: 'number',
                        msg: _('Port number is required').t(),
                        required: true
                    }
                ],
                'ui.sourcetype': [
                    {
                        required: function() {
                            return (this.wizard.get('currentStep') === 'inputsettings') && (!this.get('ui.sourcetype'));
                        },
                        msg: _("Sourcetype value is required.").t()
                    }
                ]
            }
        });
    }
);