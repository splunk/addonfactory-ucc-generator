define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/alert_actions/Title',
        'views/alert_actions/table/Master',
        'views/alert_actions/caption/Master',
        './Master.pcss'
    ],
    function(
        _,
        module,
        BaseView,
        TitleView,
        TableView,
        CaptionView,
        css
    ){
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         state: <models.Base>,
             *         application: <models.Application>,
             *         appLocal: <models.services.AppLocal>
             *         user: <models.service.admin.user>,
             *         uiPrefs: <models.services.admin.UIPrefs>,
             *         rawSearch: <models.Base>
             *     },
             *     collection: {
             *         alertActions: <collections.Reports>
             *         roles: <collections.services.authorization.Roles>,
             *         apps: <collections.services.AppLocals>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.title = new TitleView({
                    model: {
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        application: this.model.application
                    }
                });

                this.children.caption = new CaptionView({
                    countLabel: _('Alert actions').t(),
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        user: this.model.user,
                        uiPrefs: this.model.uiPrefs,
                        serverInfo: this.model.serverInfo,
                        rawSearch: this.model.rawSearch
                    },
                    collection: {
                        alertActions: this.collection.alertActions,
                        apps: this.collection.apps
                    },
                    filterKey: 'name label'
                });
            },

            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.html(this.compiledTemplate({}));
                    this.children.title.render().appendTo(this.$('.section-header'));
                    this.children.caption.render().appendTo(this.$el);
                }
                this._renderTable();
                return this;
            },

            _renderTable: function() {
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
                            alertActions: this.collection.alertActions,
                            roles: this.collection.roles,
                            apps: this.collection.apps
                        }
                    });
                }
                this.children.table.render().appendTo(this.$el);
            },

            template: '<div class="section-padded section-header"></div>'
        });
    }
);
