/**
 * Created by ykou on 4/30/14.
 */
define([
    "models/services/cluster/master/Fixup",
    "collections/SplunkDsBase"
],
    function(Model, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "cluster/master/fixup",
            model: Model,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
            /* There are six model names:
                'checksum_sync'
                'data_safety'
                'generation'
                'replication_factor'
                'search_factor'
                'streaming'
                They are ordered in this order, so that technically we could just use
                index to find model, but for safety purpose, we'd better use name to
                find them.
             */
            /*
            getModel: function(name) {
                return this.get('/services/cluster/master/fixup/' + name);
            }*/
        });
    });