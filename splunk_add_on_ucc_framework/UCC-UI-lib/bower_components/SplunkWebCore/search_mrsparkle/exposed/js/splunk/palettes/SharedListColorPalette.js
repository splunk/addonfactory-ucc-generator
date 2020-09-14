define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var ArrayProperty = require("jg/properties/ArrayProperty");
    var ColorPalette = require("splunk/palettes/ColorPalette");
    var ColorPalettes = require("splunk/palettes/ColorPalettes");

    return Class(module.id, ColorPalette, function(SharedListColorPalette, base) {

        // Public Properties

        this.colors = new ArrayProperty("colors", Color)
            .readOnly(true)
            .getter(function() {
                return ColorPalettes.CATEGORICAL.get("colors");
            });

        // Protected Methods

        this.getItemOverride = function(properties, ratio, span, value) {
            return ColorPalettes.CATEGORICAL.getItem(ratio, span, value);
        };

    });

});
