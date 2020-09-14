define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Map = require("jg/utils/Map");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var Parser = require("splunk/parsers/Parser");
    var ParseUtils = require("splunk/parsers/ParseUtils");
    var StringParser = require("splunk/parsers/StringParser");

    return Class(module.id, Parser, function(ArrayParser, base) {

        // Private Static Constants

        var _R_INDEX = /^(0|[1-9][0-9]*)(?:\.|$)/;

        // Private Static Properties

        var _instances = new Map();

        // Public Static Methods

        ArrayParser.getInstance = function(elementParser) {
            var instance = _instances.get(elementParser);
            if (!instance) {
                instance = new ArrayParser(elementParser);
                _instances.set(elementParser, instance);
            }
            return instance;
        };

        // Private Static Methods

        var _extractIndexAttributes = function(attributes) {
            var indexAttributesMap = {};
            var indexAttributes;
            var index;
            var match;

            for (var attr in attributes) {
                if (ObjectUtil.has(attributes, attr) && !ParseUtils.isEmpty(attributes[attr])) {
                    match = attr.match(_R_INDEX);
                    if (match) {
                        index = match[1];
                        indexAttributes = ObjectUtil.get(indexAttributesMap, index);
                        if (!indexAttributes) {
                            indexAttributes = indexAttributesMap[index] = {};
                        }
                        indexAttributes[attr.substring(match[0].length)] = attributes[attr];
                    }
                }
            }

            var indexAttributesList = ObjectUtil.pairs(indexAttributesMap);
            if (!indexAttributesList.length) {
                return null;
            }

            indexAttributesList.sort(_indexPairComparator);
            for (var i = 0, l = indexAttributesList.length; i < l; i++) {
                indexAttributesList[i] = indexAttributesList[i][1];
            }

            return indexAttributesList;
        };

        var _mergeIndexAttributes = function(attributes, index, indexAttributes) {
            index = "" + index;
            for (var attr in indexAttributes) {
                if (ObjectUtil.has(indexAttributes, attr) && !ParseUtils.isEmpty(indexAttributes[attr])) {
                    attributes[index + (attr ? ("." + attr) : "")] = indexAttributes[attr];
                }
            }
        };

        var _indexPairComparator = function(pair1, pair2) {
            return pair1[0] - pair2[0];
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

        this.deserialize = function(attributes) {
            if (!this.hasNestedFormat()) {
                return base.deserialize.call(this, attributes);
            }

            if (attributes == null) {
                throw new Error("Parameter attributes must be non-null.");
            }

            var indexAttributes = _extractIndexAttributes(attributes);
            if (!indexAttributes) {
                return null;
            }

            var arr = [];

            var elementParser = this.elementParser;
            for (var i = 0, l = indexAttributes.length; i < l; i++) {
                arr.push(elementParser.deserialize(indexAttributes[i]));
            }

            return arr;
        };

        this.serialize = function(value) {
            if (!this.hasNestedFormat()) {
                return base.serialize.call(this, value);
            }

            if ((value == null) || !Class.isArray(value) || !value.length) {
                return null;
            }

            var attributes = {};

            var elementParser = this.elementParser;
            var indexAttributes;
            var index = 0;
            for (var i = 0, l = value.length; i < l; i++) {
                indexAttributes = elementParser.serialize(value[i]);
                if (indexAttributes) {
                    _mergeIndexAttributes(attributes, index, indexAttributes);
                    index++;
                }
            }

            return attributes;
        };

        this.hasNestedFormat = function() {
            return this.elementParser.hasNestedFormat();
        };

        this.stringToValue = function(str) {
            var arr = ParseUtils.prepareArray(str);
            if (!arr) {
                return null;
            }

            var elementParser = this.elementParser;
            for (var i = 0, l = arr.length; i < l; i++) {
                arr[i] = elementParser.stringToValue(arr[i]);
            }

            return arr;
        };

        this.valueToString = function(value) {
            var arr = ((value != null) && Class.isArray(value)) ? value : null;
            if (!arr) {
                return null;
            }

            var str = "";

            var elementParser = this.elementParser;
            var elementValue;
            for (var i = 0, l = arr.length; i < l; i++) {
                elementValue = arr[i];
                if (str) {
                    str += ",";
                }
                if (elementParser instanceof StringParser) {
                    str += ParseUtils.escapeString(elementParser.valueToString(elementValue));
                } else {
                    str += elementParser.valueToString(elementValue);
                }
            }

            return "[" + str + "]";
        };

    });

});
