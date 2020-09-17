define([
            'models/shared/fetchdata/ResultsFetchData'
        ],
        function(
            ResultsFetchData
        ) {

    /**
     * Adds a custom behavior the standard results fetch data that is useful in the case where you are viewing _raw
     * along with fields being extracted from it, but not _time.  Sorting by _raw will have the effect of reversing
     * the event order instead of an alphabetical sort by the event text.
     */

    return ResultsFetchData.extend({

        generateSortSubquery: function(sortKey, sortDirection) {
            if(sortKey === '_raw') {
                return (sortDirection === 'asc') ? '| reverse' : '';
            }
            return ResultsFetchData.prototype.generateSortSubquery.apply(this, arguments);
        }

    });

});