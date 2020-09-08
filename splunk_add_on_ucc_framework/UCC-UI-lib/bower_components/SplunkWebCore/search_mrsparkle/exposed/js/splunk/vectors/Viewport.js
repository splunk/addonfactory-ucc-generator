define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Rectangle = require("jg/geom/Rectangle");
    var VectorElement = require("splunk/vectors/VectorElement");
    var VectorUtils = require("splunk/vectors/VectorUtils");

    return Class(module.id, VectorElement, function(Viewport, base) {

        // Constructor

        this.constructor = function(width, height, viewBox, preserveAspectRatio) {
            base.constructor.call(this);
        };

        // Public Methods

        this.width = function(value) {
            return this;
        };

        this.height = function(value) {
            return this;
        };

        this.viewBox = function(value) {
            return this;
        };

        this.preserveAspectRatio = function(value) {
            return this;
        };

        this.toSVGString = function() {
            return "";
        };

        // Private Nested Classes

        var SVGViewport = Class(function(SVGViewport) {

            // Constructor

            this.constructor = function(width, height, viewBox, preserveAspectRatio) {
                base.constructor.call(this, "svg");

                this.width((width != null) ? width : 0);
                this.height((height != null) ? height : 0);
                if (viewBox != null) {
                    this.viewBox(viewBox);
                }
                if (preserveAspectRatio != null) {
                    this.preserveAspectRatio(preserveAspectRatio);
                }
            };

            // Public Methods

            this.appendTo = function(parentElement) {
                if (parentElement == null) {
                    throw new Error("Parameter parentElement must be non-null.");
                }
                if (parentElement.appendChild == null) {
                    throw new Error("Parameter parentElement must be a DOM node.");
                }

                parentElement.appendChild(this.element);

                return this;
            };

            this.width = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.setAttribute("width", Math.max(value, 0));
                } else {
                    this.element.setAttribute("width", 0);
                }

                return this;
            };

            this.height = function(value) {
                if ((value != null) && (value < Infinity)) {
                    this.element.setAttribute("height", Math.max(value, 0));
                } else {
                    this.element.setAttribute("height", 0);
                }

                return this;
            };

            this.viewBox = function(value) {
                if (value && (value instanceof Rectangle) && value.isFinite()) {
                    this.element.setAttribute("viewBox", value.x + " " + value.y + " " + value.width + " " + value.height);
                } else {
                    this.element.removeAttribute("viewBox");
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

            this.toSVGString = function() {
                return VectorUtils.toSVGString(this.element);
            };

        });

        var VMLViewport = Class(function(VMLViewport) {

            // Private Properties

            this._containerElement = null;
            this._width = 0;
            this._height = 0;
            this._viewBox = null;

            // Constructor

            this.constructor = function(width, height, viewBox, preserveAspectRatio) {
                base.constructor.call(this, "group");

                this._containerElement = document.createElement("div");
                this._containerElement.style.position = "relative";
                this._containerElement.style.overflow = "hidden";
                this._containerElement.appendChild(this.element);

                this.width((width != null) ? width : 0);
                this.height((height != null) ? height : 0);
                if (viewBox != null) {
                    this.viewBox(viewBox);
                }
                if (preserveAspectRatio != null) {
                    this.preserveAspectRatio(preserveAspectRatio);
                }
            };

            // Public Methods

            this.appendTo = function(parentElement) {
                if (parentElement == null) {
                    throw new Error("Parameter parentElement must be non-null.");
                }
                if (parentElement.appendChild == null) {
                    throw new Error("Parameter parentElement must be a DOM node.");
                }

                parentElement.appendChild(this._containerElement);

                return this;
            };

            this.remove = function() {
                if (this._containerElement.parentNode) {
                    this._containerElement.parentNode.removeChild(this._containerElement);
                }

                return this;
            };

            this.dispose = function() {
                base.dispose.call(this);

                this._containerElement = null;
            };

            this.display = function(value) {
                this._containerElement.style.display = value ? value : "";

                return this;
            };

            this.visibility = function(value) {
                this._containerElement.style.visibility = value ? value : "";

                return this;
            };

            this.translate = function(x, y) {
                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;

                this._containerElement.style.left = (x != 0) ? x + "px" : "";
                this._containerElement.style.top = (y != 0) ? y + "px" : "";

                return this;
            };

            this.width = function(value) {
                this._width = ((value != null) && (value < Infinity)) ? Math.max(value, 0) : 0;
                this._updateView();

                return this;
            };

            this.height = function(value) {
                this._height = ((value != null) && (value < Infinity)) ? Math.max(value, 0) : 0;
                this._updateView();

                return this;
            };

            this.viewBox = function(value) {
                this._viewBox = (value && (value instanceof Rectangle) && value.isFinite()) ? value.clone() : null;
                this._updateView();

                return this;
            };

            this.preserveAspectRatio = function(value) {
                return this;
            };

            // Private Methods

            this._updateView = function() {
                var width = Math.round(this._width);
                var height = Math.round(this._height);
                var viewBox = this._viewBox;
                var viewX = viewBox ? Math.round(viewBox.x) : 0;
                var viewY = viewBox ? Math.round(viewBox.y) : 0;
                var viewWidth = viewBox ? Math.round(Math.max(viewBox.width, 1)) : width;
                var viewHeight = viewBox ? Math.round(Math.max(viewBox.height, 1)) : height;

                var element = this.element;
                var style = element.style;
                var containerStyle = this._containerElement.style;

                style.display = "none";  // prevent premature rendering

                element.coordorigin = viewX + "," + viewY;
                element.coordsize = viewWidth + "," + viewHeight;

                style.width = width + "px";
                style.height = height + "px";

                containerStyle.width = width + "px";
                containerStyle.height = height + "px";

                style.display = "";  // enable rendering
            };

        });

        VectorElement.mixin(this, SVGViewport, VMLViewport);

    });

});
