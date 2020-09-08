
Splunk.Module.JobProgressIndicator = $.klass(Splunk.Module.DispatchingModule, {
    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("JobProgressIndicator.js");
        this.statusText = $('.graphLoading', this.container);
    },
    onBeforeJobDispatched: function() {
        this.statusText.text(_("Queued..."));
        this.displayProgress(0);
    },
    onJobProgress: function() {
        var context = this.getContext();
        var search  = context.get("search");
        if (search.job.isRealTimeSearch()) {
            this.hide();
            return;
        }

        this.statusText.text(_("Loading..."));
        this.show();
        
        this.displayProgress(search.job.getDoneProgress());
    },
    onJobDone: function() {
       this.hide();
    },
    displayProgress: function(progressFloat) {
        var jobProgress = progressFloat * 100 ;
        // crude rounding to 2 decimal places.
        jobProgress = Math.round(jobProgress * 100) / 100;

        jobProgress += "%";
        $(".splBarGraphValue", this.container)
            .text(jobProgress);
        $(".splBarGraphBar", this.container)
            .css('width', jobProgress);
    }
});
