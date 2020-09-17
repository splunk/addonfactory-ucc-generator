define([
    'module',
    'jquery',
    'underscore',
    'views/Base',
    'views/shared/TableHead',
    'views/alert_actions/table/TableRow',
    'views/shared/delegates/TableDock'
], function(
        module,
        $,
        _,
        BaseView,
        TableHeadView,
        TableRow,
        TableDock
    ){
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model:
             *          state: <Backbone.Model>
             *          application: <models.Application>
             *     }
             *     collection: {
             *         alertActions: <collections.Reports>,
             *         roles: <collections.services.authorization.Roles>,
             *         apps: <collections.services.AppLocals>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                var tableHeaders = [];
                var isLite = this.model.serverInfo.isLite();
                tableHeaders.push({ label: _('Alert action').t(), sortKey: 'label,name' });
                if (this.model.user.canUseApps()) {
                    tableHeaders.push({ label: _('App').t(), sortKey: 'eai:acl.app,name', className: 'col-app' });
                }
                tableHeaders.push({ label: _('Sharing').t(), sortKey: 'eai:acl.sharing,name', className: 'col-sharing' });
                tableHeaders.push({ label: _('Status').t(), sortKey: 'disabled,name', className: 'col-status' });
                if (!isLite) {
                    tableHeaders.push({label: _('Usage').t(), className: 'col-usage'});
                }
                tableHeaders.push({ label: _('Log').t(), className: 'col-log' });
                tableHeaders.push({ label: _('Setup').t(), className: 'col-setup' });
                this.children.head = new TableHeadView({
                    model: this.model.state,
                    columns: tableHeaders
                });
                this.children.rows = this.rowsFromCollection();
                this.activate();
                this.children.tableDock = new TableDock({ el: this.el, offset: 36, dockScrollBar: false, defaultLayout: 'fixed', flexWidthColumn: 1 });
            },
            startListening: function() {
                this.listenTo(this.collection.alertActions, 'reset', this.renderRows);
            },

            rowsFromCollection: function() {
                var currentApp = this.model.application.get('app'),
                    alternateApp = currentApp !== 'system' ? currentApp : 'search';
                var searchApp = _.find(this.collection.apps.models, function(app) {
                    return app.entry.get('name') === 'search';
                });
                if (alternateApp === 'search' && searchApp && searchApp.entry.content.get("disabled")) {
                    alternateApp = this.collection.apps.models[0].entry.get('name');
                }
                if( this.collection.alertActions.length > 0) {
                    this.children.head.$el.show();
                    return _.flatten(
                        this.collection.alertActions.map(function(model, i) {
                            return [
                                new TableRow({
                                    model: {
                                        alertAction: model,
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
                                })                      
                            ];
                        }, this)
                    );
                } else {
                    this.children.head.$el.hide();
                    $('<tr class="expand no-results alertactions-table-tablerow odd"><td style="text-align:center">' +
                    _.escape(_('No results found').t()) +
                    '</td></tr>').appendTo(this.$('.alert-actions-listings'));
                }
            },
            _render: function() {
                _(this.children.rows).each(function(row){
                    row.render().appendTo(this.$('.alert-actions-listings'));
                }, this);
                this.children.tableDock.update();
            },
            renderRows: function() {
                this.$('.no-results').remove();
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
            template: 
                '<table class="table table-chrome table-striped table-listing">\
                    <tbody class="alert-actions-listings"></tbody>\
                </table>'
        });
});
