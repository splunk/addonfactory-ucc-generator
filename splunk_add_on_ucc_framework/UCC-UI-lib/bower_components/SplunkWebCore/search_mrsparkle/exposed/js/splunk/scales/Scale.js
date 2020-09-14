define(function(require, exports, module) {

    var Class = require("jg/Class");
    var MPassTarget = require("jg/async/MPassTarget");
    var Pass = require("jg/async/Pass");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var MEventTarget = require("jg/events/MEventTarget");
    var MListenerTarget = require("jg/events/MListenerTarget");
    var MObservableTarget = require("jg/events/MObservableTarget");
    var MPropertyTarget = require("jg/properties/MPropertyTarget");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var Map = require("jg/utils/Map");
    var NumberUtil = require("jg/utils/NumberUtil");

    return Class(module.id, Object, function(Scale, base) {

        Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget, MPassTarget);

        // Private Static Methods

        var _isNumberArray = function(value) {
            if ((value == null) || !Class.isArray(value)) {
                return false;
            }

            var item;
            for (var i = 0, l = value.length; i < l; i++) {
                item = value[i];
                if ((item != null) && !Class.isNumber(item)) {
                    return false;
                }
            }

            return true;
        };

        // Public Passes

        this.computeValueMapPass = new Pass("computeValueMap", 0.11);
        this.computeContainedRangePass = new Pass("computeContainedRange", 0.12);
        this.computeExtendedRangePass = new Pass("computeExtendedRange", 0.13);
        this.computeScaleMapPass = new Pass("computeScaleMap", 0.14);

        // Public Events

        this.valueMapChange = new ChainedEvent("valueMapChange", this.change);
        this.scaleMapChange = new ChainedEvent("scaleMapChange", this.change);

        // Public Properties

        this.valueFormatter = new ObservableProperty("valueFormatter", Function, null)
            .setter(function(value) {
                this._valueFormatter = value;
            });

        this.reverse = new ObservableProperty("reverse", Boolean, false)
            .onChange(function(e) {
                this.invalidate("computeScaleMapPass");
            });

        this.minimum = new ObservableProperty("minimum", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("computeScaleMapPass");
            });

        this.maximum = new ObservableProperty("maximum", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("computeScaleMapPass");
            });

        this.containedMinimum = new ObservableProperty("containedMinimum", Number, 0)
            .readOnly(true);

        this.containedMaximum = new ObservableProperty("containedMaximum", Number, 0)
            .readOnly(true);

        this.extendedMinimum = new ObservableProperty("extendedMinimum", Number, 0)
            .readOnly(true);

        this.extendedMaximum = new ObservableProperty("extendedMaximum", Number, 0)
            .readOnly(true);

        this.actualMinimum = new ObservableProperty("actualMinimum", Number, 0)
            .readOnly(true);

        this.actualMaximum = new ObservableProperty("actualMaximum", Number, 0)
            .readOnly(true);

        this.isDiscreteScale = false;

        // Private Properties

        this._valueFormatter = null;
        this._rangeMap = null;
        this._rangeList = null;
        this._actualMinimum = 0;
        this._actualMaximum = 0;
        this._reverse = false;

        // Constructor

        this.constructor = function() {
            this._rangeMap = new Map();
            this._rangeList = [];
        };

        // Public Methods

        this.dispose = function() {
            var keys = this._rangeMap.keys();
            for (var i = 0, l = keys.length; i < l; i++) {
                this.unregister(keys[i]);
            }

            this.markValid();
            this.listenOff();
            this.off();
        };

        this.register = function(key) {
            if (key == null) {
                throw new Error("Parameter key must be non-null.");
            }

            var rangeInfo = this._rangeMap.get(key);
            if (rangeInfo) {
                return this;
            }

            rangeInfo = { values: null, containedRange: null, extendedRange: null };
            this._rangeMap.set(key, rangeInfo);
            this._rangeList.push(rangeInfo);

            return this;
        };

        this.unregister = function(key) {
            if (key == null) {
                throw new Error("Parameter key must be non-null.");
            }

            var rangeInfo = this._rangeMap.get(key);
            if (!rangeInfo) {
                return this;
            }

            var index = ArrayUtil.indexOf(this._rangeList, rangeInfo);
            this._rangeList.splice(index, 1);
            this._rangeMap.del(key);

            if (rangeInfo.values) {
                this.invalidate("computeValueMapPass");
            } else if (rangeInfo.containedRange) {
                this.invalidate("computeContainedRangePass");
            } else if (rangeInfo.extendedRange) {
                this.invalidate("computeExtendedRangePass");
            }

            return this;
        };

        this.setValues = function(key, values) {
            if (key == null) {
                throw new Error("Parameter key must be non-null.");
            } else if ((values != null) && !Class.isArray(values)) {
                throw new Error("Parameter values must be of type Array.");
            }

            var rangeInfo = this._rangeMap.get(key);
            if (!rangeInfo) {
                return this;
            }

            var valueCount = values ? values.length : 0;
            if (valueCount > 0) {
                values = values.concat();
                for (var i = 0; i < valueCount; i++) {
                    values[i] = this.parseValueOverride(values[i]);
                }
            } else {
                values = null;
            }

            rangeInfo.values = values;

            this.invalidate("computeValueMapPass");

            return this;
        };

        this.setContainedRange = function(key, containedRange) {
            if (key == null) {
                throw new Error("Parameter key must be non-null.");
            } else if ((containedRange != null) && !_isNumberArray(containedRange)) {
                throw new Error("Parameter containedRange must be of type Array<Number>.");
            }

            var rangeInfo = this._rangeMap.get(key);
            if (!rangeInfo) {
                return this;
            }

            var min = Infinity;
            var max = -Infinity;

            if (containedRange) {
                var num;
                for (var i = 0, l = containedRange.length; i < l; i++) {
                    num = containedRange[i];
                    if ((num != null) && (num > -Infinity) && (num < Infinity)) {
                        if (num < min) {
                            min = num;
                        }
                        if (num > max) {
                            max = num;
                        }
                    }
                }
            }

            if (min < max) {
                rangeInfo.containedRange = [ min, max ];
            } else if (min === max) {
                rangeInfo.containedRange = [ min ];
            } else {
                rangeInfo.containedRange = null;
            }

            this.invalidate("computeContainedRangePass");

            return this;
        };

        this.setExtendedRange = function(key, extendedRange) {
            if (key == null) {
                throw new Error("Parameter key must be non-null.");
            } else if ((extendedRange != null) && !_isNumberArray(extendedRange)) {
                throw new Error("Parameter extendedRange must be of type Array<Number>.");
            }

            var rangeInfo = this._rangeMap.get(key);
            if (!rangeInfo) {
                return this;
            }

            var min = Infinity;
            var max = -Infinity;

            if (extendedRange) {
                var num;
                for (var i = 0, l = extendedRange.length; i < l; i++) {
                    num = extendedRange[i];
                    if ((num != null) && (num > -Infinity) && (num < Infinity)) {
                        if (num < min) {
                            min = num;
                        }
                        if (num > max) {
                            max = num;
                        }
                    }
                }
            }

            if (min < max) {
                rangeInfo.extendedRange = [ min, max ];
            } else if (min === max) {
                rangeInfo.extendedRange = [ min ];
            } else {
                rangeInfo.extendedRange = null;
            }

            this.invalidate("computeExtendedRangePass");

            return this;
        };

        this.valueToLinear = function(value) {
            return +this.valueToLinearOverride(this.parseValueOverride(value));
        };

        this.linearToValue = function(linear) {
            return this.linearToValueOverride(+linear);
        };

        this.linearToScale = function(linear, discrete) {
            linear = +linear;

            var scale;
            if ((linear > -Infinity) && (linear < Infinity)) {
                var min = this._actualMinimum;
                var max = this._actualMaximum;
                if ((discrete === true) && this.isDiscreteScale) {
                    min = Math.floor(min);
                    max = Math.ceil(max);
                }
                var span = max - min;
                scale = ((span > 0) || (linear !== min)) ? NumberUtil.toPrecision((linear - min) / span, -1) : 0.5;
            } else {
                scale = linear;
            }

            if (this._reverse) {
                scale = 1 - scale;
            }

            return scale;
        };

        this.scaleToLinear = function(scale, discrete) {
            scale = +scale;

            if (this._reverse) {
                scale = 1 - scale;
            }

            var linear;
            if ((scale > -Infinity) && (scale < Infinity)) {
                var min = this._actualMinimum;
                var max = this._actualMaximum;
                if ((discrete === true) && this.isDiscreteScale) {
                    min = Math.floor(min);
                    max = Math.ceil(max);
                }
                var span = max - min;
                linear = NumberUtil.toPrecision(min + span * scale, -1);
            } else {
                linear = scale;
            }

            return linear;
        };

        this.valueToScale = function(value, discrete) {
            return this.linearToScale(this.valueToLinear(value), discrete);
        };

        this.scaleToValue = function(scale, discrete) {
            return this.linearToValue(this.scaleToLinear(scale, discrete));
        };

        this.discreteSpan = function() {
            if (!this.isDiscreteScale) {
                return NaN;
            }

            var min = Math.floor(this._actualMinimum);
            var max = Math.ceil(this._actualMaximum);
            return max - min;
        };

        this.getMajorTickValues = function() {
            // TODO: implement
        };

        this.getMinorTickValues = function() {
            // TODO: implement
        };

        this.formatValue = function(value) {
            value = this.parseValueOverride(value);

            if (this._valueFormatter) {
                return this._valueFormatter(value);
            }

            return this.formatValueOverride(value);
        };

        this.computeValueMap = function() {
            if (this.isValid("computeValueMapPass")) {
                return;
            }

            this.invalidate("computeContainedRangePass");

            var values = [];
            var rangeList = this._rangeList;
            var rangeInfo;

            for (var i = 0, l = rangeList.length; i < l; i++) {
                rangeInfo = rangeList[i];
                if (rangeInfo.values) {
                    values = values.concat(rangeInfo.values);
                }
            }

            var changed = this.computeValueMapOverride(values);
            if (changed == null) {
                throw new Error("Value returned from computeValueMapOverride must be non-null.");
            } else if (!Class.isBoolean(changed)) {
                throw new Error("Value returned from computeValueMapOverride must be of type Boolean.");
            }

            if (changed) {
                this.fire("valueMapChange");
            }

            this.markValid("computeValueMapPass");
        };

        this.computeContainedRange = function() {
            if (this.isValid("computeContainedRangePass")) {
                return;
            }

            this.invalidate("computeExtendedRangePass");

            var min = Infinity;
            var max = -Infinity;
            var rangeList = this._rangeList;
            var range;
            var num;
            var i, l;
            var ri, rl;

            for (i = 0, l = rangeList.length; i < l; i++) {
                range = rangeList[i].containedRange;
                if (range) {
                    for (ri = 0, rl = range.length; ri < rl; ri++) {
                        num = range[ri];
                        if (num < min) {
                            min = num;
                        }
                        if (num > max) {
                            max = num;
                        }
                    }
                }
            }

            if (min < max) {
                range = [ min, max ];
            } else if (min === max) {
                range = [ min ];
            } else {
                range = [];
            }

            range = this.computeContainedRangeOverride(range);
            if (range == null) {
                throw new Error("Value returned from computeContainedRangeOverride must be non-null.");
            } else if (!_isNumberArray(range)) {
                throw new Error("Value returned from computeContainedRangeOverride must be of type Array<Number>.");
            }

            for (i = 0, l = range.length; i < l; i++) {
                num = range[i];
                if ((num != null) && (num > -Infinity) && (num < Infinity)) {
                    if (num < min) {
                        min = num;
                    }
                    if (num > max) {
                        max = num;
                    }
                }
            }

            if (min === Infinity) {
                min = max = 0;
            }

            this.setInternal("containedMinimum", min);
            this.setInternal("containedMaximum", max);

            this.markValid("computeContainedRangePass");
        };

        this.computeExtendedRange = function() {
            if (this.isValid("computeExtendedRangePass")) {
                return;
            }

            this.invalidate("computeScaleMapPass");

            var min = this.getInternal("containedMinimum");
            var max = this.getInternal("containedMaximum");
            var rangeList = this._rangeList;
            var range;
            var num;
            var i, l;
            var ri, rl;

            for (i = 0, l = rangeList.length; i < l; i++) {
                range = rangeList[i].extendedRange;
                if (range) {
                    for (ri = 0, rl = range.length; ri < rl; ri++) {
                        num = range[ri];
                        if (num < min) {
                            min = num;
                        }
                        if (num > max) {
                            max = num;
                        }
                    }
                }
            }

            if (min < max) {
                range = [ min, max ];
            } else if (min === max) {
                range = [ min ];
            } else {
                range = [];
            }

            range = this.computeExtendedRangeOverride(range);
            if (range == null) {
                throw new Error("Value returned from computeExtendedRangeOverride must be non-null.");
            } else if (!_isNumberArray(range)) {
                throw new Error("Value returned from computeExtendedRangeOverride must be of type Array<Number>.");
            }

            for (i = 0, l = range.length; i < l; i++) {
                num = range[i];
                if ((num != null) && (num > -Infinity) && (num < Infinity)) {
                    if (num < min) {
                        min = num;
                    }
                    if (num > max) {
                        max = num;
                    }
                }
            }

            this.setInternal("extendedMinimum", min);
            this.setInternal("extendedMaximum", max);

            this.markValid("computeExtendedRangePass");
        };

        this.computeScaleMap = function() {
            if (this.isValid("computeScaleMapPass")) {
                return;
            }

            var min = this.getInternal("minimum");
            if (isNaN(min)) {
                min = this.getInternal("extendedMinimum");
            }

            var max = this.getInternal("maximum");
            if (isNaN(max)) {
                max = this.getInternal("extendedMaximum");
            }

            if (min > max) {
                var temp = min;
                min = max;
                max = temp;
            }

            var reverse = this.getInternal("reverse");

            if ((min !== this._actualMinimum) || (max !== this._actualMaximum) || (reverse !== this._reverse)) {
                this._actualMinimum = min;
                this._actualMaximum = max;
                this._reverse = reverse;

                this.setInternal("actualMinimum", min);
                this.setInternal("actualMaximum", max);

                this.fire("scaleMapChange");
            }

            this.markValid("computeScaleMapPass");
        };

        // Protected Methods

        this.computeValueMapOverride = function(values) {
            return false;
        };

        this.computeContainedRangeOverride = function(containedRange) {
            return [];
        };

        this.computeExtendedRangeOverride = function(extendedRange) {
            return [];
        };

        this.parseValueOverride = function(value) {
            return value;
        };

        this.formatValueOverride = function(value) {
            return String(value);
        };

        this.valueToLinearOverride = function(value) {
            return NaN;
        };

        this.linearToValueOverride = function(linear) {
            return null;
        };

    });

});
