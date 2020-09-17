define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Color = require("jg/graphics/Color");
    var SolidStrokeBrush = require("jg/graphics/SolidStrokeBrush");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var NumericAxisLabels = require("splunk/charting/NumericAxisLabels");
    var GraphicsVizBase = require("splunk/viz/GraphicsVizBase");

    return Class(module.id, GraphicsVizBase, function(GridLines, base) {

        // Public Properties

        this.foregroundColor = new ObservableProperty("foregroundColor", Number, 0x000000)
            .writeFilter(function(value) {
                return !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
            })
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.axisLabels = new ObservableProperty("axisLabels", NumericAxisLabels, null)
            .onChange(function(e) {
                var target = e.target;
                if ((target === this) || ((target instanceof NumericAxisLabels) && (e.event === target.labelsChanged))) {
                    this.invalidate("renderGraphicsPass");
                }
            });

        // Private Properties

        this._lineBrush = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-charting-GridLines");

            this._lineBrush = new SolidStrokeBrush(Color.fromNumber(this.getInternal("foregroundColor")), 0.1);
        };

        // Protected Methods

        this.renderGraphicsOverride = function(graphics, width, height) {
            graphics.clear();

            var axisLabels = this.getInternal("axisLabels");
            if (!axisLabels) {
                return;
            }

            var lineBrush = this._lineBrush;
            lineBrush.set("color", Color.fromNumber(this.getInternal("foregroundColor")));

            var positions = axisLabels.get("positions");
            var numPositions = positions.length;
            var position;
            var y;
            for (var i = 0; i < numPositions; i++) {
                position = positions[i];
                y = Math.round(height * (1 - position));
                lineBrush.beginBrush(graphics);
                lineBrush.moveTo(0, y);
                lineBrush.lineTo(width, y);
                lineBrush.endBrush();
            }
        };

    });

});
