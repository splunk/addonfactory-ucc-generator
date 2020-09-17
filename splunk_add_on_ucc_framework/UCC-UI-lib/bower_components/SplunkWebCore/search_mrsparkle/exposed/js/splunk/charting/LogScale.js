define(function(require, exports, module) {

    var Class = require("jg/Class");
    var NumberUtil = require("jg/utils/NumberUtil");

    return Class(module.id, Object, function(LogScale, base) {

        // Private Properties

        this._base = 0;
        this._baseMultiplier = 0;

        // Constructor

        this.constructor = function(base) {
            if ((base != null) && !Class.isNumber(base)) {
                throw new Error("Parameter base must be of type Number.");
            }

            this._base = ((base > 0) && (base < Infinity)) ? base : 10;
            this._baseMultiplier = Math.log(this._base);
        };

        // Public Accessor Methods

        this.base = function() {
            return this._base;
        };

        // Public Methods

        this.valueToScale = function(value) {
            if (this._base <= 1) {
                return 0;
            }

            var scale = 0;

            var isNegative = (value < 0);

            if (isNegative) {
                value = -value;
            }

            if (value < this._base) {
                value += (this._base - value) / this._base;
            }
            scale = Math.log(value) / this._baseMultiplier;

            scale = NumberUtil.toPrecision(scale, -1);

            if (isNegative) {
                scale = -scale;
            }

            return scale;
        };

        this.scaleToValue = function(scale) {
            if (this._base <= 1) {
                return 0;
            }

            var value = 0;

            var isNegative = (scale < 0);

            if (isNegative) {
                scale = -scale;
            }

            value = Math.exp(scale * this._baseMultiplier);
            if (value < this._base) {
                value = this._base * (value - 1) / (this._base - 1);
            }

            value = NumberUtil.toPrecision(value, -1);

            if (isNegative) {
                value = -value;
            }

            return value;
        };

    });

});
