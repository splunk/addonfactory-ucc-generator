
// A simple, but extensible, results table
Splunk.Module.MultiplexSparkline = $.klass(Splunk.Module.DispatchingModule, {

    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        this.childEnforcement = Splunk.Module.NEVER_ALLOW;
        $super(container);
    },
   
    onJobProgress: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        //TODO - this probably only uses cursorTime because it was written before there was 
        //       search.job.getDoneProgress()  (returns float between 0 and 1)
        this.resultsContainer.html('Waiting for job completion...cursorTime=' + search.job.getCursorTime());
    },
    
    getResultParams: function() {
        var context = this.getContext();
        var search  = context.get("search");
        var sid = search.job.getSearchId();
        return {'sid': sid};
    },
    
    onJobDone: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        if (!search.isJobDispatched()) {
            this.logger.error(this.moduleType, " Assertion Failed. onJobDone was called, but searchId is missing from my job, .");
            return; //can't do anything
        }
        this.getResults();
    },
   
    onResultsRendered: function() {
        this.logger.debug('MultiplexSparkline.onResultsRendered - START');
        var yMin = $('table.sparklineSet').attr('s:min');
        var yMax = $('table.sparklineSet').attr('s:max');
        $('.sparklines', this.container).sparkline('html', {
            type: 'bar',
            barColor: '#73A550',
            chartRangeMin: yMin,
            chartRangeMax: yMax,
            height: '20px'
        });
    }

});
