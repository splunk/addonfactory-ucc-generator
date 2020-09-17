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
        className: (LazyView.prototype.className || '') + ' lazy-results-table',
        loadingMessage: _('Loading Results...').t(),
        expandedRowIndex: null,
        loadModule: function() {
            var dfd = $.Deferred();

            // Rename so r.js doesn't detect the dependency at build time
            var lazyRequire = require;
            lazyRequire(['views/shared/results_table/ResultsTableMaster'], function() {
                dfd.resolve.apply(dfd, arguments);
            });

            return dfd;
        },

        _onWrappedViewLoaded: function() {
            if (this.expandedRowIndex !== null) {
                this.children.wrappedView.expandRow(this.expandedRowIndex);
            }
            LazyView.prototype._onWrappedViewLoaded.apply(this, arguments);
        },

        expandRow: function(index) {
            this.expandedRowIndex = index;
            if (this.children.wrappedView) {
                this.children.wrappedView.expandRow(index);
            }
        },

        collapseRow: function() {
            this.expandedRowIndex = null;
            if (this.children.wrappedView) {
                this.children.wrappedView.collapseRow();
            }
        }

    },
    {
        getInitialDataParams: function(configJson) {
            return ({
                show_metadata: true,
                output_mode: "json_rows",
                show_empty_fields: "True",
                sortKey: configJson['display.statistics.sortColumn'],
                sortDirection: configJson['display.statistics.sortDirection'],
                count: configJson['display.prefs.statistics.count'] || '20',
                offset: configJson['display.prefs.statistics.offset'] || '0'
            });
        }
    });

});
