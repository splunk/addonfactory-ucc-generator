define(
    [
        "underscore",
        "jquery",
        "models/search/Job",
        'models/services/search/jobs/BulkControl',
        "collections/services/search/Jobs"
    ],
    function(
        _,
        $,
        JobModel,
        BulkControlModel,
        JobsCollection
    ) {
        return JobsCollection.extend({
            model: JobModel,
            initialize: function() {
                JobsCollection.prototype.initialize.apply(this, arguments);
            },
            initializeAssociated: function() {
                this.bulkControl = this.bulkControl || new BulkControlModel();
                JobsCollection.prototype.initializeAssociated.apply(this, arguments);
            },
            getAllSids: function() {
                return this.map(function(job) {
                    return job.get('id');
                });
            },
            noParamBulkControlUpdate: function(action, sids, options) {
                if(options && options.data) {
                    delete options.data;
                }

                return this.bulkControl.save({}, $.extend(true, options, { traditional: true, data: { action: action, sid: sids } }));
            },
            fetchNonAutoSummaryJobs: function(options) {
                //this is the port of modules/jobs/JobManager.py's generateResults()
                var omit_autosummary = '(NOT CASE(_ACCELERATE_) AND NOT CASE(_AUTOSUMMARY_) AND NOT "|*summarize*action=")',
                    filters = {};

                options = options || {};
                options.data = options.data || {};
                options.data.count = options.data.count || 10;
                options.data.offset = options.data.offset || 0;
                // The backend requires underscore casing for these while the rest of the code
                // (like in views/shared/TableHead.js) requires sortKey and sortDirection. Normalize.
                options.data.sort_key = options.data.sortKey || 'dispatch_time';
                options.data.sort_dir = options.data.sortDirection|| 'desc';

                delete options.data.sortKey;
                delete options.data.sortDirection;
                
                //Omit _AUTOSUMMARY_ jobs and their summarization jobs
                if (options.data.search) {
                    options.data.search = omit_autosummary + ' AND (' + options.data.search + ')';
                } else {
                    options.data.search = omit_autosummary;
                }
                
                //Omit data preview jobs by adding to the search string.
                filters['NOT isDataPreview'] = '1';
                
                if (options.data.app && (options.data.app !== '*')){
                    filters['eai:acl.app'] = options.data.app;
                }
                delete options.data.app;
                
                if (options.data.owner && (options.data.owner !== '*')){
                    filters['eai:acl.owner'] = options.data.owner;
                }
                delete options.data.owner;
                
                if (options.data.label){
                    filters.label = options.data.label;
                }
                delete options.data.label;
                    
                if (options.data.jobStatus && (options.data.jobStatus !== '*')){
                    if (options.data.jobStatus === 'running') {
                        filters['isDone'] = 0;
                        filters['isPaused'] = 0;
                        filters['isFinalized'] = 0;
                        filters['isFailed'] = 0;
                    } else if (options.data.jobStatus === 'done') {
                        filters['isDone'] = 1;
                    } else if (options.data.jobStatus === 'queued') {
                        filters['dispatchState'] = "QUEUED";
                    } else if (options.data.jobStatus === 'parsing') {
                        filters['dispatchState'] = "PARSING";
                    } else if (options.data.jobStatus === 'paused') {
                        filters['isPaused'] = 1;
                    } else if (options.data.jobStatus === 'finalizing') {
                        filters['dispatchState'] = "FINALIZING";
                    } else if (options.data.jobStatus === 'finalized') {
                        filters['isFinalized'] = 1;
                    } else if (options.data.jobStatus === 'failed') {
                        filters['isFailed'] = 1;
                    } else if (options.data.jobStatus === 'background') {
                        filters['custom.isBackground'] = 1;
                        filters['isDone'] = 0;
                    }
                }
                delete options.data.jobStatus;
                
                _.each(filters, function(value, key) {
                    options.data.search = options.data.search + ' ' + key + '="' + value + '"';
                });

                return this.fetch(options);
            },
            deleteAll: function(options) {
                options = options || {};
                return this.noParamBulkControlUpdate('cancel', this.getAllSids(), options);
            },
            touchAll: function(options) {
                options = options || {};
                return this.noParamBulkControlUpdate('touch', this.getAllSids(), options);
            },
            pauseAll: function(options) {
                options = options || {};
                return this.noParamBulkControlUpdate('pause', this.getAllSids(), options);
            },
            resumeAll: function(options) {
                options = options || {};
                return this.noParamBulkControlUpdate('unpause', this.getAllSids(), options);
            },
            stopAll: function(options) {
                options = options || {};
                return this.noParamBulkControlUpdate('finalize', this.getAllSids(), options);
            },
            getRunningJobs: function() {
                return this.filter(function(searchJob) {
                    return searchJob.isRunning();
                });
            },
            getPausedJobs: function() {
                return this.filter(function(searchJob) {
                    return searchJob.isPaused();
                });
            },
            getNotDoneJobs: function() {
                return this.filter(function(searchJob) {
                    return !searchJob.isDone();
                });
            }
        });
    }
);