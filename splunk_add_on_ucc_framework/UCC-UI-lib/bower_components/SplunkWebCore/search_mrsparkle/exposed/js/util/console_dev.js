define([],function(){
    function bind(fn, context) {
        return function(){ fn.apply(context, arguments);  };
    }
    var orig = window.console, console = orig,
        CONSOLE_METHODS = ['log','trace','error','warn', 'info', 'debug'],
        EMPTY = function(){},i;
    try {
        console.DEBUG_ENABLED = true;
    } catch(e) {
        console = { DEBUG_ENABLED: true };
    }
    for (i = 0; i < CONSOLE_METHODS.length; i++) {
        var fn = CONSOLE_METHODS[i];
        if(typeof console[fn] !== 'function') {
            if(orig !== undefined && typeof orig[fn] == 'function') {
                console[fn] = bind(orig[fn], orig);
            } else {
                console[fn] = EMPTY;
            }
        }
    }
    return console;
});