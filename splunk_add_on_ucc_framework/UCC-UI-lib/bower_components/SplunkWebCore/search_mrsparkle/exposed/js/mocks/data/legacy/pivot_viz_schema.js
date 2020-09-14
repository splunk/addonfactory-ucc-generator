var _ = function(str) { return { t: function() { return str; } }; };

var GAUGE_COLORS = [
    "#7e9f44",
    "#ebe42d",
    "#d13b3b",
    "#6cb8ca",
    "#f7912c",
    "#956e96",
    "#c2da8a",
    "#fac61d",
    "#ebb7d0",
    "#324969",
    "#d85e3d",
    "#a04558"
];

var EXPECTED_SCHEMA = {

    statsTable: {
        id: 'statistics',
        icon: 'table',
        label: 'Statistics Table',
        requiresIndexTime: false
    },

    column: {
        "id": "column",
        "icon": "chart-column",
        "label": "Column Chart",
        "requiresIndexTime": false,
        "reportLevelAttributes": {
            "showRowSummary": "false",
            "showColSummary": "false"
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "elementType": "row",
                "title": "X-Axis",
                "maxLength": 1,
                "required": true,
                "id": "xaxis",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": true
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitSortControlGroup"
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row",
                            "label": "Max Columns"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row",
                            "label": "Max Columns"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.rotation',
                        label: _('Label Rotation').t(),
                        defaultValue: '0',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.overflowMode',
                        label: _('Label Truncation').t(),
                        defaultValue: 'ellipsisNone',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "Y-Axis",
                "maxLength": 1,
                "required": true,
                "id": "yaxis",
                "outputType": "metric",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": false
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisY.scale',
                        label: _('Scale').t(),
                        defaultValue: 'linear',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.layout.splitSeries.allowIndependentYRanges',
                        label: _('Axis range').t(),
                        defaultValue: '0',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl',
                        controlOptions: {
                            trueLabel: _("Independent").t(),
                            falseLabel: _("Uniform").t(),
                            className: 'btn-group locale-responsive-layout',
                            reversed: true
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisLabelsY.majorUnit',
                        label: _('Interval').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.minimumNumber',
                        label: _('Min Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.maximumNumber',
                        label: _('Max Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    }
                ]
            },
            {
                "elementType": "column",
                "title": "Color",
                "maxLength": 1,
                "id": "color",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "column",
                            "label": "Max Colors"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "column",
                            "label": "Max Colors"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.legend.placement',
                        label: _('Legend Position').t(),
                        defaultValue: 'right',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/SyntheticSelectControl',
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
                    {
                        name: 'display.visualizations.charting.legend.labelStyle.overflowMode',
                        label: _('Legend Truncation').t(),
                        defaultValue: 'ellipsisMiddle',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.chart.stackMode',
                        label: _('Stack Mode').t(),
                        defaultValue: 'default',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    },
                    {
                        name: 'display.visualizations.charting.layout.splitSeries',
                        label: _('Multi-series Mode').t(),
                        defaultValue: '0',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl'
                    },
                    {
                        name: 'display.visualizations.charting.drilldown',
                        label: _('Drilldown').t(),
                        defaultValue: 'none',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.chart.showDataLabels',
                        label: _('Show Data Values').t(),
                        defaultValue: 'none',
                        groupOptions: {
                            controlClass: 'controls-fill'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    }
                ]
            }
        ]
    },

    bar: {
        "id": "bar",
        "icon": "chart-bar",
        "label": "Bar Chart",
        "requiresIndexTime": false,
        "reportLevelAttributes": {
            "showRowSummary": "false",
            "showColSummary": "false"
        },
       "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "elementType": "row",
                "title": "X-Axis",
                "description": "X-Axis (Bars)",
                "maxLength": 1,
                "required": true,
                "id": "xaxis",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": true
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitSortControlGroup"
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row",
                            "label": "Max Bars"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row",
                            "label": "Max Bars"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "Y-Axis",
                "description": "Y-Axis (Bar Width)",
                "maxLength": 1,
                "required": true,
                "id": "yaxis",
                "outputType": "metric",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": false
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisY.scale',
                        label: _('Scale').t(),
                        defaultValue: 'linear',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.layout.splitSeries.allowIndependentYRanges',
                        label: _('Axis range').t(),
                        defaultValue: '0',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl',
                        controlOptions: {
                            trueLabel: _("Independent").t(),
                            falseLabel: _("Uniform").t(),
                            className: 'btn-group locale-responsive-layout',
                            reversed: true
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisLabelsY.majorUnit',
                        label: _('Interval').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.minimumNumber',
                        label: _('Min Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.maximumNumber',
                        label: _('Max Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    }
                ]
            },
            {
                "elementType": "column",
                "title": "Color",
                "maxLength": 1,
                "id": "color",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "column",
                            "label": "Max Colors"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "column",
                            "label": "Max Colors"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.legend.placement',
                        label: _('Legend Position').t(),
                        defaultValue: 'right',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/SyntheticSelectControl',
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
                    {
                        name: 'display.visualizations.charting.legend.labelStyle.overflowMode',
                        label: _('Legend Truncation').t(),
                        defaultValue: 'ellipsisMiddle',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.chart.stackMode',
                        label: _('Stack Mode').t(),
                        defaultValue: 'default',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    },
                    {
                        name: 'display.visualizations.charting.layout.splitSeries',
                        label: _('Multi-series Mode').t(),
                        defaultValue: '0',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl'
                    },
                    {
                        name: 'display.visualizations.charting.drilldown',
                        label: _('Drilldown').t(),
                        defaultValue: 'all',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.chart.showDataLabels',
                        label: _('Show Data Values').t(),
                        defaultValue: 'none',
                        groupOptions: {
                            controlClass: 'controls-fill'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    }
                ]
            }
        ]
    },

    area: {
        "id": "area",
        "icon": "chart-area",
        "label": "Area Chart",
        "requiresIndexTime": true,
        "reportLevelAttributes": {
            "showRowSummary": "false",
            "showColSummary": "false"
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "elementType": "row",
                "title": "X-Axis",
                "description": "X-Axis (Time)",
                "maxLength": 1,
                "required": true,
                "id": "xaxis",
                "dataTypes": [
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": true
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitSortControlGroup"
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.rotation',
                        label: _('Label Rotation').t(),
                        defaultValue: '0',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.overflowMode',
                        label: _('Label Truncation').t(),
                        defaultValue: 'ellipsisNone',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "Y-Axis",
                "maxLength": 1,
                "required": true,
                "id": "yaxis",
                "outputType": "metric",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": false
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisY.scale',
                        label: _('Scale').t(),
                        defaultValue: 'linear',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.layout.splitSeries.allowIndependentYRanges',
                        label: _('Axis range').t(),
                        defaultValue: '0',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl',
                        controlOptions: {
                            trueLabel: _("Independent").t(),
                            falseLabel: _("Uniform").t(),
                            className: 'btn-group locale-responsive-layout',
                            reversed: true
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisLabelsY.majorUnit',
                        label: _('Interval').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.minimumNumber',
                        label: _('Min Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.maximumNumber',
                        label: _('Max Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    }
                ]
            },
            {
                "elementType": "column",
                "title": "Color",
                "description": "Color (Areas)",
                "maxLength": 1,
                "id": "color",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "column",
                            "label": "Max Areas"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "column",
                            "label": "Max Areas"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.legend.placement',
                        label: _('Legend Position').t(),
                        defaultValue: 'right',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/SyntheticSelectControl',
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
                    {
                        name: 'display.visualizations.charting.legend.labelStyle.overflowMode',
                        label: _('Legend Truncation').t(),
                        defaultValue: 'ellipsisMiddle',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.chart.stackMode',
                        label: _('Stack Mode').t(),
                        defaultValue: 'default',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    },
                    {
                        name: 'display.visualizations.charting.chart.nullValueMode',
                        label: _('Null Values').t(),
                        defaultValue: 'gaps',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.layout.splitSeries',
                        label: _('Multi-series Mode').t(),
                        defaultValue: '0',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl'
                    },
                    {
                        name: 'display.visualizations.charting.drilldown',
                        label: _('Drilldown').t(),
                        defaultValue: 'all',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.chart.showDataLabels',
                        label: _('Show Data Values').t(),
                        defaultValue: 'none',
                        groupOptions: {
                            controlClass: 'controls-fill'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    }
                ]
            }
        ]
    },

    line: {
        "id": "line",
        "icon": "chart-line",
        "label": "Line Chart",
        "requiresIndexTime": true,
        "reportLevelAttributes": {
            "showRowSummary": "false",
            "showColSummary": "false"
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "elementType": "row",
                "title": "X-Axis",
                "description": "X-Axis (Time)",
                "maxLength": 1,
                "required": true,
                "id": "xaxis",
                "dataTypes": [
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": true
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitSortControlGroup"
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.rotation',
                        label: _('Label Rotation').t(),
                        defaultValue: '0',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.overflowMode',
                        label: _('Label Truncation').t(),
                        defaultValue: 'ellipsisNone',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "Y-Axis",
                "maxLength": 1,
                "required": true,
                "id": "yaxis",
                "outputType": "metric",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": false
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisY.scale',
                        label: _('Scale').t(),
                        defaultValue: 'linear',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.layout.splitSeries.allowIndependentYRanges',
                        label: _('Axis range').t(),
                        defaultValue: '0',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl',
                        controlOptions: {
                            trueLabel: _("Independent").t(),
                            falseLabel: _("Uniform").t(),
                            className: 'btn-group locale-responsive-layout',
                            reversed: true
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisLabelsY.majorUnit',
                        label: _('Interval').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.minimumNumber',
                        label: _('Min Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.maximumNumber',
                        label: _('Max Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    }
                ]
            },
            {
                "elementType": "column",
                "title": "Color",
                "description": "Color (Lines)",
                "maxLength": 1,
                "id": "color",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "column",
                            "label": "Max Lines"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "column",
                            "label": "Max Lines"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.legend.placement',
                        label: _('Legend Position').t(),
                        defaultValue: 'right',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/SyntheticSelectControl',
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
                    {
                        name: 'display.visualizations.charting.legend.labelStyle.overflowMode',
                        label: _('Legend Truncation').t(),
                        defaultValue: 'ellipsisMiddle',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.chart.nullValueMode',
                        label: _('Null Values').t(),
                        defaultValue: 'gaps',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.layout.splitSeries',
                        label: _('Multi-series Mode').t(),
                        defaultValue: '0',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl'
                    },
                    {
                        name: 'display.visualizations.charting.drilldown',
                        label: _('Drilldown').t(),
                        defaultValue: 'all',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.chart.showDataLabels',
                        label: _('Show Data Values').t(),
                        defaultValue: 'none',
                        groupOptions: {
                            controlClass: 'controls-fill'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    }
                ]
            }
        ]

    },

    pie: {
        "id": "pie",
        "icon": "chart-pie",
        "label": "Pie Chart",
        "requiresIndexTime": false,
        "reportLevelAttributes": {
            "showRowSummary": "false",
            "showColSummary": "false"
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "elementType": "row",
                "title": "Color",
                "maxLength": 1,
                "required": true,
                "id": "color",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/LabelControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number",
                                "boolean"
                            ]
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitSortControlGroup"
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "Size",
                "maxLength": 1,
                "required": true,
                "id": "size",
                "outputType": "metric",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/LabelControlGroup"
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.chart.sliceCollapsingThreshold',
                        label: _('Minimum Size').t(),
                        defaultValue: '0.01',
                        groupOptions: {
                            help: _('Minimum Size is applied when there are more than 10 slices.').t()
                        },
                        control: 'views/shared/controls/PercentTextControl'
                    }
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.drilldown',
                        label: _('Drilldown').t(),
                        defaultValue: 'all',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    }
                ]
            }
        ]
    },

    scatter: {
        "id": "scatter",
        "icon": "chart-scatter",
        "label": "Scatter Chart",
        "requiresIndexTime": false,
        "reportLevelAttributes": {
            "showRowSummary": "false",
            "showColSummary": "false",
            "rowLimitType": "descending",
            "rowLimitAmount": 500
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "elementType": "row",
                "maxLength": 1,
                "title": "Mark",
                "required": true,
                "id": "mark",
                "elementsSelector": true,
                "newElementHandler": true,
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/LabelControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number",
                                "boolean"
                            ]
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitSortControlGroup"
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "X-Axis",
                "maxLength": 1,
                "required": true,
                "id": "xaxis",
                "elementsSelector": true,
                "newElementHandler": true,
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "outputType": "metric",
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": true
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.rotation',
                        label: _('Label Rotation').t(),
                        defaultValue: '0',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.overflowMode',
                        label: _('Label Truncation').t(),
                        defaultValue: 'ellipsisNone',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisX.scale',
                        label: _('Scale').t(),
                        defaultValue: 'linear',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorUnit',
                        label: _('Interval').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisX.minimumNumber',
                        label: _('Min Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisX.maximumNumber',
                        label: _('Max Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "Y-Axis",
                "maxLength": 1,
                "required": true,
                "id": "yaxis",
                "elementsSelector": true,
                "newElementHandler": true,
                "outputType": "metric",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": false
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisY.scale',
                        label: _('Scale').t(),
                        defaultValue: 'linear',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.axisLabelsY.majorUnit',
                        label: _('Interval').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.minimumNumber',
                        label: _('Min Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.maximumNumber',
                        label: _('Max Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    }
                ]
            },
            {
                "elementType": "row",
                "title": "Color",
                "maxLength": 1,
                "id": "color",
                "elementsSelector": true,
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/LabelControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number",
                                "boolean"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.legend.placement',
                        label: _('Legend Position').t(),
                        defaultValue: 'right',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/SyntheticSelectControl',
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
                    {
                        name: 'display.visualizations.charting.legend.labelStyle.overflowMode',
                        label: _('Legend Truncation').t(),
                        defaultValue: 'ellipsisMiddle',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.drilldown',
                        label: _('Drilldown').t(),
                        defaultValue: 'all',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    }
                ]
            }
        ]
    },

    bubble: {
        "id": "bubble",
        "icon": "chart-bubble",
        "label": "Bubble Chart",
        "requiresIndexTime": false,
        "reportLevelAttributes": {
            "showRowSummary": "false",
            "showColSummary": "false",
            "rowLimitType": "descending",
            "rowLimitAmount": 500
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "elementType": "row",
                "maxLength": 1,
                "title": "Mark",
                "required": true,
                "id": "mark",
                "elementsSelector": true,
                "newElementHandler": true,
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/LabelControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number",
                                "boolean"
                            ]
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitSortControlGroup"
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "X-Axis",
                "maxLength": 1,
                "required": true,
                "id": "xaxis",
                "elementsSelector": true,
                "newElementHandler": true,
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "outputType": "metric",
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": true
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.rotation',
                        label: _('Label Rotation').t(),
                        defaultValue: '0',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorLabelStyle.overflowMode',
                        label: _('Label Truncation').t(),
                        defaultValue: 'ellipsisNone',
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisX.scale',
                        label: _('Scale').t(),
                        defaultValue: 'linear',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.axisLabelsX.majorUnit',
                        label: _('Interval').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisX.minimumNumber',
                        label: _('Min Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisX.maximumNumber',
                        label: _('Max Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "Y-Axis",
                "maxLength": 1,
                "required": true,
                "id": "yaxis",
                "elementsSelector": true,
                "newElementHandler": true,
                "outputType": "metric",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/AxisLabelControlGroup",
                        "groupOptions": {
                            "xAxis": false
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.axisY.scale',
                        label: _('Scale').t(),
                        defaultValue: 'linear',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    {
                        name: 'display.visualizations.charting.axisLabelsY.majorUnit',
                        label: _('Interval').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.minimumNumber',
                        label: _('Min Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.axisY.maximumNumber',
                        label: _('Max Value').t(),
                        defaultValue: '',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    }
                ]
            },
            {
                "elementType": "cell",
                "title": "Size",
                "maxLength": 1,
                "required": true,
                "id": "yaxis",
                "elementsSelector": true,
                "newElementHandler": true,
                "outputType": "metric",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/LabelControlGroup"
                    },
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.chart.bubbleMinimumSize',
                        label: _('Min Size').t(),
                        defaultValue: '10',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.charting.chart.bubbleMaximumSize',
                        label: _('Max Size').t(),
                        defaultValue: '50',
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            inputClassName: 'input-medium'
                        }
                    }
                ]
            },
            {
                "elementType": "row",
                "title": "Color",
                "maxLength": 1,
                "id": "color",
                "elementsSelector": true,
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean",
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/LabelControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number",
                                "boolean"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.charting.legend.placement',
                        label: _('Legend Position').t(),
                        defaultValue: 'right',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/SyntheticSelectControl',
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
                    {
                        name: 'display.visualizations.charting.legend.labelStyle.overflowMode',
                        label: _('Legend Truncation').t(),
                        defaultValue: 'ellipsisMiddle',
                        groupOptions: {
                            controlClass: 'controls-thirdblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.drilldown',
                        label: _('Drilldown').t(),
                        defaultValue: 'all',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    }
                ]
            }
        ]
    },

    radialGauge: {
        "id": "radialGauge",
        "icon": "gauge-radial",
        "label": "Radial Gauge",
        "requiresIndexTime": false,
        "reportLevelAttributes": {
            "showColSummary": "false",
            "showRowSummary": "false"
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "title": "Value",
                "elementType": "cell",
                "id": "value",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "required": true,
                "maxLength": 1,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        groupOptions: {
                            controlClass: "controls-block",
                            displayMinMaxLabels: false,
                            paletteColors: GAUGE_COLORS,
                            rangeColorsName: "display.visualizations.charting.gaugeColors"
                        },
                        name: 'display.visualizations.charting.chart.rangeValues',
                        group: 'views/shared/vizcontrols/custom_controls/ColorRangesControlGroup',
                        visibleWhen: null
                    }
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.chart.style',
                        label: _('Style').t(),
                        defaultValue: 'shiny',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
            }
        ]
    },

    fillerGauge: {
        "id": "fillerGauge",
        "icon": "gauge-filler",
        "label": "Filler Gauge",
        "requiresIndexTime": false,
        "reportLevelAttributes": {
            "showColSummary": "false",
            "showRowSummary": "false"
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "title": "Value",
                "elementType": "cell",
                "id": "value",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "required": true,
                "maxLength": 1,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        groupOptions: {
                            controlClass: "controls-block",
                            displayMinMaxLabels: false,
                            paletteColors: GAUGE_COLORS,
                            rangeColorsName: "display.visualizations.charting.gaugeColors"
                        },
                        name: 'display.visualizations.charting.chart.rangeValues',
                        group: 'views/shared/vizcontrols/custom_controls/ColorRangesControlGroup',
                        visibleWhen: null
                    }
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.chart.style',
                        label: _('Style').t(),
                        defaultValue: 'shiny',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
            }
        ]
    },

    markerGauge: {
        "id": "markerGauge",
        "icon": "gauge-marker",
        "label": "Marker Gauge",
        "requiresIndexTime": false,
        "reportLevelAttributes": {
            "showColSummary": "false",
            "showRowSummary": "false"
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "title": "Value",
                "elementType": "cell",
                "id": "value",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "required": true,
                "maxLength": 1,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "groupOptions": {
                            "outputType": "metric"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        groupOptions: {
                            controlClass: "controls-block",
                            displayMinMaxLabels: false,
                            paletteColors: GAUGE_COLORS,
                            rangeColorsName: "display.visualizations.charting.gaugeColors"
                        },
                        name: 'display.visualizations.charting.chart.rangeValues',
                        group: 'views/shared/vizcontrols/custom_controls/ColorRangesControlGroup',
                        visibleWhen: null
                    }
                ]
            },
            {
                "title": "General",
                "id": "general",
                "formElements": [
                    {
                        name: 'display.visualizations.charting.chart.style',
                        label: _('Style').t(),
                        defaultValue: 'shiny',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
            }
        ]
    },

    singlevalue: {
        "id": "singlevalue",
        "icon": "single-value",
        "label": "Single Value",
        "requiresIndexTime": false,
        "reportLevelAttributes": {
            "showColSummary": "false",
            "showRowSummary": "false"
        },
        "configMenuPanels": [
            {
                "title": "Time Range",
                "elementType": "filter",
                "id": "timerange",
                "dataTypes": [
                    "timestamp"
                ],
                "maxLength": 1,
                "required": true,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/TimeRangeControlGroup"
                    }
                ]
            },
            {
                "title": "Filter",
                "elementType": "filter",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "boolean"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/FilterTypeControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterMatchControlGroup",
                        "visibleWhen": {
                            "filterType": "match"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitByControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FilterLimitControlGroup",
                        "visibleWhen": {
                            "filterType": "limit"
                        }
                    }
                ],
                "id": "filter"
            },
            {
                "title": "Value",
                "elementType": "cell",
                "id": "value",
                "dataTypes": [
                    "string",
                    "ipv4",
                    "number",
                    "objectCount",
                    "childCount"
                ],
                "required": true,
                "maxLength": 1,
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/CellValueControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number",
                                "boolean",
                                "timestamp"
                            ]
                        }
                    }
                ],
                "formElements": [
                    {
                        name: 'display.visualizations.singlevalue.drilldown',
                        label: _('Drilldown').t(),
                        defaultValue: 'all',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                    'static HTML',
                    {
                        name: 'display.visualizations.singlevalue.showTrendIndicator',
                        label: _('Show trend indicator').t(),
                        defaultValue: '1',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl'
                    },
                    {
                        name: 'display.visualizations.singlevalue.trendDisplayMode',
                        label: _('Show trend in').t(),
                        defaultValue: 'count',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    },
                    {
                        name: 'display.visualizations.singlevalue.trendInterval',
                        label: _('Compared to').t(),
                        defaultValue: 'auto',
                        group: 'views/shared/vizcontrols/custom_controls/SingleValueDeltaTimeRangeControlGroup',
                        groupOptions: {
                            controlClass: 'controls-block'
                        }
                    },
                    'static HTML',
                    {
                        name: 'display.visualizations.singlevalue.beforeLabel',
                        label: _('Before Label').t(),
                        defaultValue: '',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    {
                        name: 'display.visualizations.singlevalue.afterLabel',
                        label: _('After Label').t(),
                        defaultValue: '',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    'static HTML',
                    {
                        name: 'display.visualizations.singlevalue.underLabel',
                        label: _('Caption').t(),
                        defaultValue: '',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    'static HTML',
                    {
                        name: 'display.visualizations.singlevalue.showSparkline',
                        label: _('Show Sparkline').t(),
                        defaultValue: '1',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl'
                    }
                ]
            },
            {
                "elementType": "row",
                "title": "Sparkline",
                "maxLength": 1,
                "id": "sparkline",
                "dataTypes": [
                    "timestamp"
                ],
                "pivotFormElements": [
                    {
                        "group": "views/pivot/custom_controls/LabelControlGroup",
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4",
                                "number",
                                "boolean"
                            ]
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitSortControlGroup"
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": [
                                "string",
                                "ipv4"
                            ]
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/CreateRangesControlGroup",
                        "visibleWhen": {
                            "type": "number"
                        }
                    },
                    {
                        "type": "reportControl",
                        "group": "views/pivot/custom_controls/SplitLimitControlGroup",
                        "groupOptions": {
                            "elementType": "row"
                        },
                        "visibleWhen": {
                            "type": "number",
                            "display": "all"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/MaxRangesControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeSizeControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeStartControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/RangeEndControlGroup",
                        "visibleWhen": {
                            "type": "number",
                            "display": "ranges"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TrueLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/FalseLabelControlGroup",
                        "visibleWhen": {
                            "type": "boolean"
                        }
                    },
                    {
                        "group": "views/pivot/custom_controls/TimePeriodControlGroup",
                        "visibleWhen": {
                            "type": "timestamp"
                        },
                        "groupOptions": {
                            "menuWidth": "narrow"
                        }
                    }
                ]
            },
            {
                "title": "Color",
                "id": "color",
                formElements: [
                    {
                        name: 'display.visualizations.singlevalue.useColors',
                        label: _('Use colors').t(),
                        defaultValue: '1',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/BooleanRadioControl'
                    },
                    {
                        name: 'display.visualizations.singlevalue.colorBy',
                        label: _('Color by').t(),
                        defaultValue: 'value',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
                        }
                    },
                    {
                        name: 'display.visualizations.singlevalue.trendColorInterpretation',
                        label: _('Color interpretation').t(),
                        defaultValue: 'standard',
                        groupOptions: {
                            className: 'control-group single-value-radio-icon-group',
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/singlevalue/ColorModeRadioControl',
                        controlOptions: {
                            className: "btn-group",
                            items: [
                                {
                                    iconSettings: [
                                        {
                                            backgroundColor: "transparent",
                                            fontColor: "#65a637",
                                            indicatorMode: "increase",
                                            type: "indicator"
                                        },
                                        {
                                            backgroundColor: "transparent",
                                            fontColor: "#d93f3c",
                                            indicatorMode: "decrease",
                                            type: "indicator"
                                        }
                                    ],
                                    tooltip: "Positive values in green",
                                    value: "standard"
                                },
                                {
                                    iconSettings: [
                                        {
                                            backgroundColor: "transparent",
                                            fontColor: "#d93f3c",
                                            indicatorMode: "increase",
                                            type: "indicator"                                        },
                                        {
                                            backgroundColor: "transparent",
                                            fontColor: "#65a637",
                                            indicatorMode: "decrease",
                                            type: "indicator"                                        }
                                    ],
                                    tooltip: "Negative values in green",
                                    value: "inverse"
                                }
                            ]
                        }
                    },
                    {
                        name: 'display.visualizations.singlevalue.rangeValues',
                        group: 'views/shared/vizcontrols/custom_controls/ColorRangesControlGroup',
                        groupOptions: {
                            controlClass: 'controls-block',
                            rangeColorsName: 'display.visualizations.singlevalue.rangeColors',
                            defaultColors: ['0x65a637', '0x6db7c6', '0xf7bc38', '0xf58f39', '0xd93f3c'],
                            paletteColors: ['#65a637', '#6db7c6', '#f7bc38', '#f58f39', '#d93f3c', '#555'],
                            defaultRangeValues: [0, 30, 70, 100],
                            displayMinMaxLabels: true
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
                        control: 'views/shared/singlevalue/ColorModeRadioControl',
                        controlOptions: {
                            items: [
                                {
                                    iconSettings: [
                                        {
                                            "backgroundColor": "transparent",
                                            "fontColor": "#65a637",
                                            "type": "colorMode"
                                        }
                                    ],
                                    tooltip: "No background",
                                    value: "none"
                                },
                                {
                                    iconSettings: [
                                        {
                                            "backgroundColor": "#65a637",
                                            "fontColor": "#FFFFFF",
                                            "type": "colorMode"
                                        }
                                    ],
                                    tooltip: "Block background",
                                    value: "block"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "title": "Number Format",
                "id": "numberFormat",
                'formElements': [
                    {
                        name: 'display.visualizations.singlevalue.numberPrecision',
                        label: _('Precision').t(),
                        defaultValue: '0',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/SyntheticSelectControl',
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
                        control: 'views/shared/controls/BooleanRadioControl'
                    },
                    {
                        name: 'display.visualizations.singlevalue.unit',
                        label: _('Unit').t(),
                        defaultValue: '',
                        groupOptions: {
                            controlClass: 'controls-block'
                        },
                        control: 'views/shared/controls/TextControl',
                        controlOptions: {
                            placeholder: _('optional').t(),
                            inputClassName: 'input-medium'
                        }
                    },
                    'static HTML',
                    {
                        name: 'display.visualizations.singlevalue.unitPosition',
                        label: _('Unit Position').t(),
                        defaultValue: 'after',
                        groupOptions: {
                            controlClass: 'controls-halfblock'
                        },
                        control: 'views/shared/controls/SyntheticRadioControl',
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
        ]
    }

};
