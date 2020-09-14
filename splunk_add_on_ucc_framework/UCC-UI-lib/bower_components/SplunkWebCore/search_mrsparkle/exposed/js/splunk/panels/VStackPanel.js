define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Element = require("splunk/display/Element");

    require("./VStackPanel.pcss");

    return Class(module.id, Element, function(VStackPanel, base) {

        // Constructor

        this.constructor = function() {
            // override constructor to hide tagName parameter
            base.constructor.call(this);
        };

    });

});
