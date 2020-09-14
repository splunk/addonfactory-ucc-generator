define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableEnumProperty = require("jg/properties/ObservableEnumProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Property = require("jg/properties/Property");
    var NumberUtil = require("jg/utils/NumberUtil");
    var Scale = require("splunk/scales/Scale");
    var DataUtil = require("splunk/utils/DataUtil");

    return Class(module.id, Scale, function(LogScale, base) {

        // Public Properties

        this.base = new ObservableProperty("base", Number, 10)
            .writeFilter(function(value) {
                return (value < Infinity) ? Math.max(Math.floor(value), 2) : 10;
            })
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.sign = new ObservableEnumProperty("sign", String, [ "auto", "positive", "negative" ])
            .onChange(function(e) {
                this.invalidate("computeValueMapPass");
            });

        this.includeOrigin = new ObservableProperty("includeOrigin", Boolean, false)
            .onChange(function(e) {
                this.invalidate("computeContainedRangePass");
            });

        this.minimumNumber = new Property("minimumNumber", Number)
            .getter(function() {
                return this.linearToValue(this.get("minimum"));
            })
            .setter(function(value) {
                this.set("minimum", this.valueToLinear(value));
            });

        this.maximumNumber = new Property("maximumNumber", Number)
            .getter(function() {
                return this.linearToValue(this.get("maximum"));
            })
            .setter(function(value) {
                this.set("maximum", this.valueToLinear(value));
            });

        this.containedMinimumNumber = new Property("containedMinimumNumber", Number)
            .readOnly(true)
            .getter(function() {
                return this.linearToValue(this.get("containedMinimum"));
            });

        this.containedMaximumNumber = new Property("containedMaximumNumber", Number)
            .readOnly(true)
            .getter(function() {
                return this.linearToValue(this.get("containedMaximum"));
            });

        this.extendedMinimumNumber = new Property("extendedMinimumNumber", Number)
            .readOnly(true)
            .getter(function() {
                return this.linearToValue(this.get("extendedMinimum"));
            });

        this.extendedMaximumNumber = new Property("extendedMaximumNumber", Number)
            .readOnly(true)
            .getter(function() {
                return this.linearToValue(this.get("extendedMaximum"));
            });

        this.actualMinimumNumber = new Property("actualMinimumNumber", Number)
            .readOnly(true)
            .getter(function() {
                return this.linearToValue(this.get("actualMinimum"));
            });

        this.actualMaximumNumber = new Property("actualMaximumNumber", Number)
            .readOnly(true)
            .getter(function() {
                return this.linearToValue(this.get("actualMaximum"));
            });

        // Private Properties

        this._logBase = Math.log(10);
        this._signScalar = 1;
        this._valueMin = 1;
        this._valueMax = 1;

        // Constructor

        this.constructor = function(baseValue, sign) {
            base.constructor.call(this);

            if (baseValue != null) {
                this.set("base", baseValue);
            }
            if (sign != null) {
                this.set("sign", sign);
            }
        };

        // Protected Methods

        this.computeValueMapOverride = function(values) {
            var logBase = Math.log(this.getInternal("base"));
            var sign = this.getInternal("sign");
            var signScalar;
            var positiveCount = 0;
            var positiveMin = Infinity;
            var positiveMax = 0;
            var negativeCount = 0;
            var negativeMin = 0;
            var negativeMax = -Infinity;
            var num;

            for (var i = 0, l = values.length; i < l; i++) {
                num = values[i];
                if ((num > 0) && (num < Infinity)) {
                    positiveCount++;
                    if (num < positiveMin) {
                        positiveMin = num;
                    }
                    if (num > positiveMax) {
                        positiveMax = num;
                    }
                } else if ((num < 0) && (num > -Infinity)) {
                    negativeCount++;
                    if (num < negativeMin) {
                        negativeMin = num;
                    }
                    if (num > negativeMax) {
                        negativeMax = num;
                    }
                }
            }

            if (sign === "auto") {
                signScalar = (positiveCount >= negativeCount) ? 1 : -1;
            } else if (sign === "positive") {
                signScalar = 1;
            } else {
                signScalar = -1;
            }

            if (signScalar > 0) {
                this._valueMin = (positiveMin !== Infinity) ? positiveMin : signScalar;
                this._valueMax = (positiveMax !== 0) ? positiveMax : signScalar;
            } else {
                this._valueMin = (negativeMin !== 0) ? negativeMin : signScalar;
                this._valueMax = (negativeMax !== -Infinity) ? negativeMax : signScalar;
            }

            if ((logBase === this._logBase) && (signScalar === this._signScalar)) {
                return false;
            }

            // TODO: can possibly resolve minimumNumber/maximumNumber/minimum/maximum here
            // by recording current minimumNumber/maximumNumber, assigning base and scalar
            // then recomputing and reassigning minimum/maximum based on the recorded minimumNumber/maximumNumber
            // we may need to override the minimum/maximum property definitions themselves to keep the properties in sync
            // can probably leverage onWrite to handle syncing

            this._logBase = logBase;
            this._signScalar = signScalar;

            return true;
        };

        this.computeContainedRangeOverride = function(containedRange) {
            var min = this.valueToLinearOverride(this._valueMin);
            var max = this.valueToLinearOverride(this._valueMax);

            if (this.getInternal("includeOrigin")) {
                if (min > 0) {
                    min = 0;
                }
                if (max < 0) {
                    max = 0;
                }
            }

            return [ min, max ];
        };

        this.computeExtendedRangeOverride = function(extendedRange) {
            // TODO: handle unit snapping

            return [];
        };

        this.parseValueOverride = function(value) {
            return DataUtil.parseNumber(value);
        };

        this.valueToLinearOverride = function(value) {
            value *= this._signScalar;
            value = Math.log(value) / this._logBase;
            value = NumberUtil.toPrecision(value, -1);
            value *= this._signScalar;

            return value;
        };

        this.linearToValueOverride = function(linear) {
            linear *= this._signScalar;
            linear = Math.exp(linear * this._logBase);
            linear = NumberUtil.toPrecision(linear, -1);
            linear *= this._signScalar;

            return linear;
        };

    });

});
