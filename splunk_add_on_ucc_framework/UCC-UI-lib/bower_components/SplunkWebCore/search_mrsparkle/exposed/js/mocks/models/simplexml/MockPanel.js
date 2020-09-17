define([
            'mocks/models/MockSplunkD'
        ],
        function(
            MockSplunkD
        ) {

    return MockSplunkD.extend({
        type: "panelref",
        settings: {
            app: "simplexml",
            ref: "input_checkbox_searchobject"
        }
    });

});