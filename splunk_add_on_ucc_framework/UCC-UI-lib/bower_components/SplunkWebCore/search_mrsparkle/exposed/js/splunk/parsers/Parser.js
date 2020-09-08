define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObjectUtil = require("jg/utils/ObjectUtil");
    var ParseUtils = require("splunk/parsers/ParseUtils");

    return Class(module.id, Object, function(Parser, base) {

        // Constructor

        this.constructor = function() {
            // noop
        };

        // Public Methods

        this.deserialize = function(attributes) {
            if (attributes == null) {
                throw new Error("Parameter attributes must be non-null.");
            }

            var str = ObjectUtil.get(attributes, "");
            str = !ParseUtils.isEmpty(str) ? ("" + str) : null;

            return this.stringToValue(str);
        };

        this.serialize = function(value) {
            var str = this.valueToString(value);
            return !ParseUtils.isEmpty(str) ? { "": str } : null;
        };

        this.hasNestedFormat = function() {
            return false;
        };

        this.stringToValue = function(str) {
            return null;
        };

        this.valueToString = function(value) {
            return null;
        };

    });

});
