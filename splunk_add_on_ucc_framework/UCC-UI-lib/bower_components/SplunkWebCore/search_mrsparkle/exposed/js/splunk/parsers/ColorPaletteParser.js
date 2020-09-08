define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ExpressionColorPalette = require("splunk/palettes/ExpressionColorPalette");
    var ListColorPalette = require("splunk/palettes/ListColorPalette");
    var MapColorPalette = require("splunk/palettes/MapColorPalette");
    var MinMidMaxColorPalette = require("splunk/palettes/MinMidMaxColorPalette");
    var SharedListColorPalette = require("splunk/palettes/SharedListColorPalette");
    var ArrayParser = require("splunk/parsers/ArrayParser");
    var AttributeParser = require("splunk/parsers/AttributeParser");
    var BooleanParser = require("splunk/parsers/BooleanParser");
    var ColorParser = require("splunk/parsers/ColorParser");
    var ObjectParser = require("splunk/parsers/ObjectParser");
    var ParseUtils = require("splunk/parsers/ParseUtils");
    var StringParser = require("splunk/parsers/StringParser");

    return Class(module.id, AttributeParser, function(ColorPaletteParser, base) {

        // Private Static Properties

        var _instance = null;

        // Public Static Methods

        ColorPaletteParser.getInstance = function() {
            if (!_instance) {
                _instance = new ColorPaletteParser();
            }
            return _instance;
        };

        // Protected Properties

        this.booleanParser = null;
        this.stringParser = null;
        this.colorParser = null;
        this.colorArrayParser = null;
        this.colorObjectParser = null;

        // Constructor

        this.constructor = function() {
            this.booleanParser = BooleanParser.getInstance();
            this.stringParser = StringParser.getInstance();
            this.colorParser = ColorParser.getInstance();
            this.colorArrayParser = ArrayParser.getInstance(ColorParser.getInstance());
            this.colorObjectParser = ObjectParser.getInstance(ColorParser.getInstance());
        };

        // Public Methods

        this.stringToValue = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            switch (str) {
                case "expression":
                    return new ExpressionColorPalette();
                case "list":
                    return new ListColorPalette();
                case "map":
                    return new MapColorPalette();
                case "minMidMax":
                    return new MinMidMaxColorPalette();
                case "sharedList":
                    return new SharedListColorPalette();
                default:
                    return null;
            }
        };

        this.valueToString = function(value) {
            var type = (value != null) ? value.constructor : null;
            switch (type) {
                case ExpressionColorPalette:
                    return "expression";
                case ListColorPalette:
                    return "list";
                case MapColorPalette:
                    return "map";
                case MinMidMaxColorPalette:
                    return "minMidMax";
                case SharedListColorPalette:
                    return "sharedList";
                default:
                    return null;
            }
        };

        this.getAttributeParsers = function(value) {
            var type = (value != null) ? value.constructor : null;
            switch (type) {
                case ExpressionColorPalette:
                    return {
                        rule: this.stringParser
                    };
                case ListColorPalette:
                    return {
                        colors: this.colorArrayParser,
                        interpolate: this.booleanParser
                    };
                case MapColorPalette:
                    return {
                        colors: this.colorObjectParser
                    };
                case MinMidMaxColorPalette:
                    return {
                        minColor: this.colorParser,
                        midColor: this.colorParser,
                        maxColor: this.colorParser
                    };
                default:
                    return null;
            }
        };

    });

});
