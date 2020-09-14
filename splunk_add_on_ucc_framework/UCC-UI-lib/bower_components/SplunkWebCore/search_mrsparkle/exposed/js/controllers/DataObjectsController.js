define([
            'jquery',
            'underscore',
            'controllers/Base',
            'collections/services/datamodel/DataModels',
            'models/services/datamodel/DataModel',
            'views/data_model_explorer/DataModelExplorer',
            'models/config',
            'models/shared/Application',
            'models/classicurl'
        ],
        function(
            $,
            _,
            Base,
            DataModelCollection,
            DataModel,
            DataModelExplorer,
            configModel,
            ApplicationModel,
            classicUrl
        ) {

    var DataObjectsController = Base.extend({

        initialize: function(options) {
            Base.prototype.initialize.apply(this, arguments);

            this.dataModels = new DataModelCollection();
            this.dataModel = new DataModel();
            this.application = options.application;

            this.dmExplorerView = new DataModelExplorer({
                model: {
                    dataModel: this.dataModel,
                    application: this.application
                },
                collection: {
                    dataModels: this.dataModels
                }
            });

            var that = this,
                appOwner = { app: this.application.get('app'), owner: this.application.get('owner') };

            this.dataModel.set({ id: classicUrl.get('model') });
            this.dataModels.fetch({ data: $.extend({ concise: true }, appOwner) });
            this.dataModel.fetch({ data: appOwner });

            _.defer(function() { that.trigger('ready'); });
        },

        remove: function() {
            Base.prototype.remove.apply(this, arguments);
            this.dmExplorerView.remove();
        }
    });

    return DataObjectsController;

});
