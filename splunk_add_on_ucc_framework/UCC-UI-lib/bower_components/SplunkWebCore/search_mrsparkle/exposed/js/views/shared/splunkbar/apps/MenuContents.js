define(
    [
        'jquery',
        'module',
        'views/Base',
        'views/shared/delegates/StopScrollPropagation',
        'splunk.util',
        'contrib/text!./MenuContents.html',
        './MenuContents.pcssm',
        'uri/route'
    ],
    function(
        $,
        module,
        BaseView,
        StopScrollPropagation,
        splunk_util,
        appsTemplate,
        css,
        route
    ){
        return BaseView.extend({
            moduleId: module.id,
            template: appsTemplate,
            css: css,
            initialize: function() {
                this.haveIcons = false;
                BaseView.prototype.initialize.apply(this, arguments);

                if(this.options.activeMenu && this.options.activeMenu.name === 'app'){
                    this.currentApp = this.model.application.get('app');
                }
                this.collection.apps.on('ready change reset', this.debouncedRender, this);
                this.model.user.on('ready change', this.debouncedRender, this);
                // handle the case when collection.apps is already set
                if (this.collection.apps.length > 0) {
                    this.debouncedRender();
                }
            },
            render: function() {
                this.haveIcons = false;
                var that = this,
                    app,
                    curApp = null,
                    apps = this.collection.apps.filter(function(app) {
                        if (app.entry.content.has('show_in_nav')) {
                            return app.entry.content.get('show_in_nav');
                        } else {
                            // SPL-124536 - Support the apps menu on Splunk < 6.3,
                            // before the 'show_in_nav' option was made available.
                            var appName = app.entry.get('name');
                            return appName !== 'splunk_management_console' &&
                                appName !== 'launcher';
                        }
                    }).map(function(model, key, list) {
                        var appIcon = route.appIconAlt(
                            that.model.application.get('root'),
                            that.model.application.get('locale'),
                            that.model.application.get('owner'),
                            model.entry.get('name')
                        );

                        app = {
                            href: splunk_util.make_url('/app/'+ model.entry.get('name')),
                            label: model.entry.content.get('label'),
                            name: model.entry.get('name'),
                            icon: appIcon
                        };
                        if(model.entry.get('name') === that.currentApp) {
                            curApp = app;
                        }
                        return app;
                    }),

                    html = this.compiledTemplate({
                        apps: apps,
                        currentApp: curApp,
                        make_url: splunk_util.make_url,
                        appsRemote_url: route.appsRemote(
                                this.model.application.get('root'),
                                this.model.application.get('locale'),
                                this.model.application.get('app')),
                        canViewRemoteApps: that.model.user.canViewRemoteApps(),
                        css: css
                    });

                this.children.stopScrollPropagation = new StopScrollPropagation({el:this.$('[data-role=apps-list]')[0]});

                this.$el.html(html);
                return this;
            },
            setIcons: function() {
                if(this.haveIcons){
                    return;
                }
                this.haveIcons = true;
                var icons = this.$el.find('[data-role="icon"]');
                icons.each(function(index, ico){
                    ico = $(ico);
                    ico.attr('src', ico.attr('data-icosrc')).show();
                });
            }
        });
    });
