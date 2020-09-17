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
        className: (LazyView.prototype.className || '') + ' lazy-map',
        loadingMessage: _('Loading Map...').t(),
        loadModule: function() {
            var dfd = $.Deferred();

            // Rename so r.js doesn't detect the dependency at build time
            var lazyRequire = require;
            lazyRequire(['views/shared/map/Master'], function() {
                dfd.resolve.apply(dfd, arguments);
            });

            return dfd;
        },

        initialize: function() {
            LazyView.prototype.initialize.apply(this, arguments);
            this.$el.height(this.options.height || 400);
        },

        _getWrappedViewOptions: function() {
            return _.extend(
                {},
                LazyView.prototype._getWrappedViewOptions.apply(this, arguments),
                { height: '100%' }
            );
        }

    });

});
