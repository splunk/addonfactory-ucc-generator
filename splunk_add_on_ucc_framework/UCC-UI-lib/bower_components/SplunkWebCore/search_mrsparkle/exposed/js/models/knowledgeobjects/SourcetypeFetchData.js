/**
 * @author lbudchenko
 * @date 5/12/15
 *
 * FetchData to use for Sourcetypes.
 */
define([
    'underscore',
    'models/shared/EAIFilterFetchData'
],
    function(
        _,
        EAIFilterFetchData
        ) {

        return EAIFilterFetchData.extend({

            getCalculatedSearch: function() {
                var searchString = EAIFilterFetchData.prototype.getCalculatedSearch.apply(this, arguments);

                if (this.get('pulldown')) {
                    if(!_.isEmpty(searchString)){
                        searchString += ' AND ';
                    }
                    searchString += 'pulldown_type=1';
                }

                var category = this.get('category');
                if(category){
                    searchString += ' AND category="'+category+'"';
                }

                var searchFilter = this.get('searchFilter');
                if(!_.isEmpty(searchFilter)){
                    searchString += ' AND name=*'+ searchFilter+'*';
                    searchString += ' OR description=*'+ searchFilter+'*';
                }

                return searchString;

            },

            toJSON: function(options) {
                var json = EAIFilterFetchData.prototype.toJSON.apply(this, arguments);

                delete json.pulldown;
                delete json.category;
                delete json.searchFilter;


                return json;
            }

        });

    });