define(function(require) {
    var console = require('util/console');
    
    console.warn(
        '%s is deprecated. Please require %s instead.',
        'splunkjs/mvc/simpleform/multiselectview',
        'splunkjs/mvc/simpleform/multidropdownview');
    
    return require('./multidropdownview');
});
