define([
            'jquery',
            'underscore',
            './ManyShapeOptimizedSeries',
            '../util/lang_utils'
        ],
        function(
            $,
            _,
            ManyShapeOptimizedSeries,
            langUtils
        ) {

    var BarSeries = function(properties) {
        ManyShapeOptimizedSeries.call(this, properties);
    };
    langUtils.inherit(BarSeries, ManyShapeOptimizedSeries);

    $.extend(BarSeries.prototype, {

        CHARTING_PROPERTY_WHITELIST: _.union(['barSpacing'], ManyShapeOptimizedSeries.prototype.CHARTING_PROPERTY_WHITELIST),

        type: 'bar',

        getConfig: function() {
            var config = ManyShapeOptimizedSeries.prototype.getConfig.call(this);
            config.pointPadding = this.computeBarSpacing(this.properties['barSpacing']);
            config.groupPadding = this.computeBarGroupSpacing(this.properties['seriesSpacing']);
            return config;
        },

        // SPL-68694, this should be a no-op for bar series or it will interfere with click handlers
        bringToFront: function() { }

    });

    return BarSeries;

});