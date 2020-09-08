define([
            'module',
            'views/shared/eventsviewer/LazyEventsViewer',
            'jquery'
        ],
        function(
            module,
            LazyEventsViewer,
            $
        ) {

    return LazyEventsViewer.extend({
        loadModule: function() {
            var dfd = $.Deferred();

            // Rename so r.js doesn't detect the dependency at build time
            var lazyRequire = require;
            lazyRequire(['views/shared/eventsviewerdrilldown/Master'], function() {
                dfd.resolve.apply(dfd, arguments);
            });

            return dfd;
        }
    });

});
