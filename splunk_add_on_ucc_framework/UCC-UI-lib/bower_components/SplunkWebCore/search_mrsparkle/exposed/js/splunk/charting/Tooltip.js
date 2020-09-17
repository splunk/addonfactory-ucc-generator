define(function(require, exports, module) {

    var $ = require("jquery");
    var Class = require("jg/Class");
    var Point = require("jg/geom/Point");
    var Rectangle = require("jg/geom/Rectangle");
    var Color = require("jg/graphics/Color");
    var SolidFillBrush = require("jg/graphics/SolidFillBrush");
    var ObservableProperty = require("jg/properties/ObservableProperty");
    var NumberUtil = require("jg/utils/NumberUtil");
    var StringUtil = require("jg/utils/StringUtil");
    var GraphicsVizBase = require("splunk/viz/GraphicsVizBase");

    return Class(module.id, GraphicsVizBase, function(Tooltip, base) {

        // Public Properties

        this.value = new ObservableProperty("value", String, null)
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.viewBounds = new ObservableProperty("viewBounds", Rectangle, new Rectangle())
            .readFilter(function(value) {
                return value.clone();
            })
            .writeFilter(function(value) {
                if (value) {
                    value = value.clone();
                    if (value.width < 0) {
                        value.x += value.width;
                        value.width = -value.width;
                    }
                    if (value.height < 0) {
                        value.y += value.height;
                        value.height = -value.height;
                    }
                } else {
                    value = new Rectangle();
                }
                return value;
            })
            .changeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            })
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        this.targetBounds = new ObservableProperty("targetBounds", Rectangle, new Rectangle())
            .readFilter(function(value) {
                return value.clone();
            })
            .writeFilter(function(value) {
                if (value) {
                    value = value.clone();
                    if (value.width < 0) {
                        value.x += value.width;
                        value.width = -value.width;
                    }
                    if (value.height < 0) {
                        value.y += value.height;
                        value.height = -value.height;
                    }
                } else {
                    value = new Rectangle();
                }
                return value;
            })
            .changeComparator(function(oldValue, newValue) {
                return !oldValue.equals(newValue);
            })
            .onChange(function(e) {
                this.invalidate("renderGraphicsPass");
            });

        // Private Properties

        this._backgroundBrush = null;
        this._valueLabel = null;
        this._isShowing = true;

        // Constructor

        this.constructor = function() {
            base.constructor.call(this);

            this.addStyleClass("splunk-charting-Tooltip");

            this._backgroundBrush = new SolidFillBrush(Color.fromNumber(0x444444), 1);

            this._valueLabel = document.createElement("span");
            $(this._valueLabel).addClass("splunk-charting-label");
            $(this._valueLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

            this.element.appendChild(this._valueLabel);

            this.hide();
        };

        // Public Methods

        this.show = function() {
            if (this._isShowing) {
                return;
            }

            this._isShowing = true;

            this.validate("renderGraphicsPass");

            this.setStyle({ visibility: "" });
        };

        this.hide = function() {
            if (!this._isShowing) {
                return;
            }

            this._isShowing = false;

            this.setStyle({ visibility: "hidden" });
        };

        // Protected Methods

        this.renderGraphicsOverride = function(graphics, width, height) {
            var valueLabel = $(this._valueLabel);
            var value = this.getInternal("value");
            if (!value) {
                valueLabel.html("");
            } else {
                valueLabel.html(StringUtil.escapeHTML(value));
            }

            var contentWidth = valueLabel.outerWidth(true);
            var contentHeight = valueLabel.outerHeight(true);

            var pointerLength = 7;
            var pointerThickness = 14 / 2;

            var viewBounds = this.getInternal("viewBounds");
            var viewWidth = viewBounds.width;
            var viewHeight = viewBounds.height;
            var viewLeft = viewBounds.x;
            var viewRight = viewLeft + viewWidth;
            var viewTop = viewBounds.y;
            var viewBottom = viewTop + viewHeight;

            var targetBounds = this.getInternal("targetBounds");
            var targetWidth = targetBounds.width;
            var targetHeight = targetBounds.height;
            var targetLeft = targetBounds.x;
            var targetRight = targetLeft + targetWidth;
            var targetTop = targetBounds.y;
            var targetBottom = targetTop + targetHeight;

            var marginLeft = 10;
            var marginRight = 10;
            var marginTop = 10;
            var marginBottom = 10;
            var marginX = marginLeft + marginRight;
            var marginY = marginTop + marginBottom;
            var marginScaleX = (marginX > 0) ? NumberUtil.minMax((viewWidth - contentWidth) / marginX, 0, 1) : 0;
            var marginScaleY = (marginY > 0) ? NumberUtil.minMax((viewHeight - contentHeight) / marginY, 0, 1) : 0;

            var alignmentX = 0.5;
            var alignmentY = 0.5;

            // determine placement

            var placement;
            if (((targetLeft + targetRight) / 2) > ((viewLeft + viewRight) / 2)) {
                placement = "left";
            } else {
                placement = "right";
            }

            // compute targetPosition (in global coordinates) and pointerPosition (in local coordinates)

            var targetPosition;
            var pointerPosition;
            if (placement == "left") {
                marginTop *= marginScaleY;
                marginBottom *= marginScaleY;
                targetPosition = new Point(targetLeft, targetTop * (1 - alignmentY) + targetBottom * alignmentY);
                targetPosition.x = NumberUtil.minMax(targetPosition.x, viewLeft + marginLeft + contentWidth + pointerLength, targetRight);
                targetPosition.x = NumberUtil.minMax(targetPosition.x, viewLeft + contentWidth + pointerLength, viewRight);
                targetPosition.y = NumberUtil.maxMin(targetPosition.y, viewBottom, viewTop);
                pointerPosition = new Point(contentWidth + pointerLength, contentHeight * alignmentY);
                pointerPosition.y = NumberUtil.minMax(pointerPosition.y, contentHeight - Math.max(viewBottom - marginBottom - targetPosition.y, 0), Math.max(targetPosition.y - viewTop - marginTop, 0));
            } else {
                marginTop *= marginScaleY;
                marginBottom *= marginScaleY;
                targetPosition = new Point(targetRight, targetTop * (1 - alignmentY) + targetBottom * alignmentY);
                targetPosition.x = NumberUtil.maxMin(targetPosition.x, viewRight - marginRight - contentWidth - pointerLength, targetLeft);
                targetPosition.x = NumberUtil.maxMin(targetPosition.x, viewRight - contentWidth - pointerLength, viewLeft);
                targetPosition.y = NumberUtil.maxMin(targetPosition.y, viewBottom, viewTop);
                pointerPosition = new Point(0, contentHeight * alignmentY);
                pointerPosition.y = NumberUtil.minMax(pointerPosition.y, contentHeight - Math.max(viewBottom - marginBottom - targetPosition.y, 0), Math.max(targetPosition.y - viewTop - marginTop, 0));
            }

            // snap positions to pixels

            targetPosition.x = Math.round(targetPosition.x);
            targetPosition.y = Math.round(targetPosition.y);
            pointerPosition.x = Math.round(pointerPosition.x);
            pointerPosition.y = Math.round(pointerPosition.y);

            // convert targetPosition to local coordinates and offset this position

            targetPosition = this.globalToLocal(targetPosition);
            this.set("x", this.get("x") + (targetPosition.x - pointerPosition.x));
            this.set("y", this.get("y") + (targetPosition.y - pointerPosition.y));

            // render

            graphics.clear();
            graphics.setSize(contentWidth + pointerLength, contentHeight);

            var backgroundBrush = this._backgroundBrush;
            var p1;
            var p2;
            var p3;
            var p4;

            if (placement == "left") {
                p1 = new Point(0, 0);
                p2 = new Point(contentWidth, 0);
                p3 = new Point(contentWidth, contentHeight);
                p4 = new Point(0, contentHeight);

                backgroundBrush.beginBrush(graphics, new Rectangle(0, 0, contentWidth, contentHeight));
                backgroundBrush.moveTo(p1.x, p1.y);
                backgroundBrush.lineTo(p2.x, p2.y);
                backgroundBrush.lineTo(p2.x, NumberUtil.maxMin(pointerPosition.y - pointerThickness, p3.y - pointerThickness, p2.y));
                backgroundBrush.lineTo(pointerPosition.x, pointerPosition.y);
                backgroundBrush.lineTo(p2.x, NumberUtil.minMax(pointerPosition.y + pointerThickness, p2.y + pointerThickness, p3.y));
                backgroundBrush.lineTo(p3.x, p3.y);
                backgroundBrush.lineTo(p4.x, p4.y);
                backgroundBrush.lineTo(p1.x, p1.y);
                backgroundBrush.endBrush();
            } else {
                p1 = new Point(pointerLength, 0);
                p2 = new Point(pointerLength + contentWidth, 0);
                p3 = new Point(pointerLength + contentWidth, contentHeight);
                p4 = new Point(pointerLength, contentHeight);

                backgroundBrush.beginBrush(graphics, new Rectangle(pointerLength, 0, contentWidth, contentHeight));
                backgroundBrush.moveTo(p1.x, p1.y);
                backgroundBrush.lineTo(p2.x, p2.y);
                backgroundBrush.lineTo(p3.x, p3.y);
                backgroundBrush.lineTo(p4.x, p4.y);
                backgroundBrush.lineTo(p4.x, NumberUtil.minMax(pointerPosition.y + pointerThickness, p1.y + pointerThickness, p4.y));
                backgroundBrush.lineTo(pointerPosition.x, pointerPosition.y);
                backgroundBrush.lineTo(p4.x, NumberUtil.maxMin(pointerPosition.y - pointerThickness, p4.y - pointerThickness, p1.y));
                backgroundBrush.lineTo(p1.x, p1.y);
                backgroundBrush.endBrush();
            }

            // set valueLabel position

            valueLabel.css({ left: p1.x + "px" });
        };

    });

});
