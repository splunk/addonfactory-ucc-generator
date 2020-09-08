define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'uri/route',
    './DashboardMessage.pcss'
], function($, _, module, BaseView, route) {

    return BaseView.extend({
        moduleId: module.id,
        className: 'dashboard-message alert',
        events: {
            'click .dismiss': function(e) {
                e.preventDefault();
                this.model.message.set('dismissed', true);
            }
        },
        createTemplateData: function() {
            var message = this.model.message;
            var data = message.toJSON();
            var docsLink = message.get('docsLink');
            if (docsLink) {
                data.link = route.docHelp(this.model.application.get('root'), this.model.application.get('locale'), docsLink);
                data.linkExternal = true;
            }
            return _.extend({
                linkText: _('Learn more').t(),
                dismissable: false,
                link: null,
                linkClass: 'learn-more',
                linkExternal: false,
                linkPosition: 'after'
            }, data);
        },
        render: function() {
            var data = this.createTemplateData();
            this.$el.html(this.compiledTemplate(data));
            if (data.linkData) {
                this.$('a').data(data.linkData);
            }
            this.$el.addClass('alert-' + data.level);
            return this;
        },
        template: '\
            <% if(dismissable) { %><a class="dismiss close">×</a><% } %>\
            <i class="icon icon-alert"></i>\
            <% if(link && linkPosition == "before") { %>\
                <a href="<%- link %>" class="<%- linkClass %>"><%- linkText %><% if (linkExternal) { %> <i class="icon-external"></i><% } %></a>\
            <% } %>\
            <span class="message-text"><%- text %> </span>\
            <% if(link && linkPosition == "after") { %>\
                <a href="<%- link %>" class="<%- linkClass %>"<% if (linkExternal) { %> target="_blank"<% } %>><%- linkText %><% if (linkExternal) { %> <i class="icon-external"></i><% } %></a>\
            <% } %>\
            '
    });

});