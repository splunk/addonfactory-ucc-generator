define(
    [
        'underscore',
        'models/SplunkDBase',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        _,
        BaseModel,
        splunkd_utils,
        splunkUtil
    ) {
        return BaseModel.extend({
            url: 'data/ui/viewstates',
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            getFlattenedAndDedupedModules: function() {
                var content = this.entry.content.toJSON(),
                    flattenedModules = {};
                
                delete content['eai:acl'];
                delete content['eai:appName'];
                delete content['eai:userName'];
                delete content['disabled'];
            
                //flatten the contents
                _.each(content, function(value, module){
                    var keySplit = module.split("."),
                        key = keySplit[0].split("_")[0],
                        child = keySplit[1];
                    
                    if (!flattenedModules[key]) {
                        flattenedModules[key] = {};
                    }
                    
                    if (!flattenedModules[key][child]) {
                        flattenedModules[key][child] = value;
                    }
                });

                return flattenedModules;
            },
            convertToReportPoperties: function() {
                var flattenedModules = this.getFlattenedAndDedupedModules(),
                    props = {},
                    eventsTabSelected, statsTabSelected, vizTabSelected,
                    buttonSwitcher, count, softWrap, segmentation, fields, rowNumbers;
                
                /*
                 * AxisScaleFormatter.default => display.visualizations.charting.axisY.scale
                 * ChartTitleFormatter.default => NOT IMPLEMENTED
                 * ChartTypeFormatter.default => display.visualizations.charting.chart
                 * FancyChartTypeFormatter.default => display.visualizations.charting.chart
                 * LegendFormatter.default => display.visualizations.charting.legend.placement
                 * LineMarkerFormatter.default => display.visualizations.charting.axisX.markers (MISSING)
                 * NullValueFormatter.default => display.visualizations.charting.chart.nullValueMode
                 * SplitModeFormatter.default => NOT IMPLEMENTED
                 * StackModeFormatter.default => display.visualizations.charting.chart.stackMode
                 * XAxisTitleFormatter.default => display.visualizations.charting.axisTitleX.text
                 * YAxisRangeMaximumFormatter.default => display.visualizations.charting.axisY.maximumNumber
                 * YAxisRangeMinimumFormatter.default => display.visualizations.charting.axisY.minimumNumber
                 * YAxisTitleFormatter.default => display.visualizations.charting.axisTitleY.text
                 * FlashChart.height => display.visualizations.chartHeight
                 * FlashTimeline.height => NOT IMPLEMENTED
                 * FlashTimeline.minimized => display.page.search.timeline.format = [hidden|compact|full] (MUST REMAP FROM BOOLEAN)
                 * FlashWrapper.height => NOT IMPLEMENTED
                 * JSChart.height => display.visualizations.chartHeight
                 * Count.default OR Count.count => display.prefs.statistics.count OR display.prefs.events.count
                 * DataOverlay.default OR DataOverlay.dataOverlayMode => display.statistics.overlay
                 * HiddenSoftWrap.enable => display.events.list.wrap OR display.events.table.wrap OR display.statistics.wrap
                 * SoftWrap.enable => display.events.list.wrap OR display.events.table.wrap OR display.statistics.wrap
                 * MaxLines.default OR MaxLines.maxLines => display.events.maxLines
                 * RowNumbers.default OR RowNumbers.displayRowNumbers => display.events.rowNumbers OR display.statistics.rowNumbers
                 * Segmentation.default OR Segmentation.segmentation => display.events.raw.drilldown OR display.events.list.drilldown OR display.statistics.drilldown
                 * FieldPicker.fields => display.events.fields
                 * FieldPicker.sidebarDisplay => display.page.search.showFields
                 * ButtonSwitcher.selected => display.general.type REQUIRES REMAPPING
                 * 
                 * 
                Possible values from flashtimeline:
                |    ButtonSwitcher_0_9_0.selected =  "splIcon-results-table"
                |    ChartTypeFormatter_0_14_0.default =  "column"
                |    Count_0_8_1.default =  "50"
                |    DataOverlay_0_14_0.dataOverlayMode =  "none"
                |    DataOverlay_0_14_0.default =  "heatmap"
                |    FieldPicker_0_6_0.fields =  "host,sourcetype,source"
                |    FieldPicker_0_6_0.sidebarDisplay =  "True"
                |    FlashTimeline_0_4_1.height =  "95px"
                |    FlashTimeline_0_4_1.minimized =  "False"
                |    JSChart_0_14_1.height =  "300px"
                |    LegendFormatter_0_20_0.default =  "top"
                |    MaxLines_0_14_0.default =  "10"
                |    MaxLines_0_14_0.maxLines =  "10"
                |    NullValueFormatter_0_19_0.default =  "gaps"
                |    RowNumbers_0_13_0.default =  "true"
                |    RowNumbers_0_13_0.displayRowNumbers =  "true"
                |    RowNumbers_1_13_0.default =  "true"
                |    RowNumbers_1_13_0.displayRowNumbers =  "true"
                |    Segmentation_0_15_0.default =  "full"
                |    Segmentation_0_15_0.segmentation =  "full"
                |    SoftWrap_0_12_0.enable =  "True"
                |    SplitModeFormatter_0_18_0.default =  "false"
                |    StackModeFormatter_0_17_0.default =  "default"
                
                From Report Builder:
                |    ChartTypeFormatter_0_4_0.default =  "column"
                |    DataOverlay_0_5_0.dataOverlayMode =  "none"
                |    DataOverlay_0_5_0.default =  "none"
                |    JSChart_0_4_1.height =  "300px"
                |    LegendFormatter_0_10_0.default =  "right"
                |    LineMarkerFormatter_0_7_0.default =  "false"
                |    NullValueFormatter_0_9_0.default =  "gaps"
                |    SplitModeFormatter_0_8_0.default =  "false"
                |    StackModeFormatter_0_7_0.default =  "default"
                
                From Advanced Charting:
                |    ChartTypeFormatter_0_7_0.default =  "line"
                |    JSChart_0_7_1.height =  "300px"
                |    LegendFormatter_0_13_0.default =  "right"
                |    LineMarkerFormatter_0_10_0.default =  "false"
                |    NullValueFormatter_0_12_0.default =  "gaps"
                |    SplitModeFormatter_0_11_0.default =  "false"
                |    StackModeFormatter_0_10_0.default =  "default"
                 * 
                 */
                
                if (flattenedModules['ButtonSwitcher']) {
                    buttonSwitcher = flattenedModules['ButtonSwitcher']['selected'];
                    if (buttonSwitcher === "splIcon-results-table") {
                        props['display.general.type'] = 'statistics';
                        statsTabSelected = true;
                    } else if (buttonSwitcher === "splIcon-events-list") {
                        props['display.general.type'] = 'events';
                        eventsTabSelected = true;
                    }
                } else {
                    props['display.general.type'] = 'visualizations';
                    vizTabSelected = true;
                }
                
                if (flattenedModules['AxisScaleFormatter']) {
                    props['display.visualizations.charting.axisY.scale'] = flattenedModules['AxisScaleFormatter']['default'];
                }
                if (flattenedModules['FancyChartTypeFormatter']) {
                    props['display.visualizations.type'] = 'charting';
                    props['display.visualizations.charting.chart'] = flattenedModules['FancyChartTypeFormatter']['default'];
                }
                if (flattenedModules['ChartTypeFormatter']) {
                    //unfancy wins
                    props['display.visualizations.type'] = 'charting';
                    props['display.visualizations.charting.chart'] = flattenedModules['ChartTypeFormatter']['default'];
                }
                if (flattenedModules['LegendFormatter']) {
                    props['display.visualizations.charting.legend.placement'] = flattenedModules['LegendFormatter']['default'];
                }
                if (flattenedModules['LineMarkerFormatter']) {
                    props['display.visualizations.charting.axisX.markers'] = splunkd_utils.normalizeBooleanTo01String(flattenedModules['LineMarkerFormatter']['default']);
                }
                if (flattenedModules['NullValueFormatter']) {
                    props['display.visualizations.charting.chart.nullValueMode'] = flattenedModules['NullValueFormatter']['default'];
                }
                if (flattenedModules['StackModeFormatter']) {
                    props['display.visualizations.charting.chart.stackMode'] = flattenedModules['StackModeFormatter']['default'];
                }
                if (flattenedModules['XAxisTitleFormatter']) {
                    props['display.visualizations.charting.axisTitleX.text'] = flattenedModules['XAxisTitleFormatter']['default'];
                }
                if (flattenedModules['YAxisRangeMaximumFormatter']) {
                    props['display.visualizations.charting.axisY.maximumNumber'] = flattenedModules['YAxisRangeMaximumFormatter']['default'];
                }
                if (flattenedModules['YAxisRangeMinimumFormatter']) {
                    props['display.visualizations.charting.axisY.minimumNumber'] = flattenedModules['YAxisRangeMinimumFormatter']['default'];
                }
                if (flattenedModules['YAxisRangeMinimumFormatter']) {
                    props['display.visualizations.charting.axisY.minimumNumber'] = flattenedModules['YAxisRangeMinimumFormatter']['default'];
                }
                if (flattenedModules['YAxisTitleFormatter']) {
                    props['display.visualizations.charting.axisTitleY.text'] = flattenedModules['YAxisTitleFormatter']['default'];
                }
                if (flattenedModules['FlashChart']) {
                    props['display.visualizations.chartHeight'] = (flattenedModules['FlashChart']['height']).replace('px', '');
                }
                if (flattenedModules['JSChart']) {
                    //The viewstate will have either FlashChart OR JSChart
                    props['display.visualizations.chartHeight'] = (flattenedModules['JSChart']['height']).replace('px', '');
                }                
                if (flattenedModules['FlashTimeline']) {
                    if (splunkUtil.normalizeBoolean(flattenedModules['FlashTimeline']['minimized'])) {
                        props['display.page.search.timeline.format'] = 'compact';
                    } else {
                        props['display.page.search.timeline.format'] = 'hidden';
                    }
                }
                if (flattenedModules['Count']) {
                    count = flattenedModules['Count']['default'] || flattenedModules['Count']['count'];
                    
                    if (statsTabSelected || vizTabSelected) {
                        props['display.prefs.statistics.count'] = count;
                    } else {
                        props['display.prefs.events.count'] = count;
                    }    
                }
                if (flattenedModules['DataOverlay']) {
                    props['display.statistics.overlay'] = flattenedModules['DataOverlay']['default'] || flattenedModules['DataOverlay']['dataOverlayMode'];
                }
                if (flattenedModules['HiddenSoftWrap']) {
                    softWrap = splunkd_utils.normalizeBooleanTo01String(flattenedModules['HiddenSoftWrap']['enable']);
                    
                    if (statsTabSelected || vizTabSelected) {
                        props['display.statistics.wrap'] = softWrap;
                    } else {
                        props['display.events.list.wrap'] = softWrap;
                        props['display.events.table.wrap'] = softWrap;                       
                    }
                }
                if (flattenedModules['SoftWrap']) {
                    //non hidden wins
                    softWrap = splunkd_utils.normalizeBooleanTo01String(flattenedModules['SoftWrap']['enable']);
                    
                    if (statsTabSelected || vizTabSelected) {
                        props['display.statistics.wrap'] = softWrap;
                    } else {
                        props['display.events.list.wrap'] = softWrap;
                        props['display.events.table.wrap'] = softWrap;                        
                    }
                }
                if (flattenedModules['MaxLines']) {
                    props['display.events.maxLines'] = flattenedModules['MaxLines']['default'] || flattenedModules['MaxLines']['maxLines'];
                }
                if (flattenedModules['RowNumbers']) {
                    rowNumbers = flattenedModules['RowNumbers']['default'] || flattenedModules['RowNumbers']['displayRowNumbers'];
                    rowNumbers = splunkd_utils.normalizeBooleanTo01String(rowNumbers);
                    
                    if (statsTabSelected || vizTabSelected) {
                        props['display.statistics.rowNumbers'] = rowNumbers;
                    } else {
                        props['display.events.rowNumbers'] = rowNumbers;
                    }
                }
                if (flattenedModules['Segmentation']) {
                    segmentation = flattenedModules['Segmentation']['default'] || flattenedModules['Segmentation']['segmentation'];
                    
                    if (statsTabSelected || vizTabSelected) {
                        if (['row', 'cell', 'none'].indexOf(segmentation) > -1) {
                            props['display.statistics.drilldown'] = segmentation;
                        }
                    } else {
                        if (['inner', 'outer', 'full', 'none'].indexOf(segmentation) > -1) {
                            props['display.events.list.drilldown'] = segmentation;
                            props['display.events.raw.drilldown'] = segmentation;
                        }
                    }
                }
                if (flattenedModules['FieldPicker']) {
                    //example: display.events.fields":"[\"host\",\"source\",\"sourcetype\"]"
                    fields = flattenedModules['FieldPicker']['fields'].split(',');
                    props['display.events.fields'] = '[\"' + fields.join('\",\"') + '\"]';
                    props['display.page.search.showFields'] = splunkd_utils.normalizeBooleanTo01String(flattenedModules['FieldPicker']['sidebarDisplay']);
                }
                
                return props;
            }
        });
    }
);