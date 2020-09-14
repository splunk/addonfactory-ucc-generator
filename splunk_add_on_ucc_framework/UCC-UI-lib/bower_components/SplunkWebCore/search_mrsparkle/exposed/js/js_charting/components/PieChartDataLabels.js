define([
            'jquery',
            'underscore',
            '../helpers/EventMixin',
            '../helpers/Formatter',
            '../helpers/HoverEventThrottler',
            '../util/dom_utils',
            '../../js_charting/components/DataLabels',
            '../util/lang_utils'
        ],
        function(
        	$,
        	_,
        	EventMixin,
        	Formatter,
        	HoverEventThrottler,
        	domUtils,
        	DataLabels,
        	langUtils
        )  {


        	var PieChartDataLabels = function(properties) {
        		DataLabels.call(this, properties);
        		this.id = _.uniqueId('data_labels_');
        	};


        	langUtils.inherit(PieChartDataLabels, DataLabels);
	        PieChartDataLabels.prototype = $.extend(PieChartDataLabels.prototype, {

	       	HIGHLIGHTED_OPACITY: 1.0,
	        UNHIGHLIGHTED_OPACITY: 0.3,

		        getConfig: function() {
		            return ({
		                color: this.properties['fontColor'] || '#000000',
		                connectorColor: this.properties['foregroundColorSoft'],
		                softConnector: false,
		                distance: 20,
		                style: {
		                    cursor: this.properties['clickEnabled'] ? 'pointer' : 'default',
		                    // Hack to make sure we can render literal '<' and '>'
		                    HcTextStroke: true
		                },
		                x: 0.01,
		                drawDataLabelsPreHook: _(this.drawDataLabelsPreHook).bind(this),
		                drawDataLabelsPostHook: _(this.drawDataLabelsPostHook).bind(this)
		            });
		        },


		          onChartLoad: function() {},

        onChartLoadOrRedraw: function(chart) {
            this.removeEventHandlers();
			this.hcSeries = chart.series[0];
            this.addEventHandlers();
        },

        addEventHandlers: function() {
            var that = this,
                properties = {
                    highlightDelay: 125,
                    unhighlightDelay: 50,
                    onMouseOver: function(point){
                        that.selectLabel(point);
                        that.trigger('mouseover', [point]);
                    },
                    onMouseOut: function(point){
                        that.unSelectLabel(point);
                        that.trigger('mouseout', [point]);
                    }
                },
                throttle = new HoverEventThrottler(properties);

            _(this.hcSeries.data).each(function(point) {
                var label = point.dataLabel.element;
                domUtils.jQueryOn.call($(label), 'mouseover.' + this.id, function() {
                    throttle.mouseOverHappened(point);
                });
                domUtils.jQueryOn.call($(label), 'mouseout.' + this.id, function() {
                    throttle.mouseOutHappened(point);
                });
                domUtils.jQueryOn.call($(label), 'click.' + this.id, function() {
                    that.trigger('click', [point]);
                });
            }, this);
        },

        removeEventHandlers: function() {
			if(!this.hcSeries) {
                return;
            }
            _(this.hcSeries.data).each(function(point) {
                var label = point.dataLabel.element;
                domUtils.jQueryOff.call($(label), '.' + this.id);
            }, this);
        },

        destroy: function() {
            this.off();
            this.removeEventHandlers();
            this.hcSeries = null;
        },

        selectLabel: function(point) {
            var matchingPoint = this.hcSeries.data[point.index];
            matchingPoint.dataLabel.attr('fill-opacity', this.HIGHLIGHTED_OPACITY);
            _(this.hcSeries.data).chain().without(matchingPoint).each(function(hcPoint) {
                hcPoint.dataLabel.attr('fill-opacity', this.UNHIGHLIGHTED_OPACITY);
            }, this);
        },

        unSelectLabel: function(point) {
            var matchingPoint = this.hcSeries.data[point.index];
            _(this.hcSeries.data).chain().without(matchingPoint).each(function(hcPoint) {
                hcPoint.dataLabel.attr('fill-opacity', this.HIGHLIGHTED_OPACITY);
            }, this);
        },



	        /**
	         * @author sfishel
	         *
	         * Before the data label draw routine, overwrite the series getX method so that labels will be aligned vertically.
	         * Then make sure all labels will fit in the plot area.
	         */

	        drawDataLabelsPreHook: function(pieSeries) {
	            var chart = pieSeries.chart,
	                distance = pieSeries.options.dataLabels.distance,
	                center = pieSeries.center,
	                radius = center[2] / 2;

	            pieSeries.getX = function(y, left) {
	                return (chart.plotLeft + center[0] + (left ? (-radius - distance) : (radius + distance / 2)));
	            };

	            this.fitLabelsToPlotArea(pieSeries);
	        },

	        fitLabelsToPlotArea: function(series) {
	            var i, adjusted,
	                options = series.options,
	                labelDistance = options.dataLabels.distance,
	                size = options.size, // assumes size in pixels TODO: handle percents
	                chart = series.chart,
	                renderer = chart.renderer,
	                formatter = new Formatter(renderer),

	                defaultFontSize = 11,
	                minFontSize = 9,
	                maxWidth = (chart.plotWidth - (size + 2 * labelDistance)) / 2,
	                labels = [];
	            for(i = 0; i < series.data.length; i++) {
	                if (typeof series.options.data[i][0] !== "undefined"){
	                    labels.push(series.options.data[i][0]);
	                } else {
	                    labels.push(series.options.data[i].name);
	                }
	            }
	            adjusted = formatter.adjustLabels(labels, maxWidth, minFontSize, defaultFontSize, 'middle');

	            for(i = 0; i < series.data.length; i++) {
	                series.data[i].name = adjusted.labels[i];
	                // check for a redraw, update the font size in place
	                if(series.data[i].dataLabel && series.data[i].dataLabel.css) {
	                    series.data[i].dataLabel.css({'fontSize': adjusted.fontSize + 'px'});
	                }
	            }
	            $.extend(true, options.dataLabels, {
	                style: {
	                    'fontSize': adjusted.fontSize + 'px'
	                },
	                y: Math.floor(adjusted.fontSize / 4) - 3
	            });
	            formatter.destroy();
	        },

	        /**
	         * @author sfishel
	         *
	         * After the data labels have been drawn, update the connector paths in place.
	         */

	        drawDataLabelsPostHook: function(pieSeries) {
	            _(pieSeries.points).each(function(point) {
	                if(point.connector) {
	                    var path = point.connector.attr('d').split(' ');
	                    point.connector.attr({ d: this.updateConnectorPath(path) });
	                }
	            }, this);
	        },

	        updateConnectorPath: function(path) {
	            // the default path consists of three points that create a two-segment line
	            // we are going to move the middle point so the outer segment is horizontal

	            // first extract the actual points from the SVG-style path declaration
	            var firstPoint = {
	                    x: parseFloat(path[1]),
	                    y: parseFloat(path[2])
	                },
	                secondPoint = {
	                    x: parseFloat(path[4]),
	                    y: parseFloat(path[5])
	                },
	                thirdPoint = {
	                    x: parseFloat(path[7]),
	                    y: parseFloat(path[8])
	                };

	            // find the slope of the second line segment, use it to calculate the new middle point
	            var secondSegmentSlope = (thirdPoint.y - secondPoint.y) / (thirdPoint.x - secondPoint.x),
	                newSecondPoint = {
	                    x: thirdPoint.x + (firstPoint.y - thirdPoint.y) / secondSegmentSlope,
	                    y: firstPoint.y
	                };

	            // define the update path and swap it into the original array
	            // if the resulting path would back-track on the x-axis (or is a horizontal line),
	            // just draw a line directly from the first point to the last
	            var lineIsVertical = !_.isFinite(secondSegmentSlope),
	                wouldBacktrack = isNaN(newSecondPoint.x) || (firstPoint.x >= newSecondPoint.x && newSecondPoint.x <= thirdPoint.x)
	                    || (firstPoint.x <= newSecondPoint.x && newSecondPoint.x >= thirdPoint.x),
	                newPath = (!lineIsVertical && wouldBacktrack) ?
	                    [
	                        "M", firstPoint.x, firstPoint.y,
	                        "L", thirdPoint.x, thirdPoint.y
	                    ] :
	                    [
	                        "M", firstPoint.x, firstPoint.y,
	                        "L", newSecondPoint.x, newSecondPoint.y,
	                        "L", thirdPoint.x, thirdPoint.y
	                    ];

	            return newPath;
	        }

    });
	
	return PieChartDataLabels;
});