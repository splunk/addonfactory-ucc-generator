define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Shape = require("splunk/vectors/Shape");
    var VectorElement = require("splunk/vectors/VectorElement");

    return Class(module.id, Shape, function(Ellipse, base) {

        // Constructor

        this.constructor = function(x, y, radiusX, radiusY) {
            base.constructor.call(this);
        };

        // Public Methods

        this.x = function(value) {
            return this;
        };

        this.y = function(value) {
            return this;
        };

        this.radiusX = function(value) {
            return this;
        };

        this.radiusY = function(value) {
            return this;
        };

        // Private Nested Classes

        var SVGEllipse = Class(function(SVGEllipse) {

            // Constructor

            this.constructor = function(x, y, radiusX, radiusY) {
                base.constructor.call(this, "ellipse");

                if (x != null) {
                    this.x(x);
                }
                if (y != null) {
                    this.y(y);
                }
                if (radiusX != null) {
                    this.radiusX(radiusX);
                }
                if (radiusY != null) {
                    this.radiusY(radiusY);
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

            this.radiusX = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.setAttribute("rx", Math.max(value, 0));
                } else {
                    this.element.removeAttribute("rx");
                }

                return this;
            };

            this.radiusY = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.setAttribute("ry", Math.max(value, 0));
                } else {
                    this.element.removeAttribute("ry");
                }

                return this;
            };

        });

        var VMLEllipse = Class(function(VMLEllipse) {

            // Constructor

            this.constructor = function(x, y, radiusX, radiusY) {
                base.constructor.call(this, "oval");

                if (x != null) {
                    this.x(x);
                }
                if (y != null) {
                    this.y(y);
                }
                if (radiusX != null) {
                    this.radiusX(radiusX);
                }
                if (radiusY != null) {
                    this.radiusY(radiusY);
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

            this.radiusX = function(value) {
                var style = this.element.style;
                if ((value != null) && (value < Infinity)) {
                    value = Math.round(Math.max(value, 0));
                    style.width = value * 2 + "px";
                    style.marginLeft = -value + "px";
                } else {
                    style.width = "";
                    style.marginLeft = "";
                }

                return this;
            };

            this.radiusY = function(value) {
                var style = this.element.style;
                if ((value != null) && (value < Infinity)) {
                    value = Math.round(Math.max(value, 0));
                    style.height = value * 2 + "px";
                    style.marginTop = -value + "px";
                } else {
                    style.height = "";
                    style.marginTop = "";
                }

                return this;
            };

        });

        VectorElement.mixin(this, SVGEllipse, VMLEllipse);

    });

});
