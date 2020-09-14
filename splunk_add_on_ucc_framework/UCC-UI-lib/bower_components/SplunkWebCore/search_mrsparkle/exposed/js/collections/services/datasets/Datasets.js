define(
    [
        "models/services/datasets/PolymorphicDataset",
        "collections/SplunkDsBase"
    ],
    function(
        PolymorphicDatasetModel,
        SplunkDsBaseCollection
    ) {
        return SplunkDsBaseCollection.extend({
            url: 'datasets',
            model: PolymorphicDatasetModel,
            
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);