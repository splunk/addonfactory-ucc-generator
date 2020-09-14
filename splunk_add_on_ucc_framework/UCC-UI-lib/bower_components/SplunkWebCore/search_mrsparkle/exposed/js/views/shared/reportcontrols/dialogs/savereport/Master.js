define(
    [
         'underscore',
         'backbone',
         'module',
         'models/search/Dashboard',
         'models/search/Report',
         'views/shared/MultiStepModal',
         'views/shared/reportcontrols/dialogs/savereport/Save',
         'views/shared/reportcontrols/dialogs/savereport/Success',
         'views/shared/alertcontrols/dialogs/shared/SuccessWithAdditionalSettings',
         'views/shared/reportcontrols/dialogs/dashboardpanel/Create',
         'views/shared/reportcontrols/dialogs/dashboardpanel/Success',
         'splunk.util'
     ],
     function(_, Backbone, module, DashboardModel, ReportModel, MultiStepModal, Save, ReportSuccess, AlertSuccess, CreateDashboardPanel, SuccessDashboardPanel, SplunkUtil){
        return MultiStepModal.extend({
            /**
             * @param {Object} options {
             *  model:{
             *      report: <models.services.SavedSearch>,
             *      reportPristine <models.services.SavedSearch> (Optional)
             *      application: <models.Application>,
             *      searchJob: <models.services.search.Job> (optional),
             *      user: <models.service.admin.user>
             *  },
             *  chooseVisualizationType {Boolean} whether to offer the user a choice of visualization type
             *                                    defaults to true
             *  preventSidReuse {Boolean} prevent the exiting sid from being used to view the report, default false
             *
             */
            moduleId: module.id,
            initialize: function() {
                MultiStepModal.prototype.initialize.apply(this, arguments);
                var chooseVisualizationType = this.options.hasOwnProperty('chooseVisualizationType') ? this.options.chooseVisualizationType : true,
                    saveTitle;

                this.reportType = this.model.reportPristine.isAlert() ? ReportModel.DOCUMENT_TYPES.ALERT : ReportModel.DOCUMENT_TYPES.REPORT;

                this.model.inmem = this.model.report.clone();

                if (this.reportType === ReportModel.DOCUMENT_TYPES.REPORT) {
                    if (this.model.application.get('page') ==='search') {
                        if (this.model.inmem.entry.content.get('auto_summarize')) {
                            this.model.inmem.setAccelerationWarning((this.model.searchJob.canSummarize() && !this.model.inmem.isSampled()), this.model.reportPristine);
                        }
                    }

                    //saving report
                    saveTitle = _("Save Report").t();
                    this.model.dashboardToSave = new DashboardModel();
                    this.model.dashboardInmem = new Backbone.Model({
                        dashPerm: "private",
                        panelContent: "table",
                        dashCreateType: "new",
                        panelInline: false
                    });

                    this.children.success = new ReportSuccess({
                        model: {
                            application: this.model.application,
                            inmem: this.model.inmem,
                            searchJob: this.options.preventSidReuse ? undefined : this.model.searchJob,
                            user: this.model.user
                        }
                    });

                    this.children.createDashboardPanel = new CreateDashboardPanel({
                        model: {
                            report: this.model.inmem,
                            application: this.model.application,
                            dashboardToSave: this.model.dashboardToSave,
                            searchJob: this.model.searchJob,
                            inmem: this.model.dashboardInmem,
                            user: this.model.user
                        },
                        chooseVisualizationType: chooseVisualizationType
                    });

                    this.children.successDashboardPanel = new SuccessDashboardPanel({
                        model: {
                            dashboardToSave: this.model.dashboardToSave,
                            inmem: this.model.dashboardInmem,
                            application: this.model.application
                        }
                    });

                    this.model.dashboardInmem.on('createSuccess', function(){
                        this.stepViewStack.setSelectedView(this.children.successDashboardPanel);
                        this.children.successDashboardPanel.focus();
                    }, this);

                    this.children.success.on('addToDashboardPanel', function(){
                        this.stepViewStack.setSelectedView(this.children.createDashboardPanel);
                    }, this);

                } else {
                    // saving alert
                    saveTitle = _("Save Alert").t();
                    this.children.success = new AlertSuccess({
                        model: {
                            application: this.model.application,
                            alert: this.model.inmem,
                            user: this.model.user
                        }
                    });
                }

                this.children.save = new Save({
                    model: {
                        reportPristine: this.model.reportPristine,
                        application: this.model.application,
                        inmem: this.model.inmem,
                        searchJob: this.model.searchJob
                    },
                    chooseVisualizationType: chooseVisualizationType,
                    title: saveTitle
                });

                this.model.inmem.on('saveSuccess', function(){
                    this.stepViewStack.setSelectedView(this.children.success);
                    this.children.success.focus();
                },this);

                this.on("hidden", function() {
                    if (this.model.inmem.get("updated") > this.model.report.get("updated")){
                        //now we know have updated the clone
                        this.model.report.entry.content.set({
                            'display.visualizations.show': this.model.inmem.entry.content.get('display.visualizations.show'),
                            'display.statistics.show': this.model.inmem.entry.content.get('display.statistics.show'),
                            'display.page.pivot.dataModel': this.model.inmem.entry.content.get('display.page.pivot.dataModel'),
                            'request.ui_dispatch_view': this.model.inmem.entry.content.get('request.ui_dispatch_view')
                        });
                        this.model.reportPristine.setFromSplunkD(this.model.report.toSplunkD());
                        this.model.report.trigger("sync", this.model.report, null);
                    }
                }, this);
            },
            getStepViews: function() {
                var stepViews = [this.children.save, this.children.success];
                if (this.reportType === ReportModel.DOCUMENT_TYPES.REPORT) {
                    stepViews.push(this.children.createDashboardPanel, this.children.successDashboardPanel);
                }
                return stepViews;
            }
        });
    }
);