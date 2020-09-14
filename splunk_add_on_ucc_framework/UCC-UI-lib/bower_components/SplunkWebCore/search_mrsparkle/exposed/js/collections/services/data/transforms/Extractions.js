define(
    [
        "models/services/data/transforms/Extraction",
        "collections/SplunkDsBase"
    ],
    function(ExtractionModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            model: ExtractionModel,
            url: 'data/transforms/extractions',
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
