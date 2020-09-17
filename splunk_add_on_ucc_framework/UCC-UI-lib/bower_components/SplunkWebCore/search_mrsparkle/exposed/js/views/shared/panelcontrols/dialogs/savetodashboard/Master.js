/**
 * @author ahebert
 * @date 3/29/15
 *
 * MultiStepModal allowing addition of prebuilt panel to a dashboard.
 * 
 * Inspired from views/shared/reportcontrols/dialogs/dashboardpanel/Master.js
 */
define(
    [
        'module',
        'models/Base',
        'models/search/Dashboard',
        'views/shared/MultiStepModal',
        'views/shared/panelcontrols/dialogs/savetodashboard/Save',
        'views/shared/panelcontrols/dialogs/savetodashboard/Success',
        './Master.pcss'
    ],
    function(
        module,
        BaseModel,
        DashboardModel,
        MultiStepModal,
        Save,
        Success,
        css
    ){
        return MultiStepModal.extend({
            moduleId: module.id,
            initialize: function() {
                MultiStepModal.prototype.initialize.apply(this, arguments);

                this.model.dashboardToSave = new DashboardModel({}, {indent: true});
                this.model.inmem = new BaseModel({
                    dashPerm: "private",
                    panelContent: "table",
                    dashCreateType: "new",
                    panelInline: true
                });
                
                this.children.save = new Save({
                    model: {
                        panel: this.model.panel,
                        application: this.model.application,
                        dashboardToSave: this.model.dashboardToSave,
                        inmem: this.model.inmem,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.children.success = new Success({
                    model: {
                        panel: this.model.panel,
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
                return [this.children.save, this.children.success];
            }
        });
    }
);
