define(function(require, exports, module) {

    var _ = require("underscore");
    var Class = require("jg/Class");
    var Rectangle = require("jg/geom/Rectangle");
    var Color = require("jg/graphics/Color");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var NumberUtil = require("jg/utils/NumberUtil");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var LatLon = require("splunk/mapping2/LatLon");
    var LatLonBounds = require("splunk/mapping2/LatLonBounds");
    var LayerBase = require("splunk/mapping2/layers/LayerBase");
    var ListColorPalette = require("splunk/palettes/ListColorPalette");
    var DataUtil = require("splunk/utils/DataUtil");
    var Path = require("splunk/vectors/Path");
    var Viewport = require("splunk/vectors/Viewport");
    var MDataTarget = require("splunk/viz/MDataTarget");

    return Class(module.id, LayerBase, function(ChoroplethLayer, base) {

        Class.mixin(this, MDataTarget);

        // Public Properties

        this.fillColors = new ObservableArrayProperty("fillColors", Color, [ Color.fromNumber(0xC4E3EA), Color.fromNumber(0x6CB8CA), Color.fromNumber(0x2B4A51) ])
            .itemReadFilter(function(value) {
                return value.clone();
            })
            .itemWriteFilter(function(value) {
                return value ? value.clone().normalize() : new Color();
            })
            .itemChangeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.fillOpacity = new ObservableProperty("fillOpacity", Number, 0.75)
            .writeFilter(function(value) {
                return ((value >= 0) && (value <= Infinity)) ? Math.min(value, 1) : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.fillSteps = new ObservableProperty("fillSteps", Number, 9)
            .writeFilter(function(value) {
                return (value < Infinity) ? Math.max(Math.floor(value), 1) : 1;
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.borderColor = new ObservableProperty("borderColor", Color, Color.fromNumber(0x8F8F8F))
            .readFilter(function(value) {
                return value.clone();
            })
            .writeFilter(function(value) {
                return value ? value.clone().normalize() : new Color();
            })
            .changeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.borderOpacity = new ObservableProperty("borderOpacity", Number, 0.75)
            .writeFilter(function(value) {
                return ((value >= 0) && (value <= Infinity)) ? Math.min(value, 1) : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.borderWidth = new ObservableProperty("borderWidth", Number, 1)
            .writeFilter(function(value) {
                return (value < Infinity) ? Math.max(value, 0) : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.showDensity = new ObservableProperty("showDensity", Boolean, false)
            .onChange(function(e) {
                this.invalidate("processDataPass");
            });

        this.wrapX = new ObservableProperty("wrapX", Boolean, true)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.wrapY = new ObservableProperty("wrapY", Boolean, false)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.featureIdFieldName = new ObservableProperty("featureIdFieldName", String, "")
            .onChange(function(e) {
                this.invalidate("processDataPass");
            });

        // Private Properties

        this._colorPalette = null;
        this._polygonMap = null;
        this._polygonList = null;
        this._polygonViewport = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this._colorPalette = new ListColorPalette(null, true);
            this._polygonMap = {};
            this._polygonList = [];
            this._polygonViewport = new Viewport()
                .appendTo(this.element);
        };

        // Public Methods

        this.getLatLonBounds = function(center) {
            if ((center != null) && !(center instanceof LatLon)) {
                throw new Error("Parameter center must be of type " + Class.getName(LatLon) + ".");
            }

            this.validate();

            var bounds = new LatLonBounds(Infinity, Infinity, -Infinity, -Infinity);

            var polygonList = this._polygonList;
            var polygon;
            var polygonBounds;
            for (var i = 0, l = polygonList.length; i < l; i++) {
                polygon = polygonList[i];
                polygonBounds = polygon.getLatLonBounds();
                bounds.expand(polygonBounds.getSW().normalize(center));
                bounds.expand(polygonBounds.getNE().normalize(center));
            }

            return bounds.isFinite() ? bounds : null;
        };

        this.toSVGString = function() {
            this.validate();
            return this._polygonViewport.toSVGString();
        };

        // Protected Methods

        this.processDataOverride = function(data, fields) {
            this.invalidate("renderPass");

            var oldPolygonMap = this._polygonMap;
            var newPolygonMap = this._polygonMap = {};
            var polygonList = this._polygonList = [];
            var i, l, p;

            var numRows = data.length;
            var numFields = fields.length;
            if ((numRows > 0) && (numFields > 1)) {
                var showDensity = this.getInternal("showDensity");
                var viewport = this._polygonViewport;

                // We want to decouple the feature name from the ordering of the fields, this gives us the
                // flexibility to render without feature names (e.g. from the output of geostats) and to support
                // user-specified feature id field names
                var fieldName = this.getInternal("featureIdFieldName");
                var fieldsWithoutFeatureId = fieldName ? _(fields).without(fieldName) : fields;
                var fieldCount = fieldsWithoutFeatureId[0];
                var fieldGeom = fieldsWithoutFeatureId[1];
                var fieldArea = (showDensity && (fieldsWithoutFeatureId.length > 2)) ? fieldsWithoutFeatureId[2] : null;

                var obj;
                var polygonId;
                var valueGeom;
                var valueCount;
                var valueArea;

                var polygon;
                var magMin = Infinity;
                var magMax = -Infinity;
                var magSpan = 0;
                var mag;

                // create or reuse polygons
                for (i = 0; i < numRows; i++) {
                    obj = data[i];
                    if (obj == null) {
                        continue;
                    }

                    valueGeom = obj[fieldGeom];
                    polygonId = fieldName ? obj[fieldName] : valueGeom;
                    valueCount = DataUtil.parseNumber(obj[fieldCount]);
                    valueArea = fieldArea ? DataUtil.parseNumber(obj[fieldArea]) : 0;
                    if ((polygonId == null) || isNaN(valueCount)) {
                        continue;
                    }

                    mag = (valueArea > 0) ? (valueCount / valueArea) : valueCount;

                    polygon = oldPolygonMap[polygonId];
                    if (!polygon) {
                        polygon = MultiPolygon.fromJSON(valueGeom);
                        if (!polygon) {
                            continue;
                        }

                        polygon.appendTo(viewport);
                    }

                    delete oldPolygonMap[polygonId];
                    newPolygonMap[polygonId] = polygon;
                    polygonList.push(polygon);

                    polygon.magnitude = mag;
                    polygon.data = obj;
                    polygon.fields = fields;

                    if (mag < magMin) {
                        magMin = mag;
                    }
                    if (mag > magMax) {
                        magMax = mag;
                    }
                }

                // include zero in magnitude computations
                magMin = Math.min(magMin, 0);
                magMax = Math.max(magMax, 0);

                // if there are both positive and negative magnitudes, use bipolar scaling
                if ((magMin < 0) && (magMax > 0)) {
                    magMax = Math.max(magMax, -magMin);
                    magMin = -magMax;
                }

                // compute polygon scales
                magSpan = magMax - magMin;
                for (i = 0, l = polygonList.length; i < l; i++) {
                    polygon = polygonList[i];
                    polygon.scale = (magSpan > 0) ? NumberUtil.minMax((polygon.magnitude - magMin) / magSpan, 0, 1) : 0;
                }
            }

            // dispose unused polygons
            for (p in oldPolygonMap) {
                if (ObjectUtil.has(oldPolygonMap, p)) {
                    oldPolygonMap[p].dispose();
                }
            }
        };

        this.updateLegendLabelsOverride = function(data, fields) {
            return null;
        };

        this.renderDataOverride = function(data, fields, legend) {
            var fillColors = this.getInternal("fillColors");
            var fillOpacity = this.getInternal("fillOpacity");
            var fillSteps = this.getInternal("fillSteps");
            var borderColor = this.getInternal("borderColor");
            var borderOpacity = this.getInternal("borderOpacity");
            var borderWidth = this.getInternal("borderWidth");

            var colorPalette = this._colorPalette;
            var polygonList = this._polygonList;
            var polygon;

            var paletteSpan = Math.max(fillSteps - 1, 0);
            var paletteRatio;

            colorPalette.set("colors", fillColors);

            for (var i = 0, l = polygonList.length; i < l; i++) {
                polygon = polygonList[i];

                paletteRatio = (paletteSpan > 0) ? (Math.round(paletteSpan * polygon.scale) / paletteSpan) : 0;

                polygon.fillColor((colorPalette.getItem(paletteRatio, paletteSpan) || new Color()).toNumber());
                polygon.fillOpacity(fillOpacity);

                if (borderWidth > 0) {
                    polygon.strokeColor(borderColor.toNumber());
                    polygon.strokeOpacity(borderOpacity);
                    polygon.strokeWidth(borderWidth);
                } else {
                    polygon.strokeColor(NaN);
                    polygon.strokeOpacity(NaN);
                    polygon.strokeWidth(NaN);
                }
            }
        };

        this.renderOverride = function(map) {
            var width = map.get("width");
            var height = map.get("height");
            var centerLatLng = map.get("center");

            var wrapX = this.getInternal("wrapX");
            var wrapY = this.getInternal("wrapY");

            var polygonList = this._polygonList;
            var polygon;
            var polygonPixelBounds;
            var polygonLatLng;
            var polygonLatLngWrapped;
            var polygonPoint;
            var polygonPointWrapped;
            var polygonOffsetX;
            var polygonOffsetY;

            for (var i = 0, l = polygonList.length; i < l; i++) {
                polygon = polygonList[i];
                polygon.render(map);

                polygonPixelBounds = polygon.getPixelBounds();
                polygonLatLng = polygon.getLatLonBounds().getCenter();
                polygonLatLngWrapped = polygon.getLatLonBounds().getCenter();

                if (wrapX) {
                    polygonLatLngWrapped.lng -= centerLatLng.lng;
                    polygonLatLngWrapped.lng %= 360;
                    if (polygonLatLngWrapped.lng > 180) {
                        polygonLatLngWrapped.lng -= 360;
                    } else if (polygonLatLngWrapped.lng < -180) {
                        polygonLatLngWrapped.lng += 360;
                    }
                    polygonLatLngWrapped.lng += centerLatLng.lng;
                }

                if (wrapY) {
                    polygonLatLngWrapped.lat -= centerLatLng.lat;
                    polygonLatLngWrapped.lat %= 180;
                    if (polygonLatLngWrapped.lat > 90) {
                        polygonLatLngWrapped.lat -= 180;
                    } else if (polygonLatLngWrapped.lat < -90) {
                        polygonLatLngWrapped.lat += 180;
                    }
                    polygonLatLngWrapped.lat += centerLatLng.lat;
                }

                polygonPoint = map.latLonToViewport(polygonLatLng);
                polygonPointWrapped = map.latLonToViewport(polygonLatLngWrapped);
                polygonOffsetX = polygonPointWrapped.x - polygonPoint.x;
                polygonOffsetY = polygonPointWrapped.y - polygonPoint.y;

                polygon.translate(polygonOffsetX, polygonOffsetY);
                if (((polygonOffsetX + polygonPixelBounds.x + polygonPixelBounds.width) < 0) ||
                    ((polygonOffsetX + polygonPixelBounds.x) > width) ||
                    ((polygonOffsetY + polygonPixelBounds.y + polygonPixelBounds.height) < 0) ||
                    ((polygonOffsetY + polygonPixelBounds.y) > height)) {
                    polygon.display("none");
                } else {
                    polygon.display(null);
                }
            }

            var viewport = this._polygonViewport;
            viewport.width(width);
            viewport.height(height);
            viewport.viewBox(new Rectangle(0, 0, width, height));
        };

        // Private Nested Classes

        var MultiPolygon = Class(Path, function(MultiPolygon, base) {

            // Public Static Methods

            MultiPolygon.fromJSON = function(json) {
                if (json == null) {
                    return null;
                }

                if (typeof json === "string") {
                    json = JSON.parse(json);
                }

                if (!json || (json.type !== "MultiPolygon")) {
                    return null;
                }

                var coordinates = json.coordinates;
                if (!coordinates) {
                    return null;
                }

                coordinates = _processCoordinates(coordinates);
                if (!coordinates) {
                    return null;
                }

                _normalizeCoordinates(coordinates);

                return new MultiPolygon(coordinates);
            };

            // Private Static Methods

            var _processCoordinates = function(coordinates, processed, path) {
                if (!coordinates) {
                    return null;
                }

                var length = coordinates.length;
                if (!length) {
                    return null;
                }

                if (!processed) {
                    processed = [];
                }

                if ((length === 2) && (typeof coordinates[0] === "number") && (typeof coordinates[1] === "number")) {
                    // GeoJSON coordinate order is longitude, latitude
                    if (!path) {
                        processed.push([new LatLon(coordinates[1], coordinates[0])]);
                    } else {
                        path.push(new LatLon(coordinates[1], coordinates[0]));
                    }
                } else {
                    path = [];
                    for (var i = 0; i < length; i++) {
                        _processCoordinates(coordinates[i], processed, path);
                    }
                    if (path.length > 0) {
                        processed.push(path);
                    }
                }

                return (processed.length > 0) ? processed : null;
            };

            var _normalizeCoordinates = function(coordinates) {
                var length = coordinates.length;
                var path;
                var latLon;
                var ci, cl;
                var pi, pl;

                var lonSum = 0;
                var lonCount = 0;

                for (ci = 0; ci < length; ci++) {
                    path = coordinates[ci];
                    for (pi = 0, pl = path.length; pi < pl; pi++) {
                        latLon = path[pi];
                        lonSum += latLon.lon;
                        lonCount++;
                    }
                }

                var lonAvg = lonSum / lonCount;

                for (ci = 0; ci < length; ci++) {
                    path = coordinates[ci];
                    latLon = path[0];
                    if ((latLon.lon - lonAvg) > 180) {
                        for (pi = 0, pl = path.length; pi < pl; pi++) {
                            latLon = path[pi];
                            latLon.lon -= 360;
                        }
                    } else if ((latLon.lon - lonAvg) < -180) {
                        for (pi = 0, pl = path.length; pi < pl; pi++) {
                            latLon = path[pi];
                            latLon.lon += 360;
                        }
                    }
                }
            };

            // Public Properties

            this.magnitude = 0;
            this.scale = 0;
            this.data = null;
            this.fields = null;

            // Private Properties

            this._coordinates = null;
            this._bounds = null;
            this._boundsPixels = new Rectangle(NaN, NaN, NaN, NaN);

            // Constructor

            this.constructor = function(coordinates) {
                if (coordinates == null) {
                    throw new Error("Parameter coordinates must be non-null.");
                }

                base.constructor.call(this);

                this._coordinates = coordinates;
            };

            // Public Methods

            this.getLatLonBounds = function() {
                var bounds = this._bounds;
                if (!bounds) {
                    bounds = this._bounds = new LatLonBounds(Infinity, Infinity, -Infinity, -Infinity);

                    var coordinates = this._coordinates;
                    var path;
                    var ci, cl;
                    var pi, pl;

                    for (ci = 0, cl = coordinates.length; ci < cl; ci++) {
                        path = coordinates[ci];
                        for (pi = 0, pl = path.length; pi < pl; pi++) {
                            bounds.expand(path[pi]);
                        }
                    }
                }
                return bounds;
            };

            this.getPixelBounds = function() {
                return this._boundsPixels;
            };

            this.render = function(map) {
                var coordinates = this._coordinates;
                var bounds = this.getLatLonBounds();
                var pointPixelsNW = map.latLonToViewport(bounds.getNW());
                var pointPixelsSE = map.latLonToViewport(bounds.getSE());
                var boundsPixels = new Rectangle(pointPixelsNW.x, pointPixelsNW.y, pointPixelsSE.x - pointPixelsNW.x, pointPixelsSE.y - pointPixelsNW.y);
                if (boundsPixels.equals(this._boundsPixels)) {
                    return;
                }

                this._boundsPixels = boundsPixels;

                var path;
                var point0;
                var pointI;
                var ci, cl;
                var pi, pl;

                this.beginPath();
                for (ci = 0, cl = coordinates.length; ci < cl; ci++) {
                    path = coordinates[ci];
                    point0 = map.latLonToViewport(path[0]);
                    this.moveTo(point0.x, point0.y);
                    for (pi = 1, pl = path.length; pi < pl; pi++) {
                        pointI = map.latLonToViewport(path[pi]);
                        this.lineTo(pointI.x, pointI.y);
                    }
                    this.lineTo(point0.x, point0.y);
                }
                this.endPath();
            };

        });

    });

});
