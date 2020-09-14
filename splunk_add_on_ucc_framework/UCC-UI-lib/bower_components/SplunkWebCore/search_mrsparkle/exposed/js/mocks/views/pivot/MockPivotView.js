define([
            'module',
            'mocks/views/MockView'
        ],
        function(
            module,
            MockView
        ) {

    return MockView.extend({

        clearData: function() { },
        renderContainer: function() { },
        renderData: function() { },
        renderErrors: function() { },
        showInitializingMessage: function() { }

    });

});