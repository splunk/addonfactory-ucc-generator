define(['underscore', '../check', '../types'], function(_, check, types) {
    var MV_FUNCTIONS = {};

    // register a new type function
    function register(name, fn, checkArgs, returns, evaluatedArgs) {
        MV_FUNCTIONS[name] = {
            checkArguments: checkArgs,
            evaluatedArgs: evaluatedArgs !== false,
            evaluate: fn,
            type: returns
        };
    }

    /**
     * split(X,"Y")
     * This function takes two arguments, field X and delimiting character Y. It splits the value(s) of X on the
     * delimiter Y and returns X as a multi-valued field.
     *
     * @param text X
     * @param by Y
     * @returns {Array|*}
     */
    function mvSplit(text, by) {
        return text != null ? text.split(by) : null;
    }

    register('split', mvSplit, check.all(check.length(2), check.type(0, types.STRING)), types.MV);

    /**
     * mvappend(X,"Y",Z)
     * This function takes three arguments, two strings or fields X and Z and one string Y, and returns a multivalued
     * result. The result is the value or values of X, the value of Y, and the value or values of Z all appended to
     * one multivalued result. The fields X and Z can be either multi or single valued fields.
     *
     * @returns {Array|*}
     */
    function mvAppend(/* args... */) {
        var result = _(arguments).chain()
            .map(function(arg) {
                return arg == null ? [] : arg;
            })
            .flatten()
            .value();
        return result.length ? result : null;
    }

    function checkMvAppendArgs(args) {
        return args.length > 1 && _.all(args, function(expr) {
                return expr.mightBeString() || expr.mightBeMultiValue();
            });
    }


    register('mvappend', mvAppend, checkMvAppendArgs, types.MV);

    /**
     * mvcount(MVFIELD)
     * This function takes an field MVFIELD and returns the number of values of that field if the field is
     * multi-valued, 1 if the field is single valued, and NULL otherwise.
     * @param val
     * @returns {*}
     */
    function mvCount(val) {
        return val != null ? (_.isArray(val) ? val.length : 1) : null;
    }

    register('mvcount', mvCount, check.all(check.length(1), check.type(0, types.MV, types.STRING)), types.NUMBER);

    /**
     * mvfind(MVFIELD,"REGEX")
     * This function tries to find a value in multivalued field X that matches the regular expression REGEX. If a
     * match exists, the index of the first matching value is returned (beginning with zero). If no values match,
     * NULL is returned.
     * @param values MVFIELD
     * @param pattern REGEX
     * @returns {*}
     */
    function mvFind(values, pattern) {
        var rex = new RegExp(pattern);
        var result = null;
        _([values]).chain().flatten().any(function(val, index) {
            if (val != null && String(val).match(rex)) {
                result = index;
                return true;
            }
        });
        return result;
    }

    register('mvfind', mvFind, check.all(check.length(2), check.type(0, types.MV, types.STRING), check.type(1, types.STRING)), types.MV);

    /**
     * mvindex(MVFIELD,STARTINDEX, ENDINDEX)
     * mvindex(MVFIELD,STARTINDEX)
     *
     * This function takes two or three arguments, field MVIELD and numbers STARTINDEX and ENDINDEX, and returns a
     * subset of the multi-valued field using the indexes provided.
     *
     * For mvindex(mvfield, startindex, [endindex]), endindex is inclusive and optional; both startindex and endindex
     * can be negative, where -1 is the last element. If endindex is not specified, it returns just the value at
     * startindex. If the indexes are out of range or invalid, the result is NULL.
     *
     * @param values MVFIELD
     * @param start STARTINDEX
     * @param end ENDINDEX
     * @returns {Array|*}
     */
    function mvIndex(values, start, end) {
        if (values == null) {
            return null;
        }
        values = _.isArray(values) ? values : [values];
        return end == null ? values[start] : values.slice(start, end+1);
    }

    register('mvindex', mvIndex, check.all(
        check.length(2, 3),
        check.type(0, types.MV, types.STRING), check.type(1, types.NUMBER), check.type(2, types.NUMBER)
    ), types.MV);

    /**
     * mvjoin(MVFIELD,STR)
     * This function takes two arguments, multi-valued field MVFIELD and string delimiter STR, and concatenates
     * together the individual values of MVFIELD with copies of STR in between as separators.
     *
     * @param values MVFIELD
     * @param joinWith STR
     * @returns {string|*}
     */
    function mvJoin(values, joinWith) {
        if (values != null) {
            return (_.isArray(values) ? values : [values]).join(joinWith);
        }
    }

    register('mvjoin', mvJoin, check.all(
        check.length(2), check.type(0, types.MV, types.STRING), check.type(1, types.STRING)
    ), types.STRING);

    /**
     * mvdedup(X)
     * This function takes a multi-valued field X and returns a multi-valued field with its duplicate values removed.
     * @param values X
     * @returns {Array|*}
     */
    function mvDedup(values) {
        return values != null ? _(_.isArray(values) ? values : [values]).unique() : null;
    }

    register('mvdedup', mvDedup, check.all(
        check.length(1), check.type(0, types.MV, types.STRING)
    ), types.MV);

    /**
     * mvsort(X)
     * This function takes a multivalued field X and returns a multi-valued field with its values sorted lexicographically.
     * @param values X
     */
    function mvSort(values) {
        if (values != null) {
            var array = _.isArray(values) ? [].concat(values) : [values];
            array.sort();
            return array;
        } else {
            return null;
        }
    }

    register('mvsort', mvSort, check.all(
        check.length(1), check.type(0, types.MV, types.STRING)
    ), types.MV);

    /**
     * mvrange(X,Y,Z)
     * This function creates a multi-valued field for a range of numbers. It takes up to three arguments:
     * a starting number X,
     * an ending number Y (exclusive),
     * and an optional step increment Z.
     * If the increment is a timespan (such as '7'd), the starting and ending numbers are treated as epoch times.
     * @param x
     * @param y
     * @param z
     */
    function mvRange(x, y, z) {
        return _.map(_.range(x, y, z != null ? z : 1), String);
    }

    register('mvrange', mvRange, check.all(
        check.length(2, 3),
        check.type(0, types.NUMBER), check.type(1, types.NUMBER), check.type(2, types.NUMBER, types.STRING)
    ), types.MV);

    /**
     * mvzip(X,Y,"Z")
     * This function takes two multi-valued fields, X and Y, and combines them by stitching together the first value
     * of X with the first value of field Y, then the second with the second, etc. The third argument, Z, is optional
     * and used to specify a delimiting character to join the two values. The default delimiter is a comma. This is
     * similar to Python's zip command.
     * @param values1 X
     * @param values2 Y
     * @param delim Z
     */
    function mvZip(values1, values2, delim) {
        if (values1 == null || values2 == null) {
            return null;
        }
        if (delim == null) {
            delim = ',';
        }
        values1 = _.isArray(values1) ? values1 : [values1];
        values2 = _.isArray(values2) ? values2 : [values2];
        return _(_.zip(values1, values2)).map(function(pair) {
            return pair.join(delim);
        });
    }

    register('mvzip', mvZip, check.all(
        check.length(2, 3),
        check.type(0, types.MV, types.STRING), check.type(1, types.MV, types.STRING), check.type(2, types.STRING)
    ), types.MV);


    /**
     * mvfilter(X)
     * This function filters a multi-valued field based on an arbitrary Boolean expression X. The Boolean expression
     * X can reference ONLY ONE field at a time.
     * Note: This function will return NULL values of the field x as well. If you don't want the NULL values, use
     * the expression: mvfilter(x!=NULL).
     */
    function mvFilter(arg) {
        var context = this;
        // Find single referenced variable used in the expression
        var variable = arg.findVariables(true)[0];
        var values = context.getVar(variable);
        if (values != null) {
            return _.filter(_.isArray(values) ? values : [values], function(value) {
                var newBinding = {};
                newBinding[variable] = value;
                return arg.evaluate(context.extend(newBinding));
            });
        }
        return null;
    }

    function checkMvFilterVariables(args) {
        var variables = args[0].findVariables(true);
        if (variables.length !== 1) {
            throw new Error('Found ' + variables.length + ' referenced variables inside the mvfilter argument. ' +
            'Only one can be referenced at a time.');
        }
        return true;
    }
    
    register('mvfilter', mvFilter, check.all(
        check.length(1), check.type(0, types.BOOLEAN), checkMvFilterVariables
    ), types.MV, false);
    
    return MV_FUNCTIONS;
});