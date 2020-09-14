define(
    [
        "models/services/cluster/master/Peer",
        "collections/SplunkDsBase"
    ],
    function(PeerModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "cluster/master/peers",
            model: PeerModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);