define(
    [
        'module',
        'underscore',
        'jquery',
        'backbone',
        'views/Base',
        'views/shared/TableHead',
        'views/shared/delegates/TableRowToggle',
        'views/dashboards/table/TableRow',
        'views/dashboards/table/MoreInfo',
        'collections/services/authorization/Roles',
        'views/shared/delegates/TableDock',
        'models/services/ScheduledView'
    ],
    function(
        module,
        _,
        $,
        Backbone,
        BaseView,
        TableHeadView,
        TableRowToggleView,
        TableRow,
        MoreInfo,
        RolesCollection,
        TableDock,
        ScheduledView
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         state: <models.State>,
             *         application: <models.Application>,
             *         uiPrefs: <models.services.admin.UIPrefs>,
             *         user: <models.service.admin.user>
             *     },
             *     collection: {
             *         dashboards: <collections.Dashboards>,
             *         roles: <collections.services.authorization.Roles>,
             *         appLocalsUnfiltered: <collections.services.AppLocals>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.tableRowToggle = new TableRowToggleView({el: this.el, collapseOthers: true });

                var tableHeaders = [];
                tableHeaders.push({ label: 'i', className: 'col-info', html: '<i class="icon-info"></i>' });
                tableHeaders.push({ label: _("Title").t(), sortKey: 'label' });
                tableHeaders.push({ label: _("Actions").t(), className: 'col-actions' });
                tableHeaders.push({ label: _("Owner").t(), sortKey: 'eai:acl.owner,label', className: 'col-owner' });
                if (this.model.user.canUseApps()) {
                    tableHeaders.push({ label: _("App").t(), sortKey: 'eai:acl.app,label', className: 'col-app' });
                }
                tableHeaders.push({ label: _("Sharing").t(), sortKey: 'eai:acl.sharing,label', className: 'col-sharing' });

                this.children.head = new TableHeadView({
                    model: this.model.state,
                    columns: tableHeaders
                });
                this.children.rows = this.rowsFromCollection();
                this.children.tableDock = new TableDock({
                    el: this.el,
                    offset: 36,
                    dockScrollBar: false,
                    defaultLayout: 'fixed',
                    flexWidthColumn: 1
                });
                this.collection.dashboards.on('reset remove add', _.debounce(this.renderRows), this);
            },
            rowsFromCollection: function() {
                var currentApp = this.model.application.get('app'),
                    alternateApp = currentApp !== 'system' ? currentApp : 'search';
                var searchApp = _.find(this.collection.appLocalsUnfiltered.models, function(app) {
                    return app.entry.get('name') === 'search';
                });
                if (alternateApp === 'search' && searchApp && searchApp.entry.content.get("disabled")) {
                    this.collection.appLocalsUnfiltered.sortWithString(this.model.userPref.entry.content.get('appOrder'));
                    alternateApp = this.collection.appLocalsUnfiltered.models[0].entry.get('name');
                }
                return _.flatten(
                    this.collection.dashboards.map(function(model, i) {
                        var scheduledView = new ScheduledView();
                        return [
                            new TableRow({
                                model: {
                                    state: this.model.state,
                                    dashboard: model,
                                    application: this.model.application,
                                    scheduledView: scheduledView,
                                    user: this.model.user,
                                    userPref: this.model.userPref,
                                    appLocal: this.model.appLocal,
                                    serverInfo: this.model.serverInfo,
                                    infoDeliveryUIControl: this.model.infoDeliveryUIControl
                                },
                                collection: {
                                    dashboards: this.collection.dashboards,
                                    roles: this.collection.roles,
                                    appLocalsUnfiltered: this.collection.appLocalsUnfiltered
                                },
                                index: i,
                                alternateApp: alternateApp
                            }),
                            new MoreInfo({
                                model: {
                                    state: this.model.state,
                                    dashboard: model,
                                    application: this.model.application,
                                    scheduledView: scheduledView,
                                    user: this.model.user,
                                    appLocal: this.model.appLocal,
                                    serverInfo: this.model.serverInfo,
                                    infoDeliveryUIControl: this.model.infoDeliveryUIControl
                                },
                                collection: this.collection.roles,
                                index: i
                            })
                        ];
                    }, this)
                );
            },
            _render: function() {
                _(this.children.rows).each(function(row){
                    this.$('.dashboards-listings').append(row.render().el);
                }, this);
                this.children.tableDock.update();
            },
            renderRows: function() {
                _(this.children.rows).invoke('remove');
                this.children.rows = this.rowsFromCollection();
                this._render();
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.append(this.compiledTemplate({}));
                    this.$('> .table-chrome').prepend(this.children.head.render().el);
                }
                this._render();
                return this;
            },
            template: '\
                <table class="table table-chrome table-striped table-row-expanding">\
                <tbody class="dashboards-listings"></tbody>\
                </table>\
            '
        });
    }
);