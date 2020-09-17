define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Parser = require("splunk/parsers/Parser");
    var ParseUtils = require("splunk/parsers/ParseUtils");

    return Class(module.id, Parser, function(BooleanParser, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        BooleanParser.getInstance = function() {
            if (!_instance) {
                _instance = new BooleanParser();
            }
            return _instance;
        };

        // Public Methods

        this.stringToValue = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            if (str) {
                str = str.toLowerCase();
            }
            return ((str === "true") || (str === "t") || (str === "1"));
        };

        this.valueToString = function(value) {
            return (value === true) ? "true" : "false";
        };

    });

});
