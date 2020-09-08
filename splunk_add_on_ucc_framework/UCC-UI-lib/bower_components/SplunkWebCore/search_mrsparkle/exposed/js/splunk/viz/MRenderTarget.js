define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");

    return Class(module.id, function(MRenderTarget) {

        // Public Passes

        this.renderPass = new Pass("render", 3, "topDown");

        // Public Methods

        this.render = function() {
        };

    });

});
