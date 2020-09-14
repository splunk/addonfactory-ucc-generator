
define([
            'jquery',
            'underscore',
            'highcharts',
            '../Visualization',
            '../../components/ColorPalette',
            '../../components/axes/TimeAxis',
            '../../components/axes/CategoryAxis',
            '../../components/axes/NumericAxis',
            '../../components/Legend',
            '../../components/Tooltip',
            '../../components/SelectionWindow',
            '../../components/PanButtons',
            '../../components/ZoomOutButton',
            '../../helpers/HoverEventThrottler',
            '../../components/CartesianDataLabels',
            '../../series/series_factory',
            'splunk.util',
            '../../util/lang_utils',
            '../../util/testing_utils',
            '../../util/parsing_utils',
            '../../util/color_utils',
            '../../util/time_utils',
            '../../util/dom_utils',
            '../../util/async_utils',
            'util/string_utils',
            'helpers/user_agent',
            'util/console'
       ],
       function(
           $,
           _,
           Highcharts,
           Visualization,
           ColorPalette,
           TimeAxis,
           CategoryAxis,
           NumericAxis,
           Legend,
           Tooltip,
           SelectionWindow,
           PanButtons,
           ZoomOutButton,
           HoverEventThrottler,
           CartesianDataLabels,
           seriesFactory,
           splunkUtils,
           langUtils,
           testingUtils,
           parsingUtils,
           colorUtils,
           timeUtils,
           domUtils,
           asyncUtils,
           string_utils,
           userAgent,
           console
       ) {

    var Chart = function(container, properties) {
        Visualization.call(this, container, properties);
    };
    langUtils.inherit(Chart, Visualization);

    $.extend(Chart.prototype, {

        HOVER_DELAY: 160,
        EXPORT_WIDTH: 600,
        EXPORT_HEIGHT: 400,
        FALLBACK_HEIGHT: 250,
        FALLBACK_WIDTH: 600,

        PROGRESSIVE_DRAW_THRESHOLD: userAgent.isIELessThan(9) ? 100 : 1000,

        hasLegend: true,
        hasTooltip: true,
        hasXAxis: true,
        hasYAxis: true,

        requiresExternalColors: true,
        externalPaletteMapping: {},
        externalPaletteSize: 0,

        prepare: function(dataSet, properties) {
            this.benchmark('Prepare Started');
            var wasEmpty = this.isEmpty();
            var hadTimeXAxis = this.hasTimeXAxis();
            Visualization.prototype.prepare.call(this, dataSet, properties);
            if (this.showLabels === "all" || this.showLabels === "minmax") {
                this.initializeDataLabels();
            }
            this.initializeFields();
            this.isiOS = userAgent.isiOS();
            var isEmpty = this.isEmpty();
            var hasTimeXAxis = this.hasTimeXAxis();
            if(isEmpty !== wasEmpty || hadTimeXAxis !== hasTimeXAxis) {
                this._isDirty = true;
            }
            if(this.shouldUpdateInPlace()) {
                this.updateSeriesProperties();
                this.updateAxisProperties();
                if(!isEmpty) {
                    this.setAllSeriesData();
                }
            }
            else {
                if(!isEmpty) {
                    this.initializeColorPalette();
                }
                this.initializeSeriesList();
                // Determine orientation based on the chart type, not the series types (SPL-86199).
                this.axesAreInverted = this.type === 'bar';
                if(this.hasXAxis) {
                    this.initializeXAxisList();
                }
                if(this.hasYAxis) {
                    this.initializeYAxisList();
                }
                if(isEmpty) {
                    if(this.legend) {
                        this.legend.destroy();
                        this.legend = null;
                    }
                    if(this.tooltip) {
                        this.tooltip.destroy();
                        this.tooltip = null;
                    }
                }
                else {
                    if(this.hasLegend) {
                        this.initializeLegend();
                    }
                    if(this.hasTooltip) {
                        this.initializeTooltip();
                    }
                    this.setAllSeriesData();
                    this.bindSeriesEvents();
                }
            }
        },

        initializeDataLabels: function() {
            this.dataLabels = new CartesianDataLabels({showLabels: this.showLabels, splitSeries: this.splitSeries });
        },

        getFieldList: function() {
            return _(this.seriesList).chain().invoke('getFieldList').flatten(true).compact().value();
        },
        
        setExternalColorPalette: function(fieldIndexMap, paletteTotalSize) {
            this.externalPaletteMapping = $.extend({}, fieldIndexMap);
            this.externalPaletteSize = paletteTotalSize;
        },

        handleDraw: function(callback) {
            console.debug('drawing a chart with dimensions:', { width: this.width, height: this.height });
            console.debug('drawing a chart with properties:', this.properties);
            console.debug('drawing a chart with data:', this.dataSet.toJSON());
            this.benchmark('Draw Started');
            this.applyColorPalette();
            // if there is already a draw in progress, cancel it
            this.cancelPendingDraw();

            if(this.shouldUpdateInPlace()) {
                this.redrawInPlace(callback);
                return;
            }

            this.hcConfig = this.getConfig();
            console.debug('config object to be sent to highcharts:', this.hcConfig);
            if(this.hcChart) {
                this.destroy();
                this.bindSeriesEvents();
                if(this.legend) {
                    this.bindLegendEvents();
                }
            }
            if(this.shouldProgressiveDraw()) {
                this.hcConfig.firstRenderOverride = _(this.firstRenderOverride).bind(this);
                this.hcConfig.renderOverride = _(this.renderOverride).bind(this);
            }
            var that = this;
            new Highcharts.Chart(this.hcConfig, function(chart) {
                that.hcChart = chart;
                if(that.testMode) {
                    testingUtils.initializeTestingMetaData(that, that.xFields, that.getClassName());
                    testingUtils.createGlobalReference(that, chart);
                }
                // this event is actually coming from the push state listener in js_charting/js_charting.js
                // we are just using the Highcharts object as a shared event bus
                $(Highcharts).on('baseUriChange.' + that.id, function() {
                    that.$container.find('[clip-path]').each(function() {
                        // just need to unset and reset the clip-path to force a refresh with the new base URI
                        var $this = $(this),
                            clipPath = $this.attr('clip-path');

                        $this.removeAttr('clip-path');
                        $this.attr('clip-path', clipPath);
                    });
                });

                that.addEventHandlers(chart);
                that.onChartLoad(chart);
                that.onChartLoadOrRedraw(chart);
                if(that.hasTooltip && !that.isEmpty()) {
                    that.enableTooltip(chart);
                }
                that.cacheDrawnDimensions();
                that.benchmark('Draw Finished');
                callback(that, that.benchmarks);
                // DEBUGGING
                // window.chart = that
            });
        },

        redrawInPlace: function(callback) {
            console.log('in place redraw!');
            if(!this.hcChart) {
                throw new Error('Cannot call redrawInPlace if chart does not already exist');
            }

            // redraw all series in the list
            _(this.seriesList).invoke('redraw', false);
            var existingChartSeries = this.hcChart.series,
                incomingSeriesConfigs = this.getSeriesConfigList();

            // if there are more existing series than incoming, remove the extras
            if(existingChartSeries.length > incomingSeriesConfigs.length) {
                _(existingChartSeries.slice(incomingSeriesConfigs.length)).invoke('remove', false);
            }
            // if there are more incoming series than existing, add the new ones
            else if(existingChartSeries.length < incomingSeriesConfigs.length) {
                _(incomingSeriesConfigs.slice(existingChartSeries.length)).each(function(seriesConfig) {
                    this.hcChart.addSeries(seriesConfig, false, false);
                }, this);
            }

            var preUpdateExtremes, postUpdateExtremes,
                xAxis = this.xAxisList[0],
                axisWasZoomed = xAxis.isZoomed;

            if(axisWasZoomed) {
                preUpdateExtremes = this.hcChart.xAxis[0].getExtremes();
                preUpdateExtremes.max -= (xAxis.hasTickmarksBetween() ? 0 : 1);
            }
            else if(this.selectionWindow) {
                preUpdateExtremes = this.selectionWindow.getExtremes();
                preUpdateExtremes.min += (xAxis.hasTickmarksBetween() ? 1 : 0);
            }
            if(preUpdateExtremes) {
                postUpdateExtremes = this.calculatePostUpdateExtremes(preUpdateExtremes);
            }
            // redraw the axes
            _(this.xAxisList).invoke('redraw', false);
            _(this.yAxisList).invoke('redraw', false);
            if(axisWasZoomed) {
                if(postUpdateExtremes.min === null || postUpdateExtremes.max === null) {
                    this.hcChart.xAxis[0].zoom();
                }
                else {
                    postUpdateExtremes.max += (xAxis.hasTickmarksBetween() ? 0 : 1);
                    this.hcChart.xAxis[0].zoom(postUpdateExtremes.min, postUpdateExtremes.max);
                }
            }
            else if(this.selectionWindow) {
                if(postUpdateExtremes.max === null) {
                    this.selectionWindow.destroy();
                    this.selectionWindow = null;
                }
                else {
                    postUpdateExtremes.min = (postUpdateExtremes.min || 0) - (xAxis.hasTickmarksBetween() ? 1 : 0);
                    this.selectionWindow.setExtremes(postUpdateExtremes);
                }
            }

            // force Highcharts to redraw
            this.hcChart.redraw();
            this.benchmark('Series Redraw Finished');
            callback(this, this.benchmarks);
        },

        cancelPendingDraw: function() {
            if(this.pendingDraw && this.pendingDraw.state() === 'pending') {
                this.pendingDraw.cancel();
                // TODO [sff] do we need to do anything with the deferred that draw() returned? currently it just stays pending
            }
        },

        setSize: function(width, height) {
            if(!this.hcChart) {
                return;
            }
            var xAxis = this.hcChart.xAxis[0];
            // SPL-80149: userMin and userMax should always be set if chart is zoomed
            if(xAxis && this.xAxisList[0].isZoomed){
                xAxis.userMin = xAxis.userMin || xAxis.oldUserMin;
                xAxis.userMax = xAxis.userMax || xAxis.oldUserMax;
            }
            this.hcChart.setSize(width, height, false);
            this.cacheDrawnDimensions();
        },

        destroy: function() {
            this.cancelPendingDraw();
            if(this.hcChart) {
                this.onChartDestroy();
                // SPL-85851, for some reason the default Highcharts destroy routine does not remove listeners added
                // by the Pointer object, so we explicitly remove them here.
                if(this.hcChart.pointer) {
                    this.hcChart.pointer.reset();
                }
                this.hcChart.destroy();
                this.hcChart = null;
            }
        },

        getSVG: function() {
            var chart = this.hcChart;
            if(this.hcConfig.legend.enabled) {
                if(this.exportMode && chart.type !== 'scatter') {
                    $(chart.series).each(function(i, loopSeries) {
                        if(!loopSeries.legendSymbol) {
                            return false;
                        }
                        loopSeries.legendSymbol.attr({
                            height: 8,
                            translateY: 4
                        });
                    });
                }
                if(chart.legend.nav) {
                    chart.legend.nav.destroy();
                }
            }

            $(chart.series).each(function(i, loopSeries) {
                // If the area has been set to zero opacity, just remove the element entirely (SPL-80429 and SPL-84442).
                if(loopSeries.area && colorUtils.getComputedOpacity(loopSeries.area) === 0) {
                    loopSeries.area.destroy();
                    delete loopSeries.area;
                }
            });
            var $svg = $('.highcharts-container').find('svg');
            $svg.siblings().remove();
            $svg.find('.highcharts-tracker').remove();

            // SPL-65745, remove the clip path that is being applied to the legend, or it will cause labels to be hidden
            $svg.find('.highcharts-legend g[clip-path]').each(function() {
                $(this).removeAttr('clip-path');
            });

            return $svg.parent().html();
        },

        /////////////////////////////////////////////////////////////////////////////////////////
        // [end of public interface]

        processProperties: function() {
            Visualization.prototype.processProperties.call(this);

            // handle enabling chart/legend clicks, there are an annoying number of different ways to specify this
            // the "drilldown" property trumps all others
            if(this.properties.hasOwnProperty('drilldown')) {
                this.chartClickEnabled = this.legendClickEnabled = this.properties['drilldown'] === 'all';
            }
            else {
                if(this.properties.hasOwnProperty('chart.clickEnabled')) {
                    this.chartClickEnabled = parsingUtils.normalizeBoolean(this.properties['chart.clickEnabled']);
                }
                else {
                    this.chartClickEnabled = parsingUtils.normalizeBoolean(this.properties['enableChartClick']);
                }
                if(this.properties.hasOwnProperty('chart.legend.clickEnabled')) {
                    this.legendClickEnabled = parsingUtils.normalizeBoolean(this.properties['chart.legend.clickEnabled']);
                }
                else {
                    this.legendClickEnabled = parsingUtils.normalizeBoolean(this.properties['enableLegendClick']);
                }
            }

            if(this.properties['legend.placement'] === 'none') {
                this.hasLegend = false;
            }

            if(this.hasXAxis || this.hasYAxis) {
                this.axisColorScheme = {
                    'axis.foregroundColorSoft': this.axisColorSoft,
                    'axis.foregroundColorSofter': this.axisColorSofter,
                    'axis.fontColor': this.fontColor
                };
            }
            if(this.properties.hasOwnProperty('legend.masterLegend') &&
                    (!this.properties['legend.masterLegend'] || $.trim(this.properties['legend.masterLegend']) === 'null')) {
                this.requiresExternalColors = false;
            }
            this.stackMode = this.properties['chart.stackMode'] || 'default';
            this.legendLabels = parsingUtils.stringToArray(this.properties['legend.labels'] || '[]');
            this.showHideMode = this.properties['data.fieldListMode'] === 'show_hide';
            this.fieldHideList = _.union(
                this.properties['fieldHideList'] || [],
                parsingUtils.stringToArray(this.properties['data.fieldHideList']) || []
            );
            this.fieldShowList = parsingUtils.stringToArray(this.properties['data.fieldShowList']) || [];

            var seriesColorsSetting = this.properties['chart.seriesColors'] || this.properties['seriesColors'];
            this.seriesColors = parsingUtils.stringToHexArray(seriesColorsSetting) || null;
            var fieldColorsSetting = this.properties['chart.fieldColors'] || this.properties['fieldColors'];
            this.internalFieldColors = parsingUtils.stringToHexObject(fieldColorsSetting || '{}');

            this.overlayFields = splunkUtils.stringToFieldList(this.properties['chart.overlayFields']);

            this.seriesTypeMapping = {};
            _(this.overlayFields).each(function(field) {
                this.seriesTypeMapping[field] = 'line';
            }, this);

            this.yAxisMapping = {};
            var secondYAxis = parsingUtils.normalizeBoolean(this.properties['axisY2.enabled']);
            if(secondYAxis) {
                var secondYAxisFields = this.properties['axisY2.fields'] ?
                                        splunkUtils.stringToFieldList(this.properties['axisY2.fields']) : this.overlayFields;

                _(secondYAxisFields).each(function(field) {
                    this.yAxisMapping[field] = 1;
                }, this);
            }
            this.enableAnimation = parsingUtils.normalizeBoolean(this.properties['enableAnimation'], false);
            
            var zoomTypes = ['x', 'y', 'xy', 'off'];
            if(_(zoomTypes).indexOf(this.properties['zoomType']) !== -1){
                this.zoomType = this.properties['zoomType'];
            }
            this.showLabels = this.properties['chart.showDataLabels'];
            if (typeof this.showLabels === "undefined") {
                this.showLabels = "none";
            }

            this.splitSeries = parsingUtils.normalizeBoolean(this.properties['layout.splitSeries'], false);
        },

        firstRenderOverride: function(chart) {
            // make this reference available here for testing
            this.hcChart = chart;

            var adapter = window.HighchartsAdapter,
                options = chart.options,
                callback = chart.callback;

            // BEGIN: copied from Highcharts source Chart#firstRender

            // Check whether the chart is ready to render
            if (!chart.isReadyToRender()) {
                return;
            }

            // Create the container
            chart.getContainer();

            // Run an early event after the container and renderer are established
            adapter.fireEvent(chart, 'init');


            chart.resetMargins();
            chart.setChartSize();

            // Set the common chart properties (mainly invert) from the given series
            chart.propFromSeries();

            // get axes
            chart.getAxes();

            // Initialize the series
            adapter.each(options.series || [], function (serieOptions) {
                chart.initSeries(serieOptions);
            });

            chart.linkSeries();

            // Run an event after axes and series are initialized, but before render. At this stage,
            // the series data is indexed and cached in the xData and yData arrays, so we can access
            // those before rendering. Used in Highstock.
            adapter.fireEvent(chart, 'beforeRender');

            // depends on inverted and on margins being set
            chart.pointer = new Highcharts.Pointer(chart, options);

            // MODIFIED: treat render() an asynchronous method
            chart.render(function() {

                // RESUME: remainder of Highcharts Chart#firstRender source code

                // add canvas
                chart.renderer.draw();
                // run callbacks
                if (callback) {
                    callback.apply(chart, [chart]);
                }
                adapter.each(chart.callbacks, function (fn) {
                    fn.apply(chart, [chart]);
                });


                // If the chart was rendered outside the top container, put it back in
                chart.cloneRenderTo(true);

                adapter.fireEvent(chart, 'load');

                // END: Highcharts Chart#firstRender source code
            });
        },

        renderOverride: function(chart, callback) {
            var adapter = window.HighchartsAdapter,
                axes = chart.axes,
                renderer = chart.renderer,
                options = chart.options;

            // BEGIN: copied from Highcharts source Chart#render
            var labels = options.labels,
                credits = options.credits,
                creditsHref;

            // Title
            chart.setTitle();


            // Legend
            chart.legend = new Highcharts.Legend(chart, options.legend);

            chart.getStacks(); // render stacks

            // Get margins by pre-rendering axes
            // set axes scales
            adapter.each(axes, function (axis) {
                axis.setScale();
            });

            chart.getMargins();

            chart.maxTicks = null; // reset for second pass
            adapter.each(axes, function (axis) {
                axis.setTickPositions(true); // update to reflect the new margins
                axis.setMaxTicks();
            });
            chart.adjustTickAmounts();
            chart.getMargins(); // second pass to check for new labels


            // Draw the borders and backgrounds
            chart.drawChartBox();


            // Axes
            if (chart.hasCartesianSeries) {
                adapter.each(axes, function (axis) {
                    axis.render();
                });
            }

            // The series
            if (!chart.seriesGroup) {
                chart.seriesGroup = renderer.g('series-group')
                    .attr({ zIndex: 3 })
                    .add();
            }

            // MODIFIED: use an async loop to draw the series, body of iterator is the same as Highcharts source
            this.pendingDraw = asyncUtils.asyncEach(chart.series, function(serie) {
                serie.translate();
                serie.setTooltipPoints();
                serie.render();
            });

            this.pendingDraw.done(function() {

                // RESUME: remainder of Highcharts Chart#render source code

                // Labels
                if (labels.items) {
                    adapter.each(labels.items, function (label) {
                        var style = adapter.extend(labels.style, label.style),
                            x = adapter.pInt(style.left) + chart.plotLeft,
                            y = adapter.pInt(style.top) + chart.plotTop + 12;

                        // delete to prevent rewriting in IE
                        delete style.left;
                        delete style.top;

                        renderer.text(
                            label.html,
                            x,
                            y
                        )
                        .attr({ zIndex: 2 })
                        .css(style)
                        .add();

                    });
                }

                // Credits
                if (credits.enabled && !chart.credits) {
                    creditsHref = credits.href;
                    chart.credits = renderer.text(
                        credits.text,
                        0,
                        0
                    )
                    .on('click', function () {
                        if (creditsHref) {
                            window.location.href = creditsHref;
                        }
                    })
                    .attr({
                        align: credits.position.align,
                        zIndex: 8
                    })
                    .css(credits.style)
                    .add()
                    .align(credits.position);
                }

                // Set flag
                chart.hasRendered = true;

                // END: Highcharts Chart#render source

                callback();
            });
        },

        //////////////////////////////////////////////////////////////////////////////////////////////
        // methods for initializing chart components

        initializeFields: function() {
            // TODO: this is where user settings could determine the x-axis field(s)

            var allDataFields = this.dataSet.allDataFields();

            this.xFields = [allDataFields[0]];

            if(this.isRangeSeriesMode()) {
                var rangeConfig = this.getRangeSeriesConfig();
                _(rangeConfig).each(function(configEntry) {
                    allDataFields = _(allDataFields).without(configEntry.lower, configEntry.upper);
                });
            }
            //push overlay fields to end of yFields array so that they render in front
            this.yFields = _(allDataFields).difference(this.xFields);

            var fieldWhiteList = $.extend([], this.fieldShowList),
                fieldBlackList = $.extend([], this.fieldHideList),
                intersection = _.intersection(fieldWhiteList, fieldBlackList);

            if(this.showHideMode) {
                fieldBlackList = _.difference(fieldBlackList, intersection);
            }
            else {
                fieldWhiteList = _.difference(fieldWhiteList, intersection);
            }

            this.yFields = _.difference(this.yFields, fieldBlackList);
            if(fieldWhiteList.length > 0) {
                this.yFields = _.intersection(this.yFields, fieldWhiteList);
            }
            // handle the user-specified legend labels
            if(this.yFields.length > 0 && this.legendLabels.length > 0) {
                this.yFields = _.union(this.legendLabels, this.yFields);
            }

        },

        isEmpty: function() {
            return (!this.yFields || this.yFields.length === 0);
        },

        hasTimeXAxis: function() {
            return _(this.xFields || []).any(this.seriesIsTimeBased, this);
        },

        shouldProgressiveDraw: function() {
            if(this.isEmpty()) {
                return false;
            }
            var totalPoints = this.yFields.length * this.dataSet.getSeries(this.yFields[0]).length;
            return totalPoints > this.PROGRESSIVE_DRAW_THRESHOLD;
        },

        shouldUpdateInPlace: function() {
            return this.hcChart && !this.isDirty();
        },

        initializeColorPalette: function() {
            this.colorPalette = new ColorPalette(this.seriesColors);
        },

        initializeSeriesList: function() {
            this.seriesList = _(this.initializeSeriesPropertiesList()).map(function(properties) {
                return seriesFactory.create(properties);
            });
        },

        updateSeriesProperties: function() {
            var propsList = this.initializeSeriesPropertiesList(),
                reinitializeSeriesList = false;
            
            //compare the type of every series from seriesList with the propsList
            //if there is at least one mismatch then re-initialize the seriesList
            _.each(this.seriesList, function(series, i) {
                if(propsList[i] && series.getType() != propsList[i].type) {
                    reinitializeSeriesList = true;
                }
            });

            if(!reinitializeSeriesList) {
                // if there are more existing series that in the props list, loop through and remove the extras
                // while updating the remaining ones
                if(this.seriesList.length > propsList.length) {
                    this.seriesList = _(this.seriesList).filter(function(series, i) {
                        if(i >= propsList.length) {
                            series.destroy();
                            return false;
                        }
                        series.update(propsList[i]);
                        return true;
                    }, this);
                }
                // if there are less existing series than in the props list (or the same amount),
                // loop through and create the new ones while updating the existing ones
                else if(this.seriesList.length <= propsList.length) {
                    
                    this.seriesList = _(propsList).map(function(props, i) {
                        if(i < this.seriesList.length) {
                            this.seriesList[i].update(props);
                            return this.seriesList[i];
                        }
                        var newSeries = seriesFactory.create(props);
                        this.bindIndividualSeries(newSeries);
                        return newSeries;
                    }, this);
                }
            } else {
                this.seriesList = null;
                this._isDirty = true;
                this.initializeSeriesList();
            }
        },

        initializeSeriesPropertiesList: function() {
            if(this.isEmpty()) {
                return [{ type: this.type }];
            }

            var rangeFieldNames,
                isRangeSeriesMode = this.isRangeSeriesMode(),
                rangeSeriesConfig = isRangeSeriesMode ? this.getRangeSeriesConfig() : [],
                dashStyle = this.getDashStyle();

            if(isRangeSeriesMode) {
                rangeFieldNames = _(rangeSeriesConfig).pluck('predicted');
            }

            return _(this.yFields).map(function(field) {
                // TODO: this is where user settings could determine series type and/or axis mappings
                var customType;
                if(rangeFieldNames && _(rangeFieldNames).contains(field)) {
                    customType = 'range';
                }
                else if(this.seriesTypeMapping.hasOwnProperty(field)) {
                    customType = this.seriesTypeMapping[field];
                }

                var pointPlacement = null; 
                if (this.hasTimeXAxis() && this.type !== 'column' && this.type !== 'bar'){
                    pointPlacement = 'on';
                }
                var properties = $.extend(true, {}, this.properties, {
                    type: customType || this.type,
                    name: field,
                    pointPlacement: pointPlacement,
                    stacking: isRangeSeriesMode ? 'default' : this.stackMode,
                    // TODO [sff] should we just deal with this in the chart click handler?
                    clickEnabled: this.chartClickEnabled, 
                    dashStyle: dashStyle
                });

                if(customType === 'range') {
                    properties.names = _(rangeSeriesConfig).findWhere({ predicted: field });
                }

                // allow series to be assigned to y-axes via the 'yAxisMapping' property
                if(this.yAxisMapping[field]) {
                    properties.yAxis = this.yAxisMapping[field];
                }
                return properties;
            }, this);
        },

        initializeXAxisList: function() {
            var isEmpty = this.isEmpty();

            // TODO: this is where user settings could specify multiple x-axes
            // TODO: this is where the x-axis type can be inferred from the series types attached to each axis
            this.xAxisList = _(this.xFields).map(function(field, i) {
                var tickmarksBetween = _(this.seriesList).any(function(series) {
                    return (series.getXAxisIndex() === i && { column: true, bar: true }.hasOwnProperty(series.getType()));
                });
                var axisProperties = $.extend(parsingUtils.getXAxisProperties(this.properties), this.axisColorScheme, {
                    'axis.orientation': this.axesAreInverted ? 'vertical' : 'horizontal',
                    'isEmpty': isEmpty
                });
                
                axisProperties['axisTitle.text'] = this._getComputedXAxisTitle(axisProperties, field);
                if(this.seriesIsTimeBased(field)) {
                    axisProperties['axis.spanData'] = this.dataSet.getSeriesAsFloats('_span');
                    axisProperties['axis.categories'] = this.dataSet.getSeriesAsTimestamps(field);
                    axisProperties['axisLabels.tickmarkPlacement'] = tickmarksBetween ? 'between' : 'on';
                    return new TimeAxis(axisProperties);
                }
                axisProperties['axis.categories'] = this.dataSet.getSeries(field);
                axisProperties['axisLabels.tickmarkPlacement'] = 'between';
                return new CategoryAxis(axisProperties);
            }, this);
        },

        initializeYAxisList: function() {
            // TODO: this is where user settings could specify multiple y-axes
            var that = this,
                isEmpty = this.isEmpty();
            this.yAxisList = [];
            var maxAxisIndex = _(this.seriesList).chain().invoke('getYAxisIndex').max().value();
            _(maxAxisIndex + 1).times(function(i) {
                that._initializeYAxis(i, isEmpty);         
            });
        },

        _initializeYAxis: function(yAxisIndex, isEmpty) {
            var axisProperties = this.initializeYAxisProperties(yAxisIndex, isEmpty); 
            // FIXME: we should do something more intelligent here
            // currently if there is only one series for an axis, use that series's name as the default title
            axisProperties['axisTitle.text'] = this._getComputedYAxisTitle(axisProperties, yAxisIndex);

            // log scale is not respected if the chart has stacking
            if(this.stackMode !== 'default') {
                axisProperties['axis.scale'] = 'linear';
            }

            this.yAxisList.push(new NumericAxis(axisProperties));
        }, 

        initializeYAxisProperties: function(yAxisIndex, isEmpty) {
            var axisProperties = $.extend(parsingUtils.getYAxisProperties(this.properties, yAxisIndex), this.axisColorScheme, {
                'axis.orientation': this.axesAreInverted ? 'horizontal' : 'vertical',
                'isEmpty': isEmpty,
                'opposite': yAxisIndex % 2 !== 0 ? true : false
            });
            return axisProperties; 
        },

        updateAxisProperties: function() {
            // make sure the x-axis gets updated categories, if needed
            // TODO [sff] remove assumption that there is only one x-axis
            if(this.hasXAxis) {
                var xAxis = this.xAxisList[0],
                    xField = this.xFields[0];

                // be careful here, TimeAxis subclasses CategoryAxis
                if(xAxis.constructor === CategoryAxis) {
                    xAxis.setCategories(this.dataSet.getSeries(xField));
                }
                else if(xAxis.constructor === TimeAxis) {
                    xAxis.setCategories(
                        this.dataSet.getSeriesAsTimestamps(xField), 
                        this.dataSet.getSeriesAsFloats('_span')
                    );
                }
                var xAxisProperties = parsingUtils.getXAxisProperties(this.properties);
                xAxis.setTitle(this._getComputedXAxisTitle(xAxisProperties, xField));
            }
            //check if we need to draw two y-axis on the chart
            if(this.hasYAxis) {
                var maxAxisIndex = _(this.seriesList).chain().invoke('getYAxisIndex').max().value();
                if(this.yAxisList.length < maxAxisIndex + 1) {
                    this.initializeYAxisList();
                    this._isDirty = true;
                }
            }

            _.each(this.yAxisList, function(yAxis, i){
                var yAxisProperties = parsingUtils.getYAxisProperties(this.properties, i);
                yAxis.setTitle(this._getComputedYAxisTitle(yAxisProperties, i));
            }, this);
        },

        _getComputedXAxisTitle: function(axisProperties, field){
            return _.isUndefined(axisProperties['axisTitle.text']) 
                || axisProperties['axisTitle.text'] === ''
                ? this._getDefaultXAxisTitleFromField(field)
                : axisProperties['axisTitle.text'];
        },

        _getComputedYAxisTitle: function(axisProperties, yAxisIndex){
            return _.isUndefined(axisProperties['axisTitle.text']) 
                || axisProperties['axisTitle.text'] === ''
                ? this._getDefaultYAxisTitle(yAxisIndex)
                : axisProperties['axisTitle.text'];
        },

        _getDefaultXAxisTitleFromField: function(field){
            return field;
        },

        _getDefaultYAxisTitle: function(yAxisIndex){
            var axisSeries = _(this.seriesList).filter(function(series) {
                return series.getYAxisIndex() === yAxisIndex; 
            });
            return axisSeries.length === 1 ? axisSeries[0].getName() : undefined;
        },

        initializeLegend: function() {
            var legendProps = parsingUtils.getLegendProperties(this.properties);
            if(_(legendProps['clickEnabled']).isUndefined()) {
                legendProps['clickEnabled'] = this.legendClickEnabled;
            }
            $.extend(legendProps, {
                fontColor: this.fontColor
            });
            this.legend = new Legend(legendProps);
            this.bindLegendEvents();
        },

        bindLegendEvents: function() {
            var that = this,
                properties = {
                    highlightDelay: 125,
                    unhighlightDelay: 50,
                    onMouseOver: function(fieldName) {
                        that.handleLegendMouseOver(fieldName);
                    },
                    onMouseOut: function(fieldName) {
                        that.handleLegendMouseOut(fieldName);
                    }
                },
                throttle = new HoverEventThrottler(properties);

            this.legend.on('mouseover', function(e, fieldName) {
                throttle.mouseOverHappened(fieldName);
            });
            this.legend.on('mouseout', function(e, fieldName) {
                throttle.mouseOutHappened(fieldName);
            });
            this.legend.on('click', function(e, fieldName) {
                that.handleLegendClick(e, fieldName);
            });
        },

        initializeTooltip: function() {
            var tooltipProps = {
                borderColor: this.foregroundColorSoft
            };
            this.tooltip = new Tooltip(tooltipProps);
        },

        setAllSeriesData: function() {
            _(this.seriesList).each(function(series) {
                if(series.getType() === 'range') {
                    this.setRangeSeriesData(series);
                } else {
                    this.setBasicSeriesData(series);
                }
            }, this);
        },

        setBasicSeriesData: function(series) {
            var xInfo = this.getSeriesXInfo(series),
                yInfo = this.getSeriesYInfo(series);

            if(xInfo.axis instanceof NumericAxis) {
                series.setData({
                    x: this.formatAxisData(xInfo.axis, xInfo.fieldName),
                    y: this.formatAxisData(yInfo.axis, yInfo.fieldName)
                });
            }
            else if(xInfo.axis instanceof TimeAxis) {
                // SPL-67612, handle the case where the last data point was a total value
                // the axis handlers will have removed it from the timestamps, so we just have to sync the array lengths
                var axisTimestamps = xInfo.axis.getCategories(),
                    rawData = this.formatAxisData(yInfo.axis, yInfo.fieldName);

                series.setData({
                    y: rawData.slice(0, axisTimestamps.length)
                });
            }
            else {
                series.setData({
                    y: this.formatAxisData(yInfo.axis, yInfo.fieldName)
                });
            }
        },

        setRangeSeriesData: function(series) {
            var xInfo = this.getSeriesXInfo(series),
                yInfo = this.getSeriesYInfo(series),
                rangeConfig = _(this.getRangeSeriesConfig()).findWhere({ predicted: series.getName() }),
                rangeData = {
                    predicted: this.formatAxisData(yInfo.axis, rangeConfig.predicted),
                    lower: this.formatAxisData(yInfo.axis, rangeConfig.lower),
                    upper: this.formatAxisData(yInfo.axis, rangeConfig.upper)
                };

            if(xInfo.axis instanceof NumericAxis) {
                rangeData.x = this.formatAxisData(xInfo.axis, xInfo.fieldName);
            }
            series.setData(rangeData);
        },

        bindSeriesEvents: function() {
            var that = this;
            this.throttle = new HoverEventThrottler({
                highlightDelay: 125,
                unhighlightDelay: 50,
                onMouseOver: function(point, series) {
                    that.handlePointMouseOver(point, series);
                },
                onMouseOut: function(point, series) {
                    that.handlePointMouseOut(point, series);
                }
            });
            _(this.seriesList).each(this.bindIndividualSeries, this);
        },

        bindIndividualSeries: function(series) {
            var that = this;
            series.on('mouseover', function(e, targetPoint, targetSeries) {
                that.throttle.mouseOverHappened(targetPoint, targetSeries);
            });
            series.on('mouseout', function(e, targetPoint, targetSeries) {
                that.throttle.mouseOutHappened(targetPoint, targetSeries);
            });
            series.on('click', function(e, targetPoint, targetSeries) {
                that.handlePointClick(e, targetPoint, targetSeries);
            });
        },

        handlePointClick: function(event, point, series) {
            var rowContext = {},
                pointIndex = point.index,
                pointInfo = this.getSeriesPointInfo(series, point),
                pointClickEvent = {
                    type: 'pointClick',
                    modifierKey: event.modifierKey,
                    name: pointInfo.xAxisName,
                    // 'value' will be inserted later based on the x-axis type
                    name2: pointInfo.yAxisName,
                    value2: pointInfo.yValue
                };

            if(pointInfo.xAxisIsTime) {
                var isoTimeString = this.dataSet.getSeries(pointInfo.xAxisName)[pointIndex];
                pointClickEvent.value = splunkUtils.getEpochTimeFromISO(isoTimeString);
                pointClickEvent._span = this.dataSet.getSeriesAsFloats('_span')[pointIndex];
                rowContext['row.' + pointInfo.xAxisName] = pointClickEvent.value;
            }
            else {
                pointClickEvent.value = pointInfo.xValue;
                rowContext['row.' + pointInfo.xAxisName] = pointInfo.xValue;
            }

            _(this.yFields).each(function(fieldName) {
                rowContext['row.' + fieldName] = this.dataSet.getSeries(fieldName)[pointIndex];
            }, this);
            pointClickEvent.rowContext = rowContext;
            this.trigger(pointClickEvent);
        },

        handlePointMouseOver: function(targetPoint, targetSeries) {
            _(this.seriesList).each(function(series) {
                if(series.matchesName(targetSeries.getName())) {
                    series.handlePointMouseOver(targetPoint);
                }
                else {
                    series.unHighlight();
                }
            });
            if(this.legend) {
                this.legend.selectField(targetSeries.getLegendKey());
            }
        },

        handlePointMouseOut: function(targetPoint, targetSeries) {
            _(this.seriesList).each(function(series) {
                if(series.matchesName(targetSeries.getName())) {
                    series.handlePointMouseOut(targetPoint);
                }
                else {
                    series.highlight();
                }
            });
            if(this.legend) {
                this.legend.unSelectField(targetSeries.getLegendKey());
            }
        },

        handleLegendClick: function(event, fieldName) {
            var legendClickEvent = {
                type: 'legendClick',
                modifierKey: event.modifierKey,
                name2: fieldName
            };
            this.trigger(legendClickEvent);
        },

        handleLegendMouseOver: function(fieldName) {
            _(this.seriesList).each(function(series) {
                if(series.matchesName(fieldName)) {
                    series.handleLegendMouseOver(fieldName);
                }
                else {
                    series.unHighlight();
                }
            });
        },

        handleLegendMouseOut: function(fieldName) {
            _(this.seriesList).each(function(series) {
                if(series.matchesName(fieldName)) {
                    series.handleLegendMouseOut(fieldName);
                }
                else {
                    series.highlight();
                }
            });
        },

        applyColorPalette: function() {
            if(this.isEmpty()) {
                return;
            }
            var colorMapping = {};
            _(this.getFieldList()).each(function(field, i, fieldList) {
                colorMapping[field] = this.computeFieldColor(field, i, fieldList);
            }, this);
            _(this.seriesList).invoke('applyColorMapping', colorMapping);
        },


        //////////////////////////////////////////////////////////////////////////////////
        // methods for generating config objects from chart objects

        getConfig: function() {
            var that = this;
            var config = $.extend(true, {
                chart: {
                    animation: this.enableAnimation
                },
                    plotOptions: {
                        series: {
                            animation: this.enableAnimation

                        }
                    }, 
                    tooltip: {
                        animation: this.enableAnimation
                    }
                }, this.BASE_CONFIG, {
                    chart: this.getChartConfig(),
                    series: this.getSeriesConfigList(),
                    xAxis: this.getXAxisConfig(),
                    yAxis: this.getYAxisConfig(),
                    legend: this.getLegendConfig(),
                    tooltip: this.getTooltipConfig(),
                    plotOptions: this.getPlotOptionsConfig(),
                    pointerDragStartPreHook: _(this.pointerDragStartPreHook).bind(this),
                    pointerDragOverride: _(this.pointerDragOverride).bind(this),
                    pointerDropPreHook: _(this.pointerDropPreHook).bind(this),
                    pointerDropPostHook: _(this.pointerDropPostHook).bind(this),
                    pointerPinchOverride: _(this.pointerPinchOverride).bind(this)
                });
            if(this.exportMode) {
                if(this.seriesIsTimeBased(this.xFields)) {
                    _(config.xAxis).each(function(xAxis) {
                        var xAxisMargin;
                        if(that.axesAreInverted) {
                            xAxisMargin = -50;
                        }
                        else {
                            var spanSeries = that.dataSet.getSeriesAsFloats('_span'),
                                span = (spanSeries && spanSeries.length > 0) ? parseInt(spanSeries[0], 10) : 1,
                                secsPerDay = 60 * 60 * 24,
                                secsPerYear = secsPerDay * 365;

                            if(span >= secsPerYear) {
                                xAxisMargin = 15;
                            }
                            else if(span >= secsPerDay) {
                                xAxisMargin = 25;
                            }
                            else {
                                xAxisMargin = 35;
                            }
                        }
                        xAxis.title.margin = xAxisMargin;
                    });
                }
                $.extend(true, config, {
                    plotOptions: {
                        series: {
                            enableMouseTracking: false,
                            shadow: false
                        }
                    }
                });

            }
            return config;
        },

        getSeriesConfigList: function() {
            return _(this.seriesList).chain().invoke('getConfig').flatten(true).value();
        },

        getXAxisConfig: function() {
            if(!this.hasXAxis) {
                return [];
            }
            return _(this.xAxisList).map(function(axis, i) {
                var config = axis.getConfig();
                if(i > 0) {
                    config.offset = 40;
                }
                return config;
            }, this);
        },

        getYAxisConfig: function() {
            if(!this.hasYAxis) {
                return [];
            }
            return _(this.yAxisList).map(function(axis, i) {               
                return axis.getConfig();
            });
        },

        getLegendConfig: function() {
            if(!this.hasLegend || !this.legend) {
                return {};
            }
            return this.legend.getConfig();
        },

        getTooltipConfig: function() {
            if(!this.tooltip) {
                return {};
            }
            return $.extend(this.tooltip.getConfig(), {
                // initially disable the tooltip, it will be re-enabled when the draw has completed
                // this is to support progressive draw where some content is visible but the chart is not yet interactive
                formatter: function() { return false; }
            });
        },

        formatTooltip: function(series, hcPoint) {
            var pointInfo = this.getSeriesPointInfo(series, hcPoint);
            return series.getTooltipHtml(pointInfo, this.hcChart);
        },

        getChartConfig: function() {
            var config = {
                type: this.type,
                renderTo: this.container,
                backgroundColor: this.backgroundColor,
                borderColor: this.backgroundColor
            };
            // in export mode we need to set explicit width and height
            // we'll honor the width and height of the parent node, unless they are zero
            if(this.exportMode) {
                config.width = this.width || this.EXPORT_WIDTH;
                config.height = this.height || this.EXPORT_HEIGHT;
            } else if (!this.$container.is(':visible')) {
                // If the container is not visible as the chart is being drawn, set some default dimensions
                // so that the chart will resize correctly when made visible (SPL-101997)
                config.width = this.FALLBACK_WIDTH;
                config.height = this.FALLBACK_HEIGHT;
            }
            // allow zoom for column, line, area charts only
            if(this.isZoomable()){
                if(this.zoomType !== 'off'){
                    config.zoomType = this.zoomType || 'x';
                }
            }
            //don't align the ticks when we have multiple y-axis in the chart and at least one of the axes has either explicit min or explicit max (SPL-113709)
            if (this.yAxisList && this.yAxisList.length > 1) {
                var hasExplicitMinOrMax = _.find(this.yAxisList, function(yAxis) {
                    return yAxis.hasExplicitMin || yAxis.hasExplicitMax;
                });
                if (hasExplicitMinOrMax) {
                    config.alignTicks = false;
                }
            }
            return config;
        },

        getDataLabelConfig: function() {
            if (this.showLabels === "none" || typeof this.dataLabels === "undefined") {
                return {
                    enabled: false
                };
            }
            var that = this;
            var dataLabelsWithFormatter = $.extend(true, {}, this.dataLabels.getConfig(), {
                formatter: function () {
                    for (var i = 0; i < that.seriesList.length; i++) {
                        var seriesId = this.series.options.id;
                        var splunkSeriesId = that.seriesList[i].id;
                        //To use helper, we need to identity the associated splunk series.
                        if (seriesId === splunkSeriesId) {
                            var pointInfo = that.getSeriesPointInfo(that.seriesList[i], this.point);
                            if (pointInfo) {
                                return pointInfo.yValueDisplay;
                            }
                        }
                        
                    }
                }
            });
            return dataLabelsWithFormatter;
        },

        getPlotOptionsConfig: function() {
            // SPL-74520, track-by-area only works well if the series do not overlap eachother,
            // so it is disabled for a non-stacked chart or a range series chart
            var trackByArea = this.stackMode !== 'default' && !this.isRangeSeriesMode();
            return $.extend(true, {}, this.BASE_PLOT_OPTIONS_CONFIG, {
                series: {
                    cursor: this.chartClickEnabled ? 'pointer' : 'default',
                    dataLabels: this.getDataLabelConfig()
                },
                area: {
                    trackByArea: trackByArea
                }
            });
        },

        isZoomable: function() {
            return this.type === 'area' || this.type === 'line' || this.type === 'column';
        },

        ////////////////////////////////////////////////////////////////////////////////////////
        // methods for managing event handlers and effects

        addEventHandlers: function(hcChart) {
            var that = this,
                $hcChart = $(hcChart);

            domUtils.jQueryOn.call($hcChart, 'redraw', function() {
                that.onChartRedraw(hcChart);
                that.onChartLoadOrRedraw(hcChart);
            });
            if(this.hasXAxis) {
                domUtils.jQueryOn.call($hcChart, 'selection', _(this.onChartSelection).bind(this));
            }
            domUtils.jQueryOn.call($hcChart, 'tooltipRefresh', function() {
                if(that.hcChart.hoverPoint){
                    var seriesIndex = that.hcChart.hoverPoint.series.index;
                    // redraw hoverPoint or column in its new position if tooltip is moved and redrawn
                    if(that.hcChart.series[seriesIndex].splSeries.type === 'column'){
                        that.hcChart.series[seriesIndex].splSeries.unHighlight();
                        that.hcChart.series[seriesIndex].splSeries.highlight();
                    }else if(that.hcChart.series[seriesIndex].splSeries.type === 'line' || that.hcChart.series[seriesIndex].splSeries.type === 'area') {
                        that.hcChart.hoverPoint.setState();
                        that.hcChart.hoverPoint.setState('hover');
                    }
                }
            });
            domUtils.jQueryOn.call($hcChart, 'endResize', function() {
                that.onChartResize(hcChart);
            });
        },

        enableTooltip: function(hcChart) {
            var that = this;
            hcChart.tooltip.options.formatter = function() {
                // need to look up the instance of Splunk.JSCharting.BaseSeries, not the HighCharts series
                var series = this.series.splSeries;
                return that.formatTooltip(series, this.point);
            };
        },

        onChartLoad: function(chart) {
            if(this.legend) {
                this.legend.onChartLoad(chart);
            }
            if(this.dataLabels) {
                this.dataLabels.onChartLoad(chart);
            }
            _(this.xAxisList).invoke('onChartLoad', chart);
            _(this.yAxisList).invoke('onChartLoad', chart);
            _(this.seriesList).invoke('onChartLoad', chart);
            if(this.isZoomable()) {
                this.triggerRangeSelectionEvent();
            }
        },

        onChartRedraw: function(chart) {
            var that = this;
            if(this.selectionWindow) {
                this.selectionWindow.onChartRedraw(chart);
            }
            else if(this.isZoomable() && !this.isiOS) {
                var xAxis = this.xAxisList[0];
                if(xAxis && xAxis.isZoomed) {
                    if(!this.resetZoomButton) {
                        this.resetZoomButton = new ZoomOutButton(this.hcChart);
                    }
                    if(this.panButtons) {
                        this.panButtons.onChartRedraw(chart);
                    }
                    else {
                        this.panButtons = new PanButtons(this.hcChart);
                        this.panButtons.on('pan', function(e, rangeStartX, rangeEndX) {
                            that.triggerRangeSelectionEvent();
                        });
                    }
                }
                else {
                    if(this.resetZoomButton) {
                        this.resetZoomButton.destroy();
                        this.resetZoomButton = null;
                    }
                    if(this.panButtons) {
                        this.panButtons.destroy();
                        this.panButtons = null;
                    }
                }
            }
            if(this.isZoomable() && !this.selectionTriggeredBeforeRedraw) {
                this.triggerRangeSelectionEvent();
            }
            this.selectionTriggeredBeforeRedraw = false;
        },

        onChartLoadOrRedraw: function(chart) {
            if(this.legend) {
                this.legend.onChartLoadOrRedraw(chart);
            }
            if (this.dataLabels) {
                this.dataLabels.onChartLoadOrRedraw(chart);
            }
            _(this.xAxisList).invoke('onChartLoadOrRedraw', chart);
            _(this.yAxisList).invoke('onChartLoadOrRedraw', chart);
            _(this.seriesList).invoke('onChartLoadOrRedraw', chart);
        },

        onChartDestroy: function() {
            $(Highcharts).off('baseUriChange.' + this.id);
            if(this.legend) {
                this.legend.destroy();
            }

            if (this.dataLabels) {
                this.dataLabels.destroy();
            }
            _(this.xAxisList).invoke('destroy');
            _(this.yAxisList).invoke('destroy');
            _(this.seriesList).invoke('destroy');
            if(this.selectionWindow) {
                this.selectionWindow.destroy();
                this.selectionWindow = null;
            }
            if(this.panButtons){
                this.panButtons.destroy();
                this.panButtons = undefined;
            }
        },

        onChartSelection: function(originalEvent) {
            var xAxis = this.xAxisList[0];
            if(!originalEvent.resetSelection) {
                var xAxisInfo = originalEvent.xAxis[0],
                    normalizedExtremes = this.getNormalizedAxisExtremes(xAxisInfo.min, xAxisInfo.max);

                // TODO [sff] maybe this should be handled elsewhere?
                xAxisInfo.min = normalizedExtremes.min;
                xAxisInfo.max = normalizedExtremes.max + (xAxis.hasTickmarksBetween() ? 0 : 1);
                // This is the one place where the range selection event if triggered with explicit extremes,
                // at this stage in the event lifecycle the new extremes have not yet been applied to the axis.
                var rangeSelectionEvent = this.triggerRangeSelectionEvent(normalizedExtremes);
                if(rangeSelectionEvent.isDefaultPrevented()) {
                    originalEvent.preventDefault();
                    // cancel a pending range reset event since we are creating a new selection window
                    this.hasPendingRangeResetEvent = false;
                    if(xAxis.getZoomed(xAxisInfo.min, xAxisInfo.max)){
                        this.selectionWindow = new SelectionWindow(this.hcChart);
                        var that = this;
                        this.selectionWindow.on('rangeSelect', function(e, rangeStartX, rangeEndX) {
                            that.triggerRangeSelectionEvent();
                        });
                    }
                }
                else {
                    // Since we are triggering the event before the chart redraws, set a flag that will suppress what
                    // would be a duplicate event trigger in onChartRedraw.
                    this.selectionTriggeredBeforeRedraw = true;
                }
            }
        },

        onChartResize: function(chart) {
            if(this.panButtons){
                this.panButtons.onChartResize(chart);
            }
        },

        getNormalizedAxisExtremes: function(min, max) {
            var axis = this.xAxisList[0],
                hcAxis = this.hcChart.xAxis[0],
                axisMax = hcAxis.dataMax,
                axisMin = hcAxis.dataMin,
                normalize = function(extreme) {
                    if(extreme > axisMax){
                        extreme = axisMax;
                    }
                    if(extreme < axisMin){
                        extreme = axisMin;
                    }
                    return Math.round(extreme);
                },
                normalizedMin = normalize(min),
                isTouch = this.isiOS && this.hcChart.pointer.selectionMarker,
                normalizedMax = normalize(max),
                isTouchPan = isTouch && this.hcChart.pointer.selectionMarker.width === this.hcChart.plotWidth,
                isTouchZoom = isTouch && this.hcChart.pointer.selectionMarker.width !== this.hcChart.plotWidth;

            if(isTouchPan && normalizedMax > normalizedMin && normalizedMax !== axisMax){
                // If max and min are not equal, and if the event was a touch pan, normalize the max for non-column charts.
                // Except when panning to the end of the chart.
                normalizedMax -= (axis.hasTickmarksBetween() ? 0 : 1);
            }

            if(isTouchZoom && (max - min < 1) && !axis.hasTickmarksBetween()){
                // User is zoomed in on 1 point. Do not let them zoom in further
                normalizedMax = normalizedMin;
            }

            return ({
                min: normalizedMin,
                max: normalizedMax
            });
        },

        calculatePostUpdateExtremes: function(preUpdateExtremes) {
            var xAxis = this.xAxisList[0],
                updatedCategories = xAxis.getCategories();

            if(xAxis instanceof TimeAxis) {
                var previousCategories = xAxis.getPreviousCategories(),
                    // The start index can be calculated by simply matching the ISO time string.
                    newStartIndex = _(updatedCategories).indexOf(previousCategories[preUpdateExtremes.min]),
                    // The end index is more complicated, since the end time depends also on the span between data points.
                    // The correct thing to do is calculate the previous end time and match it to the new end times.
                    previousEndTime = parseInt(splunkUtils.getEpochTimeFromISO(previousCategories[preUpdateExtremes.max]), 10) +
                                    xAxis.getPreviousSpanData()[preUpdateExtremes.max],
                    updatedSpanData = xAxis.getSpanData(),
                    updatedEndTimes = _(updatedCategories).map(function(isoTime, i) {
                        return parseInt(splunkUtils.getEpochTimeFromISO(isoTime), 10) + updatedSpanData[i];
                    }),
                    newEndIndex = _(updatedEndTimes).indexOf(previousEndTime);

                return { min: newStartIndex > -1 ? newStartIndex : null, max: newEndIndex > -1 ? newEndIndex : null };
            }

            return (updatedCategories.length > preUpdateExtremes.max ?
                preUpdateExtremes : { min: null, max: null });
        },

        triggerRangeSelectionEvent: function(extremes) {
            var xAxis = this.xAxisList[0],
                // The range is being reset if there are no explicit extremes, there is no selection window,
                // and the axis is not zoomed.
                isReset = !extremes && !this.selectionWindow && !xAxis.isZoomed;

            if(!extremes) {
                if(this.selectionWindow) {
                    extremes = this.selectionWindow.getExtremes();
                    extremes.min += (xAxis.hasTickmarksBetween() ? 1 : 0);
                }
                else {
                    extremes = this.hcChart.xAxis[0].getExtremes();
                    extremes.max -= (xAxis.hasTickmarksBetween() ? 0 : 1);
                }
            }
            extremes = this.getNormalizedAxisExtremes(extremes.min, extremes.max);

            var isTimeAxis = xAxis instanceof TimeAxis,
                xSeries = isTimeAxis ? this.dataSet.getSeriesAsTimestamps(this.xFields[0]) : this.dataSet.getSeries(this.xFields[0]),
                startXValue = xSeries[extremes.min],
                endXValue = xSeries[extremes.max];

            if(isTimeAxis) {
                var spanValue = 1;
                if(this.dataSet.hasField('_span')) {
                    var spans = this.dataSet.getSeriesAsFloats('_span');
                    spanValue = (spans.length > extremes.max) ? spans[extremes.max] : _(spans).last();
                }

                startXValue = parseInt(splunkUtils.getEpochTimeFromISO(startXValue), 10);
                endXValue = parseInt(splunkUtils.getEpochTimeFromISO(endXValue), 10) + spanValue;
            }

            var e = $.Event('chartRangeSelect', {
                startXIndex: extremes.min,
                endXIndex: extremes.max,
                startXValue: startXValue,
                endXValue: endXValue,
                isReset: !!isReset
            });
            this.trigger(e);
            return e;
        },

        pointerDragStartPreHook: function(pointer, e) {
            if(this.selectionWindow) {
                var handled = this.selectionWindow.handleDragStartEvent(e);
                if(!handled) {
                    this.selectionWindow.destroy();
                    this.selectionWindow = null;
                    // note that a range reset event is pending, to be handled in pointerDropPostHook
                    // this can potentially be cancelled if the current drag event results in creating a new selected range
                    this.hasPendingRangeResetEvent = true;
                }
            }
        },

        pointerPinchOverride: function(pointer, e, originalFn) {
            if(this.selectionWindow){
                if(e.type === 'touchstart'){
                    pointer.dragStart(e);
                    if(!this.selectionWindow){
                        // If selectionWindow is being redrawn in a new position, then we need to reset
                        // some pointer properties that are normally set in Highcharts' pinch touchstart routine,
                        // so that a new selectionMarker is drawn in Highcharts' pinch touchmove routine
                        _.each(e.touches, function (e, i) {
                            pointer.pinchDown[i] = { chartX: e.chartX || e.pageX, chartY: e.chartY || e.pageY };
                        });
                    }
                }else if(e.type === 'touchmove'){
                    pointer.normalize(e).chartX;
                    this.selectionWindow.handleDragEvent(e);
                }else if(e.type === 'touchend'){
                    this.selectionWindow.handleDropEvent(e);
                }
            }else{
                originalFn.call(pointer, e);
            }
        },

        pointerDragOverride: function(pointer, e, originalFn) {
            if(this.selectionWindow) {
                this.selectionWindow.handleDragEvent(e);
            }
            else {
                originalFn.call(pointer, e);
                if(this.hcChart.pointer.selectionMarker) {
                    this.hcChart.pointer.selectionMarker.attr({
                        'stroke-width': 2,
                        stroke: this.foregroundColorSofter
                    });
                }
            }
        },

        pointerDropPreHook: function(pointer, e) {
            if(this.selectionWindow) {
                this.selectionWindow.handleDropEvent(e);
            }
        },

        pointerDropPostHook: function(pointer, e) {
            if(this.hasPendingRangeResetEvent) {
                this.triggerRangeSelectionEvent();
                this.hasPendingRangeResetEvent = false;
            }
        },

        /////////////////////////////////////////////////////////////////////////////////////
        // re-usable helpers

        getSeriesXInfo: function(series) {
            var xIndex = series.getXAxisIndex();
            return ({
                axis: this.xAxisList[xIndex],
                fieldName: this.xFields[xIndex]
            });
        },

        getSeriesYInfo: function(series) {
            return ({
                axis: this.yAxisList[series.getYAxisIndex()],
                fieldName: series.getName()
            });
        },

        getSeriesPointInfo: function(series, hcPoint) {
            var pointIndex = hcPoint.index,
                xInfo = this.getSeriesXInfo(series),
                yInfo = this.getSeriesYInfo(series),
                xSeries = this.dataSet.getSeries(xInfo.fieldName),
                ySeries = this.dataSet.getSeries(yInfo.fieldName);

            return ({
                xAxisIsTime: (xInfo.axis instanceof TimeAxis),
                xAxisName: xInfo.fieldName,
                xValue: xSeries[pointIndex],
                xValueDisplay: xInfo.axis.formatValue(xSeries[pointIndex]),
                yAxisName: yInfo.fieldName,
                yValue: ySeries[pointIndex],
                yValueDisplay: yInfo.axis.formatValue(ySeries[pointIndex])
            });
        },

        getDashStyle: function(){
            // convert first char to upper case as HighCharts expects options to have this convention
            var dashStyle = this.properties['lineDashStyle'];
            if(dashStyle){
                return string_utils.capitalize(dashStyle);
            }
        },

        isRangeSeriesMode: function() {
            var allFields = this.dataSet.allFields();
            return (_(allFields).any(function(f) { return /^_predicted/.test(f); })
                && _(allFields).any(function(f) { return /^_lower/.test(f); })
                && _(allFields).any(function(f) { return /^_upper/.test(f); }));
        },

        getRangeSeriesConfig: function() {
            var predictedFields = _(this.dataSet.allFields()).filter(function(f) {
                return /^_predicted/.test(f);
            });

            return _(predictedFields).map(function(predictedField) {
                var sourceField = predictedField.replace(/^_predicted/, ''),
                    lowerField = '_lower' + sourceField,
                    upperField = '_upper' + sourceField,
                    predictedName = _(this.dataSet.getSeries(predictedField)).find(function(value) { return !!value; }),
                    lowerName = _(this.dataSet.getSeries(lowerField)).find(function(value) { return !!value; }),
                    upperName = _(this.dataSet.getSeries(upperField)).find(function(value) { return !!value; });

                return ({
                    predicted: predictedName,
                    lower: lowerName,
                    upper: upperName
                });

            }, this);
        },

        // by convention, we consider a series to be time-based if it is called _time, and there is also a _span series
        // with the exception that if there is only one data point _span does not need to be there
        seriesIsTimeBased: function(fieldName) {
            return (/^_time/).test(fieldName) && (this.dataSet.getSeries(fieldName).length <= 1 || this.dataSet.hasField('_span'));
        },

        formatAxisData: function(axis, fieldName) {
            if(!this.dataSet.hasField(fieldName)) {
                return [];
            }
            return this.dataSet.getSeriesAsFloats(fieldName, {
                scale: axis.isLogScale() ? 'log' : 'linear',
                nullValueMode: this.properties['chart.nullValueMode']
            });
        },

        computeFieldColor: function(field, index, fieldList) {
            if(this.internalFieldColors.hasOwnProperty(field)) {
                return colorUtils.colorFromHex(this.internalFieldColors[field]);
            }
            var useExternalPalette = !_(this.externalPaletteMapping).isEmpty(),
                paletteIndex = useExternalPalette ? this.externalPaletteMapping[field] : index,
                paletteSize = useExternalPalette ? this.externalPaletteSize : fieldList.length;

            return this.colorPalette.getColorAsRgb(field, paletteIndex, paletteSize);
        },

        /////////////////////////////////////////////////////////////////////////////////////
        // templates and default settings

        BASE_CONFIG: {
            chart: {
                showAxes: true,
                reflow: false,
                selectionMarkerFill: 'rgba(0,0,0,0)',
                spacingTop: 16
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    states: {
                        // series start out with their hover state disabled, it is enabled after draw is complete
                        hover: {
                            enabled: false
                        }
                    },
                    events: {
                        legendItemClick: function() {
                            return false;
                        }
                    },
                    borderWidth: 0,
                    shadow: false,
                    turboThreshold: 0
                }
            },
            title: {
                text: null
            },
            tooltip: {
                enabled: false,
                useHTML: true
            }
        },

        BASE_PLOT_OPTIONS_CONFIG: {
            line: {
                stickyTracking: true,
                states: {
                    hover: {
                        marker: {
                            enabled: true,
                            radius: 6
                        }
                    }
                },
                marker: {
                    enabled: false,
                    symbol: 'square'
                }
            },
            area: {
                stickyTracking: true,
                lineWidth: 1,
                states: {
                    hover: {
                        marker: {
                            enabled: true,
                            radius: 6
                        }
                    }
                },
                marker: {
                    symbol: 'square',
                    enabled: false
                }
            },
            column: {
                markers: {
                    enabled: false
                },
                stickyTracking: false,
                fillOpacity: 1,
                trackByArea: true
            },
            bar: {
                markers: {
                    enabled: false
                },
                stickyTracking: false,
                fillOpacity: 1,
                trackByArea: true
            }
        }

    });

   return Chart;

});
