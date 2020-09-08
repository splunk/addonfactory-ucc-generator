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

    var ColumnSeries = function(properties) {
        ManyShapeOptimizedSeries.call(this, properties);
    };
    langUtils.inherit(ColumnSeries, ManyShapeOptimizedSeries);

    $.extend(ColumnSeries.prototype, {

        CHARTING_PROPERTY_WHITELIST: _.union(['columnSpacing'], ManyShapeOptimizedSeries.prototype.CHARTING_PROPERTY_WHITELIST),

        type: 'column',

        getConfig: function() {
            var config = ManyShapeOptimizedSeries.prototype.getConfig.call(this);
            config.pointPadding = this.computeColumnSpacing(this.properties['columnSpacing']);
            config.groupPadding = this.computeColumnGroupSpacing(this.properties['seriesSpacing']);

            return config;
        },

        // SPL-68694, this should be a no-op for column series or it will interfere with click handlers
        bringToFront: function() { }

    });

    return ColumnSeries;

});