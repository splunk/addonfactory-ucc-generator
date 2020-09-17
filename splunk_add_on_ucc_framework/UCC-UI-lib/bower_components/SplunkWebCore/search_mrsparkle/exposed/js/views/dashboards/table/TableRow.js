define(
        [
            'module',
            'underscore',
            'jquery',
            'views/Base',
            'views/shared/delegates/TableRowToggle',
            'views/dashboards/table/controls/EditMenu',
            'uri/route',
            'util/splunkd_utils',
            'util/keyboard'
        ],
        function(module, _, $, BaseView, TableRowToggleView, EditMenu, route, splunkd_utils, keyboard) {
            return BaseView.extend({
                moduleId: module.id,
                tagName: 'tr',
                className: 'expand',
                /**
                 * @param {Object} options {
             *     model: {
             *          state: <models.State>
             *          application: <models.Application>,
             *          userPref: <models.services.data.UserPrefGeneral>
             *          dashboard: <models.services.data.ui.View>,
             *          scheduledView: <models.services.ScheduledView>
             *     },
             *     collection: {
             *          roles: <collections.services.authorization.Roles>,
             *          dashboards: <collections.Dashboards>,
             *          appLocalsUnfiltered: <collections.services.AppLocals>
             *     }
             * }
                 */
                initialize: function() {
                    BaseView.prototype.initialize.apply(this, arguments);
                    this.$el.addClass((this.options.index % 2) ? 'even' : 'odd');

                    this.model.dashboard.on('updateCollection', function() {
                        this.model.state.trigger('change:search');
                    }, this);

                    this.model.dashboard.meta.on('change:label', this.updateLabel, this);
                    this.compiledLabelTemplate = this.compileTemplate(this.labelTemplate);
                    this.model.dashboard.entry.acl.on('change:sharing', this.updateSharing, this);
                },
                updateLabel: function() {
                    var app = this.model.application, dashboard = this.model.dashboard,
                        appName = dashboard.entry.acl.get('app'),
                        dashApp = _.find(this.collection.appLocalsUnfiltered.models, function(app) {return app.entry.get('name') === appName;}),
                        openInApp = app.get("app");
                        if (openInApp === "system") {
                            openInApp = dashApp && dashApp.entry.content.get("visible") ? appName : this.options.alternateApp;
                        }
                    this.$('td.title').html(this.compiledLabelTemplate({
                        label: dashboard.meta.get('label'),
                        link: route.page(app.get("root"), app.get("locale"), openInApp, dashboard.entry.get('name'))
                    }));
                },
                events: {
                    'mousedown td.actions > a.dropdown-toggle': function(e) {
                        this.openEdit(e);
                    },
                    'keydown td.actions > a.dropdown-toggle': function(e) {
                        if (e.which === keyboard.KEYS.ENTER) {
                            this.openEdit(e);
                            e.preventDefault();
                        }
                    },
                    'click td.actions > a.dropdown-toggle': function(e) {
                        e.preventDefault();
                    }

                },
                openEdit: function (e) {
                    var $target = $(e.currentTarget);
                    if (this.children.editmenu && this.children.editmenu.shown) {
                        this.children.editmenu.hide();
                        e.preventDefault();
                        return;
                    }
                    
                    this.children.editmenu = new EditMenu({
                        model: this.model,
                        collection: {
                            dashboards: this.collection.dashboards,
                            roles: this.collection.roles,
                            appLocalsUnfiltered: this.collection.appLocalsUnfiltered
                        },
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        mode: 'menu'
                    });
                    $('body').append(this.children.editmenu.render().el);
                    this.children.editmenu.show($target);
                    
                },
                updateSharing: function () {
                    var sharing = this.model.dashboard.entry.acl.get('sharing');
                    var sharingLabel = splunkd_utils.getSharingLabel(sharing);
                    this.$('td.sharing').text(sharingLabel);
                },
                render: function() {
                    this.$el.html(this.compiledTemplate({
                        _:_,
                        app: this.model.dashboard.entry.acl.get('app'),
                        owner: this.model.dashboard.entry.acl.get('owner'),
                        index: this.options.index,
                        canUseApps: this.model.user.canUseApps(),
                        isLite: this.model.serverInfo.isLite()
                    }));
                    this.updateLabel();
                    this.updateSharing();
                    return this;
                },
                template: '\
                <td class="expands">\
                    <a href="#"><i class="icon-triangle-right-small"></i></a>\
                </td>\
                <td class="title">\
                </td>\
                <td class="actions">\
                    <a class="dropdown-toggle" href="#"><%- _("Edit").t() %><span class="caret"></span></a>\
                </td>\
                <td class="owner"><%= owner %></td>\
                <% if(canUseApps) { %>\
                    <td class="app"><%= app %></td>\
                <% } %>\
                <td class="sharing"></td>\
            ',
                labelTemplate: '<a href="<%= link %>" title="<%- label %>"><%- label %></a>'
            });
        }
);


