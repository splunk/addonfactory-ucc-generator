define(
    [
        "models/services/data/vix/Provider",
        "collections/SplunkDsBase"
    ],
    function(ProviderModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "data/vix-providers",
            model: ProviderModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },

            getProviderByName: function(name) {
                return this.find(function(provider) {
                    return provider.entry.get("name") == name;
                }, this);
            }

        });
    }
);
