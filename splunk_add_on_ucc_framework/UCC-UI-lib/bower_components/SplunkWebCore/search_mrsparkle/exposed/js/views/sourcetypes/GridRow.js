/**
 * @author lbudchenko
 * @date 8/18/15
 *
 * Represents a row in the table. The row contains links to perform
 * operations on the given index. The user can expand the row to see more details about the index
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView
        ) {

        return BaseView.extend({
            moduleId: module.id,
            tagName: "tr",
            className: "list-item",

            events: {
                'click .delete-action': function(e) {
                    this.model.controller.trigger("deleteEntity", this.model.entity);
                    e.preventDefault();
                },
                'click .clone-action': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger("cloneEntity", this.model.entity);
                },
                'click .edit-action': function(e) {
                    this.model.controller.trigger("editEntity", this.model.entity);
                    e.preventDefault();
                },
                'click .entity-edit-link': function(e) {
                    this.model.controller.trigger("editEntity", this.model.entity);
                    e.preventDefault();
                }
            },

            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);
            },

            render: function () {
                var html = this.compiledTemplate({
                    model: this.model.entity,
                    canDeleteSourcetype: this.model.entity.entry.links.has("remove"),
                    canUseApps: this.model.user.canUseApps(),
                    description: this.model.entity.entry.content.get('description'),
                    isCloud: this.model.serverInfo.isCloud()
                });

                this.$el.html(html);

                return this;
            },

            template: '\
            <td class="cell-name">\
                <a href="#" class="model-title entity-edit-link"><%- model.entry.get("name") %></a>\
                <div class="model-description"><%- _(description||"").t() %></div>\
            </td>\
            <td class="cell-actions">\
                <a href="#" class="entity-action edit-action"><%= _("Edit").t() %></a>\
                <a href="#" class="entity-action clone-action"><%= _("Clone").t() %></a>\
                <% if(canDeleteSourcetype) { %>\
                <a href="#" class="entity-action delete-action"><%= _("Delete").t() %></a>\
                <% } %>\
            </td>\
            \
            <td class="cell-category"><%- _(model.entry.content.get("category")||"").t() %></td>\
            <% if(canUseApps) { %>\
            <td class="cell-app"><%- model.entry.acl.get("app") %></td>\
            <% } %>\
            '
        }, {
            columns: [
                {
                    id: 'name',
                    title: _('Name').t(),
                    sorts: true
                }, {
                    id: 'category',
                    title: _('Category').t(),
                    sorts: true
                }, {
                    id: 'app',
                    title: _('App').t(),
                    sorts: true,
                    visible: function() {
                        return this.model.user.canUseApps();
                    }
                }
            ]
        });
    });
