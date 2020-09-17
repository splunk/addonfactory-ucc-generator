define(function(require, exports, module) {

    var Class = require("jg/Class");
    var NumberUtil = require("jg/utils/NumberUtil");
    var VectorElement = require("splunk/vectors/VectorElement");

    return Class(module.id, VectorElement, function(Shape, base) {

        // Constructor

        this.constructor = function(tagName) {
            base.constructor.call(this, tagName);
        };

        // Public Methods

        this.fillColor = function(value) {
            return this;
        };

        this.fillOpacity = function(value) {
            return this;
        };

        this.strokeColor = function(value) {
            return this;
        };

        this.strokeOpacity = function(value) {
            return this;
        };

        this.strokeWidth = function(value) {
            return this;
        };

        this.strokeLineCap = function(value) {
            return this;
        };

        this.strokeLineJoin = function(value) {
            return this;
        };

        this.strokeMiterLimit = function(value) {
            return this;
        };

        // Private Nested Classes

        var SVGShape = Class(function(SVGShape) {

            // Constructor

            this.constructor = function(tagName) {
                base.constructor.call(this, tagName);

                this.fillColor(NaN);
                this.strokeColor(NaN);
                this.strokeLineCap("none");
                this.strokeLineJoin("miter");
            };

            // Public Methods

            this.fillColor = function(value) {
                if ((value != null) && !isNaN(value)) {
                    value = NumberUtil.minMax(Math.floor(value), 0x000000, 0xFFFFFF);
                    this.element.setAttribute("fill", "#" + (value | 0x1000000).toString(16).substring(1));
                } else {
                    this.element.setAttribute("fill", "none");
                }

                return this;
            };

            this.fillOpacity = function(value) {
                if ((value != null) && !isNaN(value)) {
                    this.element.setAttribute("fill-opacity", NumberUtil.minMax(value, 0, 1));
                } else {
                    this.element.removeAttribute("fill-opacity");
                }

                return this;
            };

            this.strokeColor = function(value) {
                if ((value != null) && !isNaN(value)) {
                    value = NumberUtil.minMax(Math.floor(value), 0x000000, 0xFFFFFF);
                    this.element.setAttribute("stroke", "#" + (value | 0x1000000).toString(16).substring(1));
                } else {
                    this.element.removeAttribute("stroke");
                }

                return this;
            };

            this.strokeOpacity = function(value) {
                if ((value != null) && !isNaN(value)) {
                    this.element.setAttribute("stroke-opacity", NumberUtil.minMax(value, 0, 1));
                } else {
                    this.element.removeAttribute("stroke-opacity");
                }

                return this;
            };

            this.strokeWidth = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.setAttribute("stroke-width", Math.max(value, 1));
                } else {
                    this.element.removeAttribute("stroke-width");
                }

                return this;
            };

            this.strokeLineCap = function(value) {
                if (value === "round") {
                    this.element.setAttribute("stroke-linecap", "round");
                } else if (value === "square") {
                    this.element.setAttribute("stroke-linecap", "square");
                } else {  // none
                    this.element.removeAttribute("stroke-linecap");
                }

                return this;
            };

            this.strokeLineJoin = function(value) {
                if (value === "round") {
                    this.element.setAttribute("stroke-linejoin", "round");
                } else if (value === "bevel") {
                    this.element.setAttribute("stroke-linejoin", "bevel");
                } else {  // miter
                    this.element.removeAttribute("stroke-linejoin");
                }

                return this;
            };

            this.strokeMiterLimit = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.setAttribute("stroke-miterlimit", Math.max(value, 1));
                } else {
                    this.element.removeAttribute("stroke-miterlimit");
                }

                return this;
            };

        });

        var VMLShape = Class(function(VMLShape) {

            // Private Properties

            this._fillElement = null;
            this._strokeElement = null;

            // Constructor

            this.constructor = function(tagName) {
                base.constructor.call(this, tagName);

                this._fillElement = this.createElement("fill");
                this._strokeElement = this.createElement("stroke");

                this.element.appendChild(this._fillElement);
                this.element.appendChild(this._strokeElement);

                this.fillColor(NaN);
                this.strokeColor(NaN);
                this.strokeLineCap("none");
                this.strokeLineJoin("miter");
            };

            // Public Methods

            this.dispose = function() {
                base.dispose.call(this);

                this._fillElement = null;
                this._strokeElement = null;
            };

            this.fillColor = function(value) {
                if ((value != null) && !isNaN(value)) {
                    value = NumberUtil.minMax(Math.floor(value), 0x000000, 0xFFFFFF);
                    this._fillElement.on = true;
                    this._fillElement.color = "#" + (value | 0x1000000).toString(16).substring(1);
                } else {
                    this._fillElement.on = false;
                    this._fillElement.color = "#000000";
                }

                return this;
            };

            this.fillOpacity = function(value) {
                if ((value != null) && !isNaN(value)) {
                    this._fillElement.opacity = NumberUtil.minMax(value, 0, 1);
                } else {
                    this._fillElement.opacity = 1;
                }

                return this;
            };

            this.strokeColor = function(value) {
                if ((value != null) && !isNaN(value)) {
                    value = NumberUtil.minMax(Math.floor(value), 0x000000, 0xFFFFFF);
                    this._strokeElement.on = true;
                    this._strokeElement.color = "#" + (value | 0x1000000).toString(16).substring(1);
                } else {
                    this._strokeElement.on = false;
                    this._strokeElement.color = "#000000";
                }

                return this;
            };

            this.strokeOpacity = function(value) {
                if ((value != null) && !isNaN(value)) {
                    this._strokeElement.opacity = NumberUtil.minMax(value, 0, 1);
                } else {
                    this._strokeElement.opacity = 1;
                }

                return this;
            };

            this.strokeWidth = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this._strokeElement.weight = Math.max(value, 1) + "px";
                } else {
                    this._strokeElement.weight = "1px";
                }

                return this;
            };

            this.strokeLineCap = function(value) {
                if (value === "round") {
                    this._strokeElement.endcap = "round";
                } else if (value === "square") {
                    this._strokeElement.endcap = "square";
                } else {  // none
                    this._strokeElement.endcap = "flat";
                }

                return this;
            };

            this.strokeLineJoin = function(value) {
                if (value === "round") {
                    this._strokeElement.joinstyle = "round";
                } else if (value === "bevel") {
                    this._strokeElement.joinstyle = "bevel";
                } else {  // miter
                    this._strokeElement.joinstyle = "miter";
                }

                return this;
            };

            this.strokeMiterLimit = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this._strokeElement.miterlimit = Math.max(value, 1);
                } else {
                    this._strokeElement.miterlimit = 4;
                }

                return this;
            };

        });

        VectorElement.mixin(this, SVGShape, VMLShape);

    });

});
