define(
    [
        "models/search/Alert",
        "collections/services/saved/Searches"
    ],
    function(AlertModel, SavedSearchCollection) {
        return SavedSearchCollection.extend({
            model: AlertModel,
            initialize: function() {
                SavedSearchCollection.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, model, options) {
                switch (method) {
                    case 'read' :
                        options = options || {};
                        if (!options.forceSearchData) {
                            options.data = options.data || {};
                            var search = '(' + this.constructor.ALERT_SEARCH_STRING + ')';
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
