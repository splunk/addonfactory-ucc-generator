/**
 * @author sfishel
 *
 * A model for an individual number row pivot element.
 */

define(['./column_to_row_converter', '../columns/NumberColumn'], function(columnToRowConverter, NumberColumn) {

    return columnToRowConverter.convert(NumberColumn);

});