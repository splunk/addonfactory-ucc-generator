define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/managementconsole/DmcBase',
        'views/shared/basemanager/GridRow',
        'views/managementconsole/shared/PendingChangesDialog',
        'views/managementconsole/deploy/components/StatusDialog',
        'helpers/managementconsole/url'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        DmcBaseModel,
        BaseManagerGridRow,
        PendingChangesDialog,
        DeployStatusDialogView,
        urlHelper
    ) {
        return BaseManagerGridRow.extend({

            initialize: function() {
                BaseManagerGridRow.prototype.initialize.apply(this, arguments);

                var serverClassId = urlHelper.getUrlParam('deployStatus');
                if (serverClassId && this.model.entity.getId() === serverClassId) {
                    this.showDeployStatus(serverClassId);
                }
            },

            events: {
                'click .pending-link': function(e) {
                    e.preventDefault();

                    this.collection.pendingChanges.fetchData.set({
                        type: ['group', 'stanza'],
                        name: this.model.entity.entry.get('name'),
                        bundleType: 'custom',
                        bundleId: this.model.entity.entry.get('name')
                    });

                    this.collection.pendingChanges.safeFetch();

                    var dialog = new PendingChangesDialog({
                        onHiddenRemove: true,
                        mode: 'server-class-context',
                        collection: {
                            pendingChanges: this.collection.pendingChanges
                        }
                    });

                    $('body').append(dialog.render().el);
                    dialog.show();
                },
                'click .deploy-status-link': function(e) {
                    e.preventDefault();
                    var serverClassId = $(e.currentTarget).data().name;
                    this.showDeployStatus(serverClassId);
                }
            },

            showDeployStatus: function(serverClassId) {
                this.collection.deployStatusInstances.reset();
                this.collection.deployStatusInstances.fetchData.clear();
                this.collection.deployStatusInstances.fetchData.set({
                    deployStatusQuery: JSON.stringify({}),
                    query: JSON.stringify({$and: [{$or: [{serverClass: serverClassId}]}]})
                });

                var deployStatusDialog = new DeployStatusDialogView({
                    model: this.model.entity,
                    mode: 'custom',
                    collection: {
                        entities: this.collection.deployStatusInstances
                    },
                    redirectReturnToPage: urlHelper.pages.SERVER_CLASS
                });

                urlHelper.replaceState({deployStatus: serverClassId});

                $('body').append(deployStatusDialog.render().el);
                deployStatusDialog.show();

                this.listenTo(deployStatusDialog, 'hide', function() {
                    urlHelper.removeUrlParam('deployStatus');
                });
            },

            // Can be overridden by subclasses
            prepareTemplate: function() {
                var template = BaseManagerGridRow.prototype.prepareTemplate.call(this);
                return $.extend(true, template, {
                    name: this.model.entity.entry.get('name'),
                    description: this.model.entity.entry.content.get('description'),
                    editLinkHref: this.model.entity.getEditUrl({ return_to: window.location.href }),
                    entity: this.model.entity
                });
            },

            template: '\
            <td class="expands">\
                <a href="#"><i class="icon-triangle-right-small"></i></a>\
            </td>\
            <td class="cell-name">\
                <% if (entity.canEdit()) { %>\
                <a href="<%- editLinkHref %>" class="model-title entity-edit-link"><%- name %></a>\
                <% } else { %>\
                <%- name %>\
                <% } %>\
                <% if (description) { %>\
                    <div class="model-description"><%- description %></div>\
                <% } %>\
            </td>\
            <td class="cell-actions">\
                <div class="action-cell-placeholder"></div>\
            </td>\
            <td class="cell-appsCount">\
                <% if (entity.isLimitedProperty("@apps")) { %> \
                    <%- entity.getLimitedPropertyMessage() %> \
                <% } else { %> \
                <%- entity.entry.content.get("@apps").length %>\
                <% } %>\
            </td>\
            <td class="cell-instancesUpToDate">\
                <%- entity.getInstancesUpToDateRatio() %> <a href="#" class="entity-link deploy-status-link" data-name="<%- name %>">(<%- _("details").t() %>)</a>\
            </td> \
            <td class="cell-pending"> \
                <% if (entity.isPending()) { %> \
                    <a href="#" class="pending-link"><%- entity.getPendingText() %></a> \
                <% } %> \
            </td>'
        }, {
            columns: [
                {
                    id: 'name',
                    title: _('Name').t(),
                    sorts: true
                },
                {
                    id: 'apps',
                    title: _('App Count').t(),
                    noSort: true
                },
                {
                    id: 'instancesUpToDate',
                    title: _('Instance Up to Date Count').t(),
                    noSort: true
                },
                {
                    id: 'pending',
                    title: DmcBaseModel.PENDING_COLUMN_NAME,
                    noSort: true
                }
            ]
        });
    });