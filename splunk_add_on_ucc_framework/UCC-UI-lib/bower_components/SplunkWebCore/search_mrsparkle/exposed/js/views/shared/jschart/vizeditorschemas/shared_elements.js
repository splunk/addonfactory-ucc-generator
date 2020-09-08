define([
            'underscore',
            'views/shared/controls/SyntheticSelectControl',
            'views/shared/controls/SyntheticRadioControl',
            'views/shared/controls/BooleanRadioControl',
            'views/shared/controls/TextControl',
            'views/shared/vizcontrols/custom_controls/AxisTitleControlGroup',
            'views/shared/vizcontrols/custom_controls/OverlayFieldsControlGroup',
            'util/validation',
            'splunk.util'
        ],
        function(
            _,
            SyntheticSelectControl,
            SyntheticRadioControl,
            BooleanRadioControl,
            TextControl,
            AxisTitleControlGroup,
            OverlayFieldsControlGroup,
            validationUtils,
            splunkUtils
        ) {

    var validateYScaleAndStacking = function(value, attr, computedState) {
        // SPL-77030, since line/scatter/bubble charts ignore stack mode, this validation rule does not apply
        var chartType = computedState['display.visualizations.charting.chart'];
        if(chartType in { line: true, scatter: true, bubble: true }) {
            return;
        }
        var yAxisScale = attr === 'display.visualizations.charting.axisY.scale' ? value :
                                        computedState['display.visualizations.charting.axisY.scale'],
            stackMode = attr === 'display.visualizations.charting.chart.stackMode' ? value :
                                        computedState['display.visualizations.charting.chart.stackMode'];

        if(yAxisScale === 'log' && stackMode && stackMode !== 'default') {
            return _('Log scale and stacking cannot be enabled at the same time.').t();
        }
    };

    var validateXAxisMinMax = validationUtils.minMaxValidationGenerator(
        'display.visualizations.charting.axisX.minimumNumber',
        'display.visualizations.charting.axisX.maximumNumber',
        _('The X-Axis Min Value must be less than the Max Value.').t()
    );

    var validateYAxisMinMax = validationUtils.minMaxValidationGenerator(
        'display.visualizations.charting.axisY.minimumNumber',
        'display.visualizations.charting.axisY.maximumNumber',
        _('The Y-Axis Min Value must be less than the Max Value.').t()
    );

    var validateYAxis2MinMax = validationUtils.minMaxValidationGenerator(
        'display.visualizations.charting.axisY2.minimumNumber',
        'display.visualizations.charting.axisY2.maximumNumber',
        _('The Y-Axis Min Value must be less than the Max Value.').t()
    );

    return ({

        DRILLDOWN: {
            name: 'display.visualizations.charting.drilldown',
            label: _('Drilldown').t(),
            defaultValue: 'all',
            groupOptions: {
                controlClass: 'controls-halfblock'
            },
            control: SyntheticRadioControl,
            controlOptions: {
                items: [
                    {
                        label: _('Yes').t(),
                        value: 'all'
                    },
                    {
                        label: _('No').t(),
                        value: 'none'
                    }
                ]
            }
        },
        
        STACK_MODE: {
            name: 'display.visualizations.charting.chart.stackMode',
            label: _('Stack Mode').t(),
            defaultValue: 'default',
            groupOptions: {
                controlClass: 'controls-thirdblock'
            },
            control: SyntheticRadioControl,
            controlOptions: {
                items: [
                    {
                        value: 'default',
                        icon: 'bar-beside',
                        tooltip: _('not stacked').t()
                    },
                    {
                        value: 'stacked',
                        icon: 'bar-stacked',
                        tooltip: _('stacked').t()
                    },
                    {
                        value: 'stacked100',
                        icon: 'bar-stacked-100',
                        tooltip: _('stacked 100%').t()
                    }
                ]
            },
            validation: {
                fn: validateYScaleAndStacking
            }
        },

        NULL_VALUE_MODE: {
            name: 'display.visualizations.charting.chart.nullValueMode',
            label: _('Null Values').t(),
            defaultValue: 'gaps',
            groupOptions: {
                controlClass: 'controls-thirdblock'
            },
            control: SyntheticRadioControl,
            controlOptions: {
                items: [
                    {
                        value: 'gaps',
                        icon: 'missing-value-skipped',
                        tooltip: _('Gaps').t()
                    },
                    {
                        value: 'zero',
                        icon: 'missing-value-zero',
                        tooltip: _('Zero').t()
                    },
                    {
                        value: 'connect',
                        icon: 'missing-value-join',
                        tooltip: _('Connect').t()
                    }
                ]
            }
        },

        MULTI_SERIES: {
            name: 'display.visualizations.charting.layout.splitSeries',
            label: _('Multi-series Mode').t(),
            defaultValue: '0',
            groupOptions: {
                controlClass: 'controls-halfblock'
            },
            control: BooleanRadioControl
        },

        SHOW_DATA_VALUES: {
            name: 'display.visualizations.charting.chart.showDataLabels',
            label: _('Show Data Values').t(),
            defaultValue: 'none',
            groupOptions: {
                controlClass: 'controls-fill'
            },
            control: SyntheticRadioControl,
            controlOptions: {
                items: [
                    {
                        label: _('Off').t(),
                        value: 'none'
                    },
                    {
                        label: _('On').t(),
                        value: 'all'
                    },
                    {
                        label: _('Min/Max').t(),
                        value: 'minmax'
                    }
                ]
            }
        },

        X_AXIS_TITLE: {
            name: 'display.visualizations.charting.axisTitleX.text',
            label: _('Title').t(),
            defaultValue: '',
            group: AxisTitleControlGroup,
            groupOptions: {
                axisType: AxisTitleControlGroup.X_AXIS,
                controlClass: 'controls-block'
            }
        },

        X_AXIS_LABEL_ELISION: {
            name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.overflowMode',
            label: _('Label Truncation').t(),
            defaultValue: 'ellipsisNone',
            control: SyntheticRadioControl,
            controlOptions: {
                items: [
                    {
                        label: _('Yes').t(),
                        value: 'ellipsisMiddle'
                    },
                    {
                        label: _('No').t(),
                        value: 'ellipsisNone'
                    }
                ]
            },
            enabledWhen: function(reportModel) {
                return reportModel.get('display.visualizations.charting.axisLabelsX.majorLabelStyle.rotation') !== '0';
            }
        },

        X_AXIS_LABEL_ROTATION: {
            name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.rotation',
            label: _('Label Rotation').t(),
            defaultValue: '0',
            control: SyntheticRadioControl,
            controlOptions: {
                items: [
                    {
                        value: '-90',
                        icon: 'label-rotation--90',
                        tooltip: '-90&deg;'
                    },
                    {
                        value: '-45',
                        icon: 'label-rotation--45',
                        tooltip: '-45&deg;'
                    },
                    {
                        value: '0',
                        icon: 'label-rotation-0',
                        tooltip: '0&deg;'
                    },
                    {
                        value: '45',
                        icon: 'label-rotation-45',
                        tooltip: '45&deg;'
                    },
                    {
                        value: '90',
                        icon: 'label-rotation-90',
                        tooltip: '90&deg;'
                    }
                ]
            }
        },

        X_AXIS_SCALE: {
            name: 'display.visualizations.charting.axisX.scale',
            label: _('Scale').t(),
            defaultValue: 'linear',
            groupOptions: {
                controlClass: 'controls-halfblock'
            },
            control: SyntheticRadioControl,
            controlOptions: {
                className: 'btn-group locale-responsive-layout',
                items: [
                    {
                        label: _("Linear").t(),
                        value: 'linear'
                    },
                    {
                        label: _("Log").t(),
                        value: 'log'
                    }
                ]
            }
        },

        X_AXIS_INTERVAL: {
            name: 'display.visualizations.charting.axisLabelsX.majorUnit',
            label: _('Interval').t(),
            defaultValue: '',
            control: TextControl,
            controlOptions: {
                placeholder: _('optional').t(),
                inputClassName: 'input-medium'
            },
            validation: {
                fn: validationUtils.positiveNumberOrAutoValidationGenerator(_('X-Axis Interval').t()),
                required: false
            },
            visibleWhen: function(reportModel) {
                return reportModel.get('display.visualizations.charting.axisX.scale') !== 'log';
            }
        },

        X_AXIS_MIN: {
            name: 'display.visualizations.charting.axisX.minimumNumber',
            label: _('Min Value').t(),
            defaultValue: '',
            control: TextControl,
            controlOptions: {
                placeholder: _('optional').t(),
                inputClassName: 'input-medium'
            },
            validation: [
                {
                    fn: validationUtils.numberOrAutoValidationGenerator(_('X-Axis Min Value').t()),
                    required: false
                },
                {
                    fn: validateXAxisMinMax
                }
            ]
        },

        X_AXIS_MAX: {
            name: 'display.visualizations.charting.axisX.maximumNumber',
            label: _('Max Value').t(),
            defaultValue: '',
            control: TextControl,
            controlOptions: {
                placeholder: _('optional').t(),
                inputClassName: 'input-medium'
            },
            validation: [
                {
                    fn: validationUtils.numberOrAutoValidationGenerator(_('X-Axis Max Value').t()),
                    required: false
                },
                {
                    fn: validateXAxisMinMax
                }
            ]
        },

        Y_AXIS_TITLE: {
            name: 'display.visualizations.charting.axisTitleY.text',
            label: _('Title').t(),
            defaultValue: '',
            group: AxisTitleControlGroup,
            groupOptions: {
                axisType: AxisTitleControlGroup.Y_AXIS,
                controlClass: 'controls-block'
            }
        },

        Y_AXIS_SCALE: {
            name: 'display.visualizations.charting.axisY.scale',
            label: _('Scale').t(),
            defaultValue: 'linear',
            groupOptions: {
                controlClass: 'controls-halfblock'
            },
            control: SyntheticRadioControl,
            controlOptions: {
                className: 'btn-group locale-responsive-layout',
                items: [
                    {
                        label: _("Linear").t(),
                        value: 'linear'
                    },
                    {
                        label: _("Log").t(),
                        value: 'log'
                    }
                ]
            },
            validation: {
                fn: validateYScaleAndStacking
            }
        },

        Y_AXIS_RANGE: {
            name: 'display.visualizations.charting.layout.splitSeries.allowIndependentYRanges',
            label: _('Axis Range').t(),
            defaultValue: '0',
            groupOptions: {
                controlClass: 'controls-halfblock'
            },
            control: BooleanRadioControl,
            controlOptions: {
                trueLabel: _("Independent").t(),
                falseLabel: _("Uniform").t(),
                className: 'btn-group locale-responsive-layout',
                reversed: true
            },
            visibleWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.charting.layout.splitSeries'));
            }
        },

        Y_AXIS_INTERVAL: {
            name: 'display.visualizations.charting.axisLabelsY.majorUnit',
            label: _('Interval').t(),
            defaultValue: '',
            control: TextControl,
            controlOptions: {
                placeholder: _('optional').t(),
                inputClassName: 'input-medium'
            },
            validation: {
                fn: validationUtils.positiveNumberOrAutoValidationGenerator(_('Y-Axis Interval').t()),
                required: false
            },
            visibleWhen: function(reportModel) {
                return reportModel.get('display.visualizations.charting.axisY.scale') !== 'log';
            },
            enabledWhen: function(reportModel) {
                var splitSeries = splunkUtils.normalizeBoolean(
                    reportModel.get('display.visualizations.charting.layout.splitSeries')
                );
                var independentYRanges = splunkUtils.normalizeBoolean(
                    reportModel.get('display.visualizations.charting.layout.splitSeries.allowIndependentYRanges')
                );
                return !(splitSeries && independentYRanges);
            }
        },

        Y_AXIS_MIN: {
            name: 'display.visualizations.charting.axisY.minimumNumber',
            label: _('Min Value').t(),
            defaultValue: '',
            control: TextControl,
            controlOptions: {
                placeholder: _('optional').t(),
                inputClassName: 'input-medium'
            },
            validation: [
                {
                    fn: validationUtils.numberOrAutoValidationGenerator(_('Y-Axis Min Value').t()),
                    required: false
                },
                {
                    fn: validateYAxisMinMax
                }
            ],
            enabledWhen: function(reportModel) {
                var splitSeries = splunkUtils.normalizeBoolean(
                    reportModel.get('display.visualizations.charting.layout.splitSeries')
                );
                var independentYRanges = splunkUtils.normalizeBoolean(
                    reportModel.get('display.visualizations.charting.layout.splitSeries.allowIndependentYRanges')
                );
                return !(splitSeries && independentYRanges);
            }
        },

        Y_AXIS_MAX: {
            name: 'display.visualizations.charting.axisY.maximumNumber',
            label: _('Max Value').t(),
            defaultValue: '',
            control: TextControl,
            controlOptions: {
                placeholder: _('optional').t(),
                inputClassName: 'input-medium'
            },
            validation: [
                {
                    fn: validationUtils.numberOrAutoValidationGenerator(_('Y-Axis Max Value').t()),
                    required: false
                },
                {
                    fn: validateYAxisMinMax
                }
            ],
            enabledWhen: function(reportModel) {
                var splitSeries = splunkUtils.normalizeBoolean(
                    reportModel.get('display.visualizations.charting.layout.splitSeries')
                );
                var independentYRanges = splunkUtils.normalizeBoolean(
                    reportModel.get('display.visualizations.charting.layout.splitSeries.allowIndependentYRanges')
                );
                return !(splitSeries && independentYRanges);
            }
        },

        OVERLAY_FIELDS: {
            name: 'display.visualizations.charting.chart.overlayFields',
            label: _('Overlay').t(),
            defaultValue: '',
            group: OverlayFieldsControlGroup,
            groupOptions: {
                controlClass: 'controls-block'
            }
        },

        Y_AXIS_2_ENABLED: {
            name: 'display.visualizations.charting.axisY2.enabled',
            label: _('View as Axis').t(),
            defaultValue: '0',
            groupOptions: {
                controlClass: 'controls-halfblock'
            },
            control: BooleanRadioControl,
            controlOptions: {
                trueLabel: _('On').t(),
                falseLabel: _('Off').t()
            },
            enabledWhen: function(reportModel) {
                return !!reportModel.get('display.visualizations.charting.chart.overlayFields');
            }
        },
        
        Y_AXIS_2_TITLE: {
            name: 'display.visualizations.charting.axisTitleY2.text',
            label: _('Title').t(),
            defaultValue: '',
            group: AxisTitleControlGroup,
            groupOptions: {
                axisType: AxisTitleControlGroup.Y_AXIS_2,
                controlClass: 'controls-block'
            },
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.charting.axisY2.enabled'));
            }
        },

        Y_AXIS_2_SCALE: {
            name: 'display.visualizations.charting.axisY2.scale',
            label: _('Scale').t(),
            defaultValue: 'inherit',
            groupOptions: {
                controlClass: 'controls-thirdblock'
            },
            control: SyntheticRadioControl,
            controlOptions: {
                className: 'btn-group locale-responsive-layout',
                items: [
                    {
                        label: _('Inherit').t(),
                        value: 'inherit'
                    },
                    {
                        label: _('Linear').t(),
                        value: 'linear'
                    },
                    {
                        label: _('Log').t(),
                        value: 'log'
                    }
                ]
            },
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.charting.axisY2.enabled'));
            }
        },

        Y_AXIS_2_INTERVAL: {
            name: 'display.visualizations.charting.axisLabelsY2.majorUnit',
            label: _('Interval').t(),
            defaultValue: '',
            groupOptions: {
                controlClass: 'controls-block'
            },
            control: TextControl,
            controlOptions: {
                placeholder: _('optional').t(),
                inputClassName: 'input-medium'
            },
            validation: {
                fn: validationUtils.positiveNumberOrAutoValidationGenerator(_('Y-Axis Interval').t()),
                required: false
            },
            visibleWhen: function(reportModel) {
                var axisY2Scale = reportModel.get('display.visualizations.charting.axisY2.scale');
                if (axisY2Scale === 'log') {
                    return false;
                }
                return (axisY2Scale !== 'inherit' || reportModel.get('display.visualizations.charting.axisY.scale') !== 'log');
            },
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.charting.axisY2.enabled'));
            }
        },

        Y_AXIS_2_MIN: {
            name: 'display.visualizations.charting.axisY2.minimumNumber',
            label: _('Min Value').t(),
            defaultValue: '',
            control: TextControl,
            controlOptions: {
                placeholder: _('optional').t(),
                inputClassName: 'input-medium'
            },
            validation: [
                {
                    fn: validationUtils.numberOrAutoValidationGenerator(_('Y-Axis Min Value').t()),
                    required: false
                },
                {
                    fn: validateYAxis2MinMax
                }
            ],
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.charting.axisY2.enabled'));
            }
        },

        Y_AXIS_2_MAX: {
            name: 'display.visualizations.charting.axisY2.maximumNumber',
            label: _('Max Value').t(),
            defaultValue: '',
            control: TextControl,
            controlOptions: {
                placeholder: _('optional').t(),
                inputClassName: 'input-medium'
            },
            validation: [
                {
                    fn: validationUtils.numberOrAutoValidationGenerator(_('Y-Axis Max Value').t()),
                    required: false
                },
                {
                    fn: validateYAxis2MinMax
                }
            ],
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.charting.axisY2.enabled'));
            }
        },

        LEGEND_PLACEMENT: {
            name: 'display.visualizations.charting.legend.placement',
            label: _('Legend Position').t(),
            defaultValue: 'right',
            groupOptions: {
                controlClass: 'controls-block'
            },
            control: SyntheticSelectControl,
            controlOptions: {
                items: [
                    {
                        label: _('Right').t(),
                        value: 'right'
                    },
                    {
                        label: _('Bottom').t(),
                        value: 'bottom'
                    },
                    {
                        label: _('Left').t(),
                        value: 'left'
                    },
                    {
                        label: _('Top').t(),
                        value: 'top'
                    },
                    {
                        label: _('None').t(),
                        value: 'none'
                    }
                ],
                toggleClassName: 'btn'
            }
        },

        LEGEND_TRUNCATION: {
            name: 'display.visualizations.charting.legend.labelStyle.overflowMode',
            label: _('Legend Truncation').t(),
            defaultValue: 'ellipsisMiddle',
            groupOptions: {
                controlClass: 'controls-thirdblock'
            },
            control: SyntheticRadioControl,
            controlOptions: {
                items: [
                    {
                        label: _('A...').t(),
                        value: 'ellipsisEnd',
                        tooltip: _('Truncate End').t()
                    },
                    {
                        label: _('A...Z').t(),
                        value: 'ellipsisMiddle',
                        tooltip: _('Truncate Middle').t()
                    },
                    {
                        label: _('...Z').t(),
                        value: 'ellipsisStart',
                        tooltip: _('Truncate Start').t()
                    }
                ]
            }
        }

    });

});