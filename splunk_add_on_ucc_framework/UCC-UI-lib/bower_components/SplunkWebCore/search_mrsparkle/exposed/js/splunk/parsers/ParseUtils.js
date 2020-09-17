define(function(require, exports, module) {

    var Class = require("jg/Class");

    return Class(module.id, function(ParseUtils) {

        // Private Static Constants

        var _UNESCAPE_PATTERN = /\\([.\n\r]?)/g;
        var _ESCAPE_SLASH_PATTERN = /\\/g;
        var _ESCAPE_QUOTE_PATTERN = /"/g;
        var _TRIM_PATTERN = /^[\s\xA0\u2028\u2029\uFEFF]+|[\s\xA0\u2028\u2029\uFEFF]+$/g;

        // Public Static Methods

        ParseUtils.prepareArray = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            if (!str) {
                return null;
            }

            var length = str.length;
            if (length < 2) {
                return null;
            }

            if (str.charAt(0) != "[") {
                return null;
            }

            if (str.charAt(length - 1) != "]") {
                return null;
            }

            str = str.substring(1, length - 1);
            length = str.length;

            var arr = [];
            var index = -1;
            var value;

            while (index < length) {
                index++;
                value = _readUntil(str, index, ",");
                index += value.length;

                value = ParseUtils.trimWhiteSpace(value);
                if (value || (index < length) || (arr.length > 0)) {
                    arr.push(ParseUtils.unescapeString(value));
                }
            }

            return arr;
        };

        ParseUtils.prepareObject = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            if (!str) {
                return null;
            }

            var length = str.length;
            if (length < 2) {
                return null;
            }

            if (str.charAt(0) != "{") {
                return null;
            }

            if (str.charAt(length - 1) != "}") {
                return null;
            }

            str = str.substring(1, length - 1);
            length = str.length;

            var obj = {};
            var index = 0;
            var key;
            var value;

            while (index < length) {
                key = _readUntil(str, index, ":");
                index += key.length + 1;

                if (index > length) {
                    break;
                }

                value = _readUntil(str, index, ",");
                index += value.length + 1;

                key = ParseUtils.unescapeString(key);
                if (key) {
                    obj[key] = ParseUtils.unescapeString(value);
                }
            }

            return obj;
        };

        ParseUtils.prepareTuple = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            if (!str) {
                return null;
            }

            var length = str.length;
            if (length < 2) {
                return null;
            }

            if (str.charAt(0) != "(") {
                return null;
            }

            if (str.charAt(length - 1) != ")") {
                return null;
            }

            str = str.substring(1, length - 1);
            length = str.length;

            var arr = [];
            var index = -1;
            var value;

            while (index < length) {
                index++;
                value = _readUntil(str, index, ",");
                index += value.length;

                value = ParseUtils.trimWhiteSpace(value);
                if (value || (index < length) || (arr.length > 0)) {
                    arr.push(ParseUtils.unescapeString(value));
                }
            }

            return arr;
        };

        ParseUtils.unescapeString = function(str) {
            str = ParseUtils.trimWhiteSpace(str);
            if (!str) {
                return str;
            }

            var length = str.length;
            if (length < 2) {
                return str;
            }

            if (str.charAt(0) != "\"") {
                return str;
            }

            if (str.charAt(length - 1) != "\"") {
                return str;
            }

            str = str.substring(1, length - 1);
            if (!str) {
                return str;
            }

            str = str.replace(_UNESCAPE_PATTERN, "$1");

            return str;
        };

        ParseUtils.escapeString = function(str) {
            if ((str == null) || !Class.isString(str)) {
                return null;
            }

            // two simple replace calls are faster than str.replace(/([\\"])/g, "\\$1")
            str = str.replace(_ESCAPE_SLASH_PATTERN, "\\\\");
            str = str.replace(_ESCAPE_QUOTE_PATTERN, "\\\"");

            return "\"" + str + "\"";
        };

        ParseUtils.trimWhiteSpace = function(str) {
            if ((str == null) || !Class.isString(str)) {
                return null;
            }

            if (!str) {
                return str;
            }

            return str.replace(_TRIM_PATTERN, "");
        };

        ParseUtils.isEmpty = function(str) {
            return ((str == null) || (str === ""));
        };

        // Private Static Methods

        var _readUntil = function(str, startIndex, endChar) {
            var substr = "";

            var index = startIndex;
            var length = str.length;
            var ch;
            var isQuote = false;
            var nestLevel = 0;
            var nestBeginChar;
            var nestEndChar;

            while (index < length) {
                ch = str.charAt(index);
                if (isQuote) {
                    if (ch == "\"") {
                        isQuote = false;
                    } else if (ch == "\\") {
                        substr += ch;
                        index++;
                        ch = str.charAt(index);
                    }
                } else if (nestLevel > 0) {
                    if (ch == nestEndChar) {
                        nestLevel--;
                    } else if (ch == nestBeginChar) {
                        nestLevel++;
                    } else if (ch == "\"") {
                        isQuote = true;
                    }
                } else if (ch != endChar) {
                    if (ch == "[") {
                        nestLevel = 1;
                        nestBeginChar = "[";
                        nestEndChar = "]";
                    } else if (ch == "{") {
                        nestLevel = 1;
                        nestBeginChar = "{";
                        nestEndChar = "}";
                    } else if (ch == "(") {
                        nestLevel = 1;
                        nestBeginChar = "(";
                        nestEndChar = ")";
                    } else if (ch == "\"") {
                        isQuote = true;
                    }
                } else {
                    break;
                }

                substr += ch;
                index++;
            }

            return substr;
        };

    });

});
