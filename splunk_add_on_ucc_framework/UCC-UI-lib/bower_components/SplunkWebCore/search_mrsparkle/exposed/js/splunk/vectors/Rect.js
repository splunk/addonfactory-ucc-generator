define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Shape = require("splunk/vectors/Shape");
    var VectorElement = require("splunk/vectors/VectorElement");

    return Class(module.id, Shape, function(Rect, base) {

        // Constructor

        this.constructor = function(x, y, width, height) {
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

        // Private Nested Classes

        var SVGRect = Class(function(SVGRect) {

            // Constructor

            this.constructor = function(x, y, width, height) {
                base.constructor.call(this, "rect");

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

        });

        var VMLRect = Class(function(VMLRect) {

            // Constructor

            this.constructor = function(x, y, width, height) {
                base.constructor.call(this, "rect");

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
            };

            // Public Methods

            this.x = function(value) {
                if ((value != null) && (value > -Infinity) && (value < Infinity)) {
                    this.element.style.left = Math.round(value) + "px";
                } else {
                    this.element.style.left = "";
                }

                return this;
            };

            this.y = function(value) {
                if ((value != null) && (value > -Infinity) && (value < Infinity)) {
                    this.element.style.top = Math.round(value) + "px";
                } else {
                    this.element.style.top = "";
                }

                return this;
            };

            this.width = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.style.width = Math.round(Math.max(value, 0)) + "px";
                } else {
                    this.element.style.width = "";
                }

                return this;
            };

            this.height = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.style.height = Math.round(Math.max(value, 0)) + "px";
                } else {
                    this.element.style.height = "";
                }

                return this;
            };

        });

        VectorElement.mixin(this, SVGRect, VMLRect);

    });

});
