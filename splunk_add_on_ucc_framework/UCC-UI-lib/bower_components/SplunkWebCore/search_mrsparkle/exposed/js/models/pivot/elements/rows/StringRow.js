/**
 * @author sfishel
 *
 * A model for an individual string row pivot element.
 */

define(['./column_to_row_converter', '../columns/StringColumn'], function(columnToRowConverter, StringColumn) {

    return columnToRowConverter.convert(StringColumn);

});