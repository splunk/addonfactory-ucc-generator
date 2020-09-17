define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ColorCodes = require("splunk/palettes/ColorCodes");
    var ListColorPalette = require("splunk/palettes/ListColorPalette");

    return Class(module.id, function(ColorPalettes) {

        // Public Static Constants

        ColorPalettes.CATEGORICAL = new ListColorPalette(ColorCodes.toColors(ColorCodes.CATEGORICAL));

        ColorPalettes.SEMANTIC = new ListColorPalette(ColorCodes.toColors(ColorCodes.SEMANTIC));

        ColorPalettes.SEMANTIC_1 = new ListColorPalette(ColorCodes.toColors(ColorCodes.SEMANTIC_1), true);
        ColorPalettes.SEMANTIC_2 = new ListColorPalette(ColorCodes.toColors(ColorCodes.SEMANTIC_2), true);
        ColorPalettes.SEMANTIC_3 = new ListColorPalette(ColorCodes.toColors(ColorCodes.SEMANTIC_3), true);
        ColorPalettes.SEMANTIC_4 = new ListColorPalette(ColorCodes.toColors(ColorCodes.SEMANTIC_4), true);
        ColorPalettes.SEMANTIC_5 = new ListColorPalette(ColorCodes.toColors(ColorCodes.SEMANTIC_5), true);

        ColorPalettes.DIVERGENT_1 = new ListColorPalette(ColorCodes.toColors(ColorCodes.DIVERGENT_1), true);
        ColorPalettes.DIVERGENT_2 = new ListColorPalette(ColorCodes.toColors(ColorCodes.DIVERGENT_2), true);
        ColorPalettes.DIVERGENT_3 = new ListColorPalette(ColorCodes.toColors(ColorCodes.DIVERGENT_3), true);
        ColorPalettes.DIVERGENT_4 = new ListColorPalette(ColorCodes.toColors(ColorCodes.DIVERGENT_4), true);
        ColorPalettes.DIVERGENT_5 = new ListColorPalette(ColorCodes.toColors(ColorCodes.DIVERGENT_5), true);

    });

});
