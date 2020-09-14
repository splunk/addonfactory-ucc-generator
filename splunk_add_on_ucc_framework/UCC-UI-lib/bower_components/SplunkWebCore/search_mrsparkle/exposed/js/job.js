/**
 * Jobs begin their life with a search.
 * When dispatched, they have a searchId as well.
 * When running, they have a number of other properties available through the getters.
 * Job objects will be passed along with the jobProgress and jobDone events that
 * JobPoller fires.
 *
 * @triggers updateJobStatus
 * @triggers jobCanceled
 */
Splunk.Job = $.klass({

    _isDone        : 0,
    _isCanceled    : false,
    _isPaused      : false,
    _isFinalized   : false,
    _isSaved       : false,
    _isZombie	   : false,
    _isPreviewEnabled : false,
    _isRealTimeSearch: false,
    _canBeAutoCancelled: false,

    _eventCount          : 0,
    _resultCount         : 0,
    _resultPreviewCount  : 0,
    _scanCount           : 0,
    _eventAvailableCount : 0,
    _doneProgress        : 0,
    _eventIsStreaming    : 1,
    _cursorTime          : false,
    _sid                 : null,  // _sid needs to remain 'null' in order to match the job model in ActionScript, etc.
    _createTime          : false,
    _search              : "",
    _eventSearch: false,
    
    _lastProgressEvent: 0,

    logger               : Splunk.Logger.getLogger("job.js"),


    initialize: function(search) {
        if (search) {
            this._search = search;
        } else {
            this.logger.error("Splunk.Job - Assertion Failed. search string not supplied for Splunk.Job constructor.");
        }
    },

    getSearch: function() {
        return this._search;
    },
    /**
     * gets the 'eventSearch' which is the portion of the search up until the first transforming command.
     * (This value is supplied by the backend and the client does no parsing to obtain it at runtime)
     */
    getEventSearch: function() {
        return this._eventSearch;
    },
    /**
     * When a Job is dispatched, it gains a sid through this public setter.
     */
    setSearchId: function(searchId) {
        if (this._setSearchIdHasBeenCalled) this.logger.error("Splunk.Job Assertion Failed. setSearchId can only be called once.\nold sid=", this._sid, "\nnew sid=", searchId);
        this._sid = searchId;
        this._setSearchIdHasBeenCalled = true;
    },

    setSID: function(sid) {
        return this.setSearchId(sid);
    },

    /////////////////////////////////////////
    // Getter Methods
    /////////////////////////////////////////
    getSearchId:    function() {return this._sid;},

    // Alias for getSearchId
    getSID: function() { return this.getSearchId(); },

    getEventCount:  function() {return this._eventCount;},

    getResultCount: function(checkSearchStatus) {
        // getter function should not contain business logic. 
        // checkSearchStatus is used to force the function to work as a getter
        checkSearchStatus = (typeof checkSearchStatus === "boolean" ) ? checkSearchStatus: true;
        if (checkSearchStatus && this._isPreviewEnabled && !this._isDone && Splunk.util.isInt(this._resultPreviewCount)) {
            return this._resultPreviewCount;
        } else {
            return this._resultCount;
        }
    },

    getScanCount:   function() {return this._scanCount;},
    getEventAvailableCount: function() {
        if (this.getStatusBuckets() == 0) return this.getResultCount();
        return this._eventAvailableCount;
    },
    getEventFieldCount: function() {return this._eventFieldCount;},
    getCursorTime:  function() {return this._cursorTime;},
    getCreateTime:  function() {
        if (!this._createTime) return false;
        var createTime = new Date();
        createTime.setTime(this._createTime * 1000);
        return createTime;
    },
    /**
     * returns a Splunk.TimeRange instance representing the absolute range 
     * that splunkd says the data is from. 
     * eg, Search.getTimeRange() might return a relative or realtime range 
     * but for that same search, Search.Job.getTimeRange() will return the 
     * absolute equivalent at that moment.
     */
    getTimeRange: function() {
        // sometimes this gets called before the poller has populated the properties. 
        if (!this._earliestTime || !this._latestTime) {
            return new Splunk.TimeRange();
        }
        
        var startTime = Splunk.util.getEpochTimeFromISO(this._earliestTime);
        var endTime   = Splunk.util.getEpochTimeFromISO(this._latestTime); 

        // DETAILS: * ad-hoc jobs end up with earliest/latest in ISOtime.  
        //          * Jobs from the scheduler end up with the same in epochTime 
        //              [[ search code for job.toJsonable(timeformat='unix') ]]
        //          * jobs from sid permalinks go through even another code path. 
        //        as soon as you touch any of these to try and make them consistent, 
        //        the ball of mud starts falling apart. 
        //        we need http://jira.splunk.com:8080/browse/SPL-31251
        if (isNaN(startTime)) {
            startTime = this._earliestTime;
            endTime   = this._latestTime;
        } 

        // splunkd has a strange convention of starttime=0 endtime=0 to represent 'all time' 
        // we have to normalize that here or it ends up becoming 1/1/1970 - 1/1/1970 in our code. 
        if (startTime == 0) startTime = null;
        if (endTime   == 0) endTime   = null;
        return new Splunk.TimeRange(startTime, endTime); 
    },
    getEventSorting: function() {return this._eventSorting;},
    getDoneProgress:    function() {
        var doneProgress = this._doneProgress;
        if (doneProgress.toString().indexOf("%") != -1) {
            doneProgress = doneProgress.replace("%","");
        }
        return parseFloat(doneProgress, 10);
    },

    getStatusBuckets: function() {return this._statusBuckets;},
    
    isDone:        function() {return (this._sid) ? this._isDone : false;},
    isCanceled:    function() {return this._isCanceled;},
    isPaused:      function() {return this._isPaused;},
    isFinalized:   function() {return this._isFinalized;},
    isSaved:       function() {return this._isSaved;},
    isZombie:       function() {return this._isZombie;},
    isPreviewable: function() {return this._isPreviewEnabled;},
    isRealTimeSearch: function() {return this._isRealTimeSearch;},
    isQueued:      function() {return this._dispatchState == 'QUEUED';},
    isParsing:     function() {return this._dispatchState == 'PARSING';},  
    isPreparing:   function() {return this.isQueued() || this.isParsing();},
 
    /**
     * If the current job is real-time, returns false so it prevents cancellation of system-scheduled historical jobs.
     * Note: XML onunloadCancelJobs flag trumps.
     */
    canBeAutoCancelled: function() {
        if (this.isRealTimeSearch()) {
            return false;
        }
        return (!this.isSaved() && this._canBeAutoCancelled);
    },

    // isRunning is only true if the job is not done or paused
    isRunning: function() {
        if (this._isDone || this._isPaused || this.isPreparing()) return false;
        return true;
    },

    /**
     * eventIsStreaming is a flag that indicates whether there will be partial events
     * and summaries available while the search is running.
     * If true, there are.
     * if false, there are not, and all clients must wait until the job is done
     * before requesting any data.
     */
    isEventStreaming: function() {return this._eventIsStreaming;},
    /**
     * Returns a boolean indicating whether or not the results endpoint returns
     * transformed results, or if on the other hand it's just going to return
     * the exact same output as the events endpoint.
     * We need this information, because field_list as well as pagination arguments
     * will have different meanings when certain modules can find themselves
     * in both cases.
     */
    areResultsTransformed: function() {
        var key = "_reportSearch";
        return (this.hasOwnProperty(key) && this[key]);
    },

    /**
     * Attempt to cancel the job. True cancelation is dependent on
     * appservers's response.
     *
     * Calls the appserver requesting a job be canceled.  If a response with
     * a property of success is returned then the job's search Id is set to
     * null and the isCanceled flag is set to true.  If it fails a warning is
     * logged.
     *
     * @trigger jobCanceled    passes search id to event
     * @return undefined
     */
    cancel: function(onSuccess, onFailure) {
        if (this.isCanceled()) return false;
        if (this.delegate) {
            var messenger = Splunk.Messenger.System.getInstance(); 
            messenger.send('error', 'splunk.search', _("Splunk is ignoring a request to cancel a scheduled job because it is unsafe to cancel jobs that have been dispatched through an alert."));
            return false;
        }
        this.logger.debug('Canceling job', this._sid, '.');
        var onSuccessOuter = function() {
            this.logger.debug('Canceled job', this._sid, 'successfully.');
            $(document).trigger('jobCanceled', [this._sid]);
            this._sid = null;
            if (onSuccess) onSuccess();
        }.bind(this);
        this._callJobEndpoint('cancel', onSuccessOuter, onFailure);
        this._isCanceled = true;
    },

    /**
     * Pauses a job.
     *
     * Will not attempt to pause the job if the job is already marked as done.
     *
     * @returns undefined if a pause request is made to the server.
     * @returns false if the job's isDone method returns true.
     */
    pause: function(onSuccess, onFailure) {
        if (this.isDone() || this.isPaused()) {
            this.logger.warn("Can't pause job", this._sid, "because it is done or already paused.");
            return false;
        }
        this.logger.debug('Pausing job', this._sid, '.');
        this._callJobEndpoint('pause', onSuccess, onFailure);
        this._isPaused = true;
    },

    /**
     * Unpauses a job.
     *
     * Will not attempt to unpause a finished job or a job that is not paused.
     *
     * @returns undefined if an unpause request is made to the server.
     * @returns false if the job's isDone method returns true or the isPaused method returns false.
     */
    unpause: function(onSuccess, onFailure) {
        if (this.isDone() || !this.isPaused()) {
            this.logger.warn("Can't unpause job", this._sid, "because it is not paused or because it is done.");
            return false;
        }
        this.logger.debug('Unpausing job', this._sid, '.');
        this._callJobEndpoint('unpause', onSuccess, onFailure);
        this._isPaused = false;
    },

    /**
     * Set the time to live.
     * 
     * @returns undefined if an unpause request is made to the server.
     * @returns false if the job's isDone method returns true or the isPaused method returns false.
     */
    setTTL: function(onSuccess, onFailure, ttl) {
        this.logger.debug('Setting ttl', ttl, 'for job', this._sid, '.');
        var options = {data: {ttl: ttl}};
        this._callJobEndpoint('ttl', onSuccess, onFailure, options);
    },

    /**
     * Marks a job previewable or not.
     *
     */
    setPreviewable: function(state) {
        // i dont want to make this more complicated than it needs tobe. 
        // even though _isPreviewEnabled is going to be overwritten on every progress event
        // and thus it's possible that a) the request will fail somehow, and 
        // b) the next progress event we'll get this written back to what it was, 
        // i still think any more intelligence here is unnecessary.
        this._isPreviewEnabled = state;
        this._callJobEndpoint(this._isPreviewEnabled ? 'enablepreview' : 'disablepreview');
    },

    setAsAutoCancellable: function(bool) {
        this._canBeAutoCancelled = bool;
        if (bool && this.isSaved()) {
            this.logger.warn("a job was set as cancellable which should be impossible because this job has been previously saved by the user.");
        }
    },

    /**
     * TODO - this is in need of an audit. 
     * notably real time searches end up returning an ISO time string from 
     * getCreateTime, which is bizarre.
     */
    setCreateTime: function(foo) {
        this._createTime = foo;
    },

    /**
     * used to mark how recently the Job had a progress event fired.
     */
    setLastProgressTime: function() {
        this._lastProgressEvent = new Date();
    },

    /**
     * returns the time in milliseconds since a progress event was fired 
     * for this Job.
     */
    getTimeSinceLastProgress : function() {
        return (new Date() - this._lastProgressEvent);
    },

    /**
     * Finalize a job.
     * If a job is paused, it will unpause it prior to finalizing the job.
     * This is mostly to facilitate UI behavior and may eventually prove to be
     * unhelpful.  Will not attempt to finalize a finished job.
     *
     * @returns undefined if a finalize request to the server is made.
     * @returns false if the job's isDone method returns true.
     */
    finalize: function(onSuccess, onFailure) {
        if (this.isDone() || this.isFinalized()) {
            this.logger.warn("Cannot finalized a job marked as done.");
            return false;
        } else if (this.isPaused()) {
            this.unpause();
        }
        this.logger.debug('Finalizing job', this._sid, '.');
        this._callJobEndpoint('finalize', onSuccess, onFailure);
        this._isFinalized = true;
    },

    /**
     * Touches a job.
     * Re-ups the TTL.  Makes the job feel good.
     * Fires jobStatusChanged if successful.
     */
    touch: function(onSuccess, onFailure) {
       this.logger.debug('Touching job', this._sid, '.');
       this._callJobEndpoint('touch', onSuccess, onFailure);
    },

    /**
     *
     * provides an async interface to refresh the 'can be auto cancelled' state of the job and callback with
     * a boolean indicating whether it is safe to cancel
     *
     */

    refreshCanBeAutoCancelled: function(callback) {
        this.logger.debug('refreshing job can be auto-cancelled', this._sid, '.');
        // if it's a real-time search, or it has already been marked as not auto-cancellable,
        // callback with false immediately
        if(this.isRealTimeSearch() || !this._canBeAutoCancelled) {
            callback(false);
            return;
        }
        // otherwise refresh the job attributes via REST
        var that = this;
        $.ajax({
            type: 'GET',
            url: Splunk.util.make_url('splunkd/services/search/jobs', this._sid),
            data: { output_mode: 'json' },
            dataType: 'json',
            success: function(data) {
                // look up the job's 'isSaved' property and callback with it
                var canBe = !data.entry[0].content.isSaved;
                callback(canBe);
            },
            error: function() {
                // in case of error, fall back to local data
                callback(that.canBeAutoCancelled());
            }
        });
    },

    /**
     * Saves a job. Job can only be deleted by explicitly canceling it.
     * Fires jobStatusChanged if successful.
     */
     save: function(onSuccess, onFailure) {
         this.setAsAutoCancellable(false);
         this.logger.debug('Saving job', this._sid, '.');
         //TODO manually set this for now, to prevent race condition in
         // AbstractModule.js#_fireDispatch where a request to save may
         // not finish before dispatching a new search, causing the previous
         // search to be deleted.
         // We'll still call _callJobEndpoint just for the sake of consistency.
         this._isSaved = true;
         this._callJobEndpoint('save', onSuccess, onFailure);
     },

    /**
     * Unsaves a job. Job can now be autocancelled as well as explicitly cancelled.
     * Fires jobStatusChanged if successful.
     */
     unsave: function(onSuccess, onFailure) {
         this.logger.debug('Unsaving job', this._sid, '.');
         this._isSaved = false;
         this._callJobEndpoint('unsave', onSuccess, onFailure);
     },
     
     /** 
      * SDK does not have any functionality to change ACLs, so i have 
      * had to temporarily put custom 'action' values into controllers/search.py 
      * to handle these two specific cases. 
      * TODO - if/when SDK has support for this, these will have to be revisited.
      */
     makeWorldReadable: function(onSuccess, onFailure) {
         this.logger.debug('making job world readable', this._sid, '.');
         this._callJobEndpoint('makeWorldReadable', onSuccess, onFailure);
     },
     
     /**
      * See above comment on makeWorldReadable()
      */
     undoWorldReadable: function(onSuccess, onFailure) {
         this.logger.debug('making the job no longer world readable', this._sid, '.');
         this._callJobEndpoint('undoWorldReadable', onSuccess, onFailure);
     },

    /**
     * Calls the job/[sid]/control endpoint.
     *
     * @param action Can be ['cancel', 'pause', 'unpause', 'finalize', 'enablepreview', 'disablepreview'].
     * @param onSuccess A function to be run when the call is successful.
     * @param options An object literal of options, see below for specifications:
     *        data {Object} An object literal for adding additional key/value pairs to send in the request body,
     *        (ie., {data: {foo: 'bar', skid: 'row'}}) Note: Proper url encoding is handled by jQuery.
     * @returns undefined
     */
    _callJobEndpoint: function(action, onSuccess, onFailure, options) {
        options = options || {};
        if (!action) {
            throw new Error("Cannot call the job endpoint without an action");
        }
        if (!this._sid) {
            throw new Error("Cannot call the job endpoint if we dont have an sid yet");
        }
        var optionsData = options.data || {};
        var data = $.extend({ 'action': action, 'wait': 0 }, optionsData);
        var ajaxOptions = {
            'type': 'POST',
            'url': Splunk.util.make_url('api/search/jobs', this._sid, 'control'),
            'data': data,
            'dataType': 'json',

            'success': function(data) {
                    try {
                        if (data["success"]) {
                            this.logger.info('Called', action, 'on job', this._sid, 'successfully.');
                            $(document).trigger('jobStatusChanged', [this._sid, action]);
                            if (onSuccess) onSuccess();
                            return true;
                        } else {
                            this.logger.info('no success in the data');
                            if (onFailure) onFailure();
                        }
                    }
                    catch(error) {
                        this.logger.error('error encountered in Job._callJobEndpoint for action=', action, ' error=', error);
                        if (onFailure) onFailure();
                    }
                    if (data.messages && data.messages.length > 0) {
                        var messenger = Splunk.Messenger.System.getInstance();
                        for (var i=0, len=data.messages.length; i<len; i++) {
                            var level = data.messages[i].type.toLowerCase();
                            var text  = data.messages[i].message;
                            if (level == "error" || level == "fatal") {
                                messenger.send(level, "splunk.search", text);
                            }
                        }
                    }
                    this.logger.warn('Could not call', action, 'on job', this._sid);
                }.bind(this),

            'error': function(xhr, status, error) {
                if (onFailure) onFailure(xhr, status, error, action);
            }
        };
        $.ajax(ajaxOptions);
    },

    updateByTicketValues: function(ticket) {
        var requiredKeys = ['isDone', 'eventCount', 'resultCount', 'scanCount', 'eventAvailableCount', 'eventFieldCount', 'doneProgress'];
        for (var i=0,l=requiredKeys.length; i<l; i++) {
            if (!ticket.hasOwnProperty(requiredKeys[i]))
                this.logger.error("Failed to get required job property=" + requiredKeys[i] + ' for sid=' + this._sid);
        }
        // now just loop over them.  If there are other keys besides the required ones, that's fine.
        for (var key in ticket) {
            if (!ticket.hasOwnProperty(key)) continue;
            this["_" + key] = ticket[key];
        }
    }
});

