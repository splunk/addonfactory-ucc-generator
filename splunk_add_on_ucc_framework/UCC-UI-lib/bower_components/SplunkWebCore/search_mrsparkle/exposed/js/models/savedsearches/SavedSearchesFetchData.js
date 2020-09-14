/**
 * @author claral
 * @date 10/31/2016
 *
 * FetchData to use for saved searches page.
 * Adding an itemType filter to the search string to allow filtering to only reports/alerts.
 */
define([
        'underscore',
        'models/shared/EAIFilterFetchData',
        'collections/search/Reports'
    ],
    function(
        _,
        EAIFilterFetchData,
        ReportsCollection
    ) {

        return EAIFilterFetchData.extend({

            getCalculatedSearch: function() {
                var searchString = EAIFilterFetchData.prototype.getCalculatedSearch.apply(this, arguments);

                var itemType = this.get('itemType');
                if (itemType === 'reports') {
                    if (!_.isEmpty(searchString)) {
                        searchString += ' AND ';
                    }
                    searchString += 'NOT (' + ReportsCollection.ALERT_SEARCH_STRING + ')';
                } else if (itemType === 'alerts') {
                    if (!_.isEmpty(searchString)) {
                        searchString += ' AND ';
                    }
                    searchString += '(' + ReportsCollection.ALERT_SEARCH_STRING + ')';
                }

                var nameFilter = this.get('nameFilter');
                if(!_.isUndefined(nameFilter) && !_.isEmpty(nameFilter)){
                    searchString += ' AND name=*'+ nameFilter+'*';
                    searchString += ' OR description=*'+ nameFilter+'*';
                }

                return searchString;
            },

            toJSON: function(options) {
                var json = EAIFilterFetchData.prototype.toJSON.apply(this, arguments);

                delete json.itemType;

                return json;
            }

        });

    });