/**
 * @author ahebert
 * @date 4/15/16
 *
 * Represents a row in the table. The row contains links to perform
 * operations on the given index. The user can expand the row to see more details about the index
 */
define([
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/delegates/Popdown',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'views/shared/panelcontrols/dialogs/savetodashboard/Master'
    ],
    function (
        $,
        _,
        module,
        BaseView,
        PopdownView,
        PermissionsDialog,
        DashboardDialog
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: "action-cell",

            initialize: function(options){
                BaseView.prototype.initialize.apply(this, arguments);
                var defaultOptions = {
                    gear: false
                };
                this.options = _.extend({}, defaultOptions, this.options);
            },

            events: {
                'click .add-to-dashboard-action': function (e) {
                    this.children.dashboardDialog = new DashboardDialog({
                        model: {
                            panel: this.model.entity,
                            application: this.model.application,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: this.collection,
                        onHiddenRemove: true
                    }).render().show();
                    e.preventDefault();
                },
                'click .permissions-link': function (e) {
                    this.children.permissionsDialog = new PermissionsDialog({
                        model: {
                            document: this.model.entity,
                            nameModel: this.model.entity.entry,
                            application: this.model.application,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: this.collection.rolesCollection,
                        onHiddenRemove: true,
                        nameLabel: this.options.entitySingular,
                        showDispatchAs: false
                    }).render().show();
                    e.preventDefault();
                },
                'click .clone-action': function (e) {
                    this.model.controller.trigger("cloneEntity", this.model.entity);
                    e.preventDefault();
                },
                'click .edit-action': function(e) {
                    this.model.controller.trigger("editEntity", this.model.entity);
                    e.preventDefault();
                },
                'click .delete-action': function(e) {
                    this.model.controller.trigger("deleteEntity", this.model.entity);
                    e.preventDefault();
                },
                'click .move-action': function(e) {
                    this.model.controller.trigger("moveEntity", this.model.entity);
                    e.preventDefault();
                }
            },

            controlActionsVisibility: function() {
                var canEdit = this.model.entity.entry.links.has("edit"),
                    canCreate = this.collection.entities.links.has("create"),
                    canMove = this.model.entity.entry.links.has("move") && this.model.user.canUseApps(),
                    canDelete = this.model.entity.entry.links.has("remove");

                if (!canEdit) {
                    this.$el.find('.edit-action').parent().remove();
                }
                if (!canCreate) {
                    this.$el.find('.clone-action').parent().remove();
                }
                if (!canMove) {
                    this.$el.find('.move-action').parent().remove();
                }
                if (!canDelete) {
                    this.$el.find('.delete-action').parent().remove();
                }
            },

            render: function () {
                var html = this.compiledTemplate({
                    model: this.model.entity,
                    gear: this.options.gear
                });

                this.$el.html(html);
                this.children.popdown = new PopdownView({ el: this.$('.popdown-action-view') });

                this.controlActionsVisibility();

                return this;
            },

            template: ' <a href="#" class="entity-action add-to-dashboard-action"><%- _("Add to dashboard").t() %></a>\
                        <span class="popdown-action-view">\
                            <% if (gear) { %>\
                                <a class="dropdown-toggle" href="#"><i class="icon-large icon-gear"></i> <span class="caret"></span></a>\
                            <% } else { %>\
                                <a class="dropdown-toggle" href="#"><%- _("Edit").t() %><span class="caret"></span></a>\
                            <% } %>\
                            <div class="dropdown-menu dropdown-menu-narrow">\
                                <div class="arrow"></div>\
                                <ul class="first-group">\
                                    <li>\
                                        <a href="#" class="entity-action edit-action"><%- _("Edit Panel").t() %></a>\
                                    </li>\
                                    <li>\
                                        <a href="#" class="entity-action permissions-link"><%- _("Edit Permissions").t() %></a>\
                                    </li>\
                                    <li>\
                                        <a href="#" class="entity-action clone-action"><%- _("Clone").t() %></a>\
                                    </li>\
                                    <li>\
                                        <a href="#" class="entity-action move-action"><%- _("Move").t() %></a>\
                                    </li>\
                                    <li>\
                                        <a href="#" class="entity-action delete-action"><%- _("Delete").t() %></a>\
                                    </li>\
                                </ul>\
                            </div>\
                        </span>\
            '
        });
    });

