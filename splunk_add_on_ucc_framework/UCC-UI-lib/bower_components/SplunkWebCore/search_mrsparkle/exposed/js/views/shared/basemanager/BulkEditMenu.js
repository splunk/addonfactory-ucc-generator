/**
 * File description
 * @author nmistry
 * @date 9/29/16
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/PopTart'
], function (
    $,
    _,
    Backbone,
    module,
    PopTartView
) {
    return PopTartView.extend({
        moduleId: module.id,
        className: 'dropdown-menu',

        events: {
            'click .bulk-action': 'onBulkActionClick'
        },

        onBulkActionClick: function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            this.model.controller.trigger('bulkActionClicked', $target.data('fires'));
        },

        render: function () {
            var html = this.compiledTemplate({
                actions: this.options.bulkedit.actions || []
            });
            this.el.innerHTML = PopTartView.prototype.template_menu;
            this.$el.append(html);
            return this;
        },

        template: '\
                <ul class="bulk-edit-actions">\
                        <li><a href="#" class="bulk-action" data-fires="clearSelected"><%- _("Clear selections").t() %></a></li>\
                </ul>\
                <ul class="bulk-edit-custom-actions">\
                <% _.each(actions, function(action) { %>\
                  <li><a href="#" class="bulk-action" data-fires="<%- action.fires %>"><%- action.label %></a></li>\
                <% }) %> \
                </ul>\
        '
    });
});
