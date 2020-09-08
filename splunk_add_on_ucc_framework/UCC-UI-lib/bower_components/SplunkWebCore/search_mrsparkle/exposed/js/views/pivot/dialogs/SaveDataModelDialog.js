define([
            'module',
            'models/pivot/PivotReport',
            'models/services/datamodel/DataModel',
            'views/extensions/DeclarativeDependencies',
            'views/shared/MultiStepModal',
            './components/SaveDataModel',
            './components/DataModelSuccess'
        ],
        function(
            module,
            PivotReport,
            DataModel,
            DeclarativeDependencies,
            MultiStepModal,
            SaveDataModel,
            DataModelSuccess
        ) {
    
    var SaveDataModelDialog = MultiStepModal.extend({
    
        moduleId: module.id,
    
        initialize: function() {
            MultiStepModal.prototype.initialize.apply(this, arguments);
            this.children.save = new SaveDataModel({
                apiResources: this.apiResources.save
            });
            this.children.success = new DataModelSuccess({
                apiResources: this.apiResources.success
            });
            this.listenTo(this.children.save, 'saveSuccess', function() {
                this.stepViewStack.setSelectedView(this.children.success);
            });
            this.on('hidden', function() {
                this.trigger(
                    'action:flowExited',
                    !this.model.dataModel.isTemporary(),
                    this.model.report.entry.content.get('search')
                );
            }, this);
        },

        getStepViews: function() {
            return [this.children.save, this.children.success];
        }
        
    },
    {
        apiDependencies: {
            report: PivotReport,
            dataModel: DataModel,

            save: SaveDataModel,
            success: DataModelSuccess
        }
    });

    return DeclarativeDependencies(SaveDataModelDialog);
    
});