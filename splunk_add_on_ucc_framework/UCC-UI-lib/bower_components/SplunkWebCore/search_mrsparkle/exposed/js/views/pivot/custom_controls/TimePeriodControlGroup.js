define([
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'util/pivot/config_form_utils'
        ],
        function(
            _,
            module,
            ControlGroup,
            configFormUtils
        ) {

    return ControlGroup.extend({

        moduleId: module.id,

        initialize: function() {
            this.options.label = _('Periods').t();
            this.options.controls = [
                {
                    type: 'SyntheticSelect',
                    options: {
                        model: this.model,
                        modelAttribute: 'period',
                        toggleClassName: 'btn',
                        menuWidth: this.options.menuWidth,
                        popdownOptions: {
                            detachDialog: true
                        },
                        items: [
                            {
                                value: 'auto',
                                label: configFormUtils.splitTimePeriodToDisplay('auto', this.options.showSamples)
                            },
                            {
                                value: 'year',
                                label: configFormUtils.splitTimePeriodToDisplay('year', this.options.showSamples)
                            },
                            {
                                value: 'month',
                                label: configFormUtils.splitTimePeriodToDisplay('month', this.options.showSamples)
                            },
                            {
                                value: 'day',
                                label: configFormUtils.splitTimePeriodToDisplay('day', this.options.showSamples)
                            },
                            {
                                value: 'hour',
                                label: configFormUtils.splitTimePeriodToDisplay('hour', this.options.showSamples)
                            },
                            {
                                value: 'minute',
                                label: configFormUtils.splitTimePeriodToDisplay('minute', this.options.showSamples)
                            },
                            {
                                value: 'second',
                                label: configFormUtils.splitTimePeriodToDisplay('second', this.options.showSamples)
                            }
                        ]

                    }
                }
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});