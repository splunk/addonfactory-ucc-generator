/**
 * @author sfishel
 *
 * A collection of pivot report column-split elements.
 *
 * To be used only as a member property of the "models/pivot/PivotReport" module.
 */

define([
            './ElementsBase',
            'helpers/pivot/ColumnElementModelFactory'
        ],
            function(
                ElementsBase,
                ColumnElementModelFactory
        ) {

    return ElementsBase.extend({

        // 'model' is actually a factory that chooses a constructor based on the data type
        model: ColumnElementModelFactory

    });

});