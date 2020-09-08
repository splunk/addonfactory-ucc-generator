define([
            'mocks/models/MockModel',
            'views/shared/results_table/ResultsTableRow'
    ], 
    function(
            MockModel,
            ResultsTableRow
        ){
    return MockModel.extend({

        initialize: function(attrs) {
            MockModel.prototype.initialize.call(this, attrs);
            this.metadata = new MockModel();
        }

    },
    {
        ROW_EXPANSION_CLASSNAME: ResultsTableRow.ROW_EXPANSION_CLASSNAME
    });

});