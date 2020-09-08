define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Parser = require("splunk/parsers/Parser");
    var ParseUtils = require("splunk/parsers/ParseUtils");

    return Class(module.id, Parser, function(NumberParser, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        NumberParser.getInstance = function() {
            if (!_instance) {
                _instance = new NumberParser();
            }
            return _instance;
        };

        // Public Methods

        this.stringToValue = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            return str ? Number(str) : NaN;
        };

        this.valueToString = function(value) {
            return ((value != null) && Class.isNumber(value)) ? String(value) : String(NaN);
        };

    });

});
