define(
    [
         'jquery',
         'underscore',
         'module',
         'views/Base',
         'views/search/actions/savemenu/SaveReportAs',
         'views/search/actions/savemenu/CreateAlert',
         'views/search/actions/savemenu/CreateEventType',
         'views/search/actions/savemenu/CreateDashboardPanel',
         'views/shared/delegates/Popdown'
    ],
    function(
         $,
         _,
         module,
         Base,
         SaveReportAs,
         CreateAlert,
         CreateEventType,
         CreateDashboardPanel,
         Popdown
    ){
        return Base.extend({
            moduleId: module.id,
            className: 'save dropdown',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                //save report as
                this.children.saveReportAs = new SaveReportAs({
                    model:  {
                        report: this.model.report,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    }
                });

                //create alert
                this.children.createAlert = new CreateAlert({
                    model: {
                        report: this.model.report,
                        reportPristine: this.model.reportPristine,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        times: this.collection.times
                    }
                });
                
                //create dashboard panel
                this.children.createDashboardPanel = new CreateDashboardPanel({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    }
                });
                
                //create event type
                this.children.createEventType = new CreateEventType({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        user: this.model.user
                    }
                });
            },
            startListening: function() {
                this.listenTo(this.model.report.entry.fields, 'change', function() {
                    var optional = this.model.report.entry.fields.get('optional');
                    (_.isArray(optional) && _.indexOf(optional, 'cron_schedule') > -1) ?
                        this.children.createAlert.$el.show():
                        this.children.createAlert.$el.hide();
                });
                this.listenTo(this.model.searchJob, 'prepared', this.render);
            },
            render: function() {
                var canSaveAlert = this.model.user.canScheduleSearch(),
                    canUseAlerts = this.model.user.canUseAlerts();
                
                if (this.model.searchJob.isPreparing()) {
                    this.$el.html("");
                } else {
                    this.$el.html(_.template(this.template, {
                        _: _
                    }));
                    this.children.popdown = new Popdown({el: this.el, attachDialogTo:'body'});
                    
                    this.children.saveReportAs.render().appendTo(this.$('.save_reports_actions'));
                    
                    this.children.createDashboardPanel.render().appendTo(this.$('.save_reports_actions'));
                    if (canUseAlerts && canSaveAlert) {
                        this.children.createAlert.render().appendTo(this.$('.save_reports_actions'));
                    }
                    this.children.createEventType.render().appendTo(this.$('.report_actions'));
                }
                return this;
            },
            template: '\
                <a class="dropdown-toggle btn-pill" href="#">\
                    <%- _("Save As").t() %><span class="caret"></span>\
                </a>\
                <div class="dropdown-menu dropdown-menu-narrow">\
                    <div class="arrow"></div>\
                    <ul class="save_reports_actions"></ul>\
                    <ul class="report_actions"></ul>\
                </div>\
            '
        });
    }
);
