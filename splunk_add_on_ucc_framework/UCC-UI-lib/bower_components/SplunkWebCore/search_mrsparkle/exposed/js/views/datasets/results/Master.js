define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/datasets/results/tablecaption/Master',
        'views/datasets/results/table/Master'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        CaptionView,
        TableView
    ) {
        return BaseView.extend({
            moduleId: module.id,

            /**
             * @param {Object} options {
             *      model: {
             *          state: <Backbone.Model>
             *          application: <models.Application>,
             *          uiPrefs: <models.services.admin.UIPrefs>
             *          userPref: <models.services.data.UserPref>
             *          user: <models.services.authentication.User>
             *          appLocal: <models.services.AppLocal>
             *          serverInfo: <models.services.server.ServerInfo>
             *          rawSearch: <Backbone.Model>
             *      }
             *      collection: {
             *          datasets: <collections.Datasets>,
             *          roles: <collections.services.authorization.Roles>,
             *          apps: <collections.services.AppLocals>
             *      }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                
                this.children.caption = new CaptionView({
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        uiPrefs: this.model.uiPrefs,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        rawSearch: this.model.rawSearch
                    },
                    collection: {
                        datasets: this.collection.datasets
                    },
                    filterKey: ['displayName', 'description', 'dataset.description', 'dataset.fields'],
                    conditions: {description: 'eai:type != "datamodel"'}
                });

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
                        datasets: this.collection.datasets,
                        roles: this.collection.roles,
                        apps: this.collection.apps
                    }
                });
            },

            render: function() {
                if (!this.$el.html()) {
                    this.children.caption.render().appendTo(this.$el);
                    this.children.table.render().appendTo(this.$el);
                }
                return this;
            }
        });
    }
);