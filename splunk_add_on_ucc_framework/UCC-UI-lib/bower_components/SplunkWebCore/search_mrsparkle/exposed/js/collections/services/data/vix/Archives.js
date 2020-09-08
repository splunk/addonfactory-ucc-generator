/**
 * @author jszeto
 * @date 11/19/14
 *
 * Collection of Archived Indexes. The ArchiveIndexFetchData class contains logic for filtering the data/vix-indexes endpoint
 * for archive indexes (since the endpoint contains both virtual indexes and archive indexes). Note that if you
 * don't use the default fetchData model, you will need to filter the archive indexes yourself in the search argument
 */
define(
    [
        "models/services/data/vix/Index",
        "models/virtual_indexes/ArchiveIndexFetchData",
        "collections/SplunkDsBase"
    ],
    function(IndexModel, ArchiveIndexFetchData, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "data/vix-indexes",
            model: IndexModel,
            initialize: function(models, options) {
                options = options || {};
                if (!options.fetchData) {
                    options.fetchData = new ArchiveIndexFetchData();
                }

                SplunkDsBaseCollection.prototype.initialize.call(this, models, options);
            }
        });
    }
);