/**
 * @author sfishel
 *
 * A mock for the "models/pivot/PivotReport" model
 */

define(['mocks/models/MockSplunkD', 'mocks/collections/pivot/MockReportElements'], function(MockModel, MockElements) {

    return MockModel.extend({

        initialize: function(attrs) {
            MockModel.prototype.initialize.call(this, attrs);
            this.filterList = [];
            this.cellList = [];
            this.rowList = [];
            this.columnList = [];
            this.empty = true;
        },

        initializeAssociated: function() {
            MockModel.prototype.initializeAssociated.call(this);
            var content = this.entry.content;
            content.filters = new MockElements();
            content.cells = new MockElements();
            content.columns = new MockElements();
            content.rows = new MockElements();
        },

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

        createNewElement: function(type, attrs) {
            return new MockModel(attrs);
        },

        getElement: function(type, id) {
            var elemCollection = this.getElementCollectionByType(type);
            return elemCollection.get(id);
        },

        getPivotJSON: function() {
            return this.toJSON();
        },

        setFromPivotJSON: function(json) {
            return this.set(json);
        },

        removeElement: function() { },

        addElement: function() { },

        reSortElements: function() { },

        transferElement: function() { },

        hotSwapElement: function() { },

        getFilterList: function() {
            return this.filterList;
        },

        getCellList: function() {
            return this.cellList;
        },

        getRowList: function() {
            return this.rowList;
        },

        getColumnList: function() {
            return this.columnList;
        },

        setFilterList: function(list) {
            this.filterList = list;
            this.getElementCollectionByType('filter').reset(list);
        },

        setCellList: function(list) {
            this.cellList = list;
            this.getElementCollectionByType('cell').reset(list);
        },

        setRowList: function(list) {
            this.rowList = list;
            this.getElementCollectionByType('row').reset(list);
        },

        setColumnList: function(list) {
            this.columnList = list;
            this.getElementCollectionByType('column').reset(list);
        },

        isEmpty: function() {
            return this.empty;
        },

        toReportJSON: function() {
            return this.toJSON();
        },

        getPivotObjectName: function() {

        }

    },
    {

        TO_URI_FILTER: ['.*']

    });

});