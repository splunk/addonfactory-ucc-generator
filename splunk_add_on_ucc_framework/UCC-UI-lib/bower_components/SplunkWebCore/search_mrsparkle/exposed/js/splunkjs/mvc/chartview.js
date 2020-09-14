define(function(require, exports, module) {
    var _ = require('underscore');
    var BaseVisualizationView = require("./visualizationview");
    var Drilldown = require('./drilldown');
    var utils = require('./utils');
    var console = require('util/console');
    var SplunkUtil = require('splunk.util');
    var GeneralUtils = require('util/general_utils');
    var ReportVisualizer = require('views/shared/ReportVisualizer');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name ChartView
     * @description The **Chart** view displays any series of data you want to plot
     * in any of the following configurable chart types:
     * - Area
     * - Bar
     * - Bubble
     * - Column
     * - Filler gauge
     * - Line
     * - Marker gauge
     * - Pie
     * - Radial gauge
     * - Scatter
     *
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options
     * @param {String} options.id - The unique ID for this control.
     * @param {String} [options.options.charting.*] - Splunk JSChart library properties. For a
     * list of charting properties, see the
     * <a href="http://docs.splunk.com/Documentation/Splunk/latest/Viz/ChartConfigurationReference" target="_blank">Chart Configuration Reference</a>.
     * Note that the properties for Flash-only charts are not supported.
     * @param {String} [options.data="preview"] - The type of data to retrieve from the
     * search results <br>(<tt>results | preview | events</tt>).
     * @param {String} [options.drilldown="all"] - Indicates whether drilldown is enabled.
     * Possible values are "<tt>all</tt>" to enable drilldown, or "<tt>none</tt>"
     * to disable it.
     * @param {Boolean} [options.drilldownRedirect=true] - Indicates whether to redirect
     * to a search page when clicked. When true, a refined search corresponding
     * to the point that was clicked is displayed in the search app. When false,
     * you must create a click event handler to define a drilldown action. You
     * can also use the **preventDefault** method in the click event handler
     * to bypass the default redirect to search.
     * @param {Number} [options.height=250] - Height of the chart, in pixels.
     * @param {String} [options.height="250px"] - Height of the chart, in pixels.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind
     * this control to.
     * @param {Boolean} [options.resizable=false] - Indicates whether the view can be
     * resized.
     * @param {String} [options.type="column"] - The type of chart to create </br>
     * (<tt>area &#124; bar &#124; bubble &#124; column &#124; fillerGauge &#124; line &#124; markerGauge &#124; pie &#124; radialGauge&#124; scatter</tt>).
     * @param {Object} [options.settings] - The properties of the view.
     *
     * @example
     * require([
     *     "splunkjs/mvc/chartview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(ChartView) {
     *
     *     // Instantiate components
     *     var barchart = new ChartView({
     *         id: "example-chart",
     *         managerid: "example-search",
     *         type: "bar",
     *         "charting.chart.stackMode": "stacked", // Place complex property names within quotes
     *         "charting.legend.placement": "bottom",
     *         el: $("#mybarchart")
     *     }).render();
     *
     *     // Respond to a click event
     *     barchart.on("click:chart", function (e) {
     *         e.preventDefault(); // Prevent redirecting to the Search app
     *         console.log("Clicked chart: ", e); // Print event info to the console
     *     });
     *
     * });
     */
    var ChartView = BaseVisualizationView.extend(/** @lends splunkjs.mvc.ChartView.prototype */{
        moduleId: module.id,

        className: "splunk-chart",
        chartOptionPrefix: 'charting.',

        options: _.extend({}, BaseVisualizationView.prototype.options, {
            'type': 'column',
            'height': '250px'
        }),

        normalizeSettings: function(settings) {
            BaseVisualizationView.prototype.normalizeSettings.apply(this, arguments);
            this._normalizeDrilldownType(settings, settings.get(settings.has('charting.drilldown') ? 'charting.drilldown' : 'drilldown'));

            if (settings.has("charting.layout.splitSeries")) {
                if(GeneralUtils.isBooleanEquivalent(settings.get("charting.layout.splitSeries"))) {
                    settings.set("charting.layout.splitSeries", GeneralUtils.normalizeBoolean(settings.get("charting.layout.splitSeries")) ? "1" : "0");
                }
            }

            if (settings.has("show")) {
                settings.set("show", SplunkUtil.normalizeBoolean(settings.get('show')) ? "1" : "0");
            }

            if (settings.has("charting.axisY2.enabled")) {
                if(GeneralUtils.isBooleanEquivalent(settings.get("charting.axisY2.enabled"))) {
                    settings.set("charting.axisY2.enabled", GeneralUtils.normalizeBoolean(settings.get("charting.axisY2.enabled")) ? "1" : "0");
                }
            }

            if (settings.has("charting.legend.labelStyle.overflowMode")) {
                if (settings.get("charting.legend.labelStyle.overflowMode") === "default") {
                    settings.set("charting.legend.labelStyle.overflowMode", "ellipsisMiddle");
                }
            }
        },

        _normalizeDrilldownType: function(settings, value) {
            var drilldownType = Drilldown.getNormalizedDrilldownType(value, { allowBoolean: true });
            settings.set('charting.drilldown', drilldownType);
            settings.set('drilldown', drilldownType);
        },

        initialize: function(options) {
            BaseVisualizationView.prototype.initialize.apply(this, arguments);
            this.$el.css({ overflow: 'hidden', position: 'relative' });
            this.$msg.css({ 'overflow': 'hidden', 'position': 'absolute', 'width': '100%', height: '100%' });
            this.listenTo(this.viz, 'chartRangeSelect', this.emitSelectionEvent);

            // If the "type" is changed after initialization the new value should take precedence over what
            // was in the report.
            this.listenTo(this.settings, 'change:type', function() {
                this.model.set("display.visualizations.charting.chart", this.settings.get("type"));
            });
            this.listenTo(this.settings, 'change:drilldown change:charting.drilldown', this._normalizeDrilldownType);
        },

        syncSettingsAndReportModel: function(settings, report) {
            this._settingsSync = utils.syncModels(settings, report, {
                auto: true,
                prefix: 'display.visualizations.',
                alias: {
                    height: 'display.visualizations.chartHeight'
                },
                exclude: ['managerid', 'id', 'name', 'data', 'type', 'drilldownRedirect', 'pagerPosition', 'refreshDisplay']
            });

            // Support the API of controlling the chart type via the "type" constructor option, but be defensive initially
            // to prevent the default value from trumping what's in the report.
            if(!report.has("display.visualizations.charting.chart") && settings.get("type")) {
                report.set("display.visualizations.charting.chart", settings.get("type"));
            }
        },

        getVisualizationRendererOptions: function() {
            return ({
                messageContainerClass: 'splunk-message-container compact',
                generalTypeOverride: ReportVisualizer.GENERAL_TYPES.VISUALIZATIONS,
                customConfigOverride: { 'display.visualizations.type': 'charting' }
            });
        },

        formatData: function(data) {
            console.log('chart data changed:', data);
            return data;
        },

        onDrilldown: function(e, payload) {
            this.trigger(
                (e.originalEvent.type === "legendClick")
                    ? "clicked:legend click:legend"
                    : "clicked:chart click:chart",
                _.extend({}, e.originalEvent, {
                    preventDefault: payload.preventDefault,
                    drilldown: payload.drilldown
                }),
                this);
        },

        emitSelectionEvent: function(e) {
            var data = {
                start: e.startXValue,
                end: e.endXValue
            };
            if (!this.resultsModel) {
                return;
            }
            var results = this.resultsModel.data();
            if (results) {
                _(results.fields).each(function (field, idx) {
                    data['start.' + field.name] = results.columns[idx][e.startXIndex];
                    data['end.' + field.name] = results.columns[idx][e.endXIndex];
                });
            }
            var eventObj = {
                data: data,
                preventDefault: function() {
                    e.preventDefault();
                },
                results: results,
                selection: function() {
                    var data = [];
                    for (var i = e.startXIndex; i <= e.endXIndex; i++) {
                        data.push(_(results.columns).pluck(i));
                    }
                    var fields = _(results.fields).pluck('name');
                    return _(data).map(function(d) { return _.object(fields, d); });
                },
                startIndex: e.startXIndex,
                endIndex: e.endXIndex,
                startValue: e.startXValue,
                endValue: e.endXValue,
                isReset: e.isReset,
                event: e
            };
            this.trigger('selection', eventObj, this);
        },

        remove: function() {
            if(this._settingsSync) {
                this._settingsSync.destroy();
            }
            return BaseVisualizationView.prototype.remove.call(this);
        }
    });

    return ChartView;
});
/**
 * Click event.
 *
 * @event
 * @name splunkjs.mvc.ChartView#click
 * @property {Boolean} click:legend - Fired when the legend is clicked.
 * @property {Boolean} click:chart - Fired when the chart is clicked.
 */
