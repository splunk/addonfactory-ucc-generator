/**
 * Custom row view for all configurations
 * @author nmistry
 * @date 09/09/2016
 *
 * Represents a row in the table. The row contains links to perform
 * operations on the given entity.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/basemanager/GridRow'
], function (
    $,
    _,
    Backbone,
    module,
    GridRowBaseView
) {

    return GridRowBaseView.extend({
        moduleId: module.id,

        events: _.extend({}, GridRowBaseView.prototype.events, {
            'click .entity-reassign-action': function(e) {
                this.model.controller.trigger("reassignEntity", this.model.entity);
                e.preventDefault();
            }
        }),

        prepareTemplate: function () {
            var parentArgs = GridRowBaseView.prototype.prepareTemplate.apply(this, arguments);
            return $.extend(true, {}, parentArgs, {
                model: this.model.entity,
                canUseApps: this.model.user.canUseApps(),
                description: this.model.entity.entry.content.get('description') || ''
            });
        },

        template: '\
        <% if (enableBulkEdit) { %>\
            <td class="entity-select"></td>\
        <% } %>\
        <td class="cell-name">\
            <%- model.getName() %>\
            <% if (description) { %>\
                <div class="model-description"><%- description %></div>\
            <% } %>\
        </td>\
        <td class="cell-actions">\
            <a href="#" class="entity-action entity-reassign-action"><%= _("Reassign").t() %></a>\
        </td>\
        \
        <td class="cell-config-type"><%- model.getType() %></td>\
        <td class="cell-owner"><%- model.getOwner() %></td>\
        <% if(canUseApps) { %>\
        <td class="cell-app"><%- model.getApp() %></td>\
        <% } %>\
        <td class="cell-sharing"><%- model.getSharingLabel() %></td>\
        <td class="cell-status"></td>\
        '
    }, {
        columns: [
            {
                id: 'name',
                title: _('Name').t(),
                sorts: true
            }, {
                id: 'eai:type',
                title: _('Object type').t(),
                sorts: true
            }, {
                id: 'eai:acl.owner',
                title: _('Owner').t(),
                sorts: true
            }, {
                id: 'eai:acl.app',
                title: _('App').t(),
                sorts: true,
                visible: function() {
                    return this.model.user.canUseApps();
                }
            }, {
                id: 'eai:acl.sharing',
                title: _('Sharing').t(),
                sorts: true
            }
        ]
    });
});
