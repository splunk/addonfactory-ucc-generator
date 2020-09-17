define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ColorPalette = require("splunk/palettes/ColorPalette");

    return Class(module.id, ColorPalette, function(ListColorPalette, base) {

        // Public Properties

        this.colors = new ObservableArrayProperty("colors", Color, [])
            .itemReadFilter(function(value) {
                return value.clone();
            })
            .itemWriteFilter(function(value) {
                return value ? value.clone().normalize() : new Color();
            })
            .itemChangeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            });

        this.interpolate = new ObservableProperty("interpolate", Boolean, false);

        // Constructor

        this.constructor = function(colors, interpolate) {
            base.constructor.call(this);

            if (colors != null) {
                this.set("colors", colors);
            }
            if (interpolate != null) {
                this.set("interpolate", interpolate);
            }
        };

        // Protected Methods

        this.getItemOverride = function(properties, ratio, span, value) {
            var colors = properties.colors;
            var numColors = colors.length;
            if (numColors === 0) {
                return null;
            }

            var index;
            if (span >= 0) {
                index = Math.round(span * ratio);
            } else {
                span = numColors - 1;
                index = span * ratio;
            }

            if (!properties.interpolate) {
                index = Math.round(index);
                return colors[index % numColors].clone();
            }

            ratio = (span > 0) ? (numColors - 1) * (index / span) : 0;
            var index1 = Math.floor(ratio);
            var index2 = Math.min(index1 + 1, numColors - 1);
            ratio -= index1;

            return Color.interpolate(colors[index1], colors[index2], ratio);
        };

    });

});
