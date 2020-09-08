/*
 * See the "Changes to PDF Rendering Code" section of https://confluence.splunk.com/display/PROD/Choropleth+UI+ERD
 * for discussion of the purpose of this file.
 */
define(function(require, exports, module) {

    var Class = require('jg/Class');
    var Point = require('jg/geom/Point');
    var Rectangle = require('jg/geom/Rectangle');
    var Property = require('jg/properties/Property');
    var FunctionUtil = require('jg/utils/FunctionUtil');
    var LatLon = require('splunk/mapping/LatLon');
    var DummyLeafletVectorLayerBase = require('splunk/mapping2/layers/DummyLeafletVectorLayerBase');
    var LayerBase = require('splunk/mapping2/layers/LayerBase');

    return Class(module.id, LayerBase, function(WrappedLeafletVectorLayer, base) {

        // Public Properties

        this.leafletLayer = new Property('leafletLayer', DummyLeafletVectorLayerBase, null);

        // Private Properties

        this._wrappedMap = null;

        // Constructor

        this.constructor = function(leafletLayer) {
            base.constructor.call(this);
            this.set('leafletLayer', leafletLayer);
        };

        // Public Methods

        this.getLatLonBounds = function(center) {
            var leafletLayer = this.getInternal('leafletLayer');
            if (!leafletLayer) {
                throw new Error('getLatLonBounds was called before the leafletLayer was set');
            }
            return leafletLayer.getLatLonBounds(center);
        };

        this.toSVGString = function() {
            var leafletLayer = this.getInternal('leafletLayer');
            if (!leafletLayer) {
                throw new Error('leafletLayer must be set before toSVGString is called');
            }
            var map = this.getInternal('map');
            if (!map) {
                throw new Error('toSVGString cannot be called before adding to the map');
            }
            this.validate();
            var width = map.get('width');
            var height = map.get('height');
            var viewport = leafletLayer.vectorContainer;
            viewport.width(width);
            viewport.height(height);
            viewport.viewBox(new Rectangle(0, 0, width, height));
            leafletLayer.invalidate('renderPass');
            this.validate();
            return viewport.toSVGString();
        };

        // Protected Methods

        this.onAddedToMap = function(map) {
            var leafletLayer = this.getInternal('leafletLayer');
            if (!leafletLayer) {
                throw new Error('leafletLayer must be set before adding to the map');
            }
            base.onAddedToMap.call(this, map);
            this._wrappedMap = new WrappedMap(map);
            leafletLayer.onAddedToMap(this._wrappedMap);
        };

        this.onRemovedFromMap = function(map) {
            var leafletLayer = this.getInternal('leafletLayer');
            if (leafletLayer) {
                leafletLayer.onRemovedFromMap(this._wrappedMap);
            }
            this._wrappedMap = null;
            base.onRemovedFromMap.call(this, map);
        };

        // Private Nested Classes

        var WrappedMap = Class(Object, function(WrappedMap, base) {

            // Public Properties

            this.leafletMap = null;

            // Private Properties

            this._map = null;

            // Constructor

            this.constructor = function(map) {
                if (!map) {
                    throw new Error('map is a required constructor argument');
                }
                base.constructor.call(this);
                this.leafletMap = new DummyLeafletMap(map);
                this._map = map;
            };

            // Public Methods

            this.on = function() {};
            this.off = function() {};

        });

        var DummyLeafletMap = Class(Object, function(DummyLeafletMap, base) {

            // Private Properties

            this._map = null;
            this._vectorLayerBounds = null;

            // Constructor

            this.constructor = function(map) {
                if (!map) {
                    throw new Error('map is a required constructor argument');
                }
                base.constructor.call(this);
                this._map = map;
                this._updateVectorLayerBounds = FunctionUtil.bind(this._updateVectorLayerBounds, this);
                this._vectorLayerBounds = {};
                map.on('boundsChanged', this._updateVectorLayerBounds);
                this._updateVectorLayerBounds();
            };

            // Public Methods

            this.on = function() {};
            this.off = function() {};

            this.getCenter = function() {
                return this._map.get('center').toLeaflet();
            };

            this.latLngToLayerPoint = function(latLng) {
                return this._map.latLonToViewport(LatLon.fromLeaflet(latLng));
            };

            // Private Methods

            this._updateVectorLayerBounds = function() {
                var mapTL = this._map.relativeToViewport(new Point(0, 0));
                var mapBR = this._map.relativeToViewport(new Point(1, 1));
                this._vectorLayerBounds.minX = mapTL.x;
                this._vectorLayerBounds.minY = mapTL.y;
                this._vectorLayerBounds.maxX = mapBR.x;
                this._vectorLayerBounds.maxY = mapBR.y;
            };

        });

    });

});
