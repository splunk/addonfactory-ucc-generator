define(
    [
        "models/services/search/Job",
        "collections/SplunkDsBase"
    ],
    function(JobModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: 'search/jobs',
            model: JobModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);