define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Shape = require("splunk/vectors/Shape");
    var VectorElement = require("splunk/vectors/VectorElement");

    return Class(module.id, Shape, function(Circle, base) {

        // Constructor

        this.constructor = function(x, y, radius) {
            base.constructor.call(this);
        };

        // Public Methods

        this.x = function(value) {
            return this;
        };

        this.y = function(value) {
            return this;
        };

        this.radius = function(value) {
            return this;
        };

        // Private Nested Classes

        var SVGCircle = Class(function(SVGCircle) {

            // Constructor

            this.constructor = function(x, y, radius) {
                base.constructor.call(this, "circle");

                if (x != null) {
                    this.x(x);
                }
                if (y != null) {
                    this.y(y);
                }
                if (radius != null) {
                    this.radius(radius);
                }
            };

            // Public Methods

            this.x = function(value) {
                if ((value != null) && (value > -Infinity) && (value < Infinity)) {
                    this.element.setAttribute("cx", value);
                } else {
                    this.element.removeAttribute("cx");
                }

                return this;
            };

            this.y = function(value) {
                if ((value != null) && (value > -Infinity) && (value < Infinity)) {
                    this.element.setAttribute("cy", value);
                } else {
                    this.element.removeAttribute("cy");
                }

                return this;
            };

            this.radius = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.setAttribute("r", Math.max(value, 0));
                } else {
                    this.element.removeAttribute("r");
                }

                return this;
            };

        });

        var VMLCircle = Class(function(VMLCircle) {

            // Constructor

            this.constructor = function(x, y, radius) {
                base.constructor.call(this, "oval");

                if (x != null) {
                    this.x(x);
                }
                if (y != null) {
                    this.y(y);
                }
                if (radius != null) {
                    this.radius(radius);
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

            this.radius = function(value) {
                var style = this.element.style;
                if ((value != null) && (value < Infinity)) {
                    value = Math.round(Math.max(value, 0));
                    style.width = value * 2 + "px";
                    style.height = value * 2 + "px";
                    style.marginLeft = -value + "px";
                    style.marginTop = -value + "px";
                } else {
                    style.width = "";
                    style.height = "";
                    style.marginLeft = "";
                    style.marginTop = "";
                }

                return this;
            };

        });

        VectorElement.mixin(this, SVGCircle, VMLCircle);

    });

});
