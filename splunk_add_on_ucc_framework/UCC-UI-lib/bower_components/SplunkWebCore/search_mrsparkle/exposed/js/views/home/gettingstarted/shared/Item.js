define(
    [
        'module',
        'underscore',
        'uri/route',
        'views/Base'
    ],
    function(
        module,
        _,
        route,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param options {Object} {
             *      url: string,
             *      title: string,
             *      description: string 
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    url: this.options.url,
                    icon: this.options.icon || '',
                    title: this.options.title,
                    external: this.options.external || false,
                    description: this.options.description,
                    linkClass: this.options.linkClass || false
                }));
                return this;
            },
            template: '\
                <a href="<%- url %>" class="hoverable-area <% if (linkClass) { %><%- linkClass %><% } %>" title="<%- title %>" <% if (external) { %>target="_blank"<% } %>>\
                    <% if (icon) { %>\
                        <%= icon %>\
                    <% } %>\
                    <%- title %><% if (external) { %> <i class="icon-external"></i><% } %>\
                    <div class="mask"></div>\
                </a>\
                <p class="description"><%= description %></p>\
            '
        });
    }
);
