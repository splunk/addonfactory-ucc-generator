define([
    'underscore',
    '../check',
    '../types',
    'util/moment',
    'util/moment/relative',
    'util/moment/strftime'
], function(_, check, types, moment) {

    var TIME_FUNCTIONS = {};

    // register a new time function
    function register(name, fn, checkArgs, returns) {
        TIME_FUNCTIONS[name] = {
            checkArguments: checkArgs,
            evaluatedArgs: true,
            evaluate: fn,
            type: returns
        };
    }

    /**
     * now()
     * This function takes no arguments and returns the time that the search was started. The time is represented in
     * Unix time or seconds since epoch.
     * @returns {number}
     */
    function evalNow() {
        return moment().unix();
    }

    register('now', evalNow, check.length(0), types.NUMBER);

    /**
     * time()
     * This function returns the wall-clock time with microsecond resolution. The value of time() will be different
     * for each event based on when that event was processed by the eval command.
     * @returns {number}
     */
    function evalTime() {
        return +new Date() / 1000;
    }

    register('time', evalTime, check.length(0), types.NUMBER);

    /**
     * relative_time(X,Y)
     * This function takes an epoch time time, X, as the first argument and a relative time specifier, Y, as the second
     * argument and returns the epoch time value of Y applied to X.
     * @param x
     * @param y
     * @returns {*}
     */
    function evalRelativeTime(x, y) {
        return moment.unix(x).applyRelative(y).unix();
    }

    register('relative_time', evalRelativeTime, check.all(
        check.length(2), check.type(0, types.NUMBER, types.STRING), check.type(1, types.STRING)
    ), types.NUMBER);

    /**
     * strptime(X,Y)
     * This function takes a time represented by a string, X, and parses it into a timestamp using the format
     * specified by Y.
     * @param x
     * @param y
     * @returns {*}
     */
    function evalStrptime(x, y) {
        var m = moment.strptime(x, y);
        return m.isValid ? m.unix() : null;
    }

    register('strptime', evalStrptime, check.all(
        check.length(2),
        check.type(0, types.STRING),
        check.type(1, types.STRING),
        function(args) {
            var fmt = args[1].compileTimeValue();
            if (fmt !== undefined && !moment.isValidStrftimeSpecifier(fmt)) {
                throw new Error('Invalid strftime specifier provided: ' + JSON.stringify(fmt));
            }
            return true;
        }
    ), types.NUMBER);

    /**
     * strftime(X,Y)
     * This function takes an epochtime value, X, as the first argument and renders it as a string using the format
     * specified by Y.
     * @param x
     * @param y
     * @returns {*}
     */
    function evalStrftime(x, y) {
        return moment.unix(x).strftime(y);
    }

    register('strftime', evalStrftime, check.all(
        check.length(2),
        check.type(0, types.STRING, types.NUMBER),
        check.type(1, types.STRING),
        function(args) {
            var fmt = args[1].compileTimeValue();
            if (fmt !== undefined && !moment.isValidStrftimeSpecifier(fmt)) {
                throw new Error('Invalid strftime specifier provided: ' + JSON.stringify(fmt));
            }
            return true;
        }
    ), types.STRING);


    return TIME_FUNCTIONS;
});