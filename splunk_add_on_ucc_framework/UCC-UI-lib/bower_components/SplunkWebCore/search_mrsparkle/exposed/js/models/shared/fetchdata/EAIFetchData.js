/**
 * A reusable model encapsulating the fetch data for EAI endpoints.
 *
 * Adds special handling of the "sortKey" and "sortDirection" attributes, which are mapped to the keys that
 * the EAI-like endpoints expect, and the "filter" attribute, which is mapped from a dictionary of string pairs
 * to a filter search string.
 */

define([
            'underscore',
            'models/Base'
        ], 
        function(
            _,
            Base
        ) {

    return Base.extend({

        defaults: {
            filter: {}
        },

        toJSON: function(options) {
            var json = Base.prototype.toJSON.apply(this, arguments);

            if(json.sortKey) {
                json.sort_key = json.sortKey;
                json.sort_dir = json.sortDirection;
            }
            delete json.sortKey;
            delete json.sortDirection;

            if(_(json.filter).size() > 0) {
                var search = [];
                _(json.filter).each(function(match, key) {
                    search.push(key + '=*' + match + '*');
                });
                json.search = search.join(' ');
            }
            delete json.filter;

            return json;
        }

    });

});