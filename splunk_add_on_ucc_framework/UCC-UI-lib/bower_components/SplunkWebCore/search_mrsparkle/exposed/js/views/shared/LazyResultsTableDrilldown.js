define([
            'module',
            'views/shared/results_table/LazyResultsTable',
            'jquery'
        ],
        function(
            module,
            LazyResultsTable,
            $
        ) {

    return LazyResultsTable.extend({
        loadModule: function() {
            var dfd = $.Deferred();

            // Rename so r.js doesn't detect the dependency at build time
            var lazyRequire = require;
            lazyRequire(['views/shared/ResultsTableDrilldown'], function() {
                dfd.resolve.apply(dfd, arguments);
            });

            return dfd;
        }
    });

});
