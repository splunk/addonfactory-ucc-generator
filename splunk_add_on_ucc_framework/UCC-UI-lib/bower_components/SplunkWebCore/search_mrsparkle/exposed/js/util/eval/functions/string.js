define([
    'underscore',
    '../check',
    '../types',
    'util/moment',
    'util/numeral',
    '../like'
], function(_, check, types, moment, numeral, like) {
    var STRING_FUNCTIONS = {};

    // register a new string function
    function register(name, fn, checkArgs, returns, expandMV) {
        STRING_FUNCTIONS[name] = {
            checkArguments: checkArgs,
            evaluatedArgs: true,
            expandMultiValueArg: expandMV,
            evaluate: fn,
            type: returns || types.STRING
        };
    }

    /**
     * len(X)
     * This function returns the character length of a string X.
     * @param v
     * @returns {number}
     */
    function evalLen(v) {
        return v != null ? String(v).length : null;
    }

    register('len', evalLen, check.all(check.length(1), check.type(0, types.STRING, types.NUMBER)), types.NUMBER);

    /**
     * tostring(X,Y)
     * This function converts the input value to a string. If the input value is a number, it reformats it as a string.
     * If the input value is a Boolean value, it returns the corresponding string value, "True" or "False".
     *
     * This function requires at least one argument X; if X is a number, the second argument Y is optional and can
     * be "hex" "commas" or "duration":
     *  - tostring(X,"hex") converts X to hexadecimal.
     *  - tostring(X,"commas") formats X with commas and, if the number includes decimals, rounds to nearest two
     *    decimal places.
     *  - tostring(X,"duration") converts seconds X to readable time format HH:MM:SS.
     *
     * @param val X
     * @param type Y
     * @returns {*}
     */
    function evalToString(val, type) {
        if (!type) {
            if (val == null) {
                return "Null";
            }
            if (_.isBoolean(val)) {
                return val ? "True" : "False";
            }
            return String(val);
        } else {
            switch (type.toLowerCase()) {
                case 'hex':
                    val = types.asNumeric(val);
                    if (_.isNumber(val) && isFinite(val) && val % 1 === 0) {
                        return '0x' + val.toString(16).toUpperCase();
                    }
                    break;
                case 'commas':
                    val = types.asNumeric(val);
                    if (_.isNumber(val)) {
                        return numeral(val).format('0,0[.]00');
                    }
                    break;
                case 'duration':
                    val = types.asNumeric(val);
                    if (_.isNumber(val) && val >= 0) {
                        var dur = moment.duration(val, 'seconds');
                        var days = dur.years() * 365 + dur.months() * 30 + dur.days();
                        var ms = dur.milliseconds();
                        var pad = function(n) {
                            return (n < 10 ? '0' : '') + n;
                        };
                        return (days > 0 ? days + '+' : '') +
                            pad(dur.hours()) + ':' +
                            pad(dur.minutes()) + ':' +
                            pad(dur.seconds()) +
                            (ms > 0 ? '.' + ms : '');
                    }
                    break;
            }
        }
        return null;
    }

    function checkToStringTypeArgs(args) {
        if (args.length === 2) {
            return args[0].mightBeNumeric();
        }
        return true;
    }

    register('tostring', evalToString, check.all(check.length(1, 2), check.type(1, types.STRING), checkToStringTypeArgs));


    /**
     * tonumber(NUMSTR,BASE)
     * tonumber(NUMSTR)
     * This function converts the input string NUMSTR to a number, where BASE is optional and used to define the
     * base of the number to convert to. BASE can be 2..36, and defaults to 10. If tonumber cannot parse a field
     * value to a number, the function returns NULL.  If tonumber cannot parse a literal string to a number,
     * it throws an error.
     * @param numstr
     * @param base
     * @returns {Number}
     */
    function evalToNumber(numstr, base) {
        if (base == null) {
            base = 10;
        } else {
            if ((!_.isNumber(base)) || base < 2 || base > 36) {
                throw new Error('Invalid base for tonumber(): ' + JSON.stringify(base));
            }
        }

        if (base === 10) {
            return parseFloat(numstr);
        } else {
            return parseInt(numstr, base);
        }
    }

    register('tonumber', evalToNumber, check.all(
        check.length(1, 2),
        check.type(0, types.STRING, types.NUMBER),
        check.type(1, types.NUMBER)
    ), types.NUMBER);

    /**
     * lower(X)
     * This function takes one string argument and returns the lowercase version. The upper() function also exists
     * for returning the uppercase version.
     * @param x
     * @returns {string}
     */
    function evalLower(x) {
        return x != null ? String(x).toLowerCase() : null;
    }

    register('lower', evalLower, check.all(check.length(1), check.type(0, types.STRING, types.MV)), types.STRING, true);

    /**
     * upper(X)
     * This function takes one string argument and returns the uppercase version. The lower() function also exists
     * for returning the lowercase version.
     * @param x
     * @returns {string}
     */
    function evalUpper(x) {
        return x != null ? String(x).toUpperCase() : null;

    }

    register('upper', evalUpper, check.all(check.length(1), check.type(0, types.STRING, types.MV)), types.STRING, true);

    /**
     * ltrim(X,Y)
     * ltrim(X)
     * This function takes one or two string arguments X and Y and returns X with the characters in Y trimmed from the
     * left side. If Y is not specified, spaces and tabs are trimmed.
     *
     * @param str X
     * @param chars Y
     * @returns {string}
     */
    function evalLTrim(str, chars) {
        if (str != null) {
            str = String(str);
            if (chars == null) {
                chars = ' \t';
            }
            var i = 0;
            while (i < str.length && chars.indexOf(str.charAt(i)) != -1) {
                i++;
            }
            return str.substring(i);
        }
    }

    register('ltrim', evalLTrim, check.all(
        check.length(1, 2),
        check.type(0, types.NUMBER, types.STRING, types.MV),
        check.type(1, types.STRING)
    ), types.STRING);

    /**
     * rtrim(X,Y)
     * rtrim(X)
     * This function takes one or two string arguments X and Y and returns X with the characters in Y trimmed from the
     * right side. If Y is not specified, spaces and tabs are trimmed.
     *
     * @param str X
     * @param chars Y
     * @returns {string}
     */
    function evalRTrim(str, chars) {
        if (str != null) {
            str = String(str);
            if (chars == null) {
                chars = ' \r\n\t';
            }
            var i = str.length - 1;
            while (i > 0 && chars.indexOf(str.charAt(i)) != -1) {
                i--;
            }
            return str.substring(0, i + 1);
        }
    }

    register('rtrim', evalRTrim, check.all(
        check.length(1, 2),
        check.type(0, types.NUMBER, types.STRING, types.MV),
        check.type(1, types.STRING)
    ), types.STRING);


    /**
     * trim(X,Y)
     * trim(X)
     * This function takes one or two string arguments X and Y and returns X with the characters in Y trimmed from
     * both sides. If Y is not specified, spaces and tabs are trimmed.
     *
     * @param str X
     * @param chars Y
     * @returns {string}
     */
    function evalTrim(str, chars) {
        return evalRTrim(evalLTrim(str, chars), chars);
    }

    register('trim', evalTrim, check.all(
        check.length(1, 2),
        check.type(0, types.NUMBER, types.STRING, types.MV),
        check.type(1, types.STRING)
    ), types.STRING);


    /**
     * substr(X,Y,Z)
     * This function takes either two or three arguments, where X is a string and Y and Z are numeric. It returns a
     * substring of X, starting at the index specified by Y with the number of characters specified by Z. If Z is
     * not given, it returns the rest of the string.
     * The indexes follow SQLite semantics; they start at 1. Negative indexes can be used to indicate a start from
     * the end of the string.
     *
     * @param str X
     * @param start Y
     * @param len Z
     * @returns {*}
     */
    function evalSubstr(str, start, len) {
        if (len != null && len < 0) {
            return null;
        }
        var a = start < 0 ? str.length + start : start === 0 ? 0 : start - 1;
        var b = len != null ? a + len : str.length;
        return str.substring(a, b);
    }

    register('substr', evalSubstr, check.all(
        check.length(2, 3),
        check.type(0, types.STRING), check.type(1, types.NUMBER), check.type(2, types.NUMBER)
    ), types.STRING);


    // String matching functions

    /**
     * like(TEXT, PATTERN)
     * This function takes two arguments, a string to match TEXT and a match expression string PATTERN.  It returns
     * TRUE if and only if the first argument is like the SQLite pattern in Y.  The pattern language supports exact
     * text match, as well as % characters for wildcards and _ characters for a single character match.
     *
     * @param text
     * @param pattern
     * @returns {boolean}
     */
    function evalLike(text, pattern) {
        return like(text, pattern);
    }

    register('like', evalLike, check.all(
        check.length(2), check.type(0, types.STRING), check.type(1, types.STRING)
    ), types.BOOLEAN);

    /**
     * match(SUBJECT, "REGEX")
     * This function compares the regex string REGEX to the value of SUBJECT and returns a Boolean value. It returns
     * true if the REGEX can find a match against any substring of SUBJECT.
     *
     * @param subject
     * @param regex
     * @returns {boolean}
     */
    function evalMatch(subject, regex) {
        var pat = new RegExp(regex, "g");
        return pat.test(subject);
    }

    register('match', evalMatch, check.all(
        check.length(2), check.type(0, types.STRING), check.type(1, types.STRING)
    ), types.BOOLEAN);

    /**
     * replace(X,Y,Z)
     * This function returns a string formed by substituting string Z for every occurrence of regex string Y
     * in string X. The third argument Z can also reference groups that are matched in the regex.
     *
     * @param str X
     * @param pattern Y
     * @param repl Z
     * @returns {*}
     */
    function evalReplace(str, pattern, repl) {
        return str.replace(new RegExp(pattern, "g"), repl);
    }

    register('replace', evalReplace, check.all(
        check.length(3),
        check.type(0, types.STRING), check.type(1, types.STRING), check.type(2, types.STRING)
    ), types.STRING, true);

    return STRING_FUNCTIONS;
});
