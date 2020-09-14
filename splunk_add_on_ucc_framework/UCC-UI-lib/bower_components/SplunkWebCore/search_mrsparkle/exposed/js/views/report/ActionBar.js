define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/reportcontrols/editmenu/Master',
        'views/shared/reportcontrols/dialogs/dashboardpanel/Master',
        'views/shared/reportcontrols/details/Master',
        'views/shared/delegates/Popdown',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        EditButtonView,
        DashboardDialog,
        DetailsView,
        Popdown,
        splunkutil
    ) {
    return BaseView.extend({
        moduleId: module.id,
        className: 'btn-group pull-right',
         /**
         * @param {Object} options {
         *      model: {
         *          application: <models.Application>,
         *          report: <models.Report>,
         *          searchJob: <models.services.search.Job>,
         *          appLocal: <models.services.AppLocal>,
         *          user: <models.services.admin.User>
         *      },
         *      collection: {
         *          roles: <collections.services.authorization.Roles>
         *      }
         * }
         */
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.editButtonView = new EditButtonView({
                model: {
                    report: this.model.report,
                    application: this.model.application,
                    searchJob: this.model.searchJob,
                    user: this.model.user,
                    appLocal: this.model.appLocal,
                    serverInfo: this.model.serverInfo
                },
                collection: this.collection,
                deleteRedirect: true,
                className: 'btn-combo'
            });
            
            this.children.detailsView = new DetailsView({
                model: {
                    report: this.model.report,
                    application: this.model.application,
                    searchJob: this.model.searchJob,
                    user: this.model.user,
                    appLocal: this.model.appLocal,
                    serverInfo: this.model.serverInfo
                },
                collection: {
                    roles: this.collection.roles
                }
            });
        },
        startListening: function() {
            this.listenTo(this.model.searchJob, 'prepared', function() {
                this.$('a.addtodashboard').removeClass('disabled');
            });
        },
        events: {
            'click a.addtodashboard': function(e) {
                this.children.dashboardDialog = new DashboardDialog({
                    model:  {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    onHiddenRemove: true
                });

                this.children.dashboardDialog.render().appendTo($("body"));
                this.children.dashboardDialog.show();

                e.preventDefault();
            }
        },
        render: function() {
            this.$el.html(this.compiledTemplate({
                _: _
            }));
            this.children.editButtonView.render().prependTo(this.$el);
            this.children.detailsView.render().prependTo(this.$('.more-info .popdown-dialog-body'));

            if (this.model.searchJob.isPreparing()) {
                this.$('a.addtodashboard').addClass('disabled');
            }

            this.children.popdownDelegate = new Popdown({el: this.$('.more-info')});
            return this;
        },
        template: '\
            <div class="btn-combo more-info"><a href=# class="popdown-toggle btn"><%- _("More Info").t() %><span class="caret"></span></a><div class="popdown-dialog"><div class="arrow"></div><div class="popdown-dialog-body"></div></div></div>\
            <a href=# class="addtodashboard btn"><%- _("Add to Dashboard").t() %></a>\
        '
    });
});
