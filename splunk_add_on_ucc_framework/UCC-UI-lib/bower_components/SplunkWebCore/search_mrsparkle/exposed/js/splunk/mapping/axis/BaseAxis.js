define(function(require, exports, module) {

    var Class = require("jg/Class");
    var MPassTarget = require("jg/async/MPassTarget");
    var Pass = require("jg/async/Pass");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var EventData = require("jg/events/EventData");
    var MEventTarget = require("jg/events/MEventTarget");
    var MListenerTarget = require("jg/events/MListenerTarget");
    var MObservableTarget = require("jg/events/MObservableTarget");
    var MPropertyTarget = require("jg/properties/MPropertyTarget");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Map = require("jg/utils/Map");

    return Class(module.id, Object, function(BaseAxis, base) {

        Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget, MPassTarget);

        // Public Passes

        this.processContainedValuesPass = new Pass("processContainedValues", 0.11);
        this.processContainedRangePass = new Pass("processContainedRange", 0.12);
        this.processExtendedRangePass = new Pass("processExtendedRange", 0.13);
        this.processActualRangePass = new Pass("processActualRange", 0.14);

        // Public Events

        this.absoluteMapChanged = new ChainedEvent("absoluteMapChanged", this.change);
        this.relativeMapChanged = new ChainedEvent("relativeMapChanged", this.change);

        // Public Properties

        this.minimum = new ObservableProperty("minimum", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                    this.invalidate("processActualRangePass");
            });

        this.maximum = new ObservableProperty("maximum", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("processActualRangePass");
            });

        this.preliminaryMinimum = new ObservableProperty("preliminaryMinimum", Number, Infinity)
            .readOnly(true);

        this.preliminaryMaximum = new ObservableProperty("preliminaryMaximum", Number, -Infinity)
            .readOnly(true);

        this.containedMinimum = new ObservableProperty("containedMinimum", Number,Infinity)
            .readOnly(true);

        this.containedMaximum = new ObservableProperty("containedMaximum", Number, -Infinity)
            .readOnly(true);

        this.extendedMinimum = new ObservableProperty("extendedMinimum", Number, Infinity)
            .readOnly(true);

        this.extendedMaximum = new ObservableProperty("extendedMaximum", Number, -Infinity)
            .readOnly(true);

        this.actualMinimum = new ObservableProperty("actualMinimum", Number, Infinity)
            .readOnly(true);

        this.actualMaximum = new ObservableProperty("actualMaximum", Number, -Infinity)
            .readOnly(true);

        // Private Properties

        this._vizStore = null;
        this._actualMaximum = 0;
        this._actualMinimum = 0;

        // Constructor

        this.constructor = function() {
            this._vizStore = new Map();
        };

        // Public Methods

        this.register = function(key) {
            if (!this._vizStore.has(key)) {
                this._vizStore.set(key, {values: [], extendedRange: {absolute1: NaN, absolute2: NaN}, containedRange: {absolute1: NaN, absolute2: NaN}});
            }
        };

        this.unregister = function(key) {
            if (this._vizStore.has(key)) {
                this._vizStore.del(key);
                this.invalidate(this.processContainedRangePass);
            }
        };

        this.provideContainedValues = function(key, values) {
            var viz = this._vizStore.get(key);
            if (viz) {
                //store copy of values, create copy using slice
                viz.values = values.slice();
                this._vizStore.set(key, viz);
                this.invalidate(this.processContainedValuesPass);
            }
        };

        this.provideContainedRange = function(key, min, max) {
            var viz = this._vizStore.get(key);
            if (min > max) {
                var tempMax = max;
                max = min;
                min = tempMax;
            }
            if (viz) {
                viz.containedRange.absolute1 = min;
                viz.containedRange.absolute2 = max;
                this.invalidate(this.processContainedRangePass);
            }
        };

        this.provideExtendedRange = function(key, min, max) {
            var viz = this._vizStore.get(key);
            if (min > max) {
                var tempMax = max;
                max = min;
                min = tempMax;
            }
            if (viz) {
                viz.extendedRange.absolute1 = min;
                viz.extendedRange.absolute2 = max;
                this.invalidate(this.processExtendedRangePass);
            }
        };

        this.processContainedValues = function() {
            var i,
                visualizations = this._vizStore.values(),
                values = [],
                preliminaryMinimum = Infinity,
                preliminaryMaximum = -Infinity;

            for (i = 0; i < visualizations.length; i++) {
                values = values.concat(visualizations[i].values);
            }
            values = this.processValues(values);
            for (i = 0; i < values.length; i++) {
                var currentValue = this.valueToAbsolute(values[i]);
                if (currentValue < preliminaryMinimum) {
                    preliminaryMinimum = currentValue;
                }
                if (currentValue  > preliminaryMaximum) {
                    preliminaryMaximum = currentValue;
                }
            }
            this.setInternal("preliminaryMinimum", preliminaryMinimum);
            this.setInternal("preliminaryMaximum", preliminaryMaximum);
            this.invalidate("processContainedRangePass");
        };

        this.processContainedRange = function() {
            var previousComputedMinimum = this.getInternal("preliminaryMinimum"),
                previousComputedMaximum = this.getInternal("preliminaryMaximum"),
                values = this._vizStore.values();
            for (var i = 0; i < values.length; i++) {
                if (values[i].containedRange.absolute1 < previousComputedMinimum) {
                    previousComputedMinimum = values[i].containedRange.absolute1;
                }
                if (values[i].containedRange.absolute2 > previousComputedMaximum) {
                    previousComputedMaximum = values[i].containedRange.absolute2;
                }
            }
            this.setInternal("containedMaximum", previousComputedMaximum);
            this.setInternal("containedMinimum", previousComputedMinimum);
            this.invalidate("processExtendedRangePass");
        };

        this.processExtendedRange = function() {
            var previousContainedMinimum = this.getInternal("containedMinimum"),
                previousContainedMaximum = this.getInternal("containedMaximum"),
                values = this._vizStore.values();

            for (var i = 0; i < values.length; i++) {
                if (values[i].extendedRange.absolute1 < previousContainedMinimum) {
                    previousContainedMinimum = values[i].extendedRange.absolute1;
                }
                if (values[i].extendedRange.absolute2 > previousContainedMaximum) {
                    previousContainedMaximum = values[i].extendedRange.absolute2;
                }
            }

            this.setInternal("extendedMinimum", previousContainedMinimum);
            this.setInternal("extendedMaximum", previousContainedMaximum);
            this.invalidate("processActualRangePass");
        };

        this.processActualRange = function() {
            var minimum = this.getInternal("minimum"),
                maximum = this.getInternal("maximum"),
                previousMin = this._actualMinimum,
                previousMax = this._actualMaximum;
            if (isNaN(minimum)) {
                minimum = this.getInternal("extendedMinimum");
            }
            if (isNaN(maximum)) {
                maximum = this.getInternal("extendedMaximum");
            }
            this._actualMinimum = minimum;
            this._actualMaximum = maximum;

            this.setInternal("actualMaximum", maximum);
            this.setInternal("actualMinimum", minimum);

            if (this._actualMaximum !== previousMax || this._actualMinimum !== previousMin) {
                this.fire("relativeMapChanged", new EventData());
            }
        };

        this.valueToAbsolute = function(value) {
            throw new Error("Must implement valueToAbsolute method");
        };

        this.absoluteToValue = function(absolute) {
            throw new Error("Must implement absoluteToValue method");
        };

        this.absoluteToRelative = function(absVal) {
            if (this._actualMaximum === this._actualMinimum) {
                return 0;
            }
            return (absVal - this._actualMinimum)/(this._actualMaximum - this._actualMinimum);
        };

        this.relativeToAbsolute = function(relativeVal) {
            return relativeVal * (this._actualMaximum - this._actualMinimum) + this._actualMinimum;
        };

        // Protected Methods

        this.processValues = function(values) {
            throw new Error("Must implement processValues mehod");
        };

    });

});
