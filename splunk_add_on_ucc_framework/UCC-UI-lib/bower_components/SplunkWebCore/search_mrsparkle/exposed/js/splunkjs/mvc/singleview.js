define(function(require, exports, module) {
    var _ = require('underscore');
    var BaseVisualizationView = require("./visualizationview");
    var ReportVisualizer = require('views/shared/ReportVisualizer');
    var Utils = require('./utils');
    var Drilldown = require('./drilldown');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name SingleView
     * @description The **Single** view displays a single value based on a search 
     * manager, which can be useful for showing an aggregate value such as a 
     * `stats count`.
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {String} [options.afterLabel] - Deprecated. The label to display 
     * before (to the left of) the value. 
     * @param {String} [options.beforeLabel] - Deprecated. The label to display 
     * after (to the right of) the value.
     * @param {String} [options.classField] - When set to "`range`", works with the 
     * `rangemap` search command to visually convey severity. For more about the 
     * `rangemap` command, see <a href="http://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Rangemap#Using_rangemap_with_single_value_panels" target="_blank">Using rangemap with single value panels</a>.
     * @param {String} [options.colorBy="value"] - Specifies whether all single 
     * value components are colored by delta value's color ("`trend`"), or by value's 
     * severity color ("`value`"). Available colors are red, green, and black. By 
     * default, or if **trendColorInterpretation** is set to "`standard`", a positive 
     * trend color is green, a 0 trend value is black, and a negative trend value 
     * is red. If **trendColorInterpretation** is set to "`inverse`", a positive 
     * trend is red, negative is green. 
     * @param {String} [options.colorMode="none"] - Specifies how the background 
     * is colored based on the range map severity ("`block`" displays the background 
     * with the range color with white text, and "`none`" displays a white background 
     * with text that uses the range color).
     * @param {String} [options.data="preview"] - The type of data to retrieve from 
     * the search results </br>(`results | preview | events | summary | timeline`).
     * @param {String} [options.drilldown="none"] - Indicates whether to enable 
     * drilldown ( "`all`" enables drilldown, "`none`" disables drilldown). 
     * @param {String} [options.field] - The search field to use as the display value.
     * @param {Number} [options.height=115] - Specifies the view height, in pixels.
     * @param {String} [options.managerid=null] - The ID of the search manager to 
     * bind this control to.
     * @param {String} [options.numberPrecision="0"] - Specifies the number of 
     * decimal places to display. For decimal precision, indicate the number of 
     * places using "0." followed by up to four zeroes, for example "0.0" or "0.00".
     * @param {String[]} [options.rangeColors] - Specifies the hex values for coloring the range order. 
     * The values map to each of the **rangeValue** ranges. The hex value format 
     * should be "`0xFFFFFF`" or "`FFFFFF`". If there are more** rangeColor** hex values 
     * than ranges, excess **rangeColor** values at end of array are ignored. If 
     * there are more **rangeValues** than **rangeColors**, excess **rangeValues** 
     * appear dark gray if metric falls within that range.<br>You can specify any 
     * number of colors.<br>Defaults to standard rangemap severities 
     * (`severe:&nbsp;red &#124; high:&nbsp;orange &#124; elevated:&nbsp;yellow 
     * &#124; guarded:&nbsp;blue &#124; low:&nbsp;green`).
     * @param {Number[]} [options.rangeValues] - Specifies 
     * the range limits for coloring. If there are more **rangeColor** hex values 
     * than ranges, excess **rangeColor** values at end of array are ignored. If 
     * there are more **rangeValues** than **rangeColors**, excess **rangeValues** 
     * appear dark gray if metric falls within that range.<br>Use the **rangeColors** 
     * property to customize severity levels and colors.
     * @param {Object} [options.settings] - The properties of the view. 
     * @param {Boolean} [options.showSparkline=true] - Specifies whether the single 
     * value hides its sparkline, if available. A sparkline is available for searches 
     * that use the `timechart` search command for the search results.
     * @param {Boolean} [options.showTrendIndicator=true] - Specifies whether the 
     * single value hides its delta value, if available.
     * @param {String} [options.trendColorInterpretation="standard"] - Specifies 
     * whether a field value greater than 0 is a positive ("`standard`") or negative 
     * ("`inverse`") development.
     * @param {String} [options.trendDisplayMode="absolute"] - Specifies whether 
     * the delta amount is displayed as a percentage ("`percent`") or an absolute 
     * count ("`absolute`").
     * @param {String} [options.trendInterval="auto"] - Specifies a time range
     * in the past from which to calculate a delta from the most recent data point 
     * in the same metric. Use the search syntax for time modifiers to indicate 
     * the range. For more, see 
     * <a href="http://docs.splunk.com/Documentation/Splunk/latest/Search/Specifytimemodifiersinyoursearch" target="_blank">Specify time modifiers in your search</a> 
     * in the *Search Manual*.
     * @param {String} [options.underLabel=null] - The label to display below the value.
     * @param {Boolean} [options.useColors=false] - Specifies whether all single 
     * value components are colored. Set to `true` for text coloring and color 
     * options availability.
     * @param {Boolean} [options.useThousandSeparators=true] - Specifies whether 
     * to format the result value with thousand separators.
     *
     * @example
     * require([
     *     "splunkjs/mvc/singleview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(SingleView) {
     * 
     *     // Instantiate components
     *     new SingleView({
     *         id: "example-single",
     *         managerid: "example-search",
     *         beforeLabel: "Event count:",
     *         el: $("#mysingleview")
     *     }).render();
     * 
     * }); 
     */
    var SingleView = BaseVisualizationView.extend(/** @lends splunkjs.mvc.SingleView.prototype */{
        moduleId: module.id,

        className: "splunk-single",

        options: _.extend({}, BaseVisualizationView.prototype.options, {
            linkView: "search",
            height: '115px'
        }),

        normalizeSettings: function(settings) {
            BaseVisualizationView.prototype.normalizeSettings.apply(this, arguments);
            settings.set('drilldown',
                Drilldown.getNormalizedDrilldownType(settings.get('drilldown'), { 'default': 'none' }));
        },

        syncSettingsAndReportModel: function(settings, report) {
            this._settingsSync = Utils.syncModels(settings, report, {
                auto: true,
                prefix: 'display.visualizations.singlevalue.',
                alias: {
                    height: 'display.visualizations.singlevalueHeight'
                },
                include: ["additionalClass", "linkView", "field", "linkFields", "classField",
                    "beforeLabel", "afterLabel", "underLabel", "unit", "unitPosition", "linkSearch", "drilldown",
                    "colorMode", "trendColorInterpretation", "trendInterval", "rangeValues", "rangeColors",
                    "height", "showSparkline", "showTrendIndicator", "trendDisplayMode", "colorBy", "useColors",
                    "numberPrecision", "useThousandSeparators"]
            });
        },

        getVisualizationRendererOptions: function() {
            return ({
                generalTypeOverride: ReportVisualizer.GENERAL_TYPES.VISUALIZATIONS,
                customConfigOverride: { 'display.visualizations.type': 'singlevalue' }
            });
        },

        waitingTemplate: '\
            <div class="msg waiting">\
                <div class="single-value">\
                    <span class="single-result">&hellip;</span>\
                </div>\
            </div>\
        ',

        noResultsTemplate: '\
            <div class="msg no-results">\
                <div class="single-value">\
                    <span class="single-result">N/A</span>\
                </div>\
            </div>\
        ',

        remove: function() {
            if(this.reportModel) {
                if(this.reportModel._sync) {
                    this.reportModel._sync.destroy();
                }
                if(this.reportModel._sync2) {
                    this.reportModel._sync2.destroy();
                }
                this.reportModel.off();
            }
            if (this._settingsSync) {
                this._settingsSync.destroy();
            }
            return BaseVisualizationView.prototype.remove.call(this);
        }
    });

    return SingleView;
});
