// Inputs fetch data model
// maps the search filter to the api search
// maps sorting to api sorting
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'models/managementconsole/DmcFetchData',
    'helpers/managementconsole/Filters',
    'splunk.util'
], function (
    _,
    $,
    Backbone,
    DMCFetchData,
    FiltersHelper,
    splunkUtil
) {
    return DMCFetchData.extend({
        getCalculatedSearch: function (json) {
            var query;
            if (json && json.nameFilter) {
                query = {
                    name: FiltersHelper.modifyRegExp(json.nameFilter)
                };
            }
            return JSON.stringify(query);
        },

        getContext: function () {
            return this.get('bundle') || '-';
        },

        toJSON: function(options) {
            var json = DMCFetchData.prototype.toJSON.apply(this, arguments);
            delete json.bundle;
            return json;
        }
    });
});
