define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var NumberUtil = require("jg/utils/NumberUtil");
    var LatLon = require("splunk/mapping2/LatLon");
    var CircleMarker = require("splunk/mapping2/layers/CircleMarker");
    var MarkerLayer = require("splunk/mapping2/layers/MarkerLayer");
    var ColorPalette = require("splunk/palettes/ColorPalette");
    var ListColorPalette = require("splunk/palettes/ListColorPalette");
    var DataUtil = require("splunk/utils/DataUtil");
    var MDataTarget = require("splunk/viz/MDataTarget");

    return Class(module.id, MarkerLayer, function(CircleMarkerLayer, base) {

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

        this.defaultSeriesName = new ObservableProperty("defaultSeriesName", String, "marker")
            .onChange(function(e) {
                this.invalidate("processDataPass");
            });

        // Private Properties

        this._seriesList = null;
        this._markerList = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-mapping2-layers-CircleMarkerLayer");

            this._seriesList = [];
            this._markerList = [];
        };

        // Protected Methods

        this.processDataOverride = function(data, fields) {
            var seriesList = this._seriesList = [];

            var markerList = this._markerList;
            var numMarkers = 0;
            var marker;
            var i;

            var numRows = data.length;
            var numFields = fields.length;
            if ((numRows > 0) && (numFields > 1)) {
                var fieldLat = fields[0];
                var fieldLon = fields[1];
                var fieldMag = (numFields > 2) ? fields[2] : null;
                var fieldSeries = (numFields > 3) ? fields[3] : null;

                var valueLat;
                var valueLon;
                var valueMag;
                var valueSeries;

                var magMin = Infinity;
                var magMax = -Infinity;
                var magSpan = 0;

                var obj;
                var scale;
                var latLon;

                var defaultSeriesName = this.getInternal("defaultSeriesName");
                var seriesName;
                var seriesMap = {};
                var series;

                // modify fields list to include only plotted fields
                fields = fields.slice(0, Math.min(numFields, 4));

                // compute magnitude range
                if (numFields > 2) {
                    for (i = 0; i < numRows; i++) {
                        obj = data[i];
                        if (obj == null) {
                            continue;
                        }

                        valueMag = DataUtil.parseNumber(obj[fieldMag]);
                        if (isNaN(valueMag)) {
                            continue;
                        }

                        if (valueMag < magMin) {
                            magMin = valueMag;
                        }
                        if (valueMag > magMax) {
                            magMax = valueMag;
                        }
                    }
                }
                magMin = ((magMin > -Infinity) && (magMin < Infinity)) ? magMin : 0;
                magMax = ((magMax > -Infinity) && (magMax < Infinity)) ? magMax : 0;
                magSpan = magMax - magMin;

                // interpret data
                for (i = 0; i < numRows; i++) {
                    obj = data[i];
                    if (obj == null) {
                        continue;
                    }

                    valueLat = DataUtil.parseNumber(obj[fieldLat]);
                    valueLon = DataUtil.parseNumber(obj[fieldLon]);
                    valueMag = (numFields > 2) ? DataUtil.parseNumber(obj[fieldMag]) : NaN;
                    valueSeries = (numFields > 3) ? obj[fieldSeries] : defaultSeriesName;

                    if (isNaN(valueLat) || isNaN(valueLon) || (valueSeries == null)) {
                        continue;
                    }

                    seriesName = String(valueSeries);
                    if (!seriesName) {
                        continue;
                    }

                    if (isNaN(valueMag)) {
                        valueMag = magMin;
                    }

                    latLon = new LatLon(valueLat, valueLon);
                    scale = (magSpan > 0) ? NumberUtil.minMax((valueMag - magMin) / magSpan, 0, 1) : 0;

                    // create or reuse series
                    series = seriesMap[seriesName];
                    if (!series) {
                        series = seriesMap[seriesName] = {};
                        series.seriesName = seriesName;
                        series.markerList = [];
                        seriesList.push(series);
                    }

                    // create or reuse marker
                    if (numMarkers < markerList.length) {
                        marker = markerList[numMarkers];
                    } else {
                        marker = new CircleMarker();
                        markerList.push(marker);
                        this.addMarker(marker);
                    }

                    series.markerList.push(marker);

                    marker.set("latLon", latLon);
                    marker.metadata.seriesName = seriesName;
                    marker.metadata.data = obj;
                    marker.metadata.fields = fields;
                    marker.metadata.scale = scale;

                    numMarkers++;
                }
            }

            // remove unused markers
            for (i = markerList.length - 1; i >= numMarkers; i--) {
                marker = markerList.pop();
                this.removeMarker(marker);
            }
        };

        this.updateLegendLabelsOverride = function(data, fields) {
            var seriesList = this._seriesList;
            var numSeries = seriesList.length;
            var labels = (numSeries > 0) ? new Array(numSeries) : null;
            for (var i = 0; i < numSeries; i++) {
                labels[i] = seriesList[i].seriesName;
            }
            return labels;
        };

        this.renderDataOverride = function(data, fields, legend) {
            var seriesList = this._seriesList;
            var numSeries = seriesList.length;
            var series;
            var seriesIndex;
            var seriesCount;

            var markerColorPalette = this.getInternal("markerColorPalette");
            var markerOpacity = this.getInternal("markerOpacity");
            var markerMinSize = this.getInternal("markerMinSize");
            var markerMaxSize = this.getInternal("markerMaxSize");
            var markerList;
            var numMarkers;
            var marker;
            var markerColor;
            var markerSize;

            var i;
            var j;

            seriesCount = legend ? legend.getNumLabels() : numSeries;

            var paletteSpan = Math.max(seriesCount - 1, 0);
            var paletteRatio;

            for (i = 0; i < numSeries; i++) {
                series = seriesList[i];
                markerList = series.markerList;
                numMarkers = markerList.length;

                seriesIndex = legend ? legend.getLabelIndex(series.seriesName) : i;
                paletteRatio = (paletteSpan > 0) ? (seriesIndex / paletteSpan) : 0;

                markerColor = markerColorPalette ? (markerColorPalette.getItem(paletteRatio, paletteSpan, series.seriesName) || new Color()) : new Color();

                for (j = 0; j < numMarkers; j++) {
                    marker = markerList[j];

                    markerSize = Math.round(NumberUtil.interpolate(markerMinSize, markerMaxSize, marker.metadata.scale));

                    marker.set("size", markerSize);
                    marker.set("color", markerColor);
                    marker.set("opacity", markerOpacity);
                }
            }
        };

    });

});
