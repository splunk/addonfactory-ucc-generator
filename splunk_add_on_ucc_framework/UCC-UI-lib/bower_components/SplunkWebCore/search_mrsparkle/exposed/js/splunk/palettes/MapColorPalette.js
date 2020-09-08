define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var ObservableObjectProperty = require("jg/properties/ObservableObjectProperty");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var ColorPalette = require("splunk/palettes/ColorPalette");

    return Class(module.id, ColorPalette, function(MapColorPalette, base) {

        // Public Properties

        this.colors = new ObservableObjectProperty("colors", Color, {})
            .itemReadFilter(function(value) {
                return value.clone();
            })
            .itemWriteFilter(function(value) {
                return value ? value.clone().normalize() : new Color();
            })
            .itemChangeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            });

        // Constructor

        this.constructor = function(colors) {
            base.constructor.call(this);

            if (colors != null) {
                this.set("colors", colors);
            }
        };

        // Protected Methods

        this.getItemOverride = function(properties, ratio, span, value) {
            if (value != null) {
                var color = ObjectUtil.get(properties.colors, "" + value);
                if (color) {
                    return color.clone();
                }
            }

            return null;
        };

    });

});