Splunk.Job.BATCH_ACTION_ENDPOINT = 'api/search/jobs/control';
/**
 * @param options An object literal of options, see below for specifications:
 *        data {Object} An object literal for adding additional key/value pairs to send in the request body,
 *        (ie., {data: {foo: 'bar', skid: 'row'}}) Note: Proper url encoding is handled by jQuery.
 */
Splunk.Job.batchAction = function(sids, action, callback, options) {
    if (!sids || !action) throw new Exception("SIDs and an action must be provided to call a batchAction.");
    options = options || {};
    var url = Splunk.util.make_url(Splunk.Job.BATCH_ACTION_ENDPOINT);
    var params = {
        sid: sids, //singular because jQuery translates an array into sid=123&sid=456, etc.
        action: action
    };
    var optionsData = options.data || {};
    var data = $.extend(params, optionsData);
    callback = callback || function() {};
    $.post(url, data, callback);
};

/**
 * Attempts to safely build a job object from an SID.
 *
 * If the Jobber has a ticket for the sid and the ticket has no reference to a job object,
 * a new job object is created and passed to onSuccess.
 *
 * If the Jobber has a ticket for the sid and that ticket has a reference to a job object,
 * the reference is passed to onSuccess.
 *
 * If the Jobber has not updated its ticketManifest onSuccess is only called after
 * Jobber triggers jobberTicketsRefreshed.
 *
 * If the Jobber cannot find any ticket related to the sid, onFailure is called.
 *
 * @param sid String A string representation of an sid.
 * @param onSuccess A callback called when a valid job can be constructed.
 *                  Takes one parameter, the successfully constructed job.
 * @param onFailure A callback called when a valid job cannot be constructed.
 * @returns undefined
 */
