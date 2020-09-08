define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/services/search/Job',
        'models/services/saved/Search',
        'util/splunkd_utils',
        'util/time',
        'util/moment',
        'util/console',
        'util/format_numbers_utils',
        'splunk.util',
        'splunk.i18n',
        'helpers/Session',
        'helpers/search/ArtifactFetchManager',
        'util/Ticker'
    ],
    function($, _, Backbone, SearchJob, SavedSearch, splunkd_utils, time_utils, moment, console, format_numbers_utils, splunkUtil, i18n, Session, ArtifactFetchManager, Ticker) {
        /**
         * @constructor
         * @memberOf models
         * @name Job
         * @extends models.SearchJob
         * @description
         * Child of SearchJob Model
         */
        var JobModel = SearchJob.extend(/** @lends models.Job.prototype */{
            initialize: function(attributes, options) {
                SearchJob.prototype.initialize.apply(this, arguments);
                // Only store recognized options to avoid memory leak
                this.options = _.pick(options || {}, 'delay', 'aggressiveDelay', 'processKeepAlive', 'keepAliveInterval');

                this.setInstanceDefaults();

                this.entry.content.on('change', function() {
                    var changedAttributes = this.entry.content.changedAttributes(),
                        previousAttributes = this.entry.content.previousAttributes();

                    this.handleJobProgress(changedAttributes, previousAttributes);
                }, this);
                
                this.entry.content.on("change:dispatchState", function() {
                    if (this.entry.content.get('dispatchState') && !this.isPreparing() && !this.prepared) {
                        this.prepared = true;
                        this.trigger("prepared");
                    }

                    //stop polling when the job is done
                    if (this.isDone() || this.entry.content.get('isFailed')) {
                        this.stopPolling();
                    }

                }, this);

                this.entry.content.on("change:isDone", function() {
                    if (this.isDone()) {
                        this.trigger('done');
                    }
                }, this);
                    
                //poll aggressively to begin with
                this.ticker = new Ticker({interval:this.aggressivePollingDelay});
                this.ticker.on('tick', function() {
                    this.safeFetch({
                        data: {
                            app: this.entry.acl.get('app'),
                            owner: this.entry.acl.get('owner'),
                            sharing: this.entry.acl.get('sharing')
                        }
                    });
                }, this);

                this.on("startPolling", function() {     
                    var _private_progress = function() {
                        var count;
                        this.aggressivePollingDelay *= 1.5;
                        this.aggressivePollingDelay = Math.round(this.aggressivePollingDelay);

                        if (this.isDone() || this.entry.content.get('isFailed')) {
                            this.off('sync', _private_progress, this);
                            return;
                        }

                        if (this.isReportSearch()) {
                            if (this.entry.content.get('isPreviewEnabled')) {
                                count = this.entry.content.get('resultPreviewCount');
                            } else {
                                count = this.entry.content.get('resultCount');
                            }
                        } else {
                            count = this.entry.content.get('eventAvailableCount');
                        }

                        if ((count > 0) || (this.aggressivePollingDelay >= this.pollingDelay)) {
                            this.off('sync', _private_progress, this);
                            this.trigger('slowDownPoller');
                        } else {
                            if (this._poll) {
                                this.ticker.restart({
                                    interval: this.aggressivePollingDelay
                                });
                            }                            
                        }

                    }.bind(this);

                    this.on('slowDownPoller', function() {
                        if (this._poll) {
                            this.ticker.restart({
                                interval: this.pollingDelay
                            });
                        }
                    }, this);

                    this.on('sync', _private_progress, this);
                }, this);
                
                this.on("error", function(){
                    if (splunkd_utils.messagesContainsOneOfTypes(this.error.get("messages"), [splunkd_utils.NOT_FOUND, splunkd_utils.FATAL])) {
                        this.handleJobDestroy();
                    }
                }, this);
                
                this.entry.content.on("change:isFailed", function(){
                    if (this.entry.content.get("isFailed")) {
                        this.handleJobDestroy();
                    }
                }, this);
                
                this.on('destroy', this.handleJobDestroy, this);
            },
            setInstanceDefaults: function() {
                //poller setup
                this._poll = false;
                this.pollingDelay = this.options.delay || SearchJob.JOB_MAX_POLLING_INTERVAL;
                this.aggressivePollingDelay = this.options.aggressiveDelay || SearchJob.JOB_MIN_POLLING_INTERVAL;
                
                this.prepared = (this.entry.content.get('dispatchState') && !this.isPreparing());
                this.processKeepAlive = this.options.processKeepAlive || false;
                this.keepAlivePoller = null;
                this.keepAliveInterval = this.options.keepAliveInterval;
            },
            clear: function() {
                SearchJob.prototype.clear.apply(this, arguments);
                this.handleJobDestroy();
                this.setInstanceDefaults();
                return this;
            },
            handleJobProgress: function(changed, previous) {
                if (this.isNew()) {
                    return false;
                }
                
                var jobIsRealTime = this.entry.content.get('isRealTimeSearch'),
                    jobIsReportSearch = this.entry.content.get('reportSearch'),
                    jobAdHocModeIsVerbose = (this.getAdhocSearchMode() === splunkd_utils.VERBOSE),
                    jobPreviewEnabled = this.entry.content.get('isPreviewEnabled'),
                    jobIsDoneInModel = this.isDone(),
                    changeIsEmpty = _.isEmpty(changed);
                
                // if the job is not previewable and also not done, ignore the progress 
                if (
                    changeIsEmpty ||
                    (!jobIsDoneInModel && jobIsReportSearch && !jobPreviewEnabled && !jobAdHocModeIsVerbose)
                ) {
                    return false;
                }
                
                // examine changes to the job model and determine if the child objects should be updated
                var scanCountChanged = !_(changed.scanCount).isUndefined() && (changed.scanCount > previous.scanCount),
                    eventCountChanged = !_(changed.eventCount).isUndefined(),
                    eventPreviewableCountChanged = !_(changed.eventPreviewableCount).isUndefined(),
                    resultCountChanged = !_(changed.resultCount).isUndefined(),
                    jobIsDone = !_(changed.isDone).isUndefined() && (changed.isDone === true),
                    jobIsUpdated = scanCountChanged || eventCountChanged || resultCountChanged || eventPreviewableCountChanged ||
                                    jobIsDone || jobIsRealTime;

                if (!jobIsUpdated) {
                    return false;
                }
                
                //we have determined that the job has been updated, so trigger all relevant events
                //we could be smarter about this, for now always notifying each sub-endpoint on every progress event
                this.trigger("jobProgress");
                var links = this.entry.links;
                this.trigger("jobProgress:" + JobModel.RESULTS_PREVIEW, links.get(JobModel.RESULTS_PREVIEW), this);
                this.trigger("jobProgress:" + JobModel.RESULTS, links.get(JobModel.RESULTS), this);
                this.trigger("jobProgress:" + JobModel.SUMMARY, links.get(JobModel.SUMMARY), this);
                this.trigger("jobProgress:" + JobModel.TIMELINE, links.get(JobModel.TIMELINE), this);
                this.trigger("jobProgress:" + JobModel.EVENTS, links.get(JobModel.EVENTS), this);
                
                if (jobIsDone && this.processKeepAlive) {
                    this.startKeepAlive();
                }
                
                return true;
            },
            
            registerJobProgressLinksChild: function(linksKey, child, callback, scope) {
                // NOTE: Only register after the job has been created/fetched!
                var id = this.entry.links.get(linksKey);
                if (id) {
                    child.set("id", id);
                    callback.call(scope);
                    this.on("jobProgress", callback, scope);
                    return true;
                }
                console.warn('Search Job Model: You attempted to register a child model with a links key that doesn\'t exist. Have you fetched your job lately? Key:', linksKey);
                return false;
            },
            
            unregisterJobProgressLinksChild: function(callback, scope) {
                this.off("jobProgress", callback, scope);
            },
            
            handleJobDestroy: function() {
                this.stopPolling();
                this.processKeepAlive = false;
                this.stopKeepAlive();
                this.fetchAbort();
                this.control.fetchAbort();
            },
            
            _getKeepAliveInterval: function() {
                if (this.keepAliveInterval) {
                    return this.keepAliveInterval;
                }

                var ttl = this.getTTL();

                if (this.isDone()) {
                    return ttl * 1000 / 2;
                }

                var autoCancel = this.getAutoCancel() || Infinity;
                return Math.min(ttl, autoCancel) * 1000 / 2;
            },

            startKeepAlive: function() {
                //remove/add session observers to start/stop the keep alive poller based on UI session
                this.stopPolling();
                Session.on('timeout', this.stopKeepAlive, this);
                Session.on('start', this.startKeepAlive, this);
                
                this.stopKeepAlive(); //ensure you never create more than one keep alive poller

                var initialInterval = this._getKeepAliveInterval();
                if (!_.isFinite(initialInterval)) {
                    console.log('Non-finite keep alive interval (will not ping touch job)');
                    return;
                }

                var isDone = this.isDone();
                this.keepAlivePoller = new Ticker({
                    interval: initialInterval
                });

                this.keepAlivePoller.on('tick', function() {
                    this.touch({
                        success: function() {
                            console.log('touched job:', this.id);
                            // If the job has finished since the last tick, get a (possibly) new
                            // tick interval
                            if (!isDone && this.isDone()) {
                                isDone = true;
                                var newInterval = this._getKeepAliveInterval();
                                if (newInterval !== this.keepAlivePoller.interval) {
                                    if (!_.isFinite(newInterval)) {
                                        console.log('Non-finite keep alive interval (stopping keep alive)');
                                        this.stopKeepAlive();
                                    } else {
                                        this.keepAlivePoller.restart({
                                            interval: newInterval
                                        });
                                    }
                                }
                            }
                        }.bind(this),
                        error: function(controlModel, response) {
                            if (response.hasOwnProperty('status') &&
                                (response.status === 0 || response.status === 12029)) {
                                return;
                            }
                            console.log('error touching job (stopping keep alive):', this.id);
                            this.stopKeepAlive();
                        }.bind(this)
                    });
                }, this);
                this.keepAlivePoller.start();
            },
            
            stopKeepAlive: function() {
                if (this.keepAlivePoller) {
                    this.keepAlivePoller.stop();
                    this.keepAlivePoller.off();
                }
            },
            
            startPolling: function(force) {
                if (!this._poll || force) {
                    this._poll = true;
                    
                    //remove/add session observers to start/stop the job poller based on UI session
                    Session.off('timeout', null, this);
                    Session.off('start', null, this);
                    Session.on('timeout', this.stopPolling, this);
                    Session.on('start', function() {
                        this.startPolling(true);//force a new update from the server
                    }, this);
                    
                    if (force || (!this.isDone() && !this.entry.content.get('isFailed'))) {
                        this.ticker.start(true);
                        this.trigger("startPolling");
                    }
                }
            },
            
            stopPolling: function() {
                if (this._poll) {
                    this._poll = false;
                    Session.off('timeout', null, this);
                    Session.off('start', null, this);
                    this.ticker.stop();
                    this.aggressivePollingDelay = this.options.aggressiveDelay || SearchJob.JOB_MIN_POLLING_INTERVAL;
                    console.log("stopPolling has been triggered.");
                }
            },
            
            noParamControlUpdate: function(action, options) {
                if(options && options.data) {
                    delete options.data;
                }
                return this.control.save({}, $.extend(true, options, { data: { action: action } }));                
            },

            pause: function(options) {
                return this.noParamControlUpdate("pause", options);
            },

            unpause: function(options) {
                return this.noParamControlUpdate("unpause", options);
            },

            finalize: function(options) {
                return this.noParamControlUpdate("finalize", options);
            },
            
            cancel: function(options) {
                return this.noParamControlUpdate("cancel", options);
            },
            
            touch: function(options) {
                return this.noParamControlUpdate("touch", options);
            },

            share: function(options) {
                var isRealTime = this.entry.content.get("isRealTimeSearch"),
                    controlDeferred,
                    shareDeferred = $.Deferred();

                //do the work of sharing the job
                if (isRealTime) {
                    controlDeferred = this.saveJob({
                        data: {
                            auto_cancel: SearchJob.DEFAULT_AUTO_CANCEL
                        }
                    });
                } else {
                    //if the job is not realtime then we use the job endpoint's inherent clear of auto_pause and auto_cancel
                    controlDeferred = this.saveJob();
                }

                var aclDeferred =  this.makeWorldReadable();

                $.when(controlDeferred, aclDeferred)
                    .always(function() {
                        $.when(this.fetch(options))
                            .done(function() {
                                shareDeferred.resolve();
                            })
                            .fail(function() {
                                shareDeferred.reject();
                            });
                    }.bind(this));
                return shareDeferred;
            },

            sendToBackground: function(options) {
                var shouldEmail = this.get("email") || "",
                    email_subject = this.get("subject") || "",
                    email_list = this.get("addresses") || "",
                    perms = this.entry.acl.permsToObj(),
                    read = perms.read,
                    everyoneRead = _.indexOf(read, "*") != -1,
                    individualOpts = _.extend({}, options, {success: null}),
                    saveDeferred,
                    readDeferred,
                    backgroundDeferred = $.Deferred();

                if (shouldEmail) {
                    saveDeferred = this.saveJob(
                        $.extend(true, {}, {
                            data: {
                                email_list: email_list,
                                email_subject: email_subject
                            }
                        }, individualOpts)
                    );
                } else {
                    saveDeferred = this.saveJob(individualOpts);
                }
                if (!everyoneRead) {
                    readDeferred = this.makeWorldReadable(individualOpts);
                }

                $.when(saveDeferred, readDeferred)
                    .done(function() {
                        $.when(this.saveIsBackground(individualOpts), this.disablePreview(individualOpts))
                            .done(function() {
                                $.when(this.fetch(options))
                                    .done(function() {
                                        backgroundDeferred.resolve();
                                    })
                                    .fail(function() {
                                        backgroundDeferred.reject();
                                    });
                            }.bind(this))
                            .fail(function() {
                                backgroundDeferred.reject();
                            });
                    }.bind(this))
                    .fail(function() {
                        backgroundDeferred.reject();
                    });
                return backgroundDeferred;
            },
            
            setTTL: function(ttl, options) {
                if(options && options.data) {
                    delete options.data;
                }
                return this.control.save({}, $.extend(true, options, { data: { action: 'setttl', ttl: ttl} }));
            },

            getTTL: function() {
                return this.entry.content.get('ttl');
            },

            getAutoCancel: function() {
                var autoCancel = this.entry.content.runtime.get('auto_cancel');
                return autoCancel && parseInt(autoCancel, 10);
            },
            
            setPriority: function(priority, options) {
                if(options && options.data) {
                    delete options.data;
                }
                return this.control.save({}, $.extend(true, options, { data: { action: 'setpriority', priority: priority} } ));
            },
            
            enablePreview: function(options) {
                return this.noParamControlUpdate("enablepreview", options);
            },
            
            disablePreview: function(options) {
                return this.noParamControlUpdate("disablepreview", options);
            },
            
            setPreview: function(preview, options) {
                var currentPreview = this.entry.content.get('isPreviewEnabled');
                if (preview !== currentPreview) {
                    if (preview) {
                        return this.enablePreview(options);
                    }
                    return this.disablePreview(options);
                }
                if (options && options.success && _.isFunction(options.success)) {
                    options.success(this, {}, options);
                }
                return $.Deferred().resolve();
            },
            
            saveControlUpdate: function(action, options) {
                options = options || {};
                options.data = options.data || {};
                var clonedOptions = $.extend(true, {}, options),
                    data = {
                    action: action,
                    auto_cancel: clonedOptions.data.auto_cancel,
                    auto_pause: clonedOptions.data.auto_pause,
                    email_list: clonedOptions.data.email_list,
                    email_subject: clonedOptions.data.email_subject,
                    email_results: clonedOptions.data.email_results,
                    ttl: clonedOptions.data.ttl
                }; 
                
                if(clonedOptions && clonedOptions.data) {
                    delete clonedOptions.data;
                }
                
                return this.control.save({}, $.extend(true, clonedOptions, {data: data}));               
            },
            
            saveJob: function(options) {                
                return this.saveControlUpdate("save", options);
            },
            
            unsaveJob: function(options) {
                return this.saveControlUpdate("unsave", options);
            },
            
            makeWorldReadable: function(options) {
                var clonedOptions = $.extend(true, {}, options),
                    owner = this.entry.acl.get("owner"),
                    data = {
                        sharing: splunkd_utils.GLOBAL,
                        owner: this.entry.acl.get("owner"),
                        'perms.read': "*"                
                    };
                
                if (clonedOptions && clonedOptions.data) {
                    delete clonedOptions.data;
                }
                
                return this.acl.save({}, $.extend(true, clonedOptions, { data: data }));                
            },
            
            undoWorldReadable: function(options) {
                var owner = this.entry.acl.get("owner"),
                    data = {
                        sharing: splunkd_utils.GLOBAL,
                        owner: owner,
                        'perms.read': ""              
                    };
                
                if (options && options.data) {
                    delete options.data;
                }
                
                return this.acl.save({}, $.extend(true, options, { data: data }));                
            },
            
            isSharedAccordingToTTL: function(defaultSaveTTL) {
                var perms = this.entry.acl.permsToObj();
                if ((perms.read.indexOf("*") != -1) && (this.getTTL() === defaultSaveTTL)) {
                    return true;
                }
                return false;
            },
            
            saveIsBackground: function(options) {
                this.entry.content.custom.set("isBackground", "1");
                return this.save({}, options);
            },
            
            isBackground: function() {
                return this.entry.content.custom && splunkUtil.normalizeBoolean(this.entry.content.custom.get("isBackground"));
            },
            
            resultCountSafe: function() {
                return (this.entry.content.get('isPreviewEnabled') && !this.isDone()) ? this.entry.content.get('resultPreviewCount') : this.entry.content.get('resultCount');
            },
            
            eventAvailableCountSafe: function() {
                return (this.entry.content.get('statusBuckets') == 0) ? this.resultCountSafe() : this.entry.content.get('eventAvailableCount');
            },


            // a job can be dispatched without a latest time, in which case return the published time
            latestTimeSafe: function() {
                var entry = this.entry;
                return entry.content.get('latestTime') || entry.get('published');
            },
            
            isQueued: function() {
                return this.checkUppercaseValue('dispatchState', JobModel.QUEUED);
            },
            
            isParsing: function() {
                return this.checkUppercaseValue('dispatchState', JobModel.PARSING);
            },
            
            isFinalizing: function() {
                return this.checkUppercaseValue('dispatchState', JobModel.FINALIZING);
            },
            
            isFinalized: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('isFinalized'));
            },
            
            isPaused: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('isPaused'));
            },

            isDone: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('isDone'));
            },
            
            isPreparing: function() {
                return this.isQueued() || this.isParsing();
            },
            
            isRunning: function() {
                return !this.isNew() && !this.entry.content.get('isPaused') && !this.isDone() && !this.isPreparing() && !this.isFinalizing();
            },
            
            isReportSearch: function() {
                return (this.entry.content.get('reportSearch') ? true : false);
            },

            /**
             * Function to check if the search is an event search.
             * @returns {boolean}
             */
            isEventSearch: function() {
                return (this.entry.content.get('eventSearch') ? true : false);
            },

            /**
             * Function to check if search will rerun when exporting results
             * @returns {boolean}
             */
            searchWillReRun: function(maxResults) {
                maxResults = maxResults || 0;
                var eventIsTruncated = this.entry.content.get('eventIsTruncated'),
                    eventAvailableCount = this.entry.content.get('eventAvailableCount'),
                    isRemoteTimeline  = this.entry.content.get('isRemoteTimeline');

                if (!this.isReportSearch() && 
                    ((eventIsTruncated && (maxResults === 0 || maxResults > eventAvailableCount)) ||
                    isRemoteTimeline || 
                    !this.isDone())) {
                    return true;
                }
                return false;
            },

            /**
             * Function to determine if the search is an uneventful report search.
             * @returns {boolean}
             */
            isUneventfulReportSearch: function() {
                return (this.isReportSearch() && (!this.isEventSearch() || (this.getAdhocSearchMode() !== splunkd_utils.VERBOSE)));
            },

            isPatternable: function() {
                var eventCount = this.entry.content.get('eventCount');
                return this.prepared && !this.isFailed() && !this.isRealtime() &&
                    (!this.isUneventfulReportSearch() &&
                        ((eventCount >= 10000) || (this.isDone() && eventCount > 0)));
            },

            // returns true if the job was dispatched over all time, returns false for all-time real-time
            isOverAllTime: function() {
                var dispatchEarliestTime = this.getDispatchEarliestTime();
                return ((!dispatchEarliestTime || dispatchEarliestTime === '0') && !this.getDispatchLatestTime());
            },

            isRealtime: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('isRealTimeSearch'));
            },

            isFailed: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('isFailed'));
            },
            
            isUsingSampling: function() {
                return this.entry.content.get('sampleRatio') > '1';
            },

            isRealtimeRequest: function() {
                var earliest = this.entry.content.request.get('earliest_time'),
                    latest = this.entry.content.request.get('latest_time');
                return time_utils.isRealtime(earliest) || time_utils.isRealtime(latest);
            },

            /**
             * Function return true if timeline_events_preview is set to true in limits.conf 
             * If it returns true, preview events (if any) will be available on the search page events viewer
             * @returns {boolean}
             */
            isEventsPreviewEnabled: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('isEventsPreviewEnabled'));
            },

            /**
             * Function to check if timeline information is available.
             * @returns {boolean}
             */
            isTimelineAvailable: function() {
                return (this.entry.content.get('statusBuckets') > 0 &&
                    !this.isFailed() &&
                    _.has(this.entry.links.attributes, 'timeline'));
            },

            /**
             * Function to check if summary information is available.
             * @returns {boolean}
             */
            isSummaryAvailable: function() {
               return (this.entry.content.get('statusBuckets') > 0 &&
                   !this.isFailed() &&
                   this.entry.content.get('eventFieldCount') > 0 &&
                   _.has(this.entry.links.attributes, 'summary'));
            },

            /**
             * Function to get all the search.log and search.log.#.
             * @returns {Array}
             */
            getAvailableSearchLogs: function() {
                var searchLogs = [];
                _.each(this.entry.links.attributes, function(val, link) {
                    if (link.indexOf('search.log') !== -1) {
                        searchLogs.push(link);
                    }
                });
                return searchLogs;
            },

            checkUppercaseValue: function(key, uc_value) {
                var value = this.entry.content.get(key);
                if (!value) {
                    return false;
                }
                return (value.toUpperCase() === uc_value);
            },

            getMessages: function() {
                return splunkd_utils.parseMessagesObject(this.entry.content.get('messages'));
            },
            
            /**
            * If there is a message of type riskycommand in the Job's root error model then
            * then an array of the risky commands are returned, other wise and empty array.
            *
            * @return {array}
            */
            getRiskyCommands: function() {
                var messages = this.error.get('messages'),
                    riskyCommandMessage = _.findWhere(messages, {type: splunkd_utils.RISKY_COMMAND});
                    
                //TODO: Currently the error message is "Found potentially risky commands:<space seporated list of commands> "
                // The error response also has a RiskyCommands object that is just the space seporated list of command.
                // It would be better if the creation of the error message object supported the RiskyCommands
                return riskyCommandMessage ? riskyCommandMessage.text.split(':')[1].trim().split(' ') : [];
            },
            
            getDispatchEarliestTime: function() {
                var earliest = this.entry.content.request.get('earliest_time');
                if (earliest === void(0)) {
                    return this.entry.content.get('searchEarliestTime');
                }
                return earliest;
            },
            
            getDispatchEarliestTimeOrAllTime: function() {
                // SPL-110540: When a job for real-time alert is done, its isRealTimeSearch property becomes false. 
                // We have to check time range in request to see if it was a real-time search or not. This
                // will distingush it from a job for schedulded report.
                if (this.entry.content.get('delegate') === 'scheduler' && 
                    this.isRealtimeRequest() &&
                    this.entry.content.get('searchLatestTime') !== void(0)) {
                    // windowed rt or all time rt alerts
                    return this.entry.content.get('searchEarliestTime') || '';
                } else {
                    return this.entry.content.request.get('earliest_time') || '';
                }
            },
            
            getDispatchLatestTime: function() {
                var latest = this.entry.content.request.get('latest_time');
                if (latest === void(0)) {
                    return this.entry.content.get('searchLatestTime');
                }
                return latest;
            },
            
            getDispatchLatestTimeOrAllTime: function() {
                var searchLatestTime = this.entry.content.get('searchLatestTime');
                if (this.entry.content.get('delegate') === 'scheduler' &&
                     this.isRealtimeRequest() &&
                     searchLatestTime !== void(0)) {
                    return searchLatestTime;
                } else {
                    return this.entry.content.request.get('latest_time') || '';
                }
            },
            
            getStrippedEventSearch: function() {
                var search = this.entry.content.get('eventSearch');
                if (search) {
                    search = splunkUtil.stripLeadingSearchCommand(search);
                }
                return search;
            },
            
            getSearch: function() {
                var search = this.entry.get('name');
                if (!search) {
                    return this.entry.content.request.get('search');
                }
                return search;
            },
            
            getSavedSearchId: function() {
                var isSavedSearch = this.entry.content.get('isSavedSearch'),
                    label = this.entry.content.get('label'),
                    savedSearchLabel = this.entry.content.get('savedSearchLabel'),
                    appAndOwner = savedSearchLabel ? JSON.parse(savedSearchLabel) : undefined;
                
                if (label && isSavedSearch && appAndOwner) {
                    return SavedSearch.buildId(label, appAndOwner.app, appAndOwner.owner, appAndOwner.sharing);
                }
                return '';
            },
            
            getExpirationString: function() {                
                var ttl = this.entry.content.get('ttl'),
                    updated;
                                
                if (!ttl || (ttl < 0)) {
                    return _('Expired').t();
                }
                
                updated = time_utils.isoToDateObject(this.get('updated'));
                updated.setSeconds(updated.getSeconds() + ttl); 
                return i18n.format_datetime(time_utils.jsDateToSplunkDateTimeWithMicroseconds(updated));
            },
            
            getCreatedString: function() {                
                var published = this.entry.get('published'),
                    publishedDate = time_utils.isoToDateObject(published);
                
                return published ? i18n.format_datetime(time_utils.jsDateToSplunkDateTimeWithMicroseconds(publishedDate)) : '';
            },
            
            getSizeString: function() {
                return _.isUndefined(this.entry.content.get('diskUsage')) ? '' : format_numbers_utils.bytesToFileSize(this.entry.content.get('diskUsage'));
            },
            
            getAdhocSearchMode: function() {
                return this.entry.content.request.get('adhoc_search_level') || splunkd_utils.FAST;
            },

            getSampleRatio: function() {
                var sampleRatio = this.entry.content.get('sampleRatio');
                if (!sampleRatio) {
                    return this.entry.content.request.get('sample_ratio');
                }
                return sampleRatio;
            },
            
            canBePausedOnRemove: function() {
                if (!this.isNew() &&
                        (!this.isDone() && !this.get("cannotPauseOnRemove")) &&
                        !this.entry.content.get("isPaused") &&
                        !this.isBackground() && 
                        !this.entry.content.get("isSaved")) {
                    return true;
                }
                return false;
            },
            
            canSummarize: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('canSummarize'));
            },
            
            searchCanBeEventType: function() {
                return splunkUtil.normalizeBoolean(this.entry.content.get('searchCanBeEventType'));
            },

            deepOff: function () {
                SearchJob.prototype.deepOff.apply(this, arguments);
                Session.off(null, null, this);
            }
        },
        {
            RESULTS_PREVIEW: "results_preview",
            SUMMARY: "summary",
            TIMELINE: "timeline",
            EVENTS: "events",
            RESULTS: "results",
            createMetaDataSearch: function(search, deferred, applicationModel, delay, options) {
                options = options || {};
                _.defaults(options, {
                    preview: 'true',
                    earliest_time: 'rt',
                    latest_time: 'rt',
                    auto_cancel: SearchJob.DEFAULT_AUTO_CANCEL,
                    max_count: 100000
                });
                
                var job = new JobModel({}, {delay: delay || SearchJob.DEFAULT_METADATA_POLLING_INTERVAL}),
                    saveData = {
                        app: applicationModel.get("app"),
                        owner: applicationModel.get("owner"),
                        search: search,
                        preview: options.preview,
                        earliest_time: options.earliest_time,
                        latest_time: options.latest_time,
                        auto_cancel: options.auto_cancel,
                        max_count: options.max_count
                    };
                
                $.extend(true, saveData, options.data);
                
                job.save({}, {
                    data: saveData,
                    success: function(model, response) {
                        deferred.resolve();
                    },
                    error: function(model, response) {
                        deferred.resolve();
                    }
                });
                
                return job;
            },
            registerArtifactModel: function(artifactModel, job, linkKey) {
                ArtifactFetchManager.registerArtifactModel(artifactModel, job, linkKey);
            },
            unregisterArtifactModel: function(artifactModel, job) {
                ArtifactFetchManager.unregisterArtifactModel(artifactModel, job);
            }
        });
        
        return JobModel;
    }
);
