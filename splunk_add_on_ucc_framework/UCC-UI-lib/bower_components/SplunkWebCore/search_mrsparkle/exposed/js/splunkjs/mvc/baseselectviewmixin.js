define(function(require) {
    var console = require('util/console');
    
    console.warn(
        '%s is deprecated. Please require %s instead.',
        'splunkjs/mvc/simpleform/baseselectviewmixin',
        'splunkjs/mvc/simpleform/basedropdownviewmixin');
    
    return require('./basedropdownviewmixin');
});
