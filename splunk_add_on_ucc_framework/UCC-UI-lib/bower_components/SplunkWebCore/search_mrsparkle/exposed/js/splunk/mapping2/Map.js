define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var EventData = require("jg/events/EventData");
    var Point = require("jg/geom/Point");
    var Rectangle = require("jg/geom/Rectangle");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var NumberUtil = require("jg/utils/NumberUtil");
    var LatLon = require("splunk/mapping2/LatLon");
    var LatLonBounds = require("splunk/mapping2/LatLonBounds");
    var ControlBase = require("splunk/mapping2/controls/ControlBase");
    var LayerBase = require("splunk/mapping2/layers/LayerBase");
    var TileLayerBase = require("splunk/mapping2/layers/TileLayerBase");
    var Projection = require("splunk/mapping2/projections/Projection");
    var SphericalMercatorProjection = require("splunk/mapping2/projections/SphericalMercatorProjection");
    var VizBase = require("splunk/viz/VizBase");

    return Class(module.id, VizBase, function(Map, base) {

        // Public Events

        this.boundsChanged = new ChainedEvent("boundsChanged", this.change);
        this.layersChanged = new ChainedEvent("layersChanged", this.change);
        this.controlsChanged = new ChainedEvent("controlsChanged", this.change);

        // Public Properties

        this.projection = new ObservableProperty("projection", Projection, SphericalMercatorProjection.getInstance())
            .writeFilter(function(value) {
                return value ? value : SphericalMercatorProjection.getInstance();
            })
            .onChange(function(e) {
                if (this._updatePropertiesCache()) {
                    this.notifyBoundsChanged();
                }
            });

        this.center = new ObservableProperty("center", LatLon, new LatLon())
            .readFilter(function(value) {
                return value.clone();
            })
            .writeFilter(function(value) {
                return (value && value.isFinite()) ? value.clone() : new LatLon();
            })
            .changeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            })
            .onChange(function(e) {
                if (this._updatePropertiesCache()) {
                    this.notifyBoundsChanged();
                }
            });

        this.zoom = new ObservableProperty("zoom", Number, 0)
            .writeFilter(function(value) {
                value = ((value >= 0) && (value < Infinity)) ? value : 0;
                return NumberUtil.maxMin(value, this._cachedMaxZoom, this._cachedMinZoom);
            })
            .onChange(function(e) {
                if (this._updatePropertiesCache()) {
                    this.notifyBoundsChanged();
                }
            });

        this.minZoom = new ObservableProperty("minZoom", Number, 0)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? Math.floor(value) : 0;
            })
            .onChange(function(e) {
                var zoom = this._updateZoomRangeCache();
                this.set("zoom", zoom);
            });

        this.maxZoom = new ObservableProperty("maxZoom", Number, Infinity)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? Math.floor(value) : Infinity;
            })
            .onChange(function(e) {
                var zoom = this._updateZoomRangeCache();
                this.set("zoom", zoom);
            });

        this.width = new ObservableProperty("width", Number, 0)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? value : 0;
            })
            .onChange(function(e) {
                if (this._updatePropertiesCache()) {
                    this.notifyBoundsChanged();
                }
            });

        this.height = new ObservableProperty("height", Number, 0)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? value : 0;
            })
            .onChange(function(e) {
                if (this._updatePropertiesCache()) {
                    this.notifyBoundsChanged();
                }
            });

        // Private Properties

        this._layers = null;
        this._layersContainer = null;
        this._controls = null;
        this._controlsContainer = null;
        this._updateSizeInterval = 0;

        this._cachedProjection = null;
        this._cachedCenter = null;
        this._cachedZoom = 0;
        this._cachedMinZoom = 0;
        this._cachedMaxZoom = 0;
        this._cachedWidth = 0;
        this._cachedHeight = 0;
        this._cachedTileSize = 0;
        this._cachedMapSize = 0;
        this._cachedViewportOffsetX = 0;
        this._cachedViewportOffsetY = 0;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping2-Map");

            this.setStyle({ position: "relative", width: "100%", height: "100%", overflow: "hidden" });

            this.updateSize = FunctionUtil.bind(this.updateSize, this);
            this._layer_tileSize_change = FunctionUtil.bind(this._layer_tileSize_change, this);
            this._layer_minZoom_change = FunctionUtil.bind(this._layer_minZoom_change, this);
            this._layer_maxZoom_change = FunctionUtil.bind(this._layer_maxZoom_change, this);

            this._layers = [];

            this._layersContainer = document.createElement("div");
            this._layersContainer.className = "splunk-mapping2-Map-layers";
            this._layersContainer.style.position = "absolute";
            this._layersContainer.style.left = "0px";
            this._layersContainer.style.top = "0px";

            this._controls = [];

            this._controlsContainer = document.createElement("div");
            this._controlsContainer.className = "splunk-mapping2-Map-controls";
            this._controlsContainer.style.position = "absolute";
            this._controlsContainer.style.left = "0px";
            this._controlsContainer.style.top = "0px";

            this.element.appendChild(this._layersContainer);
            this.element.appendChild(this._controlsContainer);

            this._updatePropertiesCache();
            this._updateTileSizeCache();
            this._updateZoomRangeCache();
        };

        // Public Methods

        this.addLayer = function(layer) {
            if (layer == null) {
                throw new Error("Parameter layer must be non-null.");
            }
            if (!(layer instanceof LayerBase)) {
                throw new Error("Parameter layer must be of type " + Class.getName(LayerBase) + ".");
            }

            var map = layer.get("map");
            if (map && (map !== this)) {
                map.removeLayer(layer);
            }

            var layers = this._layers;
            var index = ArrayUtil.indexOf(layers, layer);
            if (index >= 0) {
                layers.splice(index, 1);
            }

            layers.push(layer);
            layer.appendTo(this._layersContainer);
            if (map !== this) {
                layer.onAddedToMap(this);
                if (layer instanceof TileLayerBase) {
                    layer.on("tileSize.change", this._layer_tileSize_change);
                    layer.on("minZoom.change", this._layer_minZoom_change);
                    layer.on("maxZoom.change", this._layer_maxZoom_change);
                }
            }

            this.fire("layersChanged", new EventData());

            if (this._updateTileSizeCache()) {
                this.notifyBoundsChanged();
            }
            var zoom = this._updateZoomRangeCache();
            this.set("zoom", zoom);
        };

        this.removeLayer = function(layer) {
            if (layer == null) {
                throw new Error("Parameter layer must be non-null.");
            }
            if (!(layer instanceof LayerBase)) {
                throw new Error("Parameter layer must be of type " + Class.getName(LayerBase) + ".");
            }

            var layers = this._layers;
            var index = ArrayUtil.indexOf(layers, layer);
            if (index < 0) {
                return;
            }

            if (layer instanceof TileLayerBase) {
                layer.off("tileSize.change", this._layer_tileSize_change);
                layer.off("minZoom.change", this._layer_minZoom_change);
                layer.off("maxZoom.change", this._layer_maxZoom_change);
            }
            layer.onRemovedFromMap(this);
            layer.remove();
            layers.splice(index, 1);

            this.fire("layersChanged", new EventData());

            if (this._updateTileSizeCache()) {
                this.notifyBoundsChanged();
            }
            var zoom = this._updateZoomRangeCache();
            this.set("zoom", zoom);
        };

        this.getLayers = function() {
            return this._layers.concat();
        };

        this.addControl = function(control) {
            if (control == null) {
                throw new Error("Parameter control must be non-null.");
            }
            if (!(control instanceof ControlBase)) {
                throw new Error("Parameter control must be of type " + Class.getName(ControlBase) + ".");
            }

            var map = control.get("map");
            if (map && (map !== this)) {
                map.removeControl(control);
            }

            var controls = this._controls;
            var index = ArrayUtil.indexOf(controls, control);
            if (index >= 0) {
                controls.splice(index, 1);
            }

            controls.push(control);
            control.appendTo(this._controlsContainer);
            if (map !== this) {
                control.onAddedToMap(this);
            }

            this.fire("controlsChanged", new EventData());

            if (this._updateTileSizeCache()) {
                this.notifyBoundsChanged();
            }
            var zoom = this._updateZoomRangeCache();
            this.set("zoom", zoom);
        };

        this.removeControl = function(control) {
            if (control == null) {
                throw new Error("Parameter control must be non-null.");
            }
            if (!(control instanceof ControlBase)) {
                throw new Error("Parameter control must be of type " + Class.getName(ControlBase) + ".");
            }

            var controls = this._controls;
            var index = ArrayUtil.indexOf(controls, control);
            if (index < 0) {
                return;
            }

            control.onRemovedFromMap(this);
            control.remove();
            controls.splice(index, 1);

            this.fire("controlsChanged", new EventData());

            if (this._updateTileSizeCache()) {
                this.notifyBoundsChanged();
            }
            var zoom = this._updateZoomRangeCache();
            this.set("zoom", zoom);
        };

        this.getControls = function() {
            return this._controls.concat();
        };

        this.fitWorld = function(viewportInside) {
            if ((viewportInside != null) && !Class.isBoolean(viewportInside)) {
                throw new Error("Parameter viewportInside must be of type Boolean.");
            }

            this.fitBounds(new LatLonBounds(-60, -180, 85, 180), viewportInside);
        };

        this.fitBounds = function(latLonBounds, viewportInside) {
            if (latLonBounds == null) {
                throw new Error("Parameter latLonBounds must be non-null.");
            }
            if (!(latLonBounds instanceof LatLonBounds)) {
                throw new Error("Parameter latLonBounds must be of type " + Class.getName(LatLonBounds) + ".");
            }
            if ((viewportInside != null) && !Class.isBoolean(viewportInside)) {
                throw new Error("Parameter viewportInside must be of type Boolean.");
            }

            latLonBounds = latLonBounds.isFinite() ? latLonBounds : new LatLonBounds(-60, -180, 85, 180);
            viewportInside = (viewportInside === true);

            var projection = this._cachedProjection;
            var minZoom = this._cachedMinZoom;
            var maxZoom = this._cachedMaxZoom;
            var width = this._cachedWidth;
            var height = this._cachedHeight;
            var tileSize = this._cachedTileSize;

            var relativeTL = projection.latLonToRelative(latLonBounds.getNW());
            var relativeBR = projection.latLonToRelative(latLonBounds.getSE());
            var relativeWidth = Math.abs(relativeBR.x - relativeTL.x);
            var relativeHeight = Math.abs(relativeBR.y - relativeTL.y);

            var mapSize1 = (relativeWidth > 0) ? (width / relativeWidth) : Infinity;
            var mapSize2 = (relativeHeight > 0) ? (height / relativeHeight) : Infinity;
            var mapSize = viewportInside ? Math.max(mapSize1, mapSize2) : Math.min(mapSize1, mapSize2);
            var zoom = Infinity;
            if (mapSize < Infinity) {
                var mapScale = Math.max(mapSize / tileSize, 1);
                var mapZoom = Math.log(mapScale) / Math.log(2);
                zoom = viewportInside ? Math.ceil(mapZoom) : Math.floor(mapZoom);
            }

            zoom = NumberUtil.maxMin(zoom, maxZoom, minZoom);
            if (zoom < Infinity) {
                this.set("zoom", zoom);
            }

            var centerRelative = new Point((relativeTL.x + relativeBR.x) / 2, (relativeTL.y + relativeBR.y) / 2);
            var center = projection.relativeToLatLon(centerRelative);
            this.set("center", center);
        };

        this.latLonToRelative = function(latLon) {
            if (latLon == null) {
                throw new Error("Parameter latLon must be non-null.");
            }
            if (!(latLon instanceof LatLon)) {
                throw new Error("Parameter latLon must be of type " + Class.getName(LatLon) + ".");
            }

            return this._cachedProjection.latLonToRelative(latLon);
        };

        this.latLonToAbsolute = function(latLon) {
            if (latLon == null) {
                throw new Error("Parameter latLon must be non-null.");
            }
            if (!(latLon instanceof LatLon)) {
                throw new Error("Parameter latLon must be of type " + Class.getName(LatLon) + ".");
            }

            return this.relativeToAbsolute(this.latLonToRelative(latLon));
        };

        this.latLonToViewport = function(latLon) {
            if (latLon == null) {
                throw new Error("Parameter latLon must be non-null.");
            }
            if (!(latLon instanceof LatLon)) {
                throw new Error("Parameter latLon must be of type " + Class.getName(LatLon) + ".");
            }

            return this.absoluteToViewport(this.relativeToAbsolute(this.latLonToRelative(latLon)));
        };

        this.relativeToLatLon = function(relativePoint) {
            if (relativePoint == null) {
                throw new Error("Parameter relativePoint must be non-null.");
            }
            if (!(relativePoint instanceof Point)) {
                throw new Error("Parameter relativePoint must be of type " + Class.getName(Point) + ".");
            }

            return this._cachedProjection.relativeToLatLon(relativePoint);
        };

        this.relativeToAbsolute = function(relativePoint) {
            if (relativePoint == null) {
                throw new Error("Parameter relativePoint must be non-null.");
            }
            if (!(relativePoint instanceof Point)) {
                throw new Error("Parameter relativePoint must be of type " + Class.getName(Point) + ".");
            }

            return new Point(this._cachedMapSize * relativePoint.x, this._cachedMapSize * relativePoint.y);
        };

        this.relativeToViewport = function(relativePoint) {
            if (relativePoint == null) {
                throw new Error("Parameter relativePoint must be non-null.");
            }
            if (!(relativePoint instanceof Point)) {
                throw new Error("Parameter relativePoint must be of type " + Class.getName(Point) + ".");
            }

            return this.absoluteToViewport(this.relativeToAbsolute(relativePoint));
        };

        this.absoluteToLatLon = function(absolutePoint) {
            if (absolutePoint == null) {
                throw new Error("Parameter absolutePoint must be non-null.");
            }
            if (!(absolutePoint instanceof Point)) {
                throw new Error("Parameter absolutePoint must be of type " + Class.getName(Point) + ".");
            }

            return this.relativeToLatLon(this.absoluteToRelative(absolutePoint));
        };

        this.absoluteToRelative = function(absolutePoint) {
            if (absolutePoint == null) {
                throw new Error("Parameter absolutePoint must be non-null.");
            }
            if (!(absolutePoint instanceof Point)) {
                throw new Error("Parameter absolutePoint must be of type " + Class.getName(Point) + ".");
            }

            return new Point(absolutePoint.x / this._cachedMapSize, absolutePoint.y / this._cachedMapSize);
        };

        this.absoluteToViewport = function(absolutePoint) {
            if (absolutePoint == null) {
                throw new Error("Parameter absolutePoint must be non-null.");
            }
            if (!(absolutePoint instanceof Point)) {
                throw new Error("Parameter absolutePoint must be of type " + Class.getName(Point) + ".");
            }

            return new Point(absolutePoint.x - this._cachedViewportOffsetX, absolutePoint.y - this._cachedViewportOffsetY);
        };

        this.viewportToLatLon = function(viewportPoint) {
            if (viewportPoint == null) {
                throw new Error("Parameter viewportPoint must be non-null.");
            }
            if (!(viewportPoint instanceof Point)) {
                throw new Error("Parameter viewportPoint must be of type " + Class.getName(Point) + ".");
            }

            return this.relativeToLatLon(this.absoluteToRelative(this.viewportToAbsolute(viewportPoint)));
        };

        this.viewportToRelative = function(viewportPoint) {
            if (viewportPoint == null) {
                throw new Error("Parameter viewportPoint must be non-null.");
            }
            if (!(viewportPoint instanceof Point)) {
                throw new Error("Parameter viewportPoint must be of type " + Class.getName(Point) + ".");
            }

            return this.absoluteToRelative(this.viewportToAbsolute(viewportPoint));
        };

        this.viewportToAbsolute = function(viewportPoint) {
            if (viewportPoint == null) {
                throw new Error("Parameter viewportPoint must be non-null.");
            }
            if (!(viewportPoint instanceof Point)) {
                throw new Error("Parameter viewportPoint must be of type " + Class.getName(Point) + ".");
            }

            return new Point(viewportPoint.x + this._cachedViewportOffsetX, viewportPoint.y + this._cachedViewportOffsetY);
        };

        this.getLatLonBounds = function() {
            var tl = this.viewportToLatLon(new Point(0, 0));
            var br = this.viewportToLatLon(new Point(this._cachedWidth, this._cachedHeight));
            return new LatLonBounds(br.lat, tl.lon, tl.lat, br.lon);
        };

        this.getRelativeBounds = function() {
            var tl = this.viewportToRelative(new Point(0, 0));
            var br = this.viewportToRelative(new Point(this._cachedWidth, this._cachedHeight));
            return new Rectangle(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
        };

        this.getAbsoluteBounds = function() {
            var tl = this.viewportToAbsolute(new Point(0, 0));
            var br = this.viewportToAbsolute(new Point(this._cachedWidth, this._cachedHeight));
            return new Rectangle(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
        };

        this.updateSize = function() {
            this.set("width", this.$element.width());
            this.set("height", this.$element.height());
        };

        this.dispose = function() {
            var controls = this._controls.concat();
            var control;
            var layers = this._layers.concat();
            var layer;
            var i;

            for (i = controls.length - 1; i >= 0; i--) {
                control = controls[i];
                this.removeControl(control);
                control.dispose();
            }

            for (i = layers.length - 1; i >= 0; i--) {
                layer = layers[i];
                this.removeLayer(layer);
                layer.dispose();
            }

            base.dispose.call(this);
        };

        // Protected Methods

        this.onAppend = function() {
            this._updateSizeInterval = setInterval(this.updateSize, 50);

            this.updateSize();
        };

        this.onRemove = function() {
            clearInterval(this._updateSizeInterval);
        };

        this.notifyBoundsChanged = function() {
            this.fire("boundsChanged", new EventData());
        };

        // Private Methods

        this._updatePropertiesCache = function() {
            var projection = this.getInternal("projection");
            var center = this.getInternal("center");
            var zoom = this.getInternal("zoom");
            var width = this.getInternal("width");
            var height = this.getInternal("height");

            if ((this._cachedProjection === projection) &&
                (this._cachedCenter && this._cachedCenter.equals(center)) &&
                (this._cachedZoom === zoom) &&
                (this._cachedWidth === width) &&
                (this._cachedHeight === height)) {
                return false;
            }

            this._cachedProjection = projection;
            this._cachedCenter = center;
            this._cachedZoom = zoom;
            this._cachedWidth = width;
            this._cachedHeight = height;

            this._updateComputedCache();

            return true;
        };

        this._updateTileSizeCache = function() {
            var tileSize = 256;

            var layers = this._layers;
            var layer;
            for (var i = 0, l = layers.length; i < l; i++) {
                layer = layers[i];
                if (layer instanceof TileLayerBase) {
                    tileSize = layer.get("tileSize");
                    break;
                }
            }

            if (this._cachedTileSize === tileSize) {
                return false;
            }

            this._cachedTileSize = tileSize;

            this._updateComputedCache();

            return true;
        };

        this._updateZoomRangeCache = function() {
            var zoom = this.getInternal("zoom");
            var minZoom = this.getInternal("minZoom");
            var maxZoom = this.getInternal("maxZoom");

            var layers = this._layers;
            var layer;
            for (var i = 0, l = layers.length; i < l; i++) {
                layer = layers[i];
                if (layer instanceof TileLayerBase) {
                    minZoom = Math.max(minZoom, layer.get("minZoom"));
                    maxZoom = Math.min(maxZoom, layer.get("maxZoom"));
                }
            }

            this._cachedMinZoom = minZoom;
            this._cachedMaxZoom = maxZoom;

            return NumberUtil.maxMin(zoom, maxZoom, minZoom);
        };

        this._updateComputedCache = function() {
            var projection = this._cachedProjection;
            var center = this._cachedCenter;
            var zoom = this._cachedZoom;
            var width = this._cachedWidth;
            var height = this._cachedHeight;
            var tileSize = this._cachedTileSize;

            var mapSize = tileSize * Math.pow(2, zoom);
            var centerRelative = projection.latLonToRelative(center);

            this._cachedMapSize = mapSize;
            this._cachedViewportOffsetX = (mapSize * centerRelative.x) - (width / 2);
            this._cachedViewportOffsetY = (mapSize * centerRelative.y) - (height / 2);
        };

        this._layer_tileSize_change = function(e) {
            if (this._updateTileSizeCache()) {
                this.notifyBoundsChanged();
            }
        };

        this._layer_minZoom_change = function(e) {
            var zoom = this._updateZoomRangeCache();
            this.set("zoom", zoom);
        };

        this._layer_maxZoom_change = function(e) {
            var zoom = this._updateZoomRangeCache();
            this.set("zoom", zoom);
        };

    });

});
