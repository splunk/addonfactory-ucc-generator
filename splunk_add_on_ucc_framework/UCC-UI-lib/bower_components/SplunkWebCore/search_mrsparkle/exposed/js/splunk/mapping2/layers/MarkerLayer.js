define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Point = require("jg/geom/Point");
    var Rectangle = require("jg/geom/Rectangle");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var Map = require("jg/utils/Map");
    var LatLon = require("splunk/mapping2/LatLon");
    var LatLonBounds = require("splunk/mapping2/LatLonBounds");
    var LayerBase = require("splunk/mapping2/layers/LayerBase");
    var MarkerBase = require("splunk/mapping2/layers/MarkerBase");
    var Viewport = require("splunk/vectors/Viewport");

    return Class(module.id, LayerBase, function(MarkerLayer, base) {

        // Public Properties

        this.wrapX = new ObservableProperty("wrapX", Boolean, true)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.wrapY = new ObservableProperty("wrapY", Boolean, false)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        // Private Properties

        this._markerMap = null;
        this._markerViewport = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping2-layers-MarkerLayer");

            this._marker_latLon_change = FunctionUtil.bind(this._marker_latLon_change, this);

            this._markerMap = new Map();
            this._markerViewport = new Viewport()
                .appendTo(this.element);
        };

        // Public Methods

        this.addMarker = function(marker) {
            if (marker == null) {
                throw new Error("Parameter marker must be non-null.");
            }
            if (!(marker instanceof MarkerBase)) {
                throw new Error("Parameter marker must be of type " + Class.getName(MarkerBase) + ".");
            }

            var markerLayer = marker.get("markerLayer");
            if (markerLayer && (markerLayer !== this)) {
                markerLayer.removeMarker(marker);
            }

            this._markerMap.set(marker, marker);
            marker.element.appendTo(this._markerViewport);
            if (markerLayer !== this) {
                marker.onAddedToLayer(this);
                marker.on("latLon.change", this._marker_latLon_change);

                this.invalidate("renderPass");
            }
        };

        this.removeMarker = function(marker) {
            if (marker == null) {
                throw new Error("Parameter marker must be non-null.");
            }
            if (!(marker instanceof MarkerBase)) {
                throw new Error("Parameter marker must be of type " + Class.getName(MarkerBase) + ".");
            }

            if (!this._markerMap.has(marker)) {
                return;
            }

            marker.off("latLon.change", this._marker_latLon_change);
            marker.onRemovedFromLayer(this);
            marker.element.remove();
            this._markerMap.del(marker);
        };

        this.getLatLonBounds = function(center) {
            if ((center != null) && !(center instanceof LatLon)) {
                throw new Error("Parameter center must be of type " + Class.getName(LatLon) + ".");
            }

            this.validate();

            var bounds = new LatLonBounds(Infinity, Infinity, -Infinity, -Infinity);

            var markerList = this._markerMap.values();
            var marker;
            var latLon;
            for (var i = 0, l = markerList.length; i < l; i++) {
                marker = markerList[i];
                latLon = marker.getInternal("latLon");
                bounds.expand(latLon.normalize(center));
            }

            return bounds.isFinite() ? bounds : null;
        };

        this.toSVGString = function() {
            this.validate();

            return this._markerViewport.toSVGString();
        };

        // Protected Methods

        this.renderOverride = function(map) {
            var width = map.get("width");
            var height = map.get("height");
            var center = map.get("center");
            var centerRelative = map.latLonToRelative(center);

            var wrapX = this.getInternal("wrapX");
            var wrapY = this.getInternal("wrapY");

            // get map bounds in pixels relative to viewport
            var mapTL = map.relativeToViewport(new Point(0, 0));
            var mapBR = map.relativeToViewport(new Point(1, 1));
            var mapLeft = mapTL.x;
            var mapTop = mapTL.y;
            var mapWidth = mapBR.x - mapLeft;
            var mapHeight = mapBR.y - mapTop;

            var markerList = this._markerMap.values();
            var marker;
            var markerPosition;
            for (var i = 0, l = markerList.length; i < l; i++) {
                marker = markerList[i];
                markerPosition = map.latLonToRelative(marker.getInternal("latLon"));

                if (wrapX) {
                    markerPosition.x -= centerRelative.x;
                    markerPosition.x %= 1;
                    if (markerPosition.x > 0.5) {
                        markerPosition.x -= 1;
                    } else if (markerPosition.x < -0.5) {
                        markerPosition.x += 1;
                    }
                    markerPosition.x += centerRelative.x;
                }

                if (wrapY) {
                    markerPosition.y -= centerRelative.y;
                    markerPosition.y %= 1;
                    if (markerPosition.y > 0.5) {
                        markerPosition.y -= 1;
                    } else if (markerPosition.y < -0.5) {
                        markerPosition.y += 1;
                    }
                    markerPosition.y += centerRelative.y;
                }

                markerPosition.x = Math.round(mapLeft + mapWidth * markerPosition.x);
                markerPosition.y = Math.round(mapTop + mapHeight * markerPosition.y);

                marker.render(markerPosition);
            }

            var viewport = this._markerViewport;
            viewport.width(width);
            viewport.height(height);
            viewport.viewBox(new Rectangle(0, 0, width, height));
        };

        // Private Methods

        this._marker_latLon_change = function(e) {
            this.invalidate("renderPass");
        };

    });

});
