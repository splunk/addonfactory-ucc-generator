define([
            'jquery', 
            'underscore',
            'highcharts',
            'helpers/user_agent',
            './helpers/DataSet',
            './visualizations/charts/Chart',
            './visualizations/charts/SplitSeriesChart',
            './visualizations/charts/PieChart',
            './visualizations/charts/ScatterChart',
            './visualizations/charts/BubbleChart',
            './visualizations/gauges/RadialGauge',
            './visualizations/gauges/HorizontalFillerGauge',
            './visualizations/gauges/VerticalFillerGauge',
            './visualizations/gauges/HorizontalMarkerGauge',
            './visualizations/gauges/VerticalMarkerGauge',
            './util/parsing_utils'
        ], 
        function(
            $,
            _,
            Highcharts,
            userAgent,
            DataSet,
            Chart,
            SplitSeriesChart,
            PieChart,
            ScatterChart,
            BubbleChart,
            RadialGauge,
            HorizontalFillerGauge,
            VerticalFillerGauge,
            HorizontalMarkerGauge,
            VerticalMarkerGauge,
            parsingUtils
        ) {

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // support for push-state (SPL-64487)
    //
    // In Firefox, a local reference to another node (e.g. <g clip-path="url(#clipPathId)">) will break whenever a push-state
    // or replace-state action is taken (https://bugzilla.mozilla.org/show_bug.cgi?id=652991).
    //
    // We will hook in to the 'pushState' and 'replaceState' methods on the window.history object and fire an event to
    // notify any listeners that they need to update all local references in their SVG.

    if(userAgent.isFirefox()) {
        // this local reference to the window.history is vital, otherwise it can potentially be garbage collected
        // and our changes lost (https://bugzilla.mozilla.org/show_bug.cgi?id=593910)
        var history = window.history;
        _(['pushState', 'replaceState']).each(function(fnName) {
            var original = history[fnName];
            history[fnName] = function() {
                original.apply(history, arguments);
                // kind of hacky to use Highcharts as an event bus, but not sure what else to do
                $(Highcharts).trigger('baseUriChange');
            };
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // namespace-level methods

    // TODO [sff] does this really need to be a public method, or could it be called under the hood from prepare()?
    var extractChartReadyData = function(rawData) {
        if(!rawData || !rawData.fields || !rawData.columns) {
            throw new Error('The data object passed to extractChartReadyData did not contain fields and columns');
        }
        if(rawData.fields.length !== rawData.columns.length) {
            throw new Error('The data object passed to extractChartReadyData must have the same number of fields and columns');
        }
        return new DataSet(rawData);
    };

    var createChart = function(container, properties) {
        if(container instanceof $) {
            container = container[0];
        }
        if(!_(container).isElement()) {
            throw new Error("Invalid first argument to createChart, container must be a valid DOM element or a jQuery object");
        }
        properties = properties || {};
        var chartType = properties['chart'];
        if(chartType === 'pie') {
            return new PieChart(container, properties);
        }
        if(chartType === 'scatter') {
            return new ScatterChart(container, properties);
        }
        if(chartType === 'bubble') {
            return new BubbleChart(container, properties);
        }
        if(chartType === 'radialGauge') {
            return new RadialGauge(container, properties);
        }
        if(chartType === 'fillerGauge') {
            return (properties['chart.orientation'] === 'x') ?
                (new HorizontalFillerGauge(container, properties)) :
                (new VerticalFillerGauge(container, properties));
        }
        if(chartType === 'markerGauge') {
            return (properties['chart.orientation'] === 'x') ?
                (new HorizontalMarkerGauge(container, properties)) :
                (new VerticalMarkerGauge(container, properties));
        }
        // only the basic cartesian chart types (bar/column/line/area) support split-series mode
        return (parsingUtils.normalizeBoolean(properties['layout.splitSeries'])) ?
            (new SplitSeriesChart(container, properties)) :
            (new Chart(container, properties));
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // public interface

    return ({
        extractChartReadyData: extractChartReadyData,
        createChart: createChart
    });

});