Splunk.Job.buildJobFromSID = function(sid, onSuccess, onFailure) {
    var logger = Splunk.Logger.getLogger('job.js');
    var jobber = Splunk.Globals['Jobber'];
    if (!jobber) {
        logger.warn('Cannot find Splunk.Jobber.');
        onFailure();
        return;
    }

    // HACK HACK!
    // TODO this trick should not be used.
    // Nick and I are working out a better method to handle
    // resurrection / reinitializing jobs.
    var safelyBuildJob = function() {
        var job = jobber.getJob(sid);
        if (job) {
            onSuccess(job);
        } else {
            onFailure();
        }
    };

    if (jobber.hasJob(sid)) return safelyBuildJob();

    $(document).one('jobberTicketsRefreshed', safelyBuildJob);
    $(document).trigger('jobDispatched', [jobber.buildJob(sid)]);
};


/**
 * JobArray object; stores job objects in an array-like object.
 * Provides a convenient interface to batchActions.
 *
 * Idea from:
 * http://dean.edwards.name/weblog/2006/11/hooray/#comment65848
 *
 * @returns {JobArray}
 */
Splunk.JobArray = function() {
    var a = Array.prototype.slice.call(arguments);
    a.constructor = Splunk.JobArray;
    for (var i in Splunk.JobArray.prototype) {
        if (!Object.prototype[i]) a[i] = Splunk.JobArray.prototype[i];
    }
    return a;
};

