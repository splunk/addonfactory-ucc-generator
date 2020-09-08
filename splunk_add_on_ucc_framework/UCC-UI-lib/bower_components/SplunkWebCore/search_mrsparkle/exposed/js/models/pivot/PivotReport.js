/**
 * A model that represents the current state of a pivot report.
 *
 * Contains four associated collections for the four types of pivot report element.  Exposes methods for manipulating
 * those report element, as well as for managing changes in the visualization type of the report.
 */

define([
            'jquery',
            'underscore',
            'backbone',
            'collections/pivot/elements/FilterElements',
            'collections/pivot/elements/CellElements',
            'collections/pivot/elements/ColumnElements',
            'collections/pivot/elements/RowElements',
            'models/search/Report',
            'models/shared/Visualization',
            'helpers/pivot/PivotVisualizationManager',
            'util/model_utils',
            'splunk.util',
            'helpers/VisualizationRegistry'
        ],
        function(
            $,
            _,
            Backbone,
            FilterElements,
            CellElements,
            ColumnElements,
            RowElements,
            Report,
            Visualization,
            pivotVizManager,
            modelUtils,
            splunkUtils,
            VisualizationRegistry
        ) {

    var CONTENT_DEFAULTS = {
        showRowSummary: 'false',
        rowLimitType: 'default',
        rowLimitAmount: 100,
        showColSummary: 'false',
        colLimitAmount: 100,
        showOtherCol: 'true'
    };

    var PivotReport = Report.extend({

        initialize: function(attrs) {
            Report.prototype.initialize.call(this, attrs);

            // create a synthetic event to capture any changes or updates to one of the element collections
            _(['filters', 'cells', 'rows', 'columns']).each(function(collectionName) {
                var collection = this.entry.content[collectionName];
                collection.on('change', function() {
                    this.trigger('reportConfigChange');
                }, this);
            }, this);

            this.entry.content.on('change', function() {
                var changed = this.entry.content.filterChangedByWildcards(PivotReport.PIVOT_CONTENT_FILTER, { allowEmpty: true });
                if(!_.isEmpty(changed)) {
                    this.trigger('reportConfigChange');
                }
            }, this);
        },

        /***********************************************************************************************************
         * Helpers for manipulating the pivot element collections                                                  *
         ***********************************************************************************************************/

        getElementCollectionByType: function(type) {
            var TYPE_TO_COLLECTION_NAME = {
                filter: 'filters',
                cell: 'cells',
                row: 'rows',
                column: 'columns'
            };
            var collectionName = TYPE_TO_COLLECTION_NAME[type];
            return this.entry.content[collectionName];
        },

        getElementDescription: function(element) {
            return ({
                id: element.cid,
                label: element.getComputedLabel(),
                type: element.get('type')
            });
        },

        getFilterList: function() {
            return this.getElementCollectionByType('filter').map(this.getElementDescription, this);
        },

        getCellList: function() {
            return this.getElementCollectionByType('cell').map(this.getElementDescription, this);
        },

        getColumnList: function() {
            return this.getElementCollectionByType('column').map(this.getElementDescription, this);
        },

        getRowList: function() {
            return this.getElementCollectionByType('row').map(this.getElementDescription, this);
        },

        getNumFilters: function() {
            return this.getElementCollectionByType('filter').length;
        },

        getNumCells: function() {
            return this.getElementCollectionByType('cell').length;
        },

        getNumRows: function() {
            return this.getElementCollectionByType('row').length;
        },

        getNumColumns: function() {
            return this.getElementCollectionByType('column').length;
        },

        isComplete: function() {
            var vizConfig = pivotVizManager.getConfigByVizType(this.getVisualizationType());

            var requiredCountByElementType = function(elementType) {
                var count = 0,
                    eligiblePanels = _(vizConfig.configMenuPanels).filter(function(panel) {
                        return panel.elementType === elementType;
                    });

                _(eligiblePanels).each(function(panel) {
                    if(panel.required) {
                        count += panel.maxLength;
                    }
                });

                return count;
            };

            return (
                this.getNumColumns() >= requiredCountByElementType(pivotVizManager.COLUMN_SPLIT) &&
                this.getNumRows() >= requiredCountByElementType(pivotVizManager.ROW_SPLIT) &&
                this.getNumCells() >= requiredCountByElementType(pivotVizManager.CELL_VALUE)
            );
        },

        // validate whether or not the limit amount attribute should be enabled for the current split configuration
        // accepts an optional incoming element as a way to pre-validate an element that is about to be added or edited
        // if the limit amount should not be enabled, returns a message describing why, otherwise returns false
        validateLimitAmountEnabled: function(splitType, prevalidateElement, prevalidateElementIndex) {
            var splits = this.getElementCollectionByType(splitType).toArray();
            if(prevalidateElement) {
                // perform either a push or a replace operation with the prevalidateElement,
                // using the prevalidateElementIndex to determine whether it already exists in the collection or not
                if(prevalidateElementIndex >= splits.length) {
                    splits.push(prevalidateElement);
                }
                else {
                    splits[prevalidateElementIndex] = prevalidateElement;
                }
            }
            if(splits.length !== 1) {
                return false;
            }
            var firstSplitType = splits[0].get('type');
            if(firstSplitType === 'timestamp') {
                return _('Not applied to a single time split.').t();
            }
            if(firstSplitType === 'boolean') {
                return _('Not applied to a single boolean split').t();
            }
            if(firstSplitType === 'number' && splits[0].get('display') === 'ranges') {
                return _('Not applied to a single range-based split.').t();
            }
            return false;
        },

        isValid: function(options) {
            var content = this.entry.content;
            return (Report.prototype.isValid.call(this, options)
                && content.isValid(options)
                && content.filters.isValid(options)
                && content.columns.isValid(options)
                && content.rows.isValid(options)
                && content.cells.isValid(options)
            );
        },

        /**
         * Add a new element to the report
         *
         * @param type {String} - the element type (filter, cell, column, or row)
         * @param attributesOrModel {Object | Model} - either an existing model or attributes to instantiate a new model
         * @param options {Object} - options to be passed to the collection add method
         */

        addElement: function(type, attributesOrModel, options) {
            var elemCollection = this.getElementCollectionByType(type);

            if(attributesOrModel instanceof Backbone.Model) {
                if(!attributesOrModel.has('owner')) {
                    attributesOrModel.set({ owner: this.getPivotObjectName() });
                }
                elemCollection.add(attributesOrModel, options);
            }
            else {
                var defaults = {
                    owner: this.getPivotObjectName()
                };
                elemCollection.add($.extend(defaults, attributesOrModel), options);
            }
            this.trigger('reportConfigUpdate');
            this.trigger('reportConfigChange');
        },

        hotSwapElement: function(type, element, newAttrs) {
            if(element.get('type') === newAttrs.type) {
                // if the data type is not different, we can update in-place
                element.restoreDefaults({ silent: true });
                element.set(newAttrs);
            }
            else {
                // otherwise we will have to hot-swap with an element of the new type
                var collection = this.getElementCollectionByType(type),
                    newElement = this.createNewElement(type, newAttrs),
                    elementIndex = collection.indexOf(element);

                collection.remove(element);
                collection.add(newElement, { at: elementIndex });
                this.trigger('reportConfigUpdate');
                this.trigger('reportConfigChange');
            }
        },

        /**
         * Transfer an element from one type collection to another.
         *
         * If transferring from row to column, the source element's attributes are preserved (except label).
         * If transferring from column to row, the source element's attributes are preserved.
         * In all other cases, the only attributes copied are fieldName, type, owner, and displayName
         *
         * @param fromType {String} - the source element type (filter, cell, column, or row)
         * @param toType {String} - the target element type (filter, cell, column, or row)
         * @param id {String} - the cid of the source element
         * @param options {Object} - optional settings to customize the behavior:
         *          removeOriginal {Boolean} - whether to remove the source element, defaults to true
         *          at {Integer} - the index in the destination collection where the element should be added, defaults to zero
         */

        transferElement: function(fromType, toType, id, options) {
            options = options || {};
            var fromCollection = this.getElementCollectionByType(fromType),
                toCollection = this.getElementCollectionByType(toType),
                originalElement = fromCollection.get(id),
                removeOriginal = options.removeOriginal !== false;

            var newAttrs;
            if(fromType === 'row' && toType === 'column') {
                newAttrs = $.extend({}, originalElement.attributes);
                delete(newAttrs.label);
                delete(newAttrs.limitAmount);
                delete(newAttrs.elementType);
            }
            else if(fromType === 'column' && toType === 'row') {
                newAttrs = $.extend({}, originalElement.attributes);
                delete(newAttrs.elementType);
            }
            else {
                newAttrs = {
                    fieldName: originalElement.get('fieldName'),
                    type: originalElement.get('type'),
                    owner: originalElement.get('owner'),
                    displayName: originalElement.get('displayName')
                };
            }
            toCollection.add(newAttrs, _(options).pick('at'));
            if(removeOriginal) {
                fromCollection.remove(id);
            }
            this.trigger('reportConfigUpdate');
            this.trigger('reportConfigChange');
        },

        /**
         * Creates and returns a new element model of the given type with the given attributes.
         *
         * This element is not added to any of the existing collections.
         *
         * @param type {String} - the element type (filter, cell, column, or row)
         * @param attributes {Object} - the attributes to pass to the model constructor
         * @return {Model}
         */

        createNewElement: function(type, attributes) {
            var defaults = {
                owner: this.getPivotObjectName()
            };
            $.extend(defaults, attributes);

            // XXX: probably not good to access the collection's model attribute directly
            switch(type) {
                case 'filter':
                    var filterCollection = this.getElementCollectionByType('filter');
                    return new filterCollection.model(attributes);
                case 'row':
                    var rowCollection = this.getElementCollectionByType('row');
                    return new rowCollection.model(attributes);
                case 'column':
                    var columnCollection = this.getElementCollectionByType('column');
                    return new columnCollection.model(attributes);
                case 'cell':
                    var cellCollection = this.getElementCollectionByType('cell');
                    return new cellCollection.model(attributes);
                default:
                    throw 'Can only create elements of type filter, row, column or cell';
            }
        },

        /**
         * Remove an element from the report.
         *
         * No-op if the element is not in the report.
         *
         * @param type {String} - the element type (filter, cell, column, or row)
         * @param element {Model} - the element to be removed
         * @param options {Object} - options to be passed to the collection remove method
         */

        removeElement: function(type, element, options) {
            var elemCollection = this.getElementCollectionByType(type);
            elemCollection.remove(element, options);
            this.trigger('reportConfigUpdate');
            this.trigger('reportConfigChange');
        },

        /**
         * Re-order the elements in the collection of the given type.
         *
         * No-op if the given order is the same as the existing order.
         *
         * @param type {String} - the element type (filter, cell, column, or row)
         * @param order {Array<String>} - a list of model cid's representing the new order
         * @param options {Object} - options to pass to the collection's reset method
         */

        reSortElements: function(type, order, options) {
            var elemCollection = this.getElementCollectionByType(type),
                existingOrder = elemCollection.map(function(model) { return model.cid; });

            if(_.isEqual(order, existingOrder)) {
                return;
            }
            var sortedCollection = elemCollection.sortBy(function(item) {
                return _(order).indexOf(item.cid);
            });

            elemCollection.reset(sortedCollection, options);
            this.trigger('reportConfigUpdate');
            this.trigger('reportConfigChange');
        },

        /**
         * Get a reference to an element based on a type and id
         *
         * @param type {String} - the element type (filter, cell, column, or row)
         * @param id {String} - the cid of the model
         * @return {Model}
         */

        getElement: function(type, id) {
            var elemCollection = this.getElementCollectionByType(type);
            return elemCollection.get(id);
        },

        /***********************************************************************************************************
         * Helpers for getting/setting the visualization type                                                      *
         ***********************************************************************************************************/

        setVisualizationType: function(newType, options) {
            var currentVizType = this.getVisualizationType();
            if(newType === currentVizType) {
                return;
            }
            var newConfig = VisualizationRegistry.getVisualizationById(newType);
            this.entry.content.set(newConfig ? newConfig.matchConfig : {}, options);
            if (!options || !options.silent) {
                this.trigger('visualizationTypeChange', newType, currentVizType, this);
            }
        },

        getVisualizationType: function() {
            var config = VisualizationRegistry.findVisualizationForConfig(this.entry.content.toJSON());
            return config ? config.id : null;
        },

        /***********************************************************************************************************
         * Helpers/definitions for the sync behavior                                                               *
         ***********************************************************************************************************/

        initializeAssociated: function() {
            Report.prototype.initializeAssociated.call(this);
            var Content = this.constructor.Entry.Content,
                content = this.entry.content;

            content.filters = content.associated.filters = content.filters || new Content.Filters();
            content.cells = content.associated.cells = content.cells || new Content.Cells();
            content.columns = content.associated.columns = content.columns || new Content.Columns();
            content.rows = content.associated.rows = content.rows || new Content.Rows();
        },

        clone: function() {
            var originalContent = this.entry.content,
                clone = new this.constructor(),
                cloneContent = clone.entry.content,
                splunkDPayload = this.toSplunkD();

            clone.setFromSplunkD(splunkDPayload);
            cloneContent.filters.reset(originalContent.filters.deepClone().toArray());
            cloneContent.columns.reset(originalContent.columns.deepClone().toArray());
            cloneContent.rows.reset(originalContent.rows.deepClone().toArray());
            cloneContent.cells.reset(originalContent.cells.deepClone().toArray());
            return clone;
        },

        setFromPivotJSON: function(pivotJSON, options) {
            if(typeof pivotJSON === 'string') {
                pivotJSON = JSON.parse(pivotJSON);
            }
            var contentModel = this.entry.content,
                setObject = _(pivotJSON).pick('baseClass', 'baseClassLineage'),
                rowFormat = pivotJSON.rowFormat,
                colFormat = pivotJSON.colFormat;

            if(rowFormat) {
                setObject.showRowSummary = rowFormat.hasOwnProperty('showSummary') ?
                                                    rowFormat.showSummary.toString() : CONTENT_DEFAULTS.showRowSummary;
                setObject.rowLimitType = rowFormat.limitType || CONTENT_DEFAULTS.rowLimitType;
                if(rowFormat.hasOwnProperty('limitAmount')) {
                    setObject.rowLimitAmount = rowFormat.limitAmount;
                }
            }

            if(colFormat) {
                setObject.showColSummary = colFormat.hasOwnProperty('showSummary') ?
                                                    colFormat.showSummary.toString() : CONTENT_DEFAULTS.showColSummary;
                setObject.showOtherCol = colFormat.hasOwnProperty('showOther') ?
                                                    colFormat.showOther.toString() : CONTENT_DEFAULTS.showOtherCol;
                if(colFormat.hasOwnProperty('limitAmount')) {
                    setObject.colLimitAmount = colFormat.limitAmount;
                }
            }

            contentModel.set(setObject, options);
            modelUtils.safeResetCollection(contentModel.filters, pivotJSON.filters, $.extend({ parse: true }, options));
            modelUtils.safeResetCollection(contentModel.cells, pivotJSON.cells, $.extend({ parse: true }, options));
            modelUtils.safeResetCollection(contentModel.columns, pivotJSON.columns, $.extend({ parse: true }, options));
            modelUtils.safeResetCollection(contentModel.rows, pivotJSON.rows, $.extend({ parse: true }, options));
        },

        getPivotJSON: function() {
            var content = this.entry.content,
                pivotObjectName = this.getPivotObjectName(),
                pivotObjectLineage = content.get('baseClassLineage'),
                rowJSON = this.getElementCollectionByType('row').toJSON(),
                columnJSON = this.getElementCollectionByType('column').toJSON(),
                cellJSON = this.getElementCollectionByType('cell').toJSON(),
                limitType = content.get('rowLimitType'),
                pivotJSON = {
                    baseClass: pivotObjectName,
                    baseClassLineage: pivotObjectLineage,
                    filters: this.getElementCollectionByType('filter').toJSON(),
                    cells: cellJSON,
                    rows: rowJSON,
                    columns: columnJSON
                };

            if(content.get('search')) {
                pivotJSON.dataModel = PivotReport.parseModelAndObjectFromSearch(content.get('search'))[1];
            }

            // always sort by the first split
            if(rowJSON.length > 0) {
                pivotJSON.rowFormat = {
                    limitType: limitType,
                    showSummary: splunkUtils.normalizeBoolean(content.get('showRowSummary')),
                    limitFieldName: rowJSON[0].fieldName,
                    limitFieldOwner: rowJSON[0].owner
                };

                if(!this.validateLimitAmountEnabled('row')) {
                    pivotJSON.rowFormat.limitAmount = content.get('rowLimitAmount');
                }
                else {
                    pivotJSON.rowFormat.limitAmount = CONTENT_DEFAULTS.rowLimitAmount;
                }

                // if the limitType is not 'default', we need to send additional information on how to sort the rows
                // we want the report to always use the first compatible cell value as the "limit-by" field for the first row split
                // if no such cell value exists, just use the count of the pivot object
                if(limitType !== 'default') {
                    var limitByObject = _(cellJSON).find(function(cellObject) {
                        return (
                            cellObject.value in { count: true, dc: true, sum: true, avg: true } ||
                            cellObject.type in { objectCount: true, childCount: true }
                        );
                    });
                    limitByObject = limitByObject || { fieldName: pivotObjectName, owner: pivotObjectLineage, value: 'count' };

                    $.extend(pivotJSON.rowFormat, {
                        limitByAttributeName: limitByObject.fieldName,
                        limitByAttributeOwner: limitByObject.owner,
                        limitStatsFn: limitByObject.value || 'count'
                    });
                }
            }

            if(columnJSON.length > 0) {
                pivotJSON.colFormat = {
                    showSummary: splunkUtils.normalizeBoolean(content.get('showColSummary')),
                    showOther: splunkUtils.normalizeBoolean(content.get('showOtherCol'))
                };
                if(!this.validateLimitAmountEnabled('column')) {
                    pivotJSON.colFormat.limitAmount = content.get('colLimitAmount');
                }
                else {
                    pivotJSON.colFormat.limitAmount = CONTENT_DEFAULTS.colLimitAmount;
                }
            }

            return pivotJSON;
        },

        getPivotObjectName: function() {
            return this.entry.content.get('baseClass');
        },

        getIndexTimeFilter: function() {
            return this.entry.content.filters.find(function(filter) {
                return filter.get('fieldName') === '_time';
            });
        }

    },
    {

        REPORT_FORMAT_FILTER: [
            "^display\.statistics\..*",
            "^display\.prefs\.statistics\.count$",
            "^display\.visualizations\..*",
            "^display\.general\.type$"
        ],

        PIVOT_CONTENT_FILTER: [
            '^showRowSummary$',
            '^rowLimitType$',
            '^rowLimitAmount$',
            '^showColSummary$',
            '^colLimitAmount$',
            '^showOtherCol$'
        ],

        // exposed for testing only
        CONTENT_DEFAULTS: CONTENT_DEFAULTS,

        parseModelAndObjectFromSearch: function(searchString) {

            return (/^\s*\|\s*pivot\s+(\w+:"[^"]+")\s+(\w+)/).exec(searchString) ||
                (/^\s*\|\s*pivot\s+([\w.:-]+)\s+(\w+)/).exec(searchString);
        }

    });

    // break the shared reference to Entry
    PivotReport.Entry = Report.Entry.extend({});
    // now we can safely change Entry.Content
    PivotReport.Entry.Content = Visualization.extend({
        defaults: $.extend({}, Visualization.prototype.defaults, CONTENT_DEFAULTS),
        validation: $.extend({}, Visualization.prototype.validation, {
            rowLimitAmount: {
                pattern: 'number',
                min: 0,
                max: 1000000,
                msg: _('Limit must be a number between 0 and 1,000,000.').t(),
                required: true
            },
            colLimitAmount: {
                pattern: 'number',
                min: 0,
                max: 1000,
                msg: _('Limit must be a number between 0 and 1,000.').t(),
                required: true
            }
        })
    },
    {

        Filters: FilterElements,
        Cells: CellElements,
        Columns: ColumnElements,
        Rows: RowElements

    });

    return PivotReport;

});
