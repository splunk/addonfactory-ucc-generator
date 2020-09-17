define(function(require, exports, module) {

    var Class = require("jg/Class");
    var EventData = require("jg/events/EventData");
    var ObjectUtil = require("jg/utils/ObjectUtil");

    return Class(module.id, EventData, function(GenericEventData, base) {

        // Constructor

        this.constructor = function(attributes) {
            if (attributes != null) {
                for (var a in attributes) {
                    if (ObjectUtil.has(attributes, a) && !(a in this)) {
                        this[a] = attributes[a];
                    }
                }
            }
        };

    });

});
