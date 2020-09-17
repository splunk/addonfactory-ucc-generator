define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var Parser = require("splunk/parsers/Parser");
    var ParseUtils = require("splunk/parsers/ParseUtils");

    return Class(module.id, Parser, function(ColorParser, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        ColorParser.getInstance = function() {
            if (!_instance) {
                _instance = new ColorParser();
            }
            return _instance;
        };

        // Public Methods

        this.stringToValue = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            return str ? Color.fromString(str) : null;
        };

        this.valueToString = function(value) {
            return (value instanceof Color) ? value.toString((value.a < 1) ? "rgba" : "hex") : null;
        };

    });

});
