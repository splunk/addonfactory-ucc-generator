/**
 * @author jszeto
 * @date 2/12/15
 *
 * FetchData to use for Indexes. Currently we have to pass in a search substring to filter out any indexes that
 * are virtual indexes.
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

                 if (searchString == "")
                    searchString = "isVirtual=0";
                 else if (searchString != "")
                    searchString += " AND isVirtual=0";

                 return searchString;
            }

        });

    });