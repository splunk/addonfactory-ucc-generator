define(['underscore', '../check', '../types'], function(_, check, types) {

    var TYPE_FUNCTIONS = {};

    // register a new type function
    function register(name, fn, checkArgs, returns) {
        TYPE_FUNCTIONS[name] = {
            checkArguments: checkArgs,
            evaluatedArgs: true,
            evaluate: fn,
            type: returns
        };
    }

    /**
     * isbool(X)
     * This function takes one argument X and returns TRUE if X is Boolean.
     * @param x
     * @returns {boolean}
     */
    function evalIsBool(x) {
        return types.of(x) === types.BOOLEAN;
    }

    register('isbool', evalIsBool, check.length(1), types.BOOLEAN);

    /**
     * typeof(X)
     * This function takes one argument and returns a string representation of its type.
     * @param x
     * @returns {*}
     */
    function evalTypeOf(x) {
        return types.typeNameOf(x);
    }

    register('typeof', evalTypeOf, check.length(1), types.STRING);

    /**
     * isnull(X)
     * This function takes one argument X and returns TRUE if X is NULL.
     * @param x
     * @returns {boolean}
     */
    function evalIsNull(x) {
        return x == null;
    }

    register('isnull', evalIsNull, check.length(1), types.BOOLEAN);

    /**
     * isnotnull(X)
     * This function takes one argument X and returns TRUE if X is not NULL. This is a useful check for whether or not
     * a field (X) contains a value.
     * @param x
     * @returns {boolean}
     */
    function evalIsNotNull(x) {
        return x != null;
    }

    register('isnotnull', evalIsNotNull, check.length(1), types.BOOLEAN);


    /**
     * isnum(X)
     * This function takes one argument X and returns TRUE if X is a number.
     * @param x
     * @returns {boolean}
     */
    function evalIsNum(x) {
        return types.of(x) === types.NUMBER && isFinite(x);
    }

    register('isnum', evalIsNum, check.length(1), types.BOOLEAN);


    /**
     * isint(X)
     * This function takes one argument X and returns TRUE if X is an integer.
     * @param x
     * @returns {boolean}
     */
    function evalIsInt(x) {
        return types.of(x) === types.NUMBER && isFinite(x) && x % 1 === 0;
    }

    register('isint', evalIsInt, check.length(1), types.BOOLEAN);


    /**
     * isstr(X)
     * This function takes one argument X and returns TRUE if X is a string.
     * @param x
     * @returns {boolean}
     */
    function evalIsStr(x) {
        return types.of(x) === types.STRING;
    }

    register('isstr', evalIsStr, check.length(1), types.BOOLEAN);

    /**
     * false()
     * Returns the boolean value true
     * @returns {boolean}
     */
    function evalTrue() {
        return true;
    }

    register('true', evalTrue, check.length(0), types.BOOLEAN);

    /**
     * true()
     * Returns the boolean value false
     * @returns {boolean}
     */
    function evalFalse() {
        return false;
    }

    register('false', evalFalse, check.length(0), types.BOOLEAN);

    /**
     * null()
     * Return the NULL value
     * @returns {null}
     */
    function evalNull() {
        return null;
    }

    register('null', evalNull, check.length(0), types.NULL_TYPE);

    return TYPE_FUNCTIONS;
});