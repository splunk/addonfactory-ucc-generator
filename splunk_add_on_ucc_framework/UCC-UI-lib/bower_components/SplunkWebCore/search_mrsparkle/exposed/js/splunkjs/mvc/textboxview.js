define(function(require) {
    var console = require('util/console');
    
    console.warn(
        '%s is deprecated. Please require %s instead.',
        'splunkjs/mvc/simpleform/textboxview',
        'splunkjs/mvc/simpleform/textinputview');
    
    return require('./textinputview');
});
