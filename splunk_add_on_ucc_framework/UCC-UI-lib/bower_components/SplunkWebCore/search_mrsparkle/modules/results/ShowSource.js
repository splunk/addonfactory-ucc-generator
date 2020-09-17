
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

// Simple module to pull a single value out of a result set and display it
Splunk.Module.ShowSource = $.klass(Splunk.Module.DispatchingModule, {
    SOFT_WRAP_CLASS_NAME: "SourceSoftWrap",
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement  = Splunk.Module.NEVER_ALLOW;
        
        this.resultsContainer = $('.sourceText', container);
        
        this.logger = Splunk.Logger.getLogger("ShowSource.js");        
        
        this.maxLinesConstraint = parseInt(this._params.maxLinesConstraint, 10);

        this.onResize();
        $(window).resize(this.onResize.bind(this));
    },

    onResize: function() {
        var sourceText = $(".sourceText", this.container);
        var foo = $(window).height() - sourceText.offset().top;
        sourceText.height(foo);
    },

    onContextChange: function() {
        var context = this.getContext();
        if(context.has("results.softWrap")){
            this.setSoftWrapClassName(context.get("results.softWrap"));
            this.onResultsRendered();
        }
        var search = context.get("search");
        if(this.haveResultParamsChanged() && (search.job.isDone() || (search.job.getEventAvailableCount() > 0))){
            this._pageComplete = false;
            this.getResults();
        }
    },

    onLoadStatusChange: function($super,statusInt) {
        $super(statusInt);
        if (statusInt == Splunk.util.moduleLoadStates.HAS_CONTEXT)
            this.getResults();
    },

    onResultsRendered: function() {
        var selectedRow  = $(".SourceLineHL", this.container);

        if (selectedRow && selectedRow.length > 0) {
            var sourceText   = $(".sourceText", this.container);
            var sourceOffset = sourceText.offset().top;
            sourceText.scrollTop(0);
            var windowHeight = $(window).height();
            var newScrollTop = selectedRow.offset().top - sourceOffset;
        
            newScrollTop -= ((windowHeight - sourceOffset)/2);
            
            sourceText.scrollTop(Math.round(newScrollTop));
        }
    },

    getResultParams: function($super) {
        var params = $super();
        var context = this.getContext();
        var search  = context.get("search");
        var sid     = search.job.getSearchId();
        
        params.max_lines_constraint = this.maxLinesConstraint;

        var qsDict = Splunk.util.queryStringToProp(document.location.search);

        if (!sid) this.logger.error(this.moduleType, "Assertion Failed. getResultParams was called, but searchId is missing from my job.");

        params.sid = sid;
        if (qsDict.hasOwnProperty("offset")) params.offset = qsDict["offset"];
        if (qsDict.hasOwnProperty("latest_time")) params.latest_time = qsDict["latest_time"];

        if (context.has("results.count")) params.count = context.get("results.count");

        return params;
    }, 
    /**
     * Set/Reset the class name for soft wrap control.
     *
     * @param {Boolean} state Add or remove the softwrap class.
     */
    setSoftWrapClassName: function(state){
        if(state){
            this.resultsContainer.addClass(this.SOFT_WRAP_CLASS_NAME);
        }else{
            this.resultsContainer.removeClass(this.SOFT_WRAP_CLASS_NAME);
        }
    }
});
