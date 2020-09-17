define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Shape = require("splunk/vectors/Shape");
    var VectorElement = require("splunk/vectors/VectorElement");

    return Class(module.id, Shape, function(Path, base) {

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);
        };

        // Public Methods

        this.beginPath = function() {
            return this;
        };

        this.endPath = function() {
            return this;
        };

        this.moveTo = function(x, y) {
            return this;
        };

        this.lineTo = function(x, y) {
            return this;
        };

        this.curveTo = function(cx, cy, x, y) {
            return this;
        };

        // Private Nested Classes

        var SVGPath = Class(function(SVGPath) {

            // Private Properties

            this._penX = 0;
            this._penY = 0;
            this._startX = 0;
            this._startY = 0;
            this._pathData = null;
            this._lastCommand = null;

            // Constructor

            this.constructor = function() {
                base.constructor.call(this, "path");
            };

            // Public Methods

            this.beginPath = function() {
                if (this._pathData != null) {
                    this.endPath();
                }

                this._pathData = "";

                return this;
            };

            this.endPath = function() {
                if (this._pathData == null) {
                    return this;
                }

                if (this._pathData) {
                    if ((this._lastCommand !== "M") && (this._penX === this._startX) && (this._penY === this._startY)) {
                        this._pathData += " Z";
                    }
                    this.element.setAttribute("d", this._pathData.substring(1));
                } else {
                    this.element.removeAttribute("d");
                }

                this._penX = 0;
                this._penY = 0;
                this._startX = 0;
                this._startY = 0;
                this._pathData = null;
                this._lastCommand = null;

                return this;
            };

            this.moveTo = function(x, y) {
                if (this._pathData == null) {
                    return this;
                }

                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;

                if (this._pathData && (this._lastCommand !== "M") && (this._penX === this._startX) && (this._penY === this._startY)) {
                    this._pathData += " Z";
                }

                if (this._lastCommand !== "M") {
                    this._lastCommand = "M";
                }

                this._penX = x;
                this._penY = y;
                this._startX = x;
                this._startY = y;
                this._pathData += " M" + x + "," + y;

                return this;
            };

            this.lineTo = function(x, y) {
                if (this._pathData == null) {
                    return this;
                }

                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;

                if (!this._lastCommand) {
                    this.moveTo(0, 0);
                }

                if (this._lastCommand !== "L") {
                    this._lastCommand = "L";
                    this._pathData += " L";
                } else {
                    this._pathData += " ";
                }

                this._penX = x;
                this._penY = y;
                this._pathData += x + "," + y;

                return this;
            };

            this.curveTo = function(cx, cy, x, y) {
                if (this._pathData == null) {
                    return this;
                }

                cx = ((cx != null) && (cx > -Infinity) && (cx < Infinity)) ? cx : 0;
                cy = ((cy != null) && (cy > -Infinity) && (cy < Infinity)) ? cy : 0;
                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;

                if (!this._lastCommand) {
                    this.moveTo(0, 0);
                }

                if (this._lastCommand !== "Q") {
                    this._lastCommand = "Q";
                    this._pathData += " Q";
                } else {
                    this._pathData += " ";
                }

                this._penX = x;
                this._penY = y;
                this._pathData += cx + "," + cy + " " + x + "," + y;

                return this;
            };

        });

        var VMLPath = Class(function(VMLPath) {

            // Private Static Constants

            var _RES = 64;

            // Private Properties

            this._pathElement = null;
            this._penX = 0;
            this._penY = 0;
            this._startX = 0;
            this._startY = 0;
            this._pathData = null;
            this._lastCommand = null;

            // Constructor

            this.constructor = function() {
                base.constructor.call(this, "shape");

                this._pathElement = this.createElement("path");

                this.element.style.width = "1px";
                this.element.style.height = "1px";
                this.element.coordsize = _RES + "," + _RES;
                this.element.appendChild(this._pathElement);
            };

            // Public Methods

            this.dispose = function() {
                base.dispose.call(this);

                this._pathElement = null;
            };

            this.beginPath = function() {
                if (this._pathData != null) {
                    this.endPath();
                }

                this._pathData = "";

                return this;
            };

            this.endPath = function() {
                if (this._pathData == null) {
                    return this;
                }

                if (this._pathData) {
                    if ((this._lastCommand !== "m") && (this._penX === this._startX) && (this._penY === this._startY)) {
                        this._pathData += " x";
                    }
                    this._pathElement.v = this._pathData.substring(1);
                } else {
                    this._pathElement.v = " ";
                }

                this._penX = 0;
                this._penY = 0;
                this._startX = 0;
                this._startY = 0;
                this._pathData = null;
                this._lastCommand = null;

                return this;
            };

            this.moveTo = function(x, y) {
                if (this._pathData == null) {
                    return this;
                }

                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? Math.round(x * _RES) : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? Math.round(y * _RES) : 0;

                if (this._pathData && (this._lastCommand !== "M") && (this._penX === this._startX) && (this._penY === this._startY)) {
                    this._pathData += " x";
                }

                if (this._lastCommand !== "m") {
                    this._lastCommand = "m";
                }

                this._penX = x;
                this._penY = y;
                this._startX = x;
                this._startY = y;
                this._pathData += " m " + x + "," + y;

                return this;
            };

            this.lineTo = function(x, y) {
                if (this._pathData == null) {
                    return this;
                }

                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? Math.round(x * _RES) : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? Math.round(y * _RES) : 0;

                if (!this._lastCommand) {
                    this.moveTo(0, 0);
                }

                if (this._lastCommand !== "l") {
                    this._lastCommand = "l";
                    this._pathData += " l ";
                } else {
                    this._pathData += ", ";
                }

                this._penX = x;
                this._penY = y;
                this._pathData += x + "," + y;

                return this;
            };

            this.curveTo = function(cx, cy, x, y) {
                if (this._pathData == null) {
                    return this;
                }

                cx = ((cx != null) && (cx > -Infinity) && (cx < Infinity)) ? Math.round(cx * _RES) : 0;
                cy = ((cy != null) && (cy > -Infinity) && (cy < Infinity)) ? Math.round(cy * _RES) : 0;
                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? Math.round(x * _RES) : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? Math.round(y * _RES) : 0;

                if (!this._lastCommand) {
                    this.moveTo(0, 0);
                }

                if (this._lastCommand !== "qb") {
                    this._lastCommand = "qb";
                }

                this._penX = x;
                this._penY = y;
                this._pathData += " qb " + cx + "," + cy + " l " + x + "," + y;

                return this;
            };

        });

        VectorElement.mixin(this, SVGPath, VMLPath);

    });

});
