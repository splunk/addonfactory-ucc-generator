define(function(require) {
    var console = require('util/console');

    console.warn(
        '%s is deprecated. Please require %s instead.',
        'splunkjs/mvc/simplexml/dashboard',
        'splunkjs/mvc/simplexml/dashboardview');

    return require('./dashboardview');
});
