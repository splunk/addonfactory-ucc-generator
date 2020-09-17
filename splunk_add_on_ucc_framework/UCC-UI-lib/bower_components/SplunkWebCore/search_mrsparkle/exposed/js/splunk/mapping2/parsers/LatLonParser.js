define(function(require, exports, module) {

    var Class = require("jg/Class");
    var LatLon = require("splunk/mapping2/LatLon");
    var NumberParser = require("splunk/parsers/NumberParser");
    var Parser = require("splunk/parsers/Parser");
    var ParseUtils = require("splunk/parsers/ParseUtils");

    return Class(module.id, Parser, function(LatLonParser, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        LatLonParser.getInstance = function() {
            if (!_instance) {
                _instance = new LatLonParser();
            }
            return _instance;
        };

        // Protected Properties

        this.numberParser = null;

        // Constructor

        this.constructor = function() {
            this.numberParser = NumberParser.getInstance();
        };

        // Public Methods

        this.stringToValue = function(str) {
            var values = ParseUtils.prepareTuple(str);
            if (!values) {
                return null;
            }

            var latLon = new LatLon();

            var numValues = values.length;
            if (numValues > 0) {
                latLon.lat = this.numberParser.stringToValue(values[0]);
            }
            if (numValues > 1) {
                latLon.lon = this.numberParser.stringToValue(values[1]);
            }

            return latLon;
        };

        this.valueToString = function(value) {
            var latLon = (value instanceof LatLon) ? value : null;
            if (!latLon) {
                return null;
            }

            var str = "";

            str += this.numberParser.valueToString(latLon.lat) + ",";
            str += this.numberParser.valueToString(latLon.lon);

            return "(" + str + ")";
        };

    });

});
