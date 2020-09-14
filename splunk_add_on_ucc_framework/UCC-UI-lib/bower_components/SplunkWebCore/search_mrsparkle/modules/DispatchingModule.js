// Splunk.Module is the abstract base class for Splunk UI modular components. 

Splunk.Module.DispatchingModule = $.klass(Splunk.Module, {
    /*
     * DispatchingModule's constructor handles the attachment of jobProgress and
     * jobDone events, such that onJobProgress and onJobDone will only be called
     * when the job held in this.baseContext is actually changed.  
     * Other unrelated job events will not result in the handlers being called.   
     * NOTE: If you want to make a module subscribe to ALL jobProgress or
     * jobDone events the simplest way would be to override initialize and not
     * call $super(), and then just bind directly.
     */
    initialize: function($super, container) {
       
        this.logger = Splunk.Logger.getLogger("search_modules.js");
        // This guarantees that onJobProgress and onJobDone will ONLY
        // be called when it's the baseContext's job that has the progress or
        // has become done. 

        $(document).bind('jobProgress', function(event, progressingJob) {
            //TODO - rethink whether this direct references are still necessary after nate and nick's recent improvements. 
            // other modules' jobProgress events may get fired before any contexts are set.
            if (!this.baseContext || !this.baseContext.has("search")) return false;
            
            var ourJob = this.baseContext.get("search").job;
            if (ourJob.getSearchId() == progressingJob.getSearchId()) {
                this.onJobProgress(event);
            }
        }.bind(this));

         //see simlar comment above for jobProgress
        $(document).bind('jobDone', function(event, doneJob) {
            //TODO - rethink whether this direct references are still necessary after nate and nick's recent improvements. 
            // other modules' jobProgress events may get fired before any contexts are set.
            if (!this.baseContext || !this.baseContext.has("search")) return false;
            
            var ourJob = this.baseContext.get("search").job;
            
            if (ourJob.getSearchId() == doneJob.getSearchId()) {
                this.onJobDone(event);   
            }
        }.bind(this));

        $(document).bind('jobStatusChanged', function(event, sid, status) {
            //TODO - rethink whether these direct references are still necessary after nate and nick's recent improvements.             
            // other modules' jobProgress events may get fired before any contexts are set.
            if (!this.baseContext || !this.baseContext.has("search")) return false;
            var search = this.baseContext.get("search");
            if ((search.job.getSearchId() == sid)) {
                this.onJobStatusChange(event, status);
            }
        }.bind(this));
       
        $super(container);
    },
   
    // the module's current Context instance, which contains all of the information provided by upstream modules. 
    baseContext: false,
   
    /*
     * return values from these functions are used to check whether or not a search needs to be redispatched, 
     * or whether we can use arguments that we have already in the context. 
     * currently it's used to determine when a selection is made on the Timeline, 
     * so that some modules below dont require a re-dispatch (MultiFieldViewer), 
     * but some modules DO require a dispatch in this case (SimpleResultsTable in 'results' mode
     * since the determination is conditional on module config it makes sense to have it a function 
     * instead of a straight flag. 
     *
     * In the future, this could be the basis of a mechanism where we automatically 
     * use postProcess when eventCounts are low, and we re-dispatch a search when the 
     * eventCounts are higher..
     */
    requiresTransformedResults: function() {return false;},

    /*
     * Public function.  Returning true here tells the framework that
     * this module needs this particular search to be dispatched or redispatched.
     */
    requiresDispatch: function(search) {
        // if search is not provided we treat the call as though it had provided a generic undispatched search.
        search = search || new Splunk.Search();
        if (this.requiresTransformedResults()) {
            var range  = search.getTimeRange();
            if (range.isSubRangeOfJob()) {
                return true;
            } 
        }
        try {
            return !search.isJobDispatched();
        } catch(e) {
            this.logger.error("TypeError ", this.moduleType, ".requiresDispatch() was given a null search instance.");
            return false;
        }
        
        
    },

    pushContextToChildren: function($super, explicitContext) {
        var context = explicitContext || this.getModifiedContext();
        // check to see whether or not we have a searchId already. 
        var search = context.get("search");
        if (!search.isJobDispatched() && this.requiresDispatch(search)) {
            this.logger.error(this.moduleType, ".onContextChange - hit the corner case where a DispatchingModule instance requires dispatch for q=", search.toString(), "timeRange=", search.getTimeRange());
            this._fireDispatch(search);
        } else {
            $super(context);
        }
    },
    /**
     * override me to handle job progress notifications.
     * (only for the job currently referenced by this.baseContext)
     */
    onJobProgress: function(event) {},
    /**
     * override me to handle the global notification that the job is done.
     * (only for the job currently referenced by this.baseContext)
     */
    onJobDone: function(event) {},
    
   
    onJobStatusChange: function(event, status) {
        if (status == 'cancel') {
            this.reset();
        }
    }
});
Splunk.Module.DispatchingModule.isAbstract = true;
