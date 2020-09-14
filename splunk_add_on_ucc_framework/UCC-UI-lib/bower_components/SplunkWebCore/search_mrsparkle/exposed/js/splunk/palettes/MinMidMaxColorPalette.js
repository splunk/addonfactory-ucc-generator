define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ColorPalette = require("splunk/palettes/ColorPalette");

    return Class(module.id, ColorPalette, function(MinMidMaxColorPalette, base) {

        // Public Properties

        this.minColor = new ObservableProperty("minColor", Color, null)
            .readFilter(function(value) {
                return value ? value.clone() : null;
            })
            .writeFilter(function(value) {
                return value ? value.clone().normalize() : null;
            })
            .changeComparator(function(oldValue, newValue) {
                return (oldValue && newValue) ? !oldValue.equals(newValue) : (oldValue !== newValue);
            });

        this.midColor = new ObservableProperty("midColor", Color, null)
            .readFilter(function(value) {
                return value ? value.clone() : null;
            })
            .writeFilter(function(value) {
                return value ? value.clone().normalize() : null;
            })
            .changeComparator(function(oldValue, newValue) {
                return (oldValue && newValue) ? !oldValue.equals(newValue) : (oldValue !== newValue);
            });

        this.maxColor = new ObservableProperty("maxColor", Color, null)
            .readFilter(function(value) {
                return value ? value.clone() : null;
            })
            .writeFilter(function(value) {
                return value ? value.clone().normalize() : null;
            })
            .changeComparator(function(oldValue, newValue) {
                return (oldValue && newValue) ? !oldValue.equals(newValue) : (oldValue !== newValue);
            });

        this.interpolationSteps = new ObservableProperty("interpolationSteps", Number, Infinity)
            .writeFilter(function(value) {
                return (value < Infinity) ? Math.max(Math.floor(value), 3) : Infinity;
            });

        // Constructor

        this.constructor = function(minColor, midColor, maxColor) {
            base.constructor.call(this);

            if (minColor != null) {
                this.set("minColor", minColor);
            }
            if (midColor != null) {
                this.set("midColor", midColor);
            }
            if (maxColor != null) {
                this.set("maxColor", maxColor);
            }
        };

        // Protected Methods

        this.extendProperties = function(properties) {
            var minColor = properties.minColor || Color.fromString("#00CC00");
            var midColor = properties.midColor;
            var maxColor = properties.maxColor || Color.fromString("#CC0000");
            properties.colors = midColor ? [ minColor, midColor, maxColor ] : [ minColor, maxColor ];
        };

        this.getItemOverride = function(properties, ratio, span, value) {
            var interpolationSteps = properties.interpolationSteps;
            var colors = properties.colors;
            var numColors = colors.length;

            var index;
            if (interpolationSteps < Infinity) {
                span = interpolationSteps - 1;
                index = Math.round(span * ratio);
            } else if (span >= 0) {
                index = Math.round(span * ratio);
            } else {
                span = numColors - 1;
                index = span * ratio;
            }

            ratio = (span > 0) ? (numColors - 1) * (index / span) : 0;
            var index1 = Math.floor(ratio);
            var index2 = Math.min(index1 + 1, numColors - 1);
            ratio -= index1;

            return Color.interpolate(colors[index1], colors[index2], ratio);
        };

    });

});
