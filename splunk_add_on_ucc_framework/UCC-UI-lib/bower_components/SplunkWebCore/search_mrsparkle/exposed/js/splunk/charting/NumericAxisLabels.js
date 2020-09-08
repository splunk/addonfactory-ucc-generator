define(function(require, exports, module) {

    var $ = require("jquery");
    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var EventData = require("jg/events/EventData");
    var Color = require("jg/graphics/Color");
    var SolidStrokeBrush = require("jg/graphics/SolidStrokeBrush");
    var ArrayProperty = require("jg/properties/ArrayProperty");
    var ObservableEnumProperty = require("jg/properties/ObservableEnumProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Property = require("jg/properties/Property");
    var StringUtil = require("jg/utils/StringUtil");
    var Histogram = require("splunk/charting/Histogram");
    var GraphicsVizBase = require("splunk/viz/GraphicsVizBase");

    return Class(module.id, GraphicsVizBase, function(NumericAxisLabels, base) {

        // Public Passes

        this.updateLabelsPass = new Pass("updateLabels", 0.3);

        // Public Events

        this.labelsChanged = new ChainedEvent("labelsChanged", this.change);

        // Public Properties

        this.placement = new ObservableEnumProperty("placement", String, [ "left", "right" ])
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

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
                if ((target === this) || ((target instanceof Histogram) && (e.event === target.rangeYChanged))) {
                    this.invalidate("updateLabelsPass");
                }
            });

        this.labelFormat = new ObservableProperty("labelFormat", Function, null)
            .onChange(function(e) {
                this.invalidate("updateLabelsPass");
            });

        this.actualUnit = new Property("actualUnit", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateLabelsPass");
            })
            .getter(function() {
                return this._actualUnit;
            });

        this.positions = new ArrayProperty("positions", Number)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateLabelsPass");
            })
            .getter(function() {
                var value = [];
                var labelInfos = this._labelInfos;
                var labelInfo;
                for (var i = 0, l = labelInfos.length; i < l; i++) {
                    labelInfo = labelInfos[i];
                    if (labelInfo.visible) {
                        value.push(labelInfo.relative);
                    }
                }
                return value;
            });

        // Private Properties

        this._actualUnit = 0;
        this._lineBrush = null;
        this._tickBrush = null;
        this._labelInfos = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-charting-NumericAxisLabels");

            this._lineBrush = new SolidStrokeBrush(Color.fromNumber(this.getInternal("foregroundColor")), 0.2).set("caps", "square");

            this._tickBrush = new SolidStrokeBrush(Color.fromNumber(this.getInternal("foregroundColor")), 0.1);

            this._labelInfos = [];
        };

        // Public Methods

        this.updateLabels = function() {
            if (this.isValid("updateLabelsPass")) {
                return;
            }

            this.invalidate("renderGraphicsPass");

            var element = this.element;
            var labelFormat = this.getInternal("labelFormat");
            var labelInfos = this._labelInfos;
            var numLabelInfos = labelInfos.length;
            var numNewLabelInfos = 0;
            var labelInfo;

            try {
                var maxMajorUnits = 50;

                // set default value for actualUnit
                this._actualUnit = 0;

                // get histogram and verify not null
                var histogram = this.getInternal("histogram");
                if (!histogram) {
                    return;
                }

                // get minimum and maximum and verify not equal
                var minimum = histogram.get("actualMinimumY");
                var maximum = histogram.get("actualMaximumY");
                if (minimum == maximum) {
                    return;
                }

                // scale minimum and maximum if required
                var scale = histogram.get("scaleY");
                var scaleMajorUnit = (scale != null);
                var minimumScaled = minimum;
                var maximumScaled = maximum;
                if (scaleMajorUnit) {
                    minimum = scale.scaleToValue(minimum);
                    maximum = scale.scaleToValue(maximum);
                }
                var rangeScaled = maximumScaled - minimumScaled;

                // compute majorUnit
                var majorUnit = this._computeAutoUnits(rangeScaled);

                // verify majorUnit is greater than zero
                if (majorUnit <= 0) {
                    return;
                }

                // snap majorUnit to integer
                if (rangeScaled >= 1) {
                    majorUnit = Math.max(Math.round(majorUnit), 1);
                }

                // scale majorUnit if numMajorUnits is greater than maxMajorUnits
                var numMajorUnits = 1 + Math.floor(rangeScaled / majorUnit);
                majorUnit *= Math.ceil(numMajorUnits / maxMajorUnits);

                // update actualUnit
                this._actualUnit = majorUnit;

                // snap minimum and maximum to majorUnit
                var minimumScaled2 = Math.ceil(minimumScaled / majorUnit) * majorUnit - majorUnit;
                var maximumScaled2 = Math.ceil(maximumScaled / majorUnit) * majorUnit;

                // compute label info
                var majorValue;
                var majorValue2;
                var majorRelative;
                for (majorValue = minimumScaled2; majorValue <= maximumScaled2; majorValue += majorUnit) {
                    majorValue2 = scaleMajorUnit ? scale.scaleToValue(majorValue) : majorValue;
                    majorRelative = (majorValue - minimumScaled) / rangeScaled;
                    if ((majorRelative > 0) && (majorRelative <= 1)) {
                        if (numNewLabelInfos < numLabelInfos) {
                            labelInfo = labelInfos[numNewLabelInfos];
                        } else {
                            labelInfo = {};
                            labelInfo.label = document.createElement("span");
                            labelInfo.queryLabel = $(labelInfo.label);
                            labelInfo.queryLabel.addClass("splunk-charting-label");
                            labelInfo.queryLabel.css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });
                            labelInfos.push(labelInfo);
                            element.appendChild(labelInfo.label);
                        }

                        labelInfo.relative = majorRelative;

                        if (labelFormat) {
                            labelInfo.queryLabel.html(StringUtil.escapeHTML(labelFormat(majorValue2)));
                        } else {
                            labelInfo.queryLabel.html(StringUtil.escapeHTML(majorValue2));
                        }

                        numNewLabelInfos++;
                    }
                }
            } finally {
                // remove labels
                for (var i = labelInfos.length - 1; i >= numNewLabelInfos; i--) {
                    labelInfo = labelInfos.pop();
                    element = labelInfo.label.parentNode;
                    if (element) {
                        element.removeChild(labelInfo.label);
                    }
                }

                this.markValid("updateLabelsPass");
            }
        };

        // Protected Methods

        this.renderGraphicsOverride = function(graphics, width, height) {
            var isPlacementLeft = (this.getInternal("placement") != "right");
            var lineBrush = this._lineBrush;
            var tickBrush = this._tickBrush;
            var labelInfos = this._labelInfos;
            var numLabelInfos = labelInfos.length;
            var labelInfo;
            var labelInfo2;
            var labelWidth = 0;
            var tickWidth = 25;
            var numOverlaps = 0;
            var i;
            var j;

            // measure labels and prepare for rendering
            for (i = 0; i < numLabelInfos; i++) {
                labelInfo = labelInfos[i];

                labelInfo.y = Math.round(height * (1 - labelInfo.relative));
                labelInfo.width = Math.round(labelInfo.queryLabel.outerWidth(true));
                labelInfo.height = Math.round(labelInfo.queryLabel.outerHeight(true));
                labelInfo.visible = true;

                labelWidth = Math.max(labelWidth, labelInfo.width);
            }
            width = Math.max(labelWidth, tickWidth);
            this.setInternal("width", width);
            for (i = 0; i < numLabelInfos; i++) {
                labelInfo = labelInfos[i];
                labelInfo.x = isPlacementLeft ? (width - labelInfo.width) : 0;
            }

            // compute numOverlaps
            for (i = numLabelInfos - 1; i >= 0; i--) {
                labelInfo = labelInfos[i];
                for (j = i - 1; j >= 0; j--) {
                    labelInfo2 = labelInfos[j];
                    if (labelInfo2.y >= (labelInfo.y + labelInfo.height)) {
                        break;
                    }
                    numOverlaps = Math.max(numOverlaps, i - j);
                }
            }

            // mark overlapping labels as not visible
            if (numOverlaps > 0) {
                numOverlaps++;
                for (i = 0; i < numLabelInfos; i++) {
                    if (((numLabelInfos - i - 1) % numOverlaps) != 0) {
                        labelInfos[i].visible = false;
                    }
                }
            }

            // mark labels that fall outside render bounds as not visible
            for (i = 0; i < numLabelInfos; i++) {
                labelInfo = labelInfos[i];
                if ((labelInfo.y + labelInfo.height) <= height) {
                    break;
                }
                labelInfo.visible = false;
            }

            // layout labels and render ticks
            graphics.clear();
            graphics.setSize(width + (isPlacementLeft ? 1 : 0), height + 1);  // set graphics size according to computed width plus padding for axis lines
            tickBrush.set("color", Color.fromNumber(this.getInternal("foregroundColor")));
            for (i = 0; i < numLabelInfos; i++) {
                labelInfo = labelInfos[i];
                labelInfo.queryLabel.css({
                    left: labelInfo.x + "px",
                    top: labelInfo.y + "px",
                    visibility: labelInfo.visible ? "" : "hidden"
                });

                if (labelInfo.visible) {
                    tickBrush.beginBrush(graphics);
                    if (isPlacementLeft) {
                        tickBrush.moveTo(width, labelInfo.y);
                        tickBrush.lineTo(width - tickWidth, labelInfo.y);
                    } else {
                        tickBrush.moveTo(0, labelInfo.y);
                        tickBrush.lineTo(tickWidth, labelInfo.y);
                    }
                    tickBrush.endBrush();
                }
            }
            lineBrush.set("color", Color.fromNumber(this.getInternal("foregroundColor")));
            lineBrush.beginBrush(graphics);
            if (isPlacementLeft) {
                lineBrush.moveTo(width, 0);
                lineBrush.lineTo(width, Math.round(height));
            } else {
                lineBrush.moveTo(0, 0);
                lineBrush.lineTo(0, Math.round(height));
            }
            lineBrush.endBrush();

            this.fire("labelsChanged", new EventData());
        };

        // Private Methods

        this._computeAutoUnits = function(range) {
            if (range <= 0) {
                return 0;
            }

            var significand = range / 10;
            var exponent = 0;

            if (significand > 0) {
                var str = significand.toExponential(20);
                var eIndex = str.indexOf("e");
                if (eIndex >= 0) {
                    significand = Number(str.substring(0, eIndex));
                    exponent = Number(str.substring(eIndex + 1, str.length));
                }
            }

            significand = Math.ceil(significand);

            if (significand > 5) {
                significand = 10;
            } else if (significand > 2) {
                significand = 5;
            }

            return significand * Math.pow(10, exponent);
        };

    });

});
