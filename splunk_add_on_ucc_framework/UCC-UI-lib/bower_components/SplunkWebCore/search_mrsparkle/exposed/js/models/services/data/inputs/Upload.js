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
            url: "data/inputs/monitor",
            urlRoot: "data/inputs/monitor",
            validation: {
                'file': [
                    {
                        required: true,
                        msg: _("File must be selected.").t()
                    }
                ],
                'ui.host': [
                    {
                        required: function() {
                            return (this.wizard.get('currentStep') === 'inputsettings');
                        },
                        msg: _("Host value is required.").t()
                    }
                ],
                'ui.host_regex': [
                    {
                        required: function() {
                            return (this.wizard.get('currentStep') === 'inputsettings') && (this.get('hostSwitch') === 'regex');
                        },
                        msg: _("Host regex value is required.").t()
                    }
                ],
                'ui.host_segment': [
                    {
                        required: function() {
                            return (this.wizard.get('currentStep') === 'inputsettings') && (this.get('hostSwitch') === 'segment');
                        },
                        msg: _("Host segment value is required.").t()
                    }
                ]
            }
        });
    }
);