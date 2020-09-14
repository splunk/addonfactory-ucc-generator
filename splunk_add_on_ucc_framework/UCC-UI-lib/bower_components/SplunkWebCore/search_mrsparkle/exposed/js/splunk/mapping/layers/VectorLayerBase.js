define(function(require, exports, module) {

    var Leaflet = require("leaflet");
    var Class = require("jg/Class");
    var Rectangle = require("jg/geom/Rectangle");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var LayerBase = require("splunk/mapping/layers/LayerBase");
    var Group = require("splunk/vectors/Group");
    var Viewport = require("splunk/vectors/Viewport");

    return Class(module.id, LayerBase, function(VectorLayerBase, base) {

        // Public Properties

        this.vectorContainer = null;
        this.vectorBounds = null;

        // Private Properties

        this._isZooming = false;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this._leafletMap_move = FunctionUtil.bind(this._leafletMap_move, this);
            this._leafletMap_zoomstart = FunctionUtil.bind(this._leafletMap_zoomstart, this);
            this._leafletMap_zoomend = FunctionUtil.bind(this._leafletMap_zoomend, this);

            this.vectorContainer = this.leafletLayer.vectorContainer;
            this.vectorBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        };

        // Protected Methods

        this.createLeafletLayer = function() {
            return new LeafletVectorLayer();
        };

        this.renderOverride = function(map) {
            if (!this._isZooming) {
                this.vectorContainer.display(null);
            }
        };

        this.onAddedToMap = function(map) {
            base.onAddedToMap.call(this, map);

            var leafletMap = map.leafletMap;
            if (this.vectorContainer.hasSVG) {
                leafletMap.on("move", this._leafletMap_move);
            } else {
                leafletMap.on("moveend", this._leafletMap_move);
            }
            leafletMap.on("viewreset", this._leafletMap_move);
            leafletMap.on("zoomstart", this._leafletMap_zoomstart);
            leafletMap.on("zoomend", this._leafletMap_zoomend);

            this.vectorBounds = leafletMap._vectorLayerBounds;

            this.vectorContainer.display("none");
        };

        this.onRemovedFromMap = function(map) {
            var leafletMap = map.leafletMap;
            if (this.vectorContainer.hasSVG) {
                leafletMap.off("move", this._leafletMap_move);
            } else {
                leafletMap.off("moveend", this._leafletMap_move);
            }
            leafletMap.off("viewreset", this._leafletMap_move);
            leafletMap.off("zoomstart", this._leafletMap_zoomstart);
            leafletMap.off("zoomend", this._leafletMap_zoomend);

            this.vectorBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

            base.onRemovedFromMap.call(this, map);
        };

        // Private Methods

        this._leafletMap_move = function(e) {
            this.invalidate("renderPass");
        };

        this._leafletMap_zoomstart = function(e) {
            this._isZooming = true;

            this.vectorContainer.display("none");
        };

        this._leafletMap_zoomend = function(e) {
            this._isZooming = false;

            this.invalidate("renderPass");
        };

        // Private Nested Classes

        var LeafletVectorLayer = Leaflet.Class.extend({

            includes: [Leaflet.Mixin.Events],

            options: {
                clickable: true
            },

            vectorContainer: null,

            initialize: function (options) {
                Leaflet.Util.setOptions(this, options);

                this.vectorContainer = new Group();
            },

            onAdd: function (map) {
                this._map = map;

                map._initVectorLayerViewport();

                this.vectorContainer.appendTo(map._vectorLayerViewport);
            },

            onRemove: function (map) {
                this._map = null;

                this.vectorContainer.remove();
            }

        });

        Leaflet.Map.include({

            _initVectorLayerViewport: function () {
                if (this._vectorLayerRoot) {
                    return;
                }

                var root = this._vectorLayerRoot = document.createElement("div");
                root.style.position = "absolute";
                this._panes.overlayPane.appendChild(root);

                var viewport = this._vectorLayerViewport = new Viewport();
                viewport.appendTo(root);

                this._vectorLayerBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

                if (viewport.hasSVG) {
                    this.on("move", this._updateVectorLayerBounds);
                } else {
                    this.on("moveend", this._updateVectorLayerBounds);
                }
                this._updateVectorLayerBounds();
            },

            _updateVectorLayerBounds: function () {
                var root = this._vectorLayerRoot,
                    viewport = this._vectorLayerViewport,
                    bounds = this._vectorLayerBounds,
                    padding = viewport.hasSVG ? 0 : 0.5,
                    size = this.getSize(),
                    panePos = Leaflet.DomUtil.getPosition(this._mapPane),
                    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(padding)),
                    max = min.add(size.multiplyBy(1 + padding * 2)),
                    width = max.x - min.x,
                    height = max.y - min.y;

                bounds.minX = min.x;
                bounds.minY = min.y;
                bounds.maxX = max.x;
                bounds.maxY = max.y;

                Leaflet.DomUtil.setPosition(root, min);
                viewport.width(width);
                viewport.height(height);
                viewport.viewBox(new Rectangle(min.x, min.y, width, height));
            }

        });

    });

});
