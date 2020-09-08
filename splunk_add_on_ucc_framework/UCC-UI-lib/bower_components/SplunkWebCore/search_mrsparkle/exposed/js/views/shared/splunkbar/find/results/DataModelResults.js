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
            className: 'dataModelResults',
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    collection: this.collection.datamodels || [],
                    css: this.css,
                    className: "data-models",
                    title: _("Data Models").t(),
                    modelRoute: route.pivot,
                    nameAttr: 'displayName',
                    managerRoute: route.data_model_manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app') === 'system' ? 'launcher' : this.model.application.get('app'),
                        {
                            data: {
                                owner: '*',
                                nameFilter: this.model.rawSearch.get('rawSearch') || '',
                                app: '-'
                            }
                        }),
                    app: this.model.application,
                    apps: this.collection.apps,
                    alternateApp: this.options.alternateApp,
                    getViewingPageRoute: this.getViewingPageRoute
                });

                this.$el.html(html);
                this.addIcons(this.$('[data-role=main-link]'), 'data', 1.3333);
                this.addIcons(this.$('[data-role=secondary-link]'), 'external', 1);
                return this;
            }
    });
});
