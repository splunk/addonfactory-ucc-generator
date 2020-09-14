define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/shared/basemanager/ActionCell'
], function (
    _,
    $,
    Backbone,
    module,
    ActionCellBaseView
) {
    var STRINGS = {
        EDIT: _("Edit").t(),
        DELETE: _("Delete").t(),
        ENABLE: _("Enable").t(),
        DISABLE: _("Disable").t(),
        REVERT: _("Revert").t()
    };
    return ActionCellBaseView.extend({
        moduleId: module.id,

        events: $.extend(true, {}, ActionCellBaseView.prototype.events, {
            'click .disable-action': function (e) {
                this.model.controller.trigger("disableEntity", this.model.entity);
                e.preventDefault();
            },
            'click .enable-action': function (e) {
                this.model.controller.trigger("enableEntity", this.model.entity);
                e.preventDefault();
            },
            'click .revert-action': function (e) {
                this.model.controller.trigger("revertEntity", this.model.entity);
                e.preventDefault();
            }
        }),

        render: function () {
            var perms = {};
            perms.canEdit = this.model.user.canEditDMCOutputs() && this.model.entity.canEdit();
            perms.canDelete = this.model.user.canEditDMCOutputs() && this.model.entity.canDelete();
            perms.canDisable = this.model.user.canEditDMCOutputs() && this.model.entity.canDisable();
            perms.canEnable = this.model.user.canEditDMCOutputs() && this.model.entity.canEnable();
            perms.canRevert = this.model.user.canEditDMCOutputs() && this.model.entity.canRevert();
            var html = this.compiledTemplate({
                strings: STRINGS,
                perms: perms
            });
            this.$el.html(html);
            return this;
        },

        template: '' +
        '<% if (perms.canEdit) { %>' +
            '<a href="#" class="entity-action edit-action"><%- strings.EDIT  %></a>' +
        '<% } %>' +
        '<% if (perms.canDelete) { %>' +
            '<a href="#" class="entity-action delete-action"><%- strings.DELETE %></a>' +
        '<% } %>' +
        '<% if (perms.canRevert) { %>' +
            '<a href="#" class="entity-action revert-action"><%- strings.REVERT %></a>' +
        '<% } %>' +
        '<% if (perms.canEnable) { %>' +
            '<a href="#" class="entity-action enable-action"><%- strings.ENABLE %></a>' +
        '<% } %>' +
        '<% if (perms.canDisable) { %>' +
            '<a href="#" class="entity-action disable-action"><%- strings.DISABLE %></a>' +
        '<% } %>'
    });
});
