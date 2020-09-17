define(['underscore', '../check', '../types'], function(_, check, types) {

    var COND_FUNCTIONS = {};

    // register a new function
    function register(name, fn, checkArgs, returns) {
        COND_FUNCTIONS[name] = {
            checkArguments: checkArgs,
            evaluatedArgs: false,
            evaluate: fn,
            type: returns
        };
    }

    /**
     * if(X, Y, Z)
     * This function takes three arguments. The first argument X must be a Boolean expression. If X evaluates to TRUE,
     * the result is the second argument Y. If, X evaluates to FALSE, the result evaluates to the third argument Z.
     * @param x
     * @param y
     * @param z
     * @returns {*}
     */
    function evalIf(x, y, z) {
        var condResult = x.evaluate(this);
        if (condResult === true) {
            return y.evaluate(this);
        } else {
            return z.evaluate(this);
        }
    }

    register('if', evalIf, check.all(check.length(3), check.type(0, types.BOOLEAN)));


    /**
     * CASE(X, Y, ...)
     * This function takes pairs of arguments X and Y. The X arguments are Boolean expressions that will be evaluated
     * from first to last. When the first X expression is encountered that evaluates to TRUE, the corresponding Y
     * argument will be returned. The function defaults to NULL if none are true.
     * @returns {*}
     */
    function evalCase(/* cond, expr, ... */) {
        var exprs = Array.prototype.slice.call(arguments, 0);
        while (exprs.length) {
            var cond = exprs.shift();
            var res = exprs.shift();
            if (cond.evaluate(this)) {
                return res.evaluate(this);
            }
        }
        return null;
    }

    function checkCaseArguments(args) {
        if (args.length >= 2 && args.length % 2 === 0) {
            for (var i = 0; i < args.length; i += 2) {
                if (!check.type(i, types.BOOLEAN).call(this, args)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    register('case', evalCase, checkCaseArguments);


    /**
     * coalesce(X,...)
     * This function takes an arbitrary number of arguments and returns the first value that is not null.
     * @returns {*}
     */
    function evalCoalesce(/* expressions... */) {
        var expressions = Array.prototype.slice.call(arguments, 0);
        while (expressions.length) {
            var expr = expressions.shift();
            var value = expr.evaluate(this);
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    register('coalesce', evalCoalesce, check.length(2, -1));
    register('ifnull', evalCoalesce, check.length(2, -1));


    /**
     * validate(X,Y,...)
     * This function takes pairs of arguments, Boolean expressions X and strings Y. The function returns the string Y
     * corresponding to the first expression X that evaluates to False and defaults to NULL if all are True.
     * @returns {*}
     */
    function evalValidate(/* expressions... */) {
        var exprs = Array.prototype.slice.call(arguments, 0);
        while (exprs.length) {
            var cond = exprs.shift();
            var res = exprs.shift();
            if (!cond.evaluate(this)) {
                return res.evaluate(this);
            }
        }
        return null;
    }

    function checkValidateArgs(args) {
        if (args.length >= 2 && args.length % 2 === 0) {
            for (var i = 0; i < args.length; i += 2) {
                if (!check.type(i, types.BOOLEAN).call(this, args)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    register('validate', evalValidate, checkValidateArgs);

    /**
     * nullif(X,Y)
     * This function takes two arguments, fields X and Y, and returns the X if the arguments are different.
     * It returns NULL, otherwise.
     * @param x
     * @param y
     * @returns {*}
     */
    function evalNullIf(x, y) {
        x = x.evaluate(this);
        y = y.evaluate(this);
        if (x !== y) {
            return x;
        } else {
            return null;
        }
    }

    register('nullif', evalNullIf, check.length(2));

    return COND_FUNCTIONS;
});