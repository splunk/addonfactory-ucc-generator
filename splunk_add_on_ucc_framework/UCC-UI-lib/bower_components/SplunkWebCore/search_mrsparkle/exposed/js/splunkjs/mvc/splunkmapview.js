define(function(require, exports, module) {
    var _ = require("underscore");
    var BaseVisualizationView = require("./visualizationview");
    var ReportVisualizer = require('views/shared/ReportVisualizer');
    var utils = require('./utils');
    var console = require('util/console');
    var Drilldown = require('./drilldown');
    var splunkConfig = require('splunk.config');
    var GeneralUtils = require('util/general_utils');

    var TileSources = {
        openStreetMap: {
            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 18
        }
        // JIRA: dynamically add Splunk tile source info (DVPL-3318)
    };

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name SplunkMapView
     * @description The **SplunkMap** view binds a map to a search that interprets 
     * geographic data and displays it on a map. Data with `lat` and `lon` 
     * fields are used to populate map markers according to location. This view 
     * works best with the <a href="http://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Geostats" target="_blank">**geostats**</a> search command, which provides clustering and spatial statistics in the Splunk search language.
     *
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {String} [options.data="preview"] - The type of data to retrieve from the 
     * search results </br>(`results | preview | events | summary | timeline`).
     * @param {Boolean} [options.drilldown=true] - Indicates whether to enable a drilldown 
     * action when this view is clicked.
     * @param {String} [options.drilldown="all"] - Indicates whether to enable a drilldown 
     * action when this view is clicked. Possible values are "<tt>all</tt>" to enable drilldown, or "<tt>none</tt>"
     * to disable it.
     * @param {Boolean} [options.drilldownRedirect=true] - Indicates whether to redirect 
     * to a search page when clicked. When true, a refined search corresponding 
     * to the point that was clicked is displayed in the search app. When false, 
     * you must create a click event handler to define a drilldown action. You 
     * can also use the **preventDefault** method in the click event handler to 
     * bypass the default redirect to search.
     * @param {Number} [options.height=400] - The height of the view, in pixels.
     * @param {String} [options.height="400px"] - The height of the view, in pixels.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind 
     * this control to.
     * @param {String} [options.mapping.type="marker"] - The type of map to render (`marker | choropleth`). 
     * @param {} [options.mapping.*] - Simple XML map properties. For a list 
     * of mapping properties, see the 
     * <a href="http://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML#map" target="_blank">map</a>
     * and <a href="http://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML#Choropleth_map_options" target="_blank">Choropleth map options</a>
     * in the <i>Dashboards and Visualizations</i> manual.
     * @param {Number} [options.maxZoom] - An integer that indicates the maximum zoom 
     * level of the tileset.
     * @param {Boolean} [options.resizable=false] - Indicates whether the view can be 
     * resized.
     * @param {Object} [options.settings] - The properties of the view. 
     * @param {String} [options.tileSource="splunk"] - The tiles to use in map rendering 
     * (`openStreetMap | splunk`).</br>**Note**&nbsp;&nbsp;The "`splunk`" tile 
     * set is only supported for Splunk Web apps. 
     *
     * @example
     * // This example uses search results from a sample earthquakes lookup table,
     * // and includes lat and lng fields in the search query. To
     * // try it for yourself, download earthquakes.csv
     * // (http://docs.splunk.com/DocumentationStatic/WebFramework/1.2/earthquakes.csv) 
     * // to a /lookups directory under $SPLUNK_HOME/etc/apps/<your_app_name>.
     * 
     * require([
     * 
     * require([
     *     "splunkjs/mvc/searchmanager",
     *     "splunkjs/mvc/splunkmapview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(SearchManager, SplunkMapView) {
     * 
     *     // Create managers
     *     new SearchManager({
     *         id: "example-search",
     *         search: "| inputlookup earthquakes.csv | search  Region=Washington | rename Lat as lat, Lon as lon | geostats count" 
     *     });
     * 
     *     // Instantiate components
     *     mysplunkmap = new SplunkMapView({
     *         id: "example-splunkmap",
     *         managerid: "example-search",
     *         drilldown: true,
     *         drilldownRedirect: true,
     *         tileSource: "splunk",
     *         "mapping.map.zoom": 6, // Place complex property names within quotes
     *         "mapping.map.center": "(47.5,-120)", // Center on Washington state
     *         "mapping.markerLayer.markerOpacity": 0.6,
     *         "mapping.markerLayer.markerMinSize": 15,
     *         el: $("#mysplunkmapview")
     *     }).render();
     * 
     *     // Create an on-click event handler to change the default drilldown behavior 
     *     mysplunkmap.on("click:marker", function(e) {
     *         e.preventDefault();
     *         alert(e.data.count + " earthquakes near (" + e.data.latitude + ", " + e.data.longitude + ")");
     *         console.log(e.data); // Displays data to the console
     *     });
     * 
     * });
     */
    var SplunkMapView = BaseVisualizationView.extend(/** @lends splunkjs.mvc.SplunkMapView.prototype */{
        moduleId: module.id,

        className: "splunk-map",

        options: _.extend({}, BaseVisualizationView.prototype.options, {
            tileSource: undefined,
            height: '400px'
        }),

        normalizeSettings: function(settings) {
            BaseVisualizationView.prototype.normalizeSettings.apply(this, arguments);
            settings.set('drilldown', Drilldown.getNormalizedDrilldownType(settings.get('drilldown'), { allowBoolean: true }));
            if (settings.has("mapping.map.scrollZoom")) {
                if(GeneralUtils.isBooleanEquivalent(settings.get("mapping.map.scrollZoom"))) {
                    settings.set("mapping.map.scrollZoom", GeneralUtils.normalizeBoolean(settings.get("mapping.map.scrollZoom")));
                }
            }
            if (settings.has("mapping.map.panning")) {
                if(GeneralUtils.isBooleanEquivalent(settings.get("mapping.map.panning"))) {
                    settings.set("mapping.map.panning", GeneralUtils.normalizeBoolean(settings.get("mapping.map.panning")));
                }
            }
            var mappingType = settings.get("mapping.type");
            if (mappingType !== "marker" && mappingType !== "choropleth") {
                settings.set("mapping.type", "marker");
            }

            // In independent mode we default to using OSM tiles
            // because we don't know where to find the splunk tiles
            // on the server. When in integrated mode, this is handled
            // by the web proxy server.
            // JIRA: hopefully in the future we can default to splunk
            // tiles if we make the map less reliant on splunkweb (DVPL-3670)
            if (splunkConfig.INDEPENDENT_MODE) {
                if (!settings.has('tileSource')) {
                    settings.set('tileSource', 'openStreetMap');
                }
            }
        },

        initialize: function(options) {
            BaseVisualizationView.prototype.initialize.apply(this, arguments);
            this.$el.css({ 'overflow': 'hidden', 'position': 'relative' });
            this.$msg.css({ 'overflow': 'hidden', 'position': 'absolute', 'width': '100%', height: '100%' });

            // For these next three properties, there are two ways for them to appear in the settings model, only one
            // of which is aliased to the its counterpart in the report model.  These listeners make sure the two
            // properties stay in sync within the settings model (SPL-81910).
            this.listenTo(this.settings, 'change:maxZoom', function(model, value) {
                this.settings.set({ 'mapping.tileLayer.maxZoom': value }, { silent: true });
            });
            this.listenTo(this.settings, 'change:tileUrl', function(model, value) {
                this.settings.set({ 'mapping.tileLayer.url': value }, { silent: true });
            });

            this.listenTo(this.settings, 'change:drilldown', function(model, value) {
                this.settings.set({ 'mapping.drilldown': value }, { silent: true });
            });

            this.listenTo(this.settings, 'change:tileSource', this._updateTileSource);
            this._updateTileSource();
        },

        syncSettingsAndReportModel: function(settings, report) {
            this._settingsSync = utils.syncModels(settings, report, {
                auto: true,
                prefix: 'display.visualizations.',
                alias: {
                    tileUrl: 'display.visualizations.mapping.tileLayer.url',
                    maxZoom: 'display.visualizations.mapping.tileLayer.maxZoom',
                    drilldown: 'display.visualizations.mapping.drilldown',
                    height: 'display.visualizations.mapHeight'
                },
                exclude: ['managerid', 'data', 'tileSource', 'type', 'drilldownRedirect']
            });
        },

        getVisualizationRendererOptions: function() {
            return ({
                generalTypeOverride: ReportVisualizer.GENERAL_TYPES.VISUALIZATIONS,
                customConfigOverride: { 'display.visualizations.type': 'mapping' }
            });
        },

        hideVisualization: function() {
            this.$viz.css("visibility", "hidden");
        },

        showVisualization: function() {
            this.$viz.css("visibility", "");
        },

        message: function(type) {
            if (type === 'waiting' || type === 'no-results') {
                this.hideMessages();
                return;
            }
            BaseVisualizationView.prototype.message.apply(this, arguments);
        },

        _updateTileSource: function() {
            if (this.settings.has('tileSource')) {
                var tileSource = TileSources[this.settings.get('tileSource')];
                if (tileSource) {
                    this.settings.set({
                        tileUrl: tileSource.url,
                        maxZoom: tileSource.maxZoom
                    });
                } else {
                    console.warn('Invalid tileSource parameter value=%o', tileSource);
                }
            }
        },

        onDrilldown: function(e, payload) {
            this.trigger('click:marker', payload, this);
        },

        remove: function() {
            if (this._settingsSync) {
                this._settingsSync.destroy();
            }
            return BaseVisualizationView.prototype.remove.call(this);
        }
    });

    return SplunkMapView;
});
/**
 * Click event.
 *
 * @name splunkjs.mvc.SplunkMapView#click:marker
 * @event
 * @property {Boolean} click:marker - Fired when the SplunkMap view is clicked.
 */
