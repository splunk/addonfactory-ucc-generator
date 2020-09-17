define(function(require, exports, module){

    var Class = require("jg/Class");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var NumberUtil = require("jg/utils/NumberUtil");
    var Scale = require("splunk/scales/Scale");
    var DataUtil = require("splunk/utils/DataUtil");

    return Class(module.id, Scale, function(BinnedScale, base){

        // Private Static Methods

        var _computeUnits = function(min, max, binCount) {
            var binSize,
                binSizeStr,
                eIndex,
                significand,
                exponent;

            binSize = (max - min) / binCount;
            binSizeStr = binSize.toExponential(20);
            eIndex = binSizeStr.indexOf("e");
            significand = binSize;
            exponent = 0;

            if (eIndex >= 0) {
                significand = Number(binSizeStr.substring(0, eIndex));
                exponent = Number(binSizeStr.substring(eIndex + 1, binSizeStr.length));
            }

            return Math.ceil(significand) * Math.pow(10, exponent);
        };

        var _computeSnappedMinMax = function(min, max, binCount, origin, units) {
            var roughSnappedMin,
                roughSnappedMax,
                snappedRange,
                rawDataCenter,
                snappedMin,
                snappedMax,
                snappedOrigin;

            // calculate initial snappedMin and snappedMax
            roughSnappedMin = NumberUtil.floorTo(min, units);
            roughSnappedMax = NumberUtil.ceilTo(max, units);
            snappedRange = NumberUtil.ceilTo((roughSnappedMax - roughSnappedMin) / binCount, units) * binCount;
            rawDataCenter = min + ((max - min) / 2);
            snappedMin = NumberUtil.roundTo(rawDataCenter - snappedRange / 2, units);
            snappedMax = snappedMin + snappedRange;

            // if origin is outside the raw data, ensure snappedMin and snappedMax are on one side of it
            if (origin <= min) {
                snappedOrigin = NumberUtil.ceilTo(origin, units);

                if (snappedOrigin > snappedMin) {
                    snappedMin = snappedOrigin;
                    snappedMax = snappedMin + snappedRange;
                }
            } else if (origin >= max) {
                snappedOrigin = NumberUtil.floorTo(origin, units);

                if (snappedMax > snappedOrigin) {
                    snappedMax = snappedOrigin;
                    snappedMin = snappedMax - snappedRange;
                }
            }

            // ensure snappedMin and snappedMax still fits all the raw data
            if (snappedMin > roughSnappedMin) {
                snappedMin = roughSnappedMin;
                snappedMax = snappedMin + snappedRange;
            } else if (snappedMax < roughSnappedMax) {
                snappedMax = roughSnappedMax;
                snappedMin = roughSnappedMax - snappedRange;
            }

            return [NumberUtil.toPrecision(snappedMin, -1), NumberUtil.toPrecision(snappedMax, -1)];
        };

        // Public Properties

        this.binCount = new ObservableProperty("binCount", Number, 5)
            .writeFilter(function(value) {
                return (value < Infinity) ? Math.max(Math.floor(value), 1) : 5;
            })
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.origin = new ObservableProperty("origin", Number, 0)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : 0;
            })
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.units = new ObservableProperty("units", Number, NaN)
            .writeFilter(function(value) {
                return ((value > 0) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.includeOrigin = new ObservableProperty("includeOrigin", Boolean, false)
            .onChange(function(value){
                this.invalidate("computeValueMapPass");
            });

        this.snapToUnits = new ObservableProperty("snapToUnits", Boolean, false)
            .onChange(function(value){
                this.invalidate("computeValueMapPass");
            });

        this.divergent = new ObservableProperty("divergent", Boolean, false)
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.thresholds = new ObservableArrayProperty("thresholds", Number, [0])
            .readOnly(true);

        //Protected Properties

        this.isDiscreteScale = true;

        //Private Properties

        this._cachedThresholds = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);
            this._cachedThresholds = [0]; // prevents this from blowing up
        };

        // Protected Methods

        this.computeValueMapOverride = function(values) {
            var binCount = this.getInternal('binCount'),
                origin = this.getInternal('origin'),
                units = this.getInternal('units'),
                includeOrigin = this.getInternal('includeOrigin'),
                snapToUnits = this.getInternal('snapToUnits'),
                divergent = this.getInternal('divergent');

            var val, i, l,
                min = includeOrigin ? origin : Infinity,
                max = includeOrigin ? origin : -Infinity,
                diff,
                snappedMinMax,
                prevBins,
                newBins;

            // calculate the min and max value
            for (i = 0, l = values.length; i < l; i++) {
                val = values[i];
                if ((val > -Infinity) && (val < Infinity)) {
                    if (val < min) {
                        min = val;
                    }
                    if (val > max) {
                        max = val;
                    }
                }
            }

            // handles no valid values
            if (min === Infinity) {
                min = max = origin;
            }

            if (divergent) {
                diff = Math.max(origin - min, max - origin);
                min = origin - diff;
                max = origin + diff;
            }

            if (min === max) {
                min -= 1;
                max += 1;
            }

            if (snapToUnits) {
                // if user does not provide units, calculate units
                if (isNaN(units)) {
                    units = _computeUnits(min, max, binCount);
                }

                snappedMinMax = _computeSnappedMinMax(min, max, binCount, origin, units);
                min = snappedMinMax[0];
                max = snappedMinMax[1];
            }

            prevBins = this._cachedThresholds;
            newBins = [];

            for (i = 0, l = binCount + 1; i < l; i++) {
                // inline interpolate is more precise than NumberUtil.interpolate when run through NumbterUtil.toPrecision
                val = NumberUtil.toPrecision(min + (max - min) * (i / binCount), -1);
                newBins.push(val);
            }

            // if prevBins !== newBins, return true, else false
            if (prevBins.length !== newBins.length) {
                this._cachedThresholds = newBins;
                this.setInternal('thresholds', newBins);
                return true;
            } else {
                for(i = 0, l = newBins.length; i < l; i++) {
                    if (prevBins[i] !== newBins[i]) {
                        this._cachedThresholds = newBins;
                        this.setInternal('thresholds', newBins);
                        return true;
                    }
                }
                return false;
            }
        };

        this.computeContainedRangeOverride = function(containedRange) {
            var containedRangeMax = Math.max(this._cachedThresholds.length - 2, 0);
            return [0, containedRangeMax];
        };

        this.parseValueOverride = function(value) {
            return DataUtil.parseNumber(value);
        };

        this.valueToLinearOverride = function(value) {
            var bins = this._cachedThresholds,
                length = bins.length,
                min = bins[0],
                max = bins[length-1];

            if (value < min) {
                return -Infinity;
            }
            if (value > max) {
                return Infinity;
            }
            if (isNaN(value)) {
                return NaN;
            }
            var bucket = ArrayUtil.binarySearch(bins, value);
            if (bucket < 0) {
                bucket = -bucket - 2;
            }

            return NumberUtil.maxMin(bucket, length - 2, 0);
        };

        this.linearToValueOverride = function(linear) {
            linear = Math.floor(linear);

            if (linear < 0) {
                return -Infinity;
            } else if (linear > Math.max(this._cachedThresholds.length - 2, 0)) {
                return Infinity;
            } else if (isNaN(linear)) {
                return NaN;
            } else {
                return this._cachedThresholds[linear];
            }
        };
    });
});
