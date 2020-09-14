define(function(require, exports, module) {

    var Class = require("jg/Class");
    var NumberUtil = require("jg/utils/NumberUtil");
    var Shape = require("splunk/vectors/Shape");
    var VectorElement = require("splunk/vectors/VectorElement");

    return Class(module.id, Shape, function(Wedge, base) {

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);
        };

        // Public Methods

        this.draw = function(x, y, radiusX, radiusY, startAngle, arcAngle) {
            return this;
        };

        // Private Nested Classes

        var SVGWedge = Class(function(SVGWedge) {

            // Constructor

            this.constructor = function() {
                base.constructor.call(this, "path");
            };

            // Public Methods

            this.draw = function(x, y, radiusX, radiusY, startAngle, arcAngle) {
                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;
                radiusX = ((radiusX != null) && (radiusX < Infinity)) ? Math.max(radiusX, 0) : 0;
                radiusY = ((radiusY != null) && (radiusY < Infinity)) ? Math.max(radiusY, 0) : 0;
                startAngle = ((startAngle != null) && (startAngle > -Infinity) && (startAngle < Infinity)) ? startAngle : 0;
                arcAngle = ((arcAngle != null) && (arcAngle != null) && !isNaN(arcAngle)) ? NumberUtil.minMax(arcAngle, -360, 360) : 0;

                if ((radiusX == 0) || (radiusY == 0) || (arcAngle == 0)) {
                    this.element.removeAttribute("d");
                    return this;
                }

                var a1 = (startAngle / 180) * Math.PI;
                var x1 = x + Math.cos(a1) * radiusX;
                var y1 = y + Math.sin(a1) * radiusY;
                var a2 = ((startAngle + arcAngle / 2) / 180) * Math.PI;
                var x2 = x + Math.cos(a2) * radiusX;
                var y2 = y + Math.sin(a2) * radiusY;
                var a3 = ((startAngle + arcAngle) / 180) * Math.PI;
                var x3 = x + Math.cos(a3) * radiusX;
                var y3 = y + Math.sin(a3) * radiusY;

                var sweepFlag = (arcAngle < 0) ? 0 : 1;

                var pathData = "";
                if ((arcAngle > -360) && (arcAngle < 360)) {
                    pathData += "M" + x + "," + y;
                    pathData += " L" + x1 + "," + y1;
                } else {
                    pathData += "M" + x1 + "," + y1;
                }
                pathData += " A" + radiusX + "," + radiusY + " 0 0 " + sweepFlag + " " + x2 + "," + y2;
                pathData += " " + radiusX + "," + radiusY + " 0 0 " + sweepFlag + " " + x3 + "," + y3;
                pathData += " Z";

                this.element.setAttribute("d", pathData);

                return this;
            };

        });

        var VMLWedge = Class(function(VMLWedge) {

            // Private Static Constants

            var _RES = 64;

            // Private Properties

            this._pathElement = null;

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

            this.draw = function(x, y, radiusX, radiusY, startAngle, arcAngle) {
                x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
                y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;
                radiusX = ((radiusX != null) && (radiusX < Infinity)) ? Math.max(radiusX, 0) : 0;
                radiusY = ((radiusY != null) && (radiusY < Infinity)) ? Math.max(radiusY, 0) : 0;
                startAngle = ((startAngle != null) && (startAngle > -Infinity) && (startAngle < Infinity)) ? startAngle : 0;
                arcAngle = ((arcAngle != null) && (arcAngle != null) && !isNaN(arcAngle)) ? NumberUtil.minMax(arcAngle, -360, 360) : 0;

                if ((radiusX == 0) || (radiusY == 0) || (arcAngle == 0)) {
                    this._pathElement.v = " ";
                    return this;
                }

                var a1 = (startAngle / 180) * Math.PI;
                var x1 = x + Math.cos(a1) * radiusX;
                var y1 = y + Math.sin(a1) * radiusY;
                var a2 = ((startAngle + arcAngle / 2) / 180) * Math.PI;
                var x2 = x + Math.cos(a2) * radiusX;
                var y2 = y + Math.sin(a2) * radiusY;
                var a3 = ((startAngle + arcAngle) / 180) * Math.PI;
                var x3 = x + Math.cos(a3) * radiusX;
                var y3 = y + Math.sin(a3) * radiusY;

                var left = Math.round((x - radiusX) * _RES);
                var top = Math.round((y - radiusY) * _RES);
                var right = Math.round((x + radiusX) * _RES);
                var bottom = Math.round((y + radiusY) * _RES);

                x = Math.round(x * _RES);
                y = Math.round(y * _RES);
                x1 = Math.round(x1 * _RES);
                y1 = Math.round(y1 * _RES);
                x2 = Math.round(x2 * _RES);
                y2 = Math.round(y2 * _RES);
                x3 = Math.round(x3 * _RES);
                y3 = Math.round(y3 * _RES);

                var pathData = "";
                if ((arcAngle > -360) && (arcAngle < 360)) {
                    pathData += "m " + x + "," + y;
                    pathData += " l " + x1 + "," + y1;
                } else {
                    pathData += "m " + x1 + "," + y1;
                }
                pathData += (arcAngle < 0) ? " at" : " wa";
                pathData += " " + left + "," + top + "," + right + "," + bottom + ", " + x1 + "," + y1 + ", " + x2 + "," + y2;
                pathData += ", " + left + "," + top + "," + right + "," + bottom + ", " + x2 + "," + y2 + ", " + x3 + "," + y3;
                pathData += " x";

                this._pathElement.v = pathData;

                return this;
            };

        });

        VectorElement.mixin(this, SVGWedge, VMLWedge);

    });

});
