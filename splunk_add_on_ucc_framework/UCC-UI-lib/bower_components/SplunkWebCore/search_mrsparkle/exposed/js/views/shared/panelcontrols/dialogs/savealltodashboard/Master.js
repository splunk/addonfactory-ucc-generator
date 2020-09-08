/**
 * @author ahebert
 * @date 3/30/15
 *
 * View allowing addition of all prebuilt panels for a particular add-on to new a dashboard.
 */
define(
    [
        'module',
        'models/Base',
        'models/search/Dashboard',
        'collections/shared/Dashboards',
        'views/Base',
        'views/shared/panelcontrols/dialogs/savealltodashboard/Save',
        'views/shared/panelcontrols/dialogs/savealltodashboard/Success'
    ],
    function(
        module,
        BaseModel,
        DashboardModel,
        DashboardsCollection,
        BaseView,
        AddDashboardDialog,
        Success
    ){
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.collection.dashboardsCollection = new DashboardsCollection();
                this.model.dashboardToSave = new DashboardModel();

                this.children.addDashboardDialog = new AddDashboardDialog({
                    model: {
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        dashboard: this.model.dashboardToSave
                    },
                    collection: {
                        dashboardsCollection: this.collection.dashboardsCollection,
                        panels: this.collection.panels
                    }
                });
                
                this.children.success = new Success({
                    model: {
                        dashboard: this.model.dashboardToSave,
                        application: this.model.application
                    },
                    onHiddenRemove: true
                });
                
                this.collection.panels.on('createSuccess', function(){
                    this.children.success.render().show();
                },this);
            },
            
            render: function() {
                this.children.addDashboardDialog.render().show();
            }
        });
    }
);
