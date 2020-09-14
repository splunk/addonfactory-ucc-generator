define(function(require, exports, module) {
    var reverse = function(name, app, args) {
        throw new Error('Path reverse is not supported in this configuration of the framework.');
    };
    
    return {
        reverse: reverse
    };
});