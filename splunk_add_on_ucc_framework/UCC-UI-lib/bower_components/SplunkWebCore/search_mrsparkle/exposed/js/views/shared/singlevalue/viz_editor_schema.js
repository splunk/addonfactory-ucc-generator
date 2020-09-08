define([
            'underscore',
            'splunk/palettes/ColorCodes',
            'views/shared/controls/SyntheticRadioControl',
            'views/shared/controls/SyntheticSelectControl',
            'views/shared/controls/BooleanRadioControl',
            'views/shared/controls/TextControl',
            'views/shared/vizcontrols/custom_controls/SingleValueDeltaTimeRangeControlGroup',
            'views/shared/vizcontrols/custom_controls/ColorRangesControlGroup',
            'views/shared/singlevalue/ColorModeRadioControl',
            'util/validation',
            'util/general_utils'
    ],
        function(
            _,
            ColorCodes,
            SyntheticRadioControl,
            SyntheticSelectControl,
            BooleanRadioControl,
            TextControl,
            SingleValueDeltaTimeRangeControlGroup,
            ColorRanges,
            ColorModeRadioControl,
            validationUtils,
            generalUtil
        ) {

    var validateTimeRange = function(value) {
        var rangeRegex = /^[-]{1}[0-9]+[smhdwqy]$/,
            monRegex = /^[-]{1}[0-9]+(mon)$/;
        if (value !== 'auto' && (!rangeRegex.test(value) && !monRegex.test(value))) {
            return _('The trend interval must be a positive numeric value.').t();
        }
    };

    var hasBeforeAfterLabel = function(reportContent) {
        var justCleared = !!reportContent.get('singleValueBeforeAfterLabelJustCleared');
        var hasBeforeLabel = !!reportContent.get('display.visualizations.singlevalue.beforeLabel');
        var hasAfterLabel = !!reportContent.get('display.visualizations.singlevalue.afterLabel');
        return (justCleared || hasBeforeLabel || hasAfterLabel);
    };

    var greenHex = '#65a637',
        whiteHex = '#FFFFFF',
        redHex = '#d93f3c';

    return ([
        {
            id: 'general',
            title: _('General').t(),
            formElements: [
                {
                    name: 'display.visualizations.singlevalue.drilldown',
                    label: _("Drilldown").t(),
                    defaultValue: "none",
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: SyntheticRadioControl,
                    controlOptions: {
                        items: [
                            {
                                label: _("Yes").t(),
                                value: 'all'
                            },
                            {
                                label: _("No").t(),
                                value: 'none'
                            }
                        ]
                    }
                },
                {
                    html: '<div class="divider"></div>',
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('is_timeseries')) === true;
                    }
                },
                {
                    name: 'display.visualizations.singlevalue.showTrendIndicator',
                    label: _('Show Trend Indicator').t(),
                    defaultValue: '1',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl,
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('is_timeseries')) === true;
                    }
                },
                {
                    name: 'display.visualizations.singlevalue.trendDisplayMode',
                    label: _('Show Trend in').t(),
                    defaultValue: 'absolute',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: SyntheticRadioControl,
                    controlOptions: {
                        className: 'btn-group',
                        items: [
                            {
                                label: _('Absolute').t(),
                                value: 'absolute',
                                tooltip: _('Absolute').t()
                            },
                            {
                                label: _('Percent').t(),
                                value: 'percent',
                                tooltip: _('Percent').t()
                            }
                        ]
                    },
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('display.visualizations.singlevalue.showTrendIndicator')) === true
                            && generalUtil.normalizeBoolean(reportContent.get('is_timeseries')) === true;
                    }
                },
                {
                    name: 'display.visualizations.singlevalue.trendInterval',
                    label: _('Compared to').t(),
                    defaultValue: 'auto',
                    group: SingleValueDeltaTimeRangeControlGroup,
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('display.visualizations.singlevalue.showTrendIndicator')) === true
                            && generalUtil.normalizeBoolean(reportContent.get('is_timeseries')) === true;
                    },
                    validation: {
                        fn: validateTimeRange
                    }
                },
                {
                    html: '<div class="divider"></div>',
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('is_timeseries')) === true;
                    }
                },
                {   name: 'display.visualizations.singlevalue.beforeLabel',
                    label: _('Before Label').t(),
                    defaultValue: '',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: TextControl,
                    controlOptions: {
                        placeholder: _('optional').t(),
                        inputClassName: 'input-medium'
                    },
                    visibleWhen: hasBeforeAfterLabel
                },
                {
                    name: 'display.visualizations.singlevalue.afterLabel',
                    label: _('After Label').t(),
                    defaultValue: '',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: TextControl,
                    controlOptions: {
                        placeholder: _('optional').t(),
                        inputClassName: 'input-medium'
                    },
                    visibleWhen: hasBeforeAfterLabel
                },
                {
                    html: '<div class="alert alert-viz-control alert-warning"><i class="icon-alert"></i>' + _("Text labels before and after the value are no longer supported. Use Unit for value units and Caption for label text.").t() + '</div>',
                    visibleWhen: hasBeforeAfterLabel
                },
                {
                    name: 'display.visualizations.singlevalue.underLabel',
                    label: _('Caption').t(),
                    defaultValue: '',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: TextControl,
                    controlOptions: {
                        placeholder: _('optional').t(),
                        inputClassName: 'input-medium'
                    }
                },
                {
                    html: '<div class="divider"></div>',
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('is_timeseries')) === true;
                    }
                },
                {
                    name: 'display.visualizations.singlevalue.showSparkline',
                    label: _('Show Sparkline').t(),
                    defaultValue: '1',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl,
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('is_timeseries')) === true;
                    }
                }
            ]
        },
        {
            id: 'color',
            title: _('Color').t(),
            formElements: [
                {
                    name: 'display.visualizations.singlevalue.useColors',
                    label: _('Use Colors').t(),
                    defaultValue: '0',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl
                },
                {
                    name: 'display.visualizations.singlevalue.colorBy',
                    label: _('Color by').t(),
                    defaultValue: 'value',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: SyntheticRadioControl,
                    controlOptions: {
                        items: [
                            {
                                label: _('Value').t(),
                                value: 'value',
                                tooltip: _('Value').t()
                            },
                            {
                                label: _('Trend').t(),
                                value: 'trend',
                                tooltip: _('Trend').t()
                            }
                        ]
                    },
                    enabledWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('is_timeseries')) === true;
                    },
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('display.visualizations.singlevalue.useColors')) === true;
                    }
                },
                {
                    name: 'display.visualizations.singlevalue.trendColorInterpretation',
                    label: _('Trend Interpretation').t(),
                    defaultValue: 'standard',
                    groupOptions: {
                        className: 'control-group single-value-radio-icon-group',
                        controlClass: 'controls-halfblock'
                    },
                    control: ColorModeRadioControl,
                    controlOptions: {
                        className: 'btn-group',
                        items: [
                            {
                                value: 'standard',
                                tooltip: _('Positive values in green').t(),
                                iconSettings:
                                    [{
                                        backgroundColor: 'transparent',
                                        fontColor: greenHex,
                                        type: 'indicator',
                                        indicatorMode: 'increase'
                                    },
                                    {
                                        backgroundColor: 'transparent',
                                        fontColor: redHex,
                                        type: 'indicator',
                                        indicatorMode: 'decrease'
                                    }]
                            },
                            {
                                value: 'inverse',
                                tooltip: _('Negative values in green').t(),
                                iconSettings:
                                    [{
                                        backgroundColor: 'transparent',
                                        fontColor: redHex,
                                        type: 'indicator',
                                        indicatorMode: 'increase'
                                    },
                                    {
                                        backgroundColor: 'transparent',
                                        fontColor: greenHex,
                                        type: 'indicator',
                                        indicatorMode: 'decrease'
                                    }]
                            }
                        ]
                    },
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('display.visualizations.singlevalue.useColors')) === true
                            && generalUtil.normalizeBoolean(reportContent.get('display.visualizations.singlevalue.showTrendIndicator')) === true
                            && reportContent.get('display.visualizations.singlevalue.colorBy') === 'trend';
                    }
                },
                {
                    name: 'display.visualizations.singlevalue.rangeValues',
                    group: ColorRanges,
                    groupOptions: {
                        controlClass: 'controls-block',
                        rangeColorsName: 'display.visualizations.singlevalue.rangeColors',
                        // SPL-120267, defaultColors and defaultRangeValues must match the singlevalue
                        // defaults in savedsearches.conf.in, don't forget to update it or it will generate options
                        defaultColors: ColorCodes.toPrefixed(ColorCodes.SEMANTIC.slice(0, 5), '0x'),
                        defaultRangeValues: [0, 30, 70, 100],
                        paletteColors: ColorCodes.SEMANTIC.slice(0, 5).concat('#555'),
                        displayMinMaxLabels: true
                    },
                    validation: {
                        fn: validationUtils.validateRangeValues
                    },
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('display.visualizations.singlevalue.useColors')) === true
                            && reportContent.get('display.visualizations.singlevalue.colorBy') === 'value';
                    }
                },
                {
                    name: 'display.visualizations.singlevalue.colorMode',
                    label: _('Color Mode').t(),
                    defaultValue: 'none',
                    groupOptions: {
                        className: 'control-group single-value-radio-icon-group',
                        controlClass: 'controls-halfblock'
                    },
                    control: ColorModeRadioControl,
                    controlOptions: {
                        items: [
                            {
                                value: 'none',
                                tooltip: _('No background').t(),
                                iconSettings: [{
                                    backgroundColor: 'transparent',
                                    fontColor: greenHex,
                                    type: 'colorMode'
                                }]
                            },
                            {
                                value: 'block',
                                tooltip: _('Block background').t(),
                                iconSettings: [{
                                    backgroundColor: greenHex,
                                    fontColor: whiteHex,
                                    type: 'colorMode'
                                }]
                            }
                        ]
                    },
                    visibleWhen: function(reportContent) {
                        return generalUtil.normalizeBoolean(reportContent.get('display.visualizations.singlevalue.useColors')) === true;
                    }
                }
            ]
        },
        {
            id: 'numberFormat',
            title: _('Number Format').t(),
            formElements: [
                {
                    name: 'display.visualizations.singlevalue.numberPrecision',
                    label: _('Precision').t(),
                    defaultValue: '0',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: SyntheticSelectControl,
                    controlOptions: {
                        items: [
                            {
                                label: _('0').t(),
                                value: '0'
                            },
                            {
                                label: _('0.0').t(),
                                value: '0.0'
                            },
                            {
                                label: _('0.00').t(),
                                value: '0.00'
                            },
                            {
                                label: _('0.000').t(),
                                value: '0.000'
                            },
                            {
                                label: _('0.0000').t(),
                                value: '0.0000'
                            }
                        ],
                        toggleClassName: 'btn'
                    }
                },
                {
                    name: 'display.visualizations.singlevalue.useThousandSeparators',
                    label: _('Use Thousand Separators').t(),
                    defaultValue: '1',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl
                },
                {
                    name: 'display.visualizations.singlevalue.unit',
                    label: _('Unit').t(),
                    defaultValue: '',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: TextControl,
                    controlOptions: {
                        placeholder: _('optional').t(),
                        inputClassName: 'input-medium'
                    }
                },
                {
                    html: '<div class="alert alert-viz-control alert-warning"><i class="icon-alert"></i>' + _("Units override previous labels before and after the value. Move label text to Caption.").t() + '</div>',
                    visibleWhen: hasBeforeAfterLabel
                },
                {
                    name: 'display.visualizations.singlevalue.unitPosition',
                    label: _('Unit Position').t(),
                    defaultValue: 'after',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: SyntheticRadioControl,
                    controlOptions: {
                        className: 'btn-group',
                        items: [
                            {
                                label: _('Before').t(),
                                value: 'before',
                                tooltip: _('Before').t()
                            },
                            {
                                label: _('After').t(),
                                value: 'after',
                                tooltip: _('After').t()
                            }
                        ]
                    }
                }
            ]
        }
    ]);
            
});