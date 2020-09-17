define(function(require, exports, module) {

    var Class = require("jg/Class");
    var BaseAxis = require("splunk/mapping/axis/BaseAxis");

    return Class(module.id, BaseAxis, function(NumericAxis, base) {

        // Public Methods

        this.valueToAbsolute = function(value) {
            if (value === null || value === "") {
                return NaN;
            }
            var absoluteVal = Number(value);
            if (absoluteVal > -Infinity && absoluteVal < Infinity) {
                return absoluteVal;
            } else {
                return NaN;
            }
        };

        this.absoluteToValue = function(absolute) {
            return absolute;
        };

        // Protected Methods

        this.processValues = function(values) {
            var processedValues = [];
            for (var i = 0; i < values.length; i++) {
                var processedValue = this.valueToAbsolute(values[i]);
                if (!isNaN(processedValue)) {
                    processedValues.push(processedValue);
                }
            }
            return processedValues;
        };

    });

});
