define([
    'underscore',
    'module',
    'views/Base',
    'contrib/text!./MenuContents.html',
    './MenuContents.pcssm',
    'uri/route',
    'splunk.util'
],
function(
    _,
    module,
    BaseView,
    template,
    css,
    route,
    splunk_util
){
    return BaseView.extend({
        moduleId: module.id,
        template: template,
        tagName: 'ul',
        css: css,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.user.on('change', this.render, this);
            this.model.webConf.on('change reset', this.render, this);
            if (this.model.user.entry.get('name')) {
                this.render();
            }
        },
        render: function() {
            var rootUrl = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                isLite = this.model.serverInfo.isLite(),
                userName =  this.model.user.entry.get('name'),
                accountLink = route.manager(
                    rootUrl,
                    locale,
                    this.model.application.get('app'),
                    [
                        'authentication',
                        'changepassword',
                        userName
                    ],
                    {
                        data: { action: 'edit' }
                    }
                ),
                accountLinkLite = route.manager(
                    rootUrl,
                    locale,
                    this.model.application.get('app'),
                    [
                        'authentication',
                        'users'
                    ]
                ),
                logoutLink = this.model.config.get('SSO_CREATED_SESSION') ? null : route.logout(rootUrl, locale),
                showUserMenuProfile = this.model.serverInfo.isCloud() &&
                    splunk_util.normalizeBoolean(this.model.webConf.entry.content.get('showUserMenuProfile')),
                html = this.compiledTemplate({
                    userName: userName,
                    accountLink: (isLite) ? accountLinkLite : accountLink,
                    logoutLink: logoutLink,
                    showUserMenuProfile: showUserMenuProfile,
                    productMenuUriPrefix: this.model.webConf.entry.content.get('productMenuUriPrefix') || '',
                    isCloud: this.model.serverInfo.isCloud(),
                    isLite: isLite,
                    css: css
                });

            this.$el.html(html);
            return this;
        }
    });
});
