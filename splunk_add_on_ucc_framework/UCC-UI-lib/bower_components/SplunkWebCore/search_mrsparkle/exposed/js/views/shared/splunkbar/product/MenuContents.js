define([
    'underscore',
    'module',
    'views/Base',
    'views/shared/Icon',
    'contrib/text!./MenuContents.html',
    './MenuContents.pcssm'
],
function(
    _,
    module,
    BaseView,
    IconView,
    template,
    css
){
    return BaseView.extend({
        moduleId: module.id,
        template: template,
        css: css,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.debouncedRender();
        },
        render: function() {
            var productMenuUriPrefix = this.model.webConf.entry.content.get('productMenuUriPrefix') || '',
                isAdmin = this.model.user.isAdmin() || this.model.user.isCloudAdmin(),
                html = this.compiledTemplate({
                    productMenuUriPrefix: productMenuUriPrefix,
                    isAdmin: isAdmin,
                    css: this.css
                });
            this.$el.html(html);

            var $externalLinks = this.$('[data-link-external]');
            for (var i = 0; i < $externalLinks.length; i++) {
                this.children['icon' + i] || (this.children['icon' + i] = new IconView({icon: 'external' }));
                this.children['icon' + i].render().appendTo($externalLinks.eq(i));
            }

            return this;
        }
    });
});
