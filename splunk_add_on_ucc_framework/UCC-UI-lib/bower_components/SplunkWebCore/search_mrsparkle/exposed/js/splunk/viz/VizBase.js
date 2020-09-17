define(function(require, exports, module) {

    var $ = require("jquery");
    var Class = require("jg/Class");
    var MPassTarget = require("jg/async/MPassTarget");
    var MEventTarget = require("jg/events/MEventTarget");
    var MListenerTarget = require("jg/events/MListenerTarget");
    var MObservableTarget = require("jg/events/MObservableTarget");
    var MPropertyTarget = require("jg/properties/MPropertyTarget");
    var Property = require("jg/properties/Property");

    return Class(module.id, Object, function(VizBase, base) {

        Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget, MPassTarget);

        // Private Static Constants

        var _INSTANCE_KEY = "__splunk_viz_VizBase_instance";

        // Private Static Properties

        var _instanceCount = 0;

        // Public Static Methods

        VizBase.getInstance = function(element) {
            if (element == null) {
                return null;
            }

            element = $(element);
            if (element.length == 0) {
                return null;
            }

            element = element[0];

            var instance = element[_INSTANCE_KEY];
            return (instance instanceof VizBase) ? instance : null;
        };

        // Public Properties

        this.id = new Property("id", String, null)
            .readOnly(true);

        this.element = null;
        this.$element = null;

        // Constructor

        this.constructor = function(html) {
            if ((html != null) && !Class.isString(html)) {
                throw new Error("Parameter html must be of type String.");
            }

            var query = $(html ? html : "<div></div>");
            if (query.length == 0) {
                throw new Error("Parameter html must be valid markup.");
            }

            var id = "splunk-viz-VizBase-" + (++_instanceCount);

            this.element = query[0];
            //this.element[_INSTANCE_KEY] = this;
            //this.element.id = id;

            this.$element = $(this.element);

            this.setInternal("id", id);

            this.addStyleClass("splunk-viz-VizBase");
        };

        // Public Methods

        this.addStyleClass = function(styleClass) {
            this.$element.addClass(styleClass);
        };

        this.removeStyleClass = function(styleClass) {
            this.$element.removeClass(styleClass);
        };

        this.setStyle = function(style) {
            this.$element.css(style);
        };

        this.appendTo = function(parentElement) {
            if (parentElement == null) {
                throw new Error("Parameter parentElement must be non-null.");
            }

            if (parentElement instanceof VizBase) {
                parentElement = parentElement.element;
            }

            parentElement = $(parentElement);
            if (parentElement.length == 0) {
                return;
            }

            parentElement = parentElement[0];

            var oldParent = this.element.parentNode;
            if (oldParent && (oldParent !== parentElement)) {
                this.onRemove();
            }

            parentElement.appendChild(this.element);

            if (oldParent !== parentElement) {
                this.onAppend();
            }
        };

        this.replace = function(element) {
            if (element == null) {
                throw new Error("Parameter element must be non-null.");
            }

            if (element instanceof VizBase) {
                element = element.element;
            }

            element = $(element);
            if (element.length == 0) {
                return;
            }

            element = element[0];

            var parentElement = element.parentNode;
            if (parentElement == null) {
                return;
            }

            var oldParent = this.element.parentNode;
            if (oldParent && (oldParent !== parentElement)) {
                this.onRemove();
            }

            parentElement.replaceChild(this.element, element);

            if (oldParent !== parentElement) {
                this.onAppend();
            }
        };

        this.remove = function() {
            var element = this.element;
            var parentElement = element.parentNode;
            if (!parentElement) {
                return;
            }

            this.onRemove();

            parentElement.removeChild(element);
        };

        this.dispose = function() {
            this.remove();

            this.listenOff();
            this.off();
            this.markValid();

            // ensure all jquery data and events are removed
            this.$element.remove();
        };

        this.getValidateDepth = function() {
            var depth = 0;
            var parentNode = this.element.parentNode;
            while (parentNode) {
                depth++;
                parentNode = parentNode.parentNode;
            }
            return depth;
        };

        // Protected Methods

        this.onAppend = function() {
        };

        this.onRemove = function() {
        };

    });

});
