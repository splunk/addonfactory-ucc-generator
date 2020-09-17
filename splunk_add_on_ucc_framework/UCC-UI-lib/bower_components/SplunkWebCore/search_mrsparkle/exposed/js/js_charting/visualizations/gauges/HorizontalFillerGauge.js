define([
            'jquery',
            './FillerGauge',
            '../../util/lang_utils',
            '../../util/math_utils'
        ],
        function(
            $,
            FillerGauge,
            langUtils,
            mathUtils
        ) {

    var HorizontalFillerGauge = function(container, properties) {
        FillerGauge.call(this, container, properties);
        this.horizontalPadding = 20;
        this.tickOffset = 5;
        this.tickLength = 15;
        this.tickWidth = 1;
        this.tickLabelOffset = 5;
        this.minorTickLength = Math.floor(this.tickLength / 2);
    };
    langUtils.inherit(HorizontalFillerGauge, FillerGauge);

    $.extend(HorizontalFillerGauge.prototype, {

        renderGauge: function() {
            this.tickFontSize = mathUtils.roundWithMinMax(this.width / 50, 10, 20);  // in pixels
            this.backgroundCornerRad = mathUtils.roundWithMinMax(this.width / 120, 3, 5);
            this.valueFontSize = mathUtils.roundWithMinMax(this.width / 40, 15, 25);  // in pixels
            this.backgroundHeight = this.valueFontSize * 3;
            this.valueBottomPadding = mathUtils.roundWithMinMax(this.width / 100, 5, 10);
            FillerGauge.prototype.renderGauge.call(this);
        },

        drawBackground: function() {
            var tickValues = this.calculateTickValues(this.ranges[0], this.ranges[this.ranges.length - 1], this.MAX_TICKS_PER_RANGE),
                maxTickValue = tickValues[tickValues.length - 1],
                maxTickWidth = this.predictTextWidth(this.formatValue(maxTickValue), this.tickFontSize);

            this.horizontalPadding = Math.max(this.horizontalPadding, maxTickWidth);
            this.backgroundWidth = this.width - (2 * this.horizontalPadding);

            if(this.isShiny) {
                this.elements.background = this.renderer.rect(this.horizontalPadding,
                    (this.height - this.backgroundHeight) / 2, this.backgroundWidth, this.backgroundHeight,
                    this.backgroundCornerRad)
                    .attr({
                        fill: '#edede7',
                        stroke: 'silver',
                        'stroke-width': 1
                    })
                    .add();
            }

            // no actual dependency here, but want to be consistent with sibling class
            this.tickStartY = (this.height + this.backgroundHeight) / 2 + this.tickOffset;
            this.tickEndY = this.tickStartY + this.tickLength;
            this.tickLabelStartY = this.tickEndY + this.tickLabelOffset;
        },

        drawMajorTick: function(offset) {
            var tickOffset = this.horizontalPadding + offset;

            return this.renderer.path([
                'M', tickOffset, this.tickStartY,
                'L', tickOffset, this.tickEndY
            ])
                .attr({
                    stroke: this.tickColor,
                    'stroke-width': this.tickWidth
                })
                .add();
        },

        drawMajorTickLabel: function(offset, text) {
            var tickOffset = this.horizontalPadding + offset;

            return this.renderer.text(text,
                tickOffset, this.tickLabelStartY + this.tickFontSize
            )
                .attr({
                    align: 'center'
                })
                .css({
                    color: this.tickFontColor,
                    fontSize: this.tickFontSize + 'px',
                    lineHeight: this.tickFontSize + 'px'
                })
                .add();
        },

        drawMinorTick: function(offset) {
            var tickOffset = this.horizontalPadding + offset;

            return this.renderer.path([
                'M', tickOffset, this.tickStartY,
                'L', tickOffset, this.tickStartY + this.minorTickLength
            ])
                .attr({
                    stroke: this.tickColor,
                    'stroke-width': this.minorTickWidth
                })
                .add();
        },

        drawIndicator: function(val) {
            // TODO: implement calculation of gradient based on user-defined colors
            // for not we are using solid colors

            var //fillGradient = this.getFillGradient(val),
                fillColor = this.getFillColor(val),
                fillOffset = this.normalizedTranslateValue(val),
                fillTopX,
                fillPath;
            if(fillOffset > 0) {
                fillOffset = Math.max(fillOffset, this.backgroundCornerRad);
                fillTopX = this.horizontalPadding + fillOffset;
                if(!this.isShiny) {
                    fillPath = [
                        'M', this.horizontalPadding,
                        (this.height - this.backgroundHeight) / 2,
                        'L', fillTopX,
                        (this.height - this.backgroundHeight) / 2,
                        fillTopX,
                        (this.height + this.backgroundHeight) / 2,
                        this.horizontalPadding,
                        (this.height + this.backgroundHeight) / 2,
                        this.horizontalPadding,
                        (this.height - this.backgroundHeight) / 2
                    ];
                }
                else {
                    fillPath = [
                        'M', this.horizontalPadding + this.backgroundCornerRad,
                        (this.height - this.backgroundHeight - 2) / 2,
                        'C', this.horizontalPadding + this.backgroundCornerRad,
                        (this.height - this.backgroundHeight - 2) / 2,
                        this.horizontalPadding,
                        (this.height - this.backgroundHeight - 2) / 2,
                        this.horizontalPadding,
                        (this.height - this.backgroundHeight - 2) / 2 + this.backgroundCornerRad,
                        'L', this.horizontalPadding,
                        (this.height + this.backgroundHeight) / 2 - this.backgroundCornerRad,
                        'C', this.horizontalPadding,
                        (this.height + this.backgroundHeight) / 2 - this.backgroundCornerRad,
                        this.horizontalPadding,
                        (this.height + this.backgroundHeight) / 2,
                        this.horizontalPadding + this.backgroundCornerRad,
                        (this.height + this.backgroundHeight) / 2,
                        'L', fillTopX,
                        (this.height + this.backgroundHeight) / 2,
                        fillTopX,
                        (this.height - this.backgroundHeight - 2) / 2,
                        this.horizontalPadding + this.backgroundCornerRad,
                        (this.height - this.backgroundHeight - 2) / 2
                    ];
                }
            }
            else {
                fillPath = [];
            }

            if(this.elements.fill) {
                this.elements.fill.destroy();
            }
            this.elements.fill = this.renderer.path(fillPath)
                .attr({
                    fill: fillColor
                })
                .add();
            if(this.showValue) {
                this.drawValueDisplay(val, fillColor, fillOffset);
            }
        },

        drawValueDisplay: function(val, fillColor, fillOffset) {
            var displayVal = this.getDisplayValue(val),
                fillTopX = this.horizontalPadding + fillOffset,
                valueColor = this.getValueColor(fillColor),
                valueStartX,
                valueText = this.formatValue(displayVal),
                valueTotalWidth = this.predictTextWidth(valueText, this.valueFontSize) + this.valueBottomPadding;

            // determine if the value display can (horizontally) fit inside the fill,
            // if not orient it to the right of the fill
            if(fillOffset >= valueTotalWidth) {
                valueStartX = fillTopX - valueTotalWidth;
            }
            else {
                valueStartX = fillTopX + this.valueBottomPadding;
                valueColor = this.defaultValueColor;
            }
            if(this.elements.valueDisplay) {
                this.elements.valueDisplay.attr({
                    text: valueText,
                    x: valueStartX
                })
                    .css({
                        color: valueColor,
                        fontSize: this.valueFontSize + 'px',
                        fontWeight: 'bold'
                    }).toFront();
            }
            else {
                this.elements.valueDisplay = this.renderer.text(
                    valueText, valueStartX, (this.height / 2) + this.valueFontSize / 4
                )
                    .css({
                        color: valueColor,
                        fontSize: this.valueFontSize + 'px',
                        lineHeight: this.valueFontSize + 'px',
                        fontWeight: 'bold'
                    })
                    .attr({
                        align: 'left'
                    })
                    .add();
            }
        },

        normalizedTranslateValue: function(val) {
            if(val < this.ranges[0]) {
                return 0;
            }
            if(val > this.ranges[this.ranges.length - 1]) {
                return this.translateValue(this.ranges[this.ranges.length - 1]);
            }
            return this.translateValue(val);
        },

        translateValue: function(val) {
            var dataRange = this.ranges[this.ranges.length - 1] - this.ranges[0],
                normalizedValue = val - this.ranges[0];

            return Math.round((normalizedValue / dataRange) * this.backgroundWidth);
        }

    });

    return HorizontalFillerGauge;

});