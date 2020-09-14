Splunk.namespace("Splunk.PageStatus");
/**
 * 
 * Keep track of the state of the page
 * Parties that do work after the page has loaded should call
 * this singleton's register() method to note that they're not done updating
 * the page yet.  register() returns an object with a method of loadComplete() that
 * should be called when the party has completed updating his part of the page 
 * load process:
 *
 * var load_status = Splunk.Globals['PageStatus'].register('tetris_loader')
 * ... tetris loads from tape at 300 baud and appears on screen ...
 * load_status.loadComplete();
 *
 * When all registered parties signal loadComplete this class dispatches
 * a PageReady event to document.
 * 
 */
Splunk.PageStatus = $.klass({
    READY: "PageReady",
    /**
     * Initializes PageReady.
     */
    initialize: function(){
        this.logger = Splunk.Logger.getLogger("Splunk.PageStatus");
        $(document).bind(this.READY, this._onPageReady.bind(this));
        this._reset();
        
        this._registerJobs();
        this._registerModuleLoader();
    },
    _registerJobs: function() {
        var handler = this;
        var callbackMap = {};
        
        var jobCreatedCallback = function(event, job) {
            var sid = job.getSearchId();
            callbackMap[sid] = handler.register('Job is running - ' + sid);
        };
        $(document).bind('jobDispatched',  jobCreatedCallback);
        $(document).bind('jobResurrected', jobCreatedCallback);
        $(document).bind('jobProgress', function(event, job) {
            var sid = job.getSearchId();
            if (callbackMap && callbackMap.hasOwnProperty(sid) && (job.isDone() || (job.isRealTimeSearch() && (job.getDoneProgress() == 1)))) {
                callbackMap[sid].loadComplete();
                delete callbackMap[sid];
            }
        });

    },
    _registerModuleLoader: function() {
        if (Splunk.hasOwnProperty("ModuleLoader")) {
            var monitor = this.register('ModuleLoader - initializing all modules, loading them with context data.');
            $(document).bind('allModulesInHierarchy',  function() {
                monitor.loadComplete();
            });
        } else {
            this.logger.debug("no dependent ModuleLoader detected");
        }
    },
        

    /**
     * Anything that needs to notify PageStatus of its load status
     * should register with it as early as possible.
     * 
     * @param String desc - Any string identifying the caller; doesn't have to be unique, but probably should for clarity
     * @return Object - Call the loadComplete method of the returned object when your component is done updating.
     */
    register: function(desc) {
        ++this.last_id;
        var id = this.last_id;
        this.pending[id] = desc;
        this.pending_count++;
        var handler = this;
        //this.logger.debug('Splunk.PageStatus registered dependent id='+id+' desc="'+desc+'"');
        return {
            id: id,
            loadComplete: function() { return handler._loadComplete(this.id); }
        };
    },

    /**
     * Call once when everything has had a chance to register itself
     * so we can start tracking when individual elements report that
     * they have completed loading
     */
    setupComplete: function() {
        this.logger.info('Splunk.PageStatus setup complete');
        this.page_setup = true;
        this._checkPageComplete();
    },



    _loadComplete: function(id) {
        if (!id in this.pending) 
            return false; // raise exception here?
        //this.logger.debug('Splunk.PageStatus dependent id='+id+' desc="'+this.pending[id]+'" reports load complete');
        delete this.pending[id];
        this.pending_count--;
        this._checkPageComplete();
        return true;
    },


    /** 
     * Should not be called externally
     */
    _checkPageComplete: function() {
        if (this.pending_count || !this.page_setup)
            return;
        this.logger.info('Splunk.PageStatus page done after '+this.last_id+' dependents completed.');
        if (document.createEvent) {
            // make sure the event is picked up by the FF reporting extension
            var evt = document.createEvent("Events");
            evt.initEvent(this.READY,  true, false);
            document.dispatchEvent(evt);
        } else {
            $(document).trigger(this.READY);
        }
    },

    /**
     * Page ready.
     * 
     * @param {Object) event The jQuery passed event.
     */
    _onPageReady: function(evt){
        this.logger.info("Splunk.PageStatus.READY fired");
    },

    /**
     * For unit tests
     */
    _reset: function() {
        this.pending = {};
        this.pending_count = 0;
        this.last_id = 0;
        this.page_setup = false;
    }
});
Splunk.PageStatus.instance = null;
/**
 * Singleton reference to PageStatus object.
 *
 * @return A reference to a shared PageStatus object.
 * @type Object
 */
Splunk.PageStatus.getInstance = function(){
    if(!Splunk.PageStatus.instance){
        Splunk.PageStatus.instance = new Splunk.PageStatus();
    }
    return Splunk.PageStatus.instance;
};
