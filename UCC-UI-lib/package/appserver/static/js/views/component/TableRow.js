define([
    'jquery',
    'lodash',
    'backbone',
    'views/Base',
    'app/views/component/EditMenu',
    'app/util/Util',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticCheckboxControl'
], function (
    $,
    _,
    Backbone,
    BaseView,
    EditMenu,
    Util,
    ControlGroup,
    SyntheticCheckboxControl
) {
    return BaseView.extend({
        tagName: 'tr',

        className: 'apps-table-tablerow',

        events: {
            'click td.actions > a.dropdown-toggle': function (e) {
                this.openEdit(e);
            }
        },

        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.$el.addClass((this.options.index % 2) ? 'even' : 'odd');

            /*
                collection, stateModel, allCollection, enableBulkActions,
                enableMoreInfo, showActions, component, restRoot
            */
            _.extend(this, this.model);

            if (options.dispatcher) {
                this.dispatcher = options.dispatcher;
            }

            if (this.enableBulkActions) {
                if (!this.model.checkbox) {
                    this.model.checkbox = new Backbone.Model();
                    this.model.checkbox.set("checked", 0);
                }
                this.bulkboxControl = new SyntheticCheckboxControl({
                    modelAttribute: 'checked',
                    model: this.model.checkbox
                });
                this.bulkbox = new ControlGroup({
                    controls: [this.bulkboxControl]
                });
            }

            this.activate();
        },

        openEdit: function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);

            if (this.editmenu) {
                this.editmenu.remove();
                e.preventDefault();
            }
            this.rowDispatcher = _.extend({}, Backbone.Events);

            this.editmenu = new EditMenu({
                collection: this.model.collection,
                model: this.model.entity,
                stateModel: this.stateModel,
                url: this.model.collectionURL,
                component: this.component,
                dispatcher: this.dispatcher,
                rowDispatcher: this.rowDispatcher,
                deleteTag: '',
                navModel: this.navModel
            });
            $('body').append(this.editmenu.render().el);
            this.editmenu.show($target);

            //Listen to disable/enable action and update the status and display
            this.rowDispatcher.on('disable-input', () => {
                _.each(this.collection.models, (model) => {
                    if (model.get('id') === this.model.entity.get('id')) {
                        model.entry.content.set('disabled', true);
                        this.model.entity.entry.content.set('disabled', true);
                    }
                });

                this.collection.reset(this.collection.models);
            });

            this.rowDispatcher.on('enable-input', () => {
                _.each(this.collection.models, (model) => {
                    if (model.get('id') === this.model.entity.get('id')) {
                        model.entry.content.set('disabled', false);
                        this.model.entity.entry.content.set('disabled', false);
                    }
                });
                this.collection.reset(this.collection.models);
            });
        },

        _load_module: function(module, field, model, index) {
            const deferred = $.Deferred();
            __non_webpack_require__(['custom/' + module],(CustomCell) => {
                const el = document.createElement("td");
                el.className = 'col-' + field;

                // The serviceName is extracted from model id which comes from
                // util/backboneHelpers.js: generateModel
                let id_str = model.id.split('/');
                let serviceName = null;
                if (id_str.length >= 2 && this.restRoot) {
                    serviceName = id_str[id_str.length - 2];
                    serviceName = serviceName.replace(this.restRoot + '_', '');
                }
                const customCell = new CustomCell(
                    el,
                    field,
                    model,
                    serviceName
                );
                this.cells[index] = customCell.render().el;
                deferred.resolve(CustomCell);
            });
            return deferred.promise();
        },

        _renderRow: function () {
            this.deferreds = [];
            this.cells = [];
            const header = this.component.table.header;
            _.each(header, ({field, mapping, customCell}, index) => {
                let fieldValue;
                if (field === 'name') {
                    fieldValue = this.model.entity.entry.get(field);
                } else {
                    fieldValue = this.model.entity.entry.content.get(field);
                }
                if (field === 'disabled' && _.isUndefined(fieldValue)) {
                    fieldValue = 'false';
                }
                if (!customCell) {
                    fieldValue = fieldValue === undefined ?
                                 '' : String(fieldValue);
                    if (mapping) {
                        fieldValue = !_.isUndefined(mapping[fieldValue]) ?
                                     mapping[fieldValue] : fieldValue;
                    }
                    let html = `<td  class="col-${field}">
                                ${Util.encodeHTML(fieldValue)}</td>`;
                    this.cells[index] = html;
                } else {
                    this.deferreds.push(
                        this._load_module(
                            customCell.src,
                            field,
                            this.model.entity,
                            index
                        )
                    );
                }
            });
        },

        render: function () {
            if (this.enableBulkActions) {
                this.$el.append(`<td class="box checkbox col-inline"></td>`);
                this.$('.box').append(this.bulkbox.render().el);
            }
            if (this.enableMoreInfo) {
                this.$el.append(_.template(this.expandTemplate));
            }

            this._renderRow();
            $.when(...this.deferreds).done(() => {
                 _.each(this.cells, cell => {
                     this.$el.append(cell);
                 });

                if (this.showActions) {
                    this.$el.append(_.template(this.actionTemplate));
                }
                // For automation test
                if (this.model.entity.entry.get('name')) {
                    this.$el.addClass(
                        `row-${this.model.entity.entry.get('name')}`
                    );
                }
            });
            return this;
        },

        expandTemplate: `
            <td class="expands">
                <a href="#">
                    <i class="icon-triangle-right-small"></i>
                </a>
            </td>
        `,

        actionTemplate: `
            <td class="actions col-actions">
                <a class="dropdown-toggle" href="#">
                    <%- _("Action").t() %>
                    <span class="caret"></span>
                </a>
            </td>
        `
    });
});
