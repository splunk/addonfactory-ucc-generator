define([
            'jquery',
            'underscore',
            './Series',
            '../util/lang_utils'
        ],
        function(
            $,
            _,
            Series,
            langUtils
        ) {

    var SingleShapeSeries = function(properties) {
        Series.call(this, properties);
    };
    langUtils.inherit(SingleShapeSeries, Series);

    $.extend(SingleShapeSeries.prototype, {

        CHARTING_PROPERTY_WHITELIST:_.union(
            ['lineStyle', 'nullValueMode'],
            Series.prototype.CHARTING_PROPERTY_WHITELIST
        ),

        HIGHLIGHTED_OPACITY: 1.0,

        getConfig: function() {
            var config = Series.prototype.getConfig.call(this);
            config.dashStyle = (this.properties['lineStyle'] === 'dashed') ? 'Dash' : 'Solid';
            config.pointPlacement = this.properties['pointPlacement'];
            config.drawPointsPreHook = _(this.drawPointsPreHook).bind(this);
            return config;
        },

        handlePointMouseOver: function(point) {
            Series.prototype.handlePointMouseOver.call(this, point);
            this.highlight();
        },

        drawPointsPreHook: function(series) {
            // SPL-55213, we want to handle the case where some segments contain a single point and would not be visible
            // if showMarkers is true, the marker will take care of what we want, so we're done
            if(series.options.marker && series.options.marker.enabled) {
                return;
            }
            var i, segment,
                segments = series.segments;

            for(i = 0; i < segments.length; i++) {
                // a segments with a length of one contains a single point
                // extend the point's options to draw a small marker on it
                segment = segments[i];
                if(segment.length === 1) {
                    segment[0].update({
                        marker: {
                            enabled: true,
                            radius: 4
                        }
                    }, false);
                }
            }
        }

    });

    return SingleShapeSeries;

});