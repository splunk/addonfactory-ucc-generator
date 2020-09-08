define(function(require, exports, module) {

    var $ = require("jquery");
    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var Event = require("jg/events/Event");
    var EventData = require("jg/events/EventData");
    var Point = require("jg/geom/Point");
    var Canvas = require("jg/graphics/Canvas");
    var Color = require("jg/graphics/Color");
    var DrawingUtil = require("jg/graphics/DrawingUtil");
    var SolidFillBrush = require("jg/graphics/SolidFillBrush");
    var SolidStrokeBrush = require("jg/graphics/SolidStrokeBrush");
    var PropertyTween = require("jg/motion/PropertyTween");
    var PowerEaser = require("jg/motion/PowerEaser");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Property = require("jg/properties/Property");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var NumberUtil = require("jg/utils/NumberUtil");
    var StringUtil = require("jg/utils/StringUtil");
    var Histogram = require("splunk/charting/Histogram");
    var GraphicsVizBase = require("splunk/viz/GraphicsVizBase");

    return Class(module.id, GraphicsVizBase, function(ClickDragRangeMarker, base) {

        // Public Passes

        this.updateRangePass = new Pass("updateRange", 0.4);

        // Public Events

        this.rangeChanged = new ChainedEvent("rangeChanged", this.change);
        this.dragStart = new Event("dragStart", EventData);
        this.dragComplete = new Event("dragComplete", EventData);

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
                    this.invalidate("updateRangePass");
                }
            });

        this.minimum = new ObservableProperty("minimum", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("updateRangePass");
            });

        this.maximum = new ObservableProperty("maximum", Number, NaN)
            .writeFilter(function(value) {
                return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
            })
            .onChange(function(e) {
                this.invalidate("updateRangePass");
            });

        this.minimumSnap = new ObservableProperty("minimumSnap", Function, null)
            .onChange(function(e) {
                this.invalidate("updateRangePass");
            });

        this.maximumSnap = new ObservableProperty("maximumSnap", Function, null)
            .onChange(function(e) {
                this.invalidate("updateRangePass");
            });

        this.minimumFormat = new ObservableProperty("minimumFormat", Function, null)
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.maximumFormat = new ObservableProperty("maximumFormat", Function, null)
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.rangeFormat = new ObservableProperty("rangeFormat", Function, null)
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.actualMinimum = new Property("actualMinimum", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangePass");
                this.updateRange();
            })
            .getter(function() {
                return this._actualMinimum;
            });

        this.actualMaximum = new Property("actualMaximum", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateRangePass");
                this.updateRange();
            })
            .getter(function() {
                return this._actualMaximum;
            });

        this.labelOpacity = new ObservableProperty("labelOpacity", Number, 0)
            .onChange(function(e) {
                this._redrawLabelOpacity();
            });

        // Private Properties

        this._actualMinimum = NaN;
        this._actualMaximum = NaN;
        this._relativeMinimum = 0;
        this._relativeMaximum = 1;
        this._labelOpacityTween = null;
        this._fillBrush = null;
        this._lineBrush = null;
        this._backgroundBrush = null;
        this._labelGraphics = null;
        this._minimumLabel = null;
        this._maximumLabel = null;
        this._rangeLabel = null;
        this._rangeLabelClip = null;
        this._labelContainer = null;
        this._moveHotspot = null;
        this._areLabelsVisible = false;
        this._dragMode = null;
        this._pressMouseX = 0;
        this._pressMinimum = 0;
        this._pressMaximum = 1;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this, "<div tabindex=\"0\"></div>");

            this.addStyleClass("splunk-charting-ClickDragRangeMarker");

            this.setStyle({ outline: "none" });

            this._self_mouseOver = FunctionUtil.bind(this._self_mouseOver, this);
            this._self_mouseOut = FunctionUtil.bind(this._self_mouseOut, this);
            this._self_mouseMove = FunctionUtil.bind(this._self_mouseMove, this);
            this._self_mouseDown = FunctionUtil.bind(this._self_mouseDown, this);
            this._self_keyDown = FunctionUtil.bind(this._self_keyDown, this);
            this._document_mouseUp = FunctionUtil.bind(this._document_mouseUp, this);
            this._document_mouseMove = FunctionUtil.bind(this._document_mouseMove, this);
            this._document_mouseLeave = FunctionUtil.bind(this._document_mouseLeave, this);

            this._labelOpacityTween = new PropertyTween(this, "labelOpacity", 0.3, new PowerEaser(0, 3));

            this._fillBrush = new SolidFillBrush(Color.fromNumber(0xD9D9D9), 1);

            this._lineBrush = new SolidStrokeBrush(Color.fromNumber(this.getInternal("foregroundColor")), 0.4).set("caps", "square");

            this._backgroundBrush = new SolidFillBrush(Color.fromNumber(0xEAEAEA), 0.66);

            this._labelGraphics = new Canvas();
            this._labelGraphics.element.style.position = "absolute";

            this._minimumLabel = document.createElement("span");
            $(this._minimumLabel).addClass("splunk-charting-label");
            $(this._minimumLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

            this._maximumLabel = document.createElement("span");
            $(this._maximumLabel).addClass("splunk-charting-label");
            $(this._maximumLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

            this._rangeLabel = document.createElement("span");
            $(this._rangeLabel).addClass("splunk-charting-label");
            $(this._rangeLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

            this._rangeLabelClip = document.createElement("div");
            this._rangeLabelClip.appendChild(this._rangeLabel);
            $(this._rangeLabelClip).css({ position: "absolute", left: "0px", top: "0px", margin: "0px", padding: "0px", overflow: "hidden" });

            this._labelContainer = document.createElement("div");
            this._labelGraphics.appendTo(this._labelContainer);
            this._labelContainer.appendChild(this._minimumLabel);
            this._labelContainer.appendChild(this._maximumLabel);
            this._labelContainer.appendChild(this._rangeLabelClip);
            $(this._labelContainer).css({ position: "absolute", left: "0px", top: "0px", margin: "0px", padding: "0px" });

            this._moveHotspot = document.createElement("div");
            $(this._moveHotspot).css({ position: "absolute", left: "0px", top: "0px", margin: "0px", padding: "0px", cursor: "move", visibility: "hidden" });

            this.$element.bind("mouseover", this._self_mouseOver);
            this.$element.bind("mouseout", this._self_mouseOut);
            this.$element.bind("mousemove", this._self_mouseMove);
            this.$element.bind("mousedown", this._self_mouseDown);
            this.$element.bind("keydown", this._self_keyDown);

            this.element.appendChild(this._labelContainer);
            this.element.appendChild(this._moveHotspot);
        };

        // Public Methods

        this.updateRange = function() {
            if (this.isValid("updateRangePass")) {
                return;
            }

            var actualMinimum = this.getInternal("minimum");
            var actualMaximum = this.getInternal("maximum");
            var relativeMinimum = 0;
            var relativeMaximum = 1;

            var histogram = this.getInternal("histogram");
            if (histogram) {
                var histogramMinimumX = histogram.get("actualMinimumX");
                var histogramMaximumX = histogram.get("actualMaximumX");
                var histogramRangeX = histogramMaximumX - histogramMinimumX;

                var minimumSnap = this.getInternal("minimumSnap");
                if ((minimumSnap != null) && !isNaN(actualMinimum)) {
                    actualMinimum = minimumSnap(actualMinimum);
                }

                var maximumSnap = this.getInternal("maximumSnap");
                if ((maximumSnap != null) && !isNaN(actualMaximum)) {
                    actualMaximum = maximumSnap(actualMaximum);
                }

                if (!isNaN(actualMinimum)) {
                    relativeMinimum = (histogramRangeX > 0) ? ((actualMinimum - histogramMinimumX) / histogramRangeX) : 0;
                } else {
                    actualMinimum = histogramMinimumX;
                }

                if (!isNaN(actualMaximum)) {
                    relativeMaximum = (histogramRangeX > 0) ? ((actualMaximum - histogramMinimumX) / histogramRangeX) : 1;
                } else {
                    actualMaximum = histogramMaximumX;
                }

                var temp;
                if (actualMinimum > actualMaximum) {
                    temp = actualMinimum;
                    actualMinimum = actualMaximum;
                    actualMaximum = temp;

                    temp = relativeMinimum;
                    relativeMinimum = relativeMaximum;
                    relativeMaximum = temp;
                }
            }

            var actualChanged = ((actualMinimum != this._actualMinimum) || (actualMaximum != this._actualMaximum));
            var relativeChanged = ((relativeMinimum != this._relativeMinimum) || (relativeMaximum != this._relativeMaximum));

            this._actualMinimum = actualMinimum;
            this._actualMaximum = actualMaximum;
            this._relativeMinimum = relativeMinimum;
            this._relativeMaximum = relativeMaximum;

            if (actualChanged || relativeChanged) {
                this.invalidate("renderGraphicsPass");
            }

            this.markValid("updateRangePass");

            if (actualChanged) {
                this.fire("rangeChanged", new EventData());
            }
        };

        this.isDragging = function() {
            return (this._dragMode != null);
        };

        // Protected Methods

        this.onAppend = function() {
            $(document).bind("mousemove", this._document_mouseMove);
            $(document).bind("mouseleave", this._document_mouseLeave);
        };

        this.onRemove = function() {
            $(document).unbind("mouseup", this._document_mouseUp);
            $(document).unbind("mousemove", this._document_mouseMove);
            $(document).unbind("mouseleave", this._document_mouseLeave);
        };

        this.renderGraphicsOverride = function(graphics, width, height) {
            var actualMinimum = this._actualMinimum;
            var actualMaximum = this._actualMaximum;
            var relativeMinimum = this._relativeMinimum;
            var relativeMaximum = this._relativeMaximum;
            var minimumLabel = $(this._minimumLabel);
            var maximumLabel = $(this._maximumLabel);
            var rangeLabel = $(this._rangeLabel);
            var rangeLabelClip = $(this._rangeLabelClip);
            var moveHotspot = $(this._moveHotspot);

            // format labels

            var minimumFormat = this.getInternal("minimumFormat");
            if (isNaN(actualMinimum)) {
                minimumLabel.html("");
            } else if (!minimumFormat) {
                minimumLabel.html(StringUtil.escapeHTML(actualMinimum));
            } else {
                minimumLabel.html(StringUtil.escapeHTML(minimumFormat(actualMinimum)));
            }

            var maximumFormat = this.getInternal("maximumFormat");
            if (isNaN(actualMaximum)) {
                maximumLabel.html("");
            } else if (!maximumFormat) {
                maximumLabel.html(StringUtil.escapeHTML(actualMaximum));
            } else {
                maximumLabel.html(StringUtil.escapeHTML(maximumFormat(actualMaximum)));
            }

            var rangeFormat = this.getInternal("rangeFormat");
            if (!rangeFormat || isNaN(actualMinimum) || isNaN(actualMaximum)) {
                rangeLabel.html("");
            } else {
                rangeLabel.html(StringUtil.escapeHTML(rangeFormat(actualMinimum, actualMaximum)));
            }

            // compute placements

            if (relativeMinimum > relativeMaximum) {
                var temp;

                temp = relativeMinimum;
                relativeMinimum = relativeMaximum;
                relativeMaximum = temp;

                temp = minimumLabel;
                minimumLabel = maximumLabel;
                maximumLabel = temp;
            }

            var x1 = 0;
            var x2 = Math.round(width * relativeMinimum);
            var x3 = Math.round(width * relativeMaximum);
            var x4 = Math.round(width);

            var y1 = 0;
            var y2 = Math.round(height);

            x2 = NumberUtil.minMax(x2, x1, x4);
            x3 = NumberUtil.minMax(x3, x1, x4);

            // layout labels

            var minimumLabelBounds = {};
            minimumLabelBounds.width = Math.round(minimumLabel.outerWidth(true));
            minimumLabelBounds.height = 20;
            minimumLabelBounds.x = x2 - minimumLabelBounds.width;
            minimumLabelBounds.y = Math.min(y2 - minimumLabelBounds.height, 0);

            var maximumLabelBounds = {};
            maximumLabelBounds.width = Math.round(maximumLabel.outerWidth(true));
            maximumLabelBounds.height = 20;
            maximumLabelBounds.x = x3;
            maximumLabelBounds.y = Math.min(y2 - maximumLabelBounds.height, 0);

            var rangeLabelBounds = {};
            rangeLabelBounds.width = Math.min(Math.round(rangeLabel.outerWidth(true)), x3 - x2);
            rangeLabelBounds.height = 20;
            rangeLabelBounds.x = x2 + Math.round((x3 - x2 - rangeLabelBounds.width) / 2);
            rangeLabelBounds.y = y2;

            if ((maximumLabelBounds.x + maximumLabelBounds.width) > x4) {
                maximumLabelBounds.x = x4 - maximumLabelBounds.width;
            }
            if ((minimumLabelBounds.x + minimumLabelBounds.width) > maximumLabelBounds.x) {
                minimumLabelBounds.x = maximumLabelBounds.x - minimumLabelBounds.width;
            }

            if (minimumLabelBounds.x < 0) {
                minimumLabelBounds.x = 0;
            }
            if (maximumLabelBounds.x < (minimumLabelBounds.x + minimumLabelBounds.width)) {
                maximumLabelBounds.x = minimumLabelBounds.x + minimumLabelBounds.width;
            }

            minimumLabel.css({
                left: minimumLabelBounds.x + "px",
                top: minimumLabelBounds.y + Math.round((minimumLabelBounds.height - minimumLabel.outerHeight(true)) / 2) + "px"
            });

            maximumLabel.css({
                left: maximumLabelBounds.x + "px",
                top: maximumLabelBounds.y + Math.round((maximumLabelBounds.height - maximumLabel.outerHeight(true)) / 2) + "px"
            });

            rangeLabel.css({
                top: Math.round((rangeLabelBounds.height - rangeLabel.outerHeight(true)) / 2) + "px"
            });

            rangeLabelClip.css({
                left: rangeLabelBounds.x + "px",
                top: rangeLabelBounds.y + "px",
                width: rangeLabelBounds.width + "px",
                height: rangeLabelBounds.height + "px"
            });

            // layout hotspot

            moveHotspot.css({
                left: x2 + "px",
                top: y1 + "px",
                width: (x3 - x2) + "px",
                height: (y2 - y1) + "px",
                visibility: ((this._dragMode === "move") || (!this._dragMode && ((relativeMinimum > 0) || (relativeMaximum < 1)))) ? "" : "hidden"
            });

            // draw background

            graphics.clear();

            var backgroundBrush = this._backgroundBrush;

            backgroundBrush.beginBrush(graphics);
            DrawingUtil.drawRectangle(backgroundBrush, Math.min(x1 + 1, x4), y1, Math.max(x2 - 1, 0), y2);
            backgroundBrush.endBrush();

            backgroundBrush.beginBrush(graphics);
            DrawingUtil.drawRectangle(backgroundBrush, Math.min(x3 + 1, x4), y1, Math.max(x4 - x3 - 1, 0), y2);
            backgroundBrush.endBrush();

            // draw lines

            graphics = this._labelGraphics;
            graphics.clear();
            graphics.setSize(width + 1, height + 20);  // pad graphics width and height so we can draw outside bounds

            var lineBrush = this._lineBrush;
            lineBrush.set("color", Color.fromNumber(this.getInternal("foregroundColor")));

            lineBrush.beginBrush(graphics);
            lineBrush.moveTo(x2, minimumLabelBounds.y);
            lineBrush.lineTo(x2, y2 + 20);
            lineBrush.endBrush();

            lineBrush.beginBrush(graphics);
            lineBrush.moveTo(x3, maximumLabelBounds.y);
            lineBrush.lineTo(x3, y2 + 20);
            lineBrush.endBrush();

            // draw fills

            var fillBrush = this._fillBrush;

            fillBrush.beginBrush(graphics);
            DrawingUtil.drawRectangle(fillBrush, minimumLabelBounds.x + 1, minimumLabelBounds.y, minimumLabelBounds.width - 1, minimumLabelBounds.height);
            fillBrush.endBrush();

            fillBrush.beginBrush(graphics);
            DrawingUtil.drawRectangle(fillBrush, maximumLabelBounds.x + 1, maximumLabelBounds.y, maximumLabelBounds.width - 1, maximumLabelBounds.height);
            fillBrush.endBrush();

            fillBrush.beginBrush(graphics);
            DrawingUtil.drawRectangle(fillBrush, x2 + 1, y2, Math.max(x3 - x2 - 1, 0), 20);
            fillBrush.endBrush();

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

        this._updateShowLabels = function(mouseLocal, enableShow) {
            if (isNaN(this.getInternal("minimum")) && isNaN(this.getInternal("maximum")) &&
                ((mouseLocal.x < 0) || (mouseLocal.x > this.getInternal("width")) || (mouseLocal.y < 0) || (mouseLocal.y > this.getInternal("height")))) {
                this._hideLabels();
            } else if (enableShow !== false) {
                this._showLabels();
            }
        };

        this._showLabels = function() {
            if (this._areLabelsVisible) {
                return;
            }

            this._areLabelsVisible = true;

            this._labelOpacityTween.to(1);
        };

        this._hideLabels = function() {
            if (!this._areLabelsVisible) {
                return;
            }

            this._areLabelsVisible = false;

            this._labelOpacityTween.to(0);
        };

        this._beginDrag = function(mouseLocal, dragMode) {
            if (this._dragMode || !dragMode) {
                return;
            }

            this._dragMode = dragMode;

            this._pressMouseX = mouseLocal.x;
            this._pressMinimum = this._relativeMinimum;
            this._pressMaximum = this._relativeMaximum;

            this._updateDrag(mouseLocal);

            this.fire("dragStart", new EventData());
        };

        this._endDrag = function() {
            if (!this._dragMode) {
                return;
            }

            var dragMode = this._dragMode;
            this._dragMode = null;

            this.validate("updateRangePass");

            switch (dragMode) {
                case "new":
                case "inside":
                    // select single bucket
                    this._selectOne();
                    break;
                case "outside":
                    // select all
                    this._selectAll();
                    break;
                case "select":
                    // if nothing or everything is selected, select all
                    if ((this._relativeMinimum == this._relativeMaximum) || ((this._relativeMinimum <= 0) && (this._relativeMaximum >= 1))) {
                        this._selectAll();
                    }
                    break;
            }

            this.invalidate("renderGraphicsPass");

            this.fire("dragComplete", new EventData());
        };

        this._updateDrag = function(mouseLocal) {
            if (!this._dragMode) {
                return;
            }

            switch (this._dragMode) {
                case "new":
                    this._updateDragStart(mouseLocal, "select");
                    break;
                case "inside":
                    this._updateDragStart(mouseLocal, "move");
                    break;
                case "outside":
                    this._updateDragStart(mouseLocal, "select");
                    break;
                case "select":
                    this._updateDragSelect(mouseLocal);
                    break;
                case "move":
                    this._updateDragMove(mouseLocal);
                    break;
            }
        };

        this._updateDragStart = function(mouseLocal, nextDragMode) {
            if (Math.abs(mouseLocal.x - this._pressMouseX) < 4) {
                return;
            }

            this._dragMode = nextDragMode;

            this._updateDrag(mouseLocal);
        };

        this._updateDragSelect = function(mouseLocal) {
            var histogram = this.getInternal("histogram");
            if (!histogram) {
                return;
            }

            var width = this.getInternal("width");
            if (width <= 0) {
                return;
            }

            var pressMouseX = NumberUtil.minMax(this._pressMouseX, 0, width);
            var mouseX = NumberUtil.minMax(mouseLocal.x, 0, width);

            var relativeMinimum = pressMouseX / width;
            var relativeMaximum = mouseX / width;

            var histogramMinimumX = histogram.get("actualMinimumX");
            var histogramMaximumX = histogram.get("actualMaximumX");
            var histogramRangeX = histogramMaximumX - histogramMinimumX;

            var minimum = histogramMinimumX + histogramRangeX * relativeMinimum;
            var maximum = histogramMinimumX + histogramRangeX * relativeMaximum;
            if (minimum > maximum) {
                var temp = minimum;
                minimum = maximum;
                maximum = temp;
            }

            var minimumSnap = this.getInternal("minimumSnap");
            if ((minimumSnap != null) && !isNaN(minimum)) {
                minimum = minimumSnap(minimum, true);
            }

            var maximumSnap = this.getInternal("maximumSnap");
            if ((maximumSnap != null) && !isNaN(maximum)) {
                maximum = maximumSnap(maximum, true);
            }

            this.set("minimum", minimum);
            this.set("maximum", maximum);
        };

        this._updateDragMove = function(mouseLocal) {
            var histogram = this.getInternal("histogram");
            if (!histogram) {
                return;
            }

            var width = this.getInternal("width");
            if (width <= 0) {
                return;
            }

            var diff = (mouseLocal.x - this._pressMouseX) / width;
            diff = NumberUtil.minMax(diff, -this._pressMinimum, 1 - this._pressMaximum);

            var relativeMinimum = this._pressMinimum + diff;
            var relativeMaximum  = this._pressMaximum + diff;

            var histogramMinimumX = histogram.get("actualMinimumX");
            var histogramMaximumX = histogram.get("actualMaximumX");
            var histogramRangeX = histogramMaximumX - histogramMinimumX;

            var minimum = histogramMinimumX + histogramRangeX * relativeMinimum;
            var maximum = histogramMinimumX + histogramRangeX * relativeMaximum;

            this.set("minimum", minimum);
            this.set("maximum", maximum);
        };

        this._selectOne = function() {
            var histogram = this.getInternal("histogram");
            if (!histogram) {
                return;
            }

            var width = this.getInternal("width");
            if (width <= 0) {
                return;
            }

            var pressMouseX = NumberUtil.minMax(this._pressMouseX, 0, width);
            var relativePress = pressMouseX / width;

            var histogramMinimumX = histogram.get("actualMinimumX");
            var histogramMaximumX = histogram.get("actualMaximumX");
            var histogramRangeX = histogramMaximumX - histogramMinimumX;

            var minimum = histogramMinimumX + histogramRangeX * relativePress;
            var maximum = minimum;

            var minimumSnap = this.getInternal("minimumSnap");
            if ((minimumSnap != null) && !isNaN(minimum)) {
                minimum = minimumSnap(minimum, true);
            }

            var maximumSnap = this.getInternal("maximumSnap");
            if ((maximumSnap != null) && !isNaN(maximum)) {
                maximum = maximumSnap(maximum, true);
            }

            this.set("minimum", minimum);
            this.set("maximum", maximum);
            this.validate("updateRangePass");
        };

        this._selectAll = function() {
            this.set("minimum", NaN);
            this.set("maximum", NaN);
            this.validate("updateRangePass");
        };

        this._self_mouseOver = function(e) {
            if (this._dragMode) {
                return;
            }

            var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
            this._updateShowLabels(mouseLocal);
        };

        this._self_mouseOut = function(e) {
            if (this._dragMode) {
                return;
            }

            var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
            this._updateShowLabels(mouseLocal);
        };

        this._self_mouseMove = function(e) {
            if (this._dragMode) {
                return;
            }

            var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
            this._updateShowLabels(mouseLocal);
        };

        this._self_mouseDown = function(e) {
            var width = this.getInternal("width");
            var height = this.getInternal("height");
            if ((width <= 0) || (height <= 0)) {
                return;
            }

            var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
            var mouseX = mouseLocal.x / width;
            var mouseY = mouseLocal.y / height;
            if ((mouseX < 0) || (mouseX > 1) || (mouseY < 0) || (mouseY > 1)) {
                return;
            }

            this.element.focus();

            $(document).bind("mouseup", this._document_mouseUp);

            if ((this._relativeMinimum <= 0) && (this._relativeMaximum >= 1)) {
                this._beginDrag(mouseLocal, "new");
            } else if ((mouseX > this._relativeMinimum) && (mouseX < this._relativeMaximum)) {
                this._beginDrag(mouseLocal, "inside");
            } else {
                this._beginDrag(mouseLocal, "outside");
            }

            e.preventDefault();
        };

        this._self_keyDown = function(e) {
            if (this._dragMode) {
                return;
            }

            if (e.keyCode == 27) {  // esc
                // clicking outside selection selects all
                if (!isNaN(this.getInternal("minimum")) || !isNaN(this.getInternal("maximum"))) {
                    this._beginDrag(new Point(0, 0), "outside");
                    this._endDrag();
                }
            }
        };

        this._document_mouseUp = function(e) {
            var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));

            $(document).unbind("mouseup", this._document_mouseUp);

            this._endDrag();
            this._updateShowLabels(mouseLocal, false);
        };

        this._document_mouseMove = function(e) {
            var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
            if (this._dragMode) {
                this._updateDrag(mouseLocal);
            } else {
                this._updateShowLabels(mouseLocal, false);
            }
        };

        this._document_mouseLeave = function(e) {
            if (!this._dragMode) {
                this._updateShowLabels(new Point(-1, -1), false);
            }
        };

    });

});
