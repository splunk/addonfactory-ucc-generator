/**
 * Singleton to manage a shared schema for all available visualization types in pivot.
 *
 * NOTE: This object has been refactored such that the schema is dynamically generated from the
 * pivot-compatible visualizations in the VisualizationRegistry.  For a description of the pivotSchema
 * defined there, see https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-PivotEditorSchema
 *
 * Each visualization type has an entry in the schema with the following structure:
 *
 * type {String} the id of the visualization type
 * icon {String} the icon CSS class for the button in the menu
 * label {String} the human-readable description of the visualization type
 * requiresIndexTime {Boolean} whether the visualization type depends on the current object having _time as a field, defaults to false
 * reportLevelAttributes {Object} custom attributes to be set on the report when this visualization type is selected
 *
 * configMenuPanels {Array<Object>} list of available panels for the visualization type
 *                  each object has the following fields:
 *
 *     description {String} the title display for the panel
 *     title {String} the title to use for the panel's "add new" button, description is used if this is not defined
 *     elementType {String} the pivot report element type (if any) the panel maps to
 *     dataTypes {String or Array<String>} a whitelist of allowed data types for fields in the panel
 *     outputType {String} an optional output type that an element must match for this panel, "metric" or "dimension"
 *     required {Boolean} whether the panel is required to have at least one field in it
 *     maxLength {Number} the maximum number of fields allowed in the panel, if omitted there is no maximum
 *
 *     elementsSelector {Function} a callback to use for advanced configurations, accepts one argument which is a list of
 *         matching element models (after other configuration options like dataTypes and elementType have been applied),
 *         and returns a list of elements that should be mapped to the panel
 *     newElementHandler {Function} a callback to use for advanced configurations, accepts two arguments which are the new
 *         element being added and a boolean indicating if the element was just created or is being transferred, can make
 *         modifications to the model as necessary and/or return options which will be passed to the collection add method
 *
 *     pivotFormElements {Array<Object>} a list of control groups, each with the following fields:
 *
 *         type {String} either 'reportControl' or 'vizControl', controls which models will be used to create the control group
 *         group {View constructor} the view to instantiate for the control group
 *         options {Object} options to pass to the view constructor
 *         visibleWhen {Object} key/value pairs that control when the group will be visible
 *                    the key is a model property name
 *                    the value is a string or list of strings that the property value must match for the control to be visible
 *
 *    formElements {Array<Object>} as described in https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-VisualizationEditorSchema
 */

