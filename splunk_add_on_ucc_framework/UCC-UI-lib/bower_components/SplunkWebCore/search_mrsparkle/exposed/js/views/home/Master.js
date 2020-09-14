define([
    'jquery',
    'underscore',
    'module',
    'uri/route',
    'util/splunkd_utils',
    'splunk.util',
    'models/Base',
    'models/search/Dashboard',
    'views/Base',
    'views/home/Apps',
    'views/home/dashboard/Master',
    'views/home/gettingstarted/Master',
    './Master.pcss'
],
function(
    $,
    _,
    module,
    route,
    splunkDUtils,
    splunkUtil,
    BaseModel,
    DashboardModel,
    BaseView,
    AppsView,
    DashboardView,
    GettingStartedView,
    css
) {
    return BaseView.extend({
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.canManageRemoteApps = new BaseModel();
            this.canManageRemoteApps.set('canManageRemoteApps', false);
            $.when(this.options.canManageRemoteAppsDfd)
                .done(function(){
                    this.canManageRemoteApps.set('canManageRemoteApps', true);
                }.bind(this))
                .fail(function(){
                    this.canManageRemoteApps.set('canManageRemoteApps', false);
                }.bind(this));

            this.children.apps = new AppsView({
                collection: {
                    apps: this.collection.apps,
                    appNavs: this.collection.appNavs
                },
                model: {
                    application: this.model.application,
                    userPref: this.model.userPref,
                    user: this.model.user,
                    dmcSettings: this.model.dmcSettings
                }
            });
            this.children.dashboard = new DashboardView({
                model: {
                    userPref: this.model.userPref,
                    application: this.model.application,
                    user: this.model.user,
                    dashboard: this.model.dashboard,
                    uiPref: this.model.uiPref
                }
            });
            this.children.gettingStarted = new GettingStartedView({
                model: {
                    uiPref: this.model.uiPref,
                    application: this.model.application,
                    user: this.model.user,
                    canManageRemoteApps: this.canManageRemoteApps
                },
                collection: {
                    managers: this.collection.managers,
                    tours: this.collection.tours
                }
            });

        },
        render: function () {
            this.$el.html(this.template);
            this.children.apps.appendTo(this.$('.apps')).render();
            this.children.gettingStarted.appendTo(this.$('.dashboard')).render();
            this.children.dashboard.appendTo(this.$('.dashboard')).render();
        },
        template: '\
            <div class="section-home section-content">\
                <div class="apps"></div>\
                <div class="dashboard scrolling-bar-dashboard"></div>\
            </div>\
        '
    });
});
