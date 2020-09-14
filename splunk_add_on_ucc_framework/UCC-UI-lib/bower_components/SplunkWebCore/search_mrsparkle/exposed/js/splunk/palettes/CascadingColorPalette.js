define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");
    var ColorPalette = require("splunk/palettes/ColorPalette");

    return Class(module.id, ColorPalette, function(CascadingColorPalette, base) {

        // Public Properties

        this.colorPalettes = new ObservableArrayProperty("colorPalettes", ColorPalette, []);

        // Constructor

        this.constructor = function(colorPalettes) {
            base.constructor.call(this);

            if (colorPalettes != null) {
                this.set("colorPalettes", colorPalettes);
            }
        };

        // Protected Methods

        this.getItemOverride = function(properties, ratio, span, value) {
            var colorPalettes = properties.colorPalettes;
            var color;
            for (var i = colorPalettes.length - 1; i >= 0; i--) {
                color = colorPalettes[i].getItem(ratio, span, value);
                if (color) {
                    return color;
                }
            }

            return null;
        };

    });

});
