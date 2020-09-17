/**
 * A reusable model encapsulating the fetch data for "results-like" endpoints.
 *
 * Adds special handling of the "sortKey" and "sortDirection" attributes, which are mapped to a trailing "| sort" in the
 * post-process search, and the "filter" attribute, which is mapped from a dictionary of string pairs
 * to keyword filters in the post-process search string.
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
            var json = Base.prototype.toJSON.apply(this, arguments),
                sortKey = json.sortKey,
                sortDirection = json.sortDirection,
                search = [];
            if(_(json.filter).size() > 0) {
                _(json.filter).each(function(match, key) {
                    var matches = _.isArray(match)? match : match.split(' ');
                    if(matches.length > 1) {
                        search.push('(' +
                            _.chain(matches).map(function(match) {
                                return key + '=*' + match + '*';
                            }, this)
                            .join(' AND ')
                            .value() + ')'
                        );
                    } else {
                        search.push( '(' + key + '=*' + matches[0] + '*' + ')');
                    }
                });
                search = ['search ' + search.join(' OR ')];
            }
            delete json.filter;

            if(sortKey) {
                search.push(this.generateSortSubquery(sortKey, sortDirection));
            }
            delete json.sortKey;
            delete json.sortDirection;

            if(search.length > 0) {
                // Append to the search string, if it exists
                json.search = (json.search != undefined ? json.search : "") + search.join(' ');
            }
            return json;
        },

        generateSortSubquery: function(sortKey, sortDirection) {
            return '| sort 0 ' + (sortDirection === 'desc' ? '-' : '') + '"' + sortKey + '"';
        }

    });

});
