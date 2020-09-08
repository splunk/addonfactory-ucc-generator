define([
            'jquery',
            './MarkerGauge',
            '../../util/lang_utils',
            '../../util/math_utils'
        ],
        function(
            $,
            MarkerGauge,
            langUtils,
            mathUtils
        ) {

    var VerticalMarkerGauge = function(container, properties) {
        MarkerGauge.call(this, container, properties);
        this.verticalPadding = 10;
    };
    langUtils.inherit(VerticalMarkerGauge, MarkerGauge);

    $.extend(VerticalMarkerGauge.prototype, {

        renderGauge: function() {
            this.markerWindowHeight = mathUtils.roundWithMin(this.height / 7, 20);
            this.markerSideWidth = this.markerWindowHeight / 2;
            this.markerSideCornerRad = this.markerSideWidth / 3;
            this.bandOffsetBottom = 5 + this.markerWindowHeight / 2;
            this.bandOffsetTop = 5 + this.markerWindowHeight / 2;
            this.tickOffset = mathUtils.roundWithMin(this.height / 100, 3);
            this.tickLength = mathUtils.roundWithMin(this.height / 20, 4);
            this.tickLabelOffset = mathUtils.roundWithMin(this.height / 60, 3);
            this.tickFontSize = mathUtils.roundWithMin(this.height / 20, 10);  // in pixels
            this.minorTickLength = this.tickLength / 2;
            this.backgroundCornerRad = mathUtils.roundWithMin(this.height / 60, 3);
            this.valueFontSize = mathUtils.roundWithMin(this.height / 15, 15);  // in pixels

            this.bandOffsetX = (!this.isShiny) ? 0 : mathUtils.roundWithMin(this.height / 60, 3);
            MarkerGauge.prototype.renderGauge.call(this);
        },

        drawBackground: function() {
            this.backgroundWidth = mathUtils.roundWithMin(this.height / 4, 50);
            var tickValues = this.calculateTickValues(this.ranges[0], this.ranges[this.ranges.length - 1], this.MAX_TICKS_PER_RANGE);
            this.backgroundHeight = this.height - (2 * this.verticalPadding);
            this.bandHeight = this.backgroundHeight - (this.bandOffsetBottom + this.bandOffsetTop);
            this.bandWidth = (!this.isShiny) ? 30 : 10;

            var maxLabelWidth, totalWidthNeeded,
                maxTickValue = tickValues[tickValues.length - 1];

            maxLabelWidth = this.predictTextWidth(this.formatValue(maxTickValue), this.tickFontSize);
            totalWidthNeeded = this.bandOffsetX + this.bandWidth + this.tickOffset + this.tickLength + this.tickLabelOffset
                + maxLabelWidth + this.tickLabelPaddingRight;

            this.backgroundWidth = Math.max(this.backgroundWidth, totalWidthNeeded);

            if(this.isShiny) {
                this.elements.background = this.renderer.rect((this.width - this.backgroundWidth) / 2,
                    this.verticalPadding, this.backgroundWidth, this.backgroundHeight,
                    this.backgroundCornerRad)
                    .attr({
                        fill: '#edede7',
                        stroke: 'silver',
                        'stroke-width': 1
                    })
                    .add();
            }

            // these values depend on the adjusted background width
            this.tickStartX = (this.width - this.backgroundWidth) / 2 + (this.bandOffsetX + this.bandWidth)
                + this.tickOffset;
            this.tickEndX = this.tickStartX + this.tickLength;
            this.tickLabelStartX = this.tickEndX + this.tickLabelOffset;
        },

        drawBand: function() {
            var i, startHeight, endHeight,
                bandLeftX = ((this.width - this.backgroundWidth) / 2) + this.bandOffsetX,
                bandBottomY = this.height - this.verticalPadding - this.bandOffsetBottom;

            for(i = 0; i < this.ranges.length - 1; i++) {
                startHeight = this.translateValue(this.ranges[i]);
                endHeight = this.translateValue(this.ranges[i + 1]);
                this.elements['colorBand' + i] = this.renderer.rect(
                    bandLeftX, bandBottomY - endHeight,
                    this.bandWidth, endHeight - startHeight, this.bandCornerRad
                )
                    .attr({
                        fill: this.getColorByIndex(i)
                    })
                    .add();
            }
        },

        drawMajorTick: function(height) {
            var tickHeight = this.verticalPadding + this.backgroundHeight - (this.bandOffsetBottom + height);

            return this.renderer.path([
                'M', this.tickStartX, tickHeight,
                'L', this.tickEndX, tickHeight
            ])
                .attr({
                    stroke: this.tickColor,
                    'stroke-width': this.tickWidth
                })
                .add();
        },

        drawMajorTickLabel: function(height, text) {
            var tickHeight = this.verticalPadding + this.backgroundHeight - (this.bandOffsetBottom + height);

            return this.renderer.text(text,
                this.tickLabelStartX, tickHeight + (this.tickFontSize / 4)
            )
                .attr({
                    align: 'left'
                })
                .css({
                    color: this.tickFontColor,
                    fontSize: this.tickFontSize + 'px',
                    lineHeight: this.tickFontSize + 'px'
                })
                .add();
        },

        drawMinorTick: function(height) {
            var tickHeight = this.verticalPadding + this.backgroundHeight - (this.bandOffsetBottom + height);

            return this.renderer.path([
                'M', this.tickStartX, tickHeight,
                'L', this.tickStartX + this.minorTickLength, tickHeight
            ])
                .attr({
                    stroke: this.tickColor,
                    'stroke-width': this.minorTickWidth
                })
                .add();
        },

        drawIndicator: function(val) {
            var markerLHSPath, markerRHSPath, markerBorderPath, markerUnderlinePath,
                markerHeight = this.normalizedTranslateValue(val),
                markerStartY = this.verticalPadding + this.backgroundHeight
                    - (this.bandOffsetBottom + markerHeight),
                markerStartX = (!this.isShiny) ? (this.width - this.backgroundWidth) / 2 - 10 : (this.width - this.backgroundWidth) / 2,
                markerEndX = (!this.isShiny) ? markerStartX + this.bandWidth + 20 : markerStartX + this.backgroundWidth,
                markerLineStroke = this.foregroundColor, // will be changed to red for shiny
                markerLineWidth = 3, // wil be changed to 1 for shiny
                markerLinePath = [
                    'M', markerStartX, markerStartY,
                    'L', markerEndX, markerStartY
                ];
            if(this.isShiny) {
                markerLHSPath = [
                    'M', markerStartX,
                    markerStartY - this.markerWindowHeight / 2,
                    'L', markerStartX - (this.markerSideWidth - this.markerSideCornerRad),
                    markerStartY - this.markerWindowHeight / 2,
                    'C', markerStartX - (this.markerSideWidth - this.markerSideCornerRad),
                    markerStartY - this.markerWindowHeight / 2,
                    markerStartX - this.markerSideWidth,
                    markerStartY - this.markerWindowHeight / 2,
                    markerStartX - this.markerSideWidth,
                    markerStartY - (this.markerWindowHeight / 2) + this.markerSideCornerRad,
                    'L', markerStartX - this.markerSideWidth,
                    markerStartY + (this.markerWindowHeight / 2) - this.markerSideCornerRad,
                    'C', markerStartX - this.markerSideWidth,
                    markerStartY + (this.markerWindowHeight / 2) - this.markerSideCornerRad,
                    markerStartX - this.markerSideWidth,
                    markerStartY + (this.markerWindowHeight / 2),
                    markerStartX - (this.markerSideWidth - this.markerSideCornerRad),
                    markerStartY + (this.markerWindowHeight / 2),
                    'L', markerStartX,
                    markerStartY + this.markerWindowHeight / 2,
                    markerStartX,
                    markerStartY - this.markerWindowHeight / 2
                ];
                markerRHSPath = [
                    'M', markerEndX,
                    markerStartY - this.markerWindowHeight / 2,
                    'L', markerEndX + (this.markerSideWidth - this.markerSideCornerRad),
                    markerStartY - this.markerWindowHeight / 2,
                    'C', markerEndX + (this.markerSideWidth - this.markerSideCornerRad),
                    markerStartY - this.markerWindowHeight / 2,
                    markerEndX + this.markerSideWidth,
                    markerStartY - this.markerWindowHeight / 2,
                    markerEndX + this.markerSideWidth,
                    markerStartY - (this.markerWindowHeight / 2) + this.markerSideCornerRad,
                    'L', markerEndX + this.markerSideWidth,
                    markerStartY + (this.markerWindowHeight / 2) - this.markerSideCornerRad,
                    'C', markerEndX + this.markerSideWidth,
                    markerStartY + (this.markerWindowHeight / 2) - this.markerSideCornerRad,
                    markerEndX + this.markerSideWidth,
                    markerStartY + (this.markerWindowHeight / 2),
                    markerEndX + (this.markerSideWidth - this.markerSideCornerRad),
                    markerStartY + (this.markerWindowHeight / 2),
                    'L', markerEndX,
                    markerStartY + this.markerWindowHeight / 2,
                    markerEndX,
                    markerStartY - this.markerWindowHeight / 2
                ];
                markerBorderPath = [
                    'M', markerStartX,
                    markerStartY - this.markerWindowHeight / 2,
                    'L', markerEndX,
                    markerStartY - this.markerWindowHeight / 2,
                    markerEndX,
                    markerStartY + this.markerWindowHeight / 2,
                    markerStartX,
                    markerStartY + this.markerWindowHeight / 2,
                    markerStartX,
                    markerStartY - this.markerWindowHeight / 2
                ];
                markerUnderlinePath = [
                    'M', markerStartX,
                    markerStartY + 1,
                    'L', markerEndX,
                    markerStartY + 1
                ];
                markerLineStroke = 'red';
                markerLineWidth = 1;
            }

            if(this.isShiny) {
                if(this.elements.markerLHS) {
                    this.elements.markerLHS.destroy();
                }
                this.elements.markerLHS = this.renderer.path(markerLHSPath)
                    .attr({
                        fill: '#cccccc'
                    })
                    .add();
                if(this.elements.markerRHS) {
                    this.elements.markerRHS.destroy();
                }
                this.elements.markerRHS = this.renderer.path(markerRHSPath)
                    .attr({
                        fill: '#cccccc'
                    })
                    .add();
                if(this.elements.markerWindow) {
                    this.elements.markerWindow.destroy();
                }
                this.elements.markerWindow = this.renderer.rect(markerStartX,
                    markerStartY - this.markerWindowHeight / 2, this.backgroundWidth,
                    this.markerWindowHeight, 0)
                    .attr({
                        fill: 'rgba(255, 255, 255, 0.3)'
                    })
                    .add();
                if(this.elements.markerBorder) {
                    this.elements.markerBorder.destroy();
                }
                this.elements.markerBorder = this.renderer.path(markerBorderPath)
                    .attr({
                        stroke: 'white',
                        'stroke-width': 2
                    })
                    .add();
                if(this.elements.markerUnderline) {
                    this.elements.markerUnderline.destroy();
                }
                this.elements.markerUnderline = this.renderer.path(markerUnderlinePath)
                    .attr({
                        stroke: 'white',
                        'stroke-width': 2
                    })
                    .add();
            }
            if(this.elements.markerLine) {
                this.elements.markerLine.destroy();
            }
            this.elements.markerLine = this.renderer.path(markerLinePath)
                .attr({
                    stroke: markerLineStroke,
                    'stroke-width': markerLineWidth
                })
                .add();
            if(this.showValue) {
                this.drawValueDisplay(val);
            }

        },

        drawValueDisplay: function(val) {
            var valueText = this.formatValue(val),
                markerHeight = this.normalizedTranslateValue(val),
                valueY = this.verticalPadding + this.backgroundHeight - this.bandOffsetBottom - markerHeight;

            if(this.elements.valueDisplay) {
                this.elements.valueDisplay.attr({
                    text: valueText,
                    y: valueY + this.valueFontSize / 4
                });
            }
            else {
                this.elements.valueDisplay = this.renderer.text(
                    valueText, (this.width - this.backgroundWidth) / 2 - this.valueOffset, valueY + this.valueFontSize / 4
                )
                    .css({
                        color: 'black',
                        fontSize: this.valueFontSize + 'px',
                        lineHeight: this.valueFontSize + 'px',
                        fontWeight: 'bold'
                    })
                    .attr({
                        align: 'right'
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

            return Math.round((normalizedValue / dataRange) * this.bandHeight);
        }

    });

    return VerticalMarkerGauge;
            
});