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

    var HorizontalMarkerGauge = function(container, properties) {
        MarkerGauge.call(this, container, properties);
        this.horizontalPadding = 20;
        this.tickOffset = 5;
        this.tickLength = 15;
        this.tickWidth = 1;
        this.tickLabelOffset = 5;
        this.minorTickLength = Math.floor(this.tickLength / 2);
        this.bandHeight = (!this.isShiny) ? 35 : 15;
    };
    langUtils.inherit(HorizontalMarkerGauge, MarkerGauge);

    $.extend(HorizontalMarkerGauge.prototype, {

        renderGauge: function() {
            this.markerWindowHeight = mathUtils.roundWithMinMax(this.width / 30, 30, 80);
            this.markerSideWidth = this.markerWindowHeight / 2;
            this.markerSideCornerRad = this.markerSideWidth / 3;
            this.bandOffsetBottom = 5 + this.markerWindowHeight / 2;
            this.bandOffsetTop = 5 + this.markerWindowHeight / 2;
            this.tickFontSize = mathUtils.roundWithMinMax(this.width / 50, 10, 20);  // in pixels
            this.backgroundCornerRad = mathUtils.roundWithMinMax(this.width / 120, 3, 5);
            this.valueFontSize = mathUtils.roundWithMinMax(this.width / 40, 15, 25);  // in pixels
            this.valueOffset = this.markerSideWidth + 10;
            this.tickLabelPadding = this.tickFontSize / 2;
            this.bandOffsetX = (!this.isShiny) ? 0 : this.tickLabelPadding;
            this.backgroundHeight = this.bandOffsetX + this.bandHeight + this.tickOffset + this.tickLength
                + this.tickLabelOffset + this.tickFontSize + this.tickLabelPadding;
            MarkerGauge.prototype.renderGauge.call(this);
        },

        drawBackground: function(tickValues) {
            tickValues = this.calculateTickValues(this.ranges[0], this.ranges[this.ranges.length - 1], this.MAX_TICKS_PER_RANGE);
            var maxTickValue = tickValues[tickValues.length - 1],
                maxTickWidth = this.predictTextWidth(this.formatValue(maxTickValue), this.tickFontSize);

            this.bandOffsetBottom = Math.max(this.bandOffsetBottom, maxTickWidth);
            this.bandOffsetTop = Math.max(this.bandOffsetTop, maxTickWidth);
            this.backgroundWidth = this.width - (2 * this.horizontalPadding);
            this.bandWidth = this.backgroundWidth - (this.bandOffsetBottom + this.bandOffsetTop);

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
        },

        drawBand: function() {
            var i, startOffset, endOffset,
                bandStartX = this.horizontalPadding + this.bandOffsetBottom,
                bandTopY = ((this.height - this.backgroundHeight) / 2) + this.bandOffsetX;

            for(i = 0; i < this.ranges.length - 1; i++) {
                startOffset = this.translateValue(this.ranges[i]);
                endOffset = this.translateValue(this.ranges[i + 1]);
                this.elements['colorBand' + i] = this.renderer.rect(
                    bandStartX + startOffset, bandTopY,
                    endOffset - startOffset, this.bandHeight, this.bandCornerRad
                )
                    .attr({
                        fill: this.getColorByIndex(i)
                    })
                    .add();
            }

            this.tickStartY = (this.height - this.backgroundHeight) / 2 + (this.bandOffsetX + this.bandHeight)
                + this.tickOffset;
            this.tickEndY = this.tickStartY + this.tickLength;
            this.tickLabelStartY = this.tickEndY + this.tickLabelOffset;
        },

        drawMajorTick: function(offset) {
            var tickOffset = this.horizontalPadding + this.bandOffsetBottom + offset;

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
            var tickOffset = this.horizontalPadding + this.bandOffsetBottom + offset;

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
            var tickOffset = this.horizontalPadding + this.bandOffsetBottom + offset;

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
            var markerOffset = this.normalizedTranslateValue(val),
                markerStartY = (!this.isShiny) ? (this.height - this.backgroundHeight) / 2 - 10 : (this.height - this.backgroundHeight) / 2,
                markerEndY = (!this.isShiny) ? markerStartY + this.bandHeight + 20 : markerStartY + this.backgroundHeight,
                markerStartX = this.horizontalPadding + this.bandOffsetBottom + markerOffset,
                markerLineWidth = 3, // set to 1 for shiny
                markerLineStroke = this.foregroundColor, // set to red for shiny
                markerLinePath = [
                    'M', markerStartX, markerStartY,
                    'L', markerStartX, markerEndY
                ];

            if(this.isShiny) {
                var markerLHSPath = [
                        'M', markerStartX - this.markerWindowHeight / 2,
                        markerStartY,
                        'L', markerStartX - this.markerWindowHeight / 2,
                        markerStartY  - (this.markerSideWidth - this.markerSideCornerRad),
                        'C', markerStartX - this.markerWindowHeight / 2,
                        markerStartY  - (this.markerSideWidth - this.markerSideCornerRad),
                        markerStartX - this.markerWindowHeight / 2,
                        markerStartY - this.markerSideWidth,
                        markerStartX - (this.markerWindowHeight / 2) + this.markerSideCornerRad,
                        markerStartY - this.markerSideWidth,
                        'L', markerStartX + (this.markerWindowHeight / 2) - this.markerSideCornerRad,
                        markerStartY - this.markerSideWidth,
                        'C', markerStartX + (this.markerWindowHeight / 2) - this.markerSideCornerRad,
                        markerStartY - this.markerSideWidth,
                        markerStartX + (this.markerWindowHeight / 2),
                        markerStartY - this.markerSideWidth,
                        markerStartX + (this.markerWindowHeight / 2),
                        markerStartY - (this.markerSideWidth - this.markerSideCornerRad),
                        'L', markerStartX + this.markerWindowHeight / 2,
                        markerStartY,
                        markerStartX - this.markerWindowHeight,
                        markerStartY
                    ],
                    markerRHSPath = [
                        'M', markerStartX - this.markerWindowHeight / 2,
                        markerEndY,
                        'L', markerStartX - this.markerWindowHeight / 2,
                        markerEndY + (this.markerSideWidth - this.markerSideCornerRad),
                        'C', markerStartX - this.markerWindowHeight / 2,
                        markerEndY + (this.markerSideWidth - this.markerSideCornerRad),
                        markerStartX - this.markerWindowHeight / 2,
                        markerEndY + this.markerSideWidth,
                        markerStartX - (this.markerWindowHeight / 2) + this.markerSideCornerRad,
                        markerEndY + this.markerSideWidth,
                        'L', markerStartX + (this.markerWindowHeight / 2) - this.markerSideCornerRad,
                        markerEndY + this.markerSideWidth,
                        'C', markerStartX + (this.markerWindowHeight / 2) - this.markerSideCornerRad,
                        markerEndY + this.markerSideWidth,
                        markerStartX + (this.markerWindowHeight / 2),
                        markerEndY + this.markerSideWidth,
                        markerStartX + (this.markerWindowHeight / 2),
                        markerEndY + (this.markerSideWidth - this.markerSideCornerRad),
                        'L', markerStartX + this.markerWindowHeight / 2,
                        markerEndY,
                        markerStartX - this.markerWindowHeight,
                        markerEndY
                    ],
                    markerBorderPath = [
                        'M', markerStartX - this.markerWindowHeight / 2,
                        markerStartY,
                        'L', markerStartX - this.markerWindowHeight / 2,
                        markerEndY,
                        markerStartX + this.markerWindowHeight / 2,
                        markerEndY,
                        markerStartX + this.markerWindowHeight / 2,
                        markerStartY,
                        markerStartX - this.markerWindowHeight / 2,
                        markerStartY
                    ],
                    markerUnderlinePath = [
                        'M', markerStartX - 1,
                        markerStartY,
                        'L', markerStartX - 1,
                        markerEndY
                    ];
                markerLineStroke = 'red';
                markerLineWidth = 1;

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
                this.elements.markerWindow = this.renderer.rect(markerStartX - this.markerWindowHeight / 2,
                    markerStartY, this.markerWindowHeight, this.backgroundHeight, 0)
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
                markerOffset = this.normalizedTranslateValue(val),
                valueX = this.horizontalPadding + this.bandOffsetBottom + markerOffset;

            if(this.elements.valueDisplay) {
                this.elements.valueDisplay.attr({
                    text: valueText,
                    x: valueX
                });
            }
            else {
                this.elements.valueDisplay = this.renderer.text(
                    valueText, valueX, (this.height - this.backgroundHeight) / 2 - this.valueOffset
                )
                    .css({
                        color: 'black',
                        fontSize: this.valueFontSize + 'px',
                        lineHeight: this.valueFontSize + 'px',
                        fontWeight: 'bold'
                    })
                    .attr({
                        align: 'center'
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

            return Math.round((normalizedValue / dataRange) * this.bandWidth);
        }

    });

    return HorizontalMarkerGauge;
            
});