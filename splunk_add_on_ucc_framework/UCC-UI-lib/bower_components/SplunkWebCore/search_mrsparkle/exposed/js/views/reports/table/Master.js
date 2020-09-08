define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/shared/TableHead',
        'views/shared/delegates/TableRowToggle',
        'views/reports/table/TableRow',
        'views/reports/table/MoreInfo',
        'views/shared/delegates/TableDock'
    ],
    function(
        module,
        $,
        _,
        BaseView,
        TableHeadView,
        TableRowToggleView,
        TableRow,
        MoreInfo,
        TableDock
    ){
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model:
             *          state: <Backbone.Model>
             *          application: <models.Application>,
             *          uiPrefs: <models.services.admin.UIPrefs>
             *     }
             *     collection: {
             *         reports: <collections.Reports>,
             *         roles: <collections.services.authorization.Roles>,
             *         apps: <collections.services.AppLocals>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.tableRowToggle = new TableRowToggleView({el: this.el, collapseOthers: true });

                var tableHeaders = [];
                tableHeaders.push({ label: _('i').t(), className: 'col-info', html: '<i class="icon-info"></i>' });
                tableHeaders.push({ label: _('Title').t(), sortKey: 'name' });
                tableHeaders.push({ label: _('Actions').t(), className: 'col-actions', colSpan: 2 });
                tableHeaders.push({ label: _('Owner').t(), sortKey: 'eai:acl.owner,name', className: 'col-owner' });
                if (this.model.user.canUseApps()) {
                    tableHeaders.push({ label: _('App').t(), sortKey: 'eai:acl.app,name', className: 'col-app' });
                }
                tableHeaders.push({ label: _('Sharing').t(), sortKey: 'eai:acl.sharing,name', className: 'col-sharing' });

                this.children.head = new TableHeadView({
                    model: this.model.state,
                    columns: tableHeaders
                });
                this.children.rows = this.rowsFromCollection();
                this.activate();

                this.children.tableDock = new TableDock({ el: this.el, offset: 36, dockScrollBar: false, defaultLayout: 'fixed', flexWidthColumn: 1 });
            },
            startListening: function() {
                this.listenTo(this.collection.reports, 'reset', this.renderRows);
            },
            rowsFromCollection: function() {
                var currentApp = this.model.application.get('app'),
                    alternateApp = currentApp !== 'system' ? currentApp : 'search';
                var searchApp = _.find(this.collection.apps.models, function(app) {
                    return app.entry.get('name') === 'search';
                });
                if (alternateApp === 'search' && searchApp && searchApp.entry.content.get("disabled")) {
                    this.collection.apps.sortWithString(this.model.userPref.entry.content.get('appOrder'));
                    alternateApp = this.collection.apps.models[0].entry.get('name');
                }
                return _.flatten(
                    this.collection.reports.map(function(model, i) {
                        return [
                            new TableRow({
                                model: {
                                    report: model,
                                    application: this.model.application,
                                    state: this.model.state,
                                    user: this.model.user,
                                    appLocal: this.model.appLocal,
                                    serverInfo: this.model.serverInfo
                                },
                                collection: {
                                    roles: this.collection.roles,
                                    apps: this.collection.apps
                                },
                                index: i,
                                alternateApp: alternateApp
                            }),
                            new MoreInfo({
                                model: {
                                    report: model,
                                    application: this.model.application,
                                    user: this.model.user,
                                    appLocal: this.model.appLocal,
                                    serverInfo: this.model.serverInfo
                                },
                                collection: {
                                    roles: this.collection.roles,
                                    apps: this.collection.apps
                                },
                                index: i,
                                alternateApp: alternateApp
                            })
                        ];
                    }, this)
                );
            },
            _render: function() {
                _(this.children.rows).each(function(row){
                    row.render().appendTo(this.$('.report-listings'));
                }, this);
                this.children.tableDock.update();
            },
            renderRows: function() {
                 _(this.children.rows).each(function(row){ row.remove(); }, this);
                 this.children.rows = this.rowsFromCollection();
                 this._render();
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.append(this.compiledTemplate({}));
                    this.children.head.render().prependTo(this.$('> .table-chrome'));
                }
                this._render();
                return this;
            },
            template: '\
                <table class="table table-chrome table-striped table-row-expanding table-listing">\
                <tbody class="report-listings"></tbody>\
                </table>\
            '
        });
    }
);
