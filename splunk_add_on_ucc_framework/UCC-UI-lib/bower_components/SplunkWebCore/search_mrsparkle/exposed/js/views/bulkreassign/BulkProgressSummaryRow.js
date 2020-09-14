/**
 * Progress row details
 * @author nmistry
 * @date 10/14/16
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/waitspinner/Master',
    'views/Base'
], function(
    $,
    _,
    Backbone,
    module,
    WaitSpinner,
    Base
) {
    return Base.extend({
        moduleId: module.id,
        tagName: 'tr',
        initialize: function () {
            Base.prototype.initialize.apply(this, arguments);
            this.status = 'initial';
            this.children.spinner = new WaitSpinner();

            this.listenTo(this.model, 'reassign:start', this.showUpdating);
            this.listenTo(this.model, 'reassign:successful', this.showSuccessful);
            this.listenTo(this.model, 'reassign:error', this.showError);
        },

        showUpdating: function () {
            this.status = 'updating';
            this.render();
        },

        showSuccessful: function () {
            this.status = 'success';
            this.render();
        },

        showError: function () {
            this.status = 'error';
            this.render();
        },

        render: function () {
            var html = this.compiledTemplate({
                model: this.model
            });
            var $html = $(html);
            $html.find('.updating').append(this.children.spinner.render().el);
            switch (this.status) {
                case 'initial':
                    $html.find('.initial').show();
                    break;
                case 'updating':
                    $html.find('.updating').show();
                    break;
                case 'success':
                    $html.find('.success').show();
                    break;
                case 'error':
                    $html.find('.error').show();
                    var msgs = this.model.error.get('messages');
                    if (_.isArray(msgs) && msgs.length > 0) {
                        var msg = msgs[0].message;
                        $html.find('.error [data-toggle="tooltip"]').attr('title', msg);
                    }
                    break;

            }
            this.$el.html($html);
            return this;
        },
        template: '\
        <td><%- model.getName() %></td>\
        <td><%- model.getType() %></td>\
        <td><%- model.getOwner() %></td>\
        <td><%- model.getApp() %></td>\
        <td><%- model.getSharingLabel() %></td>\
        <td class="status">\
            <div class="progress-status initial hide">\
                <a href="#" class="removeEntityFromSelection" data-toggle="tooltip" title="Remove from selection" data-id="<%- model.id %>"><i class="icon-x-circle"></i></a>\
            </div>\
            <div class="progress-status updating hide">\
            </div>\
            <div class="progress-status success hide">\
                <a href="#" data-toggle="tooltip" title="Successfully reassigned"><i class="icon-check"></i></a></div>\
            <div class="progress-status error alert-error hide">\
                <a href="#" data-toggle="tooltip" title=""><i class="icon-alert"></i></a>\
            </div>\
        </td>'
    });});
