define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'uri/route',
    'util/string_utils',
    'jquery.ui.sortable'//no import
],
function (
    $,
    _,
    module,
    BaseView,
    route,
    string_utils
) {
    return BaseView.extend({
        moduleId: module.id,
        events: {
            'sortstop .list-apps': 'onSortableStop'
        },
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.showUpdates = !this.model.dmcSettings.isEnabled();
        },
        render: function() {
            var root = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                app = this.model.application.get('app');

            var manageAppsLink = route.manager(
                root, locale, app, ['apps','local']
            );

            var findAppsLink = route.manager(
                root, locale, app, ['appsremote']
            );

            // remove management console from list of apps
            var apps = this.collection.apps.clone();
            apps.remove(apps.filter(function(model) {
                return !model.entry.content.get("show_in_nav");
            }));

            var html = this.compiledTemplate({
                apps: apps,
                appNavs: this.collection.appNavs,
                _: _,
                route: route,
                root: root,
                locale: locale,
                owner: this.model.application.get('owner'),
                thisApp: app,
                manageAppsLink: manageAppsLink,
                findAppsLink: findAppsLink,
                canManageRemoteApps: this.model.user.canViewRemoteApps() && this.model.user.canManageRemoteApps(),
                showUpdates: this.showUpdates
            });
            this.$el.html(html);
            this.$listApps = this.$('.list-apps');
            this.bindDragAndDrop();
            return this;
        },
        bindDragAndDrop: function() {
            var self = this;
            this.$listApps.sortable({ axis: "y" });
        },
        onSortableStop: function(){
            var apps = this.$('.app'),
                appList = [],
                appId;
            apps.each(function(index, item){
                appId = String($(item).data('appid'));
                appList.push(appId);
            });
            this.model.userPref.entry.content.set('appOrder', appList.join(','));
            this.model.userPref.save();
        },
        template: '\
        <div class="app-title"><h3><%-_("Apps").t()%>\
            	<a href="<%-manageAppsLink%>" title="<%-_("Manage Apps").t()%>" class="btn-pill manage-apps"><span class="icon-gear"></span></a>\
        </h3></div>\
        <div class="scrolling-bar">\
        <div class="list-apps">\
            <% apps.each(function(app) { %>\
            <% var appNav = appNavs.findByAppName(app.entry.get("name")); %>\
                <div class="app" data-appid="<%- app.entry.get("name") %>" style="<%- appNav && appNav.getColor() ? ("background-color:" + appNav.getColor()) : "" %>">\
                    <a href="<%- route.page(\
                        root,\
                        locale,\
                        app.entry.get("name"),\
                        "") %>">\
                            <span class="helper"></span><img src="<%- route.appIcon(\
                                root,\
                                locale,\
                                owner,\
                                app.entry.get("name")) %>">\
                        <div class="app-name"><%- _(app.entry.content.get("label")).t() %></div>\
                        <div class="drag-handle"></div>\
                        <% if (showUpdates && app.entry.links.get("update")) { %>\
                            <% var splunkAppsId = app.getSplunkAppsId(); %> \
                            <% if (splunkAppsId) { %>\
                                <a class="app-update-link" href="<%- route.manager(\
                                    root,\
                                    locale,\
                                    "appinstall",\
                                    splunkAppsId,\
                                    {data: {return_to: "/app/launcher/home"}}) %>"><%-_("Update").t()%></a>\
                            <% } %>\
                        <% } %>\
                    </a>\
                </div>\
            <% }); %>\
        </div>\
        <% if (canManageRemoteApps) { %>\
            <div class="add-more-apps" title="<%-_("Find More Apps").t()%>"><a href="<%-findAppsLink%>" class="add-more-apps-link">\
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" width="36px" height="36px" viewBox="0 0 36 36" version="1.1">\
                    <g>\
                        <path d="M17,17 L17,0 L19,0 L19,17 L36,17 L36,19 L19,19 L19,36 L17,36 L17,19 L0,19 L1.2246468e-16,17 L17,17 Z"></path>\
                    </g>\
                </a></svg>\
            </div>\
        <% } %>\
        </div>\
        '
    });
});
