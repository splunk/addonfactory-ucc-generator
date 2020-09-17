define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Point = require("jg/geom/Point");
    var Rectangle = require("jg/geom/Rectangle");
    var Color = require("jg/graphics/Color");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var NumberUtil = require("jg/utils/NumberUtil");
    var LatLon = require("splunk/mapping2/LatLon");
    var LatLonBounds = require("splunk/mapping2/LatLonBounds");
    var LayerBase = require("splunk/mapping2/layers/LayerBase");
    var ColorPalette = require("splunk/palettes/ColorPalette");
    var ListColorPalette = require("splunk/palettes/ListColorPalette");
    var DataUtil = require("splunk/utils/DataUtil");
    var Group = require("splunk/vectors/Group");
    var Viewport = require("splunk/vectors/Viewport");
    var Wedge = require("splunk/vectors/Wedge");
    var MDataTarget = require("splunk/viz/MDataTarget");

    return Class(module.id, LayerBase, function(PieMarkerLayer, base) {

        Class.mixin(this, MDataTarget);

        // Public Properties

        this.markerColorPalette = new ObservableProperty("markerColorPalette", ColorPalette, new ListColorPalette([ Color.fromNumber(0x00CC00), Color.fromNumber(0xCCCC00), Color.fromNumber(0xCC0000) ], true))
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.markerOpacity = new ObservableProperty("markerOpacity", Number, 1)
            .writeFilter(function(value) {
                return ((value >= 0) && (value <= Infinity)) ? Math.min(value, 1) : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.markerMinSize = new ObservableProperty("markerMinSize", Number, 10)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? value : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.markerMaxSize = new ObservableProperty("markerMaxSize", Number, 50)
            .writeFilter(function(value) {
                return ((value >= 0) && (value < Infinity)) ? value : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderDataPass");
            });

        this.wrapX = new ObservableProperty("wrapX", Boolean, true)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        this.wrapY = new ObservableProperty("wrapY", Boolean, false)
            .onChange(function(e) {
                this.invalidate("renderPass");
            });

        // Private Properties

        this._seriesList = null;
        this._markerList = null;
        this._markerViewport = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping2-layers-PieMarkerLayer");

            this._seriesList = [];
            this._markerList = [];
            this._markerViewport = new Viewport()
                .appendTo(this.element);
        };

        // Public Methods

        this.getLatLonBounds = function(center) {
            if ((center != null) && !(center instanceof LatLon)) {
                throw new Error("Parameter center must be of type " + Class.getName(LatLon) + ".");
            }

            this.validate();

            var bounds = new LatLonBounds(Infinity, Infinity, -Infinity, -Infinity);

            var markerList = this._markerList;
            for (var i = 0, l = markerList.length; i < l; i++) {
                bounds.expand(markerList[i].latLon.normalize(center));
            }

            return bounds.isFinite() ? bounds : null;
        };

        this.toSVGString = function() {
            this.validate();

            return this._markerViewport.toSVGString();
        };

        // Protected Methods

        this.processDataOverride = function(data, fields) {
            var seriesList = this._seriesList;
            var numSeries = 0;
            var series;

            var markerList = this._markerList;
            var numMarkers = 0;
            var marker;

            var sliceList;
            var numSlices;
            var slice;

            var i;
            var j;

            var numRows = data.length;
            var numFields = fields.length;
            if ((numRows > 0) && (numFields > 2)) {
                var viewport = this._markerViewport;

                var fieldLat = fields[0];
                var fieldLon = fields[1];
                var fieldSeries;

                var obj;
                var valueLat;
                var valueLon;
                var valueSeries;

                var magMin = Infinity;
                var magMax = -Infinity;
                var magSpan = 0;
                var mag;

                var sum;
                var angle1;
                var angle2;

                // create or reuse series
                for (i = 2; i < numFields; i++) {
                    fieldSeries = fields[i];
                    if (numSeries < seriesList.length) {
                        series = seriesList[numSeries];
                    } else {
                        series = new Series();
                        seriesList.push(series);
                    }

                    series.name = fieldSeries;

                    numSeries++;
                }

                // create or reuse markers
                for (i = 0; i < numRows; i++) {
                    obj = data[i];
                    if (obj == null) {
                        continue;
                    }

                    valueLat = DataUtil.parseNumber(obj[fieldLat]);
                    valueLon = DataUtil.parseNumber(obj[fieldLon]);
                    if (isNaN(valueLat) || isNaN(valueLon)) {
                        continue;
                    }

                    if (numMarkers < markerList.length) {
                        marker = markerList[numMarkers];
                    } else {
                        marker = new PieMarker();
                        marker.appendTo(viewport);
                        markerList.push(marker);
                    }

                    // create or reuse slices and compute marker magnitude
                    sliceList = marker.sliceList;
                    numSlices = 0;
                    mag = 0;
                    for (j = 0; j < numSeries; j++) {
                        series = seriesList[j];

                        valueSeries = DataUtil.parseNumber(obj[series.name]);
                        if (isNaN(valueSeries) || (valueSeries <= 0)) {
                            continue;
                        }

                        if (numSlices < sliceList.length) {
                            slice = sliceList[numSlices];
                        } else {
                            slice = new PieSlice();
                            slice.appendTo(marker);
                            sliceList.push(slice);
                        }

                        slice.series = series;
                        slice.value = valueSeries;

                        mag += valueSeries;

                        numSlices++;
                    }

                    if (numSlices === 0) {
                        continue;
                    }

                    // record marker attributes
                    marker.latLon = new LatLon(valueLat, valueLon);
                    marker.data = obj;
                    marker.fields = fields;
                    marker.magnitude = mag;

                    // update magnitude min and max
                    if (mag < magMin) {
                        magMin = mag;
                    }
                    if (mag > magMax) {
                        magMax = mag;
                    }

                    // compute slice angles
                    sum = 0;
                    angle1 = 0;
                    angle2 = 0;
                    for (j = 0; j < numSlices; j++) {
                        slice = sliceList[j];

                        sum += slice.value;
                        angle1 = angle2;
                        angle2 = 360 * (sum / mag);

                        slice.startAngle = angle1 - 90;
                        slice.arcAngle = angle2 - angle1;
                    }

                    // remove unused slices
                    for (j = sliceList.length - 1; j >= numSlices; j--) {
                        slice = sliceList.pop();
                        slice.dispose();
                    }

                    numMarkers++;
                }

                // compute marker scales
                magSpan = magMax - magMin;
                for (i = 0; i < numMarkers; i++) {
                    marker = markerList[i];
                    marker.scale = (magSpan > 0) ? NumberUtil.minMax((marker.magnitude - magMin) / magSpan, 0, 1) : (1 / numMarkers);
                }
            }

            // remove unused markers
            for (i = markerList.length - 1; i >= numMarkers; i--) {
                marker = markerList.pop();
                marker.dispose();
            }

            // remove unused series
            for (i = seriesList.length - 1; i >= numSeries; i--) {
                seriesList.pop();
            }
        };

        this.updateLegendLabelsOverride = function(data, fields) {
            var seriesList = this._seriesList;
            var numSeries = seriesList.length;
            var labels = (numSeries > 0) ? new Array(numSeries) : null;
            for (var i = 0; i < numSeries; i++) {
                labels[i] = seriesList[i].name;
            }
            return labels;
        };

        this.renderDataOverride = function(data, fields, legend) {
            this.invalidate("renderPass");

            var seriesList = this._seriesList;
            var numSeries = seriesList.length;
            var series;
            var seriesIndex;
            var seriesCount;

            var markerColorPalette = this.getInternal("markerColorPalette");
            var markerOpacity = this.getInternal("markerOpacity");
            var markerMinSize = this.getInternal("markerMinSize");
            var markerMaxSize = this.getInternal("markerMaxSize");
            var markerList = this._markerList;
            var numMarkers = markerList.length;
            var marker;

            var sliceList;
            var numSlices;
            var slice;

            var i;
            var j;

            var paletteSpan;
            var paletteRatio;

            // assign series colors
            seriesCount = legend ? legend.getNumLabels() : numSeries;
            paletteSpan = Math.max(seriesCount - 1, 0);
            for (i = 0; i < numSeries; i++) {
                series = seriesList[i];
                seriesIndex = legend ? legend.getLabelIndex(series.name) : i;
                paletteRatio = (paletteSpan > 0) ? (seriesIndex / paletteSpan) : 0;
                series.color = markerColorPalette ? (markerColorPalette.getItem(paletteRatio, paletteSpan, series.name) || new Color()).toNumber() : 0x000000;
            }

            // render pie slices
            for (i = 0; i < numMarkers; i++) {
                marker = markerList[i];
                sliceList = marker.sliceList;
                numSlices = sliceList.length;

                marker.radius = Math.round(NumberUtil.interpolate(markerMinSize, markerMaxSize, marker.scale)) / 2;
                marker.display("none");  // fixes vml flicker

                for (j = 0; j < numSlices; j++) {
                    slice = sliceList[j];
                    slice.fillColor(slice.series.color);
                    slice.fillOpacity(markerOpacity);
                    slice.draw(0, 0, marker.radius, marker.radius, slice.startAngle, slice.arcAngle);
                }
            }
        };

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

            var markerList = this._markerList;
            var marker;
            var markerPosition;

            for (var i = 0, l = markerList.length; i < l; i++) {
                marker = markerList[i];
                markerPosition = map.latLonToRelative(marker.latLon);

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

                marker.translate(markerPosition.x, markerPosition.y);
                if (((markerPosition.x + marker.radius) < 0) || ((markerPosition.x - marker.radius) > width) ||
                    ((markerPosition.y + marker.radius) < 0) || ((markerPosition.y - marker.radius) > height)) {
                    marker.display("none");
                } else {
                    marker.display(null);
                }
            }

            var viewport = this._markerViewport;
            viewport.width(width);
            viewport.height(height);
            viewport.viewBox(new Rectangle(0, 0, width, height));
        };

        // Private Nested Classes

        var Series = Class(Object, function(Series, base) {

            // Public Properties

            this.name = null;
            this.color = 0x000000;

            // Constructor

            this.constructor = function() {
                // noop
            };

        });

        var PieMarker = Class(Group, function(PieMarker, base) {

            // Public Properties

            this.sliceList = null;
            this.latLon = null;
            this.data = null;
            this.fields = null;
            this.magnitude = 0;
            this.scale = 0;
            this.radius = 0;

            // Constructor

            this.constructor = function() {
                base.constructor.call(this);

                this.sliceList = [];
            };

            // Public Methods

            this.dispose = function() {
                var sliceList = this.sliceList;
                for (var i = sliceList.length - 1; i >= 0; i--) {
                    sliceList[i].dispose();
                }

                base.dispose.call(this);
            };

        });

        var PieSlice = Class(Wedge, function(PieSlice, base) {

            // Public Properties

            this.series = null;
            this.value = 0;
            this.startAngle = 0;
            this.arcAngle = 0;

            // Constructor

            this.constructor = function() {
                base.constructor.call(this);
            };

        });

    });

});
