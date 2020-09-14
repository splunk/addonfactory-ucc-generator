define(['jquery', 'underscore', 'splunk.util'], function($, _, splunkUtils) {

    // converts a hex number to its css-friendly counterpart, with optional alpha transparency field
    // returns null if the input is cannot be parsed to a valid number or if the number is out of range
    var colorFromHex = function(hexNum, alpha) {
        if(typeof hexNum !== 'number') {
            hexNum = parseInt(hexNum, 16);
        }
        if(_(hexNum).isNaN() || hexNum < 0x000000 || hexNum > 0xffffff) {
            return null;
        }
        var r = (hexNum & 0xff0000) >> 16,
            g = (hexNum & 0x00ff00) >> 8,
            b = hexNum & 0x0000ff;

        return ((alpha === undefined) ? ('rgb(' + r + ',' + g + ',' + b + ')')
            : ('rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'));
    };

    // converts an rgba value to rgb by stripping out the alpha.  willl return the unchanged parameter
    // if an rgb value is passed rather than rgba
    var stripOutAlpha = function(color){
        var rgb       = color.split(','),
            thirdChar = rgb[0].charAt(3);

        if(thirdChar === 'a'){
            rgb[0] = rgb[0].replace('rgba','rgb');
            rgb[(rgb.length -1)] = ')';
            rgb = rgb.join();
            rgb = rgb.replace(',)',')');
            return rgb;
        }
        return color;
    };

    // coverts a color string in either hex (must be long form) or rgb format into its corresponding hex number
    // returns zero if the color string can't be parsed as either format
    // TODO: either add support for short form or emit an error
    var hexFromColor = function(color) {
        var normalizedColor = splunkUtils.normalizeColor(color);
        return (normalizedColor) ? parseInt(normalizedColor.replace('#', '0x'), 16) : 0;
    };

    // given a color string (in long-form hex or rgb form) or a hex number,
    // formats the color as an rgba string with the given alpha transparency
    // TODO: currently fails somewhat silently if an un-parseable or out-of-range input is given
    var addAlphaToColor = function(color, alpha) {
        var colorAsHex = (typeof color === 'number') ? color : hexFromColor(color);
        return colorFromHex(colorAsHex, alpha);
    };

    // calculate the luminance of a color based on its hex value
    // returns zero if the input is cannot be parsed to a valid number or if the number is out of range
    // equation for luminance found at http://en.wikipedia.org/wiki/Luma_(video)
    var getLuminance = function(hexNum) {
        if(typeof hexNum !== "number") {
            hexNum = parseInt(hexNum, 16);
        }
        if(isNaN(hexNum) || hexNum < 0x000000 || hexNum > 0xffffff) {
            return 0;
        }
        var r = (hexNum & 0xff0000) >> 16,
            g = (hexNum & 0x00ff00) >> 8,
            b = hexNum & 0x0000ff;

        return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    };

    // compute the user-visible fill opacity of an SVG element
    // an opacity defined as part of the 'fill' color with rgba(...) syntax will take precedence over the 'fill-opacity'
    var getComputedOpacity = function(element) {
        var fill = $.trim(element.attr('fill')),
            enforceValidOpacity = function(opacityStr) {
                var parsed = parseFloat(opacityStr);
                return (parsed >= 0 && parsed <= 1) ? parsed : 1;
            };


        if (!/^rgba/.test(fill)) {
            return enforceValidOpacity(element.attr('fill-opacity'));
        }
        var rgba = fill.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
        return rgba && rgba.length > 4 ? enforceValidOpacity(rgba[4]) : 1;
    };

    return ({

        colorFromHex: colorFromHex,
        stripOutAlpha: stripOutAlpha,
        hexFromColor: hexFromColor,
        addAlphaToColor: addAlphaToColor,
        getLuminance: getLuminance,
        getComputedOpacity: getComputedOpacity

    });

});