define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/alerts/Title',
        'views/alerts/table/Master',
        'views/alerts/tiles/Master',
        'views/shared/tablecaption/Master',
        './Master.pcss'
    ],
    function(
        _,
        module,
        BaseView,
        TitleView,
        TableView,
        TilesView,
        CaptionView,
        css
    ){
        return BaseView.extend({
            className: 'alerts-view',
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *          state: <models.Base>,
             *          application: <models.Application>,
             *          appLocal: <models.services.AppLocal>,
             *          uiPrefs: <models.services.admin.UIPrefs>
             *          user: <models.services.admin.User>,
             *          rawSearch: <models.Base>
             *     },
             *     collection: {
             *         savedAlerts: <collections.services.SavedSearches>,
             *         roles: <collections.services.authorization.Roles>,
             *         apps: <collections.services.AppLocals>,
             *         alertActions: <collections.shared.ModAlertActions>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.title = new TitleView({
                    model: {
                        serverInfo: this.model.serverInfo,
                        state: this.model.state
                    }
                });

                this.children.caption = new CaptionView({
                    countLabel: _('Alerts').t(),
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        uiPrefs: this.model.uiPrefs,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        rawSearch: this.model.rawSearch
                    },
                    collection: this.collection.savedAlerts,
                    noFilter: false,
                    showListModeButtons: this.model.serverInfo.isLite()
                });

                if (this.model.serverInfo.isLite()) {
                    this.listenTo(this.model.uiPrefs.entry.content, "change:display.prefs.listMode", this.debouncedRender);
                }
            },

            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.html(this.compiledTemplate({
                        isLite: this.model.serverInfo.isLite()
                    }));
                    this.children.title.render().appendTo(this.$('.section-header'));
                    this.children.caption.render().appendTo(this.$el);
                }

                if (this.model.serverInfo.isLite() && (this.model.uiPrefs.entry.content.get("display.prefs.listMode") === "tiles")) {
                    this._renderTiles();
                } else {
                    this._renderTable();
                }

                return this;
            },

            _renderTiles: function() {
                if (this.children.table) {
                    this.children.table.remove();
                    delete this.children.table;
                }

                if (!this.children.tiles) {
                    this.children.tiles = new TilesView({
                        model: {
                            state: this.model.state,
                            application: this.model.application,
                            uiPrefs: this.model.uiPrefs,
                            userPref: this.model.userPref,
                            user: this.model.user,
                            appLocal: this.model.appLocal,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            savedAlerts: this.collection.savedAlerts,
                            roles: this.collection.roles,
                            alertActions: this.collection.alertActions
                        }
                    });
                }

                this.children.tiles.render().appendTo(this.$el);
            },

            _renderTable: function() {
                if (this.children.tiles) {
                    this.children.tiles.remove();
                    delete this.children.tiles;
                }

                if (!this.children.table) {
                    this.children.table = new TableView({
                        model: {
                            state: this.model.state,
                            application: this.model.application,
                            uiPrefs: this.model.uiPrefs,
                            userPref: this.model.userPref,
                            user: this.model.user,
                            appLocal: this.model.appLocal,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            savedAlerts: this.collection.savedAlerts,
                            roles: this.collection.roles,
                            apps: this.collection.apps,
                            alertActions: this.collection.alertActions
                        }
                    });
                }

                this.children.table.render().appendTo(this.$el);
            },

            template: '<div class="section-padded section-header"></div><% if (!isLite) { %><div class="divider"></div><% } %>'
        });
    }
);
