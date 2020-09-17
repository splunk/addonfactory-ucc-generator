define([
    "models/services/cluster/searchhead/Generation",
    "collections/SplunkDsBase"
],
function(Model, SplunkDsBaseCollection) {
    return SplunkDsBaseCollection.extend({
        url: "cluster/searchhead/generation/",
        model: Model,
        initialize: function() {
            SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
        }
    });
});