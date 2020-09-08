define([
            'jquery',
            'underscore',
            './Gauge',
            '../../util/lang_utils',
            '../../util/math_utils'
        ], 
        function(
            $,
            _,
            Gauge,
            langUtils,
            mathUtils
        ) {

    var RadialGauge = function(container, properties) {
        Gauge.call(this, container, properties);
    };
    langUtils.inherit(RadialGauge, Gauge);

    $.extend(RadialGauge.prototype, {

        showMinorTicksByDefault: false,

        updateDimensions: function() {
            Gauge.prototype.updateDimensions.call(this);
            // since the gauge is circular, have to handle when the container is narrower than it is tall
            if(this.width < this.height && this.width >= this.MIN_GAUGE_HEIGHT) {
                this.$container.height(this.width);
                this.height = this.width;
            }
        },

        processProperties: function() {
            Gauge.prototype.processProperties.call(this);
            this.verticalPadding = 10;
            this.minorsPerMajor = 10;
            this.tickWidth = 1;

            this.startAngle = this.computeStartAngle();
            this.arcAngle = this.computeArcAngle();
        },

        computeStartAngle: function() {
            var angle = parseInt(this.properties['chart.rangeStartAngle'], 10);
            if(_(angle).isNaN()) {
                angle = 45;
            }
            // add 90 to startAngle because we start at south instead of east
            return mathUtils.degreeToRadian(angle + 90);
        },

        computeArcAngle: function() {
            var angle = parseInt(this.properties['chart.rangeArcAngle'], 10) || 270;
            return mathUtils.degreeToRadian(angle);
        },

        renderGauge: function() {
            Gauge.prototype.renderGauge.call(this);
            this.borderWidth = mathUtils.roundWithMin(this.height / 60, 3);
            this.tickOffset = mathUtils.roundWithMin(this.height / 100, 3);
            this.tickLabelOffset = this.borderWidth;
            this.tickFontSize = mathUtils.roundWithMin(this.height / 25, 10);  // in pixels
            this.valueFontSize = mathUtils.roundWithMin(this.height / 15, 15);  // in pixels
            if(this.isShiny) {
                this.needleTailLength = mathUtils.roundWithMin(this.height / 15, 10);
                this.needleTailWidth = mathUtils.roundWithMin(this.height / 50, 6);
                this.knobWidth = mathUtils.roundWithMin(this.height / 30, 7);
            }
            else {
                this.needleWidth = mathUtils.roundWithMin(this.height / 60, 3);
            }
            if(!this.isShiny) {
                this.bandOffset = 0;
                this.bandThickness = mathUtils.roundWithMin(this.height / 30, 7);
            }
            else {
                this.bandOffset = this.borderWidth;
                this.bandThickness = mathUtils.roundWithMin(this.height / 40, 4);
            }
            this.tickColor = (!this.isShiny) ? this.foregroundColor : 'silver';
            this.tickFontColor = (!this.isShiny) ? this.fontColor : 'silver';
            this.valueColor = (!this.isShiny) ? this.fontColor : '#b8b167';
            this.tickLength = mathUtils.roundWithMin(this.height / 20, 4);
            this.minorTickLength = this.tickLength / 2;
            this.radius = (this.height - 2 * (this.verticalPadding + this.borderWidth)) / 2;
            this.valueHeight = this.height - ((this.radius / 4) + this.verticalPadding + this.borderWidth);
            this.needleLength = (!this.isShiny) ? this.radius - (this.bandThickness) / 2 : this.radius;

            this.tickStart = this.radius - this.bandOffset - this.bandThickness - this.tickOffset;
            this.tickEnd = this.tickStart - this.tickLength;
            this.tickLabelPosition = this.tickEnd - this.tickLabelOffset;
            this.minorTickEnd = this.tickStart - this.minorTickLength;

            if(this.isShiny) {
                this.elements.border = this.renderer.circle(this.width / 2,
                    this.height / 2, this.radius + this.borderWidth)
                    .attr({
                        fill: '#edede7',
                        stroke: 'silver',
                        'stroke-width': 1
                    })
                    .add();

                this.elements.background = this.renderer.circle(this.width / 2,
                    this.height / 2, this.radius)
                    .attr({
                        fill: '#000000'
                    })
                    .add();
            }

            if(this.showRangeBand) {
                this.drawColorBand();
            }
            this.drawTicks();
            this.drawIndicator(this.value);
            if(this.showValue) {
                this.drawValueDisplay();
            }

            this.checkOutOfRange(this.value);
        },

        updateValueDisplay: function(valueText) {
            this.elements.valueDisplay.attr({
                text: valueText
            });
        },

        drawColorBand: function() {
            var i, startAngle, endAngle,
                outerRadius = this.radius - this.bandOffset,
                innerRadius = outerRadius - this.bandThickness;

            for(i = 0; i < this.ranges.length - 1; i++) {
                startAngle = this.translateValue(this.ranges[i]);
                endAngle = this.translateValue(this.ranges[i + 1]);

                this.elements['colorBand' + i] = this.renderer.arc(this.width / 2, this.height / 2,
                    outerRadius, innerRadius, startAngle, endAngle)
                    .attr({
                        fill: this.getColorByIndex(i)
                    })
                    .add();
            }
        },

        drawMajorTick: function(angle) {
            return this.renderer.path([
                'M', (this.width / 2) + this.tickStart * Math.cos(angle),
                (this.height / 2) + this.tickStart * Math.sin(angle),
                'L', (this.width / 2) + this.tickEnd * Math.cos(angle),
                (this.height / 2) + this.tickEnd * Math.sin(angle)
            ])
                .attr({
                    stroke: this.tickColor,
                    'stroke-width': this.tickWidth
                })
                .add();
        },

        drawMajorTickLabel: function(angle, text) {
            var sin = Math.sin(angle),
                labelWidth = this.predictTextWidth(text, this.tickFontSize),
                textAlignment = (angle < (1.5 * Math.PI)) ? 'left' : 'right',
                xOffset = (angle < (1.5 * Math.PI)) ? (-labelWidth / 2) * sin *  sin :
                    (labelWidth / 2) * sin * sin,
                yOffset = (this.tickFontSize / 4) * sin;

            return this.renderer.text(text,
                (this.width / 2) + (this.tickLabelPosition) * Math.cos(angle)
                    + xOffset,
                (this.height / 2) + (this.tickLabelPosition - 4) * sin
                    + (this.tickFontSize / 4) - yOffset
            )
                .attr({
                    align: textAlignment
                })
                .css({
                    color: this.tickFontColor,
                    fontSize: this.tickFontSize + 'px'
                })
                .add();
        },

        drawMinorTick: function(angle) {
            return this.renderer.path([
                'M', (this.width / 2) + this.tickStart * Math.cos(angle),
                (this.height / 2) + this.tickStart * Math.sin(angle),
                'L', (this.width / 2) + this.minorTickEnd * Math.cos(angle),
                (this.height / 2) + this.minorTickEnd * Math.sin(angle)
            ])
                .attr({
                    stroke: this.tickColor,
                    'stroke-width': this.tickWidth
                })
                .add();
        },

        drawIndicator: function(val) {
            var needlePath, needleStroke, needleStrokeWidth,
                needleFill, needleRidgePath, knobFill,
                valueAngle = this.normalizedTranslateValue(val),
                myCos = Math.cos(valueAngle),
                mySin = Math.sin(valueAngle);

            if(!this.isShiny) {
                needlePath = [
                    'M', (this.width / 2),
                    (this.height / 2),
                    'L', (this.width / 2) + myCos * this.needleLength,
                    (this.height / 2) + mySin * this.needleLength
                ];
                needleStroke = this.foregroundColor;
                needleStrokeWidth = this.needleWidth;
            }
            else {
                needlePath = [
                    'M', (this.width / 2) - this.needleTailLength * myCos,
                    (this.height / 2) - this.needleTailLength * mySin,
                    'L', (this.width / 2) - this.needleTailLength * myCos + this.needleTailWidth * mySin,
                    (this.height / 2) - this.needleTailLength * mySin - this.needleTailWidth * myCos,
                    (this.width / 2) + this.needleLength * myCos,
                    (this.height / 2) + this.needleLength * mySin,
                    (this.width / 2) - this.needleTailLength * myCos - this.needleTailWidth * mySin,
                    (this.height / 2) - this.needleTailLength * mySin + this.needleTailWidth * myCos,
                    (this.width / 2) - this.needleTailLength * myCos,
                    (this.height / 2) - this.needleTailLength * mySin
                ];
                needleFill = {
                    linearGradient: [(this.width / 2) - this.needleTailLength * myCos,
                        (this.height / 2) - this.needleTailLength * mySin,
                        (this.width / 2) - this.needleTailLength * myCos - this.needleTailWidth * mySin,
                        (this.height / 2) - this.needleTailLength * mySin + this.needleTailWidth * myCos],
                    stops: [
                        [0, '#999999'],
                        [0.2, '#cccccc']
                    ]
                };
                needleRidgePath = [
                    'M', (this.width / 2) - (this.needleTailLength - 2) * myCos,
                    (this.height / 2) - (this.needleTailLength - 2) * mySin,
                    'L', (this.width / 2) + (this.needleLength - (this.bandOffset / 2)) * myCos,
                    (this.height / 2) + (this.needleLength - (this.bandOffset / 2)) * mySin
                ];
                knobFill = {
                    linearGradient: [(this.width / 2) + this.knobWidth * mySin,
                        (this.height / 2) - this.knobWidth * myCos,
                        (this.width / 2) - this.knobWidth * mySin,
                        (this.height / 2) + this.knobWidth * myCos],
                    stops: [
                        [0, 'silver'],
                        [0.5, 'black'],
                        [1, 'silver']
                    ]
                };
            }
            if(this.isShiny) {
                if(this.elements.centerKnob) {
                    this.elements.centerKnob.destroy();
                }
                this.elements.centerKnob = this.renderer.circle(this.width / 2, this.height /2, this.knobWidth)
                    .attr({
                        fill: knobFill
                    })
                    .add();
            }
            if(this.elements.needle) {
                this.elements.needle.destroy();
            }
            this.elements.needle = this.renderer.path(needlePath)
                .attr({
                    fill: needleFill || '',
                    stroke: needleStroke || '',
                    'stroke-width': needleStrokeWidth || ''
                })
                .add();
            if(this.isShiny) {
                if(this.elements.needleRidge) {
                    this.elements.needleRidge.destroy();
                }
                this.elements.needleRidge = this.renderer.path(needleRidgePath)
                    .attr({
                        stroke: '#cccccc',
                        'stroke-width': 1
                    })
                    .add();
            }
        },

        drawValueDisplay: function() {
            var valueText = this.formatValue(this.value);
            this.elements.valueDisplay = this.renderer.text(valueText, this.width / 2, this.valueHeight)
                .css({
                    color: this.valueColor,
                    fontSize: this.valueFontSize + 'px',
                    lineHeight: this.valueFontSize + 'px',
                    fontWeight: 'bold'
                })
                .attr({
                    align: 'center'
                })
                .add();
        },

        getSVG: function() {
            // a little bit of cleanup is required here since the export renderer doesn't support gradients
            if(this.elements.centerKnob) {
                this.elements.centerKnob.attr({ fill: '#999999' });
            }
            this.elements.needle.attr({ fill: '#bbbbbb' });
            if(this.elements.needleRidge) {
                this.elements.needleRidge.attr({ stroke: '#999999' });
            }
            return Gauge.prototype.getSVG.call(this);
        },

        normalizedTranslateValue: function(val) {
            if(val < this.ranges[0]) {
                return this.translateValue(this.ranges[0]);
            }
            if(val > this.ranges[this.ranges.length - 1]) {
                return this.translateValue(this.ranges[this.ranges.length - 1]);
            }
            return this.translateValue(val);
        },

        translateValue: function(val) {
            var dataRange = this.ranges[this.ranges.length - 1] - this.ranges[0],
                normalizedValue = val - this.ranges[0];

            return this.startAngle + ((normalizedValue / dataRange) * this.arcAngle);
        }

    });

    return RadialGauge;
    
});