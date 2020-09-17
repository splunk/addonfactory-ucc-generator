
function _validateArgs(args) {
    var fnstring = args.callee.toString();
    var fnargs_re = /function\s[\w]+\((.*)\)/;
    
    var fnargs = fnargs_re.exec(fnstring);
    var argslen = 0;
    if (fnargs.length > 1) {
        argslen = fnargs[1].split(',').length;
    }
    
    var resp = [];
    var j = args.length;
    if (j < argslen) {
        resp[0] = undefined;
        for (var i=0; i<j; i++) {
            resp.push(args[i]);
        }
        return resp;
    }
    return args;
}

function assert(msg, bool) {
    var args = _validateArgs(arguments);
    return ok(args[1], args[0]);
}

function assertTrue(msg, bool) {
    var args = _validateArgs(arguments);
    return strictEqual(args[1], true, args[0]);
}

function assertFalse(msg, bool) {
    var args = _validateArgs(arguments);
    return strictEqual(args[1], false, args[0]);
}

function assertEquals(msg, expect, actual) {
    var args = _validateArgs(arguments);
    return equal(args[2], args[1], args[0]);
}

function assertNotEquals(msg, expect, actual) {
    var args = _validateArgs(arguments);
    return notEqual(args[2], args[1], args[0]);
}

function assertNull(msg, val) {
    var args = _validateArgs(arguments);
    return strictEqual(args[1], null, args[0]);
}

function assertNotNull(msg, val) {
    var args = _validateArgs(arguments);
    return notStrictEqual(args[1], null, args[0]);
}

function assertUndefined(msg, val) {
    var args = _validateArgs(arguments);
    return strictEqual(args[1], undefined, args[0]);
}

function assertNotUndefined(msg, val) {
    var args = _validateArgs(arguments);
    return notStrictEqual(args[1], undefined, args[0]);
}

function assertNaN(msg, val) {
    var args = _validateArgs(arguments);
    return strictEqual(isNaN(args[1]), true, args[0]);
}

function assertNotNaN(msg, val) {
    var args = _validateArgs(arguments);
    return strictEqual(isNaN(args[1]), false, args[0]);
}

$(document).ready(function() {
    for(var i in window) {
        var istest = /test[_\w]+/;
        if ((i != 'testDone' && i != 'testStart') && istest.test(i)) {
            test(i, window[i]);
        }
    }
});