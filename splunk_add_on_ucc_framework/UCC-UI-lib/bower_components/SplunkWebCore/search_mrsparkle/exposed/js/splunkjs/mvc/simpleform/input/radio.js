define(function(require) {
    var console = require('util/console');
    
    console.warn(
        '%s is deprecated. Please require %s instead.',
        'splunkjs/mvc/simpleform/radio',
        'splunkjs/mvc/simpleform/radiogroup');
    
    return require('./radiogroup');
});
