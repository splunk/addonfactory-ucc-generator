define(function(require, exports, module) {

    var Class = require("jg/Class");

    return Class(module.id, Object, function(VectorElement, base) {

        // Private Static Constants

        var _HAS_SVG = (typeof document.createElementNS === "function");
        var _HAS_VML = (!_HAS_SVG && (function() {
            try {
                document.namespaces.add("splvml", "urn:schemas-microsoft-com:vml");

                var styleText = ".splvml { behavior: url(#default#VML); display: inline-block; position: absolute; }";

                var styleNode = document.createElement("style");
                styleNode.setAttribute("type", "text/css");

                var headNode = document.getElementsByTagName("head")[0];
                headNode.appendChild(styleNode);

                if (styleNode.styleSheet) {
                    styleNode.styleSheet.cssText = styleText;
                } else {
                    styleNode.appendChild(document.createTextNode(styleText));
                }

                return true;
            } catch (e) {
                return false;
            }
        })());

        // Public Static Methods

        VectorElement.mixin = function(target, sourceSVG, sourceVML) {
            if (_HAS_SVG) {
                Class.mixin(target, sourceSVG);
                // Class.mixin doesn't copy constructor, so do it manually
                if ((sourceSVG.constructor !== Object) && (typeof sourceSVG.constructor === "function")) {
                    target.constructor = sourceSVG.constructor;
                }
            } else if (_HAS_VML) {
                Class.mixin(target, sourceVML);
                // Class.mixin doesn't copy constructor, so do it manually
                if ((sourceVML.constructor !== Object) && (typeof sourceVML.constructor === "function")) {
                    target.constructor = sourceVML.constructor;
                }
            }
        };

        // Public Properties

        this.hasSVG = _HAS_SVG;
        this.hasVML = _HAS_VML;
        this.element = null;

        // Constructor

        this.constructor = function(tagName) {
            if ((tagName != null) && !Class.isString(tagName)) {
                throw new Error("Parameter tagName must be of type String.");
            }

            this.element = this.createElement(tagName || null);
        };

        // Public Methods

        this.appendTo = function(parentElement) {
            if (parentElement == null) {
                throw new Error("Parameter parentElement must be non-null.");
            }
            if (!(parentElement instanceof VectorElement)) {
                throw new Error("Parameter parentElement must be of type " + Class.getName(VectorElement) + ".");
            }

            parentElement.element.appendChild(this.element);

            return this;
        };

        this.remove = function() {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            return this;
        };

        this.dispose = function() {
            this.remove();

            this.element = null;
        };

        this.display = function(value) {
            this.element.style.display = value ? value : "";

            return this;
        };

        this.visibility = function(value) {
            this.element.style.visibility = value ? value : "";

            return this;
        };

        this.translate = function(x, y) {
            x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
            y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;

            this.element.style.left = (x != 0) ? x + "px" : "";
            this.element.style.top = (y != 0) ? y + "px" : "";

            return this;
        };

        // Protected Methods

        this.createElement = function(tagName) {
            var dummy = document.createElement("div");
            dummy.style.position = "absolute";
            return dummy;
        };

        // Private Nested Classes

        var SVGVectorElement = Class(function(SVGVectorElement) {

            // Private Static Constants

            var _NS_SVG = "http://www.w3.org/2000/svg";

            // Public Methods

            this.display = function(value) {
                if (value) {
                    this.element.setAttribute("display", value);
                } else {
                    this.element.removeAttribute("display");
                }

                return this;
            };

            this.visibility = function(value) {
                if (value) {
                    this.element.setAttribute("visibility", value);
                } else {
                    this.element.removeAttribute("visibility");
                }

                return this;
            };

            this.translate = function(x, y) {
                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;

                if ((x != 0) || (y != 0)) {
                    this.element.setAttribute("transform", "translate(" + x + "," + y + ")");
                } else {
                    this.element.removeAttribute("transform");
                }

                return this;
            };

            // Protected Methods

            this.createElement = function(tagName) {
                return document.createElementNS(_NS_SVG, tagName || "g");
            };

        });

        var VMLVectorElement = Class(function(VMLVectorElement) {

            // Protected Methods

            this.createElement = function(tagName) {
                return document.createElement("<splvml:" + (tagName || "group") + " class=\"splvml\">");
            };

        });

        VectorElement.mixin(this, SVGVectorElement, VMLVectorElement);

    });

});
