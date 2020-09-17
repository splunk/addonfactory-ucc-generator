define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var Leaflet = require("leaflet");
    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var Event = require("jg/events/Event");
    var EventData = require("jg/events/EventData");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Property = require("jg/properties/Property");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var NumberUtil = require("jg/utils/NumberUtil");
    var StringUtil = require("jg/utils/StringUtil");
    var GenericEventData = require("splunk/events/GenericEventData");
    var LatLon = require("splunk/mapping/LatLon");
    var LatLonBounds = require("splunk/mapping/LatLonBounds");
    var ControlBase = require("splunk/mapping/controls/ControlBase");
    var LayerBase = require("splunk/mapping/layers/LayerBase");
    var VizBase = require("splunk/viz/VizBase");
    var HTMLCleaner = require("util/htmlcleaner");

    require("jquery.resize");

    return Class(module.id, VizBase, function(Map, base) {

        // Public Passes

        this.updateLeafletMapSizePass = new Pass("updateLeafletMapSize", 0.001);
        this.updateTilesPass = new Pass("updateTiles", 0.002);

        // Public Events

        this.boundsChanged = new ChainedEvent("boundsChanged", this.change);
        this.mapClicked = new Event("mapClicked", GenericEventData);

        // Public Properties

        this.center = new Property("center", LatLon)
            .getter(function() {
                return LatLon.fromLeaflet(this.leafletMap.getCenter());
            })
            .setter(function(value) {
                value = (value && value.isFinite()) ? value.clone() : new LatLon();

                this.validate();
                this.leafletMap.setView(value.toLeaflet(), this.leafletMap.getZoom(), true);

                this._checkBoundsChanged();

                // set a second time on a delay since Leaflet is a POS and doesn't set the
                // center properly if zoom, minZoom, or maxZoom are also set at the same time
                clearTimeout(this._setCenterTimeout);
                this._setCenterTimeout = setTimeout(FunctionUtil.bind(function() {
                    this.leafletMap.setView(value.toLeaflet(), this.leafletMap.getZoom(), true);
                    this._checkBoundsChanged();
                }, this), 500);
            });

        this.zoom = new Property("zoom", Number)
            .getter(function() {
                return this.leafletMap.getZoom();
            })
            .setter(function(value) {
                value = ((value >= 0) && (value < Infinity)) ? value : 0;

                this.validate();
                this.leafletMap.setView(this.leafletMap.getCenter(), value, true);

                this._checkBoundsChanged();
            });

        this.tileURL = new ObservableProperty("tileURL", String, null)
            .onChange(function(e) {
                this.invalidate("updateTilesPass");
            });

        this.tileSubdomains = new ObservableArrayProperty("tileSubdomains", String, [ "a", "b", "c" ])
            .onChange(function(e) {
                this.invalidate("updateTilesPass");
            });

        this.tileMinZoom = new ObservableProperty("tileMinZoom", Number, 0)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? Math.floor(value) : 0;
            })
            .onChange(function(e) {
                this.invalidate("updateTilesPass");
            });

        this.tileMaxZoom = new ObservableProperty("tileMaxZoom", Number, Infinity)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? Math.floor(value) : Infinity;
            })
            .onChange(function(e) {
                this.invalidate("updateTilesPass");
            });

        this.tileInvertY = new ObservableProperty("tileInvertY", Boolean, false)
            .onChange(function(e) {
                this.invalidate("updateTilesPass");
            });

        this.tileOpacity = new ObservableProperty("tileOpacity", Number, 1)
            .writeFilter(function(value) {
                return ((value > 0) && (value < Infinity)) ? Math.min(value, 1) : 0;
            })
            .onChange(function(e) {
                this.invalidate("updateTilesPass");
            });

        this.tileAttribution = new ObservableProperty("tileAttribution", String, null)
            .onChange(function(e) {
                this.invalidate("updateTilesPass");
            });

        this.showTiles = new ObservableProperty("showTiles", Boolean, true)
            .onChange(function(e) {
                this.invalidate("updateTilesPass");
            });

        this.tilesLoaded = new ObservableProperty("tilesLoaded", Boolean, false)
            .readOnly(true);

        this.leafletMap = null;
        this.formatNumber = null;
        this.formatDegrees = null;
        this.isCategorical = false;

        // Private Properties

        this._tooltip = null;
        this._tooltipMetadata = null;
        this._tileLayer = null;
        this._layers = null;
        this._controls = null;
        this._width = 0;
        this._height = 0;
        this._bounds = null;
        this._setCenterTimeout = 0;
        this._clicks = 0;
        this._doubleClickTimeout = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping-Map");

            this.setStyle({ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "none" });

            this.updateSize = FunctionUtil.bind(this.updateSize, this);
            this._leafletMap_moveend = FunctionUtil.bind(this._leafletMap_moveend, this);
            this._leafletMap_zoomend = FunctionUtil.bind(this._leafletMap_zoomend, this);
            this._self_mouseOver = FunctionUtil.bind(this._self_mouseOver, this);
            this._self_mouseOut = FunctionUtil.bind(this._self_mouseOut, this);
            this._self_mouseMove = FunctionUtil.bind(this._self_mouseMove, this);
            this._self_click = FunctionUtil.bind(this._self_click, this);
            this._self_dbl_click = FunctionUtil.bind(this._self_dbl_click, this);

            this.leafletMap = new Leaflet.Map(this.element, { center: new Leaflet.LatLng(0, 0), zoom: 0, trackResize: false, worldCopyJump: false });
            this.leafletMap.attributionControl.setPrefix("");
            this.leafletMap.on("moveend", this._leafletMap_moveend);
            this.leafletMap.on("zoomend", this._leafletMap_zoomend);

            this._tooltip = new LeafletTooltip();

            this._layers = [];
            this._controls = [];

            this.$element.bind("mouseover", this._self_mouseOver);
            this.$element.bind("mouseout", this._self_mouseOut);
            this.$element.bind("mousemove", this._self_mouseMove);
            this.$element.bind("click", this._self_click);
            this.$element.bind("dblclick", this._self_dbl_click);
        };

        // Public Methods

        this.updateLeafletMapSize = function() {
            if (this.isValid("updateLeafletMapSizePass")) {
                return;
            }

            this.leafletMap.invalidateSize();
            // hack to force immediate redraw
            clearTimeout(this.leafletMap._sizeTimer);
            this.leafletMap.fire("moveend");

            this.markValid("updateLeafletMapSizePass");
        };

        this.updateTiles = function() {
            if (this.isValid("updateTilesPass")) {
                return;
            }

            var leafletMap = this.leafletMap;

            var tileLayer = this._tileLayer;
            if (tileLayer) {
                tileLayer.off('load');
                tileLayer.off('unload');
                leafletMap.removeLayer(tileLayer);
                this._tileLayer = null;
            }

            var tileOptions = {};
            tileOptions.opacity = this.getInternal("tileOpacity");
            tileOptions.subdomains = this.getInternal("tileSubdomains");
            tileOptions.minZoom = this.getInternal("tileMinZoom");
            tileOptions.maxZoom = Math.max(this.getInternal("tileMinZoom"), this.getInternal("tileMaxZoom"));
            tileOptions.tms = this.getInternal("tileInvertY");
            tileOptions.attribution = this.getInternal("tileAttribution");

            var tileURL = this.getInternal("showTiles") ? this.getInternal("tileURL") : null;
            if (tileURL) {
                tileLayer = this._tileLayer = new Leaflet.TileLayer(tileURL, tileOptions);
                tileLayer.on('load', function() {
                    this.setInternal('tilesLoaded', true);
                }, this);
                tileLayer.on('unload', function () {
                    this.setInternal('tilesLoaded', false);
                }, this);
                leafletMap.addLayer(tileLayer, true);
            }

            // hack to adjust maxZoom on leafletMap
            leafletMap.options.minZoom = tileOptions.minZoom;
            leafletMap.options.maxZoom = tileOptions.maxZoom;
            leafletMap.setZoom(leafletMap.getZoom());

            this.markValid("updateTilesPass");

            this._checkBoundsChanged();
        };

        this.addLayer = function(layer) {
            if (layer == null) {
                throw new Error("Parameter layer must be non-null.");
            }
            if (!(layer instanceof LayerBase)) {
                throw new Error("Parameter layer must be of type " + Class.getName(LayerBase) + ".");
            }

            var layers = this._layers;
            if (ArrayUtil.indexOf(layers, layer) >= 0) {
                return;
            }

            layers.push(layer);
            this.leafletMap.addLayer(layer.leafletLayer);
            layer.onAddedToMap(this);
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

            layer.onRemovedFromMap(this);
            this.leafletMap.removeLayer(layer.leafletLayer);
            layers.splice(index, 1);
        };

        this.addControl = function(control) {
            if (control === null) {
                throw new Error("Parameter control must be non-null.");
            }
            if (!(control instanceof ControlBase)) {
                throw new Error("Parameter control must be of type " + Class.getName(ControlBase) + ".");
            }

            var controls = this._controls;
            if (ArrayUtil.indexOf(controls, control) >= 0) {
                return;
            }

            controls.push(control);
            this.leafletMap.addControl(control.leafletControl);
            control.onAddedToMap(this);
        };

        this.removeControl = function(control) {
            if (control === null) {
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
            this.leafletMap.removeControl(control.leafletControl);
            controls.splice(index, 1);
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

            // clear center timeout hack so it doesn't conflict with the center we set here
            clearTimeout(this._setCenterTimeout);

            // compute zoom
            var zoom = this.leafletMap.getBoundsZoom(latLonBounds.toLeaflet(), viewportInside);

            // must set zoom first so that Leaflet conversion methods are accurate when computing the center
            this.leafletMap.setView(this.leafletMap.getCenter(), zoom, true);

            // compute center
            var tl = this.leafletMap.latLngToLayerPoint(latLonBounds.getNW().toLeaflet());
            var br = this.leafletMap.latLngToLayerPoint(latLonBounds.getSE().toLeaflet());
            var centerPoint = new Leaflet.Point((tl.x + br.x) / 2, (tl.y + br.y) / 2);
            var center = this.leafletMap.layerPointToLatLng(centerPoint);

            // set center and zoom
            this.leafletMap.setView(center, zoom, true);

            this._checkBoundsChanged();
        };

        this.getLatLonBounds = function() {
            return LatLonBounds.fromLeaflet(this.leafletMap.getBounds());
        };

        this.updateSize = function() {
            var width = this.$element.width();
            var height = this.$element.height();
            if ((width === this._width) && (height === this._height)) {
                return;
            }

            // HACK: The host architecture has no facilities in place for managing logic
            // that may be dependent on component visibility. Therefore, we must manually
            // verify that $element and its parent DOM tree are visible and able to return
            // valid dimensions before continuing with the resize operation.
            // This check should be removed if and when the host architecture supports the
            // required visibility hooks.
            // Addresses SPL-65769, SPL-76312, and SPL-76487.
            if (!this.$element.is(":visible")) {
                return;
            }

            this._width = width;
            this._height = height;

            this.leafletMap.invalidateSize();
            this.invalidate("updateLeafletMapSizePass");

            this._checkBoundsChanged();
        };

        this.dispose = function() {
            clearTimeout(this._setCenterTimeout);

            var layers = this._layers.concat();
            for (var i = layers.length - 1; i >= 0; i--) {
                this.removeLayer(layers[i]);
            }

            var controls = this._controls.concat();
            for (var j = controls.length - 1; j >=0; j--) {
                this.removeControl(controls[j]);
            }

            this.$element.off("elementResize");

            base.dispose.call(this);
        };

        // Protected Methods

        this.onAppend = function() {
            this.updateSize();
            // updateSize is bound to "this" in the constructor
            this.$element.on("elementResize", this.updateSize);
        };

        // Private Methods

        this._checkBoundsChanged = function() {
            var oldBounds = this._bounds;
            var newBounds = this.getLatLonBounds();
            if (oldBounds && oldBounds.equals(newBounds)) {
                return;
            }

            this._bounds = newBounds;
            this.fire("boundsChanged", new EventData());
        };

        this._checkBoundsDefault = function(bounds) {
            if (bounds.e === 0) {
                return false;
            } else if (bounds.w === 0) {
                return false;
            } else if (bounds.n === 0) {
                return false;
            } else if (bounds.s === 0) {
                return false;
            }
            return true;
        };

        this._updateTooltip = function(element) {
            var tooltip = this._tooltip;
            var metadata = this._getMetadataFromElement(element);
            if (metadata && (metadata !== this._tooltipMetadata)) {
                this._tooltipMetadata = metadata;

                var data = metadata.data;
                var fields = metadata.fields;
                var sliceList = metadata.sliceList;
                var tooltipFields = metadata.tooltipFields;
                var tooltipLatLng = metadata.tooltipLatLng;
                var tooltipOffsetRadius = metadata.tooltipOffsetRadius;
                if (data && (fields || tooltipFields) && tooltipLatLng) {
                    var content = "";
                    var field;
                    var slice;
                    var i, l;

                    content += "<table style=\"border: 0 none; border-spacing: 0; border-collapse: collapse;\">";
                    if (sliceList) {
                        for (i = 0, l = Math.min(fields.length, 2); i < l; i++) {
                            field = fields[i];
                            content += "<tr>";
                            content += "<td style=\"padding: 0; text-align: left; white-space: nowrap; color: #333333;\">" + StringUtil.escapeHTML(field) + ":&nbsp;&nbsp;</td><td style=\"padding: 0; text-align: right; white-space: nowrap;\">" + StringUtil.escapeHTML(this._formatDegrees(data[field], (i === 0) ? "ns" : "ew")) + "</td>";
                            content += "</tr>";
                        }
                        for (i = 0, l = sliceList.length; i < l; i++) {
                            slice = sliceList[i];
                            content += "<tr>";
                            content += "<td style=\"padding: 0; text-align: left; white-space: nowrap; color: " + ("#" + (slice.series.color | 0x1000000).toString(16).substring(1)) + ";\">" + StringUtil.escapeHTML(slice.series.name) + ":&nbsp;&nbsp;</td><td style=\"padding: 0; text-align: right; white-space: nowrap;\">" + StringUtil.escapeHTML(this._formatNumber(slice.value)) + "</td>";
                            content += "</tr>";
                        }
                    } else if (tooltipFields) {
                        // TODO [sff] this is getting to the point where we should unify this code to work based on some sort
                        // of abstract tooltip data structure (and move the styles to LESS).  Will fold that work into SPL-96198.
                        for (i = 0, l = tooltipFields.length; i < l; i++) {
                            field = tooltipFields[i];
                            var fieldContent = data[field];
                            if (field === metadata.valueFieldName && !this.isCategorical && !isNaN(parseFloat(fieldContent))) {
                                fieldContent = this._formatNumber(fieldContent);
                            } else {
                                fieldContent = StringUtil.escapeHTML(fieldContent);
                            }
                            content += "<tr>";
                            content += "<td style=\"padding: 0; text-align: left; white-space: nowrap; color: #333333;\">" + StringUtil.escapeHTML(field) + ":&nbsp;&nbsp;</td><td style=\"padding: 0; text-align: right; white-space: nowrap;\">" + fieldContent + "</td>";
                            content += "</tr>";
                        }
                    } else {
                        for (i = 0, l = fields.length; i < l; i += 2) {
                            field = fields[i];
                            content += "<tr>";
                            content += "<td style=\"padding: 0; text-align: left; white-space: nowrap; color: #333333;\">" + StringUtil.escapeHTML(field) + ":&nbsp;&nbsp;</td><td style=\"padding: 0; text-align: right; white-space: nowrap;\">" + StringUtil.escapeHTML(data[field]) + "</td>";
                            content += "</tr>";
                        }
                    }
                    content += "</table>";

                    tooltip.setLatLng(tooltipLatLng);
                    tooltip.setOffsetRadius(tooltipOffsetRadius);
                    tooltip.setContent(content);

                    this.leafletMap.openPopup(tooltip);
                } else {
                    this.leafletMap.closePopup();
                }
            } else if (!metadata && this._tooltipMetadata) {
                var isTooltip = $.contains(this._tooltip._container, element);
                // if the element is not a part of the tooltip then close the tooltip
                if (!isTooltip || this._tooltip === element) {
                    this._tooltipMetadata = null;
                    this.leafletMap.closePopup();
                }
            }
        };

        this._getMetadataFromElement = function(element) {
            while (element) {
                if (element[LayerBase.METADATA_KEY]) {
                    return element[LayerBase.METADATA_KEY];
                }
                element = element.parentNode;
            }
            return null;
        };

        this._formatNumber = function(num) {
            var format = this.formatNumber;
            if (typeof format === "function") {
                return format(Number(num));
            }

            return String(num);
        };

        this._formatDegrees = function(degrees, orientation) {
            var format = this.formatDegrees;
            if (typeof format === "function") {
                return format(Number(degrees), orientation);
            }

            return String(degrees);
        };

        this._leafletMap_moveend = function(e) {
            this._checkBoundsChanged();
        };

        this._leafletMap_zoomend = function(e) {
            this._checkBoundsChanged();
        };

        this._self_mouseOver = function(e) {
            this._updateTooltip(e.target);
        };

        this._self_mouseOut = function(e) {
            this._updateTooltip(e.relatedTarget);
        };

        this._self_mouseMove = function(e) {
            this._updateTooltip(e.target);
        };

        this._self_dbl_click = function(e) {
            clearTimeout(this._doubleClickTimeout);
        };

        this._self_click = function(e) {
            if (this.leafletMap.dragging && this.leafletMap.dragging.moved()) {
                return;
            }

            var metadata = this._getMetadataFromElement(e.target);
            if (!metadata || !metadata.data || !metadata.fields) {
                return;
            }

            e.preventDefault();

            var data = {};
            for (var p in metadata.data) {
                data[p] = metadata.data[p];
            }

            var fields = metadata.fields.concat();

            clearTimeout(this._doubleClickTimeout);
            this._doubleClickTimeout = setTimeout(function() {
                this.fire("mapClicked", new GenericEventData({ data: data, fields: fields, altKey: e.altKey, ctrlKey: e.ctrlKey || e.metaKey, shiftKey: e.shiftKey, jQueryEvent: e, originalEvent: e.originalEvent }));
            }.bind(this), 500);
        };

        // Private Nested Classes

        var LeafletTooltip = Leaflet.Popup.extend({

            options: {
                paddingX: 5,
                paddingY: 5
            },

            _offsetRadius: 0,

            initialize: function(options) {
                options = Leaflet.Util.extend(options || {}, { maxWidth: Infinity, maxHeight: Infinity, autoPan: false, closeButton: false });
                Leaflet.Popup.prototype.initialize.call(this, options);
            },

            setOffsetRadius: function(offsetRadius) {
                this._offsetRadius = offsetRadius;
                this._update();
                return this;
            },

            _initLayout: function() {
                Leaflet.Popup.prototype._initLayout.call(this);

                // hide tip
                this._tipContainer.style.display = "none";

                // disable mouse/pointer events on browsers that support it
                this._container.style.pointerEvents = "none";
            },

            _updatePosition: function() {
                var map = this._map;
                var mapTL = map.containerPointToLayerPoint(new Leaflet.Point(0, 0));
                var mapBR = map.containerPointToLayerPoint(map.getSize());
                var mapLeft = mapTL.x;
                var mapTop = mapTL.y;
                var mapRight = mapBR.x;
                var mapBottom = mapBR.y;

                var container = this._container;
                var containerWidth = container.offsetWidth;
                var containerHeight = container.offsetHeight;

                var is3d = Leaflet.Browser.any3d;
                var offsetRadius = this._offsetRadius;
                var paddingX = this.options.paddingX;
                var paddingY = this.options.paddingY;

                var centerPoint = map.latLngToLayerPoint(this._latlng);
                var offsetX = (centerPoint.x > ((mapLeft + mapRight) / 2)) ? (-containerWidth - offsetRadius - paddingX) : offsetRadius + paddingX;
                var offsetY = NumberUtil.maxMin(centerPoint.y - containerHeight / 2, mapBottom - containerHeight - paddingY, mapTop + paddingY) - centerPoint.y;

                if (is3d)
                    Leaflet.DomUtil.setPosition(container, centerPoint);

                var x = offsetX + (is3d ? 0 : centerPoint.x);
                var y = offsetY + (is3d ? 0 : centerPoint.y);

                container.style.left = Math.round(x) + "px";
                container.style.top = Math.round(y) + "px";
            }

        });

        // override Leaflet.Control.Attribution so that the attribution container is hidden when there is no text
        Leaflet.Control.Attribution.include({

            _update: function () {
                if (!this._map) {
                    return;
                }

                var attribs = [];

                for (var i in this._attributions) {
                    if (this._attributions.hasOwnProperty(i) && this._attributions[i]) {
                        attribs.push(i);
                    }
                }

                var prefixAndAttribs = [];

                if (this.options.prefix) {
                    prefixAndAttribs.push(this.options.prefix);
                }
                if (attribs.length) {
                    prefixAndAttribs.push(attribs.join(", "));
                }

                var text = HTMLCleaner.clean(prefixAndAttribs.join(" &#8212; "));

                this._container.innerHTML = text;
                this._container.style.display = text ? "" : "none";
            }

        });

    });

});
