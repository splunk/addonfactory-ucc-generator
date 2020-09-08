/*
 * The master view for visualizing maps (marker maps and choropleth maps).
 *
 * Unlike other visualizations renderers, this view just acts as a wrapper for the raw mapping library code,
 * but does not do any "rendering".
 *
 * It provides the common API expected in the Splunk UI, and translates the models and events it receives
 * into the corresponding property updates to the mapping library API.
 */

define(function(require, exports, module) {

    var $ = require('jquery');
    var SplunkI18N = require('splunk.i18n');
    var _ = require('underscore');
    var SplunkUtil = require('splunk.util');
    var sprintf = SplunkUtil.sprintf;
    var Color = require('jg/graphics/Color');
    var FunctionUtil = require('jg/utils/FunctionUtil');
    var BaseModel = require('models/Base');
    var ExternalLegend = require('splunk/charting/ExternalLegend');
    var Map = require('splunk/mapping/Map');
    var ChoroplethLayer = require('splunk/mapping/layers/ChoroplethLayer');
    var PieMarkerLayer = require('splunk/mapping/layers/PieMarkerLayer');
    var LatLonBoundsParser = require('splunk/mapping/parsers/LatLonBoundsParser');
    var LatLonParser = require('splunk/mapping/parsers/LatLonParser');
    var ColorCodes = require('splunk/palettes/ColorCodes');
    var FieldColorPalette = require('splunk/palettes/FieldColorPalette');
    var ListColorPalette = require('splunk/palettes/ListColorPalette');
    var ArrayParser = require('splunk/parsers/ArrayParser');
    var BooleanParser = require('splunk/parsers/BooleanParser');
    var ColorParser = require('splunk/parsers/ColorParser');
    var NumberParser = require('splunk/parsers/NumberParser');
    var ObjectParser = require('splunk/parsers/ObjectParser');
    var StringParser = require('splunk/parsers/StringParser');
    var GeoJsonUtils = require('splunk/mapping/utils/GeoJsonUtils');
    var VisualizationBase = require('views/shared/viz/Base');
    var console = require('util/console');
    var ResetZoomControl = require('splunk/mapping/controls/ResetZoomControl');
    var NumericAxis = require("splunk/mapping/axis/NumericAxis");
    var NumericLegend = require("splunk/mapping/controls/NumericalLegend");
    var GeneralUtils = require("util/general_utils");
    var CategoricalVisualLegend = require("splunk/mapping/controls/CategoricalVisualLegend");

    var css = require("./Master.pcss");

    var _DEFAULT_DATA_PARAMS = {
        output_mode: 'json_cols',
        show_metadata: true,
        show_empty_fields: 'True',
        offset: 0
    };

    var _DEFAULT_PROPERTY_VALUES = {
        "fieldColors": "",
        "seriesColors": "[" + ColorCodes.toPrefixed(ColorCodes.CATEGORICAL, "0x").join(",") + "]",
        "data.maxClusters": "100",
        "showTiles": "1",
        "tileLayer.tileOpacity": "1",
        "tileLayer.url": "/splunkd/__raw/services/mbtiles/splunk-tiles/{z}/{x}/{y}",
        "tileLayer.subdomains": "[a,b,c]",
        "tileLayer.minZoom": "0",
        "tileLayer.maxZoom": "7",
        "tileLayer.invertY": "false",
        "tileLayer.attribution": "",
        "map.scrollZoom" : 0,
        "map.panning": true,
        "markerLayer.markerOpacity": "1",
        "markerLayer.markerMinSize": "10",
        "markerLayer.markerMaxSize": "50",
        "drilldown": "all",
        "choroplethLayer.colorMode": "auto",
        "choroplethLayer.maximumColor": "0xDB5800",
        "choroplethLayer.minimumColor": "0x2F25BA",
        "choroplethLayer.neutralPoint": "0",
        "choroplethLayer.shapeOpacity": "0.75",
        "choroplethLayer.colorBins": "5",
        "choroplethLayer.showBorder": "1",
        "layerType": "marker"
    };

    var _R_PROPERTY_PREFIX = /^display\.visualizations\.mapping\./;

    return VisualizationBase.extend({

        // Public Properties

        moduleId: module.id,

        // Private Properties

        _map: null,
        _markerLayer: null,
        _choroplethLayer: null,
        _externalLegend: null,
        _fieldColorPalette: null,
        _seriesColorPalette: null,
        _choroplethColorPalette: null,

        // This property will track the user-specified color mode for the choropleth visualization,
        // It will equal either an explicit color mode (sequential/divergent/categorical) or "auto",
        // the latter meaning that the color mode should be auto-detected from the data.
        _choroplethColorMode: null,

        // This property will track the color mode that has been auto-detected by inspecting the data set.
        // Its value will only affect the choropleth visualization if the user-specified "choroplethLayer.colorMode" is "auto".
        _choroplethAutoDetectedColorMode: 'sequential',

        _choroplethMinimumColor: Color.fromNumber(0x000000),
        _choroplethNeutralColor: Color.fromNumber(0xffffff),
        _choroplethMaximumColor: Color.fromNumber(0x000000),
        _choroplethNullColor: Color.fromNumber(0xD1D1D1),
        _numericLegend: null,
        _numericAxis: null,
        _propertyValues: null,
        _booleanParser: null,
        _numberParser: null,
        _stringParser: null,
        _colorParser: null,
        _numberArrayParser: null,
        _stringArrayParser: null,
        _colorArrayParser: null,
        _numberObjectParser: null,
        _colorObjectParser: null,
        _latLonParser: null,
        _latLonBoundsParser: null,
        _maxClusters: 100,
        _isPrinting: false,
        _prePrintCenter: null,
        _prePrintZoom: 0,
        _drilldown: "all",
        _layerType: null,

        // Constructor

        initialize: function(options) {
            if (!this.model.config) {
                this.model.config = new BaseModel();
            }
            VisualizationBase.prototype.initialize.apply(this, arguments);
            this.options = options || {};
            this.$el.width(this.options.width || "100%");
            this.$el.height(this.options.height || "100%");

            this._map_boundsChanged = FunctionUtil.bind(this._map_boundsChanged, this);
            this._map_mapClicked = FunctionUtil.bind(this._map_mapClicked, this);

            this._propertyValues = {};

            this._booleanParser = BooleanParser.getInstance();
            this._numberParser = NumberParser.getInstance();
            this._stringParser = StringParser.getInstance();
            this._colorParser = ColorParser.getInstance();
            this._numberArrayParser = ArrayParser.getInstance(this._numberParser);
            this._stringArrayParser = ArrayParser.getInstance(this._stringParser);
            this._colorArrayParser = ArrayParser.getInstance(this._colorParser);
            this._numberObjectParser = ObjectParser.getInstance(this._numberParser);
            this._colorObjectParser = ObjectParser.getInstance(this._colorParser);
            this._latLonParser = LatLonParser.getInstance();
            this._latLonBoundsParser = LatLonBoundsParser.getInstance();

            this._seriesColorPalette = new ListColorPalette();
            this._fieldColorPalette = new FieldColorPalette(null, this._seriesColorPalette);


            this._externalLegend = new ExternalLegend();
            this._categoricalVisualLegend = new CategoricalVisualLegend();

            this._externalLegend.connect();

            // currently we create both markerLayer and choroplethLayer, because it helps _setMapProperty() to
            // keep current logic valid. We add or remove one of these two layers to the map based on the 'layerType' property.
            // TODO: optimize the logic, to make sure we just create either markerLayer or choroplethLayer

            this._markerLayer = new PieMarkerLayer();
            this._markerLayer.set("legend", this._externalLegend);
            this._markerLayer.set("markerColorPalette", this._fieldColorPalette);

            this._numericAxis = new NumericAxis();
            this._numericLegend = new NumericLegend();

            this._choroplethColorPalette = new ListColorPalette(null, true);
            this._updateChoroplethColorPalette();

            this._choroplethLayer = new ChoroplethLayer();
            this._choroplethLayer.set("colorPalette", this._choroplethColorPalette);

            this._numericLegend.set("axis", this._numericAxis);
            this._categoricalVisualLegend.set("colorPalette", this._fieldColorPalette);
            this._categoricalVisualLegend.set("legend", this._externalLegend);
            this._choroplethLayer.set("legend", this._externalLegend);

            this._numericLegend.set('colorPalette', this._choroplethColorPalette);

            this._map = new Map();
            this._updateDataBounds();

            this._map.formatNumber = this._formatNumber;
            this._map.formatDegrees = this._formatDegrees;
            var originalZoom = this.model.config.get('display.visualizations.mapping.map.zoom');
            var originalCenter = this.model.config.get('display.visualizations.mapping.map.center');
            this._map.on("boundsChanged", this._map_boundsChanged.bind(this));
            this._map.on("mapClicked", this._map_mapClicked);
            this._map.appendTo(this.$el);
            this._map.fitWorld(true);
            this._reset_zoom = new ResetZoomControl({originalZoom: originalZoom, originalCenter: originalCenter});
            this._map.addControl(this._reset_zoom);

            this.$el.find(".leaflet-top").css("z-index","50");

            this.$el.on('mouseenter', '.legend-elem', function(e) {
                var fieldName = $(e.currentTarget).data().fieldName;
                this._choroplethLayer.set("selectedField", "" + fieldName);
                this._numericLegend.set("selectedField", "" + fieldName);
                this._categoricalVisualLegend.set("selectedField", "" + fieldName);
            }.bind(this));

            this.$el.on('mouseleave', '.legend-elem', function(e) {
                this._choroplethLayer.set("selectedField", null);
                this._numericLegend.set("selectedField", null);
                this._categoricalVisualLegend.set("selectedField", null);
            }.bind(this));
        },

        // Public Methods

        getCenter: function() {
            return this._map.get("center").normalize();
        },

        getZoom: function() {
            return this._map.get("zoom");
        },

        getLatLonBounds: function() {
            return this._map.getLatLonBounds().normalize();
        },

        getScrollWheelZoom: function() {
            return this._map.leafletMap.scrollWheelZoom._enabled;
        },

        getPostProcessSearch: function() {
            var bounds = this._map.getLatLonBounds().normalize();
            if (this._layerType === "marker") {
                return "geofilter south=" + bounds.s + " west=" + bounds.w + " north=" + bounds.n + " east=" + bounds.e + " maxclusters=" + this._maxClusters;
            }
            return 'geomfilter min_y=' + bounds.s + ' min_x=' + bounds.w + ' max_y=' + bounds.n + ' max_x=' + bounds.e;
        },

        getMaxClusters: function() {
            if (this._layerType === "marker") {
                return this._maxClusters;
            } else {
                return 2000;
            }
        },

        // Since this view is only providing wrapper functionality, the formatData routine
        // does not return anything like in other visualizations.  Instead, it processes
        // the raw data and communicates it downstream in the form of mapping API calls.
        formatData: function() {
            var extractedData = null;
            if (this.model.searchData.has('rows'))
                extractedData = this._extractRowData(this.model.searchData);
            else
                extractedData = this._extractColumnData(this.model.searchData);

            console.debug('Updating map data to', extractedData);
            var values = [];

            this._layerType = this.model.config.get('display.visualizations.mapping.type');
            if ((this._layerType === "marker") && this._markerLayer) {
                this._markerLayer.set("data", extractedData ? extractedData.data : null);
                this._markerLayer.set("fields", extractedData ? this._filterFields(extractedData.fields) : null);
            } else if ((this._layerType === "choropleth") && this._choroplethLayer) {
                if (!_(extractedData.fields).contains('geom')) {
                    this._choroplethLayer.set("featureIdFieldName", null);
                    this._choroplethLayer.set("data", null);
                    this._choroplethLayer.set("fields", null);
                    return;
                }
                var featureIdField = extractedData.data[0]['_featureIdField'];
                var filteredFields;
                if (featureIdField) {
                    filteredFields = _.union([featureIdField], this._filterFields(extractedData.fields));
                }

                if (filteredFields && filteredFields.length > 1) {
                    var fieldToExtract = filteredFields[1];
                    for(var j = 0; j < extractedData.data.length; j++) {
                        values.push(extractedData.data[j][fieldToExtract]);
                    }
                    if (values.length > 0) {
                        this._choroplethAutoDetectedColorMode = GeneralUtils.valuesAreNumeric(values) ? 'sequential' : 'categorical';
                    }
                    // Set the value of the auto-detected color mode on the config model to be read by the viz editor.
                    this.model.config.set({ autoDetectedColorMode: this._choroplethAutoDetectedColorMode }, {'transient': true});

                    // If the user-selected color mode is "auto", update the state of the choropleth visualization to match the
                    // to match the auto-detected color mode.
                    if (this._choroplethColorMode === 'auto') {
                        this._updateChoroplethToMatchColorMode();
                    }
                }
                this._choroplethLayer.set("featureIdFieldName", filteredFields ? filteredFields[0] : null);
                this._choroplethLayer.set("data", extractedData ? extractedData.data : null);
                this._choroplethLayer.set("fields", extractedData ? filteredFields : null);
            } else {
                console.log("cannot update layer data because of incorrect layerType, OR the _layerType hasn't been initialized!");
            }
        },

        // Since this view is only providing wrapper functionality, the updateView routine
        // does not explicitly render anything like in other visualizations.  Instead, it processes
        // the raw configuration attributes and communicates them downstream in the form of mapping API calls.
        updateView: function(data, props, async) {
            // Kind of weird, but we need to represent this to upstream consumers as an update
            // that never completes.  The reason is that the wrapper functionality of this view means
            // that a call to updateView might not result in any rendered updates, or a call to formatData
            // can cause a rendering update without ever going through updateView.
            //
            // Notification of updates is instead handled by the "rendered" event listeners created in
            // the "type" change handler in _setMapProperty.
            var done = async();
            var curValues = this._propertyValues;
            var newValues = {};
            var p;

            // set null values for all existing properties
            // if they are not overridden by either the default or state properties, they will be cleared
            for (p in curValues) {
                if (curValues.hasOwnProperty(p))
                    newValues[p] = null;
            }

            // copy default property values
            var defaultValues = _DEFAULT_PROPERTY_VALUES;
            for (p in defaultValues) {
                if (defaultValues.hasOwnProperty(p))
                    newValues[p] = defaultValues[p];
            }

            // copy non-empty state property values
            var stateValues = this.model.config ? this.model.config.toJSON() : {};
            var stateValue;
            for (p in stateValues) {
                if (stateValues.hasOwnProperty(p) && _R_PROPERTY_PREFIX.test(p)) {
                    stateValue = stateValues[p];
                    if ((stateValue != null) && (stateValue !== ""))
                        newValues[p.replace(_R_PROPERTY_PREFIX, "")] = stateValue;
                }
            }

            // apply map viewport properties in order
            // zoom must be first for Leaflet to do the right thing
            if (newValues.hasOwnProperty("map.zoom")) {
                this._setMapProperty("map.zoom", newValues["map.zoom"]);
                this._reset_zoom.setOriginalZoom(newValues["map.zoom"]);
            }
            if (newValues.hasOwnProperty("map.center")) {
                this._setMapProperty("map.center", newValues["map.center"]);
                this._reset_zoom.setOriginalCenter(newValues["map.center"]);
            }
            if (newValues.hasOwnProperty("map.fitBounds"))
                this._setMapProperty("map.fitBounds", newValues["map.fitBounds"]);

            // The color mode will affect how other properties should be processed,
            // so set it first to make sure everything happens in the right order.
            var newColorMode = newValues['choroplethLayer.colorMode'];
            if (newColorMode === 'auto' || newColorMode === 'sequential'
                    || newColorMode === 'divergent' || newColorMode === 'categorical') {
                this._choroplethColorMode = newColorMode;
            } else {
                delete newValues['choroplethLayer.colorMode'];
            }

            // If the active color mode is not divergent, send null values for any properties
            // that are specific to that color mode.
            if (this._getComputedColorMode() !== 'divergent') {
                newValues['choroplethLayer.minimumColor'] = null;
                newValues['choroplethLayer.neutralPoint'] = null;
            }

            // apply remaining properties
            // the viewport properties haven't changed, so they will be ignored by _setMapProperty
            for (p in newValues) {
                if (newValues.hasOwnProperty(p))
                    this._setMapProperty(p, newValues[p]);
            }
        },

        onAddedToDocument: function() {
            this._map.updateSize();
        },

        remove: function() {
            this._map.off("boundsChanged", this._map_boundsChanged);
            this._map.off("mapClicked", this._map_mapClicked);
            this._map.dispose();
            this._markerLayer.off("rendered", this._onDataLayerRendered, this);
            this._choroplethLayer.off("rendered", this._onDataLayerRendered, this);

            this._externalLegend.close();

            return VisualizationBase.prototype.remove.apply(this, arguments);
        },

        onShow: function() {
            this._map.updateSize();
            this._map.validate();
            VisualizationBase.prototype.onShow.call(this);
        },

        // Private Methods


        _updateDataBounds: function() {
            var model = this.model.config;
            if (!model)
                return;

            var bounds = this._map.getLatLonBounds().normalize();
            model.set({ "display.visualizations.mapping.data.bounds": this._latLonBoundsParser.valueToString(bounds) });
        },

        _needsPropertyUpdate: function(changedProperties) {
            if (!changedProperties)
                return false;

            for (var p in changedProperties) {
                if (changedProperties.hasOwnProperty(p) && (p !== "display.visualizations.mapping.data.bounds"))
                    return true;
            }

            return false;
        },

        _extractRowData: function(model) {
            var extractedData = {};

            var fields = this._getNormalizedFieldNames(model);
            var rows = model.get("rows");
            if (fields && rows) {
                var numFields = fields.length;
                var numRows = rows.length;
                var numEntries;
                var row;
                var obj;
                var i;
                var j;

                extractedData.fields = fields.concat();
                extractedData.data = [];
                for (i = 0; i < numRows; i++) {
                    row = rows[i];
                    numEntries = Math.min(row.length, numFields);
                    obj = {};
                    for (j = 0; j < numEntries; j++)
                        obj[fields[j]] = row[j];
                    extractedData.data.push(obj);
                }
            }

            return extractedData;
        },

        _extractColumnData: function(model) {
            var extractedData = {};

            var fields = this._getNormalizedFieldNames(model);
            var columns = model.get("columns");
            if (fields && columns) {
                var numColumns = Math.min(fields.length, columns.length);
                var numRows = (numColumns > 0) ? columns[0].length : 0;
                var obj;
                var i;
                var j;

                for (i = 1; i < numColumns; i++)
                    numRows = Math.min(numRows, columns[i].length);

                extractedData.fields = fields.slice(0, numColumns);
                extractedData.data = [];
                for (i = 0; i < numRows; i++) {
                    obj = {};
                    for (j = 0; j < numColumns; j++)
                        obj[fields[j]] = columns[j][i];
                    extractedData.data.push(obj);
                }
            }

            return extractedData;
        },

        /*
         * Depending on how the data was fetched, fields can either be a list of string field names,
         * or a list of dictionaries that include the name as well as other metadata.  This method
         * will normalize to a list of string field names.
         */

        _getNormalizedFieldNames: function(model) {
            return _(model.get("fields")).map(function(field) {
                return _.isString(field) ? field : field.name;
            });
        },

        _filterFields: function(fields) {
            if (!fields)
                return null;

            var filteredFields = [];
            var field;
            for (var i = 0, l = fields.length; i < l; i++) {
                field = fields[i];
                if (field && (field.charAt(0) !== "_"))
                    filteredFields.push(field);
            }
            return filteredFields;
        },

        _setMapProperty: function(propertyName, propertyValue) {
            propertyValue = (propertyValue != null) ? String(propertyValue) : null;
            if (this._propertyValues[propertyName] == propertyValue)
                return;

            if (propertyValue != null)
                this._propertyValues[propertyName] = propertyValue;
            else
                delete this._propertyValues[propertyName];

            switch (propertyName) {
                // global properties
                case "fieldColors":
                    var fieldColors = _.extend({ NULL: this._choroplethNullColor }, this._colorObjectParser.stringToValue(propertyValue));
                    this._fieldColorPalette.set("fieldColors", fieldColors);
                    break;
                case "seriesColors":
                    this._seriesColorPalette.set("colors", this._colorArrayParser.stringToValue(propertyValue));
                    break;

                // data properties
                case "data.maxClusters":
                    var maxClusters = this._numberParser.stringToValue(propertyValue);
                    this._maxClusters = (maxClusters < Infinity) ? Math.max(Math.floor(maxClusters), 64) : 100;
                    this._updateDataParams();
                    break;

                // map properties
                case "map.center":
                    var center = this._latLonParser.stringToValue(propertyValue);
                    if (center)
                        this._map.set("center", center);
                    break;
                case "map.zoom":
                    var zoom = this._numberParser.stringToValue(propertyValue);
                    if (!isNaN(zoom))
                        this._map.set("zoom", zoom);
                    break;
                case "map.fitBounds":
                    var fitBounds = this._latLonBoundsParser.stringToValue(propertyValue);
                    if (fitBounds)
                        this._map.fitBounds(fitBounds);
                    break;
                case "map.scrollZoom":
                    var scrollWheelZoom = this._booleanParser.stringToValue(propertyValue);
                    if (scrollWheelZoom) {
                        this._map.leafletMap.scrollWheelZoom.enable();
                    } else {
                        this._map.leafletMap.scrollWheelZoom.disable();
                    }
                    break;
                case "map.panning":
                    var panning = this._booleanParser.stringToValue(propertyValue);
                    if (panning) {
                        this._map.leafletMap.dragging.enable();
                    } else {
                        this._map.leafletMap.dragging.disable();
                    }
                    break;
                case "drilldown":
                    this._drilldown = this._stringParser.stringToValue(propertyValue);
                    break;

                // tileLayer properties
                case "showTiles":
                    this._map.set("showTiles", this._booleanParser.stringToValue(propertyValue));
                    break;
                case "tileLayer.tileOpacity":
                    this._map.set("tileOpacity", this._numberParser.stringToValue(propertyValue));
                    break;
                case "tileLayer.url":
                    this._map.set("tileURL", this._resolveURL(propertyValue));
                    break;
                case "tileLayer.subdomains":
                    this._map.set("tileSubdomains", this._stringArrayParser.stringToValue(propertyValue));
                    break;
                case "tileLayer.minZoom":
                    this._map.set("tileMinZoom", this._numberParser.stringToValue(propertyValue));
                    break;
                case "tileLayer.maxZoom":
                    this._map.set("tileMaxZoom", this._numberParser.stringToValue(propertyValue));
                    break;
                case "tileLayer.invertY":
                    this._map.set("tileInvertY", this._booleanParser.stringToValue(propertyValue));
                    break;
                case "tileLayer.attribution":
                    this._map.set("tileAttribution", this._stringParser.stringToValue(propertyValue));
                    break;
                // markerLayer properties
                case "markerLayer.markerOpacity":
                    this._markerLayer.set("markerOpacity", this._numberParser.stringToValue(propertyValue));
                    break;
                case "markerLayer.markerMinSize":
                    this._markerLayer.set("markerMinSize", this._numberParser.stringToValue(propertyValue));
                    break;
                case "markerLayer.markerMaxSize":
                    this._markerLayer.set("markerMaxSize", this._numberParser.stringToValue(propertyValue));
                    break;

                // choroplethLayer properties
                case "choroplethLayer.colorMode":
                    var computedColorMode = this._getComputedColorMode();
                    if (computedColorMode === 'sequential' || computedColorMode === 'divergent') {
                        this._updateChoroplethColorPalette();
                    }
                    this._updateChoroplethToMatchColorMode();
                    break;
                case "choroplethLayer.maximumColor":
                    this._choroplethMaximumColor = this._colorParser.stringToValue(propertyValue);
                    this._updateChoroplethColorPalette();
                    break;
                case "choroplethLayer.minimumColor":
                    this._choroplethMinimumColor = this._colorParser.stringToValue(propertyValue);
                    this._updateChoroplethColorPalette();
                    break;
                case "choroplethLayer.colorBins":
                    var numBins = this._numberParser.stringToValue(propertyValue);
                    this._choroplethLayer.set("bins", numBins);
                    this._numericLegend.set("bins", numBins);
                    break;
                case "choroplethLayer.neutralPoint":
                    var neutralPoint = propertyValue != null ? this._numberParser.stringToValue(propertyValue) : NaN;
                    this._choroplethLayer.set("neutralPoint", neutralPoint);
                    this._numericLegend.set("neutralPoint", neutralPoint);
                    break;
                case "choroplethLayer.shapeOpacity":
                    this._choroplethLayer.set("shapeOpacity", this._numberParser.stringToValue(propertyValue));
                    break;
                case "choroplethLayer.showBorder":
                    var show = this._booleanParser.stringToValue(propertyValue);
                    this._choroplethLayer.set("borderWidth", show ? 1 : 0);
                    break;

                // legend properties
                case "legend.placement":
                    var isVisible = propertyValue !== 'none';
                    this._numericLegend.set('isVisible', isVisible);
                    this._categoricalVisualLegend.set('isVisible', isVisible);
                    break;

                // layerType property
                case "type":
                    if (propertyValue === "marker") {
                        this._map.removeLayer(this._choroplethLayer);
                        this._choroplethLayer.off("rendered", this._onDataLayerRendered, this);
                        this._map.addLayer(this._markerLayer);
                        this._markerLayer.on("rendered", this._onDataLayerRendered, this);
                        this._map.removeControl(this._numericLegend);
                        this._map.removeControl(this._categoricalVisualLegend);
                        this._updateDataParams();
                    } else if (propertyValue === "choropleth") {
                        this._map.removeLayer(this._markerLayer);
                        this._markerLayer.off("rendered", this._onDataLayerRendered, this);
                        this._map.addLayer(this._choroplethLayer);
                        this._choroplethLayer.on("rendered", this._onDataLayerRendered, this);
                        this._updateChoroplethToMatchColorMode();
                        this._updateDataParams();
                    } else {
                        console.log("cannot initialize customize layer because of incorrect _layerType!");
                    }
                    break;
            }
        },

        _updateChoroplethColorPalette: function() {
            if (this._getComputedColorMode() === 'divergent') {
                this._choroplethColorPalette.set(
                    'colors',
                    [this._choroplethMinimumColor, this._choroplethNeutralColor, this._choroplethMaximumColor]
                );
            } else {
                this._choroplethColorPalette.set('colors', [this._choroplethNeutralColor, this._choroplethMaximumColor]);
            }
        },

        _updateChoroplethToMatchColorMode: function() {
            var colorMode = this._getComputedColorMode();
            if (colorMode === 'categorical') {
                this._map.isCategorical = true;
                this._choroplethLayer.set("axis", null);
                this._choroplethLayer.set("legend", this._externalLegend);
                this._choroplethLayer.set("colorPalette", this._fieldColorPalette);
                this._map.removeControl(this._numericLegend);
                this._map.addControl(this._categoricalVisualLegend);
            } else {
                this._map.isCategorical = false;
                this._choroplethLayer.set("legend", null);
                this._choroplethLayer.set("axis", this._numericAxis);
                this._choroplethLayer.set("colorPalette", this._choroplethColorPalette);
                this._map.removeControl(this._categoricalVisualLegend);
                this._map.addControl(this._numericLegend);
            }
        },

        _getComputedColorMode: function() {
            return (this._choroplethColorMode === 'auto') ?
                this._choroplethAutoDetectedColorMode : this._choroplethColorMode;
        },

        _resolveURL: function(propertyValue) {
            var propertyValue2 = propertyValue ? SplunkUtil.trim(propertyValue) : propertyValue;
            if (propertyValue2 && (propertyValue2.charAt(0) === "/")) {
                var hadTrailingSlash = (propertyValue2.charAt(propertyValue2.length - 1) === "/");
                propertyValue2 = SplunkUtil.make_url(propertyValue2);
                var hasTrailingSlash = (propertyValue2.charAt(propertyValue2.length - 1) === "/");
                if (hasTrailingSlash != hadTrailingSlash)
                    propertyValue2 = hadTrailingSlash ? propertyValue2 + "/" : propertyValue2.substring(0, propertyValue2.length - 1);
                propertyValue = propertyValue2;
            }
            return propertyValue;
        },

        _formatNumber: function(num) {
            var pos = Math.abs(num);
            if ((pos > 0) && ((pos < 1e-3) || (pos >= 1e9)))
                return SplunkI18N.format_scientific(num, "##0E0");
            return SplunkI18N.format_decimal(num);
        },

        _formatDegrees: function(degrees, orientation) {
            var deg = Math.abs(degrees);
            var degInt = Math.floor(deg);
            var degStr = ("" + degInt);
            var min = (deg - degInt) * 60;
            var minInt = Math.floor(min);
            var minStr = (minInt < 10) ? ("0" + minInt) : ("" + minInt);
            var sec = (min - minInt) * 60;
            var secInt = Math.floor(sec);
            var secStr = (secInt < 10) ? ("0" + secInt) : ("" + secInt);

            var dirStr = "";
            if (degrees > 0)
                dirStr = (orientation === "ns") ? _("N").t() : _("E").t();
            else if (degrees < 0)
                dirStr = (orientation === "ns") ? _("S").t() : _("W").t();

            if (secInt > 0)
                return sprintf("%(degrees)s\u00B0%(minutes)s'%(seconds)s\"%(direction)s", { degrees: degStr, minutes: minStr, seconds: secStr, direction: dirStr });
            if (minInt > 0)
                return sprintf("%(degrees)s\u00B0%(minutes)s'%(direction)s", { degrees: degStr, minutes: minStr, direction: dirStr });
            return sprintf("%(degrees)s\u00B0%(direction)s", { degrees: degStr, direction: dirStr });
        },

        onConfigChange: function(changedAttributes) {
            var updateNeeded = _(changedAttributes).chain().keys()
                .any(function(key) {
                    return key.indexOf('display.visualizations.mapping.') === 0;
                })
                .value();

            if (!updateNeeded) {
                return;
            }

            if (changedAttributes.hasOwnProperty('display.visualizations.mapping.type')) {
                this.invalidate('formatDataPass');
            }
            this.invalidate('updateViewPass');
        },

        // The wrapper role of this view means that the formatData routine can cause a re-render
        // of the underlying mapping library without having to run the updateView routine,
        // and vice versa.  By returning false here, the two routines become completely
        // independent operations, instead of updateView automatically running whenever
        // formatData runs.
        _shouldUpdateViewOnDataChange: function() {
            return false;
        },

        _map_boundsChanged: function(e) {
            if (this._isPrinting)
                return;
            this._updateDataBounds();
            this._updateDataParams();
            this.model.config.set({
                currentMapZoom: this.getZoom(),
                currentMapCenter: this.getCenter().clone()
            }, {'transient': true});
            this.trigger("boundsChanged", {});
        },

        _map_mapClicked: function(e) {
            if (this._isPrinting || this._drilldown === "none")
                return;

            this.trigger(
                "drilldown",
                { data: e.data, fields: e.fields, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, type: "geoviz" }
            );
        },

        onPrintStart: function(e) {
            if (this._isPrinting)
                return;

            this._isPrinting = true;

            this._prePrintCenter = this._map.get("center");
            this._prePrintZoom = this._map.get("zoom");

            this._map.updateSize();
            this._map.validate();
        },

        onPrintEnd: function(e) {
            if (!this._isPrinting)
                return;

            this._map.set("center", this._prePrintCenter);
            this._map.set("zoom", this._prePrintZoom);

            this._prePrintCenter = null;
            this._prePrintZoom = 0;
            this._isPrinting = false;
        },

        _onDataLayerRendered: function() {
            this._map.off('tilesLoaded.change', this._handleTileLoadOnce, this);
            if (this._map.get('tilesLoaded')) {
                this._onViewUpdated();
            } else {
                this._map.on('tilesLoaded.change', this._handleTileLoadOnce, this);
            }
        },

        _handleTileLoadOnce: function () {
            this._onViewUpdated();
            this._map.off('tilesLoaded.change', this._handleTileLoadOnce, this);
        },

        _updateDataParams: function() {
            this._layerType = this.model.config.get('display.visualizations.mapping.type');
            if (!this._layerType) {
                return;
            }
            this.model.searchDataParams.set(_.extend({}, _DEFAULT_DATA_PARAMS, {
                search: this.getPostProcessSearch(),
                count: this.getMaxClusters()
            }));
        }

    }, {
        DEFAULT_PROPERTY_VALUES: _DEFAULT_PROPERTY_VALUES
    });

});
