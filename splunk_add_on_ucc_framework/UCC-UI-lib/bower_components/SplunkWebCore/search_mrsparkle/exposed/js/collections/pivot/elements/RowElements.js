/**
 * @author sfishel
 *
 * A collection of pivot report row-split elements.
 *
 * To be used only as a member property of the "models/pivot/PivotReport" module.
 */

define([
            './ElementsBase',
            'helpers/pivot/RowElementModelFactory'
        ],
            function(
                ElementsBase,
                RowElementModelFactory
        ) {

    return ElementsBase.extend({

        // 'model' is actually a factory that chooses a constructor based on the data type
        model: RowElementModelFactory

    });

});