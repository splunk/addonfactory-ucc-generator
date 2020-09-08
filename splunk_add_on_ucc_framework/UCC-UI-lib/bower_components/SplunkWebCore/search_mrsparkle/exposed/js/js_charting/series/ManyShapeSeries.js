define([
            'jquery',
            'underscore',
            'highcharts',
            './Series',
            '../util/lang_utils'
        ], 
        function(
            $,
            _,
            Highcharts,
            Series,
            langUtils
        ) {

    var ManyShapeSeries = function(properties) {
        Series.call(this, properties);
    };
    langUtils.inherit(ManyShapeSeries, Series);

    $.extend(ManyShapeSeries.prototype, {

        CHARTING_PROPERTY_WHITELIST: _.union(['seriesSpacing'], Series.prototype.CHARTING_PROPERTY_WHITELIST),

        destroy: function() {
            this.unSelectPoint();
            Series.prototype.destroy.call(this);
        },

        handlePointMouseOver: function(point) {
            Series.prototype.handlePointMouseOver.call(this, point);
            this.selectPoint(point);
        },

        handlePointMouseOut: function(point) {
            Series.prototype.handlePointMouseOut.call(this, point);
            this.unSelectPoint(point);
        },

        selectPoint: function(point) {
            var matchingPoint = this.hcSeries.data[point.index];
            this.highlightPoint(matchingPoint);
            _(this.hcSeries.data).chain().without(matchingPoint).each(this.unHighlightPoint, this);
        },

        unSelectPoint: function(point) {
            if(!point){
                return;
            }
            var matchingPoint = this.hcSeries.data[point.index];
            _(this.hcSeries.data).chain().without(matchingPoint).each(this.highlightPoint, this);
        },

        highlight: function() {
            Series.prototype.highlight.call(this);
            _(this.hcSeries.data).each(this.highlightPoint, this);
        },

        unHighlight: function() {
            Series.prototype.unHighlight.call(this);
            _(this.hcSeries.data).each(this.unHighlightPoint, this);
        },

        highlightPoint: function(hcPoint) {
            if(!hcPoint.graphic) {
                return;
            }
            var seriesColor = this.getColor();
            hcPoint.graphic.attr({
                'fill': seriesColor,
                'fill-opacity': this.HIGHLIGHTED_OPACITY,
                'stroke': seriesColor
            });
        },

        unHighlightPoint: function(hcPoint) {
            if(!hcPoint.graphic) {
                return;
            }
            hcPoint.graphic.attr({
                'fill': this.UNHIGHLIGHTED_COLOR,
                'stroke-width': 1,
                'stroke': this.UNHIGHLIGHTED_BORDER_COLOR
            });
        }

    });

    return ManyShapeSeries;
    
});