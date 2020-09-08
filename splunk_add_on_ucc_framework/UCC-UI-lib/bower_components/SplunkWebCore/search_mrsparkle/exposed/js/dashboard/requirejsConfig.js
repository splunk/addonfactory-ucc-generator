define(function(require) {
    var shimmedRequirejs = require('requirejs');
    var exposedModules = require('./exposedModules');
    shimmedRequirejs.exposeModules(exposedModules, true);
    return shimmedRequirejs;
});