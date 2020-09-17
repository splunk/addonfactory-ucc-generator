/**
 * @author nmistry
 * @date 6/3/106
 *
 * Represents a row in the table. The row contains links to perform
 * operations on the given output group. The user can expand the row to see more details about the group
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/managementconsole/DmcBase',
        'models/managementconsole/DMCContextualBase',
        'views/shared/basemanager/GridRow',
        'views/managementconsole/shared/PendingChangesDialog'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        DmcBaseModel,
        DmcContextualBase,
        BaseView,
        PendingChangesDialog
    ) {

        return BaseView.extend({
            moduleId: module.id,
            tagName: "tr",
            className: "list-item",

            prepareTemplate: function () {
                var templateArgs = BaseView.prototype.prepareTemplate.apply(this, arguments);
                templateArgs.servers = this.model.entity.entry.content.get('server');
                templateArgs.defaultGroups = this.getDefaultGroups(this.model.entity.entry.content.get('@inDefaultGroup'));
                templateArgs.perms = {};
                templateArgs.perms.canEdit = this.model.user.canEditDMCOutputs() && this.model.entity.canEdit();
                return templateArgs;
            },

            getDefaultGroups: function (groups) {
                var displayNames = _.map(groups, function (i) {
                    return DmcContextualBase.getBundleName(i['app'], i['@bundleId'], i['@bundleType']);
                });
                return displayNames.join(', ');
            },
            events: $.extend(true, {}, BaseView.prototype.events, {
                'click .pending-link': function (e) {
                    e.preventDefault();
                    this.collection.pendingChanges.fetchData.set({
                        type: ['stanza'],
                        name: this.model.entity.getStanzaName(),
                        outputName: this.model.entity.entry.get('name'),
                        bundleType: this.model.entity.getBundleType(),
                        bundleId: this.model.entity.getBundleId(),
                        configurationType: 'outputs'
                    });

                    this.collection.pendingChanges.safeFetch();

                    var dialog = new PendingChangesDialog({
                        onHiddenRemove: true,
                        mode: 'output-context',
                        collection: {
                            pendingChanges: this.collection.pendingChanges
                        }
                    });

                    $('body').append(dialog.render().el);
                    dialog.show();
                }
            }),

            template: '\
            <td class="cell-name">\
                <% if (perms.canEdit) { %>\
                    <a href="<%- editLinkHref %>" class="model-title entity-edit-link"><%- name %></a>\
                <% } else { %>\
                    <span class="model-title"><%- name %></span>\
                <% } %>\
            </td>\
            <td class="cell-actions">\
                <div class="action-cell-placeholder"></div>\
            </td>\
            <td class="cell-server">\
                <%- servers %>\
            </td>\
            <td class="cell-default-group">\
                <%- defaultGroups %>\
            </td>\
            <td class="cell-pending"> \
                <a href="#" class="pending-link"><%- entity.getPendingText() %></a> \
            </td>\
            <td class="cell-status"> \
            </td>'
        }, {
            columns: [
                {
                    id: 'name',
                    title: _('Name').t(),
                    sorts: true
                },
                {
                    id: 'server',
                    title: _('Receivers').t(),
                    noSort: true
                },
                {
                    id: '@inDefaultGroup',
                    title: _('Default on').t(),
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
