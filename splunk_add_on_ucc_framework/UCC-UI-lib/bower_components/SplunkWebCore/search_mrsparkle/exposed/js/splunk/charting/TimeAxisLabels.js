define(function(require, exports, module) {

    var $ = require("jquery");
    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var EventData = require("jg/events/EventData");
    var Color = require("jg/graphics/Color");
    var SolidStrokeBrush = require("jg/graphics/SolidStrokeBrush");
    var ArrayProperty = require("jg/properties/ArrayProperty");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var Property = require("jg/properties/Property");
    var StringUtil = require("jg/utils/StringUtil");
    var Histogram = require("splunk/charting/Histogram");
    var DateTime = require("splunk/time/DateTime");
    var Duration = require("splunk/time/Duration");
    var TimeUtils = require("splunk/time/TimeUtils");
    var TimeZone = require("splunk/time/TimeZone");
    var TimeZones = require("splunk/time/TimeZones");
    var GraphicsVizBase = require("splunk/viz/GraphicsVizBase");

    return Class(module.id, GraphicsVizBase, function(TimeAxisLabels, base) {

        // Public Passes

        this.updateLabelsPass = new Pass("updateLabels", 0.3);

        // Public Events

        this.labelsChanged = new ChainedEvent("labelsChanged", this.change);

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
                    this.invalidate("updateLabelsPass");
                }
            });

        this.timeZone = new ObservableProperty("timeZone", TimeZone, TimeZones.LOCAL)
            .onChange(function(e) {
                this.invalidate("updateLabelsPass");
            });

        this.labelFormat = new ObservableProperty("labelFormat", Function, null)
            .onChange(function(e) {
                this.invalidate("updateLabelsPass");
            });

        this.actualUnit = new Property("actualUnit", Duration)
            .readOnly(true)
            .onRead(function() {
                this.validate("updateLabelsPass");
            })
            .getter(function() {
                return this._actualUnit.clone();
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

        this._actualUnit = null;
        this._lineBrush = null;
        this._labelInfos = null;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-charting-TimeAxisLabels");

            this._actualUnit = new Duration();

            this._lineBrush = new SolidStrokeBrush(Color.fromNumber(this.getInternal("foregroundColor")), 0.2).set("caps", "square");

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
                this._actualUnit = new Duration();

                // get histogram and verify not null
                var histogram = this.getInternal("histogram");
                if (!histogram) {
                    return;
                }

                // get minimum and maximum and verify not equal
                var minimum = histogram.get("actualMinimumX");
                var maximum = histogram.get("actualMaximumX");
                var range = maximum - minimum;
                if (range == 0) {
                    return;
                }

                // adjust minimum and maximum for timeZone
                var timeZone = this.getInternal("timeZone");
                var minimumTime = new DateTime(minimum);
                var maximumTime = new DateTime(maximum);
                minimumTime = minimumTime.toTimeZone(timeZone);
                maximumTime = maximumTime.toTimeZone(timeZone);

                // compute majorUnit
                var majorUnit = this._computeAutoUnits(TimeUtils.subtractDates(maximumTime, minimumTime));

                // compute majorUnit time and verify greater than zero
                var majorUnitTime = TimeUtils.durationToSeconds(majorUnit, minimumTime);
                if (majorUnitTime <= 0) {
                    return;
                }

                // scale majorUnit if numMajorUnits is greater than maxMajorUnits
                var numMajorUnits = 1 + Math.floor((maximum - minimum) / majorUnitTime);
                majorUnit = TimeUtils.multiplyDuration(majorUnit, Math.ceil(numMajorUnits / maxMajorUnits));

                // update actualUnit
                this._actualUnit = majorUnit;

                // snap minimum and maximum to majorUnit
                minimumTime = TimeUtils.subtractDateDuration(TimeUtils.ceilDate(minimumTime, majorUnit), majorUnit);
                maximumTime = TimeUtils.ceilDate(maximumTime, majorUnit);

                // compute label info
                var majorValue;
                var majorRelative;
                var majorUnitNum = 1;
                for (majorValue = minimumTime; majorValue.getTime() <= maximumTime.getTime(); majorUnitNum++) {
                    majorRelative = (majorValue.getTime() - minimum) / range;
                    if ((majorRelative >= 0) && (majorRelative < 1)) {
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
                            labelInfo.queryLabel.html(StringUtil.escapeHTML(labelFormat(majorValue)));
                        } else {
                            labelInfo.queryLabel.html(StringUtil.escapeHTML(majorValue));
                        }

                        numNewLabelInfos++;
                    }
                    majorValue = TimeUtils.addDateDuration(minimumTime, TimeUtils.multiplyDuration(majorUnit, majorUnitNum));
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
            var lineBrush = this._lineBrush;
            var labelInfos = this._labelInfos;
            var numLabelInfos = labelInfos.length;
            var labelInfo;
            var labelInfo2;
            var labelHeight = 0;
            var tickHeight = 25;
            var numOverlaps = 0;
            var i;
            var j;

            // measure labels and prepare for rendering
            for (i = 0; i < numLabelInfos; i++) {
                labelInfo = labelInfos[i];

                labelInfo.x = Math.round(width * labelInfo.relative);
                labelInfo.y = 0;
                labelInfo.width = Math.round(labelInfo.queryLabel.outerWidth(true));
                labelInfo.height = Math.round(labelInfo.queryLabel.outerHeight(true));
                labelInfo.visible = true;

                labelHeight = Math.max(labelHeight, labelInfo.height);
            }
            height = Math.max(labelHeight, tickHeight);
            this.setInternal("height", height);

            // compute numOverlaps
            for (i = 0; i < numLabelInfos; i++) {
                labelInfo = labelInfos[i];
                for (j = i + 1; j < numLabelInfos; j++) {
                    labelInfo2 = labelInfos[j];
                    if (labelInfo2.x >= (labelInfo.x + labelInfo.width)) {
                        break;
                    }
                    numOverlaps = Math.max(numOverlaps, j - i);
                }
            }

            // mark overlapping labels as not visible
            if (numOverlaps > 0) {
                numOverlaps++;
                for (i = 0; i < numLabelInfos; i++) {
                    if ((i % numOverlaps) != 0) {
                        labelInfos[i].visible = false;
                    }
                }
            }

            // mark labels that fall outside render bounds as not visible
            for (i = numLabelInfos - 1; i >= 0; i--) {
                labelInfo = labelInfos[i];
                if ((labelInfo.x + labelInfo.width) <= width) {
                    break;
                }
                labelInfo.visible = false;
            }

            // layout labels and render ticks
            graphics.clear();
            graphics.setSize(width + 1, height);  // set graphics size according to computed height plus padding for axis lines
            lineBrush.set("color", Color.fromNumber(this.getInternal("foregroundColor")));
            for (i = 0; i < numLabelInfos; i++) {
                labelInfo = labelInfos[i];
                labelInfo.queryLabel.css({
                    left: labelInfo.x + "px",
                    top: labelInfo.y + "px",
                    visibility: labelInfo.visible ? "" : "hidden"
                });

                if (labelInfo.visible) {
                    lineBrush.beginBrush(graphics);
                    lineBrush.moveTo(labelInfo.x, 0);
                    lineBrush.lineTo(labelInfo.x, tickHeight);
                    lineBrush.endBrush();
                }
            }
            lineBrush.beginBrush(graphics);
            lineBrush.moveTo(0, 0);
            lineBrush.lineTo(Math.round(width), 0);
            lineBrush.endBrush();

            this.fire("labelsChanged", new EventData());
        };

        // Private Methods

        this._computeAutoUnits = function(range) {
            if (TimeUtils.durationToSeconds(range) <= 0) {
                return new Duration();
            }

            var date = new DateTime(range.years, range.months + 1, range.days + 1, range.hours, range.minutes, range.seconds, TimeZones.UTC);

            range = new Duration(date.getYear(), date.getMonth() - 1, date.getDay() - 1, date.getHours(), date.getMinutes(), date.getSeconds());

            var diff;
            var significand;
            var exponent;
            var str;
            var eIndex;

            diff = range.years;
            if (diff > 2) {
                significand = diff / 10;
                exponent = 0;

                if (significand > 0) {
                    str = significand.toExponential(20);
                    eIndex = str.indexOf("e");
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

                return new Duration(Math.ceil(significand * Math.pow(10, exponent)));
            }

            diff = range.months + diff * 12;
            if (diff > 2) {
                if (diff > 18) {
                    return new Duration(0, 4);
                } else if (diff > 12) {
                    return new Duration(0, 3);
                } else if (diff > 6) {
                    return new Duration(0, 2);
                } else {
                    return new Duration(0, 1);
                }
            }

            diff = range.days + diff * 30;
            if (diff > 2) {
                if (diff > 49) {
                    return new Duration(0, 0, 14);
                } else if (diff > 28) {
                    return new Duration(0, 0, 7);
                } else if (diff > 14) {
                    return new Duration(0, 0, 4);
                } else if (diff > 7) {
                    return new Duration(0, 0, 2);
                } else {
                    return new Duration(0, 0, 1);
                }
            }

            diff = range.hours + diff * 24;
            if (diff > 2) {
                if (diff > 36) {
                    return new Duration(0, 0, 0, 12);
                } else if (diff > 24) {
                    return new Duration(0, 0, 0, 6);
                } else if (diff > 12) {
                    return new Duration(0, 0, 0, 4);
                } else if (diff > 6) {
                    return new Duration(0, 0, 0, 2);
                } else {
                    return new Duration(0, 0, 0, 1);
                }
            }

            diff = range.minutes + diff * 60;
            if (diff > 2) {
                if (diff > 105) {
                    return new Duration(0, 0, 0, 0, 30);
                } else if (diff > 70) {
                    return new Duration(0, 0, 0, 0, 15);
                } else if (diff > 35) {
                    return new Duration(0, 0, 0, 0, 10);
                } else if (diff > 14) {
                    return new Duration(0, 0, 0, 0, 5);
                } else if (diff > 7) {
                    return new Duration(0, 0, 0, 0, 2);
                } else {
                    return new Duration(0, 0, 0, 0, 1);
                }
            }

            diff = range.seconds + diff * 60;
            if (diff > 2) {
                if (diff > 105) {
                    return new Duration(0, 0, 0, 0, 0, 30);
                } else if (diff > 70) {
                    return new Duration(0, 0, 0, 0, 0, 15);
                } else if (diff > 35) {
                    return new Duration(0, 0, 0, 0, 0, 10);
                } else if (diff > 14) {
                    return new Duration(0, 0, 0, 0, 0, 5);
                } else if (diff > 7) {
                    return new Duration(0, 0, 0, 0, 0, 2);
                } else {
                    return new Duration(0, 0, 0, 0, 0, 1);
                }
            }

            significand = diff / 10;
            exponent = 0;

            if (significand > 0) {
                str = significand.toExponential(20);
                eIndex = str.indexOf("e");
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

            return new Duration(0, 0, 0, 0, 0, significand * Math.pow(10, exponent));
        };

    });

});
