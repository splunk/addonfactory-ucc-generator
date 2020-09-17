define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Map = require("jg/utils/Map");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var Parser = require("splunk/parsers/Parser");
    var ParseUtils = require("splunk/parsers/ParseUtils");
    var StringParser = require("splunk/parsers/StringParser");

    return Class(module.id, Parser, function(ObjectParser, base) {

        // Private Static Properties

        var _instances = new Map();

        // Public Static Methods

        ObjectParser.getInstance = function(elementParser) {
            var instance = _instances.get(elementParser);
            if (!instance) {
                instance = new ObjectParser(elementParser);
                _instances.set(elementParser, instance);
            }
            return instance;
        };

        // Protected Properties

        this.elementParser = null;

        // Constructor

        this.constructor = function(elementParser) {
            if (elementParser == null) {
                throw new Error("Parameter elementParser must be non-null.");
            }
            if (!(elementParser instanceof Parser)) {
                throw new Error("Parameter elementParser must be of type " + Class.getName(Parser) + ".");
            }

            this.elementParser = elementParser;
        };

        // Public Methods

        this.stringToValue = function(str) {
            var obj = ParseUtils.prepareObject(str);
            if (!obj) {
                return null;
            }

            var elementParser = this.elementParser;
            for (var key in obj) {
                if (ObjectUtil.has(obj, key)) {
                    obj[key] = elementParser.stringToValue(obj[key]);
                }
            }

            return obj;
        };

        this.valueToString = function(value) {
            var obj = ((value != null) && Class.isObject(value)) ? value : null;
            if (!obj) {
                return null;
            }

            var str = "";

            var elementParser = this.elementParser;
            for (var key in obj) {
                if (ObjectUtil.has(obj, key)) {
                    if (str) {
                        str += ",";
                    }
                    str += ParseUtils.escapeString(key) + ":";
                    if (elementParser instanceof StringParser) {
                        str += ParseUtils.escapeString(elementParser.valueToString(obj[key]));
                    } else {
                        str += elementParser.valueToString(obj[key]);
                    }
                }
            }

            return "{" + str + "}";
        };

    });

});
