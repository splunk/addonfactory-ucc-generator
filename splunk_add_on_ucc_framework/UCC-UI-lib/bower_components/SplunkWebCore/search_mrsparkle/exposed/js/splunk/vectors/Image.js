define(function(require, exports, module) {

    var Class = require("jg/Class");
    var VectorElement = require("splunk/vectors/VectorElement");

    return Class(module.id, VectorElement, function(Image, base) {

        // Constructor

        this.constructor = function(x, y, width, height, href, preserveAspectRatio) {
            base.constructor.call(this);
        };

        // Public Methods

        this.x = function(value) {
            return this;
        };

        this.y = function(value) {
            return this;
        };

        this.width = function(value) {
            return this;
        };

        this.height = function(value) {
            return this;
        };

        this.href = function(value) {
            return this;
        };

        this.preserveAspectRatio = function(value) {
            return this;
        };

        this.onLoad = function(value) {
            return this;
        };

        this.onError = function(value) {
            return this;
        };

        // Private Nested Classes

        var SVGImage = Class(function(SVGImage) {

            // Private Static Constants

            var _NS_XLINK = "http://www.w3.org/1999/xlink";

            // Constructor

            this.constructor = function(x, y, width, height, href, preserveAspectRatio) {
                base.constructor.call(this, "image");

                if (x != null) {
                    this.x(x);
                }
                if (y != null) {
                    this.y(y);
                }
                if (width != null) {
                    this.width(width);
                }
                if (height != null) {
                    this.height(height);
                }
                if (href != null) {
                    this.href(href);
                }
                if (preserveAspectRatio != null) {
                    this.preserveAspectRatio(preserveAspectRatio);
                }
            };

            // Public Methods

            this.x = function(value) {
                if ((value != null) && (value > -Infinity) && (value < Infinity)) {
                    this.element.setAttribute("x", value);
                } else {
                    this.element.removeAttribute("x");
                }

                return this;
            };

            this.y = function(value) {
                if ((value != null) && (value > -Infinity) && (value < Infinity)) {
                    this.element.setAttribute("y", value);
                } else {
                    this.element.removeAttribute("y");
                }

                return this;
            };

            this.width = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.setAttribute("width", Math.max(value, 0));
                } else {
                    this.element.removeAttribute("width");
                }

                return this;
            };

            this.height = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.setAttribute("height", Math.max(value, 0));
                } else {
                    this.element.removeAttribute("height");
                }

                return this;
            };

            this.href = function(value) {
                if (value) {
                    this.element.setAttributeNS(_NS_XLINK, "href", value);
                } else {
                    this.element.removeAttributeNS(_NS_XLINK, "href");
                }

                return this;
            };

            this.preserveAspectRatio = function(value) {
                if (value) {
                    this.element.setAttribute("preserveAspectRatio", value);
                } else {
                    this.element.removeAttribute("preserveAspectRatio");
                }

                return this;
            };

            this.onLoad = function(value) {
                if (typeof value === "function") {
                    this.element.onload = value;
                } else {
                    this.element.onload = null;
                }

                return this;
            };

            this.onError = function(value) {
                if (typeof value === "function") {
                    this.element.onerror = value;
                } else {
                    this.element.onerror = null;
                }

                return this;
            };

        });

        var VMLImage = Class(function(VMLImage) {
        });

        VectorElement.mixin(this, SVGImage, VMLImage);

    });

});
