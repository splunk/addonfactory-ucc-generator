define(['underscore'], function(_) {

    var UNSUPPORTED_FUNCTIONS = {};

    // A list of eval functions explicitly not supported in client-side eval expressions
    _(['commands', 'exact', 'searchmatch', 'md5', 'sha1', 'sha256', 'sha512', 'sigfig', 'spath'])
        .each(function(name) {
            var err = new Error('The function ' + JSON.stringify(name) + ' is not supported in client-side eval expressions.'); 
            UNSUPPORTED_FUNCTIONS[name] = {
                checkArguments: function() {
                    throw err;
                },
                evaluate: function() {
                }
            };
        });

    return UNSUPPORTED_FUNCTIONS;
});