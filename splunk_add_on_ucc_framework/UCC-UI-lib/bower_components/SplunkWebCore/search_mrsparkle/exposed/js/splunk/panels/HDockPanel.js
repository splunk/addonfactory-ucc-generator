define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ObservableEnumProperty = require("jg/properties/ObservableEnumProperty");
    var Element = require("splunk/display/Element");

    require("./HDockPanel.pcss");

    return Class(module.id, Element, function(HDockPanel, base) {

        // Public Static Properties

        HDockPanel.placement = new ObservableEnumProperty("HDockPanel.placement", String, [ "left", "right" ])
            .setter(function(value) {
                if (this instanceof Element) {
                    if (value === "right") {
                        this.addClass("placement-right");
                    } else {
                        this.removeClass("placement-right");
                    }
                }
            });

        // Constructor

        this.constructor = function() {
            // override constructor to hide tagName parameter
            base.constructor.call(this);
        };

    });

});
