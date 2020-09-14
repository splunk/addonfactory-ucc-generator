define([
        'mocks/models/MockServerInfo'
    ],
    function(
        MockServerInfo
    ) {

        return MockServerInfo.extend({
            isLite: function() {
                return true;
            }

        });

    });