define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableEnumProperty = require("jg/properties/ObservableEnumProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var NumberUtil = require("jg/utils/NumberUtil");
    var Scale = require("splunk/scales/Scale");
    var DataUtil = require("splunk/utils/DataUtil");

    return Class(module.id, Scale, function(MinMidMaxScale, base) {

        // Private Static Methods

        var _computeActualValue = function(type, value, defaultValue, values, min, max) {
            if (isNaN(value)) {
                return defaultValue;
            } else if (type === "percent") {
                var ratio = NumberUtil.minMax(value / 100, 0, 1);
                return min + (max - min) * ratio;
            } else if (type === "percentile") {
                var maxIndex = values.length - 1;
                if (maxIndex < 0) {
                    return defaultValue;
                }
                var indexFloat = NumberUtil.minMax(maxIndex * (value / 100), 0, maxIndex);
                var index1 = Math.floor(indexFloat);
                var index2 = Math.min(index1 + 1, maxIndex);
                return values[index1] + (values[index2] - values[index1]) * (indexFloat - index1);
            } else {
                return value;
            }
        };

        var _numberComparator = function(num1, num2) {
            return num1 - num2;
        };

        // Public Properties

        this.minType = new ObservableEnumProperty("minType", String, [ "number", "percent", "percentile" ])
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.minValue = new ObservableProperty("minValue", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.midType = new ObservableEnumProperty("midType", String, [ "number", "percent", "percentile" ])
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.midValue = new ObservableProperty("midValue", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.maxType = new ObservableEnumProperty("maxType", String, [ "number", "percent", "percentile" ])
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.maxValue = new ObservableProperty("maxValue", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.actualMinValue = new ObservableProperty("actualMinValue", Number, 0)
            .readOnly(true);

        this.actualMidValue = new ObservableProperty("actualMidValue", Number, 0)
            .readOnly(true);

        this.actualMaxValue = new ObservableProperty("actualMaxValue", Number, 0)
            .readOnly(true);

        // Private Properties

        this._cachedMinValue = 0;
        this._cachedMidValue = 0;
        this._cachedMaxValue = 0;

        // Protected Methods

        this.computeValueMapOverride = function(values) {
            var minType = this.getInternal("minType");
            var minValue = this.getInternal("minValue");
            var midType = this.getInternal("midType");
            var midValue = this.getInternal("midValue");
            var maxType = this.getInternal("maxType");
            var maxValue = this.getInternal("maxValue");

            var sortedValues = [];
            var min = Infinity;
            var max = -Infinity;
            var value;

            for (var i = 0, l = values.length; i < l; i++) {
                value = values[i];
                if ((value > -Infinity) && (value < Infinity)) {
                    sortedValues.push(value);
                    if (value < min) {
                        min = value;
                    }
                    if (value > max) {
                        max = value;
                    }
                }
            }

            sortedValues.sort(_numberComparator);
            if (min > max) {
                min = max = 0;
            }

            minValue = _computeActualValue(minType, minValue, min, sortedValues, min, max);

            maxValue = _computeActualValue(maxType, maxValue, max, sortedValues, min, max);
            maxValue = Math.max(maxValue, minValue);

            midValue = _computeActualValue(midType, midValue, minValue + (maxValue - minValue) / 2, sortedValues, min, max);
            minValue = Math.min(minValue, midValue);
            maxValue = Math.max(maxValue, midValue);

            if ((minValue === this._cachedMinValue) && (midValue === this._cachedMidValue) && (maxValue === this._cachedMaxValue)) {
                return false;
            }

            this._cachedMinValue = minValue;
            this._cachedMidValue = midValue;
            this._cachedMaxValue = maxValue;

            this.setInternal("actualMinValue", minValue);
            this.setInternal("actualMidValue", midValue);
            this.setInternal("actualMaxValue", maxValue);

            return true;
        };

        this.computeContainedRangeOverride = function(containedRange) {
            return [ -1, 1 ];
        };

        this.parseValueOverride = function(value) {
            return DataUtil.parseNumber(value);
        };

        this.valueToLinearOverride = function(value) {
            if (value <= this._cachedMinValue) {
                return -1;
            } else if (value >= this._cachedMaxValue) {
                return 1;
            } else if (value === this._cachedMidValue) {
                return 0;
            } else if (value < this._cachedMidValue) {
                return (value - this._cachedMidValue) / (this._cachedMidValue - this._cachedMinValue);
            } else if (value > this._cachedMidValue) {
                return (value - this._cachedMidValue) / (this._cachedMaxValue - this._cachedMidValue);
            } else {
                return NaN;
            }
        };

        this.linearToValueOverride = function(linear) {
            if (linear <= -1) {
                return this._cachedMinValue;
            } else if (linear >= 1) {
                return this._cachedMaxValue;
            } else if (linear === 0) {
                return this._cachedMidValue;
            } else if (linear < 0) {
                return this._cachedMidValue + (this._cachedMidValue - this._cachedMinValue) * linear;
            } else if (linear > 0) {
                return this._cachedMidValue + (this._cachedMaxValue - this._cachedMidValue) * linear;
            } else {
                return NaN;
            }
        };

    });

});
