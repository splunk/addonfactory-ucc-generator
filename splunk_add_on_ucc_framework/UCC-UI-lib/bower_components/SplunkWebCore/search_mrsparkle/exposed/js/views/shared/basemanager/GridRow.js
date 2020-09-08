/**
 * @author lbudchenko
 * @date 8/13/14
 *
 * Represents a row in the table. The row contains links to perform
 * operations on the given entity. The user can expand the row to see more details about the entity.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    './ActionCell',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/shared/basemanager/SharingCell',
    'views/shared/basemanager/StatusCell'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        ActionCellView,
        SyntheticCheckbox,
        SharingCellView,
        StatusCellView
        ) {

        return BaseView.extend({
            moduleId: module.id,
            tagName: "tr",
            className: "expands list-item",

            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);
                this.$el.addClass(this.options.index % 2 ? 'even' : 'odd');

                this.options.bulkedit = this.options.bulkedit || {};
                _(this.options.bulkedit).defaults({
                    enable: false
                });

                var _ActionCell = this.options.customViews.ActionCell || ActionCellView;
                this.children.actionCell = new _ActionCell({
                    collection: this.collection,
                    model: this.model
                });

                if (this.options.grid.showSharingColumn) {
                    this.children.sharingCell = new SharingCellView({
                        model: this.model
                    });
                }

                if (this.options.grid.showStatusColumn) {
                    this.children.statusCell = new StatusCellView({
                        collection: this.collection,
                        model: this.model
                    });
                }
                if (this.options.bulkedit.enable === true) {
                    this.children.entitySelectCheckbox = new SyntheticCheckbox({
                        modelAttribute: this.model.entity.id,
                        model: this.model.entitySelectCheckbox,
                        additionalClassNames: 'select-entity'

                    });
                }

                if (this.options && this.options.template) {
                    this.template = this.options.template;
                }
            },

            events: {
                // make sure the className is not 'edit-action', because it is used in ActionCell,
                // we do not want this event handler be triggered by clicking the "edit" link in the Action cell.
                'click .entity-edit-link': function(e) {
                    var href = e.target.attributes.href.value;
                    if (href && href !== '#') {
                        // it is a valid link, no need to implement event handler
                        return;
                    }

                    this.model.controller.trigger("editEntity", this.model.entity);
                    e.preventDefault();
                },

                'click .select-entity': function (e) {
                    e.preventDefault();
                    this.model.controller.trigger('selectEntityClicked', this.model.entity, this.model.entitySelectCheckbox.get(this.model.entity.id));
                }
            },

            render: function () {
                var html = this.compiledTemplate(this.prepareTemplate());
                this.$el.html(html);

                this.children.actionCell.render().appendTo(this.$(".action-cell-placeholder"));
                if (this.children.sharingCell) {
                    this.children.sharingCell.render().appendTo(this.$(".cell-sharing"));
                }
                if (this.children.statusCell) {
                    this.children.statusCell.render().appendTo(this.$(".cell-status"));
                }
                if (this.children.entitySelectCheckbox) {
                    this.children.entitySelectCheckbox.render().appendTo(this.$(".entity-select"));
                }

                return this;
            },

            // Can be overridden by subclasses
            prepareTemplate: function() {
                return {
                    entity: this.model.entity,
                    name: this.model.entity.entry.get('name'),
                    description: this.model.entity.entry.content.get('description'),
                    editLinkHref: '#',
                    columns: this.options.columns,
                    hasMoreInfo: this.options.customViews.MoreInfo,
                    enableBulkEdit: this.options.bulkedit.enable
                };
            },

            template: '\
            <% if (enableBulkEdit) { %>\
                <td class="entity-select"></td>\
            <% } %>\
            <% if (hasMoreInfo) { %>\
            <td class="expands">\
                <a href="#"><i class="icon-triangle-right-small"></i></a>\
            </td>\
            <% } %>\
            <td class="cell-name">\
                <a href="<%- editLinkHref %>" class="model-title entity-edit-link"><%- name %></a>\
                <% if (description) { %>\
                    <div class="model-description"><%- description %></div>\
                <% } %>\
            </td>\
            \
            <td class="cell-actions">\
                <div class="action-cell-placeholder"></div>\
            </td>\
            <% _.each(columns, function(col, ix) {  %>\
                <% if (ix==0) {return;} %>\
                <td class="cell-<%- col.id %>"><%- entity.entry.content.get(col.id) %></td>\
            <% }); %>'

        }, {
            /**  - columns (Array|optional) Array of objects describing table headers:
            *          keys: [
            *              'id'(string) - attribute name in entityModel,
            *              'title'(string) - column title,
            *              'sorts'(bool) - can be sorted,
             *             'visible'(callback) - function returning a boolean for column visibility status (default:true)
             *         ]
            */
            columns: [
                {
                    id: 'name',
                    title: _('Name').t()
                },
                {
                    id: 'sharing',
                    title: _('Sharing').t()
                },
                {
                    id: 'status',
                    title: _('Status').t()
                }
            ]
        });
    });

