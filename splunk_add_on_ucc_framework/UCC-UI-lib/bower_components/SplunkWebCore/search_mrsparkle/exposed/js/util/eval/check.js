define(['underscore'], function(_) {

    // Helpers for argument validation of eval functions

    function lengthCheck(min, max) {
        if (max === undefined) {
            max = min;
        }
        if (max === -1) {
            max = +Infinity;
        }
        return function(args) {
            if (args == null) {
                return min === 0;
            }
            return !!(args.length >= min && args.length <= max);
        };
    }

    function typeCheck(n /* types ... */) {
        var acceptedTypes = Array.prototype.slice.call(arguments, 1);
        return function(args) {
            var arg = args[n];
            if (arg != null) {
                var returnType = arg.returnType();
                if (returnType != null) {
                    return _.contains(acceptedTypes, returnType);
                }
            }
            return true;
        };
    }

    function checkAll(/* checkFunctions... */) {
        var checks = arguments;
        return function() {
            var args = arguments, scope = this;
            return _(checks).all(function(check) {
                return check.apply(scope, args);
            });
        };
    }

    return {
        all: checkAll,
        type: typeCheck,
        length: lengthCheck
    };
});