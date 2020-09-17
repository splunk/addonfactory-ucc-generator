define(
    [
        'underscore',
        'backbone',
        'models/services/data/TransformsLookup',
        'models/services/data/LookupTableFile',
        'models/services/datasets/DataModelObject',
        'mixins/dataset'
    ],
    function(
        _,
        Backbone,
        LookupTransformModel,
        LookupTableFileModel,
        DataModelObjectModel,
        datasetMixin
    ) {
        var LOOKUP_TRANSFORM = 'inputlookup-transform',
            LOOKUP_TABLE = 'inputlookup-table',
            DATAMODEL = 'datamodel',
            TABLE = 'table';
        
        var PolymorphicDataset = Backbone.Model.extend({
            
            constructor: function(attributes, options) {
                /* 
                 * 
                 * Datasets are going to be created by their eai:type attribute..
                 *
                 */
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
                    
                    if (attributes.entry[0].content['eai:type'] === LOOKUP_TRANSFORM) {
                        Model = LookupTransformModel;
                    } else if (attributes.entry[0].content['eai:type'] === LOOKUP_TABLE) {
                        Model = LookupTableFileModel;
                    } else if ((attributes.entry[0].content['eai:type'] === DATAMODEL) && (attributes.entry[0].content['dataset.type'] !== TABLE)) {
                        Model = DataModelObjectModel;
                    }
                }
                return Model;
            },
            LOOKUP_TRANSFORM: LOOKUP_TRANSFORM,
            LOOKUP_TABLE: LOOKUP_TABLE,
            DATAMODEL: DATAMODEL
        });
        
        return PolymorphicDataset;
    }
);