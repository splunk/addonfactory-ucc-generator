define(
    [
        'underscore',
        'module',
        'views/Base',
        'uri/route',
        'contrib/text!views/shared/Paywall.html',
        './Paywall.pcss'
    ],
    function(
        _,
        module,
        BaseView,
        route,
        template,
        css
        ) {
        /**
         */
        return BaseView.extend({
            template: template,
            moduleId: module.id,
            /**
             * @param {Object} options {
             *      collection: <SplunkDsBaseV2>
             * }
             */
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
            },
            render: function() {
                var captionString = _('This feature is not available with your installed set of licenses.').t();
                var link = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.license.features');
                var html = this.compiledTemplate({
                    title: this.options.title || _('Licensed content').t(),
                    caption: captionString,
                    learnMoreLink: link
                });
                this.$el.html(html);
                return this;
            }
        });
    }
);
