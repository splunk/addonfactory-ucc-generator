
Splunk.Module.EnablePreview = $.klass(Splunk.Module.DispatchingModule, {
    
    // defines the module configuration key to persist the checkbox state
    CONF_KEY: 'enable',
    PREVIEW_AND_REAL_TIME_CONFLICT : 'preview_is_completely_ignored_by_splunkd_when_in_realtime',

    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("EnablePreview.js");
        this.checkbox = $("input[name='enable']", this.container);
        this.checkbox.bind("click", this.onEnablePreviewChange.bind(this));
        this.previousSID = null;
        
        if (!Splunk.util.normalizeBoolean(this.getParam("display"))) {
            this.hide(this.HIDDEN_MODULE_KEY);
        }
    },

    /**
     * because 
     * 1) the job dictionaries do not maintain any state as to whether preview is enabled  
     * 2) we can load searches into any view while they are still running.
     * therefore we have to push state ONCE for every job we receive
     * because what we want is whenever I load a job into the view, 
     * the sticky state of this module should PUSH to the job's state,
     * rather than the current state of the job, on or off, being PULLED to this form element. 
     */
    onContextChange: function() {
        var context = this.getContext();
        var search  = context.get("search");
        var range   = search.getTimeRange();

        var currentSID = search.job.getSearchId();

        // real time searches MIGHT get preview turned on by default
        // when the first progress event comes.  
        // Therefore we actually cant in good conscience push our state 
        // to the job here at all. 
        // Furthermore, it's nothing but trouble to give the user the 
        // ability to turn off preview when in real time.   (If you do that 
        // to a transforming search you'll never get any data ever)
        if (range.isRealTime() ) {
            // give the show/hide calls a unique token so ensure it's 
            // orthogonal to other visibility 'modes'
            this.hide(this.PREVIEW_AND_REAL_TIME_CONFLICT);
        }
        else {
            this.show(this.PREVIEW_AND_REAL_TIME_CONFLICT);
            if (search.isJobDispatched() && !search.job.isDone() && currentSID != this.previousSID) {
                search.job.setPreviewable(this.isChecked());
            }
        }
        this.previousSID = currentSID;
    },
    

    /**
     * Internal method called whenever we need to update the job state to match our checkbox.
     */
    updatePreviewableState: function() {
        var search = this.getContext().get("search");
        var job = search.job;
        if (job.isPreviewable() != this.isChecked()) {
            job.setPreviewable(this.isChecked());
        }
    },
    
    /**
     * Triggered when a user changes the status of the enable preview checkbox.
     */
    onEnablePreviewChange: function(evt){
        this.setParam(this.CONF_KEY, this.isChecked());
        this.logger.info("onEnablePreviewChange - isChecked=" + this.getParam(this.CONF_KEY));
        this.updatePreviewableState();
    },
    
    /**
     * Returns if the word wrap checkbox has been selected or not.
     */
    isChecked: function() {
        return Splunk.util.normalizeBoolean(this.checkbox.prop('checked'));
    }
});
