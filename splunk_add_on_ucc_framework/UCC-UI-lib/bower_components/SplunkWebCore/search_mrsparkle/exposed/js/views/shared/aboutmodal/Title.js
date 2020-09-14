define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/Icon',
    './Title.pcssm'
],
function(
    $,
    _,
    module,
    BaseView,
    IconView,
    css
){
    return BaseView.extend({
        moduleId: module.id,
        css: css,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.serverInfo.on('change reset', function() {
                this.render();
            }, this);

            this.children.splunk = new IconView({icon: 'splunk'});
            this.children.prompt = new IconView({icon: 'greaterRegistered'});
            this.children.product = new IconView({icon: this.model.serverInfo.getProductIconName()});
        },

        render: function() {
            var html = this.compiledTemplate({
                css: css,
                isLite : this.model.serverInfo.isLite()
            });

            this.$el.html(html);

            this.children.splunk.render().appendTo(this.$('[data-title-role=splunk]'));
            this.children.prompt.render().appendTo(this.$('[data-title-role=prompt]'));
            this.children.product.set({icon: this.model.serverInfo.getProductIconName()}).render().appendTo(this.$('[data-title-role=product]'));

            return this;
        },
        template: '<span class="<%=css.splunk%>" data-title-role="splunk"></span>' +
            '<span class="<%=isLite?css.promptLite:css.prompt%>" data-title-role="prompt"></span>' +
            '<span class="<%=isLite?css.productLite:css.product%>" data-title-role="product"></span>'
    });
});
