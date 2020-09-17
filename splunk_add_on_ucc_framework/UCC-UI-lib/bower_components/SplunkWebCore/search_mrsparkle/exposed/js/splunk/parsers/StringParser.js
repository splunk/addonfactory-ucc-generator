define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Parser = require("splunk/parsers/Parser");

    return Class(module.id, Parser, function(StringParser, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        StringParser.getInstance = function() {
            if (!_instance) {
                _instance = new StringParser();
            }
            return _instance;
        };

        // Public Methods

        this.stringToValue = function(str) {
            return ((str != null) && Class.isString(str)) ? str : null;
        };

        this.valueToString = function(value) {
            return ((value != null) && Class.isString(value)) ? value : null;
        };

    });

});
