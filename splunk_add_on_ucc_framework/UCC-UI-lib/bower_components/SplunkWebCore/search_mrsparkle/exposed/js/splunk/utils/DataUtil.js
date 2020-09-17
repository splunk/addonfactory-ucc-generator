define(function(require, exports, module) {

    var Class = require("jg/Class");
    var StringUtil = require("jg/utils/StringUtil");

    return Class(module.id, function(DataUtil) {

        // Public Static Methods

        DataUtil.parseNumber = function(value) {
            if (value == null) {
                return NaN;
            }

            switch (typeof value) {
                case "number":
                    return value;
                case "string":
                    value = StringUtil.trim(value);
                    return value ? Number(value) : NaN;
                case "boolean":
                    return value ? 1 : 0;
            }

            return NaN;
        };

        DataUtil.parseBoolean = function(value) {
            if (value == null) {
                return false;
            }

            switch (typeof value) {
                case "boolean":
                    return value;
                case "string":
                    value = StringUtil.trim(value.toLowerCase());
                    return ((value === "true") || (value === "t") || (value === "yes") || (value === "y") || (Number(value) > 0));
                case "number":
                    return (value > 0);
            }

            return false;
        };

        DataUtil.parseString = function(value) {
            if (value == null) {
                return null;
            }

            return String(value);
        };

    });

});
