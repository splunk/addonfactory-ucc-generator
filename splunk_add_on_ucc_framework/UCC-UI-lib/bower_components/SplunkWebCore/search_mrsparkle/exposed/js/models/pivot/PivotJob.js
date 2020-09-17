define([
            'jquery',
            'underscore',
            'models/search/Job',
            'splunk.util',
            'util/splunkd_utils',
            'util/time'
        ],
        function(
            $,
            _,
            Job,
            splunkUtils,
            splunkdUtils,
            timeUtils
        ) {

    var syncCreate = function(model, options) {
        options = $.extend(true, { data: { status_buckets: 0, preview: true } }, options);
        var optionsData = options.data;
        // if there is a namespace, use the tstatsSearch, otherwise use the raw search
        optionsData.search = optionsData.tsidxNamespace ? optionsData.tstatsSearch : optionsData.search;
        delete optionsData.tsidxNamespace;
        delete optionsData.tstatsSearch;
        return Job.prototype.sync.call(model, 'create', model, options);
    };

    var dispatchReportJob = function(model, options) {
        var oldReportJob = model.reportJob,
            // when dispatching a new report job, always set status_buckets to zero
            dispatchOptions = $.extend(true, {}, options, { data: { status_buckets: 0 } });

        model.reportJob = new Job();
        return model.reportJob.save({}, dispatchOptions).always(function() {
            if(!model.isDeleted) {
                oldReportJob.destroy();
            }
        });
    };

    var syncCreateAccelerated = function(model, options) {
        options = $.extend(true, {}, options);
        var optionsData = options.data;
        optionsData.search = optionsData.tstatsSearch;
        delete optionsData.tstatsSearch;
        delete optionsData.sid;

        // for the initial dispatch, add preview=true to the data params
        var reportDispatchOptions = { data: $.extend({ preview: true }, optionsData) };
        model.dispatchData = _(optionsData).pick('search', 'earliest_time', 'latest_time', 'provenance');
        var collectFetchOptions = { data: _(optionsData).pick('app', 'owner', 'sharing') };

        var dfd = $.when(model.collectJob.fetch(collectFetchOptions), dispatchReportJob(model, reportDispatchOptions)).then(
            // success filter, check for errors in either the collect or report jobs,
            // then parse the response from the report job
            function() {
                model.set(model.idAttribute, model.reportJob.get(model.reportJob.idAttribute));
                if(model.collectJob.entry.content.get('isFailed')) {
                    options.error({});
                    return $.Deferred().reject();
                }
                if(model.reportJob.entry.content.get('isFailed')) {
                    options.error({});
                    return $.Deferred().reject();
                }
                var response = model.parseReportJob(model.reportJob);
                options.success(response);
                return $.Deferred().resolve();
            },
            // fail filter, invoke the error handler
            function() {
                model.set(model.idAttribute, model.reportJob.get(model.reportJob.idAttribute));
                options.error({});
                return this;
            }
        );
        model.trigger('request', model, dfd, options);
        return dfd;
    };

    var syncReadAccelerated = function(model, options) {
        options = options || {};
        var fetchPromise,
            optionsData = options.data,
            collectIsDone = model.collectJob.isDone(),
            collectFetchOptions = { data: _(optionsData || {}).pick('app', 'owner', 'sharing') };

        // set up a promise that will refresh the two jobs in parallel
        // if the reportJob is already done, dispatch a new one with exec_mode blocking to get the latest data
        // otherwise the fetch the running report job
        // in either case, if the collect job is already done there is no need to fetch it
        if(model.reportJob.isNew() || model.reportJob.isDone()) {
            var reportDispatchOptions = {
                data: $.extend({ preview: false, exec_mode: 'blocking' }, model.dispatchData, optionsData)
            };
            fetchPromise = $.when(
                collectIsDone || model.collectJob.fetch(collectFetchOptions),
                dispatchReportJob(model, reportDispatchOptions)
            );
        }
        else {
            var reportFetchOptions = { data: $.extend({}, optionsData) };
            fetchPromise = $.when(
                collectIsDone || model.collectJob.fetch(collectFetchOptions),
                model.reportJob.fetch(reportFetchOptions)
            );
        }

        var dfd = fetchPromise.then(
            // success filter, parse the response from the report job
            function() {
                model.set(model.idAttribute, model.reportJob.get(model.reportJob.idAttribute));
                if(model.collectJob.entry.content.get('isFailed')) {
                    options.error({});
                    return $.Deferred().reject();
                }
                if(model.reportJob.entry.content.get('isFailed')) {
                    options.error({});
                    return $.Deferred().reject();
                }
                var response = model.parseReportJob(model.reportJob);
                options.success(response);
                return $.Deferred().resolve();
            },
            // fail filter, invoke the error handler
            function() {
                model.set(model.idAttribute, model.reportJob.get(model.reportJob.idAttribute));
                options.error({});
                return this;
            }
        );

        model.trigger('request', model, dfd, options);
        return dfd;
    };

    var PivotJob = Job.extend({

        initialize: function() {
            Job.prototype.initialize.apply(this, arguments);
            this.isPaused = false;
            this.isFinalized = false;
            this.isDeleted = false;
            this.on('error', function() {
                this.entry.content.set({ isFailed: true });
            }, this);
        },

        _onerror: function(model, response, options) {
            if(this.getAccelerationType() === PivotJob.ADHOC_ACCELERATION) {
                model.error.clear();
                var messages = _.union(
                    model.collectJob.error.get('messages') || [],
                    model.reportJob.error.get('messages') || []
                );
                this.trigger('serverValidated', false, this, messages);
                model.error.set("messages", messages);
            }
            else {
                Job.prototype._onerror.apply(this, arguments);
            }
        },

        sync: function(method, model, options) {
            options = options || {};
            var optionsData = options.data || {};
            switch(method){
                case 'create':
                    // if no acceleration information was given, or in real-time mode, just dispatch with no acceleration
                    if(!(optionsData.tsidxNamespace || optionsData.sid) || timeUtils.isRealtime(optionsData.earliest_time)) {
                        delete optionsData.tsidxNamespace;
                        delete optionsData.sid;
                        return syncCreate(model, options);
                    }
                    // in ad-hoc acceleration mode, create a references to the collect job and report job
                    // then invoke the syncCreateAccelerated handler
                    if(optionsData.sid) {
                        this.collectJob = new Job();
                        this.collectJob.set(this.collectJob.idAttribute, options.data.sid);
                        this.reportJob = new Job();
                        return syncCreateAccelerated(this, options);
                    }
                    // otherwise honor the given namespace
                    this.tsidxNamespace = optionsData.tsidxNamespace;
                    return syncCreate(model, options);
                case 'read':
                    var accType = this.getAccelerationType();
                    if(accType === PivotJob.ADHOC_ACCELERATION) {
                        if(this.isPaused || this.isFinalized) {
                            if(this.isPaused) {
                                this.collectJob.touch();
                            }
                            return this.simulateSyncSuccess(options, [this.parseReportJob(this.reportJob)]);
                        }
                        return syncReadAccelerated(this, options);
                    }
                    return Job.prototype.sync.call(this, method, model, options);
                case 'delete':
                    model.isDeleted = true;
                    return Job.prototype.sync.call(this, method, model, options);
                default:
                    throw new Error('invalid method: ' + method);
            }
        },

        clear: function() {
            if (this.collectJob) {
                this.collectJob.fetchAbort();
                delete this.collectJob;
            }
            if (this.reportJob) {
                this.reportJob.fetchAbort();
                delete this.reportJob;
            }
            return Job.prototype.clear.apply(this, arguments);
        },

        pause: function(options) {
            if(!this.shouldFakeControlActions()) {
                return Job.prototype.pause.call(this, options);
            }
            this.isPaused = true;
            this.trigger('fakeControlAction', 'pause');
            return this.simulateSyncSuccess(options, [{}]);
        },

        unpause: function(options) {
            if(!this.shouldFakeControlActions()) {
                return Job.prototype.unpause.call(this, options);
            }
            this.isPaused = false;
            this.trigger('fakeControlAction', 'unpause');
            return this.simulateSyncSuccess(options, [{}]);
        },

        finalize: function(options) {
            if(!this.shouldFakeControlActions()) {
                return Job.prototype.finalize.call(this, options);
            }
            this.isFinalized = true;
            this.isPaused = false;
            this.trigger('fakeControlAction', 'finalize');
            return this.simulateSyncSuccess(options, [{}]);
        },

        shouldFakeControlActions: function() {
            var accType = this.getAccelerationType();
            return (accType === PivotJob.ADHOC_ACCELERATION);
        },

        simulateSyncSuccess: function(options, successArgs) {
            var dfd = $.Deferred().resolve().promise();
            this.trigger('request', this, dfd, options);
            if(options && _(options.success).isFunction()) {
                options.success.apply(null, successArgs);
            }
            return dfd;
        },

        parseReportJob: function(reportJob) {
            var reportJobJson = reportJob.toSplunkD(),
                reportJobContent = reportJobJson.entry[0].content,
                collectJobJson = this.collectJob.toSplunkD(),
                collectJobContent = collectJobJson.entry[0].content,
                dispatchState = this.determineDispatchState(reportJob),
                doneProgress = this.calculateDoneProgress(reportJob),
                // doneProgress is an computed value based on the time range of the report job
                // if it is 1 and the report job is done, then the collect job has made enough progress to cover the time range
                reportTimeRangeIsCovered = doneProgress === 1 && !!reportJobContent.isDone,
                // collectIsDone indicates whether we are done polling the collect job
                // this can mean that job is itself done, or that it has covered the report time range
                collectIsDone = collectJobContent.isDone || reportTimeRangeIsCovered,
                collectJustFinished = collectIsDone && !this.collectWasDone;

            // now that we have read the collectWasDone variable, set it up for the next time
            if(collectIsDone) {
                this.collectWasDone = true;
            }
            // a few things to consider when determining if we are done polling the job:
            // - the collect and report jobs are fetched in parallel, so if the collect just finished there is
            //        no guarantee that the report got the full results, so we are not done
            // - otherwise if the computed dispatch state is DONE (meaning both the collect and report job are done),
            //        or the collect job has covered the report job time range, then we are done
            if(!collectJustFinished && (dispatchState === Job.DONE || reportTimeRangeIsCovered)) {
                dispatchState = Job.DONE;
            }
            // it's possible that the above logic will decide we are not done even though the current value of
            // dispatchState is DONE, so set it to RUNNING
            else if(dispatchState === Job.DONE) {
                dispatchState = Job.RUNNING;
            }

            $.extend(reportJobContent, {
                // make sure this is true so that the UI will fetch intermediate results
                isPreviewEnabled: true,
                dispatchState: dispatchState,
                doneProgress: doneProgress,
                // a few things to consider when determining if we are done polling the job:
                // - the collect and report jobs are fetched in parallel, so if the collect just finished there is
                //        no guarantee that the report got the full results, so we are not done
                // - otherwise if the computed dispatch state is DONE (meaning both the collect and report job are done),
                //        or the collect job has covered the report job time range, then we are done
                isDone: !this.isPaused && (dispatchState === Job.DONE),
                isFailed: (dispatchState === Job.FAILED),
                isPaused: this.isPaused,
                isFinalized: this.isFinalized,
                // use the scanCount and eventCount from the collect job if the report job does not have meaningful values
                scanCount: reportJobContent.scanCount || collectJobContent.scanCount,
                eventCount: reportJobContent.eventCount || collectJobContent.eventCount
            });
            return reportJobJson;
        },

        determineDispatchState: function(reportJob) {
            if(this.isFinalized) {
                return Job.DONE;
            }
            var collectState = this.collectJob.entry.content.get('dispatchState');
            if(collectState === Job.FAILED || reportJob.entry.content.get('isFailed')) {
                return Job.FAILED;
            }
            if(this.collectJob.isPreparing()) {
                return collectState;
            }
            if(collectState === Job.DONE && reportJob.isDone()) {
                return Job.DONE;
            }
            return Job.RUNNING;
        },

        calculateDoneProgress: function(reportJob) {
            var collectContent = this.collectJob.entry.content;
            if(reportJob.isOverAllTime()) {
                return collectContent.get('doneProgress');
            }
            var reportContent = reportJob.entry.content,
                earliestIso = reportContent.get('earliestTime'),
                earliestEpoch = earliestIso ? parseFloat(splunkUtils.getEpochTimeFromISO(earliestIso)) : 0,
                latestIso = reportJob.latestTimeSafe(),
                latestEpoch = latestIso ? parseFloat(splunkUtils.getEpochTimeFromISO(latestIso)) : 0,
                cursorIso = collectContent.get('cursorTime'),
                cursorEpoch = cursorIso ? parseFloat(splunkUtils.getEpochTimeFromISO(cursorIso)) : 0;

            var rawDoneProgress = (latestEpoch - cursorEpoch) / (latestEpoch - earliestEpoch);
            // make sure we return a number between 0 and 1
            return Math.max(Math.min(rawDoneProgress, 1), 0);
        },

        getAccelerationType: function() {
            if(this.collectJob) {
                return PivotJob.ADHOC_ACCELERATION;
            }
            if(this.tsidxNamespace) {
                return PivotJob.MANAGED_ACCELERATION;
            }
            return PivotJob.NO_ACCELERATION;
        },

        isAccelerated: function() {
            return this.getAccelerationType() !== PivotJob.NO_ACCELERATION;
        },

        getCollectId: function() {
            return this.collectJob.get(this.collectJob.idAttribute);
        },

        getTsidxNamespace: function() {
            return this.tsidxNamespace;
        }

    },
    {
        // constants for the different types of acceleration
        NO_ACCELERATION: 'no-acceleration',
        ADHOC_ACCELERATION: 'adhoc-acceleration',
        MANAGED_ACCELERATION: 'managed-acceleration'
    });

    return PivotJob;

});