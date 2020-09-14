define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var Point = require("jg/geom/Point");
    var Canvas = require("jg/graphics/Canvas");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var VizBase = require("splunk/viz/VizBase");

    return Class(module.id, VizBase, function(GraphicsVizBase, base) {

        // Public Passes

        this.renderGraphicsPass = new Pass("renderGraphics", 2, "topDown");

        // Public Properties

        this.x = new ObservableProperty("x", Number, 0)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : 0;
            })
            .setter(function(value) {
                this.setStyle({ left: value + "px" });
            });

        this.y = new ObservableProperty("y", Number, 0)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : 0;
            })
            .setter(function(value) {
                this.setStyle({ top: value + "px" });
            });

        this.width = new ObservableProperty("width", Number, 0)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.height = new ObservableProperty("height", Number, 0)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : 0;
            })
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.graphics = null;

        // Constructor

        this.constructor = function(html) {
            base.constructor.call(this, html);

            this.addStyleClass("splunk-viz-GraphicsVizBase");

            this.setStyle({ position: "absolute", left: "0px", top: "0px" });

            this.graphics = new Canvas();
            this.graphics.element.style.position = "absolute";
            this.graphics.appendTo(this.element);

            this.invalidate("renderGraphicsPass");
        };

        // Public Methods

        this.renderGraphics = function() {
            if (this.isValid("renderGraphicsPass")) {
                return;
            }

            var width = this.getInternal("width");
            var height = this.getInternal("height");

            var graphics = this.graphics;
            graphics.setSize(width, height);

            this.renderGraphicsOverride(graphics, width, height);

            this.markValid("renderGraphicsPass");
        };

        this.localToGlobal = function(point) {
            if (point == null) {
                throw new Error("Parameter point must be non-null.");
            }
            if (!(point instanceof Point)) {
                throw new Error("Parameter point must be of type " + Class.getName(Point) + ".");
            }

            var offset = this.$element.offset();
            return new Point(point.x + offset.left, point.y + offset.top);
        };

        this.globalToLocal = function(point) {
            if (point == null) {
                throw new Error("Parameter point must be non-null.");
            }
            if (!(point instanceof Point)) {
                throw new Error("Parameter point must be of type " + Class.getName(Point) + ".");
            }

            var offset = this.$element.offset();
            return new Point(point.x - offset.left, point.y - offset.top);
        };

        // Protected Methods

        this.renderGraphicsOverride = function(graphics, width, height) {
        };

    });

});
