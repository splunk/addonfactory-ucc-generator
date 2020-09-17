define(
    [
        'jquery',
        'module',
        'views/Base',
        'views/shared/delegates/StopScrollPropagation',
        'views/shared/Icon',
        'contrib/text!./MenuContents.html',
        './MenuContents.pcssm',
        'uri/route'
    ],
    function(
        $,
        module,
        BaseView,
        StopScrollPropagation,
        IconView,
        template,
        css,
        route
    ){
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            css: css,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.splunk = new IconView({icon: 'splunk'});
                this.children.prompt = new IconView({icon: 'greaterRegistered'});
                this.children.liteLogo = new IconView({icon: 'lite'});
                this.children.check = new IconView({icon: 'check'});
            },

            appIcon: function(appId, appModel) {
                if (appId == 'search') {
                    var splunkIcon = new IconView({icon: 'greater'}).render().el;
                    return splunkIcon.outerHTML;
                } else {
                    var iconSrc = route.appIcon(
                        appModel.get('root'),
                        appModel.get('locale'),
                        appModel.get('owner'),
                        appId);
                    return '<img src="' + iconSrc + '" />';
                }
            },

            render: function() {
                var currentApp = this.model.application.get('app') || 'search',
                    html = this.compiledTemplate({
                        apps: this.options.apps,
                        currentApp: (currentApp == 'system') ? 'search' : currentApp,
                        css: this.css,
                        appIcon: this.appIcon,
                        appModel: this.model.application
                    });

                this.$el.html(html);
                this.children.stopScrollPropagation = new StopScrollPropagation({el:this.$('[data-role=apps-list]')[0]});
                this.children.splunk.render().prependTo(this.$('[data-role=logo]'));
                this.children.prompt.render().prependTo(this.$('[data-role=gt]'));
                this.children.liteLogo.render().prependTo(this.$('[data-role=lite-logo]'));
                this.children.check.render().prependTo(this.$('[data-role=current-app-check]'));

                return this;
            }
        });
    });
