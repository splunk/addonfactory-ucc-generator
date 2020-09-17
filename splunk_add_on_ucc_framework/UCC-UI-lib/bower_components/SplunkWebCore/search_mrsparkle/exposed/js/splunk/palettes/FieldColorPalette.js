define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var ObservableObjectProperty = require("jg/properties/ObservableObjectProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var ColorPalette = require("splunk/palettes/ColorPalette");

    return Class(module.id, ColorPalette, function(FieldColorPalette, base) {

        // Public Properties

        this.fieldColors = new ObservableObjectProperty("fieldColors", Color, {})
            .itemReadFilter(function(value) {
                return value.clone();
            })
            .itemWriteFilter(function(value) {
                return value ? value.clone().normalize() : new Color();
            })
            .itemChangeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            });

        this.defaultColorPalette = new ObservableProperty("defaultColorPalette", ColorPalette, null);

        // Constructor

        this.constructor = function(fieldColors, defaultColorPalette) {
            base.constructor.call(this);

            if (fieldColors != null) {
                this.set("fieldColors", fieldColors);
            }
            if (defaultColorPalette != null) {
                this.set("defaultColorPalette", defaultColorPalette);
            }
        };

        // Protected Methods

        this.getItemOverride = function(properties, ratio, span, value) {
            if (value != null) {
                var color = ObjectUtil.get(properties.fieldColors, "" + value);
                if (color) {
                    return color.clone();
                }
            }

            var defaultColorPalette = properties.defaultColorPalette;
            if (defaultColorPalette) {
                return defaultColorPalette.getItem(ratio, span, value);
            }

            return null;
        };

    });

});
