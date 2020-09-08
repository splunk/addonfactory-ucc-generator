define([
            'jquery',
            'underscore',
            './AreaSeries',
            './LineSeries',
            './MultiSeries',
            '../util/lang_utils'
        ], 
        function(
            $,
            _,
            AreaSeries,
            LineSeries,
            MultiSeries,
            langUtils
        ) {

    var LowerRangeSeries = function(properties) {
        this.threshold = 0;
        AreaSeries.call(this, properties);
    };
    langUtils.inherit(LowerRangeSeries, AreaSeries);

    $.extend(LowerRangeSeries.prototype, {

        HIGHLIGHTED_OPACITY: 0,
        UNHIGHLIGHTED_OPACITY: 0,
        UNHIGHLIGHTED_LINE_OPACITY: 0.25,

        normalizeProperties: function(rawProps) {
            return $.extend({}, AreaSeries.prototype.normalizeProperties.apply(this, arguments), {
                lineStyle: 'dashed',
                stacking: 'stacked'
            });
        },

        setData: function(inputData) {
            AreaSeries.prototype.setData.call(this, inputData);
            var minValue = _(inputData.y).min();
            var oldThreshold = this.threshold;
            this.threshold = Math.min(minValue, 0);
            if(this.threshold !== oldThreshold) {
                this._isDirty = true;
            }
        },

        getConfig: function() {
            var config = AreaSeries.prototype.getConfig.call(this);
            config.showInLegend = false;
            config.threshold = this.threshold;
            config.stack = this.properties.stack;
            return config;
        }

    });

    var UpperRangeSeries = function(properties) {
        AreaSeries.call(this, properties);
    };
    langUtils.inherit(UpperRangeSeries, AreaSeries);

    $.extend(UpperRangeSeries.prototype, {

        HIGHLIGHTED_OPACITY: 0.25,
        UNHIGHLIGHTED_OPACITY: 0.1,
        UNHIGHLIGHTED_LINE_OPACITY: 0.25,

        normalizeProperties: function(rawProps) {
            return $.extend({}, AreaSeries.prototype.normalizeProperties.apply(this, arguments), {
                lineStyle: 'dashed',
                stacking: 'stacked'
            });
        },

        getConfig: function() {
            var config = AreaSeries.prototype.getConfig.call(this);
            config.showInLegend = false;
            config.stack = this.properties.stack;
            return config;
        }

    });

    var RangeSeries = function(properties) {
        MultiSeries.call(this, properties);
        this.rangeStackId = _.uniqueId('rangeStack_');

        this.predictedSeries = new LineSeries(this.getPredictedSeriesProperties());
        this.lowerSeries = new LowerRangeSeries(this.getLowerSeriesProperties());
        this.upperSeries = new UpperRangeSeries(this.getUpperSeriesProperties());
        this.nestedSeriesList = [this.upperSeries, this.lowerSeries, this.predictedSeries];
        this.bindNestedSeries();
    };
    langUtils.inherit(RangeSeries, MultiSeries);

    $.extend(RangeSeries.prototype, {

        type: 'range',

        update: function(properties) {
            this.properties = this.normalizeProperties(properties);
            this.predictedSeries.update(this.getPredictedSeriesProperties());
            this.lowerSeries.update(this.getLowerSeriesProperties());
            this.upperSeries.update(this.getUpperSeriesProperties());
        },

        setData: function(inputData) {
            this.predictedSeries.setData({
                y: inputData.predicted,
                x: inputData.x
            });
            this.lowerSeries.setData({
                y: inputData.lower,
                x: inputData.x
            });

            // TODO: will this work for log scale?
            inputData.upper = _(inputData.upper).map(function(point, i) {
                if(_(point).isNull()) {
                    return null;
                }
                var diff = point - inputData.lower[i];
                return Math.max(diff, 0);
            });
            this.upperSeries.setData({
                y: inputData.upper,
                x: inputData.x
            });
        },

        getPredictedSeriesProperties: function() {
            return this.properties;
        },

        getLowerSeriesProperties: function() {
            return $.extend({}, this.properties, {
                name: this.properties.names.lower,
                legendKey: this.predictedSeries.getLegendKey(),
                stack: this.rangeStackId
            });
        },

        getUpperSeriesProperties: function() {
            return $.extend({}, this.properties, {
                name: this.properties.names.upper,
                legendKey: this.predictedSeries.getLegendKey(),
                stack: this.rangeStackId
            });
        },

        getFieldList: function() {
            return this.predictedSeries.getFieldList();
        },

        // to get the right color effects, we have to force the upper and lower series
        // to take on the same color as the predicted series
        applyColorMapping: function(colorMapping) {
            this.predictedSeries.applyColorMapping(colorMapping);
            var predictedColor = this.predictedSeries.getColor(),
                lowerSeriesColorMapping = {},
                upperSeriesColorMapping = {};

            lowerSeriesColorMapping[this.lowerSeries.getName()] = predictedColor;
            this.lowerSeries.applyColorMapping(lowerSeriesColorMapping);

            upperSeriesColorMapping[this.upperSeries.getName()] = predictedColor;
            this.upperSeries.applyColorMapping(upperSeriesColorMapping);
        },

        handlePointMouseOver: function(point) {
            this.bringToFront();
            this.highlight();
        },

        handlePointMouseOut: function(point) { },

        handleLegendMouseOver: function(fieldName) {
            this.bringToFront();
            this.highlight();
        },

        handleLegendMouseOut: function(fieldName) { }

    });
    
    return RangeSeries;
    
});