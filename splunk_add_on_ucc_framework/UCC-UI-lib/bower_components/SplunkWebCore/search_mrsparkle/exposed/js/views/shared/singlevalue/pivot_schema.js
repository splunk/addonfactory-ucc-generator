define([
            'underscore',
            'backbone',
            'constants/pivot'
        ],
        function(
            _,
            Backbone,
            pivotConstants
        ) {

    return ({
        panels: [
            {
                title: _('Value').t(),
                elementType: pivotConstants.CELL_VALUE,
                required: true,
                importFromEditor: 'general',
                labelElement: null
            },
            {
                title: _('Sparkline').t(),
                elementType: pivotConstants.ROW_SPLIT,
                dataTypes: [pivotConstants.TIMESTAMP],
                labelElement: null
            }
        ]
    });

});