/**
 * @author jszeto
 * @date 10/31/13
 *
 * Inputs:
 *
 * model {
 *  results {models/services/search/jobs/ResultJsonRows} holds array of events to display in results table
 *  }
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    './ResultsControlBar',
    'views/shared/jobstatus/Count',
    'views/shared/SearchResultsPaginator',
    'collections/Base'
],
    function (
        $,
        _,
        Backbone,
        module,
        ResultsControlBar,
        Count,
        SearchResultsPaginator,
        BaseCollection) {

        return ResultsControlBar.extend({
            moduleId:module.id,

            initialize:function (options) {
                var paginator = new SearchResultsPaginator({model: {
                                                                state: this.model.paginatorState,
                                                                searchJob: this.model.searchJob,
                                                                results: this.model.results
                                                            },
                                                            collection: new BaseCollection(),
                                                            mode: this.options.reportType});

                options.paginator = paginator;

                ResultsControlBar.prototype.initialize.call(this, options);
            },

            initializeCount: function(options) {
                this.children.count = new Count({model: this.model.searchJob, resultsModel: this.model.results});
            }
        });

    });

