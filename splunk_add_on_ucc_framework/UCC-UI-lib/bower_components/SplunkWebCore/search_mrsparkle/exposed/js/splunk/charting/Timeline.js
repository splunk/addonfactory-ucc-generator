define(function(require, exports, module) {

    var $ = require("jquery");
    var Class = require("jg/Class");
    var Pass = require("jg/async/Pass");
    var ChainedEvent = require("jg/events/ChainedEvent");
    var Event = require("jg/events/Event");
    var Point = require("jg/geom/Point");
    var Rectangle = require("jg/geom/Rectangle");
    var Color = require("jg/graphics/Color");
    var GroupBrush = require("jg/graphics/GroupBrush");
    var SolidFillBrush = require("jg/graphics/SolidFillBrush");
    var SolidStrokeBrush = require("jg/graphics/SolidStrokeBrush");
    var PowerEaser = require("jg/motion/PowerEaser");
    var PropertyTween = require("jg/motion/PropertyTween");
    var Property = require("jg/properties/Property");
    var FunctionUtil = require("jg/utils/FunctionUtil");
    var NumberUtil = require("jg/utils/NumberUtil");
    var BorderStrokeBrush = require("splunk/brushes/BorderStrokeBrush");
    var ClickDragRangeMarker = require("splunk/charting/ClickDragRangeMarker");
    var CursorMarker = require("splunk/charting/CursorMarker");
    var GridLines = require("splunk/charting/GridLines");
    var Histogram = require("splunk/charting/Histogram");
    var LogScale = require("splunk/charting/LogScale");
    var NumericAxisLabels = require("splunk/charting/NumericAxisLabels");
    var TimeAxisLabels = require("splunk/charting/TimeAxisLabels");
    var Tooltip = require("splunk/charting/Tooltip");
    var GenericEventData = require("splunk/events/GenericEventData");
    var DateTime = require("splunk/time/DateTime");
    var SimpleTimeZone = require("splunk/time/SimpleTimeZone");
    var SplunkTimeZone = require("splunk/time/SplunkTimeZone");
    var TimeUtils = require("splunk/time/TimeUtils");
    var TimeZones = require("splunk/time/TimeZones");
    var GraphicsVizBase = require("splunk/viz/GraphicsVizBase");

    return Class(module.id, GraphicsVizBase, function(Timeline, base) {

        // Public Passes

        this.dispatchUpdatedPass = new Pass("dispatchUpdated", 3);

        // Public Events

        this.updated = new Event("updated", GenericEventData);
        this.viewChanged = new ChainedEvent("viewChanged", this.change);
        this.selectionChanged = new ChainedEvent("selectionChanged", this.change);
        this.chartDoubleClicked = new Event("chartDoubleClicked", GenericEventData);

        // Public Properties

        this.timeZone = new Property("timeZone", String, null)
            .setter(function(value) {
                this._timeZone = value ? new SplunkTimeZone(value) : TimeZones.LOCAL;
                this._axisLabelsX.set("timeZone", this._timeZone);
                this._rangeMarker.invalidate("updateRangePass");
                this._cursorMarker.invalidate("renderGraphicsPass");
            });

        this.jobID = new Property("jobID", String)
            .getter(function() {
                return this._jobID;
            })
            .setter(function(value) {
                this._jobID = value;
            });

        this.bucketCount = new Property("bucketCount", Number)
            .getter(function() {
                return this._bucketCount;
            })
            .setter(function(value) {
                this._bucketCount = value;
            });

        this.viewMinimum = new Property("viewMinimum", Number)
            .readOnly(true)
            .getter(function() {
                return this._viewMinimum;
            });

        this.viewMaximum = new Property("viewMaximum", Number)
            .readOnly(true)
            .getter(function() {
                return this._viewMaximum;
            });

        this.selectionMinimum = new Property("selectionMinimum", Number)
            .getter(function() {
                return this._selectionMinimum;
            })
            .setter(function(value) {
                if (this._rangeMarker.isDragging()) {
                    return;
                }

                this._rangeMarker.set("minimum", value);
                this._updateSelectionRange(false);
            });

        this.selectionMaximum = new Property("selectionMaximum", Number)
            .getter(function() {
                return this._selectionMaximum;
            })
            .setter(function(value) {
                if (this._rangeMarker.isDragging()) {
                    return;
                }

                this._rangeMarker.set("maximum", value);
                this._updateSelectionRange(false);
            });

        this.actualSelectionMinimum = new Property("actualSelectionMinimum", Number)
            .readOnly(true)
            .getter(function() {
                return this._actualSelectionMinimum;
            });

        this.actualSelectionMaximum = new Property("actualSelectionMaximum", Number)
            .readOnly(true)
            .getter(function() {
                return this._actualSelectionMaximum;
            });

        this.timelineData = new Property("timelineData", Object)
            .readOnly(true)
            .getter(function() {
                return this._cloneTimelineData(this._timelineData);
            });

        this.timelineScale = new Property("timelineScale", Object)
            .readOnly(true)
            .getter(function() {
                var timelineData = this._timelineData;
                if (!timelineData) {
                    return null;
                }

                var buckets = timelineData.buckets;
                if (buckets.length == 0) {
                    return null;
                }

                var bucket = buckets[0];
                var duration = TimeUtils.subtractDates(bucket.latestTime, bucket.earliestTime);
                if (duration.years > 0) {
                    return { value:duration.years, unit:"year" };
                }
                if (duration.months > 0) {
                    return { value:duration.months, unit:"month" };
                }
                if (duration.days > 0) {
                    return { value:duration.days, unit:"day" };
                }
                if (duration.hours > 0) {
                    return { value:duration.hours, unit:"hour" };
                }
                if (duration.minutes > 0) {
                    return { value:duration.minutes, unit:"minute" };
                }
                if (duration.seconds > 0) {
                    return { value:duration.seconds, unit:"second" };
                }
                return null;
            });

        this.enableChartClick = new Property("enableChartClick", Boolean)
            .getter(function() {
                return this._enableChartClick;
            })
            .setter(function(value) {
                this._enableChartClick = value;
            });

        this.scaleY = new Property("scaleY", String)
            .getter(function() {
                return this._scaleY;
            })
            .setter(function(value) {
                value = (value == "log") ? "log" : "linear";
                if (this._scaleY === value) {
                    return;
                }

                this._scaleY = value;
                this._histogram.set("scaleY", (value == "log") ? new LogScale() : null);
            });

        this.foregroundColor = new Property("foregroundColor", Number)
            .getter(function() {
                return this._foregroundColor;
            })
            .setter(function(value) {
                value = !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
                if (this._foregroundColor === value) {
                    return;
                }

                this._foregroundColor = value;
                this._axisLabelsX.set("foregroundColor", value);
                this._axisLabelsY1.set("foregroundColor", value);
                this._axisLabelsY2.set("foregroundColor", value);
                this._gridLines.set("foregroundColor", value);
                this._cursorMarker.set("foregroundColor", value);
                this._rangeMarker.set("foregroundColor", value);

                this.invalidate("renderGraphicsPass");
            });

        this.seriesColor = new Property("seriesColor", Number)
            .getter(function() {
                return this._seriesColor;
            })
            .setter(function(value) {
                value = !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
                if (this._seriesColor === value) {
                    return;
                }

                this._seriesColor = value;
                this._seriesFillBrush.set("color", Color.fromNumber(value));
                this._seriesBorderBrush.set("colors", [ Color.fromNumber(value).darken(0.3) ]);
            });

        this.minimalMode = new Property("minimalMode", Boolean, false)
            .setter(function(value) {
                this.invalidate("renderGraphicsPass");
            });

        this.externalInterface = null;

        // Private Properties

        this._hostPath = null;
        this._basePath = null;

        this._timeZone = TimeZones.LOCAL;
        this._jobID = null;
        this._bucketCount = 1000;
        this._viewMinimum = NaN;
        this._viewMaximum = NaN;
        this._selectionMinimum = NaN;
        this._selectionMaximum = NaN;
        this._actualSelectionMinimum = NaN;
        this._actualSelectionMaximum = NaN;
        this._timelineData = null;
        this._enableChartClick = false;
        this._scaleY = "linear";
        this._foregroundColor = 0x000000;
        this._seriesColor = 0x73A550;

        this._updateCount = 0;
        this._updatingCount = 0;
        this._updatedCount = 0;
        this._dataLoading = false;
        this._loadJobID = null;

        this._seriesFillBrush = null;
        this._seriesBorderBrush = null;
        this._seriesGroupBrush = null;
        this._lineBrush = null;
        this._histogram = null;
        this._axisLabelsX = null;
        this._axisLabelsY1 = null;
        this._axisLabelsY2 = null;
        this._gridLines = null;
        this._cursorMarker = null;
        this._rangeMarker = null;
        this._tooltip = null;

        this._tweenMinimumX = null;
        this._tweenMaximumX = null;
        this._tweenMinimumY = null;
        this._tweenMaximumY = null;

        this._prevDate = null;
        this._prevJobID = null;
        this._prevMouseGlobal = null;
        this._tooltipData = null;
        this._updateSizeInterval = 0;

        // Constructor

        this.constructor = function(hostPath, basePath) {
            base.constructor.call(this);

            this.addStyleClass("splunk-charting-Timeline");

            this.setStyle({ position: "relative", width: "100%", height: "100%", overflow: "hidden" });

            hostPath = (typeof hostPath === "string") ? hostPath : null;
            if (!hostPath) {
                var url = location.href;
                var colonIndex = url.indexOf("://");
                var slashIndex = url.indexOf("/", colonIndex + 4);
                hostPath = url.substring(0, slashIndex);
            }
            this._hostPath = hostPath;

            basePath = (typeof basePath === "string") ? basePath : null;
            if (basePath == null) {
                basePath = "/splunkd";
            }
            this._basePath = basePath;

            this.updateSize = FunctionUtil.bind(this.updateSize, this);
            this._histogram_containedRangeXChanged = FunctionUtil.bind(this._histogram_containedRangeXChanged, this);
            this._histogram_containedRangeYChanged = FunctionUtil.bind(this._histogram_containedRangeYChanged, this);
            this._rangeMarker_dragComplete = FunctionUtil.bind(this._rangeMarker_dragComplete, this);
            this._rangeMarker_labelOpacity_change = FunctionUtil.bind(this._rangeMarker_labelOpacity_change, this);
            this._child_invalidated = FunctionUtil.bind(this._child_invalidated, this);
            this._self_mouseOver = FunctionUtil.bind(this._self_mouseOver, this);
            this._self_mouseOut = FunctionUtil.bind(this._self_mouseOut, this);
            this._self_mouseMove = FunctionUtil.bind(this._self_mouseMove, this);
            this._self_doubleClick = FunctionUtil.bind(this._self_doubleClick, this);
            this._data_success = FunctionUtil.bind(this._data_success, this);
            this._data_error = FunctionUtil.bind(this._data_error, this);

            this.externalInterface = {};

            var seriesColor = this._seriesColor;
            var seriesColorDark = Color.fromNumber(seriesColor).darken(0.3).toNumber();
            this._seriesFillBrush = new SolidFillBrush(Color.fromNumber(seriesColor), 1);
            this._seriesBorderBrush = new BorderStrokeBrush([ Color.fromNumber(seriesColorDark) ], [ 0, 1, 0, 0 ]).set("caps", "square");
            this._seriesGroupBrush = new GroupBrush([ this._seriesFillBrush, this._seriesBorderBrush ]);

            this._lineBrush = new SolidStrokeBrush(Color.fromNumber(this._foregroundColor), 0.1).set("caps", "square");

            this._histogram = new Histogram();
            this._histogram.renderGraphicsPriority = 1;
            this._histogram.set("brush", this._seriesGroupBrush);
            this._histogram.set("minimumX", this._histogram.get("actualMinimumX"));
            this._histogram.set("maximumX", this._histogram.get("actualMaximumX"));
            this._histogram.set("minimumY", this._histogram.get("actualMinimumY"));
            this._histogram.set("maximumY", this._histogram.get("actualMaximumY"));
            this._histogram.on("containedRangeXChanged", this._histogram_containedRangeXChanged);
            this._histogram.on("containedRangeYChanged", this._histogram_containedRangeYChanged);

            this._axisLabelsX = new TimeAxisLabels();
            this._axisLabelsX.renderGraphicsPriority = 1;
            this._axisLabelsX.set("histogram", this._histogram);
            this._axisLabelsX.set("labelFormat", FunctionUtil.bind(this._timeAxisFormat, this));
            this._axisLabelsX.on("invalidated", this._child_invalidated);

            this._axisLabelsY1 = new NumericAxisLabels();
            this._axisLabelsY1.renderGraphicsPriority = 1;
            this._axisLabelsY1.set("histogram", this._histogram);
            this._axisLabelsY1.set("labelFormat", FunctionUtil.bind(this._numericAxisFormat, this));
            this._axisLabelsY1.on("invalidated", this._child_invalidated);

            this._axisLabelsY2 = new NumericAxisLabels();
            this._axisLabelsY2.renderGraphicsPriority = 1;
            this._axisLabelsY2.set("histogram", this._histogram);
            this._axisLabelsY2.set("placement", "right");
            this._axisLabelsY2.set("labelFormat", FunctionUtil.bind(this._numericAxisFormat, this));
            this._axisLabelsY2.on("invalidated", this._child_invalidated);

            this._gridLines = new GridLines();
            this._gridLines.renderGraphicsPriority = 1;
            this._gridLines.set("axisLabels", this._axisLabelsY1);

            this._cursorMarker = new CursorMarker();
            this._cursorMarker.renderGraphicsPriority = 1;
            this._cursorMarker.set("histogram", this._histogram);
            this._cursorMarker.set("valueSnap", FunctionUtil.bind(this._cursorValueSnap, this));
            this._cursorMarker.set("valueFormat", FunctionUtil.bind(this._cursorValueFormat, this));

            this._rangeMarker = new ClickDragRangeMarker();
            this._rangeMarker.renderGraphicsPriority = 1;
            this._rangeMarker.set("histogram", this._histogram);
            this._rangeMarker.set("minimumSnap", FunctionUtil.bind(this._minimumSnap, this));
            this._rangeMarker.set("maximumSnap", FunctionUtil.bind(this._maximumSnap, this));
            this._rangeMarker.set("minimumFormat", FunctionUtil.bind(this._minimumFormat, this));
            this._rangeMarker.set("maximumFormat", FunctionUtil.bind(this._maximumFormat, this));
            this._rangeMarker.set("rangeFormat", FunctionUtil.bind(this._rangeFormat, this));
            this._rangeMarker.on("dragComplete", this._rangeMarker_dragComplete);
            this._rangeMarker.on("labelOpacity.change", this._rangeMarker_labelOpacity_change);

            this._tooltip = new Tooltip();
            this._tooltip.renderGraphicsPriority = 1;

            this.$element.bind("mouseover", this._self_mouseOver);
            this.$element.bind("mouseout", this._self_mouseOut);
            this.$element.bind("mousemove", this._self_mouseMove);
            this.$element.bind("dblclick", this._self_doubleClick);

            this._gridLines.appendTo(this);
            this._histogram.appendTo(this);
            this._axisLabelsX.appendTo(this);
            this._axisLabelsY1.appendTo(this);
            this._axisLabelsY2.appendTo(this);
            this._cursorMarker.appendTo(this);
            this._rangeMarker.appendTo(this);
            this._tooltip.appendTo(this);

            this._tweenMinimumX = new PropertyTween(this._histogram, "minimumX", 0.5, new PowerEaser(0, 3));
            this._tweenMaximumX = new PropertyTween(this._histogram, "maximumX", 0.5, new PowerEaser(0, 3));
            this._tweenMinimumY = new PropertyTween(this._histogram, "minimumY", 0.5, new PowerEaser(0, 3));
            this._tweenMaximumY = new PropertyTween(this._histogram, "maximumY", 0.5, new PowerEaser(0, 3));

            this._updateViewRange();
            this._updateCountRange();
        };

        // Public Methods

        this.dispatchUpdated = function() {
            if (this.isValid("dispatchUpdatedPass")) {
                return;
            }

            this.markValid("dispatchUpdatedPass");

            this.fire("updated", new GenericEventData({ updateCount: this._updatedCount }));
        };

        this.update = function() {
            this._updateCount++;
            this._update();
            return this._updateCount;
        };

        this.getSelectedBuckets = function() {
            if (!this._timelineData) {
                return null;
            }

            var buckets = this._timelineData.buckets;
            if (!buckets) {
                return null;
            }

            var selectedBuckets = new Array();

            var selectionMinimum = this._actualSelectionMinimum;
            var selectionMaximum = this._actualSelectionMaximum;
            var bucket;
            var bucketTime;

            for (var i = 0, l = buckets.length; i < l; i++) {
                bucket = buckets[i];

                bucketTime = bucket.earliestTime;
                if (!bucketTime || (bucketTime.getTime() < selectionMinimum)) {
                    continue;
                }

                bucketTime = bucket.latestTime;
                if (!bucketTime || (bucketTime.getTime() > selectionMaximum)) {
                    continue;
                }

                selectedBuckets.push(this._cloneTimelineData(bucket));
            }

            return selectedBuckets;
        };

        this.updateSize = function() {
            var width = this.$element.width();
            var height = this.$element.height();
            if ((width === this.getInternal("width")) && (height === this.getInternal("height"))) {
                return;
            }

            // HACK: The host architecture has no facilities in place for managing logic
            // that may be dependent on component visibility. Therefore, we must manually
            // verify that $element and its parent DOM tree are visible and able to return
            // valid dimensions before continuing with the resize operation.
            // This check should be removed if and when the host architecture supports the
            // required visibility hooks.
            // Addresses SPL-65769, SPL-76312, and SPL-76487.
            if (!this.$element.is(":visible")) {
                return;
            }

            this.set("width", width);
            this.set("height", height);
        };

        this.dispose = function() {
            this._gridLines.dispose();
            this._histogram.dispose();
            this._axisLabelsX.dispose();
            this._axisLabelsY1.dispose();
            this._axisLabelsY2.dispose();
            this._cursorMarker.dispose();
            this._rangeMarker.dispose();
            this._tooltip.dispose();

            base.dispose.call(this);
        };

        // Protected Methods

        this.renderGraphicsOverride = function(graphics, width, height) {
            var minimalMode = this.getInternal("minimalMode");
            var minimalLineWidth = Math.round(width);

            var tl = this.localToGlobal(new Point(0, 0));
            var br = this.localToGlobal(new Point(width, height));

            this._axisLabelsX.setStyle({ visibility: (minimalMode ? "hidden" : "") });
            this._axisLabelsX.set("width", width);
            this._axisLabelsX.renderGraphics();
            height = minimalMode ? Math.max(height - 20, 0) : Math.max(height - this._axisLabelsX.get("height"), 0);

            this._axisLabelsY1.setStyle({ visibility: (minimalMode ? "hidden" : "") });
            this._axisLabelsY1.set("height", height);
            this._axisLabelsY1.renderGraphics();
            var x1 = minimalMode ? 20 : this._axisLabelsY1.get("width");

            this._axisLabelsY2.setStyle({ visibility: (minimalMode ? "hidden" : "") });
            this._axisLabelsY2.set("height", height);
            this._axisLabelsY2.renderGraphics();
            var x2 = minimalMode ? Math.max(x1, width - 20) : Math.max(x1, width - this._axisLabelsY2.get("width"));

            width = x2 - x1;

            this._axisLabelsX.set("x", x1);
            this._axisLabelsX.set("y", height);
            this._axisLabelsX.set("width", width);
            this._axisLabelsX.renderGraphics();

            this._axisLabelsY2.set("x", x2);

            this._histogram.set("x", x1);
            this._histogram.set("width", width);
            this._histogram.set("height", height);
            this._histogram.renderGraphics();

            this._gridLines.setStyle({ visibility: (minimalMode ? "hidden" : "") });
            this._gridLines.set("x", x1);
            this._gridLines.set("width", width);
            this._gridLines.set("height", height);
            this._gridLines.renderGraphics();

            this._cursorMarker.set("x", x1);
            this._cursorMarker.set("width", width);
            this._cursorMarker.set("height", height);
            this._cursorMarker.renderGraphics();

            this._rangeMarker.set("x", x1);
            this._rangeMarker.set("width", width);
            this._rangeMarker.set("height", height);
            this._rangeMarker.renderGraphics();

            this._tooltip.set("viewBounds", new Rectangle(tl.x, tl.y, br.x - tl.x, br.y - tl.y));

            graphics.clear();
            if (minimalMode) {
                x1 = Math.round(x1);
                x2 = Math.round(x2);
                height = Math.round(height);

                var lineBrush = this._lineBrush;
                var numLines = Math.round(height / 7);
                var y;

                lineBrush.set("color", Color.fromNumber(this._foregroundColor));
                lineBrush.beginBrush(graphics);

                // vertical lines
                lineBrush.moveTo(x1, 0);
                lineBrush.lineTo(x1, height);
                lineBrush.moveTo(x2, 0);
                lineBrush.lineTo(x2, height);

                // horizontal lines
                for (var i = 0; i <= numLines; i++) {
                    y = Math.round(height * (i / numLines));
                    lineBrush.moveTo(x1, y);
                    lineBrush.lineTo(x2, y);
                }

                lineBrush.endBrush();
            }

            this._updateTooltip();
        };

        this.onAppend = function() {
            this._updateSizeInterval = setInterval(this.updateSize, 50);

            this.updateSize();
        };

        this.onRemove = function() {
            clearInterval(this._updateSizeInterval);
        };

        // Private Methods

        this._update = function() {
            if (this._dataLoading) {
                return;
            }

            this._updatingCount = this._updateCount;
            this._loadJobID = this._jobID;
            if (!this._loadJobID) {
                this._updateComplete(null);
                return;
            }

            this._dataLoading = true;
            $.ajax({
                type: "GET",
                url: this._hostPath + this._basePath + "/search/jobs/" + this._loadJobID + "/timeline?offset=0&count=" + this._bucketCount,
                dataType: "xml",
                success: this._data_success,
                error: this._data_error
            });
        };

        this._updateComplete = function(data) {
            this._updateTimelineData(data);

            this._dataLoading = false;

            this._updatedCount = this._updatingCount;

            this.invalidate("dispatchUpdatedPass");

            if (this._updatingCount < this._updateCount) {
                this._update();
            }
        };

        this._updateTimelineData = function(timelineData) {
            this._timelineData = timelineData;

            var jobIDChanged = (this._loadJobID != this._prevJobID);
            this._prevJobID = this._loadJobID;

            if (jobIDChanged) {
                this._rangeMarker.set("minimum", NaN);
                this._rangeMarker.set("maximum", NaN);
            }

            this._rangeMarker.invalidate("updateRangePass");

            this._cursorMarker.set("value", (timelineData && (timelineData.buckets.length > 0) && timelineData.cursorTime) ? timelineData.cursorTime.getTime() : NaN);
            this._cursorMarker.invalidate("renderGraphicsPass");

            var buckets = timelineData ? timelineData.buckets.concat() : null;
            if (buckets) {
                var bucket;
                for (var i = 0, l = buckets.length; i < l; i++) {
                    bucket = buckets[i];
                    buckets[i] = { x1: bucket.earliestTime, x2: bucket.latestTime, y: bucket.eventCount };
                }
            }
            this._histogram.set("data", buckets);

            this.invalidate("renderGraphicsPass");
            this.validate("renderGraphicsPass");

            this._updateViewRange();
            this._updateSelectionRange();
        };

        this._updateViewRange = function() {
            if ((!this._timelineData || (this._timelineData.buckets.length == 0)) && !isNaN(this._viewMinimum)) {
                return;
            }

            var minimum = this._histogram.get("containedMinimumX");
            var maximum = this._histogram.get("containedMaximumX");

            if ((minimum == this._viewMinimum) && (maximum == this._viewMaximum)) {
                return;
            }

            this._viewMinimum = minimum;
            this._viewMaximum = maximum;

            this.fire("viewChanged", new GenericEventData({ viewMinimum: this._viewMinimum, viewMaximum: this._viewMaximum }));

            this._tweenMinimumX.fromTo(this._histogram.get("actualMinimumX"), this._histogram.get("containedMinimumX"));
            this._tweenMaximumX.fromTo(this._histogram.get("actualMaximumX"), this._histogram.get("containedMaximumX"));

            this._updateSelectionRange();
        };

        this._updateCountRange = function() {
            if (!this._timelineData || (this._timelineData.eventCount == 0)) {
                return;
            }

            this._tweenMinimumY.fromTo(this._histogram.get("actualMinimumY"), this._histogram.get("containedMinimumY"));
            this._tweenMaximumY.fromTo(this._histogram.get("actualMaximumY"), this._histogram.get("containedMaximumY"));
        };

        this._updateSelectionRange = function(dispatchEvent) {
            if (this._rangeMarker.isDragging()) {
                return;
            }

            if (dispatchEvent === undefined) {
                dispatchEvent = true;
            }

            var minimum = this._rangeMarker.get("minimum");
            var maximum = this._rangeMarker.get("maximum");
            var actualMinimum = isNaN(minimum) ? this._viewMinimum : this._rangeMarker.get("actualMinimum");
            var actualMaximum = isNaN(maximum) ? this._viewMaximum : this._rangeMarker.get("actualMaximum");

            var minimumChanged = isNaN(minimum) ? !isNaN(this._selectionMinimum) : (isNaN(this._selectionMinimum) || (actualMinimum != this._actualSelectionMinimum));
            var maximumChanged = isNaN(maximum) ? !isNaN(this._selectionMaximum) : (isNaN(this._selectionMaximum) || (actualMaximum != this._actualSelectionMaximum));

            this._selectionMinimum = minimum;
            this._selectionMaximum = maximum;
            this._actualSelectionMinimum = actualMinimum;
            this._actualSelectionMaximum = actualMaximum;

            if (dispatchEvent && (minimumChanged || maximumChanged)) {
                minimum = isNaN(minimum) ? NaN : actualMinimum;
                maximum = isNaN(maximum) ? NaN : actualMaximum;
                this.fire("selectionChanged", new GenericEventData({ selectionMinimum: minimum, selectionMaximum: maximum }));
            }
        };

        this._updateTooltip = function(mouseGlobal) {
            if (mouseGlobal == null) {
                mouseGlobal = this._prevMouseGlobal ? this._prevMouseGlobal : new Point();
            } else {
                this._prevMouseGlobal = mouseGlobal;
            }

            var mouseLocal = this._histogram.globalToLocal(mouseGlobal);
            var bucketData = this._rangeMarker.isDragging() ? null : this._histogram.getDataUnderPoint(mouseLocal.x, mouseLocal.y);
            if (bucketData && bucketData.bounds) {
                var bounds = bucketData.bounds;
                var boundsTL = this._histogram.localToGlobal(new Point(bounds.x, bounds.y));
                var boundsBR = this._histogram.localToGlobal(new Point(bounds.x + bounds.width, bounds.y + bounds.height));

                this._tooltip.set("targetBounds", new Rectangle(boundsTL.x, boundsTL.y, boundsBR.x - boundsTL.x, boundsBR.y - boundsTL.y));

                if (this._tooltipData && (this._tooltipData.data === bucketData.data)) {
                    return;
                }

                this._tooltipData = bucketData;

                this._tooltip.set("value", this._tipFormat(bucketData.data));
                this._tooltip.show();

                if (this._enableChartClick) {
                    this.$element.css({ cursor: "pointer" });
                }
            } else {
                if (!this._tooltipData) {
                    return;
                }

                this._tooltipData = null;

                this._tooltip.set("value", null);
                this._tooltip.hide();

                this.$element.css({ cursor: "auto" });
            }
        };

        this._parseTimelineData = function(node) {
            if (!node) {
                return null;
            }

            var attributes = node.attributes;
            var attribute;
            var childNodes = node.childNodes;
            var childNode;
            var i;
            var l;

            var earliestTime = null;
            var latestTime = null;
            var cursorTime = null;
            var duration = NaN;
            var earliestOffset = NaN;
            var latestOffset = NaN;
            var eventCount = 0;
            var eventAvailableCount = 0;
            var isComplete = false;
            var isTimeCursored = true;
            var buckets = [];

            for (i = 0, l = attributes.length; i < l; i++) {
                attribute = attributes[i];
                if (attribute.nodeType == 2) {
                    switch (attribute.nodeName.toLowerCase()) {
                        case "t":
                            earliestTime = new DateTime(Number(attribute.nodeValue));
                            break;
                        case "cursor":
                            cursorTime = new DateTime(Number(attribute.nodeValue));
                            break;
                        case "d":
                            duration = Number(attribute.nodeValue);
                            break;
                        case "etz":
                            earliestOffset = Number(attribute.nodeValue);
                            break;
                        case "ltz":
                            latestOffset = Number(attribute.nodeValue);
                            break;
                        case "c":
                            eventCount = Number(attribute.nodeValue);
                            break;
                        case "a":
                            eventAvailableCount = Number(attribute.nodeValue);
                            break;
                        case "f":
                            isComplete = (attribute.nodeValue == "1");
                            break;
                        case "is_time_cursored":
                            isTimeCursored = (attribute.nodeValue != "0");
                            break;
                    }
                }
            }

            var bucketEventCount = 0;
            var bucket;
            for (i = 0, l = childNodes.length; i < l; i++) {
                childNode = childNodes[i];
                if (childNode.nodeType == 1) {
                    switch (childNode.nodeName.toLowerCase()) {
                        case "bucket":
                            bucket = this._parseTimelineData(childNode);
                            bucketEventCount += bucket.eventCount;
                            buckets.push(bucket);
                            break;
                    }
                }
            }
            eventCount = Math.max(eventCount, bucketEventCount);

            if (isNaN(duration)) {
                duration = 0;
            }
            if (isNaN(earliestOffset)) {
                earliestOffset = 0;
            }
            if (isNaN(latestOffset)) {
                latestOffset = 0;
            }

            if (earliestTime) {
                latestTime = new DateTime(earliestTime.getTime() + duration);
            }

            if (buckets.length > 0) {
                var earliestBucketTime = buckets[0].earliestTime;
                if (earliestBucketTime && (!earliestTime || (earliestBucketTime.getTime() < earliestTime.getTime()))) {
                    earliestTime = earliestBucketTime.clone();
                }

                var latestBucketTime = buckets[buckets.length - 1].latestTime;
                if (latestBucketTime && (!latestTime || (latestBucketTime.getTime() > latestTime.getTime()))) {
                    latestTime = latestBucketTime.clone();
                }

                if (earliestTime && latestTime) {
                    duration = latestTime.getTime() - earliestTime.getTime();
                }
            }

            if (earliestTime) {
                earliestTime = earliestTime.toTimeZone(new SimpleTimeZone(earliestOffset));
            }
            if (latestTime) {
                latestTime = latestTime.toTimeZone(new SimpleTimeZone(latestOffset));
            }
            if (cursorTime) {
                cursorTime = cursorTime.toTimeZone(new SimpleTimeZone(earliestOffset));
            }

            var data = {};
            data.earliestTime = earliestTime;
            data.latestTime = latestTime;
            data.cursorTime = isTimeCursored ? cursorTime : null;
            data.duration = duration;
            data.eventCount = eventCount;
            data.eventAvailableCount = eventAvailableCount;
            data.isComplete = isComplete;
            data.buckets = buckets;
            return data;
        };

        this._cloneTimelineData = function(timelineData) {
            if (!timelineData) {
                return null;
            }

            var clonedData = {};
            clonedData.earliestTime = timelineData.earliestTime ? timelineData.earliestTime.getTime() : null;
            clonedData.earliestOffset = timelineData.earliestTime ? timelineData.earliestTime.getTimeZoneOffset() : 0;
            clonedData.latestTime = timelineData.latestTime ? timelineData.latestTime.getTime() : null;
            clonedData.latestOffset = timelineData.latestTime ? timelineData.latestTime.getTimeZoneOffset() : 0;
            clonedData.cursorTime = timelineData.cursorTime ? timelineData.cursorTime.getTime() : null;
            clonedData.duration = timelineData.duration;
            clonedData.eventCount = timelineData.eventCount;
            clonedData.eventAvailableCount = timelineData.eventAvailableCount;
            clonedData.isComplete = timelineData.isComplete;

            var buckets = timelineData.buckets;
            var numBuckets = buckets.length;
            var parsedBuckets = clonedData.buckets = [];
            for (var i = 0; i < numBuckets; i++) {
                parsedBuckets.push(this._cloneTimelineData(buckets[i]));
            }

            return clonedData;
        };

        this._cursorValueSnap = function(value) {
            return this._ceilToBucket(value);
        };

        this._minimumSnap = function(value, floor) {
            return floor ? this._floorToBucket(value) : this._roundToBucket(value);
        };

        this._maximumSnap = function(value, ceil) {
            return ceil ? this._ceilToBucket(value) : this._roundToBucket(value);
        };

        this._floorToBucket = function(value) {
            var buckets = this._histogram.get("data");
            if (buckets) {
                var bucket;
                var bucketTime = null;
                for (var i = buckets.length - 1; i >= 0; i--) {
                    bucket = buckets[i];
                    bucketTime = bucket.x1;
                    if (bucketTime && (bucketTime.getTime() <= value)) {
                        break;
                    }
                }
                if (bucketTime && !isNaN(bucketTime.getTime())) {
                    value = bucketTime.getTime();
                }
            }
            return value;
        };

        this._ceilToBucket = function(value) {
            var buckets = this._histogram.get("data");
            if (buckets) {
                var bucket;
                var bucketTime = null;
                for (var i = 0, l = buckets.length; i < l; i++) {
                    bucket = buckets[i];
                    bucketTime = bucket.x2;
                    if (bucketTime && (bucketTime.getTime() >= value)) {
                        break;
                    }
                }
                if (bucketTime && !isNaN(bucketTime.getTime())) {
                    value = bucketTime.getTime();
                }
            }
            return value;
        };

        this._roundToBucket = function(value) {
            var buckets = this._histogram.get("data");
            if (buckets) {
                var bestTime = value;
                var bestDiff = Infinity;
                var bucket;
                var bucketTime = null;
                var diff;
                for (var i = 0, l = buckets.length; i < l; i++) {
                    bucket = buckets[i];
                    bucketTime = bucket.x1 ? bucket.x1.getTime() : NaN;
                    if (!isNaN(bucketTime)) {
                        diff = Math.abs(bucketTime - value);
                        if (diff < bestDiff) {
                            bestTime = bucketTime;
                            bestDiff = diff;
                        }
                    }
                    bucketTime = bucket.x2 ? bucket.x2.getTime() : NaN;
                    if (!isNaN(bucketTime)) {
                        diff = Math.abs(bucketTime - value);
                        if (diff < bestDiff) {
                            bestTime = bucketTime;
                            bestDiff = diff;
                        }
                    }
                }
                value = bestTime;
            }
            return value;
        };

        this._timeAxisFormat = function(date) {
            if (!date) {
                return "";
            }

            var dateString = "";

            var majorUnit = this._axisLabelsX.get("actualUnit");

            var resYears = 0;
            var resMonths = 1;
            var resDays = 2;
            var resHours = 3;
            var resMinutes = 4;
            var resSeconds = 5;
            var resSubSeconds = 6;

            var resMin;
            var resMax;

            var prevDate = this._prevDate;

            if (!prevDate || (prevDate.getTime() > date.getTime()) || (prevDate.getYear() != date.getYear())) {
                resMin = resYears;
            } else if (prevDate.getMonth() != date.getMonth()) {
                resMin = resMonths;
            } else if (prevDate.getDay() != date.getDay()) {
                resMin = resDays;
            } else {
                resMin = resHours;
            }

            this._prevDate = date.clone();

            if ((majorUnit.seconds % 1) > 0) {
                resMax = resSubSeconds;
            } else if ((majorUnit.seconds > 0) || ((majorUnit.minutes % 1) > 0)) {
                resMax = resSeconds;
            } else if ((majorUnit.minutes > 0) || ((majorUnit.hours % 1) > 0)) {
                resMax = resMinutes;
            } else if ((majorUnit.hours > 0) || ((majorUnit.days % 1) > 0)) {
                resMax = resHours;
            } else if ((majorUnit.days > 0) || ((majorUnit.months % 1) > 0)) {
                resMax = resDays;
            } else if ((majorUnit.months > 0) || ((majorUnit.years % 1) > 0)) {
                resMax = resMonths;
            } else {
                resMax = resYears;
            }

            if (resMin > resMax) {
                resMin = resMax;
            }

            if (resMax == resSubSeconds) {
                dateString += this._formatTime(date, "full");
            } else if (resMax == resSeconds) {
                dateString += this._formatTime(date, "medium");
            } else if (resMax >= resHours) {
                dateString += this._formatTime(date, "short");
            }

            if ((resMax >= resDays) && (resMin <= resDays)) {
                dateString += (dateString ? "\n" : "") + this._formatDate(date, "EEE MMM d");
            } else if ((resMax >= resMonths) && (resMin <= resMonths)) {
                dateString += (dateString ? "\n" : "") + this._formatDate(date, "MMMM");
            }

            if ((resMax >= resYears) && (resMin <= resYears)) {
                dateString += (dateString ? "\n" : "") + this._formatDate(date, "yyyy");
            }

            return dateString;
        };

        this._numericAxisFormat = function(num) {
            return this._formatNumber(num);
        };

        this._cursorValueFormat = function(value) {
            return this._minMaxFormat(value);
        };

        this._minimumFormat = function(value) {
            return this._minMaxFormat(this._minimumSnap(value));
        };

        this._maximumFormat = function(value) {
            return this._minMaxFormat(this._maximumSnap(value));
        };

        this._minMaxFormat = function(value) {
            var dateTime = new DateTime(value);
            dateTime = dateTime.toTimeZone(this._timeZone);

            var dateFormat = "medium";
            var timeFormat;
            if ((dateTime.getSeconds() % 1) >= 0.001) {
                timeFormat = "full";
            } else if (dateTime.getSeconds() > 0) {
                timeFormat = "medium";
            } else if (dateTime.getMinutes() > 0) {
                timeFormat = "short";
            } else if (dateTime.getHours() > 0) {
                timeFormat = "short";
            } else {
                timeFormat = "none";
            }

            if (timeFormat == "none") {
                return this._formatDate(dateTime, dateFormat);
            } else {
                return this._formatDateTime(dateTime, dateFormat, timeFormat);
            }
        };

        this._rangeFormat = function(minimum, maximum) {
            var minimumTime = new DateTime(this._minimumSnap(minimum));
            minimumTime = minimumTime.toTimeZone(this._timeZone);

            var maximumTime = new DateTime(this._maximumSnap(maximum));
            maximumTime = maximumTime.toTimeZone(this._timeZone);

            var duration = TimeUtils.subtractDates(maximumTime, minimumTime);

            var str = "";
            if (duration.years > 0) {
                str += this._formatNumericString("%s year ", "%s years ", duration.years);
            }
            if (duration.months > 0) {
                str += this._formatNumericString("%s month ", "%s months ", duration.months);
            }
            if (duration.days > 0) {
                str += this._formatNumericString("%s day ", "%s days ", duration.days);
            }
            if (duration.hours > 0) {
                str += this._formatNumericString("%s hour ", "%s hours ", duration.hours);
            }
            if (duration.minutes > 0) {
                str += this._formatNumericString("%s minute ", "%s minutes ", duration.minutes);
            }
            if (duration.seconds > 0) {
                str += this._formatNumericString("%s second ", "%s seconds ", Math.floor(duration.seconds * 1000) / 1000);
            }

            return str;
        };

        this._tipFormat = function(data) {
            if (!data) {
                return "";
            }
            return this._formatTooltip(data.x1, data.x2, data.y);
        };

        this._formatNumber = function(num) {
            num = NumberUtil.toPrecision(num, 12);

            var format = this.externalInterface.formatNumber;
            if (typeof format === "function") {
                return format(num);
            }

            return String(num);
        };

        this._formatNumericString = function(strSingular, strPlural, num) {
            num = NumberUtil.toPrecision(num, 12);

            var format = this.externalInterface.formatNumericString;
            if (typeof format === "function") {
                return format(strSingular, strPlural, num);
            }

            var str = (Math.abs(num) == 1) ? strSingular : strPlural;
            str = str.split("%s").join(String(num));
            return str;
        };

        this._formatDate = function(dateTime, dateFormat) {
            if (dateFormat === undefined) {
                dateFormat = "full";
            }

            var format = this.externalInterface.formatDate;
            if (typeof format === "function") {
                return format(dateTime.getTime(), dateTime.getTimeZoneOffset(), dateFormat);
            }

            return this._pad(dateTime.getYear(), 4) + "-" + this._pad(dateTime.getMonth(), 2) + "-" + this._pad(dateTime.getDay(), 2);
        };

        this._formatTime = function(dateTime, timeFormat) {
            if (timeFormat === undefined) {
                timeFormat = "full";
            }

            var format = this.externalInterface.formatTime;
            if (typeof format === "function") {
                return format(dateTime.getTime(), dateTime.getTimeZoneOffset(), timeFormat);
            }

            return this._pad(dateTime.getHours(), 2) + ":" + this._pad(dateTime.getMinutes(), 2) + ":" + this._pad(dateTime.getSeconds(), 2, 3);
        };

        this._formatDateTime = function(dateTime, dateFormat, timeFormat) {
            if (dateFormat === undefined) {
                dateFormat = "full";
            }
            if (timeFormat === undefined) {
                timeFormat = "full";
            }

            var format = this.externalInterface.formatDateTime;
            if (typeof format === "function") {
                return format(dateTime.getTime(), dateTime.getTimeZoneOffset(), dateFormat, timeFormat);
            }

            return this._pad(dateTime.getYear(), 4) + "-" + this._pad(dateTime.getMonth(), 2) + "-" + this._pad(dateTime.getDay(), 2) + " " + this._pad(dateTime.getHours(), 2) + ":" + this._pad(dateTime.getMinutes(), 2) + ":" + this._pad(dateTime.getSeconds(), 2, 3);
        };

        this._formatTooltip = function(earliestTime, latestTime, eventCount) {
            var format = this.externalInterface.formatTooltip;
            if (typeof format === "function") {
                return format(earliestTime.getTime(), latestTime.getTime(), earliestTime.getTimeZoneOffset(), latestTime.getTimeZoneOffset(), eventCount);
            }

            return eventCount + " events from " + earliestTime.toString() + " to " + latestTime.toString();
        };

        this._pad = function(value, digits, fractionDigits) {
            if (isNaN(value)) {
                return "NaN";
            }
            if (value === Infinity) {
                return "Infinity";
            }
            if (value === -Infinity) {
                return "-Infinity";
            }

            if (digits === undefined) {
                digits = 0;
            }
            if (fractionDigits === undefined) {
                fractionDigits = 0;
            }

            var str = value.toFixed(20);

            var decimalIndex = str.indexOf(".");
            if (decimalIndex < 0) {
                decimalIndex = str.length;
            } else if (fractionDigits < 1) {
                str = str.substring(0, decimalIndex);
            } else {
                str = str.substring(0, decimalIndex) + "." + str.substring(decimalIndex + 1, decimalIndex + fractionDigits + 1);
            }

            for (var i = decimalIndex; i < digits; i++) {
                str = "0" + str;
            }

            return str;
        };

        this._histogram_containedRangeXChanged = function(e) {
            this._updateViewRange();
        };

        this._histogram_containedRangeYChanged = function(e) {
            this._updateCountRange();
        };

        this._rangeMarker_dragComplete = function(e) {
            this._updateSelectionRange();
        };

        this._rangeMarker_labelOpacity_change = function(e) {
            this._cursorMarker.set("labelOpacity", 1 - e.newValue);
        };

        this._child_invalidated = function(e) {
            if (e.pass === this.renderGraphicsPass) {
                this.invalidate(e.pass);
            }
        };

        this._self_mouseOver = function(e) {
            this._updateTooltip(new Point(e.pageX, e.pageY));
        };

        this._self_mouseOut = function(e) {
            this._updateTooltip(new Point(e.pageX, e.pageY));
        };

        this._self_mouseMove = function(e) {
            this._updateTooltip(new Point(e.pageX, e.pageY));
        };

        this._self_doubleClick = function(e) {
            if (!this._enableChartClick) {
                return;
            }

            this._updateTooltip(new Point(e.pageX, e.pageY));

            var bucketData = this._tooltipData;
            if (!bucketData) {
                return;
            }

            var data = {};
            data.earliestTime = {};  // flash timeline sends empty objects (due to JABridge conversion of DateTime), so we will emulate
            data.latestTime = {};
            data.eventCount = bucketData.data.y;

            var fields = [ "earliestTime", "latestTime", "eventCount" ];

            this.fire("chartDoubleClicked", new GenericEventData({ data: data, fields: fields, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey }));
        };

        this._data_success = function(xml, msg, xhr) {
            this._updateComplete(this._parseTimelineData(xml ? xml.documentElement : null));
        };

        this._data_error = function(xhr, msg, error) {
            this._updateComplete(null);
        };

    });

});
