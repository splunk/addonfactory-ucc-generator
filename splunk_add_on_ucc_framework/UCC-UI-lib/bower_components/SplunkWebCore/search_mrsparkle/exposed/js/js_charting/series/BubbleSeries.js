define([
            'jquery',
            'underscore',
            './ManyShapeSeries',
            './ScatterSeries',
            './Series',
            '../util/lang_utils'
        ],
        function(
            $,
            _,
            ManyShapeSeries,
            ScatterSeries,
            Series,
            langUtils
        ) {

    var BubbleSeries = function(container, properties) {
        ManyShapeSeries.call(this, container, properties);
    };
    langUtils.inherit(BubbleSeries, ManyShapeSeries);

    $.extend(BubbleSeries.prototype, {

        HIGHLIGHTED_OPACITY: 0.5,

        type: 'bubble',

        setData: function(inputData) {
            var oldData = this.data;
            this.data = _(inputData.x).map(function(value, i) {
                return [value, inputData.y[i], inputData.z[i]];                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
            });
            if(!_.isEqual(this.data, oldData)) {
                this._dataIsDirty = true;
            }
        },

        getTooltipRows: function(info) {
            var rows = ScatterSeries.prototype.getTooltipRows.apply(this, arguments);
            rows.push([info.zAxisName, info.zValue]);
            return rows;
        }
    });

    return BubbleSeries;

});