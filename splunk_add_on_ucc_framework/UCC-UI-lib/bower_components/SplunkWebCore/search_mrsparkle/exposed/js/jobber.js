Splunk.Jobber = $.klass({

    /**
     * Define status poller interval parameters (ms); 
     * -- see Splunk.util.getRetryInterval()
     * -- the mix/max are wait times after a callback has fired
     */
    MIN_POLLER_INTERVAL: 250,
    LONG_RUNNING_POLLER_INTERVAL: 1500,
    MAX_POLLER_INTERVAL: 30000,
    POLLER_CLAMP_TIME: 1000,
    PENALIZE_POLLER_INCREMENT: 500,
    PENALIZE_POLLER_MULTIPLIER: 1.25,
    /**
     * The time in ms to continuously poll in order to keep jobs alive.
     */
    KEEP_ALIVE_INTERVAL: 60000,
   
    /**
     * URI for job management
     */
    JOB_MGMT_ENDPOINT: Splunk.util.make_url('api/search/jobs'),

    /**
     * URI for batch job control
     */
    BATCH_EDIT_ENDPOINT: Splunk.util.make_url('api/search/jobs/control'),
   
    /**
     * Time to live in hours if ui inactivity timeout occurs.
     */
    UI_INACTIVITY_TIMEOUT_TTL_HOURS: 24,

    /**
     * Initializes jobber.  Kicks off polling unless Splunk._testHarnessMode == true;
     */
    initialize: function() {

        // Hold a list of all the jobs, indexed by sid.
        this._jobManifest = {};
       
        // Used in HTTP caching via AJAX and the etag header.
        this._jobManifestHash = '';

        // Holds the timer object for looping the poller.
        this._pollTimer = null;

        // Holds the poller for keeping jobs propped open.
        this._keepAlivePoller = null;
       
        // Used for determining the latency and optimizing the connection.
        this._pollCount = 0;
        this._latencyHistory = [];
        this._getStatusStartTime = 0;
       
        // For use in determining if the appserver or splunkd may have gone down.
        this._timedOutPollCount = 0;
       
        // stores the start time of the beginning of a dispatch request; used
        // for polling interval shaping
        this._lastActiveStartTime = null;
       
        // Allows current requests to finish but does not allow the request loop to continue if set to true;
        this._stopPolling = false;

        // Flag for preventing multiple requests while one is already in flight.
        this._isGettingStatus = false;

        // Flag for identifying whether or not the jobber has fully refreshed its ticketManifest.
        // This is useful because there is no reliable programmatic way to test whether
        // or not the jobber has attempted a _getStatus call.  If it has, other
        // dependent code (eg resurrection) can proceed.  If it hasn't presumably
        // the code will hook into the jobberTicketsRefreshed event and proceed when
        // possible.
        this.ticketsLoaded = false;
       
        // Interval at which to poll
        this.refreshInterval = null;
        
        // Targeted polling interval.
        this.targetInterval = this.LONG_RUNNING_POLLER_INTERVAL;

        //this.logger = Splunk.Logger.getLogger("jobber.js", Splunk.Logger.mode.None);
        this.logger = Splunk.Logger.getLogger("jobber.js");
        this.messenger = Splunk.Messenger.System.getInstance();
       
        // TODO - review the rest of our events, and see if we can turn them inside out too.
        $(document).bind('jobDispatched.Jobber', this._receiveJob.bind(this));
        $(document).bind('jobResurrected.Jobber',this._receiveJob.bind(this));

        // Jobber must handle cancel and unpause job events by hand.
        $(document).bind('jobStatusChanged.Jobber', this._onJobStatusChange.bind(this));

        // _clearedForPolling is a flag that allows us to queue jobs up before
        // beginning to poll.  This is important when the Jobber is used in
        // concert with the session.js class and the module_loader.js class
        // together.  Explicitly calling start() will also clear the Jobber for
        // polling.
        this._clearedForPolling = false;

        // Listen to the global Splunk.Session to handle start and stop polling
        $(document).bind('SessionStart.Jobber', function() {
            if (this.isClearedForPolling()) this.start();
        }.bind(this));

        $(document).bind('SessionTimeout.Jobber', function() {
            this.logger.info('Stopping Jobber polling...');
            this.stop();
            //Set the TTL for all jobs so they are re-usable if needed.
            this.listJobs(function(job){
                return (job.canBeAutoCancelled());
            }).setTTL(function(){}, this.UI_INACTIVITY_TIMEOUT_TTL_HOURS * 3600);
        }.bind(this));
    },

    /**
     * Unbinds all of the events created by Jobber.
     * Note that if there are multiple Jobbers, this call would unbind
     * all the events on all of the Jobbers, not just on the instantiated
     * Jobber.  This may or may not be an issue.
     */
    destroy: function() {
        $(document).unbind('.Jobber');
    },
   
    /////////////////////////////////////////
    // Methods/Properties for Job Management
    /////////////////////////////////////////

    /**
     * When a jobDispatched or jobResurrected event is broadcast,
     * this method is invoked and passed the job, allowing Jobber
     * to begin polling on it.
     */
    _receiveJob: function(event, job) {
        var sid = job.getSID();
        if (!sid)
            throw _("Jobber can only poll on search jobs that have been dispatched (jobs with SIDs).");

        // The previous assumption with the ticket system was that
        // regardless of whether or not the jobber had the ticket
        // for an SID, the one received by this method has priority
        // and replaces the currently stored one. This duplicates
        // that behavior.
        this.addJob(job);

        if (!this.isClearedForPolling()) {
            this.logger.info(_(sprintf("Received job with an sid of %(sid)s, but can't poll yet because Jobber isn't cleared for polling.", {sid: job.getSearchId()})));
            return;
        }

        // If the job is marked as done we don't poll on it.
        // We assume that the user had enough info to mark it done,
        // they've probably properly reconstructed it.
        if (job.isDone()) {
            $(document).trigger('jobProgress', [job]);
            $(document).trigger('jobDone', [job]);
            return; // job is done, no need to refresh the ticket
        }

        // ensure the poller polls quickly
        this._lastActiveStartTime = new Date();
        this.refresh();
    },
   
    /**
     * Handle a job status update prior to receiving a finalized report from
     * the appserver.  This SHOULD NOT ever fire events like jobFinalized.
     * Those events should be triggered only when the client receives a
     * polling response which contains a flag like isFinalized: 1.
     *
     * @param sid {string} sid of the job calling updateJobStatus
     * @param status {string} status which originally triggered the
     *             updateJobStatus event. Can be [pause, unpause, finalize, cancel]
     */
    _onJobStatusChange: function(event, sid, status) {
        this.logger.info('Splunk.Jobber: received sid status update:', sid, ',', status);
        if (this.hasJob(sid)) {
            if (status == 'unpause') {
                this._lastActiveStartTime = new Date();
            }
            else if (status == 'cancel') {
                if (!this.removeJob(sid)) {
                    this.logger.warn('Splunk.Jobber: when trying to cancel, jobber could not find the job', sid);
                }
            }

            this.refresh();
        }
    },
   
    /////////////////////////////////////////
    // client-side job info cache
    /////////////////////////////////////////

    /**
     * Checks if the jobber already has a reference to a job.
     * 
     * @param  sid {string} sid of the job to chekck for.
     * @return boolean, true or false.
     */
    hasJob: function(sid) {
        return this._jobManifest.hasOwnProperty(sid);
    },

    /**
     * Retrieves the reference to a job object.
     * If no reference exists, returns null.
     *
     * @param  sid {string} sid of the job to retrieve.
     * @return Splunk.Job object or null.
     */
    getJob: function(sid) {
        if (this.hasJob(sid)) return this._jobManifest[sid];
        return null;
    },

    /**
     * Add a job to the jobber. Jobs added to jobber are kept in
     * sync with the appserver.
     *
     * @param  job {Splunk.Job} job object which must have a valid sid.
     * @return boolean, true if the job is added, false if it does not have an sid and cannot be added.
     */
    addJob: function(job) {
        var sid = job.getSID();
        if (!sid) {
            this.logger.warn('Tried to add a job to Jobber without an sid, which is impossible.');
            return false;
        }
        this._jobManifest[sid] = job;
        return true;
    },

    /**
     * Build or update an existing job with a required sid and an an optional
     * primitive (object literal).  Given just an sid, a Splunk.Job object
     * will be created and added to Jobber. Given an additional primitive, the
     * job will call updateByTicketValues on itself, changing its internal state.
     * This method can be used as a safe factory method to retrieve or create
     * a job based on an sid in one step.
     *
     * @param sid {string} the sid of the job to retrieve or create.
     * @param primitive {Object} (optional) an object literal containing key/value pairs
     *                           to be copied over to the Splunk.Job object.
     * @return the job object with the given sid.
     */
    buildJob: function(sid, primitive) {
        var job = this.getJob(sid);
        if (!job) {
            job = new Splunk.Job('*');
            job.setSearchId(sid);
            this.addJob(job);
        }
        if (primitive) job.updateByTicketValues(primitive);
        return job;
    },

    /**
     * Given an sid, removes the reference of the job from Jobber.
     * Note, this does not delete the job everywhere, just the reference
     * Jobber stores to it.
     *
     * @param sid {string} sid of the job to remove.
     * @return treu if the job was found and could be removed, false if it could not be found.
     */
    removeJob: function(sid) {
        if (this.hasJob(sid)) {
            this._jobManifest[sid] = null;
            delete this._jobManifest[sid];
            return true;
        }
        return false;
    },

    /**
     * Returns a list of jobs in a Splunk.JobArray container.
     * The callback is a filter function that receives a job object
     * and if it returns true, adds that job object to the returned JobArray.
     * For example:
     *
     * listJobs(function(job) {return job.isRunning(); });
     *
     * This will return a list of jobs from jobber which are currently running.
     *
     * @param callback {Function} (optional) Receives a job object and if returns true
     *                            adds that job to the returned JobArray.
     * @return JobArray with a list of jobs.
     */
    listJobs: function(callback) {
        callback = callback || function(job) { if (job) return true; };
        var jobs = new Splunk.JobArray();
        for (var sid in this._jobManifest) {
            if (!this._jobManifest.hasOwnProperty(sid)) continue;
            if (callback(this._jobManifest[sid])) jobs.push(this._jobManifest[sid]);
        }
        return jobs;
    },
   

    /////////////////////////////////////////
    // Job status polling logic.
    /////////////////////////////////////////
   
    /**
     * Sets the _clearedForPolling flag to true and 
     * iterates through each job queued in the jobManifest,
     * sending the job to the _receivedJob method.
     * This ensures that jobs queued, but marked as done
     * will successfully fire jobProgress and jobDone.
     * If the Jobber was already cleared for polling, 
     * this method will simply return to prevent repeat
     * calls to _receiveJob.
     */
    clearForPolling: function() {
        if (this.isClearedForPolling()) return;
        this.setClearedForPolling(true);
        for (var sid in this._jobManifest) {
            this._receiveJob(null, this._jobManifest[sid]);
        }
    },

    /**
     * Return the boolean set to the _clearedForPolling
     * flag.
     *
     * @returns boolean;
     */
    isClearedForPolling: function() {
        return this._clearedForPolling;
    },

    /**
     * Sets the _clearedForPolling flag.
     *
     * @param flag {boolean} The true or false flag to set to _clearedForPolling.
     */
    setClearedForPolling: function(flag) {
        this._clearedForPolling = !!(flag);
    },

    /**
     * Unlike start(), this method resets the poll counter
     * and retunes the polling interval to poll quickly.
     */
    refresh: function() {
        this._pollCount = 0;
        this.targetInterval = this.LONG_RUNNING_POLLER_INTERVAL;
        this._tuneRefreshInterval();
        this.start();
    },

    /**
     * Starts the poller, doesn't reset anything, unlike #refresh.
     */
    start: function() {
        this.clearForPolling();
        this._getStatus(null);
        this._startKeepAlive();
    },

    /**
     * Stops the poller, cleaning up any timers that may be active.
     */
    stop: function() {
        this._stopPollTimer();
        this._stopPolling = true;
        this._stopKeepAlive();
    },

    /**
     * Ensures the poller gets stopped.
     */
    _stopPollTimer: function() {
        if (!this._pollTimer) return;
        clearTimeout(this._pollTimer);
        this._pollTimer = null;
    },
    /**
     * Penalize the poller (slow it down). Consumers of Jobber events 
     * can use this as a feedback mechanism for notifyingthe jobber to slow down.
     */
    penalizePoller: function() {
        // do not penalize new searches
        if (!this._lastActiveStartTime || new Date() - this._lastActiveStartTime < this.POLLER_CLAMP_TIME) {
            this.logger.info('not eligible for penalization');
            return;
        }
        var from = this.targetInterval;
        this.targetInterval = Math.round(Math.min(this.targetInterval * this.PENALIZE_POLLER_MULTIPLIER + this.PENALIZE_POLLER_INCREMENT, this.MAX_POLLER_INTERVAL), 10);
        this.logger.info('penalize from:', from, 'to:', this.targetInterval);
    },

    /**
     * Adjust the status polling interval
     * -- calc the desired interval from an easing function;
     * -- bracket the interval using LONG_RUNNING_POLLER_INTERVAL
     */
    _tuneRefreshInterval: function(forcedInterval) {
        
        if (forcedInterval) {
            this.refreshInterval = forcedInterval;
            return;
        }
        //Pressure to bring targetInterval closer to LONG_RUNNING_POLLER_INTERVAL
        this.targetInterval = Math.max(this.LONG_RUNNING_POLLER_INTERVAL, this.targetInterval - this.PENALIZE_POLLER_INCREMENT);
        // get the desired refresh interval based on the easing function
        var elapsedTime = 0;
        if (!this._lastActiveStartTime) {
            this._lastActiveStartTime = new Date();
        } else {
            elapsedTime = new Date() - this._lastActiveStartTime;
        }
        var desiredInterval = Splunk.util.getRetryInterval(elapsedTime, this.MIN_POLLER_INTERVAL, this.targetInterval, this.POLLER_CLAMP_TIME);

        // set the time until the next poll
        this.refreshInterval = Math.round(desiredInterval);
        this.logger.info('calculated refresh interval including penalization:', this.refreshInterval);


        //
        // determine the average latency of the browser to appserver
        // this was previously used for throttling, but now is just informational
        //
        var historySize = this._latencyHistory.length;
        var avgLatency = 0;
        for (var i=0; i<historySize; i++) {
            avgLatency += this._latencyHistory[i];
        }
        avgLatency /= this._latencyHistory.length;

        if (this._pollCount % 10 == 0) {
            this.logger.info('Jobber.getStatus - average latency=', avgLatency, 'ms');
        }   

    },
   
    /**
     * Handles the internal operations of incrementing the poller count,
     * tuning the refresh interval and setting the next polling event.
     */
    _managePoller: function() {
        this._pollCount++;
        this._tuneRefreshInterval();
        if (!this._stopPolling) this._pollTimer = setTimeout(this._getStatus.bind(this), this.refreshInterval);
    },
   
    /**
     * Dispatches the xhr request in order to update the ticket manifest and dispatch the
     * relevant job events.
     */
    _getStatus: function(evt, forceRefresh) {
        if (this._isGettingStatus)
            return;

        // setup the polling
        this._stopPolling = false;
        this._stopPollTimer();

        // set request args
        var getargs = {};
        var beforeSend = null;

        var sids = jQuery.map(
            this.listJobs(function(job) { 
                // We scan for canceled jobs because there is a chance that a user has
                // attempted to cancel a job, but the server has not yet responded that it
                // has definitively been canceled.  Thus they may be marked canceled in our
                // system but still present.
                return (!job.isCanceled() && (job.isRunning() || job.isPaused() || job.isPreparing()));
            }),
            function(job) { return job.getSearchId(); }
        );
        if (sids.length > 0) {
            this.logger.info('has running job; repolling at ', this.refreshInterval);
            getargs['s'] = sids;
            beforeSend = function(xhr) {
                //don't set If-None-Match header to empty string value (see SPL-70971)
                if (this._jobManifestHash) { 
                    try { 
                        xhr.setRequestHeader('If-None-Match', this._jobManifestHash); 
                    } catch (e) {
                        // IE 6 does not implement setRequestHeader
                    }
                }
            }.bind(this);
        } else {
            // Slow down the poller in the case where job(s) were dispatched and allowed to run to completion.
            this.logger.debug("Active jobs done, slowing down the poller.");
            this._stopPolling = true;
            return;
        }

        this._isGettingStatus = true;

        // don't wait for job state to transition to running (sdk defaults to true)
        getargs.wait = 0;

        // mark the start timer
        this._getStatusStartTime = new Date();
        if (Splunk.util.getConfigValue('NOCACHE', false)) {
            getargs.cachebuster = this._getStatusStartTime.getTime();
        }

        // get job statuses
        $.ajax({
            type: 'GET',
            dataType: 'html',   // don't set to json here; fails on empty docs, i.e. 304 response
            url: this.JOB_MGMT_ENDPOINT,
            data: getargs,
            beforeSend: beforeSend,
            complete: this._getStatusCompleteCallback.bind(this),
            error: this._getStatusErrorCallback.bind(this)
        });
    },
   
    _getStatusErrorCallback: function(xhr, status, error) {
        this._isGettingStatus = false;

        this.logger.error('_getStatusErrorCallback - status=' + status + ' error=' + error);
        if (xhr.status >= 400) {
            this.messenger.send('error', 'splunk.search.job.listing', sprintf(_('There was an error requesting the job listing. Status "%(status)s". Error message: "%(statusText)s"'), xhr));
        }
    },

    _getStatusCompleteCallback: function(xhr, status) {
        this._isGettingStatus = false;

        // update latency monitor
        this._latencyHistory.push(new Date() - this._getStatusStartTime);
        if (this._latencyHistory.length > 20) this._latencyHistory.shift();
       
        // update the ETag tracker
        this._jobManifestHash = xhr.getResponseHeader('Etag');
       
        // if job status hasn't changed, the server sends an empty doc so we
        // catch here and re-poll
        if (xhr.status == 304) {
            this.keepRealTimeSearchesProgressing();
            this._managePoller();

            return;
        }

        // do explicit JSON parse here
        try {
            var responseJSON = JSON.parse(xhr.responseText);
        } catch(e) {
            this.logger.error("Could not parse jobber xhr.responseText within _getStatusCompleteCallback function. Error:", e);
            return;
        }
        var data = responseJSON.data;
        // This handles a 'data': null response or a dreaded
        // 'data': "something not null and not an Array" response.
        // In this case we're not repolling because something probably didn't
        // work out correctly. <- that may eventually change if a response
        // is conceivable that returns null or otherwise and may require further polling.
        if (!data || !(data instanceof Array)) {
            this.logger.warn('Upon polling, Jobber received an invalid response from the appserver.');
            if (responseJSON.messages && responseJSON.messages.length > 0) {
                for(var i=0, j=responseJSON.messages.length; i<j; i+=1) {
                    this.messenger.send(responseJSON.messages[i].type.toLowerCase(), 'splunk.search.job', responseJSON.messages[i].message);
                }
            }
            return;
        }
       
        //var sid, isUpdated, localJobTicket, currentTicket;
        var sid, isUpdated, isPaused, isFinalized, isDone, localJob, currentTicket, deltas, checkSearchStatus;
       
        for (var k=0,l=data.length; k<l; k++) {

            currentTicket = data[k];
            sid = currentTicket['sid'];

            if (currentTicket.hasOwnProperty('__notfound__')) {
                this.logger.debug(sprintf("Appserver doesn't have a record of the job %s, removing it from the ticketManifest.", sid));
                if (this.hasJob(sid)) {
                    if (!this.getJob(sid).isCanceled()) {
                        this.messenger.send('info', 'splunk.search.job', sprintf(_("The running job \"%(sid)s\" was canceled remotely or expired."), {'sid': sid}));
                        // Fire both canceled events.
                        $(document).trigger('jobStatusChanged', [sid, 'cancel']);
                        $(document).trigger('jobCanceled', [sid]);
                    }
                    this.removeJob(sid);
                } 
                continue;
            }
            
            if (this.hasJob(sid)) {

                // Create some local properties                
                localJob = this.getJob(sid);
                isPaused = localJob.isPaused();
                isFinalized = localJob.isFinalized();
                isDone = localJob.isDone();
                
                // NOTE - i created this little dict because i think we should pass it 
                // (or something like it), on the progress event.   
                // Modules would then be able to eliminate many unnecessary requests. 
                // eg: we fire progress even if only the scanCount has changed, 
                // which causes pointless /summary and /timeline requests.
                deltas = {};
                deltas["scanCount"]   = currentTicket['scanCount']   - localJob.getScanCount();
                deltas["eventCount"]  = currentTicket['eventCount'] - localJob.getEventCount();
                // getResultCount will return resultPreviewCount or resultCount 
                // depending upon the search isDone or not
                checkSearchStatus = false;
                deltas["resultCount"] = currentTicket['resultCount'] - localJob.getResultCount(checkSearchStatus);
                deltas["eventAvailableCount"] =  (localJob.getStatusBuckets() > 0) ? currentTicket['eventAvailableCount'] - localJob.getEventAvailableCount() : 0;
                deltas["dispatchState"] = currentTicket['dispatchState'] == localJob._dispatchState ? 0 : 1;

                isUpdated = ( 
                    // scanCount we still treat as monotonically increasing
                    // note however that eventCount and resultCount now can generate progress events
                    // when they decrease.
                    (deltas['scanCount']   > 0) ||
                    (deltas['eventCount']  != 0) ||
                    (deltas['resultCount'] != 0) ||
                    (deltas['eventAvailableCount'] != 0) ||
                    (deltas['dispatchState'] != 0)
                );

                // manage the messaging that comes back
                for (var msgSeverity in currentTicket['messages']) {
                    if (currentTicket['messages'].hasOwnProperty(msgSeverity)) {
                        for (var n=0,M=currentTicket['messages'][msgSeverity].length; n<M; n++) {
                            this.messenger.send(msgSeverity, 'splunk.search.job', currentTicket['messages'][msgSeverity][n]);
                        }
                    }
                }

                /*
                this.logger.debug("Jobber found updated job  sid=", sid, 
                    " scanCount=", currentTicket['scanCount'], " lastScanCount=", localJob.getScanCount(), 
                    " eventCount=", currentTicket['eventCount'], " lastEventCount=", localJob.getEventCount(), 
                    " isUpdated=", isUpdated);
                */
                // Update the job
                this.buildJob(sid, currentTicket);

                if (!isDone) {
                    /**
                     * There is currently an issue with isPaused and
                     * isFinalized.  They may not be called even if the
                     * original paused or finalize calls may have returned
                     * successfully.  The problem arises in the way the poller
                     * uses setTimeout, the asynchronous xhr calls to
                     * set pause and finalize and the status of the job on the
                     * server.
                     *
                     * Because we cannot predict when job polling will finish
                     * we may request a job be paused that, on the server is
                     * actually done.  At this point, it is unclear whether or
                     * not events like jobPaused should be triggered, given
                     * that the job has technically finished.
                     *
                     * In this solution, the first time a ticket returns with
                     * a paused or finalized value set to true it will fire
                     * jobPaused and then if the job is also set to done, it
                     * will also fire jobProgress and jobDone
                     */
                    
                    if (currentTicket['isPaused'] && !isPaused) { // fire jobPaused only once
                        this.logger.info('Jobber.getStatus - PAUSED sid=', sid, 'eventCount=', (currentTicket['eventCount']));
                        $(document).trigger('jobPaused', [localJob]);
                    }
                   
                    // if the job is finalized handle that
                    if (currentTicket['isFinalized'] && !isFinalized) { // fire jobFinalized only once
                        this.logger.info('Jobber.getStatus - FINALIZED sid=', sid, 'eventCount=', (currentTicket['eventCount']));
                        $(document).trigger('jobFinalized', [localJob]);
                    }

                    // if job has since finished, fire events
                    if (currentTicket['isDone']) {
                        this.logger.info('Jobber.getStatus - DONE sid=' + sid + ' eventCount=' + (currentTicket['eventCount']));
                        $(document).trigger('jobProgress', [localJob]);
                        $(document).trigger('jobDone', [localJob]);
                        localJob.setLastProgressTime();
                        
                    // or if progress has been made, fire event
                    } else if (isUpdated && !localJob.isPreparing()) {
                        this.logger.info('Jobber.getStatus - PROGRESS sid=' + sid + ' eventCount=' + (currentTicket['eventCount']));
                        $(document).trigger('jobProgress', [localJob]);
                        localJob.setLastProgressTime();
                    } 
                }
            } else {
                this.buildJob(sid, currentTicket);
            }
        }
        this.keepRealTimeSearchesProgressing();
        // update the poller
        this._managePoller();
       
        /**
         * Notify listeners that the ticketManifest has been updated.
         * This may become noisy. It was implemented to allow the global
         * job monitor to update its interface after kicking the poller by
         * calling refresh(true);
         */
        $(document).trigger('jobberTicketsRefreshed');
        if (!this.ticketsLoaded) this.ticketsLoaded = true;
    },

    keepRealTimeSearchesProgressing: function() {
        // get a list of all the jobs that are running, real time, 
        // and that havent had a progress event in a while. 
        var interval = 2 * this.LONG_RUNNING_POLLER_INTERVAL;
        var jobs = this.listJobs(function(job) { 
                return job.isRunning() && job.isRealTimeSearch() && job.getTimeSinceLastProgress() > interval;
        });
        // update them manually
        for (var i=0,len=jobs.length; i<len;i++) {
            var job = jobs[i];
            $(document).trigger('jobProgress', [job]);
            job.setLastProgressTime();
        }
    },
   
    /**
     * The actual keep alive function that gets called by setInterval.
     */ 
    _keepAlive: function() {
        var sids = jQuery.map(this.listJobs(), function(job) { return job.getSID(); });
        if (sids.length > 0) {
            this.logger.debug('Touching the following sids:', sids);
            $.post(this.BATCH_EDIT_ENDPOINT, {action: 'touch', sid: sids}, this._keepAliveCallback.bind(this), 'json'); 
        }
        else this._stopKeepAlive();
    },

    /**
     * Fired by the call to the jobs/batch endpoint.
     * Removes any sids that return a response of 'false' implying they could not
     * be acted upon.
     */
    _keepAliveCallback: function(response) {
        if (response!==undefined && response.data.length > 0) {
            for (var i = 0, j = response.data.length; i < j; i++) {
                if (!response.data[i]['response']) {
                    this.removeJob(response.data[i]['sid']);
                }
            }
        }
    },

    /**
     * Starts the keep alive interval, ignores multiple requests.
     */
    _startKeepAlive: function() {
        if (this._keepAlivePoller) return;
        this._keepAlivePoller = setInterval(this._keepAlive.bind(this), this.KEEP_ALIVE_INTERVAL);
    },

    /**
     * Stop the keep alive interval.
     */
    _stopKeepAlive: function() {
        if (this._keepAlivePoller) {
            clearInterval(this._keepAlivePoller);
            this._keepAlivePoller = null;
        }
    }
});

