define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Element = require("jg/display/Element");
    var ObjectUtil = require("jg/utils/ObjectUtil");

    return Class(module.id, Element, function(SplunkElement, base) {

        // Private Properties

        this._dataClassInternal = null;

        // Constructor

        this.constructor = function(tagName) {
            base.constructor.call(this, tagName);

            var dataClass = this.getDataClassOverride();
            if (dataClass) {
                this.element.setAttribute("data-class", dataClass);
            }
        };

        // Protected Methods

        this.getDataClassOverride = function() {
            var cls = this.constructor;
            if (cls === SplunkElement) {
                return "";
            }

            var proto = cls.prototype;
            var dataClass = ObjectUtil.get(proto, "_dataClassInternal");
            if (dataClass != null) {
                return dataClass;
            }

            dataClass = Class.getName(cls);
            if (!dataClass) {
                cls = Class.getBaseClass(cls);
                dataClass = cls ? cls.prototype.getDataClassOverride() : "";
            }

            proto._dataClassInternal = dataClass;
            return dataClass;
        };

        this.getClassNamesOverride = function() {
            var cls = this.constructor;
            if (cls === SplunkElement) {
                return "";
            }

            return base.getClassNamesOverride.call(this);
        };

    });

});
