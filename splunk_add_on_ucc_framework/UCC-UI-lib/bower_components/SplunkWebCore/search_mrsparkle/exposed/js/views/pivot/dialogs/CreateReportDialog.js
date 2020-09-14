define([
            'module',
            'models/shared/Application',
            'models/shared/User',
            'models/search/Job',
            'models/pivot/PivotReport',
            'models/pivot/PivotSearch',
            'models/services/datamodel/DataModel',
            'views/extensions/DeclarativeDependencies',
            'views/shared/reportcontrols/dialogs/createreport/Master',
            './components/CreateReportAndDataModel',
            './components/ReportAndDataModelSuccess'
        ],
        function(
            module,
            Application,
            User,
            Job,
            PivotReport,
            PivotSearch,
            DataModel,
            DeclarativeDependencies,
            CreatereportMaster,
            CreateReportAndDataModel,
            ReportAndDataModelSuccess
        ) {

    var CreateReportDialog = CreatereportMaster.extend({

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
         *     preventSidReuse: {Boolean} prevent the exiting sid from being used to view the report, default false
         * }
         */

        initialize: function() {
            this.options.chooseVisualizationType = false;
            CreatereportMaster.prototype.initialize.apply(this, arguments);
            // If the data model is temporary, replace the step views with different views that
            // will incorporate saving the data model into the flow.
            if(this.model.dataModel.isTemporary()) {
                this.children.create = new CreateReportAndDataModel({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        inmem: this.model.inmem,
                        dataModel: this.model.dataModel
                    },
                    chooseVisualizationType: false
                });
                // TODO [sff] the inheritance got a little ugly with the event bindings,
                //            should clean this up in the superclass.
                this.children.success.off();
                this.children.success = new ReportAndDataModelSuccess({
                    model: {
                        application: this.model.application,
                        inmem: this.model.inmem,
                        searchJob: this.options.preventSidReuse ? undefined : this.model.searchJob,
                        user: this.model.user,
                        dataModel: this.model.dataModel
                    }
                });
                this.children.success.on('addToDashboardPanel', function(){
                    this.stepViewStack.setSelectedView(this.children.createDashboardPanel);
                }, this);

                this.on('hidden', function() {
                    this.trigger(
                        'action:flowExited',
                        !this.model.dataModel.isTemporary() && this.model.inmem.isNew(),
                        this.model.inmem.entry.content.get('search')
                    );
                }, this);
            }
        }

    },
    {
        apiDependencies: {
            report: PivotReport,
            application: Application,
            user: User,
            dataModel: DataModel,
            pivotSearch: PivotSearch,
            searchJob: Job
        }
    });

    return DeclarativeDependencies(CreateReportDialog);

});
