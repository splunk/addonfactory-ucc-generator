/**
 * @author sfishel
 *
 * A model for an individual timestamp row pivot element.
 */

define(['./column_to_row_converter', '../columns/TimestampColumn'], function(columnToRowConverter, TimestampColumn) {

    return columnToRowConverter.convert(TimestampColumn);

});