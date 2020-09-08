define(function(require, exports, module) {

    var Class = require("jg/Class");
    var VectorElement = require("splunk/vectors/VectorElement");

    return Class(module.id, VectorElement, function(Group, base) {

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);
        };

        // Private Nested Classes

        var SVGGroup = Class(function(SVGGroup) {

            // Constructor

            this.constructor = function() {
                base.constructor.call(this, "g");
            };

        });

        var VMLGroup = Class(function(VMLGroup) {

            // Constructor

            this.constructor = function() {
                base.constructor.call(this, "group");

                this.element.style.width = "1px";
                this.element.style.height = "1px";
                this.element.coordsize = "1,1";
            };

        });

        VectorElement.mixin(this, SVGGroup, VMLGroup);

    });

});
