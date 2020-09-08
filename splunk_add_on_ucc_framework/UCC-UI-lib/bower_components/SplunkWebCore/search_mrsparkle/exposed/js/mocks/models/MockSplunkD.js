define(['jquery', 'underscore', 'models/SplunkDBase', 'mocks/mockify'], function($, _, SplunkDBase, mockify) {

    var MockSplunkDV2 = SplunkDBase.extend({

        initialize: function(attributes) {
            mockify(this, { dontSpy: 'sync' });
            SplunkDBase.prototype.initialize.call(this, attributes);
        }

    },
    {
        wrapInSplunkdShell: function(partialResponse) {
            var response = $.extend(true, {}, MockSplunkDV2.SPLUNKD_SHELL);

            // if the partial response has an 'entry' property, do a full merge with the empty envelope
            if(partialResponse.hasOwnProperty('entry')) {
                // allow the 'entry' to be passed as an object instead of an array
                if(!_(partialResponse.entry).isArray()) {
                    partialResponse.entry = [partialResponse.entry];
                }
                $.extend(true, response, partialResponse);
            }
            // if the partial response has a 'content' property, treat it as an extension to the 'entry'
            else if(partialResponse.hasOwnProperty('content')) {
                $.extend(true, response.entry[0], partialResponse);
            }
            // otherwise, treat the partial response as an extension to the 'content'
            else {
                $.extend(true, response.entry[0].content, partialResponse);
            }
            return response;
        },

        SPLUNKD_SHELL: {
            links: {},
            generator: {},
            paging: {},
            messages: {},
            entry: [{
                links: {},
                content: {},
                acl: {},
                fields: {}
            }]
        }
    });

    return MockSplunkDV2;

});