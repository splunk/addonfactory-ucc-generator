define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Brush = require("jg/graphics/Brush");
    var Color = require("jg/graphics/Color");
    var MStrokeBrush = require("jg/graphics/MStrokeBrush");
    var ObservableArrayProperty = require("jg/properties/ObservableArrayProperty");

    return Class(module.id, Brush, function(BorderStrokeBrush, base) {

        Class.mixin(this, MStrokeBrush);

        // Public Properties

        this.colors = new ObservableArrayProperty("colors", Color, [ new Color(), new Color(), new Color(), new Color() ])
            .itemReadFilter(function(value) {
                return value.clone();
            })
            .writeFilter(function(value) {
                var length = value ? value.length : 0;
                var top = ((length > 0) && value[0]) ? value[0].clone().normalize() : new Color();
                var right = ((length > 1) && value[1]) ? value[1].clone().normalize() : top.clone();
                var bottom = ((length > 2) && value[2]) ? value[2].clone().normalize() : top.clone();
                var left = ((length > 3) && value[3]) ? value[3].clone().normalize() : right.clone();
                return [ top, right, bottom, left ];
            })
            .itemChangeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            });

        this.thicknesses = new ObservableArrayProperty("thicknesses", Number, [ 1, 1, 1, 1 ])
            .writeFilter(function(value) {
                var length = value ? value.length : 0;
                var top = ((length > 0) && (value[0] < Infinity)) ? Math.max(value[0], 0) : 1;
                var right = ((length > 1) && (value[1] < Infinity)) ? Math.max(value[1], 0) : top;
                var bottom = ((length > 2) && (value[2] < Infinity)) ? Math.max(value[2], 0) : top;
                var left = ((length > 3) && (value[3] < Infinity)) ? Math.max(value[3], 0) : right;
                return [ top, right, bottom, left ];
            });

        // Constructor

        this.constructor = function(colors, thicknesses, caps, joints, miterLimit) {
            base.constructor.call(this);

            if (colors != null) {
                this.set("colors", colors);
            }
            if (thicknesses != null) {
                this.set("thicknesses", thicknesses);
            }
            if (caps != null) {
                this.set("caps", caps);
            }
            if (joints != null) {
                this.set("joints", joints);
            }
            if (miterLimit != null) {
                this.set("miterLimit", miterLimit);
            }
        };

        // Protected Methods

        this.extendProperties = function(properties)
        {
            properties.strokeStyle = this.getStrokeStyle(properties);
        };

        this.drawBrush = function(canvas, properties, path, bounds, transform) {
            var pathLength = path.length;
            if (pathLength === 0) {
                return;
            }

            var x1 = Infinity;
            var x2 = -Infinity;
            var y1 = Infinity;
            var y2 = -Infinity;
            var command;
            var i;

            for (i = 0; i < pathLength; i++) {
                command = path[i];
                switch (command[0]) {
                    case "moveTo":
                    case "lineTo":
                        x1 = Math.min(x1, command[1]);
                        x2 = Math.max(x2, command[1]);
                        y1 = Math.min(y1, command[2]);
                        y2 = Math.max(y2, command[2]);
                        break;
                    case "curveTo":
                        x1 = Math.min(x1, command[1], command[3]);
                        x2 = Math.max(x2, command[1], command[3]);
                        y1 = Math.min(y1, command[2], command[4]);
                        y2 = Math.max(y2, command[2], command[4]);
                        break;
                }
            }

            var borderPoints = [ { x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }, { x: x1, y: y1 } ];
            var strokeStyle = properties.strokeStyle;
            var thickness = 0;
            var color = new Color();
            var newStroke = true;

            for (i = 0; i < 4; i++) {
                if (properties.thicknesses[i] !== thickness) {
                    thickness = properties.thicknesses[i];
                    newStroke = true;
                }

                if (thickness === 0) {
                    continue;
                }

                if (!properties.colors[i].equals(color)) {
                    color = properties.colors[i];
                    newStroke = true;
                }

                if (newStroke) {
                    canvas.endStroke();
                    canvas.beginStroke(color, strokeStyle.thickness(thickness));
                    canvas.moveTo(borderPoints[i].x, borderPoints[i].y);
                    newStroke = false;
                }

                canvas.lineTo(borderPoints[i + 1].x, borderPoints[i + 1].y);
            }

            canvas.endStroke();
        };

    });

});
