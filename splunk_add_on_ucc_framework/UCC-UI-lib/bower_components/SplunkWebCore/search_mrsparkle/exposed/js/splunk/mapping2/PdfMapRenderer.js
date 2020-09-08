/*
 * See the "Changes to PDF Rendering Code" section of https://confluence.splunk.com/display/PROD/Choropleth+UI+ERD
 * for discussion of the purpose of this file.
 */
define(function(require, exports, module) {

    var _ = require('underscore');
    var Class = require('jg/Class');
    var Color = require('jg/graphics/Color');
    var MPropertyTarget = require('jg/properties/MPropertyTarget');
    var Property = require('jg/properties/Property');
    var Legend = require('splunk/charting/Legend');
    var NumericAxis = require('splunk/mapping/axis/NumericAxis');
    var CategoricalVisualLegend = require('splunk/mapping/controls/CategoricalVisualLegend');
    var NumericalLegend = require('splunk/mapping/controls/NumericalLegend');
    var ChoroplethLayer = require('splunk/mapping/layers/ChoroplethLayer');
    var Map = require('splunk/mapping2/Map');
    var SVGAttributionControl = require('splunk/mapping2/controls/SVGAttributionControl');
    var WrappedLeafletControl = require('splunk/mapping2/controls/WrappedLeafletControl');
    var PieMarkerLayer = require('splunk/mapping2/layers/PieMarkerLayer');
    var SVGTileLayer = require('splunk/mapping2/layers/SVGTileLayer');
    var WrappedLeafletVectorLayer = require('splunk/mapping2/layers/WrappedLeafletVectorLayer');
    var LatLonBoundsParser = require('splunk/mapping2/parsers/LatLonBoundsParser');
    var LatLonParser = require('splunk/mapping2/parsers/LatLonParser');
    var FieldColorPalette = require('splunk/palettes/FieldColorPalette');
    var ListColorPalette = require('splunk/palettes/ListColorPalette');
    var ArrayParser = require('splunk/parsers/ArrayParser');
    var BooleanParser = require('splunk/parsers/BooleanParser');
    var ColorParser = require('splunk/parsers/ColorParser');
    var NumberParser = require('splunk/parsers/NumberParser');
    var ObjectParser = require('splunk/parsers/ObjectParser');
    var StringParser = require('splunk/parsers/StringParser');
    var VectorUtils = require('splunk/vectors/VectorUtils');
    var GeneralUtils = require('util/general_utils');

    return Class(module.id, Object, function(PdfMapRenderer, base) {

        Class.mixin(this, MPropertyTarget);

        // Public Properties

        this.splunkdBasepath = new Property('splunkdBasepath', String, '');
        this.staticBasepath = new Property('staticBasepath', String, '');
        this.width = new Property('width', Number, 0);
        this.height = new Property('height', Number, 0);
        this.props = new Property('props', Object, null);
        this.mapData = new Property('mapData', Object, null);

        // Public Methods

        this.getSVG = function() {
            var splunkdBasepath = this.getInternal('splunkdBasepath');
            var staticBasepath = this.getInternal('staticBasepath');
            var width = this.getInternal('width');
            var height = this.getInternal('height');
            var props = this.getInternal('props');
            var mapData = this.getInternal('mapData');

            if (!splunkdBasepath) {
                throw new Error('splunkdBasepath must be initialized before calling getSVG');
            }
            if (!staticBasepath) {
                throw new Error('staticBasepath must be initialized before calling getSVG');
            }
            if (!width) {
                throw new Error('width must be initialized before calling getSVG');
            }
            if (!height) {
                throw new Error('height must be initialized before calling getSVG');
            }
            if (!props) {
                throw new Error('props must be initialized before calling getSVG');
            }
            if (!mapData) {
                throw new Error('width must be initialized before calling getSVG');
            }
            var booleanParser = BooleanParser.getInstance();
            var numberParser = NumberParser.getInstance();
            var stringParser = StringParser.getInstance();
            var colorParser = ColorParser.getInstance();
            var numberArrayParser = ArrayParser.getInstance(numberParser);
            var stringArrayParser = ArrayParser.getInstance(stringParser);
            var colorArrayParser = ArrayParser.getInstance(colorParser);
            var numberObjectParser = ObjectParser.getInstance(numberParser);
            var colorObjectParser = ObjectParser.getInstance(colorParser);
            var latLonParser = LatLonParser.getInstance();
            var latLonBoundsParser = LatLonBoundsParser.getInstance();

            var defaultSeriesColors = [
                Color.fromNumber(0x1e93c6),
                Color.fromNumber(0xf2b827),
                Color.fromNumber(0xd6563c),
                Color.fromNumber(0x6a5c9e),
                Color.fromNumber(0x31a35f),
                Color.fromNumber(0xed8440),
                Color.fromNumber(0x3863a0),
                Color.fromNumber(0xa2cc3e),
                Color.fromNumber(0xcc5068),
                Color.fromNumber(0x73427f),
                Color.fromNumber(0x11a88b),
                Color.fromNumber(0xea9600),
                Color.fromNumber(0x0e776d),
                Color.fromNumber(0xffb380),
                Color.fromNumber(0xaa3977),
                Color.fromNumber(0x91af27),
                Color.fromNumber(0x4453aa),
                Color.fromNumber(0x99712b),
                Color.fromNumber(0x553577),
                Color.fromNumber(0x97bc71),
                Color.fromNumber(0xd35c2d),
                Color.fromNumber(0x314d5b),
                Color.fromNumber(0x99962b),
                Color.fromNumber(0x844539),
                Color.fromNumber(0x00b290),
                Color.fromNumber(0xe2c188),
                Color.fromNumber(0xa34a41),
                Color.fromNumber(0x44416d),
                Color.fromNumber(0xe29847),
                Color.fromNumber(0x8c8910),
                Color.fromNumber(0x0b416d),
                Color.fromNumber(0x774772),
                Color.fromNumber(0x3d9988),
                Color.fromNumber(0xbdbd5e),
                Color.fromNumber(0x5f7396),
                Color.fromNumber(0x844539)
            ];

            var seriesColorPalette = new ListColorPalette(defaultSeriesColors);
            var fieldColorPalette = new FieldColorPalette(null, seriesColorPalette);

            var markerLayer = null;
            // Marker map is the default type, create a marker layer if type is not specified
            // or if it's set to marker.
            if (!_.isString(props['type']) || props['type'] === 'marker') {
                markerLayer = new PieMarkerLayer();
                markerLayer.set('markerColorPalette', fieldColorPalette);
                markerLayer.set('data', mapData.data);
                markerLayer.set('fields', mapData.fields);
            }
            var choroplethLayer = null;
            var wrappedChoroplethLayer = null;
            var choroplethPalette = null;
            var numericAxis = null;
            var numericalLegend = null;
            var wrappedNumericalLegend = null;
            var visualCategoricalLegend = null;
            var wrappedVisualCategoricalLegend = null;
            var colorMode = null;
            var legend = null;
            if (props['type'] === 'choropleth' && _(mapData.fields).contains('geom')) {
                colorMode = this._computeColorMode();
                choroplethLayer = new ChoroplethLayer();
                choroplethLayer.set('data', mapData.data);
                choroplethLayer.set('fields', mapData.fields);
                choroplethLayer.set('featureIdFieldName', mapData.fields[0]);
                wrappedChoroplethLayer = new WrappedLeafletVectorLayer(choroplethLayer);

                if (colorMode === 'categorical') {
                    legend = new Legend();
                    choroplethLayer.set('legend', legend);
                    choroplethLayer.set('colorPalette', fieldColorPalette);

                    visualCategoricalLegend = new CategoricalVisualLegend();
                    visualCategoricalLegend.set('colorPalette', fieldColorPalette);
                    visualCategoricalLegend.set('legend', legend);
                    visualCategoricalLegend.set('maxHeight', height);
                    visualCategoricalLegend.set('clip', true);
                    wrappedVisualCategoricalLegend = new WrappedLeafletControl(visualCategoricalLegend);
                } else {
                    numericAxis = new NumericAxis();
                    choroplethPalette = new ListColorPalette([Color.fromNumber(0xFFFFFF), Color.fromNumber(0xDB5800)], true);

                    choroplethLayer.set('axis', numericAxis);
                    choroplethLayer.set('colorPalette', choroplethPalette);

                    numericalLegend = new NumericalLegend();
                    numericalLegend.set('axis', numericAxis);
                    numericalLegend.set('colorPalette', choroplethPalette);
                    wrappedNumericalLegend = new WrappedLeafletControl(numericalLegend);
                }
            }

            var tileLayer = null;
            if (!_(props).has('showTiles') || booleanParser.stringToValue(props['showTiles'])) {
                tileLayer = new SVGTileLayer();
                tileLayer.set('url', this._resolveURL('/splunkd/__raw/services/mbtiles/splunk-tiles/{z}/{x}/{y}', staticBasepath, splunkdBasepath));
                tileLayer.set('maxZoom', 7);
            }

            var attributionControl = new SVGAttributionControl();

            var map = new Map();
            map.set('width', width);
            map.set('height', height);
            if (tileLayer) {
                map.addLayer(tileLayer);
            }
            if (markerLayer) {
                map.addLayer(markerLayer);
            }
            if (wrappedChoroplethLayer) {
                map.addLayer(wrappedChoroplethLayer);
            }
            map.addControl(attributionControl);
            if (wrappedNumericalLegend) {
                map.addControl(wrappedNumericalLegend);
            }
            if (wrappedVisualCategoricalLegend) {
                map.addControl(wrappedVisualCategoricalLegend);
            }
            map.fitWorld(true);

            // global properties
            if (_.isString(props['fieldColors'])) {
                fieldColorPalette.set('fieldColors', colorObjectParser.stringToValue(props['fieldColors']));
            }
            if (_.isString(props['seriesColors'])) {
                seriesColorPalette.set('colors', colorArrayParser.stringToValue(props['seriesColors']));
            }

            // map properties
            if (_.isString(props['map.center'])) {
                var center = latLonParser.stringToValue(props['map.center']);
                if (center) {
                    map.set('center', center);
                }
            }
            if (_.isString(props['map.zoom'])) {
                var zoom = numberParser.stringToValue(props['map.zoom']);
                if (!isNaN(zoom)) {
                    map.set('zoom', zoom);
                }
            }
            if (_.isString(props['map.fitBounds'])) {
                var fitBounds = latLonBoundsParser.stringToValue(props['map.fitBounds']);
                if (fitBounds) {
                    map.fitBounds(fitBounds);
                }
            }

            if (tileLayer) {
                // tileLayer properties
                if (_.isString(props['tileLayer.url'])) {
                    tileLayer.set('url', this._resolveURL(props['tileLayer.url'], staticBasepath, splunkdBasepath));
                }
                if (_.isString(props['tileLayer.subdomains'])) {
                    tileLayer.set('subdomains', stringArrayParser.stringToValue(props['tileLayer.subdomains']));
                }
                if (_.isString(props['tileLayer.minZoom'])) {
                    tileLayer.set('minZoom', numberParser.stringToValue(props['tileLayer.minZoom']));
                }
                if (_.isString(props['tileLayer.maxZoom'])) {
                    tileLayer.set('maxZoom', numberParser.stringToValue(props['tileLayer.maxZoom']));
                }
                if (_.isString(props['tileLayer.invertY'])) {
                    tileLayer.set('invertY', booleanParser.stringToValue(props['tileLayer.invertY']));
                }
                if (_.isString(props['tileLayer.attribution'])) {
                    tileLayer.set('attribution', stringParser.stringToValue(props['tileLayer.attribution']));
                }
                if (_.isString(props['tileLayer.tileOpacity'])) {
                    tileLayer.set('tileOpacity', numberParser.stringToValue(props['tileLayer.tileOpacity']));
                }
            }

            if (markerLayer) {
                // markerLayer properties
                if (_.isString(props['markerLayer.markerOpacity'])) {
                    markerLayer.set('markerOpacity', numberParser.stringToValue(props['markerLayer.markerOpacity']));
                }
                if (_.isString(props['markerLayer.markerMinSize'])) {
                    markerLayer.set('markerMinSize', numberParser.stringToValue(props['markerLayer.markerMinSize']));
                }
                if (_.isString(props['markerLayer.markerMaxSize'])) {
                    markerLayer.set('markerMaxSize', numberParser.stringToValue(props['markerLayer.markerMaxSize']));
                }
            }

            if (choroplethLayer) {
                // choroplethLayer properties
                if (colorMode !== 'categorical' && _.isString(props['choroplethLayer.maximumColor'])) {
                    choroplethPalette.set('colors', [Color.fromNumber(0xFFFFFF), colorParser.stringToValue(props['choroplethLayer.maximumColor'])]);
                }
                // this if statement needs to be after the one above because it reads the existing colors from the color palette
                // and pre-pends the minimum color
                if (colorMode === 'divergent') {
                    var existingColors = choroplethPalette.get('colors');
                    var minimumColor = _.isString(props['choroplethLayer.minimumColor']) ? props['choroplethLayer.minimumColor'] : '0x2F25BA';
                    var newColors = [colorParser.stringToValue(minimumColor)].concat(existingColors);
                    choroplethPalette.set('colors', newColors);

                    var neutralPoint = _.isString(props['choroplethLayer.neutralPoint']) ? props['choroplethLayer.neutralPoint'] : '0';
                    choroplethLayer.set('neutralPoint', numberParser.stringToValue(neutralPoint));
                    numericalLegend.set('neutralPoint', numberParser.stringToValue(neutralPoint));
                }
                if (_.isString(props['choroplethLayer.shapeOpacity'])) {
                    choroplethLayer.set('shapeOpacity', numberParser.stringToValue(props['choroplethLayer.shapeOpacity']));
                }
                if (_.isString(props['choroplethLayer.showBorder'])) {
                    choroplethLayer.set('borderWidth', booleanParser.stringToValue(props['choroplethLayer.showBorder']) ? 1 : 0);
                }
                if (colorMode !== 'categorical' && _.isString(props['choroplethLayer.colorBins'])) {
                    var parsedNumBins = numberParser.stringToValue(props['choroplethLayer.colorBins']);
                    choroplethLayer.set('bins', parsedNumBins);
                    numericalLegend.set('bins', parsedNumBins);
                }
            }

            var isLegendVisible = props['legend.placement'] !== 'none';
            if (numericalLegend) {
                numericalLegend.set('isVisible', isLegendVisible);
            }
            if (visualCategoricalLegend) {
                visualCategoricalLegend.set('isVisible', isLegendVisible);
            }

            // fit data
            var dataBounds = null;
            if (_.isString(props['data.bounds'])) {
                dataBounds = latLonBoundsParser.stringToValue(props['data.bounds']);
            }
            if (markerLayer) {
                dataBounds = markerLayer.getLatLonBounds(dataBounds ? dataBounds.getCenter() : null);
            }
            var viewportInside = (props['type'] === 'choropleth');
            if (dataBounds) {
                map.fitBounds(dataBounds, viewportInside);
            }

            var svgLayers = [];
            if (tileLayer) {
                svgLayers.push(tileLayer.toSVGString());
            }
            if (markerLayer) {
                svgLayers.push(markerLayer.toSVGString());
            }
            if (wrappedChoroplethLayer) {
                svgLayers.push(wrappedChoroplethLayer.toSVGString());
            }
            if (wrappedNumericalLegend) {
                svgLayers.push(wrappedNumericalLegend.toSVGString());
            }
            if (wrappedVisualCategoricalLegend) {
                svgLayers.push(wrappedVisualCategoricalLegend.toSVGString());
            }
            svgLayers.push(attributionControl.toSVGString());
            return VectorUtils.concatSVGStrings.apply(null, svgLayers);
        };

        // Private Methods

        this._resolveURL = function(propertyValue, staticBasepath, splunkdBasepath) {
            var propertyValue2 = propertyValue ? propertyValue.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : propertyValue;
            if (propertyValue2) {
                var rStatic = /^\/static\//;
                var rSplunkd = /^\/splunkd\/__raw\//;
                if (rStatic.test(propertyValue2)) {
                    propertyValue = propertyValue2.replace(rStatic, staticBasepath.replace(/\/$/, '') + '/');
                } else if (rSplunkd.test(propertyValue2)) {
                    propertyValue = propertyValue2.replace(rSplunkd, splunkdBasepath.replace(/\/$/, '') + '/');
                }
            }
            return propertyValue;
        };

        this._computeColorMode = function() {
            var props = this.getInternal('props');
            var mapData = this.getInternal('mapData');
            var userSpecifiedMode = _.isString(props['choroplethLayer.colorMode']) ? props['choroplethLayer.colorMode'] : 'auto';
            if (userSpecifiedMode !== 'auto') {
                return userSpecifiedMode;
            }
            if (!mapData.fields) {
                return 'sequential';
            }
            var dataValues = _(mapData.data).pluck(mapData.fields[1]);
            if (dataValues.length === 0) {
                return 'sequential';
            }
            return GeneralUtils.valuesAreNumeric(dataValues) ? 'sequential' : 'categorical';
        };

    });

});
