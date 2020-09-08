define([
            'mocks/models/MockModel'
        ],
        function(
            MockModel
        ) {

    return MockModel.extend({

        getSampleValuesModel: function() {
            var model = new MockModel();
            model.fetch();
            return model;
        },

        getFieldByName: function() {
            return {};
        },

        getGroupedFieldList: function() {
            return {
                objectCount: [],
                timestamp: [],
                other: []
            };
        },

        hasIndexTimeField: function() {
            return true;
        },

        hasParentDataModel: function() {
            return true;
        },

        getDataModelId: function() {
            return '';
        },

        getDataModelName: function() {
            return '';
        }

    });

});