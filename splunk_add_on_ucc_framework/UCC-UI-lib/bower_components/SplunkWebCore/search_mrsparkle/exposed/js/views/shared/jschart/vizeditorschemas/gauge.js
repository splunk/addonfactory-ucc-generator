define([
            'underscore',
            'views/shared/controls/SyntheticRadioControl',
            'views/shared/vizcontrols/custom_controls/GaugeAutoRangesControlGroup',
            'views/shared/vizcontrols/custom_controls/ColorRangesControlGroup',
            'util/validation',
            'util/math_utils'
        ],
        function(
            _,
            SyntheticRadioControl,
            GaugeAutoRangesControlGroup,
            ColorRanges,
            validationUtils,
            mathUtils
        ) {

    return ([
        {
            id: 'general',
            title: _('General').t(),
            formElements: [
                {
                    name: 'display.visualizations.charting.chart.style',
                    label: _('Style').t(),
                    defaultValue: 'shiny',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: SyntheticRadioControl,
                    controlOptions: {
                        items: [
                            {
                                label: _('Minimal').t(),
                                value: 'minimal'
                            },
                            {
                                label: _('Shiny').t(),
                                value: 'shiny'
                            }
                        ]
                    }
                }
            ]
        },
        {
            id: 'ranges',
            title: _('Color Ranges').t(),
            formElements: [
                {
                    name: 'autoMode',
                    group: GaugeAutoRangesControlGroup,
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    }
                },
                {
                    name: 'display.visualizations.charting.chart.rangeValues',
                    group: ColorRanges,
                    groupOptions: {
                        controlClass: 'controls-block',
                        rangeColorsName: 'display.visualizations.charting.gaugeColors',
                        paletteColors: [
                            '#7e9f44',
                            '#ebe42d',
                            '#d13b3b',
                            '#6cb8ca',
                            '#f7912c',
                            '#956e96',
                            '#c2da8a',
                            '#fac61d',
                            '#ebb7d0',
                            '#324969',
                            '#d85e3d',
                            '#a04558'],
                        displayMinMaxLabels: false
                    },
                    visibleWhen: function(reportModel) {
                        return reportModel.get('autoMode') === '0';
                    },
                    validation: {
                        fn: validationUtils.validateRangeValues
                    }
                }
            ]
        }
    ]);

});