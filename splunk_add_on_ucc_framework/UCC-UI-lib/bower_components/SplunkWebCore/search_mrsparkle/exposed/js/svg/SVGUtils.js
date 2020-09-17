define(function(require, exports, module) {

    var _SVG_PATTERN = /(<svg[^>]*>[\s\S]*<\/svg>)/im;

    var strip = function(source) {
        var matches = source ? source.match(_SVG_PATTERN) : null;
        return matches ? matches[1] : null;
    };

    return {
        strip: strip
    };

});
