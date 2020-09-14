/**
 * @author sfishel
 *
 * A model for an individual boolean row pivot element.
 */

define(['./column_to_row_converter', '../columns/BooleanColumn'], function(columnToRowConverter, BooleanColumn) {

    return columnToRowConverter.convert(BooleanColumn);

});