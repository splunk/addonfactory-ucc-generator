define(
    [
        'underscore',
        'backbone',
        'models/services/datasets/PolymorphicDataset',
        'models/datasets/Table',
        'mixins/dataset'
    ],
    function(
        _,
        Backbone,
        PolymorphicDatasetBaseModel,
        TableModel,
        datasetMixin
    ) {
        
        var TABLE = 'table';
        
        var PolymorphicDataset = PolymorphicDatasetBaseModel.extend({
            constructor: function(attributes, options) {
                var Model = PolymorphicDataset.getModel(attributes);
                
                if (!Model) {
                    throw new Error("You must define a valid entry[0].content['eai:type'] for dataset construction!");
                }
                
                // force the model to extend the dataset interface
                _.defaults(Model.prototype, datasetMixin);
                
                return new Model(attributes, options);
            }
        }, {
            getModel: function(attributes) {
                var Model;
                
                if (attributes && attributes.entry && attributes.entry[0] && attributes.entry[0].content) {
                    
                     // Datasets that come from datamodels.conf
                    if (attributes.entry[0].content['eai:type'] === PolymorphicDatasetBaseModel.DATAMODEL) {
                        if (attributes.entry[0].content['dataset.type'] === TABLE) {
                            Model = TableModel;
                        }
                    }
                }
                
                if (!Model) {
                    Model = PolymorphicDatasetBaseModel.getModel(attributes);
                }
                
                return Model;
            },
            TABLE: TABLE
        });
        
        return PolymorphicDataset;
    }
);