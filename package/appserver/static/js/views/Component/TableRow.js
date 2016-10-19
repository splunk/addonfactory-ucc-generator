/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/Base',
    'app/views/component/EditMenu',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticCheckboxControl'
], function (
    $,
    _,
    Backbone,
    BaseView,
    EditMenu,
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

            this.collection = this.model.collection;
            this.stateModel = this.model.stateModel;
            this.allCollection = this.model.allCollection;
            this.enableBulkActions = this.model.enableBulkActions;
            this.enableMoreInfo = this.model.enableMoreInfo;
            this.showActions = this.model.showActions;
            this.component = this.model.component;

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
            var $target = $(e.currentTarget),
                deleteTag,
                service;

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
                deleteTag: ''
            });
            $('body').append(this.editmenu.render().el);
            this.editmenu.show($target);

            //Listen to disable/enable action and update the status and display
            this.rowDispatcher.on('disable-input', function () {
                var self = this;
                _.each(this.collection.models, function (model) {
                    if (model.attributes.id === self.model.entity.attributes.id) {
                        model.entry.content.attributes.disabled = true;
                        self.model.entity.entry.content.attributes.disabled = true;
                    }
                });

                this.collection.reset(this.collection.models);
            }.bind(this));

            this.rowDispatcher.on('enable-input', function () {
                var self = this;
                _.each(this.collection.models, function (model) {
                    if (model.attributes.id === self.model.entity.attributes.id) {
                        model.entry.content.attributes.disabled = false;
                        self.model.entity.entry.content.attributes.disabled = false;
                    }
                });
                this.collection.reset(this.collection.models);
            }.bind(this));
        },

        render: function () {
            if (this.enableBulkActions) {
                this.$el.append('<td class="box checkbox col-inline"></td>');
                this.$('.box').append(this.bulkbox.render().el);
            }
            if (this.enableMoreInfo) {
                this.$el.append('<td class="expands"><a href="#"><i class="icon-triangle-right-small"></i></a></td>');
            }

            var header = this.component.table.header;
            _.each(header, function (h) {
                if (h.field === "name") {
                    this.$el.append('<td class="col-name">' + (h.mapping ? h.mapping(this.model.entity.entry.attributes[h.field]) : this.model.entity.entry.attributes[h.field]) + '</td>');
                } else if (h.field === "service") {
                    this.$el.append('<td class="col-service">' + (h.mapping ? h.mapping(this.model.entity) : this.model.entity.entry.content.attributes[h.field]) + '</td>');
                } else {
                    this.$el.append('<td  class="col-' + h.field + '">' + (h.mapping ? h.mapping(this.model.entity.entry.content.attributes[h.field]) : this.model.entity.entry.content.attributes[h.field]) + '</td>');
                }
            }.bind(this));

            if (this.showActions) {
                this.$el.append('<td class="actions col-actions"><a class="dropdown-toggle" href="#">' + _("Action").t() + '<span class="caret"></span></a></td>');
            }
            if (this.model.entity.entry.attributes.name) {
                this.$el.addClass('row-' + this.model.entity.entry.attributes.name);
            }
            return this;
        }
    });
});
