define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/dashboards/Title',
        'views/dashboards/table/Master',
        'views/dashboards/tiles/Master',
        'views/shared/tablecaption/Master',
        'util/infodelivery_utils',
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
        infoUtils,
        css
    ){
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         state: <models.Base>,
             *         application: <models.Application>,
             *         appLocal: <models.services.AppLocal>,
             *         uiPrefs: <models.services.admin.UIPrefs>,
             *         rawSearch: <models.Base>
             *     },
             *     collection: {
             *         dashboards: <collections.Dashboards>,
             *         roles: <collections.services.authorization.Roles>,
             *         appLocalsUnfiltered: <collections.services.AppLocals>
             *     },
             *     hideCreateLink: <boolean>
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.title = new TitleView({
                    model: {
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection.dashboards,
                    hideCreateLink: this.options.hideCreateLink
                });

                this.children.caption = new CaptionView({
                    countLabel: _("Dashboards").t(),
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        uiPrefs: this.model.uiPrefs,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        rawSearch: this.model.rawSearch
                    },
                    collection: this.collection.dashboards,
                    noFilter: false,
                    filterKey: ['label','eai:data'],
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
                    var $inner = this.$('.section-header');
                    this.children.title.render().appendTo($inner);
                    this.children.caption.render().appendTo(this.$el);
                }

                // wait to see if info delivery is installed
                infoUtils.getInfoDeliveryFlags(this.collection.appLocalsUnfilteredAll.models, this.model.userPref).then(function (result) {
                    this.model.infoDeliveryUIControl = result;

                    if (this.model.serverInfo.isLite() && (this.model.uiPrefs.entry.content.get("display.prefs.listMode") === "tiles")) {
                        this._renderTiles();
                    } else {
                        this._renderTable();
                    }
                }.bind(this));

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
                            serverInfo: this.model.serverInfo,
                            infoDeliveryUIControl: this.model.infoDeliveryUIControl
                        },
                        collection: {
                            dashboards: this.collection.dashboards,
                            roles: this.collection.roles,
                            appLocalsUnfiltered: this.collection.appLocalsUnfiltered
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
                            serverInfo: this.model.serverInfo,
                            infoDeliveryUIControl: this.model.infoDeliveryUIControl
                        },
                        collection: {
                            dashboards: this.collection.dashboards,
                            roles: this.collection.roles,
                            appLocalsUnfiltered: this.collection.appLocalsUnfiltered,
                            appLocalsUnfilteredAll: this.collection.appLocalsUnfilteredAll
                        }
                    });
                }

                this.children.table.render().appendTo(this.$el);
            },

            template: '<div class="section-padded section-header"></div><% if (!isLite) { %><div class="divider"></div><% } %>'
        });
    }
);