define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var Scale = require("splunk/scales/Scale");
    var DataUtil = require("splunk/utils/DataUtil");

    return Class(module.id, Scale, function(ThresholdScale, base) {

        // Public Properties

        this.thresholds = new ObservableArrayProperty("thresholds", Number, [])
            .itemWriteFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : 0;
            })
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.actualThresholds = new ObservableArrayProperty("actualThresholds", Number, [])
            .readOnly(true);

        this.isDiscreteScale = true;

        // Private Properties

        this._cachedThresholds = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this._cachedThresholds = [];
        };

        // Protected Methods

        this.computeValueMapOverride = function(values) {
            var thresholds = this.getInternal("thresholds");
            var threshold;
            var i, l;

            var oldThresholds = this._cachedThresholds;
            var newThresholds = [];
            var max = -Infinity;

            for (i = 0, l = thresholds.length; i < l; i++) {
                threshold = thresholds[i];
                if (threshold > max) {
                    max = threshold;
                } else {
                    threshold = max;
                }
                newThresholds.push(threshold);
            }

            var changed = false;
            if (oldThresholds.length !== newThresholds.length) {
                changed = true;
            } else {
                for (i = 0, l = oldThresholds.length; i < l; i++) {
                    if (oldThresholds[i] !== newThresholds[i]) {
                        changed = true;
                        break;
                    }
                }
            }

            if (!changed) {
                return false;
            }

            this._cachedThresholds = newThresholds;
            this.setInternal("actualThresholds", newThresholds);

            return true;
        };

        this.computeContainedRangeOverride = function(containedRange) {
            return [0, this._cachedThresholds.length];
        };

        this.parseValueOverride = function(value) {
            return DataUtil.parseNumber(value);
        };

        this.valueToLinearOverride = function(value) {
            if (isNaN(value)) {
                return NaN;
            }

            var index = ArrayUtil.binarySearch(this._cachedThresholds, value);
            if (index < 0) {
                index = -index - 1;
            } else {
                index++;
                // make sure we use the last occurance
                for (index; index < this._cachedThresholds.length; index++) {
                    if (this._cachedThresholds[index] !== value) {
                        break;
                    }
                }
            }

            return index;
        };

        this.linearToValueOverride = function(linear) {
            if (isNaN(linear)) {
                return NaN;
            }

            linear = Math.floor(linear) - 1;
            if (linear < 0) {
                return -Infinity;
            } else if (linear >= this._cachedThresholds.length) {
                return Infinity;
            } else {
                return this._cachedThresholds[linear];
            }
        };

    });

});
