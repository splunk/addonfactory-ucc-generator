define(
    [
        "models/search/Report",
        "collections/services/saved/Searches"
    ],
    function(ReportModel, SavedSearchCollection) {
        return SavedSearchCollection.extend({
            model: ReportModel,
            initialize: function() {
                SavedSearchCollection.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, model, options) {
                switch (method) {
                    case 'read' :
                        options = options || {};
                        if (options.excludeAlerts) {
                            options.data = options.data || {};
                            var search = 'NOT (' + this.constructor.ALERT_SEARCH_STRING + ')';
                            if (options.data.search) {
                                search += ' AND ' + options.data.search;
                            }
                            options.data.search = search; 
                        }
                        break;
                }
                return SavedSearchCollection.prototype.sync.apply(this, arguments);
            }
        });
    }
);