define([
        'underscore',
        'views/Base',
        'module',
        'views/shared/FlashMessages',
        'views/alert/Header',
        'views/alert/history/Master',
        'views/alert/NoFiredAlerts',
        'views/alert/Disabled',
        'views/shared/alertcontrols/EditMenu',
        'util/splunkd_utils',
        './Master.pcss'
    ],
    function(
        _,
        BaseView,
        module,
        FlashMessageView,
        HeaderView,
        HistoryView,
        NoFiredAlertsView,
        DisabledView,
        EditMenuView,
        splunkd_utils,
        css
    ) {
    return BaseView.extend({
        moduleId: module.id,
        className: 'view-alert-page',
        /**
         * @param {Object} options {
         *      model: {
         *         savedAlert: <models.Report>,
         *         application: <models.Application>,
         *         appLocal: <models.services.AppLocal>
         *         user: <models.services.admin.User>
         *     },
         *     collection: {
         *          roles: <collections.services.authorization.Roles>
         *          alertsAdmin: <collections.services.admin.Alerts>,
         *          alertActions: <collections.shared.ModAlertActions>
         *     }
         */
        initialize: function(options) {
            options.dontAddModuleIdAsClass = true;
            BaseView.prototype.initialize.call(this, options);

            this.errorTypes = [splunkd_utils.FATAL, splunkd_utils.ERROR, splunkd_utils.NOT_FOUND];

            this.isError = splunkd_utils.messagesContainsOneOfTypes(this.model.savedAlert.error.get("messages"), this.errorTypes);

            this.children.flashMessageView = new FlashMessageView({
                model: {
                    savedAlert: this.model.savedAlert
                },
                whitelist: this.errorTypes
            });

            if (!this.isError) {

                //views
                this.children.editmenu = new EditMenuView({
                    model: {
                        savedAlert: this.model.savedAlert,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles,
                        alertActions: this.collection.alertActions
                    },
                    buttonpill: false,
                    deleteRedirect: true
                });

                this.children.headerView = new HeaderView ({
                    model: {
                        savedAlert: this.model.savedAlert,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles,
                        alertActions: this.collection.alertActions
                    }
                });

                this.children.historyView = new HistoryView({
                    model: {
                        savedAlert: this.model.savedAlert,
                        application: this.model.application
                    },
                    collection: {
                        roles: this.collection.roles,
                        alertsAdmin: this.collection.alertsAdmin
                    }
                });

                this.children.noFiredAlertsView = new NoFiredAlertsView();
                this.children.disabledView = new DisabledView();

                this.activate();
            }

        },
        startListening: function() {
            this.listenTo(this.collection.alertsAdmin, 'add remove reset', _.debounce(this.visibility));
            this.listenTo(this.model.savedAlert.entry.content, 'change:disabled', this.visibility);
        },
        render: function() {
            if (this.isError) {
                this.children.flashMessageView.render().appendTo(this.$el);
            } else {
                this.$el.html(this.template);

                var $alertDetails = this.$('.alert-details-header');

                this.children.editmenu.render().appendTo($alertDetails);
                this.children.editmenu.$el.addClass('pull-right');
                this.children.headerView.render().appendTo($alertDetails);
                this.children.flashMessageView.render().appendTo($alertDetails);
                this.children.historyView.render().appendTo(this.$el);
                this.children.noFiredAlertsView.render().appendTo(this.$el);
                this.children.disabledView.render().appendTo(this.$el);

                this.visibility();
            }
            return this;
        },
        visibility: function() {
            if (this.model.savedAlert.entry.content.get('disabled')) {
                this.children.historyView.$el.hide();
                this.children.noFiredAlertsView.$el.hide();
                this.children.disabledView.$el.show();
            } else if (!_.isEmpty(this.collection.alertsAdmin.toJSON())) {
                this.children.historyView.$el.show();
                this.children.noFiredAlertsView.$el.hide();
                this.children.disabledView.$el.hide();
            } else {
                this.children.historyView.$el.hide();
                this.children.noFiredAlertsView.$el.show();
                this.children.disabledView.$el.hide();
            }
        },
        template: '\
            <div class="alert-details-header section-padded section-header"></div>\
            <div class="divider"></div>\
        '
    });
});
