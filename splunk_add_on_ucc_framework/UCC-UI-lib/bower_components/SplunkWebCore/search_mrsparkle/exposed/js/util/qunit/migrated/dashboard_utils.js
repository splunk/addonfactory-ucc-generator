/* globals assert */
define([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc',
    'models/Base',
    'mocks/models/MockSplunkD',
    'mocks/models/MockUser',
    'mocks/models/MockServerInfo',
    'mocks/models/MockDashboardView',
    'models/dashboard/DashboardDisplayProps'
], function($,
            _,
            Backbone,
            mvc,
            BaseModel,
            MockSplunkD,
            MockUser,
            MockServerInfo,
            MockDashboardView,
            DashboardDisplayProps) {

    var REPORT_DEFAULTS = {
        'display.general.enablePreview': '1',
        'display.general.type': 'events',
        'display.general.timeRangePicker.show': '1',
        'display.general.migratedFromViewState': '0',
        'display.events.fields': '["host","source","sourcetype"]',
        'display.events.type': 'list',
        'display.events.rowNumbers': '0',
        'display.events.maxLines': '5',
        'display.events.raw.drilldown': 'full',
        'display.events.list.drilldown': 'full',
        'display.events.list.wrap': '1',
        'display.events.table.drilldown': '1',
        'display.events.table.wrap': '1',
        'display.statistics.rowNumbers': '0',
        'display.statistics.wrap': '1',
        'display.statistics.overlay': 'none',
        'display.statistics.drilldown': 'cell',
        'display.statistics.show': '1',
        'display.visualizations.show': '1',
        'display.visualizations.type': 'charting',
        'display.visualizations.chartHeight': '300',
        'display.visualizations.charting.chart': 'column',
        'display.visualizations.charting.chart.stackMode': 'default',
        'display.visualizations.charting.chart.nullValueMode': 'gaps',
        'display.visualizations.charting.chart.overlayFields': '',
        'display.visualizations.charting.drilldown': 'all',
        'display.visualizations.charting.chart.style': 'shiny',
        'display.visualizations.charting.layout.splitSeries': '0',
        'display.visualizations.charting.layout.splitSeries.allowIndependentYRanges': '0',
        'display.visualizations.charting.legend.placement': 'right',
        'display.visualizations.charting.legend.labelStyle.overflowMode': 'ellipsisMiddle',
        'display.visualizations.charting.axisTitleX.text': '',
        'display.visualizations.charting.axisTitleY.text': '',
        'display.visualizations.charting.axisTitleY2.text': '',
        'display.visualizations.charting.axisTitleX.visibility': 'visible',
        'display.visualizations.charting.axisTitleY.visibility': 'visible',
        'display.visualizations.charting.axisTitleY2.visibility': 'visible',
        'display.visualizations.charting.axisX.scale': 'linear',
        'display.visualizations.charting.axisY.scale': 'linear',
        'display.visualizations.charting.axisY2.scale': 'inherit',
        'display.visualizations.charting.axisLabelsX.majorLabelStyle.overflowMode': 'ellipsisNone',
        'display.visualizations.charting.axisLabelsX.majorLabelStyle.rotation': '0',
        'display.visualizations.charting.axisLabelsX.majorUnit': '',
        'display.visualizations.charting.axisLabelsY.majorUnit': '',
        'display.visualizations.charting.axisLabelsY2.majorUnit': '',
        'display.visualizations.charting.axisX.minimumNumber': '',
        'display.visualizations.charting.axisY.minimumNumber': '',
        'display.visualizations.charting.axisY2.minimumNumber': '',
        'display.visualizations.charting.axisX.maximumNumber': '',
        'display.visualizations.charting.axisY.maximumNumber': '',
        'display.visualizations.charting.axisY2.maximumNumber': '',
        'display.visualizations.charting.axisY2.enabled': '0',
        'display.visualizations.charting.chart.showDataLabels': 'none',
        'display.visualizations.charting.chart.sliceCollapsingThreshold': '0.01',
        'display.visualizations.charting.gaugeColors': '',
        'display.visualizations.charting.chart.rangeValues': '',
        'display.visualizations.charting.chart.bubbleMaximumSize': '50',
        'display.visualizations.charting.chart.bubbleMinimumSize': '10',
        'display.visualizations.charting.chart.bubbleSizeBy': 'area',
        'display.visualizations.custom.height': '',
        'display.visualizations.custom.type': '',
        'display.visualizations.singlevalueHeight': '100',
        'display.visualizations.singlevalue.beforeLabel': '',
        'display.visualizations.singlevalue.afterLabel': '',
        'display.visualizations.singlevalue.underLabel': '',
        'display.visualizations.singlevalue.unit': '',
        'display.visualizations.singlevalue.unitPosition': 'after',
        'display.visualizations.singlevalue.drilldown': 'none',
        'display.visualizations.singlevalue.colorMode': 'none',
        'display.visualizations.singlevalue.rangeValues': '',
        'display.visualizations.singlevalue.rangeColors': '',
        'display.visualizations.singlevalue.trendInterval': '',
        'display.visualizations.singlevalue.trendColorInterpretation': 'standard',
        'display.visualizations.singlevalue.showTrendIndicator': '1',
        'display.visualizations.singlevalue.showSparkline': '1',
        'display.visualizations.singlevalue.trend.displayMode': 'absolute',
        'display.visualizations.singlevalue.colorBy': 'value',
        'display.visualizations.singlevalue.useColors': '0',
        'display.visualizations.singlevalue.numberPrecision': '0',
        'display.visualizations.singlevalue.useThousandSeparators': '1',
        'display.visualizations.mapHeight': '400',
        'display.visualizations.mapping.type': 'marker',
        'display.visualizations.mapping.drilldown': 'all',
        'display.visualizations.mapping.map.center': '(0,0)',
        'display.visualizations.mapping.map.zoom': '2',
        'display.visualizations.mapping.map.scrollZoom': '0',
        'display.visualizations.mapping.map.panning   ': '1',
        'display.visualizations.mapping.markerLayer.markerOpacity': '0.8',
        'display.visualizations.mapping.markerLayer.markerMinSize': '10',
        'display.visualizations.mapping.markerLayer.markerMaxSize': '50',
        'display.visualizations.mapping.choroplethLayer.colorMode': 'auto',
        'display.visualizations.mapping.choroplethLayer.maximumColor': '0xDB5800',
        'display.visualizations.mapping.choroplethLayer.minimumColor': '0x2F25BA',
        'display.visualizations.mapping.choroplethLayer.colorBins': '5',
        'display.visualizations.mapping.choroplethLayer.neutralPoint': '0',
        'display.visualizations.mapping.choroplethLayer.shapeOpacity': '0.75',
        'display.visualizations.mapping.choroplethLayer.showBorder': '1',
        'display.visualizations.mapping.data.maxClusters': '100',
        'display.visualizations.mapping.showTiles': '1',
        'display.visualizations.mapping.tileLayer.tileOpacity': '1',
        'display.visualizations.mapping.tileLayer.url': '',
        'display.visualizations.mapping.tileLayer.minZoom': '0',
        'display.visualizations.mapping.tileLayer.maxZoom': '7'
    };

    var dashboardUtils = {
        mockModel: function(options) {
            options || (options = {});
            var model = {};
            model.controller = new Backbone.Model();
            model.user = new MockUser(options.user || {});
            model.userPref = new MockSplunkD();
            model.userPref.entry.content.set(options.userPref || {});
            model.serverInfo = new MockServerInfo();
            model.application = new Backbone.Model(options.application || {});
            model.state = new Backbone.Model(options.state || {mode: 'view'});
            model.page = new DashboardDisplayProps(options.page || {});
            model.view = new MockDashboardView(options.view || {});
            model.view.entry.acl.set(options.acl || {});
            model.view.entry.content.set(options.entryContent || {});
            model.reportDefaults = new MockSplunkD();
            model.reportDefaults.entry.content.set(REPORT_DEFAULTS);
            return model;
        },
        mockCollection: function(options) {
            options || (options = {});
            var collection = {
                dashboardMessages: options.dashboardMessages || new Backbone.Collection(),
                appLocalsUnfilteredAll: options.appLocalsUnfilteredAll || {} // for infodelivery
            };
            return collection;
        },
        mockDeferreds: function(options) {
            options || (options = {});
            var deferreds = {};
            deferreds.componentReady = options.componentReady || $.Deferred().resolve();
            deferreds.reportDefaults = options.reportDefaults || $.Deferred().resolve();
            deferreds.reportReady = options.reportReady || $.Deferred().resolve();
            return deferreds;
        },
        mockOptions: function(options) {
            options || (options = {});
            return {
                model: this.mockModel(options.model),
                collection: this.mockCollection(options.collection),
                deferreds: this.mockDeferreds(options.deferreds)
            };
        },
        cleanRegistry: function(options) {
            options = _.extend({keepTokens: false}, options);
            _.each(mvc.Components.getInstances(), function(instance) {
                if (!options.keepTokens && (instance.id != "submitted" && instance.id != "default")) {
                    mvc.Components.revokeInstance(instance.id);
                }
            });
        },
        initializeTokenSpaces: function() {
            mvc.Components.getInstance('default', {create: true});
            mvc.Components.getInstance('submitted', {create: true});
        },
        getReportDefaults: function() {
            return REPORT_DEFAULTS;
        }
    };

    return dashboardUtils;
});