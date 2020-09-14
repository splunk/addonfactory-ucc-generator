define(function(require, exports, module) {

    var Class = require("jg/Class");
    var LatLonBounds = require("splunk/mapping2/LatLonBounds");
    var NumberParser = require("splunk/parsers/NumberParser");
    var Parser = require("splunk/parsers/Parser");
    var ParseUtils = require("splunk/parsers/ParseUtils");

    return Class(module.id, Parser, function(LatLonBoundsParser, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        LatLonBoundsParser.getInstance = function() {
            if (!_instance) {
                _instance = new LatLonBoundsParser();
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

            var latLonBounds = new LatLonBounds();

            var numValues = values.length;
            if (numValues > 0) {
                latLonBounds.s = this.numberParser.stringToValue(values[0]);
            }
            if (numValues > 1) {
                latLonBounds.w = this.numberParser.stringToValue(values[1]);
            }
            if (numValues > 2) {
                latLonBounds.n = this.numberParser.stringToValue(values[2]);
            }
            if (numValues > 3) {
                latLonBounds.e = this.numberParser.stringToValue(values[3]);
            }

            return latLonBounds;
        };

        this.valueToString = function(value) {
            var latLonBounds = (value instanceof LatLonBounds) ? value : null;
            if (!latLonBounds) {
                return null;
            }

            var str = "";

            str += this.numberParser.valueToString(latLonBounds.s) + ",";
            str += this.numberParser.valueToString(latLonBounds.w) + ",";
            str += this.numberParser.valueToString(latLonBounds.n) + ",";
            str += this.numberParser.valueToString(latLonBounds.e);

            return "(" + str + ")";
        };

    });

});
