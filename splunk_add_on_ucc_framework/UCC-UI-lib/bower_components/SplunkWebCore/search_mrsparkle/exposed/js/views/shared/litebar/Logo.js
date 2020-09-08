define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/Icon',
    './Logo.pcssm',
    'uri/route'
],
function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    IconView,
    css,
    route
) {
    return BaseView.extend({
        moduleId: module.id,
        css: css,
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.splunk = new IconView({icon: 'splunk'});
            this.children.prompt = new IconView({icon: 'greaterRegistered'});
            this.children.liteLogo = new IconView({icon: 'lite'});

            var defaults = {
                appName:    'search',
                appId:      'search',
                useLink:    false
            };

            _.defaults(this.options, defaults);
        },

        render: function() {
            var root = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                owner = this.model.application.get('owner'),
                html = this.compiledTemplate({
                    homeLink: route.page(root, locale, this.options.appId),
                    css: this.css,
                    appName: this.options.appName,
                    useLiteLogo: (this.options.appId == 'search'),
                    useLink: this.options.useLink
                });

            this.$el.html(html);

            // render branding
            this.children.splunk.render().prependTo(this.$('[data-role=logo]'));
            this.children.prompt.render().prependTo(this.$('[data-role=gt]'));
            this.children.liteLogo.render().prependTo(this.$('[data-role=lite-logo]'));

            return this;
        },

        template: '\
            <% if(useLink) { %>\
                <a class="<%-css.brand%>" href="<%- homeLink %>" title="splunk &gt; <%- _("listen to your data").t() %>" data-role="logo">\
            <% } else { %>\
                 <div class="<%-css.brand%>" data-role="logo">\
            <% } %>\
            <span class="<%=css.gt%>" data-role="gt"></span>\
            <% if (useLiteLogo) { %>\
                <span class="<%-css.subBrand%>" data-role="lite-logo"></span>\
            <% } else { %>\
                <span class="<%-css.appText%>" data-role="app-text"><%= appName %></span>\
            <% } %>\
            <% if(useLink) { %> </a> <% } else { %> </div> <% } %>\
        '
    });
});
