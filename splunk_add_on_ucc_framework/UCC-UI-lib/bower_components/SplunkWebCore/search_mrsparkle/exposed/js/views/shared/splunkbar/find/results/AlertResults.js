define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/splunkbar/find/results/BaseResults',
        'uri/route'
    ],
    function(
        _,
        $,
        module,
        BaseResultView,
        route
    ){
        return BaseResultView.extend({
            className: 'alertResults',
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    collection: this.collection.alerts || [],
                    css: this.css,
                    className: "alerts",
                    title: _("Alerts").t(),
                    modelRoute: route.alert,
                    nameAttr: undefined,
                    managerRoute: route.manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'system',
                        ['alerts'],
                        {
                            data: {
                                search: this.model.state.get('search') || '',
                                rawSearch: this.model.rawSearch.get('rawSearch') || ''
                            }
                        }),
                    app: this.model.application,
                    apps: this.collection.apps,
                    alternateApp: this.options.alternateApp,
                    getViewingPageRoute: this.getViewingPageRoute
                });

                this.$el.html(html);
                this.addIcons(this.$('[data-role=main-link]'), 'bell', 1.3333);
                this.addIcons(this.$('[data-role=secondary-link]'), 'external', 1);
                return this;
            }
    });
});
