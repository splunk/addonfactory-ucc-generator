/**
 * Extends EAIFilterFetchData to add support for
 * orphaned & configType filters
 * @author nmistry
 * @date 10/6/16
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'splunk.util',
    'models/shared/EAIFilterFetchData'
], function(
    $,
    _,
    Backbone,
    splunk_utils,
    BaseFetchData
) {
    return BaseFetchData.extend({
        getCalculatedSearch: function() {

            // perform before hand
            // so that the baseFetch adds the search string.
            var appOnly = this.get('appOnly');
            var app = this.get('app');
            if (app !== '-' && appOnly === true) {
                // Applies only when a valid app is selected.
                this.set('appSearch', app, {silent: true});
            } else {
                this.unset('appSearch', {silent: true});
            }

            var searchString = BaseFetchData.prototype.getCalculatedSearch.apply(this, arguments);

            var isOrphaned = splunk_utils.normalizeBoolean(this.get('orphaned'));
            if (isOrphaned === true) {
                if (!_.isEmpty(searchString))
                    searchString += ' AND ';
                searchString += '(eai:orphaned=' + (+isOrphaned) + ')';
            }

            var configType = this.get("configType");
            if (!_.isEmpty(configType) && configType !== 'All') {
                if (!_.isEmpty(searchString))
                    searchString += ' AND ';
                searchString += '(eai:type=' + configType + ')';
            }

            return searchString;
        },

        toJSON: function() {
            var json = BaseFetchData.prototype.toJSON.apply(this, arguments);
            if (json.search === '') {
                delete json.search;
            }
            delete json.appOnly;
            delete json.orphaned;
            delete json.configType;
            return json;
        }
    });
});
