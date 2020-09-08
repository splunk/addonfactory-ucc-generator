define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'uri/route',
    'contrib/text!views/clustering/SuccessContents.html'
],
    function(
        $,
        _,
        module,
        BaseView,
        route,
        RestartTemplate
        ) {
        return BaseView.extend({
            moduleId: module.id,
            template: RestartTemplate,
            render: function() {
                var root = this.model.application.get('root'),
                    locale = this.model.application.get('locale'),
                    learnmoreIndexesLink = route.docHelp(root, locale, 'learnmore.peers.index'),
                    learnmoreForwardersLink = route.docHelp(root, locale, 'learnmore.peers.forwarders');
                var html = this.compiledTemplate({
                    mode: this.model.wizard.get('mode') || '',
                    learnmoreIndexesLink: learnmoreIndexesLink,
                    learnmoreForwardersLink: learnmoreForwardersLink
                });
                this.$el.html(html);
                return this;
            }
        });
    });
