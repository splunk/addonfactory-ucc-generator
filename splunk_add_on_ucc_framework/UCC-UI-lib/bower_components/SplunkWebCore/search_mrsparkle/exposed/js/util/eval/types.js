define(['underscore'], function(_) {

    var NULL_TYPE = 'null';
    var BOOLEAN_TYPE = 'boolean';
    var NUMERIC_TYPE = 'number';
    var STRING_TYPE = 'string';
    var MULTIVALUE_TYPE = 'mv';
    var UNKNOWN_TYPE = 'unknown';

    function type(v) {
        if (v == null) {
            return NULL_TYPE;
        }
        if (_.isArray(v)) {
            return MULTIVALUE_TYPE;
        }
        var t = typeof v;
        if (t == 'object') {
            return UNKNOWN_TYPE;
        }
        return t;
    }

    function isType(val, t) {
        return type(val) == t;
    }

    function typeNameOf(v) {
        switch (type(v)) {
            case 'string':
                return 'String';
            case 'number':
                return 'Number';
            case 'mv':
                return 'Multivalue';
            case 'boolean':
                return 'Bool';
            case 'null':
            case 'unknown':
                return 'Invalid';
            default:
                return 'Invalid';
        }
    }

    function asNumeric(value) {
        if (_.isNumber(value)) {
            return value;
        } else if (_.isString(value)) {
            var v = parseFloat(value);
            if (_.isNumber(v) && isFinite(v)) {
                return v;
            }
        }
        return null;
    }

    function tryNumeric(value) {
        var n = asNumeric(value);
        return n != null ? n : value;
    }

    return {
        NULL_TYPE: NULL_TYPE,
        BOOLEAN: BOOLEAN_TYPE,
        NUMBER: NUMERIC_TYPE,
        STRING: STRING_TYPE,
        MV: MULTIVALUE_TYPE,
        UNKNOWN_TYPE: UNKNOWN_TYPE,
        of: type,
        isType: isType,
        type: type,
        typeNameOf: typeNameOf,
        asNumeric: asNumeric,
        tryNumeric: tryNumeric
    };
});
