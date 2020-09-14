define(['underscore', 'helpers/user_agent', 'splunk.util'], function(_, userAgent, splunkUtils) {

    var normalizeLimitAmount = function(limitValue) {
        return parseInt(limitValue, 10) || Infinity;
    };

    var VISIBLE_FIELD_REGEX = /^[^_]|^_time/,
        MAX_SERIES = normalizeLimitAmount(splunkUtils.getConfigValue('JSCHART_SERIES_LIMIT', 100)),
        DEFAULT_TRUNCATION_LIMIT = 50000,
        MAX_POINTS = (function() {
            var crossBrowserLimit = splunkUtils.getConfigValue('JSCHART_TRUNCATION_LIMIT', DEFAULT_TRUNCATION_LIMIT);
            if(crossBrowserLimit !== null) {
                return normalizeLimitAmount(crossBrowserLimit);
            }

            if(userAgent.isFirefox()) {
                return normalizeLimitAmount(splunkUtils.getConfigValue('JSCHART_TRUNCATION_LIMIT_FIREFOX', DEFAULT_TRUNCATION_LIMIT));
            }
            if(userAgent.isSafari()) {
                return normalizeLimitAmount(splunkUtils.getConfigValue('JSCHART_TRUNCATION_LIMIT_SAFARI', DEFAULT_TRUNCATION_LIMIT));
            }
            if(userAgent.isIE11()) {
                return normalizeLimitAmount(splunkUtils.getConfigValue('JSCHART_TRUNCATION_LIMIT_IE11', DEFAULT_TRUNCATION_LIMIT));
            }
            // if the user agent didn't match any of the above, treat it as Chrome
            return normalizeLimitAmount(splunkUtils.getConfigValue('JSCHART_TRUNCATION_LIMIT_CHROME', DEFAULT_TRUNCATION_LIMIT));
        }());

    // sort of a "catch-all" method for adding display properties based on the data set and the web.conf config
    // this method is used by consumers of the JSCharting library to share custom logic that doesn't belong
    // in the library itself
    var getCustomDisplayProperties = function(chartData, webConfig) {
        webConfig = webConfig || {};
        var customProps = {};
        if(webConfig['JSCHART_TEST_MODE']) {
            customProps.testMode = true;
        }

        if(chartData.hasField('_tc')) {
            customProps.fieldHideList = ['percent'];
        }
        return customProps;
    };

    var sliceResultsToSeriesLength = function(rawData, length) {
        var sliced = {
            fields: rawData.fields,
            columns: []
        };

        _(rawData.columns).each(function(column, i) {
            sliced.columns[i] = column.slice(0, length);
        });

        return sliced;
    };

    var fieldIsVisible = function(field) {
        var fieldName = _.isString(field) ? field : field.name;
        return VISIBLE_FIELD_REGEX.test(fieldName);
    };

    // pre-process chart data, truncating either the number of series or the number of points per series
    // default truncation constants are defined above, though a custom limit for total number of points can be
    // passed in as part of the display properties
    var preprocessChartData = function(rawData, displayProperties) {
        if(rawData.columns.length === 0 || rawData.columns[0].length === 0) {
            return rawData;
        }
        var chartType = displayProperties.chart || 'column';
        if(chartType in { pie: true, scatter: true, radialGauge: true, fillerGauge: true, markerGauge: true }) {
            return rawData;
        }

        if(rawData.fields.length >= MAX_SERIES) {
            var spanColumn,
                normalizedFields = _(rawData.fields).map(function(field) {
                    return _.isString(field) ? field : field.name;
                }),
                spanIndex = _(normalizedFields).indexOf('_span');

            if(spanIndex > -1 && spanIndex >= MAX_SERIES) {
                spanColumn = rawData.columns[spanIndex];
            }

            // slice the number of series
            rawData = {
                columns: rawData.columns.slice(0, MAX_SERIES),
                fields: rawData.fields.slice(0, MAX_SERIES)
            };

            // if our slicing removed _span, put it back
            if(spanColumn) {
                rawData.columns.push(spanColumn);
                rawData.fields.push('_span');
            }
        }

        var perChartLimit = parseInt(displayProperties['chart.resultTruncationLimit'], 10) || parseInt(displayProperties['resultTruncationLimit'], 10),
            truncationLimit = perChartLimit > 0 ? perChartLimit : MAX_POINTS,
            visibleFields = _(rawData.fields).filter(fieldIsVisible),
            numDataSeries = visibleFields.length - 1, // subtract one because the first field is the x-axis
            pointsPerSeries = rawData.columns[0].length,
            // numSeries is guaranteed not to be zero based on the first check in this method
            allowedPointsPerSeries =  Math.floor(truncationLimit / numDataSeries);

        if(pointsPerSeries > allowedPointsPerSeries) {
            return sliceResultsToSeriesLength(rawData, allowedPointsPerSeries);
        }
        return rawData;
    };

    return ({

        getCustomDisplayProperties: getCustomDisplayProperties,
        preprocessChartData: preprocessChartData,

        // these functions are FOR TESTING ONLY
        getSeriesLimit: function() { return MAX_SERIES; },
        setSeriesLimit: function(limit) { MAX_SERIES = limit; },
        getTruncationLimit: function () { return MAX_POINTS; },
        setTruncationLimit: function(limit) { MAX_POINTS = limit; }

    });
});
