define(function(require, exports, module) {

    var _ = require("underscore");
    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var Event = require("jg/events/Event");
    var EventData = require("jg/events/EventData");
    var Rectangle = require("jg/geom/Rectangle");
    var Color = require("jg/graphics/Color");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var NumberUtil = require("jg/utils/NumberUtil");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var LatLon = require("splunk/mapping/LatLon");
    var LatLonBounds = require("splunk/mapping/LatLonBounds");
    var BaseAxis = require("splunk/mapping/axis/BaseAxis");
    var LayerBase = require("splunk/mapping/layers/LayerBase");
    var VectorLayerBase = require("splunk/mapping/layers/VectorLayerBase");
    var ColorPalette = require("splunk/palettes/ColorPalette");
    var ListColorPalette = require("splunk/palettes/ListColorPalette");
    var DataUtil = require("splunk/utils/DataUtil");
    var Path = require("splunk/vectors/Path");
    var MDataTarget = require("splunk/viz/MDataTarget");

    return Class(module.id, VectorLayerBase, function(ChoroplethLayer, base) {

        Class.mixin(this, MDataTarget);

        // Private Static Constants

        var _NULL_POLYGON_COLOR = 0xd1d1d1;

        // Public Passes

        this.computeContainedRangePass = new Pass("computeContainedRange", 0.111);

        // Public Events

        this.rendered = new Event("rendered", EventData);

        // Public Properties

        this.axis = new ObservableProperty("axis", BaseAxis, null)
            .onChange(function(e) {
                if (e.target === this) {
                    if (e.oldValue) {
                        e.oldValue.unregister(this);
                    }
                    if (e.newValue) {
                        e.newValue.register(this);
                    }
                    this.invalidate("processDataPass");
                    this.invalidate("computeContainedRangePass");
                } else if (e.property && (e.property === e.target.preliminaryMinimum || e.property === e.target.preliminaryMaximum)) {
                    this.invalidate("computeContainedRangePass");
                } else if (e.property && (e.property === e.target.extendedMinimum || e.property === e.target.extendedMaximum)) {
                    this.invalidate("renderDataPass");
                } else if (e.property && (e.property === e.target.actualMinimum || e.property === e.target.actualMaximum)) {
                    this.invalidate("renderPass");
                }
            });

        this.bins = new ObservableProperty("bins", Number, 5)
            .writeFilter(function(value) {
                return !isNaN(value) ? Math.min(Math.max(Math.floor(value), 1), 9) : 5;
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.neutralPoint = new ObservableProperty("neutralPoint", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("computeContainedRangePass");
            });

        this.colorPalette = new ObservableProperty("colorPalette", ColorPalette, null)
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.shapeOpacity = new ObservableProperty("shapeOpacity", Number, 0.75)
            .writeFilter(function(value) {
                if (isNaN(value)) {
                    return 0.75;
                }
                return (value >= 0) ? Math.min(value, 1) : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.borderColor = new ObservableProperty("borderColor", Color, Color.fromNumber(0xE9E9E9))
            .readFilter(function(value) {
                return value.clone();
            })
            .writeFilter(function(value) {
                return value ? value.clone().normalize() : Color.fromNumber(0xE9E9E9);
            })
            .changeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.borderOpacity = new ObservableProperty("borderOpacity", Number, 0.75)
            .writeFilter(function(value) {
                if (isNaN(value)) {
                    return 0.75;
                }
                return (value >= 0) ? Math.min(value, 1) : 0;
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

        this.selectedField = new ObservableProperty("selectedField", String, null)
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        // Private Properties

        this._colorPalette = null;
        this._polygonMap = null;
        this._polygonList = null;
        this._labelValues = [];

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this._polygonMap = {};
            this._polygonList = [];
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

        // Protected Methods

        this.processDataOverride = function(data, fields) {
            this.invalidate("renderPass");

            var oldPolygonMap = this._polygonMap;
            var newPolygonMap = this._polygonMap = {};
            var polygonList = this._polygonList = [];
            var i, l, p;

            var numRows = data.length;
            var numFields = fields.length;
            var counts = [];
            var axis = this.getInternal("axis");
            if ((numRows > 0) && (numFields > 1)) {
                var showDensity = this.getInternal("showDensity");
                var vectorContainer = this.vectorContainer;

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

                // create or reuse polygons
                for (i = 0; i < numRows; i++) {
                    obj = data[i];
                    if (obj == null) {
                        continue;
                    }

                    valueGeom = obj[fieldGeom];
                    polygonId = fieldName ? obj[fieldName] : valueGeom;
                    valueCount = (obj[fieldCount] != null) ? obj[fieldCount] : "NULL";
                    counts.push(valueCount);
                    valueArea = fieldArea ? DataUtil.parseNumber(obj[fieldArea]) : 0;

                    polygon = oldPolygonMap[polygonId];
                    // The geometry definition for a given polygon can change either due to clipping or smoothing by the back end.
                    // If the GeoJSON has changed since the polygon was created, destroy it and create a new one.
                    if (polygon && polygon.geom !== valueGeom) {
                        polygon.dispose();
                        polygon = null;
                        delete oldPolygonMap[polygonId];
                    }
                    if (!polygon) {
                        polygon = MultiPolygon.fromJSON(valueGeom);
                        if (!polygon) {
                            continue;
                        }

                        polygon.appendTo(vectorContainer);
                    }

                    delete oldPolygonMap[polygonId];
                    newPolygonMap[polygonId] = polygon;
                    polygonList.push(polygon);

                    polygon.data = obj;
                    polygon.count = valueCount;
                    polygon.geom = valueGeom;
                    polygon.fields = fields;
                    polygon.tooltipFields = fieldName ? [fieldName, fieldCount] : [fieldCount];
                    polygon.valueFieldName = fieldCount;
                }

                if (axis) {
                    this._labelValues = null;
                    axis.provideContainedValues(this, counts);
                } else {
                    this._labelValues = counts;
                }
            }

            // dispose unused polygons
            for (p in oldPolygonMap) {
                if (ObjectUtil.has(oldPolygonMap, p)) {
                    oldPolygonMap[p].dispose();
                }
            }
        };

        this.computeContainedRange = function() {
            var axis = this.get("axis");
            if (!axis) {
                return;
            }

            var preliminaryMinimum = axis.get("preliminaryMinimum");
            var preliminaryMaximum = axis.get("preliminaryMaximum");
            if (!_.isFinite(preliminaryMinimum) || !_.isFinite(preliminaryMaximum)) {
                axis.provideContainedRange(this, NaN, NaN);
                return;
            }

            var neutralPoint = this.getInternal("neutralPoint");
            if (_.isNaN(neutralPoint) || (preliminaryMaximum === preliminaryMinimum && preliminaryMinimum === neutralPoint)) {
                axis.provideContainedRange(this, NaN, NaN);
                return;
            }

            var maxDataDifferenceFromNeutral = Math.max(neutralPoint - preliminaryMinimum, preliminaryMaximum - neutralPoint);
            axis.provideContainedRange(this, neutralPoint - maxDataDifferenceFromNeutral, neutralPoint + maxDataDifferenceFromNeutral);
        };

        this.updateLegendLabelsOverride = function(data, fields) {
            if (!this.getInternal("axis")) {
                return this._labelValues;
            } else {
                return null;
            }
        };

        this.renderDataOverride = function(data, fields, legend) {
            var axis = this.getInternal("axis");
            if (!axis && !legend) {
                return;
            }

            var shapeOpacity = this.getInternal("shapeOpacity");
            var borderColor = this.getInternal("borderColor");
            var borderOpacity = this.getInternal("borderOpacity");
            var borderWidth = this.getInternal("borderWidth");

            var colorPalette = this.getInternal("colorPalette");
            var polygonList = this._polygonList;
            if (axis) {
                var extendedMin = axis.get("extendedMinimum");
                var extendedMax = axis.get("extendedMaximum");
            }

            var bins;
            var numericBins = this.getInternal("bins");
            var selectedField = this.get("selectedField");

            if (axis) {
                bins = numericBins;
            } else {
                bins = legend.getNumLabels();
            }

            var paletteSpan = Math.max(bins - 1, 0);
            var paletteRatio;

            var polygon, polygonCount, polygonBin, polygonSelectedCount, polygonSelectedBin;
            for (var i = 0, l = polygonList.length; i < l; i++) {
                polygon = polygonList[i];
                if (!colorPalette) {
                    polygon.fillColor(0x000000);
                } else {
                    if (axis) {
                        polygonCount = axis.valueToAbsolute(polygon.count);
                        polygonBin = Math.floor((polygonCount - extendedMin) / ((extendedMax - extendedMin) / bins));
                        paletteRatio = (paletteSpan > 0) ? (polygonBin / paletteSpan) : 0;

                        if (selectedField) {
                            polygonSelectedCount = axis.valueToAbsolute(selectedField);
                            polygonSelectedBin = Math.floor((polygonSelectedCount - extendedMin) / ((extendedMax - extendedMin) / bins));
                            if (polygonBin === polygonSelectedBin) {
                                polygon.fillColor((colorPalette.getItem(paletteRatio, paletteSpan, String(polygonCount)) || new Color()).toNumber());
                            } else {
                                polygon.fillColor(_NULL_POLYGON_COLOR);
                            }
                        } else {
                            if (isNaN(polygonCount)) {
                                polygon.fillColor(_NULL_POLYGON_COLOR);
                            } else {
                                polygon.fillColor((colorPalette.getItem(paletteRatio, paletteSpan, String(polygonCount)) || new Color()).toNumber());
                            }
                        }
                    } else {
                        if (selectedField) {
                            polygonCount = polygon.count;
                            if (polygonCount === selectedField) {
                                polygonBin = legend.getLabelIndex(polygonCount);
                                paletteRatio = (paletteSpan > 0) ? (polygonBin / paletteSpan) : 0;
                                polygon.fillColor((colorPalette.getItem(paletteRatio, paletteSpan, String(polygonCount)) || new Color()).toNumber());
                            } else {
                                polygon.fillColor(_NULL_POLYGON_COLOR);
                            }
                        } else {
                            polygonCount = polygon.count;
                            polygonBin = legend.getLabelIndex(polygonCount);
                            paletteRatio = (paletteSpan > 0) ? (polygonBin / paletteSpan) : 0;
                            polygon.fillColor((colorPalette.getItem(paletteRatio, paletteSpan, String(polygonCount)) || new Color()).toNumber());
                        }
                    }
                }
                polygon.fillOpacity(shapeOpacity);

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
            // If the renderPass is about to run, don't trigger a rendered event since it will happen there.
            if (this.isValid('renderPass')) {
                this.fire('rendered', new EventData());
            }
        };

        this.renderOverride = function(map) {
            var axis = this.getInternal("axis");
            base.renderOverride.call(this, map);

            var leafletMap = map.leafletMap;
            var centerLatLng = leafletMap.getCenter();

            var wrapX = this.getInternal("wrapX");
            var wrapY = this.getInternal("wrapY");
            var vectorBounds = this.vectorBounds;
            var minX = vectorBounds.minX;
            var minY = vectorBounds.minY;
            var maxX = vectorBounds.maxX;
            var maxY = vectorBounds.maxY;

            var polygonList = this._polygonList;
            var polygon;
            var polygonPixelBounds;
            var polygonCenter;
            var polygonLatLng;
            var polygonLatLngWrapped;
            var polygonPoint;
            var polygonPointWrapped;
            var polygonOffsetX;
            var polygonOffsetY;

            for (var i = 0, l = polygonList.length; i < l; i++) {
                var count = polygonList[i].count;
                if (axis) {
                    count = axis.absoluteToRelative(count);
                } else {
                    count = 0;
                }

                polygon = polygonList[i];
                polygon.render(leafletMap);

                polygonPixelBounds = polygon.getPixelBounds();
                polygonCenter = polygon.getLatLonBounds().getCenter();
                polygonLatLng = polygonCenter.toLeaflet();
                polygonLatLngWrapped = polygonCenter.toLeaflet();

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

                polygon.tooltipLatLng = polygonLatLngWrapped;

                polygonPoint = leafletMap.latLngToLayerPoint(polygonLatLng);
                polygonPointWrapped = leafletMap.latLngToLayerPoint(polygonLatLngWrapped);
                polygonOffsetX = polygonPointWrapped.x - polygonPoint.x;
                polygonOffsetY = polygonPointWrapped.y - polygonPoint.y;

                polygon.translate(polygonOffsetX, polygonOffsetY);
                if (((polygonOffsetX + polygonPixelBounds.x + polygonPixelBounds.width) < minX) ||
                    ((polygonOffsetX + polygonPixelBounds.x) > maxX) ||
                    ((polygonOffsetY + polygonPixelBounds.y + polygonPixelBounds.height) < minY) ||
                    ((polygonOffsetY + polygonPixelBounds.y) > maxY) || (count < 0) || (count > 1)) {
                    polygon.display("none");
                } else {
                    polygon.display(null);
                }
            }
            this.fire('rendered', new EventData());
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
            this.tooltipFields = null;
            this.tooltipLatLng = null;
            this.tooltipOffsetRadius = 0;

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

                this.element[LayerBase.METADATA_KEY] = this;
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

            this.render = function(leafletMap) {
                var coordinates = this._coordinates;
                var bounds = this.getLatLonBounds();
                var pointPixelsNW = leafletMap.latLngToLayerPoint(bounds.getNW().toLeaflet());
                var pointPixelsSE = leafletMap.latLngToLayerPoint(bounds.getSE().toLeaflet());
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
                    point0 = leafletMap.latLngToLayerPoint(path[0].toLeaflet());
                    this.moveTo(point0.x, point0.y);
                    for (pi = 1, pl = path.length; pi < pl; pi++) {
                        pointI = leafletMap.latLngToLayerPoint(path[pi].toLeaflet());
                        this.lineTo(pointI.x, pointI.y);
                    }
                    this.lineTo(point0.x, point0.y);
                }
                this.endPath();
            };

            this.dispose = function() {
                this.element[LayerBase.METADATA_KEY] = null;

                base.dispose.call(this);
            };

        });

    });

});
