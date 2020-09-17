define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var EventData = require("jg/events/EventData");
    var Rectangle = require("jg/geom/Rectangle");
    var DrawingUtil = require("jg/graphics/DrawingUtil");
    var Brush = require("jg/graphics/Brush");
    var SolidFillBrush = require("jg/graphics/SolidFillBrush");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Property = require("jg/properties/Property");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var LogScale = require("splunk/charting/LogScale");
    var DateTime = require("splunk/time/DateTime");
    var DataUtil = require("splunk/utils/DataUtil");
    var GraphicsVizBase = require("splunk/viz/GraphicsVizBase");

    return Class(module.id, GraphicsVizBase, function(Histogram, base) {

        // Private Static Methods

        var _sortComparator = function(renderData1, renderData2) {
            var x11 = renderData1.valueDataX1.relative;
            var x21 = renderData2.valueDataX1.relative;
            if (x11 < x21) {
                return -1;
            }
            if (x11 > x21) {
                return 1;
            }
            return 0;
        };

        var _searchComparator = function(renderData, x) {
            var x1 = renderData.valueDataX1.relative;
            var x2 = renderData.valueDataX2.relative;
            if (x2 <= x) {
                return -1;
            }
            if (x1 > x) {
                return 1;
            }
            return 0;
        };

        // Public Passes

        this.processDataPass = new Pass("processData", 0.1);
        this.updateRangeXPass = new Pass("updateRangeX", 0.2);
        this.updateRangeYPass = new Pass("updateRangeY", 0.2);

        // Public Events

        this.rangeXChanged = new ChainedEvent("rangeXChanged", this.change);
        this.rangeYChanged = new ChainedEvent("rangeYChanged", this.change);
        this.containedRangeXChanged = new ChainedEvent("containedRangeXChanged", this.change);
        this.containedRangeYChanged = new ChainedEvent("containedRangeYChanged", this.change);

        // Public Properties

        this.data = new ObservableProperty("data", Array, null)
            .onChange(function(e) {
                this.invalidate("processDataPass");
            });

        this.brush = new ObservableProperty("brush", Brush, null)
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.minimumX = new ObservableProperty("minimumX", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("updateRangeXPass");
            });

        this.maximumX = new ObservableProperty("maximumX", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("updateRangeXPass");
            });

        this.minimumY = new ObservableProperty("minimumY", Number, NaN)
            .readFilter(function(value) {
                return this.valueToAbsoluteY(value);
            })
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? this.absoluteToValueY(value) : NaN;
            })
            .onChange(function(e) {
                this.invalidate("updateRangeYPass");
            });

        this.maximumY = new ObservableProperty("maximumY", Number, NaN)
            .readFilter(function(value) {
                return this.valueToAbsoluteY(value);
            })
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? this.absoluteToValueY(value) : NaN;
            })
            .onChange(function(e) {
                this.invalidate("updateRangeYPass");
            });

        this.scaleY = new ObservableProperty("scaleY", LogScale, null)
            .onChange(function(e) {
                this._cachedScaleY = e.newValue;
                this.invalidate("processDataPass");
            });

        this.containedMinimumX = new Property("containedMinimumX", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangeXPass");
            })
            .getter(function() {
                return this._containedMinimumX;
            });

        this.containedMaximumX = new Property("containedMaximumX", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangeXPass");
            })
            .getter(function() {
                return this._containedMaximumX;
            });

        this.containedMinimumY = new Property("containedMinimumY", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangeYPass");
            })
            .getter(function() {
                return this._containedMinimumY;
            });

        this.containedMaximumY = new Property("containedMaximumY", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangeYPass");
            })
            .getter(function() {
                return this._containedMaximumY;
            });

        this.actualMinimumX = new Property("actualMinimumX", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangeXPass");
            })
            .getter(function() {
                return this._actualMinimumX;
            });

        this.actualMaximumX = new Property("actualMaximumX", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangeXPass");
            })
            .getter(function() {
                return this._actualMaximumX;
            });

        this.actualMinimumY = new Property("actualMinimumY", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangeYPass");
            })
            .getter(function() {
                return this._actualMinimumY;
            });

        this.actualMaximumY = new Property("actualMaximumY", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangeYPass");
            })
            .getter(function() {
                return this._actualMaximumY;
            });

        // Private Properties

        this._cachedScaleY = null;
        this._containedMinimumX = 0;
        this._containedMaximumX = 0;
        this._containedMinimumY = 0;
        this._containedMaximumY = 100;
        this._actualMinimumX = 0;
        this._actualMaximumX = 0;
        this._actualMinimumY = 0;
        this._actualMaximumY = 100;

        this._actualRangeX = 0;
        this._actualRangeY = 100;
        this._actualScaleY = null;
        this._valueDatasX = null;
        this._valueDatasY = null;
        this._renderDatas = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-charting-Histogram");

            var now = new DateTime();
            now = now.toUTC();
            now.setMinutes(0);
            now.setSeconds(0);
            this._containedMinimumX = now.getTime();
            this._containedMaximumX = now.getTime() + 3600;
            this._actualMinimumX = this._containedMinimumX;
            this._actualMaximumX = this._containedMaximumX;
            this._actualRangeX = this._actualMaximumX - this._actualMinimumX;

            this._valueDatasX = [];
            this._valueDatasY = [];
            this._renderDatas = [];
        };

        // Public Methods

        this.processData = function() {
            if (this.isValid("processDataPass")) {
                return;
            }

            this.invalidate("updateRangeXPass");
            this.invalidate("updateRangeYPass");

            var valueDatasX = this._valueDatasX = [];
            var valueDatasY = this._valueDatasY = [];
            var renderDatas = this._renderDatas = [];

            var buckets = this.getInternal("data");
            var numBuckets = buckets ? buckets.length : 0;
            if (numBuckets > 0) {
                var bucket;
                var valueDataX1;
                var valueDataX2;
                var valueDataY1;
                var valueDataY2 = { value: 0, absolute: this.valueToAbsoluteY(0) };
                var renderData;
                var i;

                valueDatasY.push(valueDataY2);

                for (i = 0; i < numBuckets; i++) {
                    bucket = buckets[i];

                    valueDataX1 = { value: bucket.x1, absolute: this.valueToAbsoluteX(bucket.x1) };
                    valueDataX2 = { value: bucket.x2, absolute: this.valueToAbsoluteX(bucket.x2) };
                    valueDataY1 = { value: bucket.y, absolute: this.valueToAbsoluteY(bucket.y) };

                    if ((valueDataX1.absolute > -Infinity) && (valueDataX1.absolute < Infinity) &&
                        (valueDataX2.absolute > -Infinity) && (valueDataX2.absolute < Infinity) &&
                        (valueDataY1.absolute > -Infinity) && (valueDataY1.absolute < Infinity)) {
                        renderData = { valueDataX1: valueDataX1, valueDataX2: valueDataX2, valueDataY1: valueDataY1, valueDataY2: valueDataY2 };
                        renderData.data = { x1: valueDataX1.value, x2: valueDataX2.value, y: valueDataY1.value };
                        renderData.bounds = null;

                        valueDatasX.push(valueDataX1);
                        valueDatasX.push(valueDataX2);
                        valueDatasY.push(valueDataY1);
                        renderDatas.push(renderData);
                    }
                }
            }

            this.markValid("processDataPass");
        };

        this.updateRangeX = function() {
            if (this.isValid("updateRangeXPass")) {
                return;
            }

            this.invalidate("renderGraphicsPass");

            var valueDatasX = this._valueDatasX;
            var numValueDatasX = valueDatasX.length;
            var valueDataX1;
            var minimumX = Infinity;
            var maximumX = -Infinity;
            var i;

            for (i = 0; i < numValueDatasX; i++) {
                valueDataX1 = valueDatasX[i];
                if (valueDataX1.absolute < minimumX) {
                    minimumX = valueDataX1.absolute;
                }
                if (valueDataX1.absolute > maximumX) {
                    maximumX = valueDataX1.absolute;
                }
            }

            if (minimumX == Infinity) {
                // default range is current hour
                var now = new DateTime();
                now = now.toUTC();
                now.setMinutes(0);
                now.setSeconds(0);
                minimumX = now.getTime();
                maximumX = now.getTime() + 3600;
            }

            var containedRangeXChanged = ((minimumX != this._containedMinimumX) || (maximumX != this._containedMaximumX));

            this._containedMinimumX = minimumX;
            this._containedMaximumX = maximumX;

            var assignedMinimumX = this.getInternal("minimumX");
            if (!isNaN(assignedMinimumX)) {
                minimumX = assignedMinimumX;
            }

            var assignedMaximumX = this.getInternal("maximumX");
            if (!isNaN(assignedMaximumX)) {
                maximumX = assignedMaximumX;
            }

            if (minimumX > maximumX) {
                var temp = minimumX;
                minimumX = maximumX;
                maximumX = temp;
            }

            var rangeX = maximumX - minimumX;
            for (i = 0; i < numValueDatasX; i++) {
                valueDataX1 = valueDatasX[i];
                valueDataX1.relative = (rangeX > 0) ? (valueDataX1.absolute - minimumX) / rangeX : 0;
            }

            this._renderDatas.sort(_sortComparator);

            var rangeXChanged = ((minimumX != this._actualMinimumX) || (maximumX != this._actualMaximumX));

            this._actualMinimumX = minimumX;
            this._actualMaximumX = maximumX;
            this._actualRangeX = rangeX;

            this.markValid("updateRangeXPass");

            if (containedRangeXChanged) {
                this.fire("containedRangeXChanged", new EventData());
            }
            if (rangeXChanged) {
                this.fire("rangeXChanged", new EventData());
            }
        };

        this.updateRangeY = function() {
            if (this.isValid("updateRangeYPass")) {
                return;
            }

            this.invalidate("renderGraphicsPass");

            var valueDatasY = this._valueDatasY;
            var numValueDatasY = valueDatasY.length;
            var valueDataY1;
            var minimumY = Infinity;
            var maximumY = -Infinity;
            var i;

            for (i = 0; i < numValueDatasY; i++) {
                valueDataY1 = valueDatasY[i];
                if (valueDataY1.absolute < minimumY) {
                    minimumY = valueDataY1.absolute;
                }
                if (valueDataY1.absolute > maximumY) {
                    maximumY = valueDataY1.absolute;
                }
            }

            if (minimumY == Infinity) {
                // default range is 0-100
                minimumY = this.valueToAbsoluteY(0);
                maximumY = this.valueToAbsoluteY(100);
            } else {
                // extend range to round units
                var maxUnits = 50;
                var extendedMinimumY = minimumY;
                var extendedMaximumY = maximumY;
                var unit;
                var numUnits;
                for (i = 0; i < 2; i++) {
                    unit = this._computeAutoUnits(extendedMaximumY - extendedMinimumY);

                    // verify unit is greater than zero
                    if (unit <= 0) {
                        break;
                    }

                    // snap unit to integer if required
                    if ((extendedMaximumY - extendedMinimumY) >= 1) {
                        unit = Math.max(Math.round(unit), 1);
                    }

                    // scale unit if numUnits is greater than maxUnits
                    numUnits = 1 + Math.floor((extendedMaximumY - extendedMinimumY) / unit);
                    unit *= Math.ceil(numUnits / maxUnits);

                    // snap minimumY and maximumY to unit
                    extendedMinimumY = Math.ceil(minimumY / unit) * unit;
                    if (extendedMinimumY != minimumY) {
                        extendedMinimumY -= unit;
                    }
                    extendedMaximumY = Math.ceil(maximumY / unit) * unit;
                }
                minimumY = extendedMinimumY;
                maximumY = extendedMaximumY;
            }

            var containedRangeYChanged = ((minimumY != this._containedMinimumY) || (maximumY != this._containedMaximumY));

            this._containedMinimumY = minimumY;
            this._containedMaximumY = maximumY;

            var assignedMinimumY = this.getInternal("minimumY");
            if (!isNaN(assignedMinimumY)) {
                minimumY = this.valueToAbsoluteY(assignedMinimumY);
            }

            var assignedMaximumY = this.getInternal("maximumY");
            if (!isNaN(assignedMaximumY)) {
                maximumY = this.valueToAbsoluteY(assignedMaximumY);
            }

            if (minimumY > maximumY) {
                var temp = minimumY;
                minimumY = maximumY;
                maximumY = temp;
            }

            var rangeY = maximumY - minimumY;
            for (i = 0; i < numValueDatasY; i++) {
                valueDataY1 = valueDatasY[i];
                valueDataY1.relative = (rangeY > 0) ? (valueDataY1.absolute - minimumY) / rangeY : 0;
            }
            var scaleY = this._cachedScaleY;

            var rangeYChanged = ((minimumY != this._actualMinimumY) || (maximumY != this._actualMaximumY) || (scaleY != this._actualScaleY));

            this._actualMinimumY = minimumY;
            this._actualMaximumY = maximumY;
            this._actualRangeY = rangeY;
            this._actualScaleY = scaleY;

            this.markValid("updateRangeYPass");

            if (containedRangeYChanged) {
                this.fire("containedRangeYChanged", new EventData());
            }
            if (rangeYChanged) {
                this.fire("rangeYChanged", new EventData());
            }
        };

        this.valueToAbsoluteX = function(value) {
            if (value == null) {
                return NaN;
            }
            if (value instanceof DateTime) {
                return value.getTime();
            }
            if (value instanceof Date) {
                return (value.getTime() / 1000);
            }
            if (typeof value === "string") {
                if (!value) {
                    return NaN;
                }
                var num = Number(value);
                if (!isNaN(num)) {
                    return ((num > -Infinity) && (num < Infinity)) ? num : NaN;
                }
                var date = new DateTime(value);
                return date.getTime();
            }
            if (typeof value === "number") {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            }
            return NaN;
        };

        this.absoluteToValueX = function(absolute) {
            if ((absolute > -Infinity) && (absolute < Infinity)) {
                return (new DateTime(absolute)).toUTC();
            }
            return null;
        };

        this.absoluteToRelativeX = function(absolute) {
            return (absolute - this._actualMinimumX) / this._actualRangeX;
        };

        this.relativeToAbsoluteX = function(relative) {
            return this._actualMinimumX + this._actualRangeX * relative;
        };

        this.valueToAbsoluteY = function(value) {
            var scaleY = this._cachedScaleY;
            if (scaleY) {
                return scaleY.valueToScale(DataUtil.parseNumber(value));
            }
            return DataUtil.parseNumber(value);
        };

        this.absoluteToValueY = function(absolute) {
            if ((absolute > -Infinity) && (absolute < Infinity)) {
                var scaleY = this._cachedScaleY;
                if (scaleY) {
                    return scaleY.scaleToValue(Number(absolute));
                }
                return Number(absolute);
            }
            return NaN;
        };

        this.absoluteToRelativeY = function(absolute) {
            return (absolute - this._actualMinimumY) / this._actualRangeY;
        };

        this.relativeToAbsoluteY = function(relative) {
            return this._actualMinimumY + this._actualRangeY * relative;
        };

        this.getDataUnderPoint = function(x, y) {
            this.validate("renderGraphicsPass");

            if ((y < 0) || (y > this.getInternal("height"))) {
                return null;
            }

            var index = ArrayUtil.binarySearch(this._renderDatas, x / this.getInternal("width"), _searchComparator);
            if (index < 0) {
                return null;
            }

            var renderData = this._renderDatas[index];
            return { data: renderData.data, bounds: renderData.bounds };
        };

        // Protected Methods

        this.renderGraphicsOverride = function(graphics, width, height) {
            var valueDatasX = this._valueDatasX;
            var valueDatasY = this._valueDatasY;
            var renderDatas = this._renderDatas;
            var numValueDatasX = valueDatasX.length;
            var numValueDatasY = valueDatasY.length;
            var numRenderDatas = renderDatas.length;
            var valueDataX1;
            var valueDataX2;
            var valueDataY1;
            var valueDataY2;
            var renderData;
            var i;

            for (i = 0; i < numValueDatasX; i++) {
                valueDataX1 = valueDatasX[i];
                valueDataX1.pixel = Math.round(width * valueDataX1.relative);
            }

            for (i = 0; i < numValueDatasY; i++) {
                valueDataY1 = valueDatasY[i];
                valueDataY1.pixel = Math.round(height * (1 - valueDataY1.relative));
            }

            var zeroData = (valueDatasY.length > 0) ? valueDatasY[0] : null;
            var zeroPixel = zeroData ? zeroData.pixel : height;
            var brushBounds1 = new Rectangle(0, 0, width, zeroPixel);
            var brushBounds2 = new Rectangle(0, zeroPixel, width, height - zeroPixel);
            var brushBounds;
            var x1;
            var x2;
            var y1;
            var y2;
            var temp;

            var brush = this.getInternal("brush");
            if (!brush) {
                brush = new SolidFillBrush();
            }

            graphics.clear();

            for (i = 0; i < numRenderDatas; i++) {
                renderData = renderDatas[i];
                valueDataX1 = renderData.valueDataX1;
                valueDataX2 = renderData.valueDataX2;
                valueDataY1 = renderData.valueDataY1;
                valueDataY2 = renderData.valueDataY2;

                if ((Math.max(valueDataX1.relative, valueDataX2.relative) < 0) ||
                    (Math.min(valueDataX1.relative, valueDataX2.relative) > 1) ||
                    (Math.max(valueDataY1.relative, valueDataY2.relative) < 0) ||
                    (Math.min(valueDataY1.relative, valueDataY2.relative) > 1)) {
                    continue;
                }

                x1 = valueDataX1.pixel;
                x2 = valueDataX2.pixel;
                y1 = valueDataY1.pixel;
                y2 = valueDataY2.pixel;

                if (x1 < x2) {
                    x1++;
                } else {
                    x2++;
                }

                if (x1 == x2) {
                    if (valueDataX1.relative < valueDataX2.relative) {
                        x2++;
                    } else if (valueDataX1.relative > valueDataX2.relative) {
                        x2--;
                    }
                }

                if (y1 == y2) {
                    if (valueDataY1.relative < valueDataY2.relative) {
                        y1++;
                    } else if (valueDataY1.relative > valueDataY2.relative) {
                        y1--;
                    }
                }

                if (x1 > x2) {
                    temp = x1;
                    x1 = x2;
                    x2 = temp;
                }

                renderData.bounds = new Rectangle(x1, y1, x2 - x1, 0);

                brushBounds = (y1 <= y2) ? brushBounds1 : brushBounds2;

                brush.beginBrush(graphics, brushBounds);
                DrawingUtil.drawRectangle(brush, x1, y1, x2 - x1, y2 - y1);
                brush.endBrush();
            }
        };

        // Private Methods

        this._computeAutoUnits = function(range) {
            if (range <= 0) {
                return 0;
            }

            var significand = range / 10;
            var exponent = 0;

            if (significand > 0) {
                var str = significand.toExponential(20);
                var eIndex = str.indexOf("e");
                if (eIndex >= 0) {
                    significand = Number(str.substring(0, eIndex));
                    exponent = Number(str.substring(eIndex + 1, str.length));
                }
            }

            significand = Math.ceil(significand);

            if (significand > 5) {
                significand = 10;
            } else if (significand > 2) {
                significand = 5;
            }

            return significand * Math.pow(10, exponent);
        };

    });

});
