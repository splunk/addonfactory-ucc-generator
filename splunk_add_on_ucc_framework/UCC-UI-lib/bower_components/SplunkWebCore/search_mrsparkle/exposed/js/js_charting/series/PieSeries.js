define([
            'jquery',
            'underscore',
            './Series',
            './ManyShapeSeries',
            '../util/lang_utils',
            '../util/parsing_utils',
            '../util/time_utils',
            'util/time',
            'splunk.i18n'
        ], 
        function(
            $,
            _,
            Series,
            ManyShapeSeries,
            langUtils,
            parsingUtils,
            timeUtils,
            splunkTimeUtils,
            i18n
        ) {

    var PieSeries = function(properties) {
        ManyShapeSeries.call(this, properties);
    };
    langUtils.inherit(PieSeries, ManyShapeSeries);

    $.extend(PieSeries.prototype, {

        UNHIGHLIGHTED_OPACITY: 1,
        UNHIGHLIGHTED_BASE_COLOR: 'rgb(225, 225, 225)',

        CHARTING_PROPERTY_WHITELIST: _.union(
            ['sliceCollapsingThreshold', 'sliceCollapsingLabel', 'showPercent'],
            ManyShapeSeries.prototype.CHARTING_PROPERTY_WHITELIST
        ),

        type: 'pie',
        hasPrettyData: false,

        fieldList: [],

        processProperties: function() {
            this.collapseFieldName = this.properties.sliceCollapsingLabel || 'other';
            this.collapsePercent = 0.01; 
            if (this.properties.hasOwnProperty('sliceCollapsingThreshold') ){
                var collapsePercentInput = parseFloat(this.properties.sliceCollapsingThreshold);
                if (collapsePercentInput >= 0 && collapsePercentInput <=1){
                    this.collapsePercent = collapsePercentInput;
                }  
            }
        },

        getConfig: function() {
            return $.extend(ManyShapeSeries.prototype.getConfig.call(this), {
                translatePreHook: _(this.translatePreHook).bind(this)
            });
        },

        setData: function(inputData) {
            var oldData = this.data;
            this.data = [];
            this.prettyData = [];
            var that = this,
                nameSeries = inputData.names,
                sizeSeries = inputData.sizes,
                spanSeries = inputData.spans,
                isTimeBased = inputData.isTimeBased,
                totalSize = _(sizeSeries).reduce(function(sum, value) { return (sum + value); }, 0),
                cardinality = sizeSeries.length,
                collapsedSize = 0,
                numCollapsed = 0,
                numLessThanThresh = 0,
                granularity = null,

                passesThreshold = function(value) {
                    return (value > 0 && (value / totalSize) > that.collapsePercent);
                };

            if(isTimeBased) {
                granularity = splunkTimeUtils.determineLabelGranularity(nameSeries);
                this.hasPrettyData = true;
            }

            this.fieldList = _(nameSeries).map(parsingUtils.escapeSVG, parsingUtils);
            _(sizeSeries).each(function(value, i) {
                if(!(passesThreshold(sizeSeries[i]))) {
                    numLessThanThresh++;
                }
            }, this);

            _(nameSeries).each(function(name, i) {
                var sizeValue = sizeSeries[i];
                if(passesThreshold(sizeValue) || numLessThanThresh === 1 || cardinality <=10) {                    
                    if(isTimeBased) {
                        var bdTime = splunkTimeUtils.extractBdTime(name),
                            humanizedName = timeUtils.formatBdTimeAsAxisLabel(bdTime, null, granularity).join(' '),
                            spanValue = spanSeries[i];
                        this.data.push([name, sizeValue, spanValue]);
                        this.prettyData.push([humanizedName, sizeValue, spanValue]);
                    }
                    else {
                        this.data.push([name, sizeValue]);
                    }
                }
                else {
                    collapsedSize += sizeValue;
                    numCollapsed++;
                    this.fieldList = _(this.fieldList).without(name);
                }
            }, this);

            if(numCollapsed > 0) {
                var collapsedName = this.collapseFieldName + ' (' + numCollapsed + ')';
                this.data.push([collapsedName, collapsedSize]);
                // Doesn't make sense to attach a span value to the collapsed section
                this.prettyData.push([collapsedName, collapsedSize, null]);
                this.fieldList.push('__other');
            }

            if(!_.isEqual(this.data, oldData)) {
                this._dataIsDirty = true;
            }
        },

        getFieldList: function() {
            return this.fieldList;
        },

        // returns the series data after any processing (like slice collapsing) has been applied
        getData: function() {
            return this.data;
        },

        getPrettyData: function() {
            return this.prettyData;
        },

        highlightPoint: function(hcPoint) {
            if(!hcPoint.graphic) {
                return;
            }
            var pointColor = hcPoint.color;
            hcPoint.graphic.attr({
                'fill': pointColor,
                'stroke-width': 0,
                'stroke': pointColor
            });
        },

        getTooltipRows: function(info) {
            return ([
                [info.sliceFieldName, info.sliceName],
                [{ text: info.seriesName, color: info.sliceColor }, info.yValue],
                [{ text: info.seriesName + "%", color: info.sliceColor }, info.yPercent]
            ]);
        },

        /**
         * @author sfishel
         *
         * Dynamically adjust the pie size based on the height and width of the container.
         * If labels are showing, don't allow it to take up more than one third of the width.
         */

        translatePreHook: function(pieSeries) {
            var chart = pieSeries.chart;
            if(pieSeries.options.dataLabels.enabled) {
                pieSeries.options.size = Math.min(chart.plotHeight * 0.75, chart.plotWidth / 3);
            }
            else {
                pieSeries.options.size = Math.min(chart.plotHeight * 0.75, chart.plotWidth * 0.75);
            }
        }

    });
    
    return PieSeries;
    
});