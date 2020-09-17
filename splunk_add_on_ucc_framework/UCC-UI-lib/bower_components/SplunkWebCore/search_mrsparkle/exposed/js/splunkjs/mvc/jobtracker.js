define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var console = require('util/console');
    var configModel = require('models/config');
    var JobsCollection = require('collections/search/Jobs');

    var MONITORED_PROPERTIES = [
        'dispatchState', 'scanCount', 'resultCount', 'eventCount', 'isPaused',
        'eventAvailableCount', 'isDone', 'isFailed', 'isFinalized', 'doneProgress', 'numPreviews'
    ];
    
    var FAST_FETCH_PERIOD = configModel.get('JOB_MIN_POLLING_INTERVAL') || 100;
    var SLOW_FETCH_PERIOD = configModel.get('JOB_MAX_POLLING_INTERVAL') || 1000;

    var JobTracker = function() {
        this.initialize.apply(this, arguments);
    };
    _.extend(JobTracker.prototype, Backbone.Events, {
        initialize: function() {
            // Stores a model for all jobs that we are tracking
            this._active = [];
            
            // Whether or not we currently have a fetch request in flight
            this._inflight = null;
            
            // A reference to the current timer
            this._timer = null;
            
            // Whether or not we have any new jobs to track, which will influence
            // how quickly we fetch again.
            this._fresh = false;
            
            // A bound function
            this._fetch = _.bind(this._fetch, this);
        },
        
        /**
         * Track the given search job.
         * 
         * @param job       The job to track.
         * @param callbacks An object containing callback functions (ready, progress, done, failed, error).
         * @param scope     The observer object, typically the searchmanager
         */
        track: function(job, callbacks, scope) {
            // Create a model to track this job
            this._active.push(this._initializeItem(job, callbacks || {}, scope));
            
            // Note that we have a new job to track and schedule another fetch
            this._fresh = true;
            this._scheduleNextFetch();
        },
        
        /**
         * Stop tracking the job with the given SID.
         * 
         * @param sid   The sid to stop tracking.
         * @param scope The observer object, typically the searchmanager
         */
        untrack: function(sid, scope) {
            var items = this._active;
            var cmp = { sid: sid };
            if (scope !== undefined) {
                cmp.scope = scope;
            }
            var item = _(items).where(cmp)[0];
            if (item) {
                item._stop = true;
                this._active = _(items).without(item);
            }
        },

        _initializeItem: function(job, callbacks, scope) {
            var item = {
                job: job,
                model: new Backbone.Model(),
                scope: scope,
                sid: job.id
            };
            
            if (_.isFunction(callbacks.progress)) {
                item.model.on('change', function() {
                    callbacks.progress(job);
                });
            }
            if (_.isFunction(callbacks.ready)) {
                item.model.once('change:dispatchState', callbacks.ready);
            }
            if (_.isFunction(callbacks.done)) {
                item.model.on('done', callbacks.done);
            }
            if (_.isFunction(callbacks.failed)) {
                item.model.on('failed', callbacks.failed);
            }
            if (_.isFunction(callbacks.error)) {
                item.model.on('error', callbacks.error);
            }
            
            return item;
        },
        
        _scheduleNextFetch: function() {
            // If we already have a timer or there is a request in flight, 
            // then we do nothing
            if (this._timer || this._inflight) {
                return;
            }
            
            // Fetch status faster if there have been new jobs added to the tracker recently
            var timeout = this._fresh ? FAST_FETCH_PERIOD : SLOW_FETCH_PERIOD;
            this._timer = setTimeout(this._fetch, timeout);
        },
       
       /**
        * Request the specified jobs from the server
        * @param  {String[]}   sids     The search ids (sid) of the desired jobs
        * @param  {Function} callback   Invoked on completion of the request with (error, data)
        * @return {jqXHR}
        */
        _requestUpdate: function(sids, callback) {

            // We create a completely wild-carded service, because we have to make
            // sure we look at all apps/owners. This is because the searches
            // we are tracking could be created anywhere.
            return new JobsCollection().fetch({
                data: {
                    id: sids,
                    count: sids.length
                },
                success: function(collection, data) {
                    // Note that data here is the parsed response from the server
                    // See SplunkDBase#parse
                    callback(null, data);
                },
                error: function(error) {
                    callback(error);
                }
            });
        },
        
        _fetch: function() {
            this._timer = null;
            // Make a clone of the jobs we are going to request status for
            var requestedJobsByID = _(this._active).groupBy('sid');
            if (_.isEmpty(requestedJobsByID)) {
                return;
            }
            var requestedSIDs = _(requestedJobsByID).keys();
            
            var tracker = this;

            this._inflight = this._requestUpdate(requestedSIDs, function(err, data) {
                tracker._inflight = null;
                
                if (err) {
                    _(requestedJobsByID).chain().flatten().pluck('model').invoke('trigger', [ 'error', err ]);
                    tracker._scheduleNextFetch();
                    return;
                }
                
                var newActive = []; 
                var oldActive = tracker._active;
                
                // Extract jobs added after this fetch was initiated. We
                // know a job was added by seeing if it is in our cloned
                // list.
                _(oldActive).each(function(item) {
                    if (!requestedJobsByID[item.sid]) {
                        newActive.push(item);
                    }
                });
                
                // If there are no new jobs, then we can do a slower ping,
                // otherwise we ping faster.
                tracker._fresh = !_.isEmpty(newActive);

                // Now that we found all the "brand new" jobs, we can look
                // at the returned status
                var returnedSIDs = _(data.entry).map(function(entry) {
                    var sid = entry.content.sid;
                    _(requestedJobsByID[sid]).each(function(item) {
                        var job = item.job;
                        var model = item.model;

                        // Don't update the content for cancelled jobs
                        if (item._stop) {
                            return;
                        }

                        // We are updating the job from the data retrieved. This does not trigger
                        // a change event.
                        // We must update the job *before* the model to ensure the job has the 
                        // up to date data for the event handlers on the model
                        job.setFromSplunkD({
                            entry: [entry]
                        });

                        // Update job content and the model
                        model.set(_.pick(entry.content, MONITORED_PROPERTIES));

                        var props = entry.content;
                        var dispatchState = props.dispatchState;

                        // Trigger the correct events depending on the current
                        // dispatch state of the job.
                        if (props.isFailed || props.isZombie || dispatchState === 'FAILED') {
                            model.trigger('failed', job);
                            model.off();
                        } else if (props.isDone || dispatchState === 'DONE') {
                            model.trigger('done', job);
                            model.off();
                        } else {
                            // If it is neither DONE nor FAILED, then we add
                            // it to our list of jobs to track next time.
                            newActive.push(item);
                        }
                    });
                    return sid;
                });

                // Now that we've looked at all the jobs that splunkd returned,
                // we can now try and find the ones that we asked for but
                // don't seem to have gotten a response back for.
                returnedSIDs = _.object(returnedSIDs, returnedSIDs);
                _(requestedSIDs).each(function(sid) {
                    if (!returnedSIDs[sid]) {
                        var items = _(oldActive).where({ sid: sid });
                        _(items).each(function(item) {
                            if (!item) {
                                return;
                            }

                            // If we wanted to stop tracking this job, then this
                            // is fine, as the job may have been cancelled.
                            if (item._stop) {
                                return;
                            }

                            // We want to make sure that if we don't get a response
                            // for a particular job, that we haven't seen it
                            // previously in a meaningful way (e.g. a non-undefined
                            // dispatchState). If we have already seen it, then
                            // it is an error.
                            if (!item.model.has('dispatchState') || item.model.get('dispatchState') === undefined) {
                                newActive.push(item);
                                tracker._fresh = true;
                            } else {
                                item.model.trigger('error', _("The job has not been found").t());
                                tracker._itemDone(item);
                            }
                        });
                    }
                });

                // Now we track only those jobs that made the cut (brand new
                // ones and ones that are not done), and schedule the 
                // next fetch.
                tracker._active = newActive;
                tracker._scheduleNextFetch();
            });
        },
        
        _itemDone: function(item) {
            item.model.off();
        }
    });

    // Singleton instance
    return new JobTracker();
});
