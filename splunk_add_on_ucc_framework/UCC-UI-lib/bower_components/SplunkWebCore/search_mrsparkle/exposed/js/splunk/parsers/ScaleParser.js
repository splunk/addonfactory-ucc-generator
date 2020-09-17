define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ArrayParser = require("splunk/parsers/ArrayParser");
    var AttributeParser = require("splunk/parsers/AttributeParser");
    var NumberParser = require("splunk/parsers/NumberParser");
    var ParseUtils = require("splunk/parsers/ParseUtils");
    var StringParser = require("splunk/parsers/StringParser");
    var CategoryScale = require("splunk/scales/CategoryScale");
    var LinearScale = require("splunk/scales/LinearScale");
    var LogScale = require("splunk/scales/LogScale");
    var MinMidMaxScale = require("splunk/scales/MinMidMaxScale");
    var SharedCategoryScale = require("splunk/scales/SharedCategoryScale");
    var ThresholdScale = require("splunk/scales/ThresholdScale");

    return Class(module.id, AttributeParser, function(ScaleParser, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        ScaleParser.getInstance = function() {
            if (!_instance) {
                _instance = new ScaleParser();
            }
            return _instance;
        };

        // Protected Properties

        this.numberParser = null;
        this.stringParser = null;
        this.numberArrayParser = null;
        this.stringArrayParser = null;

        // Constructor

        this.constructor = function() {
            this.numberParser = NumberParser.getInstance();
            this.stringParser = StringParser.getInstance();
            this.numberArrayParser = ArrayParser.getInstance(NumberParser.getInstance());
            this.stringArrayParser = ArrayParser.getInstance(StringParser.getInstance());
        };

        // Public Methods

        this.stringToValue = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            switch (str) {
                case "category":
                    return new CategoryScale();
                case "linear":
                    return new LinearScale();
                case "log":
                    return new LogScale();
                case "minMidMax":
                    return new MinMidMaxScale();
                case "sharedCategory":
                    return new SharedCategoryScale();
                case "threshold":
                    return new ThresholdScale();
                default:
                    return null;
            }
        };

        this.valueToString = function(value) {
            var type = (value != null) ? value.constructor : null;
            switch (type) {
                case CategoryScale:
                    return "category";
                case LinearScale:
                    return "linear";
                case LogScale:
                    return "log";
                case MinMidMaxScale:
                    return "minMidMax";
                case SharedCategoryScale:
                    return "sharedCategory";
                case ThresholdScale:
                    return "threshold";
                default:
                    return null;
            }
        };

        this.getAttributeParsers = function(value) {
            var type = (value != null) ? value.constructor : null;
            switch (type) {
                case CategoryScale:
                    return {
                        categories: this.stringArrayParser
                    };
                case LogScale:
                    return {
                        base: this.numberParser
                    };
                case MinMidMaxScale:
                    return {
                        minType: this.stringParser,
                        minValue: this.numberParser,
                        midType: this.stringParser,
                        midValue: this.numberParser,
                        maxType: this.stringParser,
                        maxValue: this.numberParser
                    };
                case ThresholdScale:
                    return {
                        thresholds: this.numberArrayParser
                    };
                default:
                    return null;
            }
        };

    });

});
