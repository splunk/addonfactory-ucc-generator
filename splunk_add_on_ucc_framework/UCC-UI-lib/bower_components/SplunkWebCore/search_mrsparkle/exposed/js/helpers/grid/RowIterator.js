/**
 * @author sfishel
 *
 * A helper that can encapsulate grid-related state and provide a re-usable iterator for grid-based view templates.
 */

define(['underscore', 'backbone'], function(_, Backbone) {

    var RETURN_FALSE = function() { return false; };

    /**
     * @constructor
     *
     * @param options {Object} {
     *     offset {Integer} optional, defaults to 0
     *            the current pagination offset of the grid, used to calculate row numbers
     *     expandedTest {Function} optional, defaults to always return false
     *            a callback to use with each row, expected to return a boolean indicating if the row is in an expanded state
     *            arguments to the callback will be:  the row item,
     *                                                the item index in the collection/array (zero-based),
     *                                                the row number after applying the offset (one-based)
     * }
     */

    var RowIterator = function(options) {
        options = options || {};
        this.offset = parseInt(options.offset, 10) || 0;
        this.expandedTest = options.expandedTest || RETURN_FALSE;
        this.eachRow = _(this.eachRow).bind(this);
    };

    RowIterator.prototype = {

        /**
         * A 'forEach' like utility for setting up an iterator over an array or collection that represents grid rows.
         *
         * @param items {Array or Collection} the grid items, each one corresponding to a row
         * @param callback {Function} the callback to apply for each row
         *                 arguments to the callback will be: the row item
         *                                                    the item index in the collection/array (zero-based),
         *                                                    the row number after applying the offset (one-based),
         *                                                    a boolean indicating whether the row is in an expanded state
         * @param context {Object} optional, the scope to apply when calling the callback
         */

        eachRow: function(items, callback, context) {
            context = context || null;
            var iteratorFn = function(item, i) {

                var rowNumber = i + this.offset + 1, // +1 to convert from zero-indexed to one-indexed
                    isExpanded = this.expandedTest(item, i, rowNumber);

                callback.apply(context, [item, i, rowNumber, isExpanded]);

            };

            if(items instanceof Backbone.Collection) {
                items.each(iteratorFn, this);
            }
            else {
                _(items).each(iteratorFn, this);
            }
        }

    };

    return RowIterator;

});