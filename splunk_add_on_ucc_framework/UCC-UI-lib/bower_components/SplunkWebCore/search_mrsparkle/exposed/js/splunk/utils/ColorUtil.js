define(function(require, exports, module) {

    var Class = require("jg/Class");

    return Class(module.id, function(ColorUtil) {

        // Public Static Methods

        ColorUtil.perceptiveLuminance = function(color) {
            // algorithm adapted from http://codepen.io/WebSeed/pen/pvgqEq
            // added consideration for alpha transparency (as it appears on a white background)
            return (1 - (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255) * color.a;
        };

    });

});
