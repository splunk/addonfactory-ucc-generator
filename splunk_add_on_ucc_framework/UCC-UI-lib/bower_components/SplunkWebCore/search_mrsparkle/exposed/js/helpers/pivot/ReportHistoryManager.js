define([
            'jquery',
            'underscore',
            'helpers/pivot/PivotVisualizationManager',
            'models/pivot/PivotReport',
            'util/pivot/config_form_utils'
        ],
        function(
            $,
            _,
            pivotVizManager,
            PivotReport,
            configFormUtils
        ) {

    var ReportHistoryManager = function() {
        // use a dictionary to store the most recent report configuration for each visualization type category
        this.reportConfigHistory = {};
        this.vizDefaults = {
            shared: {
                'display.visualizations.charting.chart.stackMode': 'default',
                'display.visualizations.charting.legend.placement': 'right',
                'display.visualizations.charting.axisTitleY.text': ''
            },
            area: {
                'display.visualizations.charting.chart.stackMode': 'stacked'
            },
            overrides: {}
        };
        this.lastAppliedVizUpdates = {};
    };

    $.extend(ReportHistoryManager.prototype, {

        register: function(report) {
            var reportContent = report.entry.content,
                vizDefaults = $.extend(true, {}, this.getVizSpecificReportDefaults(report), this.lastAppliedVizUpdates);

            // use the current values of the report to populate some overrides to the default visualization properties
            // but only the ones that differ from the default
            _(vizDefaults).each(function(defaultValue, key) {
                var reportValue = reportContent.get(key);
                if(reportValue !== defaultValue) {
                    this.vizDefaults.overrides[key] = reportValue;
                }
            }, this);

            // bind listeners for clearing the report config history:
            // there are two reasons to clear the report history, either the active report config was changed
            // or a chart formatting attribute (besides visualization type) was changed
            report.on('reportConfigChange', function() {
                if(!this.reportChangeListenersUnbound) {
                    this.clearHistory();
                }
            }, this);
            reportContent.on('change', function() {
                if(this.reportChangeListenersUnbound) {
                    return;
                }
                var filteredChanged = report.entry.content.filterChangedByWildcards(["^display\.visualizations\..*"]);
                // ignore change events associated with setting a new visualization type
                delete filteredChanged['display.visualizations.show'];
                delete filteredChanged['display.visualizations.type'];
                delete filteredChanged['display.visualizations.charting.chart'];

                // SPL-75220, we also need to ignore gauge range/colors going from empty to their default state
                if(filteredChanged['display.visualizations.charting.chart.rangeValues'] === '["0","30","70","100"]'
                        && !reportContent.previous('display.visualizations.charting.chart.rangeValues')) {
                    delete filteredChanged['display.visualizations.charting.chart.rangeValues'];
                }
                if(filteredChanged['display.visualizations.charting.gaugeColors'] === '[0x84E900,0xFFE800,0xBF3030]'
                        && !reportContent.previous('display.visualizations.charting.gaugeColors')) {
                    delete filteredChanged['display.visualizations.charting.gaugeColors'];
                }

                if(!_(filteredChanged).isEmpty()) {
                    this.clearHistory();
                }
                this.handleReportChange(report);
            }, this);

            // also need to update the stored history entries when the visualization type changes
            report.on('visualizationTypeChange', this.handleVizTypeChange, this);
        },

        unregister: function(report) {
            report.off(null, null, this);
            report.entry.content.off(null, null, this);
            this.vizDefaults.overrides = {};
        },

        clearHistory: function() {
            this.reportConfigHistory = {};
        },

        applyVisualizationUpdates: function(report, options) {
            // un-bind report change listeners for the duration of this method
            // we don't want changes here to modify the per-viz-type defaults or clear the history
            this.unbindReportChangeListeners();
            var updates = this.getVizSpecificReportDefaults(report);
            // remove any updates that would put the model in an invalid state
            _(updates).each(function(value, key) {
                // preValidate returns truthy if the validation fails
                if(report.entry.content.preValidate(key, value)) {
                    delete updates[key];
                }
            });
            this.lastAppliedVizUpdates = updates;
            report.entry.content.set(updates, options);
            this.bindReportChangeListeners();
        },

        applyConfigUpdates: function(report, availableFields, options) {
            // un-bind report change listeners for the duration of this method
            // we don't want changes here to modify the per-viz-type defaults or clear the history
            this.unbindReportChangeListeners();
            var reportContent = report.entry.content,
                newReportConfig = this.getNewReportConfig(report, availableFields);

            reportContent.cells.reset(newReportConfig.cells.toArray(), options);
            reportContent.rows.reset(newReportConfig.rows.toArray(), options);
            reportContent.columns.reset(newReportConfig.columns.toArray(), options);
            reportContent.set(newReportConfig.reportLevelAttributes, options);
            this.bindReportChangeListeners();
        },

        getNewReportConfig: function(report, availableFields) {
            availableFields = availableFields || [];
            var vizType = report.getVisualizationType();
            if(this.hasConfigHistoryForType(vizType)) {
                return this.getConfigHistoryByType(vizType);
            }
            return this.getCoercedReportConfig(report, vizType, availableFields);
        },

        handleVizTypeChange: function(newType, previousType, report) {
            var previousHistoryKey = this.convertVizTypeToConfigHistoryKey(previousType),
                newHistoryKey = this.convertVizTypeToConfigHistoryKey(newType),
                historyKeyHasChanged = (newHistoryKey !== previousHistoryKey),
                content = report.entry.content,
                historyEntry = {
                    reportLevelAttributes: content.filterByWildcards(PivotReport.PIVOT_CONTENT_FILTER, { allowEmpty: true }),
                    cells: content.cells.clone(),
                    rows: content.rows.clone(),
                    columns: content.columns.clone()
                };

            this.previousVizType = previousType;
            if(newType === pivotVizManager.SCATTER_CHART) {
                this.preScatterRowSort = report.entry.content.get('rowLimitType');
            }

            if(_(this.reportConfigHistory).isEmpty()) {
                this.originalConfig = historyEntry;
            }
            if(historyKeyHasChanged || !this.hasConfigHistoryForType(previousHistoryKey)) {
                this.reportConfigHistory[previousHistoryKey] = historyEntry;
            }
        },

        handleReportChange: function(report) {
            var changedAttributes = report.entry.content.changedAttributes(),
                keysToUpdate = _.intersection(_(changedAttributes).keys(), _(this.vizDefaults.shared).keys());

            _(keysToUpdate).each(function(key) {
                this.vizDefaults.overrides[key] = changedAttributes[key];
            }, this);
        },

        hasConfigHistoryForType: function(vizType) {
            return this.reportConfigHistory.hasOwnProperty(this.convertVizTypeToConfigHistoryKey(vizType));
        },

        getConfigHistoryByType: function(vizType) {
            return this.reportConfigHistory[this.convertVizTypeToConfigHistoryKey(vizType)];
        },

        getVizSpecificReportDefaults: function(report) {
            var vizType = report.getVisualizationType(),
                reportContent = report.entry.content,
                columnSplits = reportContent.columns,
                cellValues = reportContent.cells,
                isSimpleCartesian = _(pivotVizManager.SIMPLE_CARTESIAN_TYPES).contains(vizType),
                defaults = $.extend({}, this.vizDefaults.shared, this.vizDefaults[vizType], this.vizDefaults.overrides);

            if(isSimpleCartesian && columnSplits.length === 0) {
                $.extend(defaults, {
                    'display.visualizations.charting.chart.stackMode': 'default',
                    'display.visualizations.charting.legend.placement': 'none'
                });
            }
            else if(isSimpleCartesian && columnSplits.length === 1 && cellValues.length > 0) {
                $.extend(defaults, {
                    'display.visualizations.charting.axisTitleY.text': cellValues.at(0).getComputedLabel()
                });
            }
            return defaults;
        },

        getCoercedReportConfig: function(report, vizType, availableFields) {
            var originalContent,
                reportContent = report.entry.content,
                newContent = {
                    cells: new reportContent.cells.constructor(),
                    rows: new reportContent.rows.constructor(),
                    columns: new reportContent.columns.constructor()
                };

            if(this.originalConfig) {
                originalContent = {
                    cells: this.originalConfig.cells.deepClone(),
                    rows: this.originalConfig.rows.deepClone(),
                    columns: this.originalConfig.columns.deepClone()
                };
            }
            else {
                originalContent = {
                    cells: reportContent.cells.deepClone(),
                    rows: reportContent.rows.deepClone(),
                    columns: reportContent.columns.deepClone()
                };
            }

            // handle stats as a no-op special case, since all report configurations are compatible
            if(vizType === pivotVizManager.STATISTICS_TABLE) {
                return originalContent;
            }

            var vizConfig = pivotVizManager.getConfigByVizType(vizType);
            newContent.reportLevelAttributes = $.extend({}, vizConfig.reportLevelAttributes);

            // When switching from scatter to another visualization type, restore the rowLimitType that was in place
            // before switching to scatter (SPL-81236).
            if(this.previousVizType === pivotVizManager.SCATTER_CHART && !newContent.reportLevelAttributes.rowLimitType) {
                newContent.reportLevelAttributes.rowLimitType = this.preScatterRowSort || 'default';
            }

            var selectByDataTypes = function(collection, allowedDataTypes) {
                if(!allowedDataTypes) {
                    return collection.toArray();
                }
                return collection.filter(function(element) {
                    return _(allowedDataTypes).contains(element.get('type'));
                }, this);
            };

            var selectCompatibleElements = function(collection, receiver) {
                var compatibleElements = selectByDataTypes(collection, receiver.dataTypes);
                if(receiver.hasOwnProperty('outputType')) {
                    compatibleElements = _(compatibleElements).filter(function(element) {
                        var elementOutputType = configFormUtils.cellValueToOutputType(element.get('value'), element.get('type'));
                        return (elementOutputType === receiver.outputType);
                    }, this);
                }
                return compatibleElements;
            };

            var collectionsToProcess = {
                cells: pivotVizManager.CELL_VALUE,
                rows: pivotVizManager.ROW_SPLIT,
                columns: pivotVizManager.COLUMN_SPLIT
            };
            _(collectionsToProcess).each(function(type, name) {
                var receivers = this.findReceiversByElementType(vizConfig, type);
                // If there are no receivers, do nothing.
                if(receivers.length > 0) {
                    // Handle the simple case where there is a single receiver and we only need to respect dataTypes,
                    // outputType, maxLength, etc.
                    if(receivers.length === 1) {
                        var receiver = receivers[0],
                            compatibleElements = selectCompatibleElements(originalContent[name], receiver);

                        if(receiver.setAttributes) {
                            _(compatibleElements).invoke('set', receiver.setAttributes, { silent: true });
                        }
                        newContent[name].reset(compatibleElements.slice(0, receiver.maxLength));
                    }
                    // Handle the advanced case where a custom elementsSelector (and possibly newElementHandler)
                    // are defined.
                    else {
                        if(!_(receivers).all(function(receiver) { return _(receiver.elementsSelector).isFunction(); })) {
                            throw new Error('If multiple receivers are defined each must have its own elementSelector');
                        }
                        _(receivers).each(function(receiver) {
                            var capturedElements = receiver.elementsSelector(
                                selectCompatibleElements(originalContent[name], receiver)
                            );
                            _(capturedElements).each(function(element) {
                                if(receiver.setAttributes) {
                                    element.set(receiver.setAttributes, { silent: true });
                                }
                                var addOptions = receiver.newElementHandler ? receiver.newElementHandler(element, true) : {};
                                newContent[name].add(element, addOptions);
                            });
                        });
                    }
                }
            }, this);
            this.autoPopulatePanels(newContent, vizConfig, availableFields);
            return newContent;
        },

        autoPopulatePanels: function(newContent, vizConfig, availableFields) {
            // look at the newContent row/column/cell collections, auto-populate them under the following conditions:
            // - the collection is empty
            // - there is only one panelConfig compatible with that collection type
            // - there is only one available field compatible with that panelConfig
            // - the receiving panelConfig has maxLength = 1 and is required

            var collectionByType = function(type) {
                if(type === pivotVizManager.ROW_SPLIT) {
                    return newContent.rows;
                }
                if(type === pivotVizManager.COLUMN_SPLIT) {
                    return newContent.columns;
                }
                // assume this won't be called with an invalid type
                return newContent.cells;
            };

            _([pivotVizManager.ROW_SPLIT, pivotVizManager.COLUMN_SPLIT, pivotVizManager.CELL_VALUE]).each(function(elementType) {
                var collection = collectionByType(elementType);
                if(collection.length > 0) {
                    return;
                }
                var receivers = this.findReceiversByElementType(vizConfig, elementType);
                if(receivers.length !== 1 || receivers[0].maxLength !== 1 || !receivers[0].required) {
                    return;
                }
                var compatibleFields = _(availableFields).filter(function(field) {
                    return _(receivers[0].dataTypes).contains(field.type);
                });
                if(compatibleFields.length === 1) {
                    collection.add(compatibleFields[0]);
                    // don't auto-populate the same field twice
                    availableFields = _(availableFields).without(compatibleFields[0]);
                }
            }, this);
        },

        findReceiversByElementType: function(vizConfig, elementType) {
            return _(vizConfig.configMenuPanels).filter(function(panel) { return panel.elementType === elementType; });
        },

        convertVizTypeToConfigHistoryKey: function(vizType) {
            if(_(pivotVizManager.BAR_COLUMN_TYPES).contains(vizType)) {
                return 'barColumn';
            }
            if(_(pivotVizManager.LINE_AREA_TYPES).contains(vizType)) {
                return 'lineArea';
            }
            if(_(pivotVizManager.GAUGE_TYPES).contains(vizType)) {
                return 'gauge';
            }
            return vizType;
        },

        unbindReportChangeListeners: function() {
            this.reportChangeListenersUnbound = true;
        },

        bindReportChangeListeners: function() {
            this.reportChangeListenersUnbound = false;
        }

    });

    return ReportHistoryManager;

});