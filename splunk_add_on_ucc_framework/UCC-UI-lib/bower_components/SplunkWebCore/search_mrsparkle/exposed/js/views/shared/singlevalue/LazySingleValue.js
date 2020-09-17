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
            className: (LazyView.prototype.className || '') + ' lazy-single-value',
            loadingMessage: _('Loading Results...').t(),
            loadModule: function() {
                var dfd = $.Deferred();

                // Rename so r.js doesn't detect the dependency at build time
                var lazyRequire = require;
                lazyRequire(['views/shared/singlevalue/Master'], function() {
                    dfd.resolve.apply(dfd, arguments);
                });

                return dfd;
            }

        },
        {
            getInitialDataParams: function() {
                return ({
                    output_mode: 'json_cols',
                    show_metadata: true,
                    show_empty_fields: 'True',
                    offset: 0,
                    count: 1000
                });
            }
        });

    });
