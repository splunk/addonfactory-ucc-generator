define([
            'mocks/models/MockSplunkD'
        ],
        function(
            MockSplunkD
        ) {

    return MockSplunkD.extend({
        initialize: function(attributes) {
            this._attributes = attributes || {};
            MockSplunkD.prototype.initialize.apply(this, arguments);
        },

        getCustomAlertActions: function() {
            return {};
        },

        canWrite: function() {
            return true;
        },

        isPivotReport: function() {
            return this._attributes['is_pivot_report'] === true;
        }
    });

});
