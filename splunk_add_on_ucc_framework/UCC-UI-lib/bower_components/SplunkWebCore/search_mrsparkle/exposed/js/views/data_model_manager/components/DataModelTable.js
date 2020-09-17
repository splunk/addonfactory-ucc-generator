/**
 * @author jszeto
 * @date 1/23/13
 *
 * Displays a table of Data Model rows
 *
 * Inputs:
 *
 *     collection {collections/services/datamodel/DataModels}
 *     model: {
 *         application {models/Application}
 *         metadata {models/shared/EAIFilterFetchData} sorting, filtering and pagination attributes
 *         settings {Backbone.Model}
 *         user {models/services/authentication/User}
 *     }
 *
 * @fires DataModelRow#action:editPermissions
 * @fires DataModelRow#action:editAcceleration
 * @fires DataModelRow#action:cloneDataModel
 * @fires DataModelRow#action:openAccelerateDialog
 * @fires DataModelRow#action:editDataModel
 * @fires DataModelRow#action:editDataModelTitle
 * @fires DataModelRow#action:deleteDataModel
 */

define([
    'jquery',
    'underscore',
    'module',
    'models/Base',
    'views/Base',
    'views/data_model_manager/components/DataModelRow',
    'views/shared/delegates/RowExpandCollapse',
    'views/shared/TableHead',
    'helpers/grid/RowIterator'
],
    function(
        $,
        _,
        module,
        BaseModel,
        Base,
        DataModelRow,
        RowExpandCollapse,
        TableHead,
        RowIterator
        ) {

        return Base.extend({

            moduleId: module.id,
            dataModelRows: [],

            initialize: function(options) {
                Base.prototype.initialize.call(this, options);
                this.collection.on('reset add remove', this.debouncedRender, this);
            },

            render: function() {

                var rowIterator = new RowIterator(),
                    html = this.compiledTemplate({}),
                    $html = $(html);

                if (typeof this.children.head !== 'undefined') {
                    $(this.children.head.el).remove();
                    this.children.head.remove();
                }

                this.children.head = new TableHead({
                    model: this.model.metadata,
                    columns: [
                        { label: _('i').t(), className: RowExpandCollapse.HEADER_CELL_CLASS, html: RowExpandCollapse.HEADER_CELL_MARKUP},
                        { label: _('Title').t(), className: 'col-title', sortKey: 'displayName'},
                        { label: _('Type').t(), className: 'col-type', sortKey: 'dataset.type'},
                        { label: _('Accelerate').t(), className: 'col-accelerate', html:'<i class="icon-lightning"></i>'},
                        { label: _('Actions').t(), className: 'col-actions'},
                        { label: _('App').t(), className: 'col-app', sortKey: 'eai:acl.app,name'},
                        { label: _('Owner').t(), className: 'col-owner', sortKey: 'eai:acl.owner,name'},
                        { label: _('Sharing').t(), className: 'col-sharing', sortKey: 'eai:acl.sharing,name'}

                    ]
                });

                // Clean up the existing dataModelRows
                _(this.dataModelRows).each(function(dataModelRow) {
                    dataModelRow.off();
                    dataModelRow.detach();
                }, this);

                this.dataModelRows = [];

                // Create a new DataModelRow for each DataModel
                rowIterator.eachRow(this.collection, function(dataModel, index, rowNumber, isExpanded) {
                    var dataModelRow = new DataModelRow({
                        model: {dataModel: dataModel,
                                application: this.model.application,
                                settings: this.model.settings,
                                user: this.model.user},
                        isExpanded: isExpanded,
                        index: index,
                        rowNumber: rowNumber});

                    // Proxy all events up
                    dataModelRow.on("all", function() {
                        this.trigger.apply(this, arguments);
                    }, this);

                    this.dataModelRows.push(dataModelRow);
                    // TODO [JCS] Move this out of the loop for better performance
                    $html.find(".data-model-table-body").append(dataModelRow.render().el);

                }, this);


                $html.find('.data-model-table-head-placeholder').replaceWith(this.children.head.render().el);

                this.$el.html($html);

                return this;


            },

            template: '\
            <table class="table table-chrome table-striped table-row-expanding">\
                <thead class="data-model-table-head-placeholder"></thead>\
                <tbody class="data-model-table-body"></tbody>\
            </table>\
        '

        });

    });