/**
 * Similar to Array.slice except it returns a new JobArray.
 *
 * @returns {JobArray}
 */
Splunk.JobArray.prototype.slice = function(start, end) {
    return Splunk.JobArray.apply(null, Array.prototype.slice.call(this, start, end));
};

/**
 * Similar to Array.concat except it returns a new JobArray.
 *
 * @returns {JobArray}
 */
Splunk.JobArray.prototype.concat = function() {
    return Splunk.JobArray.apply(null, Array.prototype.concat.apply(this, arguments));
};

/**
 * Returns a new JobArray based on a JobArray that has been filtered using a callback.
 * The callback accepts one argument, a job object, and must only return true or false.
 * If the callback returns true the job is added to the filtered array, if false the
 * job is not added to the filtered JobArray.
 *
 * @param callback {Function}
 * @returns {JobArray}
 */
Splunk.JobArray.prototype.filter = function(callback) {
    callback = callback || function(job) { if (job) return true; };
    var a = new Splunk.JobArray;
    for (var i=0, j=this.length; i<j; i++) {
        if (callback(this[i])) a.push(this[i]);
    }
    return a;
};

/**
 * List of actions that can be performed on a batch of jobs.
 */
Splunk.JobArray.prototype.JOB_ACTIONS = [
    'cancel',
    'pause',
    'unpause',
    'finalize'
];

