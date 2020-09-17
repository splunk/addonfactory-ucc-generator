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
            className: 'dashboardResults',
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    collection: this.collection.dashboards || [],
                    className: "dashboards",
                    css: this.css,
                    title: _("Dashboards").t(),
                    nameAttr: 'label',
                    modelRoute: route.page,
                    managerRoute: route.manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'system',
                        ['dashboards'],
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
                this.addIcons(this.$('[data-role=main-link]'), 'dashboard', 1.3333);
                this.addIcons(this.$('[data-role=secondary-link]'), 'external', 1);
                return this;
            },
            getViewingPageRoute: function(modelRoute, app, openInApp, model) {
                return modelRoute(
                    app.get('root'),
                    app.get('locale'),
                    openInApp,
                    model.entry.get('name')
                );
            }
    });
});
