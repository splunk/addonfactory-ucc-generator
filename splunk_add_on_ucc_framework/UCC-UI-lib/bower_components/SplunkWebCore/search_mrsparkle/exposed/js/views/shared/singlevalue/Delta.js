define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'util/svg',
        'util/general_utils',
        'util/math_utils'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        svgUtil,
        generalUtil,
        mathUtil
        ) {

        return BaseView.extend({
            moduleId: module.id,
            className: "single-value-delta",
            el: function() {
                return svgUtil.createElement('g').attr('class', 'single-value-delta');
            },
            SVG_POINTS: {
                decrease: {
                    polylinePoints: '20.5,3 20.5,20.5 3,20.5',
                    linePoints: [20.2,20.9,3.4,4]
                },
                increase: {
                    polylinePoints: '20.5,21 20.5,3.5 3,3.5',
                    linePoints: [20.2,3.3,3.4,20.2]
                },
                noChange: {
                    polylinePoints: '14.8,20.2 23.8,11.2 14.8,2.2',
                    linePoints: [0,11.2,23,11.2]
                }
            },
            INDICATOR_WIDTH: 22,
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.updateContainerDimensions();
                this.activate();
            },
            drawComponents: function() {
                var deltaFormat = this.model.state.get('display.visualizations.singlevalue.trendDisplayMode');

                this.deltaValue = this.model.results.get('deltaValue');
                this.formattedDeltaValue = this.model.results.get('formattedDeltaValue');

                if (this.deltaValue && this.deltaValue !== 0) {
                    if (this.deltaValue === 'percentageDecrease' || this.deltaValue < 0) {
                        this.indicatorMode = 'decrease';
                        this.indicatorClass = 'delta-down-indicator';
                    } else if (this.deltaValue === 'percentageIncrease' || this.deltaValue > 0) {
                        this.indicatorMode = 'increase';
                        this.indicatorClass = 'delta-up-indicator';
                    }
                } else {
                    this.indicatorMode = 'noChange';
                    this.indicatorClass = 'delta-no-change-indicator';
                }

                this.indicatorColor = this.model.presentation.get('deltaColor');

                if (isNaN(this.deltaValue) || this.deltaValue === Infinity || this.deltaValue === -Infinity) {
                    this.formattedDeltaValue = "N/A";
                } else {
                    if (deltaFormat && deltaFormat.toLowerCase() === 'percent') {
                        this.formattedDeltaValue += '%';
                    }
                }

                this.drawLabel();
                this.drawIndicator();
            },
            drawIndicator: function() {
                var indicatorGroup = svgUtil.createElement('g')
                        .attr({
                            'class': 'delta-indicator ' +  this.indicatorClass
                        }),
                    points = this.SVG_POINTS[this.indicatorMode],
                    polyline = svgUtil.createElement('polyline')
                        .attr({
                            points: points.polylinePoints,
                            fill: 'none',
                            stroke: this.indicatorColor,
                            'stroke-width': '5px'
                        }),
                    line = svgUtil.createElement('line')
                        .attr({
                            x1: points.linePoints[0],
                            y1: points.linePoints[1],
                            x2: points.linePoints[2],
                            y2: points.linePoints[3],
                            fill: this.indicatorColor,
                            stroke: this.indicatorColor,
                            'stroke-width': '5px'
                        });
                indicatorGroup.append(polyline);
                indicatorGroup.append(line);
                this.$el.append(indicatorGroup);
            },
            drawLabel: function() {
                var value = svgUtil.createElement('text')
                    .attr({
                        'class': 'delta-label'
                    })
                    .text(this.formattedDeltaValue)
                    .css({
                        'font-size' : this.model.presentation.get('deltaFontSize'),
                        'fill' : this.indicatorColor,
                        'fontWeight' : 'bold'
                    });
                this.$el.append(value);
            },
            updateContainerDimensions: function() {
                this.scaleRatio = this.model.presentation.get('scaleRatio');
            },
            positionAndScaleElements: function() {
                var $label = this.$el.find('.delta-label'),
                    $indicator = this.$el.find('.delta-indicator'),
                    deltaScale = this.model.presentation.get('deltaScale'),
                    labelWidth,
                    indicatorWidth = this.INDICATOR_WIDTH * deltaScale,
                    deltaWidth,
                    deltaLeft = this.model.presentation.get('deltaLeft') || 0,
                    indicatorTranslateX,
                    indicatorTranslateY = -45,
                    deltaTranslateX,
                    maxDeltaRatio,
                    maxDeltaWidth = this.model.presentation.get('maxDeltaWidth');

                if (!this.defaultDeltaWidth) {
                    this.defaultDeltaWidth = this.getDeltaWidth();
                }

                if (!this.defaultLabelWidth) {
                    this.defaultLabelWidth = $label[0].getBBox().width;
                }

                deltaTranslateX = (deltaLeft + 10) / this.scaleRatio;
                labelWidth = this.defaultLabelWidth;

                indicatorTranslateX = mathUtil.roundToDecimal((labelWidth / 2 - indicatorWidth / 2), -2);
                if (generalUtil.valuesAreNumericAndFinite([this.scaleRatio, indicatorTranslateX, indicatorTranslateY, deltaTranslateX])) {
                    $indicator.attr({
                        transform: 'scale(' + deltaScale + ')translate(' + indicatorTranslateX + ',' + indicatorTranslateY + ')'
                    });
                    this.$el.attr({
                        transform: "scale(" + this.scaleRatio + ")translate(" + deltaTranslateX + ")"
                    });
                }


                deltaWidth = this.getDeltaWidth();
                if (deltaWidth > maxDeltaWidth) {
                    maxDeltaRatio = mathUtil.roundToDecimal(maxDeltaWidth / this.defaultDeltaWidth, -2);
                    deltaTranslateX = (deltaLeft + 10) / maxDeltaRatio;
                    if (generalUtil.valuesAreNumericAndFinite([maxDeltaRatio, deltaTranslateX])) {
                        this.$el.attr({
                            transform: "scale(" + maxDeltaRatio + ")translate(" + deltaTranslateX + ")"
                        });
                    }
                }
            },
            getDeltaWidth: function() {
                return this.el.getBoundingClientRect().width;
            },
            reflow: function() {
                this.updateContainerDimensions();
                this.positionAndScaleElements();
            },
            render: function() {
                this.drawComponents();
                return this;
            }
        });
    }
);
