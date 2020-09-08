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
            url: "data/inputs/win-event-log-collections",
            urlRoot: "data/inputs/win-event-log-collections",
            validation: {
                'ui.name': [
                    {
                        required: true,
                        msg: _("Collection name is required.").t()
                    },
                    {
                        pattern: /^[\w\s\.@~\-]+$/g,
                        msg: _("Collection name can can only contain alphanumeric characters, spaces, underscores, dashes, periods, tildes, or at signs.").t()
                    },
                    {
                        fn: '_checkInputExists'
                    }
                ],
                'ui.lookup_host': [
                    {
                        required: true,
                        msg: _("Lookup host value is required.").t()
                    }
                ],
                'ui.logs': [
                    {
                        required: function() {
                            return this.wizard.get('inputType') === 'evt_logs_remote';
                        },
                        msg: _("At least one log must be selected.").t()
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
            _checkInputExists: function() {
                if (this.entry.get('name') === 'localhost') {
                    // skip local event logs from validation
                    return;
                }
                this.checkInputExists();
            }
        });
    }
);