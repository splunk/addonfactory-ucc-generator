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
        className: (LazyView.prototype.className || '') + ' lazy-timeline',
        loadingMessage: _('Loading Timeline...').t(),
        _shown: false,
        loadModule: function() {
            var dfd = $.Deferred();

            // Rename so r.js doesn't detect the dependency at build time
            var lazyRequire = require;
            lazyRequire(['views/shared/CanvasTimeline'], function() {
                dfd.resolve.apply(dfd, arguments);
            });

            return dfd;
        },

        show: function() {
            this._shown = true;
            return this;
        },

        hide: function() {
            this._shown = false;
            return this;
        },

        _onWrappedViewLoaded: function() {
            LazyView.prototype._onWrappedViewLoaded.apply(this, arguments);
            if(this._shown) {
                this.children.wrappedView.show();
            }
            this.$el.height('');
        }

    });

});
