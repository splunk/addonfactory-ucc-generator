define([
            'underscore',
            'views/pivot/custom_controls/AxisLabelControlGroup',
            'views/shared/vizcontrols/custom_controls/ColorRangesControlGroup',
            './vizeditorschemas/gauge',
            'constants/pivot'
        ],
        function(
            _,
            AxisLabelControlGroup,
            ColorRanges,
            gaugeEditorSchema,
            pivotConstants
        ) {


    var gaugeColorRangesSchema = _(gaugeEditorSchema).findWhere({ id: 'ranges' });

    return ({
        LINE: {
            excludeFromEditor: ['overlay'],
            panels: [
                {
                    title: _('X-Axis').t(),
                    description: _('X-Axis (Time)').t(),
                    elementType: pivotConstants.ROW_SPLIT,
                    dataTypes: [pivotConstants.TIMESTAMP],
                    required: true,
                    importFromEditor: 'xaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleX.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: true
                        }
                    }
                },
                {
                    title: _('Y-Axis').t(),
                    elementType: pivotConstants.NUMERIC_CELL_VALUE,
                    required: true,
                    importFromEditor: 'yaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleY.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: false
                        }
                    }
                },
                {
                    title: _('Color').t(),
                    description: _('Color (Lines)').t(),
                    elementType: pivotConstants.COLUMN_SPLIT,
                    importFromEditor: 'legend',
                    limitLabel: _('Max Lines').t()
                }
            ]
        },
        AREA: {
            excludeFromEditor: ['overlay'],
            panels: [
                {
                    title: _('X-Axis').t(),
                    description: _('X-Axis (Time)').t(),
                    elementType: pivotConstants.ROW_SPLIT,
                    dataTypes: [pivotConstants.TIMESTAMP],
                    required: true,
                    importFromEditor: 'xaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleX.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: true
                        }
                    }
                },
                {
                    title: _('Y-Axis').t(),
                    elementType: pivotConstants.NUMERIC_CELL_VALUE,
                    required: true,
                    importFromEditor: 'yaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleY.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: false
                        }
                    }
                },
                {
                    title: _('Color').t(),
                    description: _('Color (Areas)').t(),
                    elementType: pivotConstants.COLUMN_SPLIT,
                    importFromEditor: 'legend',
                    limitLabel: _('Max Areas').t()
                }
            ]
        },
        COLUMN: {
            excludeFromEditor: ['overlay'],
            panels: [
                {
                    title: _('X-Axis').t(),
                    elementType: pivotConstants.ROW_SPLIT,
                    required: true,
                    importFromEditor: 'xaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleX.text'],
                    limitLabel: _('Max Columns').t(),
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: true
                        }
                    }
                },
                {
                    title: _('Y-Axis').t(),
                    elementType: pivotConstants.NUMERIC_CELL_VALUE,
                    required: true,
                    importFromEditor: 'yaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleY.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: false
                        }
                    }
                },
                {
                    title: _('Color').t(),
                    elementType: pivotConstants.COLUMN_SPLIT,
                    importFromEditor: 'legend',
                    limitLabel: _('Max Colors').t()
                }
            ]
        },
        BAR: {
            excludeFromEditor: ['overlay'],
            panels: [
                {
                    title: _('X-Axis').t(),
                    description: _('X-Axis (Bars)').t(),
                    elementType: pivotConstants.ROW_SPLIT,
                    required: true,
                    importFromEditor: 'xaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleX.text'],
                    limitLabel: _('Max Bars').t(),
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: true
                        }
                    }
                },
                {
                    title: _('Y-Axis').t(),
                    description: _('Y-Axis (Bar Width)').t(),
                    elementType: pivotConstants.NUMERIC_CELL_VALUE,
                    required: true,
                    importFromEditor: 'yaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleY.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: false
                        }
                    }
                },
                {
                    title: _('Color').t(),
                    elementType: pivotConstants.COLUMN_SPLIT,
                    importFromEditor: 'legend',
                    limitLabel: _('Max Colors').t()
                }
            ]
        },
        PIE: {
            panels: [
                { title: _('Color').t(), elementType: pivotConstants.ROW_SPLIT, required: true },
                { title: _('Size').t(), elementType: pivotConstants.NUMERIC_CELL_VALUE, importFromEditor: 'size', required: true }
            ]
        },
        SCATTER: {
            reportLevelAttributes: { rowLimitType: 'descending', rowLimitAmount: 500 },
            panels: [
                { title: _('Mark').t(), elementType: pivotConstants.ROW_SPLIT, required: true },
                {
                    title: _('X-Axis').t(),
                    elementType: pivotConstants.NUMERIC_CELL_VALUE,
                    required: true,
                    importFromEditor: 'xaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleX.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: true
                        }
                    }
                },
                {
                    title: _('Y-Axis').t(),
                    elementType: pivotConstants.NUMERIC_CELL_VALUE,
                    required: true,
                    importFromEditor: 'yaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleY.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: false
                        }
                    }
                },
                { title: _('Color').t(), elementType: pivotConstants.SECONDARY_ROW_SPLIT, importFromEditor: 'legend' }
            ]
        },
        BUBBLE: {
            reportLevelAttributes: { rowLimitType: 'descending', rowLimitAmount: 500 },
            panels: [
                { title: _('Mark').t(), elementType: pivotConstants.ROW_SPLIT, required: true },
                {
                    title: _('X-Axis').t(),
                    elementType: pivotConstants.NUMERIC_CELL_VALUE,
                    required: true,
                    importFromEditor: 'xaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleX.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: true
                        }
                    }
                },
                {
                    title: _('Y-Axis').t(),
                    elementType: pivotConstants.NUMERIC_CELL_VALUE,
                    required: true,
                    importFromEditor: 'yaxis',
                    excludeFromEditor: ['display.visualizations.charting.axisTitleY.text'],
                    labelElement: {
                        id: 'axis-label',
                        group: AxisLabelControlGroup,
                        groupOptions: {
                            xAxis: false
                        }
                    }
                },
                { title: _('Size').t(), elementType: pivotConstants.NUMERIC_CELL_VALUE, required: true, importFromEditor: 'mark' },
                { title: _('Color').t(), elementType: pivotConstants.SECONDARY_ROW_SPLIT, importFromEditor: 'legend' }
            ]
        },
        GAUGE: {
            panels: [
                {
                    title: _('Value').t(),
                    elementType: pivotConstants.NUMERIC_CELL_VALUE,
                    required: true,
                    importFromEditor: 'ranges',
                    labelElement: null,
                    excludeFromEditor: ['autoMode', 'display.visualizations.charting.chart.rangeValues'],
                    appendToEditor: [
                        _.extend(
                            {},
                            _(gaugeColorRangesSchema.formElements).findWhere({ name: 'display.visualizations.charting.chart.rangeValues'}),
                            { group: ColorRanges, visibleWhen: null }
                        )
                    ]
                }
            ]
        }
    });

});