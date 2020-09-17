define(function(require) {
    var console = require('util/console');
    
    console.warn(
        '%s is deprecated. Please require %s instead.',
        'splunkjs/mvc/selectview',
        'splunkjs/mvc/dropdownview');
    
    return require('./dropdownview');
});
