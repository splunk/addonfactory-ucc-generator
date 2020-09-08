/**
 * @author jszeto
 * @date 7/17/14
 *
 * Displays a table of DirectoryItem rows
 *
 * Inputs:
 *
 *     collection {collections/services/data/vix_indexes/DirectoryItems}
 *     model: {
 *         metadata {models} sorting, filtering and pagination attributes
 *     }
 */

define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    './DirectoryItemRow',
    'views/shared/TableHead',
    'helpers/grid/RowIterator'
],
    function(
        $,
        _,
        module,
        Base,
        DirectoryItemRow,
        TableHead,
        RowIterator
        ) {

        return Base.extend({

            moduleId: module.id,
            directoryItemRows: [],

            initialize: function(options) {
                Base.prototype.initialize.call(this, options);

                this.collection.on('request', function() {
                    this.hideTable();
                }, this);

                this.collection.on('sync', function() {
                    this.showTable();
                }, this);

                this.collection.on('reset add remove', function() {
//                    console.log("DirectoryItemsTable.collection add remove or reset");
                    this.debouncedRender();
                }, this);

                this.children.head = new TableHead({
                    model: this.model.metadata,
                    columns: [
                        { label: _('Type').t(), className: 'col-type', sortKey: 'hasSubNodes'},
                        { label: _('Name').t(), className: 'col-name', sortKey: 'basename'},
                        { label: _('Owner').t(), className: 'col-owner', sortKey: 'owner'},
                        { label: _('Size').t(), className: 'col-file-size', sortKey: 'size'},
                        { label: _('Permissions').t(), className: 'col-permissions'},
                        { label: _('Last Modified Time').t(), className: 'col-last-modified-time', sortKey: 'mtime'}
                    ]
                });
            },

            rowClickedHandler: function(type, index, fullPath) {
//                console.log("rowClickedHandler", type, index, fullPath);
                if (type == "dir") {
                    this.updateActiveRow(-1); // Clear the selection
                } else {
                    this.updateActiveRow(index);
                }

                this.trigger("pathClicked", type, fullPath);
            },

            updateActiveRow: function(index) {
                _(this.directoryItemRows).each(function(directoryItemRow, rowIndex) {
                    if (rowIndex == index)
                        directoryItemRow.$el.addClass("active");
                    else
                        directoryItemRow.$el.removeClass("active");
                }, this);
            },

            showTable: function() {
                this.$(".directory-items-table-placeholder").show();
                this.$(".loading-placeholder").hide();
            },

            hideTable: function() {
                this.$(".directory-items-table-placeholder").hide();
                this.$(".loading-placeholder").show();
            },

            render: function() {
                var html;

//                console.log("DirectoryItemsTable.render");
                // Clean up the existing directoryItemRows
                _(this.directoryItemRows).each(function(directoryItemRow) {
                    directoryItemRow.off();
                    directoryItemRow.detach();
                    this.stopListening(directoryItemRow, "rowClicked");
                }, this);

                this.directoryItemRows = [];

//                this.stopListening(undefined, "rowClicked");

                var rowIterator = new RowIterator();

                if (!this.el.innerHTML) {
                    html = this.compiledTemplate({});
                    this.$el.html(html);
                }

                // TODO [JCS] Only create rows the first time through. Reuse them afterwards?
                // Problem is row count might be different
                // Create a new DirectoryItemRow for each DataModel
                rowIterator.eachRow(this.collection, function(directoryItem, index, rowNumber) {
                    var directoryItemRow = new DirectoryItemRow({
                        model: directoryItem,
                        index: index,
                        rowNumber: rowNumber});

                    this.directoryItemRows.push(directoryItemRow);
                    this.listenTo(directoryItemRow, "rowClicked", this.rowClickedHandler);
                    // TODO [JCS] Move this out of the loop for better performance
                    this.$(".directory-items-table-placeholder").append(directoryItemRow.render().el);
                }, this);

                this.$('.directory-items-table-head-placeholder').replaceWith(this.children.head.render().el);

                return this;
            },

            template: '\
            <table class="table table-chrome table-striped table-row-expanding">\
                <thead class="directory-items-table-head-placeholder"></thead>\
                <tbody class="directory-items-table-placeholder"></tbody>\
            </table>\
            <div class="loading-placeholder"><%- _("Loading...").t() %></div>\
        '

        });

    });
