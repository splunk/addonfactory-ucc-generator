define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Property = require("jg/properties/Property");
    var Scale = require("splunk/scales/Scale");
    var DataUtil = require("splunk/utils/DataUtil");

    return Class(module.id, Scale, function(LinearScale, base) {

        // Public Properties

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

        this._valueMin = 0;
        this._valueMax = 0;

        // Protected Methods

        this.computeValueMapOverride = function(values) {
            var min = Infinity;
            var max = -Infinity;
            var num;

            for (var i = 0, l = values.length; i < l; i++) {
                num = values[i];
                if ((num > -Infinity) && (num < Infinity)) {
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

            this._valueMin = min;
            this._valueMax = max;

            return false;
        };

        this.computeContainedRangeOverride = function(containedRange) {
            var min = this._valueMin;
            var max = this._valueMax;

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
            return value;
        };

        this.linearToValueOverride = function(linear) {
            return linear;
        };

    });

});
