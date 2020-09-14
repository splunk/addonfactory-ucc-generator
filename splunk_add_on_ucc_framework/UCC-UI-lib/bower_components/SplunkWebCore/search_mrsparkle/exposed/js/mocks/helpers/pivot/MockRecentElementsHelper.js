define([
            'mocks/collections/pivot/MockReportElements'
        ],
        function(
            MockElementCollection
        ) {

    var MockRecentElementsHelper = function() {
        this.getFilters = sinon.spy(this, 'getFilters');
        this.getSplits = sinon.spy(this, 'getSplits');
        this.getCells = sinon.spy(this, 'getCells');
        this.loadElementFromHistory = sinon.spy(this, 'loadElementFromHistory');
    };

    MockRecentElementsHelper.prototype = {

        getFilters: function() {
            return new MockElementCollection();
        },

        getCells: function() {
            return new MockElementCollection();
        },

        getSplits: function() {
            return new MockElementCollection();
        },

        loadElementFromHistory: function() { }

    };

    return MockRecentElementsHelper;

});