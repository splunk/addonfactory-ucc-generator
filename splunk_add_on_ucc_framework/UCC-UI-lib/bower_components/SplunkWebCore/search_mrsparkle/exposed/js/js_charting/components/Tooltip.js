define(['jquery', 'underscore'], function($, _) {

    var Tooltip = function(properties) {
        this.properties = properties || {};
    };

    Tooltip.prototype = {

        BASE_CONFIG: {
            enabled: true,
            backgroundColor: '#000000',
            borderColor: '#ffffff',
            hideDelay: 0,
            style: {
                color: '#cccccc'
            },
            /**
             * @author sfishel
             *
             * If the tooltip is too wide for the plot area, clip it left not right.
             *
             * unit test: js_charting/components/test_tooltip.html
             */
            positioner: function(boxWidth, boxHeight, point) {
                var position = this.getPosition(boxWidth, boxHeight, point),
                    plotWidth = this.chart.plotWidth,
                    plotHeight = this.chart.plotHeight,
                    resetZoomButton = $('.btn-zoom-out');

                // If the point lies outside of the plot, we move the tooltip
                // back into the plot area. The numeric constants are to account
                // for the tooltip 'tail'
                // NOTE: points that are within the plot handle the tooltip
                // correctly by default, so we don't have to worry about
                // cases where just the tooltip box overflows the plot.
                if (point.plotX > plotWidth) {
                    position.x = this.chart.plotLeft + plotWidth - boxWidth - 8;
                }
                if (point.plotX < 0) {
                    position.x = this.chart.plotLeft + 8;
                }
                if (point.plotY < 0) {
                    position.y = 0 + 17;
                }
                if (point.plotY > plotHeight) {
                    position.y = plotHeight - boxHeight + 3;
                }

                // Prevent tooltip from blocking the reset zoom button
                if(resetZoomButton.length > 0){
                    var buttonPos = resetZoomButton.position();
                    if(buttonPos){
                        var buttonTop = buttonPos.top,
                            buttonHeight = resetZoomButton.height(),
                            buttonBottom = buttonTop + buttonHeight,
                            tooltipTop = position.y;
                        if(tooltipTop < buttonBottom){
                            // Tooltip is overlapping reset button -> shift tooltip to below point
                            position.y = point.plotY + 17; // height of tooltip 'tail': ~ 17
                        }
                    }
                }
                
                return position;
            },
            /**
             * @author sfishel
             *
             * Adjust the tooltip anchor position for column charts.
             * Use a position relative to the selected column instead of a shared one for the series group.
             *
             * unit test: js_charting/components/test_tooltip.html
             */
            getAnchorPostHook: function(points, mouseEvent, anchor) {
                if(points && !_.isArray(points) && points.series.options.type === 'column') {
                    anchor[0] = points.barX;
                }
                return anchor;
            }
        },

        getConfig: function() {
            return $.extend(true, {}, this.BASE_CONFIG, {
                borderColor: this.properties['borderColor']
            });
        },

        destroy: function() {}

    };

    return Tooltip;

});