define(
    [
        "models/services/data/LookupTableFile",
        "collections/SplunkDsBase"
    ],
    function(
        LookupTableFileModel,
        SplunkDsBaseCollection
    ) {
        return SplunkDsBaseCollection.extend({
            model: LookupTableFileModel,
            url: 'data/lookup-table-files',
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
