define([
            'underscore',
            'jquery',
            'module',
            'views/shared/LazyView'
        ],
        function(
            _,
            $,
            module,
            LazyView
        ) {

    return LazyView.extend({

        moduleId: module.id,
        className: (LazyView.prototype.className || '') + ' lazy-events-viewer',
        loadingMessage: _('Loading Events...').t(),
        loadModule: function() {
            var dfd = $.Deferred();

            // Rename so r.js doesn't detect the dependency at build time
            var lazyRequire = require;
            lazyRequire(['views/shared/eventsviewer/Master'], function() {
                dfd.resolve.apply(dfd, arguments);
            });

            return dfd;
        }

    });

});
