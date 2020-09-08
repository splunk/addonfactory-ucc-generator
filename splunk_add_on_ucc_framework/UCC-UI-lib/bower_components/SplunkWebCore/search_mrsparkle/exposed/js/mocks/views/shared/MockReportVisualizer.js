define([
            'module',
            'mocks/models/MockModel',
            'mocks/models/MockSplunkD',
            'mocks/views/MockView'
        ],
        function(
            module,
            MockModel,
            MockSplunkD,
            MockView
        ) {

    return MockView.extend({

        load: function() {
            return this;
        },

        getSearchDataModel: function() {
            return new MockSplunkD();
        },

        getSearchDataParamsModel: function() {
            return new MockModel();
        },

        clear: function() {},

        show: function() {
            this.$el.css({ visibility: "", opacity: "" });
        },

        hide: function() {
            this.$el.css({ visibility: "hidden", opacity: 0 });
        }
    },
    {
        GENERAL_TYPES: {}
    });

});