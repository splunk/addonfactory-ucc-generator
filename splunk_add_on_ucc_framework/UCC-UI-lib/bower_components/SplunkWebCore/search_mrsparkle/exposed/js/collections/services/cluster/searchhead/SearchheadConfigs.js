define([
    "models/services/cluster/searchhead/SearchheadConfig",
    "collections/SplunkDsBase"
],
function(Model, SplunkDsBaseCollection) {
    return SplunkDsBaseCollection.extend({
        url: "cluster/searchhead/searchheadconfig/",
        model: Model,
        initialize: function() {
            SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
        }
    });
});