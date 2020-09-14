define(
    [
         'module',
         'models/Base',
         'models/search/Dashboard',
         'views/shared/MultiStepModal',
         'views/shared/reportcontrols/dialogs/dashboardpanel/Create',
         'views/shared/reportcontrols/dialogs/dashboardpanel/Success',
         './Master.pcss'
     ],
     function(module, BaseModel, DashboardModel, MultiStepModal, Create, Success, css){
        return MultiStepModal.extend({
            moduleId: module.id,
            initialize: function() {
                MultiStepModal.prototype.initialize.apply(this, arguments);
                var chooseVisualizationType = this.options.hasOwnProperty('chooseVisualizationType') ?
                        this.options.chooseVisualizationType : true;

                this.model.dashboardToSave = new DashboardModel({}, {indent: true});
                this.model.inmem = new BaseModel({
                    dashPerm: "private",
                    panelContent: "table",
                    dashCreateType: "new",
                    panelInline: true
                });

                this.children.create = new Create({
                    model: {
                        report: this.model.report,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        dashboardToSave: this.model.dashboardToSave,
                        inmem: this.model.inmem,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    chooseVisualizationType: chooseVisualizationType
                });

                this.children.success = new Success({
                    model: {
                        dashboardToSave: this.model.dashboardToSave,
                        inmem: this.model.inmem,
                        application: this.model.application
                    }
                });

                this.model.inmem.on('createSuccess', function(){
                    this.stepViewStack.setSelectedView(this.children.success);
                    this.children.success.focus();
                },this);
            },
            getStepViews: function() {
                return [this.children.create, this.children.success];
            }
        });
    }
);
