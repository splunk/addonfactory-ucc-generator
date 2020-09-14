define([
            'jquery',
            'underscore',
            'module',
            'models/config',
            'views/shared/viz/Base',
            'util/jscharting_utils',
            'splunk.util',
            'splunk.legend',
            'uri/route',
            './Master.pcss'
        ],
        function(
            $,
            _,
            module,
            configModel,
            VisualizationBase,
            jschartingUtils,
            splunkUtils,
            SplunkLegend,
            route
        ) {

    var JSChart = VisualizationBase.extend({
        VIZ_PROPERTY_PREFIX_REGEX: /^display\.visualizations\.charting\./,
        className: 'chart',
        moduleId: module.id,
        initialize: function(options) {
            VisualizationBase.prototype.initialize.apply(this, arguments);
            this.options = options || {};
            this._selectedRange = null;

            this.$el.width(this.options.width || '100%');
            this.$el.height(this.options.height || '100%');

            this.$chart = $('<div></div>');
            this.$inlineMessage = $('<div></div>').css('text-align', 'center')
                .addClass(this.options.messageContainerClass || '');

            this.computeDisplayProperties();

            this.listenTo(this.model.searchData, 'destroy', this.empty);
            this.onExternalPaletteChange = _(this.onExternalPaletteChange).bind(this);
            SplunkLegend.register(this.cid);
            SplunkLegend.addEventListener('labelIndexMapChanged', this.onExternalPaletteChange);
        },
        empty:  function() {
            this.destroyChart();
            this.$chart.empty();
            this.$inlineMessage.empty();
            return this;
        },
        remove: function() {
            this.removed = true;
            this.destroyChart();
            SplunkLegend.unregister(this.cid);
            SplunkLegend.removeEventListener('labelIndexMapChanged', this.onExternalPaletteChange);
            return VisualizationBase.prototype.remove.apply(this, arguments);
        },
        render: function() {
            this.$chart.appendTo(this.el);
            this.$inlineMessage.appendTo(this.el);
            return VisualizationBase.prototype.render.apply(this, arguments);
        },
        onConfigChange: function(changedAttributes) {
            var updateNeeded = _(changedAttributes).chain().keys()
                .any(function(key) {
                    return key.indexOf('display.visualizations.charting.') === 0;
                })
                .value();

            if (!updateNeeded) {
                return;
            }
            this.computeDisplayProperties();

            // Any config attributes used (directly or indirectly) by the formatData method below
            // should be in this list.  By checking for these attributes in what has changed,
            // we can decide whether to reformat the data or just re-update the view.
            var dataRelevantConfigAttributes = [
                'display.visualizations.charting.chart',
                'display.visualizations.charting.chart.resultTruncationLimit',
                'display.visualizations.charting.resultTruncationLimit'
            ];
            var formatDataNeeded = _(changedAttributes).any(function(value, key) {
                return _(dataRelevantConfigAttributes).contains(key);
            });
            if (formatDataNeeded) {
                this.invalidate('formatDataPass');
            } else {
                this.invalidate('updateViewPass');
            }
        },
        formatData: function(rawResults) {
            if (!rawResults || !rawResults.columns || rawResults.columns.length === 0) {
                return { fields: [], columns: [] };
            }
            var results = jschartingUtils.preprocessChartData(rawResults, this.displayProperties);
            // if the preprocessChartData method truncated the data, add a flag to the formatted results
            if(results.columns.length > 0 &&
                    (results.columns.length < rawResults.columns.length ||
                        results.columns[0].length < rawResults.columns[0].length)) {
                results.areTruncated = true;
            }
            return results;
        },
        // The initial version of updateView performs the lazy loading of the charting library source code.
        // Once the load is complete, the updateView method is reassigned to point to the _updateViewAfterLoad
        // method below.  Any subsequent calls to updateView will actually call _updateViewAfterLoad.
        updateView: function(results, config, async) {
            // If the charting library source is already loaded (from another instance of this view),
            // call the _updateViewAfterLoad method directly.
            if (JSChart.JSCHARTING_LIBRARY) {
                this._updateViewAfterLoad.apply(this, arguments);
                return;
            }
            // Notify any upstream consumers that this is an asynchronous update.
            // This method never does any explicit rendering, so the done() callback is never called.
            // It will be called when _updateViewAfterLoad is eventually invoked later.
            var done = async();
            if(this._lazyLoadInProgress) {
                return;
            }
            this._lazyLoadInProgress = true;

            this._loadChartLib().done(_.bind(function(lazyJSCharting) {
                if (this.removed) {
                    return;
                }
                JSChart.JSCHARTING_LIBRARY = lazyJSCharting;
                this.updateView = this._updateViewAfterLoad;
                this._lazyLoadInProgress = false;
                this.invalidate('updateViewPass');
            }, this));
        },
        // See comment for updateView above.
        _updateViewAfterLoad: function(results, config, async) {
            var done = async();
            this.$inlineMessage.empty();
            var maxResultCount = this.model.searchDataParams.get('count');

            // if the formatData method truncated the data, show a message to that effect
            if(results.areTruncated) {
                this.renderResultsTruncatedMessage();
            }
            // otherwise if the number of results matches the max result count that was used to fetch,
            // show a message that we might not be displaying the full data set
            else if(results.columns.length > 0 && maxResultCount > 0 && results.columns[0].length >= maxResultCount) {
                this.renderMaxResultCountMessage(maxResultCount);
            }
            var chartReadyData = JSChart.JSCHARTING_LIBRARY.extractChartReadyData(results);
            // NOTE: naming got weird here, configModel is the representation of the server config endpoint,
            // not to be confused with this.model.config, which is the report configuration.
            var displayProperties = $.extend({}, this.displayProperties, jschartingUtils.getCustomDisplayProperties(chartReadyData, configModel.toJSON()));

            // If this is the first time creating the chart, or the display configuration has changed,
            // do a full destroy and recreate.
            if(!this.chart || !_.isEqual(displayProperties, this.chart.getCurrentDisplayProperties())) {
                this.destroyChart();
                this.chart = JSChart.JSCHARTING_LIBRARY.createChart(this.$chart, displayProperties);
            }
            // Otherwise the chart will be updated in place, remove existing listeners since they will
            // be bound below.
            else {
                this.chart.off();
            }
            this.updateChartContainerHeight();
            var that = this;
            this.chart.prepare(chartReadyData, {});
            var fieldList = this.chart.getFieldList();
            if(this.chart.requiresExternalColorPalette()) {
                SplunkLegend.setLabels(this.cid, fieldList);
                this.externalPalette = this.getExternalColorPalette();
                this.chart.setExternalColorPalette(this.externalPalette.fieldIndexMap, this.externalPalette.numLabels);
            }
            this.chart.on('pointClick', function(eventInfo) {
                var drilldownEvent = that.normalizeDrilldownEvent(eventInfo, 'cell');
                that.trigger('drilldown', drilldownEvent);
            });
            this.chart.on('legendClick', function(eventInfo) {
                var drilldownEvent;
                if (eventInfo.hasOwnProperty('name') && eventInfo.hasOwnProperty('value')) {
                    // if the legend click has a name and value (this happens for scatter/bubble charts), do a row drilldown
                    drilldownEvent = that.normalizeDrilldownEvent(eventInfo, 'row');
                } else {
                    // otherwise do a column drilldown
                    drilldownEvent = that.normalizeDrilldownEvent(eventInfo, 'column');
                }
                that.trigger('drilldown', drilldownEvent);
            });
            // Bind to the chart object's "chartRangeSelect" event and re-broadcast it upstream.
            // Each chart will broadcast its range when it is created, and since this view abstracts
            // the process of destroying and creating new charts, the currently selected range is cached
            // and the re-broadcast is avoided if the range did not actually change (SPL-121742).
            this.chart.on('chartRangeSelect', function(eventInfo) {
                var newRange = _(eventInfo).pick('startXIndex', 'endXIndex', 'startXValue', 'endXValue');
                if (!_.isEqual(newRange, that._selectedRange)) {
                    that._selectedRange = newRange;
                    that.trigger('chartRangeSelect', eventInfo);
                }
            });
            this.chart.draw(function(chart) {
                that.model.config.set({ currentChartFields: fieldList }, {'transient': true});
                done();
            });
        },
        _loadChartLib: function() {
            var dfd = $.Deferred();

            // Force async loading - required for webpack, otherwise the first updateViewPass is fired too early
            _.defer(function () {
                // Rename so r.js doesn't detect the dependency at build time
                var lazyRequire = require;
                lazyRequire(['js_charting/js_charting'], function () {
                    dfd.resolve.apply(dfd, arguments);
                });
            });

            return dfd;
        },
        normalizeDrilldownEvent: function(originalEvent, type) {
            return _.extend(
                {
                    type: type,
                    originalEvent: originalEvent
                },
                _(originalEvent).pick('name', 'value', 'name2', 'value2', '_span', 'rowContext', 'modifierKey')
            );
        },
        getExternalColorPalette: function() {
            // Querying the external color palette will force it to reconcile any deferred work, which means it might
            // fire a "labelIndexMapChanged" event.  This event should be ignored (see onExternalPaletteChange) since we
            // are already in the process of getting the latest palette information.
            this.synchronizingExternalPalette = true;
            var fieldIndexMap = {};
            _(this.chart.getFieldList()).each(function(field) {
                fieldIndexMap[field] = SplunkLegend.getLabelIndex(field);
            });
            this.synchronizingExternalPalette = false;
            return { fieldIndexMap: fieldIndexMap, numLabels: SplunkLegend.numLabels() };
        },
        onExternalPaletteChange: function() {
            if(this.synchronizingExternalPalette) {
                return;
            }
            var oldExternalPalette = this.externalPalette;
            this.externalPalette = this.getExternalColorPalette();
            if (this.chart && this.chart.requiresExternalColorPalette() && !_.isEqual(oldExternalPalette, this.externalPalette)) {
                this.invalidate('updateViewPass');
            }
        },
        destroyChart: function() {
            if(this.chart) {
                this.chart.off();
                this.chart.destroy();
                delete this.chart; // GC handler
            }
        },
        reflow: function() {
            if(this.chart && this.$el.height() > 0) {
                this.updateChartContainerHeight();
                this.chart.resize();
            }
        },
        updateChartContainerHeight: function() {
            var messageHeight = this.$inlineMessage.is(':empty') ? 0 : this.$inlineMessage.outerHeight();
            this.$chart.height(this.$el.height() - messageHeight);
        },
        renderResultsTruncatedMessage: function() {
            var message = _('These results may be truncated. Your search generated too much data for the current visualization configuration.').t();
            message = this.addTruncationDocsLink(message);
            this.$inlineMessage.html(_(this.inlineMessageTemplate).template({ message: message, level: 'warning' }));
        },
        renderMaxResultCountMessage: function(resultCount) {
            var message = splunkUtils.sprintf(
                _('These results may be truncated. This visualization is configured to display a maximum of %s results per series, and that limit has been reached.').t(),
                resultCount
            );
            message = this.addTruncationDocsLink(message);
            this.$inlineMessage.html(_(this.inlineMessageTemplate).template({ message: message, level: 'warning' }));
        },
        computeDisplayProperties: function() {
            this.displayProperties = {};
            _.each(this.model.config.toJSON(), function(value, key){
                if(this.VIZ_PROPERTY_PREFIX_REGEX.test(key)) {
                    this.displayProperties[key.replace(this.VIZ_PROPERTY_PREFIX_REGEX, '')] = value;
                }
            }, this);
        },
        addTruncationDocsLink: function(message) {
            var docsHref = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.charting.datatruncation'
                ),
                helpLink = ' <a href="<%- href %>" target="_blank">' +
                                '<span><%- text %></span>' +
                                '<i class="icon-external icon-no-underline"></i>' +
                            '</a>';

            return message + _(helpLink).template({ href: docsHref, text: _('Learn More').t() });
        },
        inlineMessageTemplate: '\
            <div class="alert alert-inline alert-<%= level %> alert-inline"> \
                <i class="icon-alert"></i> \
                <%= message %> \
            </div> \
        '
    },
    {
        // A placeholder for the charting library, which will be lazy-loaded.
        // This is visible for testing only.
        JSCHARTING_LIBRARY: null,

        getInitialDataParams: function(configJson) {
            var count = 10000;
            if (configModel.has('JSCHART_RESULTS_LIMIT')) {
                count = parseInt(configModel.get('JSCHART_RESULTS_LIMIT'), 10) || 0;
            }
            if (configJson.hasOwnProperty('display.visualizations.charting.data.count')) {
                var customCount = parseInt(configJson['display.visualizations.charting.data.count'], 10);
                if (!_.isNaN(customCount)) {
                    count = customCount;
                }
            }
            return ({
                output_mode: 'json_cols',
                show_metadata: true,
                show_empty_fields: 'True',
                offset: 0,
                count: count
            });
        }
    });

    return JSChart;

 });
