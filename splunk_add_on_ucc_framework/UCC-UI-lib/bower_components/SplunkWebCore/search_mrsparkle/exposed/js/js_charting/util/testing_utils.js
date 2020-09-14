define([
            'jquery',
            'underscore',
            'splunk',
            './dom_utils'
        ],
        function(
            $,
            _,
            Splunk,
            domUtils
        ) {

    var getPointCoordinates = function(hcChart, seriesIndex, pointIndex) {
        var series = hcChart.series[seriesIndex],
            seriesType = series.type,
            point = series.data[pointIndex],
            containerOffset = $(hcChart.container).offset();

        if(seriesType in { line: true, area: true, scatter: true }) {
            // handle the chart overlay case for bar charts
            if(hcChart.inverted) {
                return ({
                    x: series.yAxis.translate(point.y) + containerOffset.left + hcChart.plotLeft,
                    y: hcChart.plotHeight + hcChart.plotTop + containerOffset.top - series.xAxis.translate(point.x)
                });
            }
            return ({
                x: point.plotX + containerOffset.left + hcChart.plotLeft,
                y: point.plotY + containerOffset.top + hcChart.plotTop
            });
        }
        if(seriesType === 'column') {
            var shapeArgs = point.shapeArgs;
            return ({
                x: point.plotX + containerOffset.left + hcChart.plotLeft,
                y: point.plotY + containerOffset.top + hcChart.plotTop + (shapeArgs.height / 2)
            });
        }
        if(seriesType === 'bar') {
            return ({
                x: containerOffset.left + hcChart.plotLeft + hcChart.plotWidth - point.shapeArgs.y - (point.shapeArgs.height / 2),
                y: containerOffset.top + hcChart.plotTop + hcChart.plotHeight - series.xAxis.translate(point.x) - (series.barW / 2) - series.pointXOffset
            });
        }
        if(seriesType === 'pie') {
            var centerX = series.center[0],
                centerY = series.center[1],
                labelX = point.labelPos[0],
                labelY = point.labelPos[1];

            return ({
                x: (centerX + labelX) / 2 + containerOffset.left + hcChart.plotLeft,
                y: (centerY + labelY) / 2 + containerOffset.top + hcChart.plotTop
            });
        }
        return {};
    };

    var initializeTestingMetaData = function(chartWrapper, xFields, type){
        chartWrapper.$container.addClass('highcharts-wrapper');
        // make sure the wrapper container has an id, this will be used in createGlobalReference
        if(!chartWrapper.$container.attr('id')) {
            chartWrapper.$container.attr('id', chartWrapper.id);
        }
        var chart = chartWrapper.hcChart;
        $(chart.container).addClass(type);
        addDataClasses(chart);
        addAxisClasses(chart);
        if(chart.options.legend.enabled) {
            addLegendClasses(chart);
        }
        if(chart.tooltip && chart.tooltip.refresh) {
            var tooltipRefresh = chart.tooltip.refresh,
                decorateTooltip = (_.find(xFields, function(field){ return (field === '_time'); }) === '_time') ?
                                        addTimeTooltipClasses : addTooltipClasses;

            chart.tooltip.refresh = function(point) {
                tooltipRefresh.call(chart.tooltip, point);
                decorateTooltip(chart);
            };
        }
        chart.getPointCoordinates = _(getPointCoordinates).bind(null, chart);
    };

    var addDataClasses = function(chart) {
        var seriesName,
            dataElements;

        $('.highcharts-series', $(chart.container)).each(function(i, series) {
            seriesName = chart.series[i].name;
            $(series).attr('id', seriesName + '-series');
            dataElements = $('rect, path', $(series));
            dataElements.each(function(j, elem) {
                addClassToElement(elem, 'spl-display-object');
            });
        });
    };

    var addAxisClasses = function(chart) {
        var labelElements, i;
        _(chart.xAxis).each(function(axis, i) {
            var className = chart.inverted ? 'vertical-axis' : 'horizontal-axis';
            addClassToElement(axis.axisGroup.element, className);
            addClassToElement(axis.labelGroup.element, className);
            addClassToElement(axis.gridGroup.element, 'x-axis-' + i + '-grid-group');
        });
        _(chart.yAxis).each(function(axis, i) {
            var className = chart.inverted ? 'horizontal-axis' : 'vertical-axis';
            addClassToElement(axis.axisGroup.element, className);
            addClassToElement(axis.labelGroup.element, className);
            addClassToElement(axis.gridGroup.element, 'y-axis-' + i + '-grid-group');
        });
        $('.highcharts-axis, .highcharts-axis-labels', $(chart.container)).each(function(i, elem) {
            labelElements = $('text', $(elem));
            labelElements.each(function(j, label) {
                addClassToElement(label, 'spl-text-label');
            });
        });

        var labelAxisTickmarks = function(axis) {
            _(axis.ticks).each(function(tick) {
                if(tick.mark && tick.mark.element) {
                    addClassToElement(tick.mark.element, 'highcharts-axis-tickmark');
                }
            });
        };

        for(i = 0; i < chart.xAxis.length; i++) {
            if(chart.xAxis[i].axisTitle) {
                addClassToElement(chart.xAxis[i].axisTitle.element, 'x-axis-title');
            }
            labelAxisTickmarks(chart.xAxis[i]);
        }
        for(i = 0; i < chart.yAxis.length; i++) {
            if(chart.yAxis[i].axisTitle) {
                addClassToElement(chart.yAxis[i].axisTitle.element, 'y-axis-title');
            }
            labelAxisTickmarks(chart.yAxis[i]);
        }
    };

    var addTooltipClasses = function(chart) {
        var i, loopSplit, loopKeyName, loopKeyElem, loopValElem, toolTipCells,
            $tooltip = $('.highcharts-tooltip'),
            tooltipElements = $('tr', $tooltip);

        for(i = 0; i < tooltipElements.length; i++) {
            toolTipCells = $('td', tooltipElements[i]);
            loopSplit = tooltipElements[i].textContent;
            $(toolTipCells[0]).addClass('key');
            $(toolTipCells[0]).addClass(sanitizeClassName(loopSplit[0] + '-key'));
            $(toolTipCells[1]).addClass('value');
            $(toolTipCells[1]).addClass(sanitizeClassName(loopSplit[0] + '-value'));
        }
    };
    
    var addTimeTooltipClasses = function(chart) {
        var that = this,
            i, loopSplit, loopKeyName, loopKeyElem, loopValElem, toolTipCells,
            $tooltip = $('.highcharts-tooltip'),
            tooltipElements = $('tr', $tooltip);
        
        for(i = 0; i < tooltipElements.length; i++) {
            toolTipCells = $('td', tooltipElements[i]);
            if(i===0){
                $(toolTipCells[0]).addClass('time-value');
                $(toolTipCells[0]).addClass('time');
            } else {
                loopSplit = tooltipElements[i].textContent.split(':');
                $(toolTipCells[0]).addClass('key');
                $(toolTipCells[0]).addClass(sanitizeClassName(loopSplit[0] + '-key'));
                $(toolTipCells[1]).addClass('value');
                $(toolTipCells[1]).addClass(sanitizeClassName(loopSplit[0] + '-value'));
            }
        }
    };

    var addLegendClasses = function(chart) {
        var that = this,
            loopSeriesName;

        if (chart.legend && chart.legend.down) {
            addClassToElement(chart.legend.down.element, 'page-down-button');
        }
        if (chart.legend && chart.legend.up) {
            addClassToElement(chart.legend.up.element, 'page-up-button');
        }
        $(chart.series).each(function(i, series) {
            if(!series.legendItem) {
                return;
            }
            loopSeriesName = series.legendItem.textStr;
            if(series.legendSymbol) {
                addClassToElement(series.legendSymbol.element, 'symbol');
                addClassToElement(series.legendSymbol.element, loopSeriesName + '-symbol');
            }
            if(series.legendLine) {
                addClassToElement(series.legendLine.element, 'symbol');
                addClassToElement(series.legendLine.element, loopSeriesName + '-symbol');
            }
            if(series.legendItem) {
                addClassToElement(series.legendItem.element, 'legend-label');
            }
        });
    };

    var addClassToElement = function(elem, className) {
        if (!elem) {
            return;
        }
        className = sanitizeClassName(className);
        if(className === '') {
            return;
        }
        if(elem.className.baseVal) {
            elem.className.baseVal += " " + className;
        }
        else {
            elem.className.baseVal = className;
        }
    };

    var sanitizeClassName = function(className) {
        // the className can potentially come from the search results, so make sure it is valid before
        // attempting to insert it...

        // first remove any leading white space
        className = className.replace(/\s/g, '');
        // if the className doesn't start with a letter or a '-' followed by a letter, it should not be inserted
        if(!/^[-]?[A-Za-z]/.test(className)) {
            return '';
        }
        // now filter out anything that is not a letter, number, '-', or '_'
        return className.replace(/[^A-Za-z0-9_-]/g, "");
    };

    //////////////////////////
    // Gauge specific testing

    var gaugeAddTestingMetadata = function(gaugeWrapper, elements, typeName, value) {
        // make sure the wrapper container has an id, this will be used in createGlobalReference
        if(!gaugeWrapper.$container.attr('id')) {
            gaugeWrapper.$container.attr('id', gaugeWrapper.id);
        }
        var innerContainer = gaugeWrapper.$hcContainer;
        innerContainer.addClass(typeName);
        gaugeUpdate(innerContainer, value);
        if(elements.valueDisplay) {
            addClassToElement(elements.valueDisplay.element, 'gauge-value');
        }
        var key;
        for(key in elements) {
            if(/^tickLabel_/.test(key)) {
                addClassToElement(elements[key].element, 'gauge-tick-label');
            }
        }
        for(key in elements) {
            if(/^colorBand/.test(key)){
                addClassToElement(elements[key].element, 'gauge-color-band');
            }
        }
        $('.gauge-color-band').each(function() {
            $(this).attr('data-band-color', $(this).attr('fill'));
        });

        // this is bad OOP but I think it's better to keep all of this code in one method
        if(elements.fill){
            $(elements.fill.element).attr('data-indicator-color', $(elements.fill.element).attr('fill'));
        }
        if(elements.needle) {
            addClassToElement(elements.needle.element, 'gauge-indicator');
        }
        if(elements.markerLine) {
            addClassToElement(elements.markerLine.element, 'gauge-indicator');
        }
    };

    var gaugeUpdate = function(container, value){
        container.attr('data-gauge-value', value);
    };

    var createGlobalReference = function(wrapperObject, chartObject) {
        Splunk.JSCharting = Splunk.JSCharting || {};
        Splunk.JSCharting.chartByIdMap = Splunk.JSCharting.chartByIdMap || {};
        var id = wrapperObject.$container.attr('id');
        Splunk.JSCharting.chartByIdMap[id] = chartObject;
    };

    return ({

        initializeTestingMetaData: initializeTestingMetaData,
        gaugeAddTestingMetadata: gaugeAddTestingMetadata,
        gaugeUpdate: gaugeUpdate,
        createGlobalReference: createGlobalReference,
        getPointCoordinates: getPointCoordinates

    });

});
