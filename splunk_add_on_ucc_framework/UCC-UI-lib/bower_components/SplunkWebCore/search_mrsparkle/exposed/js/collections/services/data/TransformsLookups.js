define(
    [
        'underscore',
        "models/services/data/TransformsLookup",
        "collections/SplunkDsBase"
    ],
    function(_, LookupModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            model: LookupModel,
            url: 'data/transforms/lookups',
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            getNames: function() {
                return _(this.models).map(function(lookup) {
                    return lookup.entry.get("name");
                });
            }
        });
    }
);