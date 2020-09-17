define([
            'module',
            'models/shared/Application',
            'models/shared/User',
            'models/search/Job',
            'models/pivot/PivotReport',
            'models/pivot/PivotSearch',
            'models/services/server/ServerInfo',
            'models/services/datamodel/DataModel',
            'views/extensions/DeclarativeDependencies',
            'views/shared/reportcontrols/dialogs/dashboardpanel/Master',
            './components/CreateDashboardPanelAndDataModel',
            './components/DashboardPanelAndDataModelSuccess'
        ],
        function(
            module,
            Application,
            User,
            Job,
            PivotReport,
            PivotSearch,
            ServerInfo,
            DataModel,
            DeclarativeDependencies,
            DashboardpanelMaster,
            CreateDashboardPanelAndDataModel,
            DashboardPanelAndDataModelSuccess
        ) {

    var CreateDashboardPanelDialog = DashboardpanelMaster.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param {Object} options {
         *     model:{
         *         report: <models.services.SavedSearch>,
         *         application: <models.Application>,
         *         user: <models.service.admin.user>,
         *         dataModel: <models.services.datamodel.DataModel>,
         *         searchJob: <models.search.Job>
         *     }
         * }
         */

        initialize: function() {
            this.options.chooseVisualizationType = false;
            DashboardpanelMaster.prototype.initialize.apply(this, arguments);
            if(this.model.dataModel.isTemporary()) {
                this.children.create = new CreateDashboardPanelAndDataModel({
                    apiResources: this.apiResources.create,
                    model: {
                        dashboardToSave: this.model.dashboardToSave,
                        inmem: this.model.inmem
                    },
                    chooseVisualizationType: false
                });
                this.children.success = new DashboardPanelAndDataModelSuccess({
                    apiResources: this.apiResources.success,
                    model: {
                        dashboardToSave: this.model.dashboardToSave,
                        inmem: this.model.inmem
                    }
                });

                this.on('hidden', function() {
                    this.trigger(
                        'action:flowExited',
                        !this.model.dataModel.isTemporary(),
                        this.model.report.entry.content.get('search')
                    );
                }, this);
            }
        }

    },
    {
        apiDependencies: {
            report: PivotReport,
            dataModel: DataModel,
            // used by superclass
            application: Application,
            searchJob: Job,
            user: User,
            serverInfo: ServerInfo,

            create: CreateDashboardPanelAndDataModel,
            success: DashboardPanelAndDataModelSuccess
        }
    });

    return DeclarativeDependencies(CreateDashboardPanelDialog);

});