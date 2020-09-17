define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var Palette = require("splunk/palettes/Palette");

    return Class(module.id, Palette, function(ColorPalette, base) {

        // Constructor

        this.constructor = function() {
            base.constructor.call(this, Color);
        };

    });

});
