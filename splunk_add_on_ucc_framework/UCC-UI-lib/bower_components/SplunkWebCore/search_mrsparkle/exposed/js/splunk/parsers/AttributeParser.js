define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var Parser = require("splunk/parsers/Parser");
    var ParseUtils = require("splunk/parsers/ParseUtils");
    var console = require("util/console");

    return Class(module.id, Parser, function(AttributeParser, base) {

        // Private Static Methods

        var _extractSubAttributes = function(attributes, prefix) {
            prefix += ".";

            var prefixLength = prefix.length;
            var subAttributes = null;

            for (var attr in attributes) {
                if (ObjectUtil.has(attributes, attr) && !ParseUtils.isEmpty(attributes[attr])) {
                    if ((attr + ".").substring(0, prefixLength) === prefix) {
                        if (!subAttributes) {
                            subAttributes = {};
                        }
                        subAttributes[attr.substring(prefixLength)] = attributes[attr];
                    }
                }
            }

            return subAttributes;
        };

        var _mergeSubAttributes = function(attributes, prefix, subAttributes, defaultValue) {
            for (var attr in subAttributes) {
                if (ObjectUtil.has(subAttributes, attr) && !ParseUtils.isEmpty(subAttributes[attr])) {
                    if (attr) {
                        attributes[prefix + "." + attr] = subAttributes[attr];
                    } else if (subAttributes[attr] !== defaultValue) {
                        attributes[prefix] = subAttributes[attr];
                    }
                }
            }
        };

        // Public Methods

        this.deserialize = function(attributes) {
            var value = base.deserialize.call(this, attributes);
            if (value == null) {
                return value;
            }

            var attributeParsers = this.getAttributeParsers(value);
            if (!attributeParsers) {
                return value;
            }

            var subAttributes;
            for (var attr in attributeParsers) {
                if (ObjectUtil.has(attributeParsers, attr)) {
                    subAttributes = _extractSubAttributes(attributes, attr);
                    if (subAttributes) {
                        try {
                            this.setAttribute(value, attr, attributeParsers[attr].deserialize(subAttributes));
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            }

            return value;
        };

        this.serialize = function(value) {
            var attributes = base.serialize.call(this, value);
            if (!attributes) {
                return null;
            }

            var attributeParsers = this.getAttributeParsers(value);
            if (!attributeParsers) {
                return attributes;
            }

            var defaultValue = this.stringToValue(this.valueToString(value));
            var defaultAttributeValue;
            var subAttributes;
            for (var attr in attributeParsers) {
                if (ObjectUtil.has(attributeParsers, attr)) {
                    subAttributes = attributeParsers[attr].serialize(this.getAttribute(value, attr));
                    if (subAttributes) {
                        defaultAttributeValue = attributeParsers[attr].valueToString(this.getAttribute(defaultValue, attr));
                        _mergeSubAttributes(attributes, attr, subAttributes, defaultAttributeValue);
                    }
                }
            }

            return attributes;
        };

        this.hasNestedFormat = function() {
            return true;
        };

        this.getAttributeParsers = function(value) {
            return null;
        };

        this.getAttribute = function(value, attributeName) {
            if ((value != null) && value.isPropertyTarget) {
                return value.get(attributeName);
            }
            return void(0);
        };

        this.setAttribute = function(value, attributeName, attributeValue) {
            if ((value != null) && value.isPropertyTarget) {
                value.set(attributeName, attributeValue);
            }
        };

    });

});