/**
 * Sets the ttl on a job(s).
 * @param callback {Function} callback passed into Splunk.Job.batchAction
 * @param ttl {Number} The time to live in seconds.
 */
Splunk.JobArray.prototype.setTTL = function(callback, ttl) {
    this._callAction('ttl', callback, {data: {ttl: ttl}});
};

/**
 * Internal function for calling the jobs batchAction endpoint.
 * This method should generally not be called directly.
 *
 * @param action {String} name of action to call on batchAction.
 * @param callback {Function} callback passed into Splunk.Job.batchAction
 * @param options {Object} Options to pass to batchActions, see this method for details.
 */
Splunk.JobArray.prototype._callAction = function(action, callback, options) {
    options = options || {};
    var sids = [];
    for (var i=0, j=this.length; i<j; i++) {
        if (this[i].getSearchId()) sids.push(this[i].getSearchId());
    }

    if (sids.length > 0) return Splunk.Job.batchAction(sids, action, callback, options);
    return false;
};

/**
 * Dynamically add the action methods to the JobArray Object.
 */
Splunk.JobArray.prototype._generateActionMethod = function(action) {
    this[action] = function(callback) {
        return this._callAction(action, callback);
    };
};

for (var i=0, j=Splunk.JobArray.prototype.JOB_ACTIONS.length; i<j; i++) {
    Splunk.JobArray.prototype._generateActionMethod(Splunk.JobArray.prototype.JOB_ACTIONS[i]);
}
