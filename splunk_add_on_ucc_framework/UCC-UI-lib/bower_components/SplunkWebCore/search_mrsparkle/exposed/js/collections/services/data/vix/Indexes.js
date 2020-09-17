/**
 * @author jszeto
 * @date 11/19/14
 *
 * Collection of Virtual Indexes. The VirtualIndexFetchData class contains logic for filtering the data/vix-indexes endpoint
 * for virtual indexes (since the endpoint contains both virtual indexes and archive indexes). Note that if you
 * don't use the default fetchData model, you will need to filter the virtual indexes yourself in the search argument
 */

define(
    [
        "models/services/data/vix/Index",
        "models/virtual_indexes/VirtualIndexFetchData",
        "collections/SplunkDsBase"
    ],
    function(IndexModel, VirtualIndexFetchData, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "data/vix-indexes",
            model: IndexModel,
            initialize: function(models, options) {
                options = options || {};
                if (!options.fetchData) {
                    options.fetchData = new VirtualIndexFetchData();
                }

                SplunkDsBaseCollection.prototype.initialize.call(this, models, options);
            }
        });
    }
);