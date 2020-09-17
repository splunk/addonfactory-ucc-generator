define(function(require, exports, module) {

    var $ = require("jquery");
    var Class = require("jg/Class");
    var Canvas = require("jg/graphics/Canvas");
    var Color = require("jg/graphics/Color");
    var DrawingUtil = require("jg/graphics/DrawingUtil");
    var SolidFillBrush = require("jg/graphics/SolidFillBrush");
    var SolidStrokeBrush = require("jg/graphics/SolidStrokeBrush");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var StringUtil = require("jg/utils/StringUtil");
    var Histogram = require("splunk/charting/Histogram");
    var GraphicsVizBase = require("splunk/viz/GraphicsVizBase");

    return Class(module.id, GraphicsVizBase, function(CursorMarker, base) {

        // Public Properties

        this.foregroundColor = new ObservableProperty("foregroundColor", Number, 0x000000)
            .writeFilter(function(value) {
                return !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
            })
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.histogram = new ObservableProperty("histogram", Histogram, null)
            .onChange(function(e) {
                var target = e.target;
                if ((target === this) || ((target instanceof Histogram) && (e.event === target.rangeXChanged))) {
                    this.invalidate("renderGraphicsPass");
                }
            });

        this.value = new ObservableProperty("value", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.valueSnap = new ObservableProperty("valueSnap", Function, null)
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.valueFormat = new ObservableProperty("valueFormat", Function, null)
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.labelOpacity = new ObservableProperty("labelOpacity", Number, 1)
            .onChange(function(e) {
                this._redrawLabelOpacity();
            });

        // Private Properties

        this._fillBrush = null;
        this._lineBrush = null;
        this._backgroundBrush = null;
        this._labelGraphics = null;
        this._valueLabel = null;
        this._labelContainer = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-charting-CursorMarker");

            this._fillBrush = new SolidFillBrush(Color.fromNumber(0xD9D9D9), 1);

            this._lineBrush = new SolidStrokeBrush(Color.fromNumber(this.getInternal("foregroundColor")), 0.4).set("caps", "square");

            this._backgroundBrush = new SolidFillBrush(Color.fromNumber(0xEAEAEA), 0.66);

            this._labelGraphics = new Canvas();
            this._labelGraphics.element.style.position = "absolute";

            this._valueLabel = document.createElement("span");
            $(this._valueLabel).addClass("splunk-charting-label");
            $(this._valueLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

            this._labelContainer = document.createElement("div");
            this._labelGraphics.appendTo(this._labelContainer);
            this._labelContainer.appendChild(this._valueLabel);
            $(this._labelContainer).css({ position: "absolute", left: "0px", top: "0px", margin: "0px", padding: "0px" });

            this.element.appendChild(this._labelContainer);
        };

        // Protected Methods

        this.renderGraphicsOverride = function(graphics, width, height) {
            var value = this.getInternal("value");
            var displayValue = value;
            var relativeValue = 0;
            var valueLabel = $(this._valueLabel);

            var histogram = this.getInternal("histogram");
            if (histogram) {
                var histogramMinimumX = histogram.get("actualMinimumX");
                var histogramMaximumX = histogram.get("actualMaximumX");
                var histogramRangeX = histogramMaximumX - histogramMinimumX;

                var valueSnap = this.getInternal("valueSnap");
                if (valueSnap && !isNaN(value)) {
                    displayValue = valueSnap(value);
                }

                if (!isNaN(value)) {
                    relativeValue = (histogramRangeX > 0) ? ((value - histogramMinimumX) / histogramRangeX) : 0;
                }
            }

            // format label

            var valueFormat = this.getInternal("valueFormat");
            if (isNaN(displayValue)) {
                valueLabel.html("");
            } else if (!valueFormat) {
                valueLabel.html(StringUtil.escapeHTML(displayValue));
            } else {
                valueLabel.html(StringUtil.escapeHTML(valueFormat(displayValue)));
            }

            // compute placements

            var x1 = 0;
            var x2 = Math.round(width * Math.min(Math.max(relativeValue, 0), 1));

            var y1 = 0;
            var y2 = Math.round(height);

            // layout label

            var valueLabelBounds = {};
            valueLabelBounds.width = Math.round(valueLabel.outerWidth(true));
            valueLabelBounds.height = 20;
            valueLabelBounds.x = Math.max(x2 - valueLabelBounds.width, 0);
            valueLabelBounds.y = Math.min(y2 - valueLabelBounds.height, 0);

            valueLabel.css({
                left: valueLabelBounds.x + "px",
                top: valueLabelBounds.y + Math.round((valueLabelBounds.height - valueLabel.outerHeight(true)) / 2) + "px",
                visibility: ((relativeValue > 0) && (relativeValue <= 1)) ? "" : "hidden"
            });

            // draw background

            graphics.clear();

            if (relativeValue > 0) {
                var backgroundBrush = this._backgroundBrush;
                backgroundBrush.beginBrush(graphics);
                DrawingUtil.drawRectangle(backgroundBrush, x1, y1, x2 - x1, y2 - y1);
                backgroundBrush.endBrush();
            }

            // draw line and fill

            var labelGraphics = this._labelGraphics;
            labelGraphics.clear();
            labelGraphics.setSize(width, height);

            if ((relativeValue > 0) && (relativeValue <= 1)) {
                var lineBrush = this._lineBrush;
                lineBrush.set("color", Color.fromNumber(this.getInternal("foregroundColor")));
                lineBrush.beginBrush(graphics);
                lineBrush.moveTo(x2, y1);
                lineBrush.lineTo(x2, y2);
                lineBrush.endBrush();

                var fillBrush = this._fillBrush;
                fillBrush.beginBrush(labelGraphics);
                DrawingUtil.drawRectangle(fillBrush, valueLabelBounds.x + 1, valueLabelBounds.y, valueLabelBounds.width - 1, valueLabelBounds.height);
                fillBrush.endBrush();
            }

            this._redrawLabelOpacity();
        };

        // Private Methods

        this._redrawLabelOpacity = function() {
            var opacity = this.getInternal("labelOpacity");
            $(this._labelContainer).css({
                opacity: opacity + "",
                filter: "alpha(opacity=" + Math.round(opacity * 100) + ")",
                visibility: (opacity > 0) ? "" : "hidden"
            });
        };

    });

});
