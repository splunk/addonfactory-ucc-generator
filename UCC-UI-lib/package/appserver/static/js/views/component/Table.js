/*global __non_webpack_require__*/
define([
    'jquery',
    'lodash',
    'app/views/component/TableRow',
    'app/views/component/MoreInfo',
    'views/Base',
    'views/shared/TableHead',
    'views/shared/delegates/TableRowToggle'
], function (
    $,
    _,
    TableRow,
    MoreInfo,
    BaseView,
    TableHeadView,
    TableRowToggleView
) {
    return BaseView.extend({
        initialize: function (options) {
            _.extend(this, options);
            this.expandRows = [];
            this.deferreds = [];
            //Expand the detail row
            this.children.tableRowToggle = new TableRowToggleView({
                el: this.el,
                collapseOthers: true
            });
            //Table Header
            var tableHeaders = [],
                TableHead;
            if (this.enableMoreInfo) {
                tableHeaders.push({
                    label: 'i',
                    className: 'col-info',
                    html: '<i class="icon-info"></i>'
                });
            }

            _.each(this.component.table.header, h => {
                tableHeaders.push({
                    "label": _(h.label).t(),
                    "className": 'col-' + h.field,
                    "sortKey": h.field
                });
            });

            if (this.showActions) {
                tableHeaders.push({
                    label: _('Actions').t(),
                    className: 'col-action'
                });
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
            this.listenTo(this.collection, 'sync', this.renderRows);
            this.listenTo(this.collection, 'add', this.addWithOffsetChange);
        },

        addWithOffsetChange: function () {
            if (this.collection._url === undefined) {
                this.dispatcher.trigger('add-input');
            } else {
                this.renderRows();
            }
        },

        _load_module: function(module, component, model, index) {
            const deferred = $.Deferred();
            __non_webpack_require__(['custom/' + module],(CustomControl) => {
                const el = document.createElement("tr");
                // set className and style
                el.className = 'more-info';
                el.className += (index % 2) ? ' even' : ' odd';
                el.style.display = "none";
                const cols = component.table.header.length + 1;
                el.innerHTML = `
                    <td class="details" colspan="${cols}">
                    </td>
                `;
                // The serviceName is extracted from model id which comes from
                // util/backboneHelpers.js: generateModel
                let id_str = model.id.split('/');
                let serviceName = null;
                if (id_str.length >= 2 && this.restRoot) {
                    serviceName = id_str[id_str.length - 2];
                    serviceName = serviceName.replace(this.restRoot + '_', '');
                }

                const control = new CustomControl(el, component, model, serviceName);
                this.expandRows.push(control);
                deferred.resolve(CustomControl);
            });
            return deferred.promise();
        },

        rowsFromCollection: function () {
            return _.flattenDeep(
                this.collection.map((model, i) => {
                    let result = [];
                    result.push(new TableRow({
                        dispatcher: this.dispatcher,
                        model: {
                            entity: model,
                            stateModel: this.stateModel,
                            enableBulkActions: false,
                            enableMoreInfo: this.enableMoreInfo,
                            showActions: true,
                            collection: this.collection,
                            component: this.component,
                            restRoot: this.restRoot,
                            navModel: this.navModel
                        },
                        index: i
                    }));
                    if (this.enableMoreInfo) {
                        if (this.customRow) {
                            this.deferreds.push(this._load_module(
                                this.customRow.src,
                                this.component,
                                model,
                                i
                            ));
                        } else {
                            result.push(new MoreInfo({
                                model: {
                                    entity: model,
                                    component: this.component
                                },
                                index: i
                            }));
                        }
                    }
                    return result;
                })
            );
        },

        _render: function () {
            $.when(...this.deferreds).done(() => {
                // Merge table row and more info row
                if (this.expandRows &&
                        this.children.rows.length === this.expandRows.length) {
                    this.children.rows = _.flattenDeep(_.map(this.children.rows, (row, i) => {
                        return [row, this.expandRows[i]];
                    }));
                }

                _.each(this.children.rows, row => {
                    row = row.render();
                    if (row.$el) {
                        this.$('tbody').append(row.$el);
                    } else {
                        this.$('tbody').append(row.el);
                    }
                });
            });
        },

        renderRows: function () {
            this.$('tbody').empty();
            this.expandRows = [];
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

        template: `
            <table class="table table-chrome table-striped table-row-expanding table-listing">
                <tbody class="app-listings"></tbody>
            </table>
        `
    });
});
