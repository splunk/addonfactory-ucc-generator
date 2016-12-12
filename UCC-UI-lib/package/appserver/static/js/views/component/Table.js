/*global define*/
define([
    'lodash',
    'app/views/component/TableRow',
    'app/views/component/MoreInfo',
    'views/Base',
    'views/shared/TableHead',
    'views/shared/delegates/TableRowToggle'
], function (
    _,
    TableRow,
    MoreInfo,
    BaseView,
    TableHeadView,
    TableRowToggleView
) {
    return BaseView.extend({
        initialize: function (options) {
            this.stateModel = options.stateModel;
            this.collection = options.collection;
            this.refCollection = options.refCollection;
            this.enableBulkActions = options.enableBulkActions;
            this.enableMoreInfo = options.enableMoreInfo;
            this.showActions = options.showActions;
            this.dispatcher = options.dispatcher;
            this.component = options.component;

            if (this.refCollection !== undefined) {
                _.each(this.collection.models, function (model) {
                    let count = 0;
                    _.each(this.refCollection.models, function (refModel) {
                        count ++;
                    }.bind(this));
                    model.entry.content.attributes.refCount = count;
                }.bind(this));
            }

            //Expand the detail row
            this.children.tableRowToggle = new TableRowToggleView({el: this.el, collapseOthers: true });
            //Table Header
            var tableHeaders = [],
                // header,
                TableHead;
            if (this.enableMoreInfo) {
                tableHeaders.push({label: 'i', className: 'col-info', html: '<i class="icon-info"></i>'});
            }

            // header = this.component.header;
            _.each(this.component.table.header, h => {
                tableHeaders.push({
                    "label": _(h.label).t(),
                    "className": 'col-' + h.field,
                    "sortKey": h.field
                });
            });
            // _.each(this.component.table.header, function (h) {
            //     let item = {};
            //     item.label = _(h.label).t();
            //     item.className = 'col-' + h.field;
            //     item.sortKey = h.field;
            //     // if (h.sort) {
            //     //     item.sortKey = h.field;
            //     // }
            //     tableHeaders.push(item);
            // });
            if (this.showActions) {
                tableHeaders.push({label: _('Actions').t(), className: 'col-action'});
            }
            //TODO: implement bulk action
            TableHead = TableHeadView;

            this.children.head = new TableHead({
                model: this.stateModel,
                columns: tableHeaders
            });
            this.children.rows = this.rowsFromCollection();
            this.activate();
        },

        startListening: function () {
            this.listenTo(this.collection, 'remove', this.renderRows);
            this.listenTo(this.collection, 'reset', this.renderRows);
            this.listenTo(this.collection, 'change', this.renderRows);
            this.listenTo(this.collection, 'add', this.addWithOffsetChange);
        },

        addWithOffsetChange: function () {
            if (this.collection._url === undefined) {
                this.dispatcher.trigger('add-input');
            }
        },

        rowsFromCollection: function () {
            return _.flattenDeep(
                this.collection.map(function (model, i) {
                    var result = [];
                    result.push(new TableRow({
                        dispatcher: this.dispatcher,
                        model: {
                            entity: model,
                            stateModel: this.stateModel,
                            enableBulkActions: false,
                            enableMoreInfo: this.enableMoreInfo,
                            showActions: true,
                            collection: this.collection,
                            component: this.component
                        },
                        index: i
                    }));
                    if (this.enableMoreInfo) {
                        result.push(new MoreInfo({
                            dispatcher: this.dispatcher,
                            model: {
                                entity: model,
                                stateModel: this.stateModel,
                                component: this.component
                            },
                            index: i
                        }));
                    }
                    return result;
                }, this)
            );
        },
        _render: function () {
            _(this.children.rows).each(row => {
                this.$el.find('tbody:first').append(row.render().$el);
            }, this);
        },
        renderRows: function () {
            _(this.children.rows).each(function (row) {
                row.remove();
            }, this);
            this.children.rows = this.rowsFromCollection();
            this._render();
        },
        render: function () {
            if (!this.el.innerHTML) {
                this.$el.append(this.compiledTemplate({}));
                this.children.head.render().prependTo(this.$('> .table-chrome'));
            }
            this._render();
            return this;
        },
        template: [
            '<table class="table table-chrome table-striped table-row-expanding table-listing">',
            '<tbody class="app-listings"></tbody>',
            '</table>'
        ].join('')
    });

});
