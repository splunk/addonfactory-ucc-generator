/**
 * @author jszeto
 * @date 7/16/14
 *
 *
 */
define(
    [
        "models/services/data/vix_indexes/DirectoryItem",
        "collections/SplunkDsBase"
    ],
    function(DirectoryItem, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
//            url: "data/vix-indexes/browse",
            model: DirectoryItem,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);

