define(
    [
        "models/services/data/inputs/HTTP",
        "collections/SplunkDsBase"
    ],
    function(HttpModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "data/inputs/http",
            model: HttpModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },

            getGlobalSettings: function() {
                var settingsModel = this.find(function(model) {
                    return model.entry.get("name") === 'http';
                }, this);
                //settingsModel.url = HttpModel.prototype.url;
                return settingsModel;
            }
        });
    }
);