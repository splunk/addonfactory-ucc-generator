define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");

    return Class(module.id, function(ColorCodes) {

        // Public Static Constants

        // TODO: use the following colors for visual refresh
        // "#006D9C", "#4FA484", "#EC9960", "#AF575A", "#B6C75A", "#62B3B2", "#294E70", "#738795", "#EDD051", "#BD9872",
        // "#5A4575", "#7EA77B", "#708794", "#D7C6B7", "#339BB2", "#55672D", "#E6E1AE", "#96907F", "#87BC65", "#CF7E60",
        // "#7B5547", "#77D6D8", "#4A7F2C", "#F589AD", "#6A2C5D", "#AAABAE", "#9A7438", "#A4D563", "#7672A4", "#184B81"
        ColorCodes.CATEGORICAL = [
            "#1e93c6", "#f2b827", "#d6563c", "#6a5c9e", "#31a35f", "#ed8440", "#3863a0", "#a2cc3e", "#cc5068", "#73427f", "#11a88b", "#ea9600",
            "#0e776d", "#ffb380", "#aa3977", "#91af27", "#4453aa", "#99712b", "#553577", "#97bc71", "#d35c2d", "#314d5b", "#99962b", "#844539",
            "#00b290", "#e2c188", "#a34a41", "#44416d", "#e29847", "#8c8910", "#0b416d", "#774772", "#3d9988", "#bdbd5e", "#5f7396", "#844539"
        ];

        // TODO: use the following colors for visual refresh
        // "#006D9C", "#53A051", "#F8BE34", "#F1813F", "#DC4E41"
        ColorCodes.SEMANTIC = [ "#65a637", "#6db7c6", "#f7bc38", "#f58f39", "#d93f3c" ];

        ColorCodes.SEMANTIC_1 = [ "#FFFFFF", "#006D9C" ];
        ColorCodes.SEMANTIC_2 = [ "#FFFFFF", "#53A051" ];
        ColorCodes.SEMANTIC_3 = [ "#FFFFFF", "#F8BE34" ];
        ColorCodes.SEMANTIC_4 = [ "#FFFFFF", "#F1813F" ];
        ColorCodes.SEMANTIC_5 = [ "#FFFFFF", "#DC4E41" ];

        ColorCodes.DIVERGENT_1 = [ "#006D9C", "#FFFFFF", "#EC9960" ];
        ColorCodes.DIVERGENT_2 = [ "#AF575A", "#FFFFFF", "#62B3B2" ];
        ColorCodes.DIVERGENT_3 = [ "#4FA484", "#FFFFFF", "#F8BE34" ];
        ColorCodes.DIVERGENT_4 = [ "#5A4575", "#FFFFFF", "#708794" ];
        ColorCodes.DIVERGENT_5 = [ "#294E70", "#FFFFFF", "#B6C75A" ];

        // Public Static Methods

        ColorCodes.toColors = function(codes) {
            var colors = [];
            for (var i = 0, l = codes.length; i < l; i++) {
                colors.push(Color.fromString(codes[i]));
            }
            return colors;
        };

        ColorCodes.toNumbers = function(codes) {
            var numbers = [];
            for (var i = 0, l = codes.length; i < l; i++) {
                numbers.push(Color.fromString(codes[i]).toNumber());
            }
            return numbers;
        };

        ColorCodes.toArrays = function(codes) {
            var arrays = [];
            for (var i = 0, l = codes.length; i < l; i++) {
                arrays.push(Color.fromString(codes[i]).toArray());
            }
            return arrays;
        };

        ColorCodes.toPrefixed = function(codes, prefix) {
            var prefixed = [];
            for (var i = 0, l = codes.length; i < l; i++) {
                prefixed.push(prefix + codes[i].replace(/^(0x|#)/, ""));
            }
            return prefixed;
        };

    });

});