define([
            'jquery',
            'underscore',

            // pivot control groups
            'views/pivot/custom_controls/TimeRangeControlGroup',
            'views/pivot/custom_controls/FilterTypeControlGroup',
            'views/pivot/custom_controls/FilterMatchControlGroup',
            'views/pivot/custom_controls/FilterLimitByControlGroup',
            'views/pivot/custom_controls/FilterLimitControlGroup',
            'views/pivot/custom_controls/LabelControlGroup',
            'views/pivot/custom_controls/AxisLabelControlGroup',
            'views/pivot/custom_controls/TimePeriodControlGroup',
            'views/pivot/custom_controls/CreateRangesControlGroup',
            'views/pivot/custom_controls/SplitSortControlGroup',
            'views/pivot/custom_controls/SplitLimitControlGroup',
            'views/pivot/custom_controls/MaxRangesControlGroup',
            'views/pivot/custom_controls/RangeSizeControlGroup',
            'views/pivot/custom_controls/RangeStartControlGroup',
            'views/pivot/custom_controls/RangeEndControlGroup',
            'views/pivot/custom_controls/TrueLabelControlGroup',
            'views/pivot/custom_controls/FalseLabelControlGroup',
            'views/pivot/custom_controls/CellValueControlGroup',

            'constants/pivot',
            'helpers/VisualizationRegistry',
            'splunk.util'
        ],
        function(
            $,
            _,

            // pivot control groups
            TimeRangeControlGroup,
            FilterTypeControlGroup,
            FilterMatchControlGroup,
            FilterLimitByControlGroup,
            FilterLimitControlGroup,
            LabelControlGroup,
            AxisLabelControlGroup,
            TimePeriodControlGroup,
            CreateRangesControlGroup,
            SplitSortControlGroup,
            SplitLimitControlGroup,
            MaxRangesControlGroup,
            RangeSizeControlGroup,
            RangeStartControlGroup,
            RangeEndControlGroup,
            TrueLabelControlGroup,
            FalseLabelControlGroup,
            CellValueControlGroup,

            pivotConstants,
            VisualizationRegistry,
            splunkUtils
        ) {

    var generateSchema = function() {
        return _(VisualizationRegistry.getAllVisualizations()).chain()
            .filter(function(vizConfig) {
                if (vizConfig.matchConfig['display.general.type'] === 'statistics') {
                    return true;
                }
                return !!vizConfig.pivotSchema;
            })
            .sortBy(function(vizConfig) {
                return vizConfig.matchConfig['display.general.type'] === 'statistics' ? 0 : 1;
            })
            .map(convertFromVizConfig).value();
    };

    var convertFromVizConfig = function(vizConfig) {
        var converted = _(vizConfig).pick('id', 'icon', 'label'),
            pivotSchema = vizConfig.pivotSchema,
            editorSchema = vizConfig.editorSchema;

        if (vizConfig.matchConfig['display.general.type'] !== 'statistics') {
            converted.reportLevelAttributes = _.extend(
                { showRowSummary: 'false', showColSummary: 'false' },
                pivotSchema ? pivotSchema.reportLevelAttributes : {}
            );
        }
        if (pivotSchema) {
            converted.configMenuPanels = generateConfigMenuPanels(pivotSchema, editorSchema);
            converted.requiresIndexTime = _(pivotSchema.panels).any(function(panel) {
                return panel.required && _.isEqual(panel.dataTypes, [pivotConstants.TIMESTAMP]);
            });
        }
        return converted;
    };

    var generateConfigMenuPanels = function(pivotSchema, editorSchema) {
        var panels = _(pivotSchema.panels).map(function(panel) {
            var generated = _(panel).pick('title', 'description', 'required', 'dataTypes', 'excludeFromEditor', 'labelElement', 'limitLabel', 'maxLength');
            if (panel.elementType === pivotConstants.ROW_SPLIT) {
                generated = _.extend({}, ROW_SPLIT_PANEL, generated);
            } else if (panel.elementType === pivotConstants.SECONDARY_ROW_SPLIT) {
                generated = _.extend({}, SECONDARY_ROW_SPLIT_PANEL, generated);
            } else if (panel.elementType === pivotConstants.NUMERIC_CELL_VALUE) {
                generated = _.extend({}, NUMERIC_CELL_VALUE_PANEL, generated);
            } else if (panel.elementType === pivotConstants.CELL_VALUE) {
                generated = _.extend({}, CELL_VALUE_PANEL, generated);
            } else if (panel.elementType === pivotConstants.COLUMN_SPLIT) {
                generated = _.extend({}, COLUMN_SPLIT_PANEL, generated);
            }
            if (panel.importFromEditor) {
                generated.formElements = _(editorSchema).findWhere({ id: panel.importFromEditor }).formElements;
                generated = processPanelFormElements(generated);
                generated.formElements = generated.formElements.concat(panel.appendToEditor || []);
            }
            return generated;
        });

        var rowSplitPanels = _(panels).where({ elementType: pivotConstants.ROW_SPLIT });
        if (rowSplitPanels.length > 1) {
            _(rowSplitPanels).each(function(panel, i) {
                panel.elementsSelector = function(matches) {
                    return matches.length > i ? [matches[i]] : [];
                };
                panel.newElementHandler = function() {
                    return { at: i };
                };
                if (i > 0) {
                    panel.isEnabledForAdd = function(matches) {
                        if (matches.length < i) {
                            return splunkUtils.sprintf(
                                _('Select %s before adding %s.').t(),
                                rowSplitPanels[i - 1].title,
                                panel.title
                            );
                        }
                    };
                }
            });
        }

        var cellValuePanels = _(panels).where({ elementType: pivotConstants.CELL_VALUE });
        if (cellValuePanels.length > 1) {
            _(cellValuePanels).each(function(panel, i) {
                panel.elementsSelector = function(matches) {
                    return matches.length > i ? [matches[i]] : [];
                };
                panel.newElementHandler = function() {
                    return { at: i };
                };
                if (i > 0) {
                    panel.isEnabledForAdd = function(matches) {
                        if (matches.length < i) {
                            return splunkUtils.sprintf(
                                _('Select %s before adding %s.').t(),
                                cellValuePanels[i - 1].title,
                                panel.title
                            );
                        }
                    };
                }
            });
        }

        var editorOnlyPanels = _(editorSchema).reject(function(schemaEntry) {
            return !!_(pivotSchema.panels).findWhere({ importFromEditor: schemaEntry.id }) ||
                        _(pivotSchema.excludeFromEditor || []).contains(schemaEntry.id);
        });
        editorOnlyPanels = _(editorOnlyPanels).map(processPanelFormElements);
        return [TIME_RANGE_PANEL, FILTER_PANEL].concat(panels, editorOnlyPanels);
    };

    var processPanelFormElements = function(panel) {
        var processed = _.extend({}, panel, {
            formElements: _(panel.formElements).reject(function(formElement) {
                return _(panel.excludeFromEditor || []).contains(formElement.name);
            })
        });

        if (panel.hasOwnProperty('labelElement')) {
            processed = _.extend({}, processed, {
                pivotFormElements: _(processed.pivotFormElements).map(function(formElement) {
                    if (formElement.group === LabelControlGroup) {
                        return panel.labelElement;
                    }
                    return formElement;
                })
            });
        }
        processed.pivotFormElements = _(processed.pivotFormElements).compact();

        if (panel.limitLabel) {
            processed = _.extend({}, processed, {
                pivotFormElements: _(processed.pivotFormElements).map(function(formElement) {
                    if (formElement.group === SplitLimitControlGroup) {
                        return _.extend({}, formElement, {
                            groupOptions: _.extend({}, formElement.groupOptions, { label: panel.limitLabel })
                        });
                    }
                    return formElement;
                })
            });
        }

        return processed;
    };

    // constants for available visualization types
    // where applicable these must match what will be set as 'display.visualizations.charting.chart' on the report
    var VIZ_TYPES = {
        STATISTICS_TABLE: 'statistics',
        BAR_CHART: 'bar',
        COLUMN_CHART: 'column',
        AREA_CHART: 'area',
        LINE_CHART: 'line',
        PIE_CHART: 'pie',
        SCATTER_CHART: 'scatter',
        BUBBLE_CHART: 'bubble',
        SINGLE_VALUE: 'singlevalue',
        RADIAL_GAUGE: 'radialGauge',
        MARKER_GAUGE: 'markerGauge',
        FILLER_GAUGE: 'fillerGauge'
    };
    VIZ_TYPES.SIMPLE_CARTESIAN_TYPES = [VIZ_TYPES.BAR_CHART, VIZ_TYPES.COLUMN_CHART, VIZ_TYPES.LINE_CHART, VIZ_TYPES.AREA_CHART];
    VIZ_TYPES.BAR_COLUMN_TYPES = [VIZ_TYPES.BAR_CHART, VIZ_TYPES.COLUMN_CHART];
    VIZ_TYPES.LINE_AREA_TYPES = [VIZ_TYPES.LINE_CHART, VIZ_TYPES.AREA_CHART];
    VIZ_TYPES.GAUGE_TYPES = [VIZ_TYPES.RADIAL_GAUGE, VIZ_TYPES.MARKER_GAUGE, VIZ_TYPES.FILLER_GAUGE];

    var CONTROL_TYPES = {
        REPORT_CONTROL: 'reportControl',
        VISUALIZATION_CONTROL: 'vizControl'
    };

    var AGGREGATION_OUTPUT_TYPES = {
        METRIC: 'metric',
        DIMENSION: 'dimension'
    };

    var TIME_RANGE_PANEL = {
        title: _('Time Range').t(),
        elementType: pivotConstants.FILTER,
        dataTypes: [pivotConstants.TIMESTAMP],
        maxLength: 1,
        required: true,
        pivotFormElements: [
            {
                group: TimeRangeControlGroup
            }
        ]
    };

    var FILTER_FORM_ELEMENTS = [
        {
            id: 'filter-type',
            group: FilterTypeControlGroup,
            visibleWhen: { type: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER] }
        },
        {
            id: 'filter-match',
            group: FilterMatchControlGroup,
            visibleWhen: { filterType: 'match' }
        },
        {
            id: 'filter-limit-by',
            group: FilterLimitByControlGroup,
            visibleWhen: { filterType: 'limit' }
        },
        {
            id: 'filter-limit',
            group: FilterLimitControlGroup,
            visibleWhen: { filterType: 'limit' }
        }
    ];

    var FILTER_PANEL = {
        title: _('Filter').t(),
        elementType: pivotConstants.FILTER,
        dataTypes: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER, pivotConstants.BOOLEAN],
        pivotFormElements: FILTER_FORM_ELEMENTS
    };

    var ROW_SPLIT_FORM_ELEMENTS = [
        {
            id: 'split-label',
            group: LabelControlGroup,
            visibleWhen: {
                type: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER, pivotConstants.BOOLEAN]
            }
        },
        {
            id: 'split-sort',
            type: CONTROL_TYPES.REPORT_CONTROL,
            group: SplitSortControlGroup
        },
        {
            id: 'split-limit-string',
            splitLimitGroup: true,
            type: CONTROL_TYPES.REPORT_CONTROL,
            group: SplitLimitControlGroup,
            groupOptions: { elementType: 'row' },
            visibleWhen: { type: [pivotConstants.STRING, pivotConstants.IPV4] }
        },
        {
            id: 'create-ranges',
            group: CreateRangesControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER }
        },
        {
            id: 'split-limit-number',
            type: CONTROL_TYPES.REPORT_CONTROL,
            group: SplitLimitControlGroup,
            groupOptions: { elementType: 'row' },
            visibleWhen: { type: pivotConstants.NUMBER, display: 'all' }
        },
        {
            id: 'max-ranges',
            group: MaxRangesControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER, display: 'ranges' }
        },
        {
            id: 'range-size',
            group: RangeSizeControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER, display: 'ranges' }
        },
        {
            id: 'range-start',
            group: RangeStartControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER, display: 'ranges' }
        },
        {
            id: 'range-end',
            group: RangeEndControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER, display: 'ranges' }
        },
        {
            id: 'true-label',
            group: TrueLabelControlGroup,
            visibleWhen: { type: pivotConstants.BOOLEAN }
        },
        {
            id: 'false-label',
            group: FalseLabelControlGroup,
            visibleWhen: { type: pivotConstants.BOOLEAN }
        },
        {
            id: 'time-period',
            group: TimePeriodControlGroup,
            groupOptions: { menuWidth: 'narrow' },
            visibleWhen: { type: pivotConstants.TIMESTAMP }
        }
    ];

    var ROW_SPLIT_PANEL = {
        elementType: pivotConstants.ROW_SPLIT,
        dataTypes: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER, pivotConstants.BOOLEAN,
                        pivotConstants.TIMESTAMP],
        maxLength: 1,
        pivotFormElements: ROW_SPLIT_FORM_ELEMENTS
    };

    /*
     * A panel configuration for a second row split, which hides the split and sort controls since they
     * only apply to the first row split.
     */
    var SECONDARY_ROW_SPLIT_PANEL = {
        elementType: pivotConstants.ROW_SPLIT,
        dataTypes: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER, pivotConstants.BOOLEAN,
                        pivotConstants.TIMESTAMP],
        maxLength: 1,
        pivotFormElements: _(ROW_SPLIT_FORM_ELEMENTS).reject(function(element) {
            return (element.id === 'split-sort' || element.id === 'split-limit-number' || element.id === 'split-limit-string');
        })
    };

    var COLUMN_SPLIT_FORM_ELEMENTS = [
        {
            id: 'split-limit-string',
            type: CONTROL_TYPES.REPORT_CONTROL,
            group: SplitLimitControlGroup,
            groupOptions: { elementType: 'column' },
            visibleWhen: { type: [pivotConstants.STRING, pivotConstants.IPV4] }
        },
        {
            id: 'create-ranges',
            group: CreateRangesControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER }
        },
        {
            id: 'split-limit-number',
            type: CONTROL_TYPES.REPORT_CONTROL,
            group: SplitLimitControlGroup,
            groupOptions: { elementType: 'column' },
            visibleWhen: { type: pivotConstants.NUMBER, display: 'all' }
        },
        {
            id: 'max-ranges',
            group: MaxRangesControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER, display: 'ranges' }
        },
        {
            id: 'range-size',
            group: RangeSizeControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER, display: 'ranges' }
        },
        {
            id: 'range-start',
            group: RangeStartControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER, display: 'ranges' }
        },
        {
            id: 'range-end',
            group: RangeEndControlGroup,
            visibleWhen: { type: pivotConstants.NUMBER, display: 'ranges' }
        },
        {
            id: 'true-label',
            group: TrueLabelControlGroup,
            visibleWhen: { type: pivotConstants.BOOLEAN }
        },
        {
            id: 'false-label',
            group: FalseLabelControlGroup,
            visibleWhen: { type: pivotConstants.BOOLEAN }
        },
        {
            id: 'time-period',
            group: TimePeriodControlGroup,
            groupOptions: { menuWidth: 'narrow' },
            visibleWhen: { type: pivotConstants.TIMESTAMP }
        }
    ];

    var COLUMN_SPLIT_PANEL = {
        elementType: pivotConstants.COLUMN_SPLIT,
        dataTypes: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER, pivotConstants.BOOLEAN,
                        pivotConstants.TIMESTAMP],
        maxLength: 1,
        pivotFormElements: COLUMN_SPLIT_FORM_ELEMENTS
    };

    var CELL_VALUE_FORM_ELEMENTS = [
        {
            id: 'cell-label',
            group: LabelControlGroup,
            visibleWhen: {
                type: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER,
                       pivotConstants.BOOLEAN, pivotConstants.OBJECT_COUNT, pivotConstants.CHILD_COUNT]
            }
        },
        {
            id: 'cell-stats-fn',
            group: CellValueControlGroup,
            visibleWhen: {
                type: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER,
                       pivotConstants.BOOLEAN, pivotConstants.TIMESTAMP]
            }
        }
    ];

    var NUMERIC_CELL_VALUE_PANEL = {
        elementType: pivotConstants.CELL_VALUE,
        dataTypes: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER,
                        pivotConstants.OBJECT_COUNT, pivotConstants.CHILD_COUNT],
        outputType: AGGREGATION_OUTPUT_TYPES.METRIC,
        maxLength: 1,
        pivotFormElements: [
            {
                id: 'cell-label',
                group: LabelControlGroup
            },
            {
                id: 'cell-stats-fn',
                group: CellValueControlGroup,
                groupOptions: {
                    outputType: AGGREGATION_OUTPUT_TYPES.METRIC
                },
                visibleWhen: {
                    type: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER]
                }
            }
        ]
    };

    var CELL_VALUE_PANEL = {
        elementType: pivotConstants.CELL_VALUE,
        dataTypes: [pivotConstants.STRING, pivotConstants.IPV4, pivotConstants.NUMBER,
                        pivotConstants.OBJECT_COUNT, pivotConstants.CHILD_COUNT],
        maxLength: 1,
        pivotFormElements: CELL_VALUE_FORM_ELEMENTS
    };

    var PivotVizManager = function() {
        this.schema = generateSchema();
        // add all constants to the singleton instance so they are available to consumers
        $.extend(this, VIZ_TYPES, CONTROL_TYPES, pivotConstants, AGGREGATION_OUTPUT_TYPES, {
            FILTER_FORM_ELEMENTS: FILTER_FORM_ELEMENTS,
            ROW_SPLIT_FORM_ELEMENTS: ROW_SPLIT_FORM_ELEMENTS,
            COLUMN_SPLIT_FORM_ELEMENTS: COLUMN_SPLIT_FORM_ELEMENTS,
            CELL_VALUE_FORM_ELEMENTS: CELL_VALUE_FORM_ELEMENTS
        });
    };

    $.extend(PivotVizManager.prototype, {

        getConfigByVizType: function(vizType) {
            return _(this.schema).find(function(configObject) { return configObject.id === vizType; });
        }

    });

    return new PivotVizManager();

});
