define([
            'jquery',
            'underscore',
            'collections/SplunkDsBase',
            'mocks/models/MockSplunkD',
            'mocks/mockify'
        ],
        function(
            $,
            _,
            SplunkDsBaseV2,
            MockModel,
            mockify
        ) {

    var MockSplunkDsV2 = SplunkDsBaseV2.extend({
        model: MockModel,
        initialize: function(models, options){
            mockify(this, { dontSpy: 'sync' });
            SplunkDsBaseV2.prototype.initialize.call(this, models, options);
        }

    },
    {
        wrapInSplunkdShell: function(partialResponse) {
            var response = $.extend(true, {}, MockSplunkDsV2.SPLUNKD_SHELL);
            if(_(partialResponse).isArray()) {
                response.entry = _(partialResponse).map(function(partialEntry) {
                    // use the MockSplunkDV2 wrapInSplunkdShell method to normalize the partial entry
                    // the pull out the entry it creates
                    var wrappedEntry = MockModel.wrapInSplunkdShell(partialEntry);
                    return wrappedEntry.entry[0];
                });
            }
            return response;
        },

        SPLUNKD_SHELL: {
            links: {},
            generator: {},
            paging: {},
            messages: {},
            entry: []
        }
    });

    return MockSplunkDsV2;

});