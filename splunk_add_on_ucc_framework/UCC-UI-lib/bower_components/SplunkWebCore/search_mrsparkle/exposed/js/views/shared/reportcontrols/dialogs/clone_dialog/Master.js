define([
    'underscore',
    'jquery',
    'backbone',
    'views/shared/Modal',
    'module',
    'models/search/Report',
    'models/search/Dashboard',
    'models/ACLReadOnly',
    'views/shared/reportcontrols/dialogs/clone_dialog/Clone',
    'views/shared/reportcontrols/dialogs/clone_dialog/Success',
    'views/shared/reportcontrols/dialogs/dashboardpanel/Create',
    'views/shared/reportcontrols/dialogs/dashboardpanel/Success'
    ],
    function(
        _,
        $,
        Backbone,
        Modal,
        module,
        ReportModel,
        DashboardModel,
        ACLReadOnlyModel,
        Clone,
        Success,
        CreateDashboardPanel,
        SuccessDashboardPanel
    ) {
    return Modal.extend({
            moduleId: module.id,
            /**
            * @param {Object} options {
            *   model: {
            *       report: <models.Report>,
            *       application: <models.Application>
            *       searchJob: <models.services.search.Job> (optional),
            *       user: <models.service.admin.user>
            *   }
            * }
            */
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                var chooseVisualizationType = this.options.hasOwnProperty('chooseVisualizationType') ?
                        this.options.chooseVisualizationType : true;
                this.model.defaultReport = new ReportModel();
                this.defDefaultReport = this.model.defaultReport.fetch();
                this.model.inmem = this.model.report.clone();
                this.model.acl = new ACLReadOnlyModel($.extend(true, {}, this.model.report.entry.acl.toJSON()));

                this.model.dashboardToSave = new DashboardModel();
                this.model.dasboardInmem = new Backbone.Model({
                    dashPerm: "private",
                    panelContent: "table",
                    dashCreateType: "new",
                    panelInline: false
                });

                //viewsapplication
                this.children.clone = new Clone({
                    model: {
                        report: this.model.report,
                        defaultReport: this.model.defaultReport,
                        application: this.model.application,
                        inmem: this.model.inmem,
                        acl: this.model.acl,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.children.success = new Success({
                    model: {
                        application: this.model.application,
                        report: this.model.report,
                        inmem: this.model.inmem,
                        user: this.model.user
                    }
                });

                this.children.createDashboardPanel = new CreateDashboardPanel({
                    model: {
                        report: this.model.inmem,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        dashboardToSave: this.model.dashboardToSave,
                        inmem: this.model.dasboardInmem,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    chooseVisualizationType: chooseVisualizationType
                });

                this.children.successDashboardPanel = new SuccessDashboardPanel({
                    model: {
                        dashboardToSave: this.model.dashboardToSave,
                        inmem: this.model.dasboardInmem,
                        application: this.model.application
                    }
                });

                this.model.inmem.on('createSuccess', function(){
                    this.children.clone.$el.hide();
                    this.children.success.render().appendTo(this.$el);
                }, this);

                this.model.dasboardInmem.on('createSuccess', function(){
                    this.children.createDashboardPanel.$el.hide();
                    this.children.successDashboardPanel.$el.show();
                }, this);

                this.children.success.on('addToDashboardPanel', function(){
                    this.children.clone.$el.hide();
                    this.children.success.$el.hide();
                    this.children.createDashboardPanel.render().appendTo(this.$el);
                    this.children.successDashboardPanel.render().appendTo(this.$el);
                    this.children.createDashboardPanel.$el.show();
                    this.children.successDashboardPanel.$el.hide();
                }, this);

                this.on("hidden", function() {
                    if (!this.model.inmem.isNew()) {
                        this.model.report.trigger('updateCollection');
                    }
                }, this);

            },
            render: function() {
                $.when(this.defDefaultReport).then(function() {
                    this.children.clone.render().appendTo(this.$el);
                }.bind(this));

                return this;
            }
        }
    );
});
