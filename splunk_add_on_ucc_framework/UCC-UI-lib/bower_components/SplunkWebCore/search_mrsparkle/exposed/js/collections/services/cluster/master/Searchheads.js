define([
    "models/services/cluster/master/Searchhead",
    "collections/SplunkDsBase"
],
    function(Model, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "cluster/master/searchheads/",
            model: Model,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    });