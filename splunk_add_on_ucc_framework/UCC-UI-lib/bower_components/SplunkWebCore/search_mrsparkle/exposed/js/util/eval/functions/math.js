define(['underscore', '../check', '../types'], function(_, check, types) {

    var MATH_FUNCTIONS = {};

    // register a new math function
    function register(name, fn, checkArgs, returns) {
        MATH_FUNCTIONS[name] = {
            checkArguments: checkArgs,
            evaluatedArgs: true,
            evaluate: fn,
            type: returns
        };
    }

    /**
     * This function takes a number n and returns its absolute value.
     * @param n
     * @returns {number}
     */
    function evalAbs(n) {
        n = types.asNumeric(n);
        return n != null && _.isNumber(n) ? Math.abs(n) : null;
    }

    register('abs', evalAbs, check.all(check.length(1), check.type(0, types.NUMBER)), types.NUMBER);


    /**
     * This function rounds a number n up to the next highest integer.
     * @param n
     * @returns {number}
     */
    function evalCeil(n) {
        n = types.asNumeric(n);
        return n != null && _.isNumber(n) ? Math.ceil(n) : null;
    }

    register('ceil', evalCeil, check.all(check.length(1), check.type(0, types.NUMBER)), types.NUMBER);
    register('ceiling', evalCeil, check.all(check.length(1), check.type(0, types.NUMBER)), types.NUMBER);

    /**
     * This function rounds a number n down to the nearest whole integer
     * @param n
     * @returns {number}
     */
    function evalFloor(n) {
        n = types.asNumeric(n);
        return n != null && _.isNumber(n) ? Math.floor(n) : null;
    }

    register('floor', evalFloor, check.all(check.length(1), check.type(0, types.NUMBER)), types.NUMBER);

    /**
     * This function takes a number x and returns e^x
     * @param x
     * @returns {number}
     */
    function evalExp(x) {
        x = types.asNumeric(x);
        return x != null && _.isNumber(x) ? Math.exp(x) : null;
    }

    register('exp', evalExp, check.all(check.length(1), check.type(0, types.NUMBER)), types.NUMBER);

    /**
     * Returns the PI constant
     * @returns {number}
     */
    function evalPi() {
        return Math.PI;
    }

    register('pi', evalPi, check.length(0), types.NUMBER);


    /**
     * This function takes two numeric arguments X and Y and returns X^Y.
     * @param x - base
     * @param y - exponent
     * @returns {number}
     */
    function evalPow(x, y) {
        x = types.asNumeric(x);
        y = types.asNumeric(y);
        if (_.isNumber(x) && _.isNumber(y)) {
            return Math.pow(x, y);
        } else {
            return null;
        }
    }

    register('pow', evalPow, check.all(check.length(2), check.type(0, types.NUMBER), check.type(1, types.NUMBER)), types.NUMBER);

    /**
     * sqrt(X)
     * This function takes one numeric argument X and returns its square root.
     * @param x
     * @returns {number}
     */
    function evalSqrt(x) {
        x = types.asNumeric(x);
        return _.isNumber(x) ? Math.sqrt(x) : null;
    }

    register('sqrt', evalSqrt, check.all(check.length(1), check.type(0, types.NUMBER)), types.NUMBER);

    /**
     * ln(X)
     * This function takes a number X and returns its natural log (base e).
     * @param x
     * @returns {number}
     */
    function evalLn(x) {
        x = types.asNumeric(x);
        return _.isNumber(x) ? Math.log(x) : null;
    }

    register('ln', evalLn, check.all(check.length(1), check.type(0, types.NUMBER)), types.NUMBER);

    /**
     * log(X,Y)
     * log(X)
     * This function takes either one or two numeric arguments and returns the log of the first argument X using the
     * second argument Y as the base. If the second argument Y is omitted, this function evaluates the log of number
     * X with base 10.
     * @param x
     * @param y
     * @returns {number}
     */
    function evalLog(x, y) {
        x = types.asNumeric(x);
        y = types.asNumeric(y);
        return _.isNumber(x) ? Math.log(x) / Math.log(y != null ? y : 10) : null;
    }

    register('log', evalLog, check.all(
        check.length(1, 2),
        check.type(0, types.NUMBER),
        check.type(1, types.NUMBER)
    ), types.NUMBER);

    /**
     * min(X,...)
     * This function takes an arbitrary number of numeric or string arguments, and returns the min;
     * strings are greater than numbers.
     * @returns {*}
     */
    function evalMin(/* args... */) {
        return _(arguments).min(function(v) {
            return v;
        });
    }

    register('min', evalMin, check.length(1, -1));

    /**
     * max(X,...)
     * This function takes an arbitrary number of numeric or string arguments, and returns the max;
     * strings are greater than numbers.
     * @returns {*}
     */
    function evalMax(/* args... */) {
        return _(arguments).max(function(v) {
            return v;
        });
    }

    register('max', evalMax, check.length(1, -1));


    /**
     * round(X,Y)
     * This function takes one or two numeric arguments X and Y, returning X rounded to the amount of decimal places
     * specified by Y. The default is to round to an integer.
     * @param n
     * @param prec
     * @returns {*}
     */
    function evalRound(n, prec) {
        n = types.asNumeric(n);
        prec = types.asNumeric(prec);
        if (_.isNumber(n)) {
            if (prec == null) {
                prec = 0;
            }
            if (_.isNumber(prec)) {
                var f = Math.pow(10, prec);
                return Math.round(n * f) / f;
            }
        }
        return null;
    }

    register('round', evalRound, check.all(
        check.length(1, 2),
        check.type(0, types.NUMBER),
        check.type(1, types.NUMBER)
    ), types.NUMBER);

    /**
     * random()
     * This function takes no arguments and returns a pseudo-random integer ranging from zero to 2^31-1,
     * for example: 0 ... 2147483647
     * @returns {Number}
     */
    function evalRandom() {
        return parseInt(Math.random() * 0x7FFFFFFF, 10);
    }

    register('random', evalRandom, check.length(0), types.NUMBER);

    return MATH_FUNCTIONS;
});