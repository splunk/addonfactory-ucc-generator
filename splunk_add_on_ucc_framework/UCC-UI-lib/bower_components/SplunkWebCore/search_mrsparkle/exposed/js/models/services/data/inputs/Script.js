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
            url: "data/inputs/script",
            validation: {
                'ui.name': [
                    {
                        required: true,
                        msg: _("Command field is required.").t()
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
                'ui.interval': [
                    {
                        fn: 'checkNumeric'
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
            },
            checkNumeric: function() {
                var intervalSelection = this.get('ui.intervalSelection'),
                    interval = this.get('ui.interval'),
                    inSeconds = (intervalSelection == "In Seconds" || _.isUndefined(intervalSelection));

                if (_.isEmpty(interval)) {
                    return _('Interval field is required.').t();
                }
                if (inSeconds && !interval.match(/^\d*(\.\d+)?$/)) {
                    return _('Interval must be a positive number.').t();
                }
                return false;
            }
        });
    }
);