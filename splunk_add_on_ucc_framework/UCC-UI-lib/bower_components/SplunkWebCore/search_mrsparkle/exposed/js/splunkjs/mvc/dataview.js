define(function(require) {
    var console = require('util/console');
    
    console.warn(
        '%s is deprecated. Please require %s instead.',
        'splunkjs/mvc/dataview',
        'splunkjs/mvc/datatemplateview');
    
    return require('./datatemplateview');
});
