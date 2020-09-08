define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'helpers/managementconsole/Filters',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        FiltersHelper,
        splunkUtil
    ) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            getCalculatedSearch: function(json) {
                var query;
                try {
                    query = JSON.parse(json.query);
                } catch (e) { }

                if (json && json.nameFilter && json.sortKey) {
                    query = query || {};

                    query[json.sortKey] = {
                        '$regex': FiltersHelper.modifyRegExp(json.nameFilter),
                        '$options': 'i'
                    };
                }
                return JSON.stringify(query);
            },

            toJSON: function(options) {
                var json = BaseModel.prototype.toJSON.apply(this, arguments);

                var query = this.getCalculatedSearch(json);
                if (query) {
                    json.query = query;
                }
                delete json.nameFilter;

                if (json.sortKey) {
                    json.sort_key = json.sortKey;
                    delete json.sortKey;
                }

                if (json.sortDirection) {
                    json.sort_dir = json.sortDirection;
                    delete json.sortDirection;
                }

                return json;
            }
        });
    }
);

