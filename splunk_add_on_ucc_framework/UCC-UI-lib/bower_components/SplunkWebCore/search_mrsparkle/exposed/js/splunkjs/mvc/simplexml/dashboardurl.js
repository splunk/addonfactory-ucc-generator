define(function(require) {
    var console = require('util/console');

    console.warn(
        '%s is deprecated.',
        'splunkjs/mvc/simplexml/dashboardur');

    return require('models/url');
});
