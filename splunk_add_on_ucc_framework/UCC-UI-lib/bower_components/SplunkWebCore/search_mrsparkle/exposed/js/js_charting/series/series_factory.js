define([
            './ColumnSeries',
            './BarSeries',
            './LineSeries',
            './AreaSeries',
            './PieSeries',
            './ScatterSeries',
            './BubbleSeries',
            './RangeSeries'
        ],
        function(
            ColumnSeries,
            BarSeries,
            LineSeries,
            AreaSeries,
            PieSeries,
            ScatterSeries,
            BubbleSeries,
            RangeSeries
        ) {

    return ({

        create: function(properties) {
            if(properties.type === 'column') {
                return new ColumnSeries(properties);
            }
            if(properties.type === 'bar') {
                return new BarSeries(properties);
            }
            if(properties.type === 'line') {
                return new LineSeries(properties);
            }
            if(properties.type === 'area') {
                return new AreaSeries(properties);
            }
            if(properties.type === 'pie') {
                return new PieSeries(properties);
            }
            if(properties.type === 'scatter') {
                return new ScatterSeries(properties);
            }
            if(properties.type === 'bubble') {
                return new BubbleSeries(properties);
            }
            if(properties.type === 'range') {
                return new RangeSeries(properties);
            }
            return new ColumnSeries(properties);
        }

    });

});