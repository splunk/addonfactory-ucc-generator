define(function(require) {
    var console = require('util/console');
    
    console.warn(
        '%s is deprecated. Please require %s instead.',
        'splunkjs/mvc/simpleform/timepickerview',
        'splunkjs/mvc/simpleform/timerangeview');
    
    return require('./timerangeview');
});
