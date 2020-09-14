
// TODO - this is part of a temporary patch for SPL-16730. see comment inline.
var LOADING_MESSAGE_PATCH = "Loading...";

//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

// A simple, but extensible, events viewer
Splunk.Module.SimpleEventsViewer = $.klass(Splunk.Module.AbstractPagedModule, {
    /*
     * overriding initialize to set up references and event handlers.
     */
    SOFT_WRAP_CSS_CLASS_NAME: "SimpleEventsViewerSoftWrap",
    initialize: function($super, container) {
        this.childEnforcement = Splunk.Module.NEVER_ALLOW;
        $super(container);
        this.logger = Splunk.Logger.getLogger("simple_events_viewer.js");
        this.resultsContainer
            .click(this._onClick.bind(this))
            .bind('mouseover', this._handleMouseOver.bind(this))
            .bind('mouseout', this._handleMouseOut.bind(this))
            .appendTo(this.container);
       
        
        // we need to keep track of how many events we've rendered so that we can
        // update asynchronously, but only when we know there's something new.
        this._renderedCount= 0;
       
        //this.resizeWidthToParent();
       
        //$(window).bind('resize', this.resizeWidthToParent.bind(this));

    },
    onBeforeJobDispatched: function(search) {
        // needs at least one status bucket in it's dispatched searches.
        search.setMinimumStatusBuckets(1);
    },
    resetUI: function() {
        this.resultsContainer.html('');
    },
    getResultParams: function($super) {
        var params = $super();
        params["xsl"] = 'events.xsl';
        return params;
    },
    getResultURL: function() {
        var args = this.getResultParams();
        var mode = 'events';
        return this.getContext().get("search").getUrl(mode, args);
    },

    onJobProgress: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        // convenience vars cause these property names keep confusing the heck out of me.
        var currentEventCount = search.job.getEventAvailableCount();
        var pageSize = context.get("results.count");

        if (search.job.getEventSorting()!="desc") {
            this.getResults();
            this._renderedCount = Math.min(currentEventCount, pageSize);
            return false;
        }

        // b) if we have already rendered the entire page (or somehow more)
        else if (this._renderedCount >= pageSize) {
            this.logger.debug("EVENTDEBUG exiting. Case 1 this._renderedCount=", this._renderedCount, " pageSize=" , pageSize);
            return false;
        }
       
        // c) it's either done, or there are more events that we have atm
        else if (search.job.isDone() || (currentEventCount > this._renderedCount)) {
            //this.logger.debug("EVENTDEBUG this._renderedCount=" , this._renderedCount, " pageSize=", pageSize, " currentEventCount=", currentEventCount);
            this.getResults();
            this._renderedCount = Math.min(currentEventCount, pageSize);
            return false;
        }
    },

    renderResults: function($super, htmlFragment) {
        if (htmlFragment.indexOf(LOADING_MESSAGE_PATCH) == 0) {
            this.logger.error("REGRESSION - Work was done toward SPL-16730 such that we should not hit this case anymore.");
            this._renderedCount = 0;
        }
        $super(htmlFragment);
    },
   
    onContextChange: function($super) {
        var context = this.getContext();
        if (context.has("results.softWrap")) {
            this.setSoftWrapClassName(context.get("results.softWrap"));
        }
        this._renderedCount = 0;
        this.resetUI();
        $super();
    },

    /*
     * Set/unset the parent class name for soft wrap control.
     */
    setSoftWrapClassName: function(state) {
        if(state){
            this.logger.info("Setting soft wrap className to", this.SOFT_WRAP_CSS_CLASS_NAME);
            this.container.addClass(this.SOFT_WRAP_CSS_CLASS_NAME);
        }else{
            this.logger.info("Removing soft wrap className", this.SOFT_WRAP_CSS_CLASS_NAME);
            this.container.removeClass(this.SOFT_WRAP_CSS_CLASS_NAME);
        }
    },
   
    _onClick: function(evt) {           
        var originator = this._getCorrectSegmentToHighlight(evt.target);

        if (originator.tagName.toUpperCase() != "SPAN" ||
            !$(originator).hasClass('srch')) return false;
       
        var clickedTerm = $(originator).text();
        var termkey = $(originator).attr('termkey');

        var intention = {};
        intention["name"] = (evt.altKey)? "negateterm" : "addterm";
        if (typeof termkey !== 'undefined') {
            intention["arg"] = {};
            intention["arg"][termkey] = clickedTerm;
        }
        else {
            intention["arg"] = clickedTerm;
        }
        var context = new Splunk.Context();
        var search  = new Splunk.Search("*");
        search.addIntention(intention);
        context.set("search", search);
        this.passContextToParent(context);
    },
    // this sneaky little move makes full segmentation highlighting behave
    // properly. Kinda hard to understand what it's doing without a diagram.   
    _getCorrectSegmentToHighlight: function(el) {
        var parent = el.parentNode;
        if (parent.childNodes[parent.childNodes.length-1] == el) return parent;
        return el;
    },
    _handleMouseOver: function(evt) {
        var el = this._getCorrectSegmentToHighlight(evt.target);
        if (el.tagName != 'SPAN' || !$(el).hasClass('srch')) return false;
        $(el).addClass('mouseoverHighlight');
    },

    _handleMouseOut: function(evt) {
        var el = this._getCorrectSegmentToHighlight(evt.target);
        if (el.tagName != 'SPAN') return false;
        $(el).removeClass('mouseoverHighlight');
    }
});
