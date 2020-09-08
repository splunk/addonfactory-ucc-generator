/**
 * @author jszeto
 * @date 11/22/13
 *
 * Controller class to kick off searches and manage the job lifecycle. This controller reuses a single Job model
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'controllers/Base',
    'util/field_extractor_utils',
    'splunk.util'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseController,
        fieldExtractorUtils,
        splunkUtils
        ) {

        return BaseController.extend({

            moduleId: module.id,
            ADHOC_SEARCH_LEVEL: "verbose", // TODO [JCS] Parameterize this because some jobs don't need summary info

            /**
             * @constructor
             *
             * @param options {Object} {
             *     model: {
             *         application <models.shared.Application>
             *         state {Model} model to track the state of the previewing operation
             *         searchJob <models.search.Job> shared search job
             *     }
             * }
             */

            initialize: function(options) {
                BaseController.prototype.initialize.call(this, options);

                this.model.searchJob.on('change:id', function() {
                    if (this.model.searchJob.isNew()) {
                        this.model.searchJob.fetchAbort();
                        this.model.searchJob.stopPolling();
                        this.model.searchJob.stopKeepAlive();
                    } else {
                        this.model.searchJob.startPolling();
                    }
                }, this);
            },

            createJobAttributes: function(searchString) {
                var sampleSizeConfig = this.model.state.get("sampleSize"),
                    filter = this.model.state.get('filter'),
                    clustering = this.model.state.get('clustering'),
                    search = [searchString],
                    result = {
                        earliest_time: sampleSizeConfig.earliest || null,
                        latest_time: sampleSizeConfig.latest || null,
                        auto_cancel: 100,
                        auto_finalize_ec: 0,
                        status_buckets: 0,
                        timeFormat: '%s.%Q',
                        ui_dispatch_app: this.model.application.get("app"),
                        rf: '*',
                        preview: true,
                        adhoc_search_level: this.ADHOC_SEARCH_LEVEL,
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner")
                    };

                if(filter) {
                    search.push(this.createFilterSubQuery(filter));
                }
                if(sampleSizeConfig.head) {
                    search.push('head ' + sampleSizeConfig.head);
                }
                if(clustering === fieldExtractorUtils.CLUSTERING_DIVERSE) {
                    search.push(this.createClusterSubQuery({ sort: 'descending' }));
                }
                else if(clustering === fieldExtractorUtils.CLUSTERING_OUTLIERS) {
                    search.push(this.createClusterSubQuery({ sort: 'ascending' }));
                }

                result.search = search.join(' | ');
                return result;
            },

            createFilterSubQuery: function(filter) {
                var keyValue = filter.split('=');
                if(keyValue.length === 2) {
                    if(filter.charAt(0) !== '"' || filter.charAt(filter.length - 1) !== '"') {
                        return splunkUtils.sprintf(
                            'search %s=%s',
                            splunkUtils.searchEscape(keyValue[0]),
                            splunkUtils.searchEscape(keyValue[1])
                        );
                    }
                    else {
                        filter = filter.substr(1, filter.length - 2);
                    }
                }
                return splunkUtils.sprintf('search *%s*', splunkUtils.searchEscape(filter));
            },

            createClusterSubQuery: function(options) {
                return splunkUtils.sprintf(
                    'cluster t=0.6 showcount=true field=%s labelonly=true | dedup 3 cluster_label ' +
                        '| sort 100 %scluster_count | sort -_time | abstract maxlines=100',
                    splunkUtils.searchEscape(this.model.state.get('inputField')),
                    options.sort === 'ascending' ? '+' : '-'
                );
            },

            /**
             * This function will take any search string and run a search job. It will then display an events view or
             * table view depending upon the type of search.
             *
             * @param {string} searchString - string to use for the search
             */
            preview: function(searchString, options) {
                options = options || {};
                // Cleanup any existing search jobs
                this.resetSearchJob();
                var jobData = _.extend(this.createJobAttributes(searchString), options.data);
                // Run the search job and start polling so we get progress updates
                return this.model.searchJob.save({}, { data: jobData });
            },

            resetSearchJob: function() {
                this.model.searchJob.clear();
            }
        });

    });

