define([
            '../util/parsing_utils',
            '../util/color_utils',
            'util/color_utils',
            'splunk/palettes/ColorCodes'
        ],
        function(
            parsingUtils,
            colorUtils,
            splunkColorUtils,
            ColorCodes
        ) {

    var ColorPalette = function(colors, useInterpolation) {
        this.setColors(colors);
        this.useInterpolation = parsingUtils.normalizeBoolean(useInterpolation, false);
    };

    ColorPalette.prototype = {

        setColors: function(colors) {
            this.colors = colors || this.BASE_COLORS;
        },

        getColor: function(field, index, count) {
            var p, index1, index2,
                numColors = this.colors.length;

            if(numColors === 0) {
                return 0x000000;
            }
            if(index < 0) {
                index = 0;
            }
            if(!this.useInterpolation) {
                return this.colors[index % numColors];
            }
            if (count < 1) {
                count = 1;
            }
            if (index > count) {
                index = count;
            }
            p = (count === 1) ? 0 : (numColors - 1) * (index / (count - 1));
            index1 = Math.floor(p);
            index2 = Math.min(index1 + 1, numColors - 1);
            p -= index1;

            return splunkColorUtils.interpolateColors(this.colors[index1], this.colors[index2], p);
        },

        getColorAsRgb: function(field, index, count) {
            var hexColor = this.getColor(field, index, count);
            return colorUtils.colorFromHex(hexColor);
        },

        BASE_COLORS: ColorCodes.toNumbers(ColorCodes.CATEGORICAL)

    };

    return ColorPalette;

});