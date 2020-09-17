define([
            'module',
            'mocks/views/MockView'
        ],
        function(
            module,
            MockView
        ) {

    return MockView.extend({

        load: function() { return this; }

    });

});