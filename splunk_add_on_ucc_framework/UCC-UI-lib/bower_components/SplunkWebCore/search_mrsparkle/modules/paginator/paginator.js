Splunk.Module.Paginator = $.klass(Splunk.Module.DispatchingModule, {
    EVENTS_ENTITY_NAME: "events",
    RESULTS_ENTITY_NAME: "results",
    AUTO_ENTITY_NAME: "auto",
    SETTINGS_MAP_ENTITY_NAME: "settings",
    /**
     * Paginate twice it's a long way to the bay!
     */
    initialize: function($super, container){
        $super(container);
        // we subclass validateHierarchy to provide an exception for when the paginator is operating as a
        // secondary paginator.  This is the only case in which a Paginator may have a good reason to have no children.
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        this.logger = Splunk.Logger.getLogger("paginator.js");

        this.mergeLoadParamsIntoContext("results", ["count", "maxPages"]);
        this.entityName = this._params['entityName'];
        this.length = 0;
        this.offset = 0;
        this.resultsContainer = $(".ResultsContainer", this.container);
        if( $("script", this.container).length )
        	this.template = doT.template($("script", this.container)[0].innerHTML);
        this.bindUIEvents();//Bootstrap top level event dispatcher.
    },
    validateHierarchy: function($super) {
        var context = this.getContext();
        // unless there's no paginator upstream, the normal validation is applied.

        if (!context.has("results.upstreamPaginator")) {
            // we could inline a simpler method here rather than using the superclass
            // but this way all the messaging is in one place.
            return $super();
        }
    },

    /**
     * This is fired the moment the dispatch request goes out.
     * and we use it here, if we need events, to set the minimum status_buckets to 1.
     */
    onBeforeJobDispatched: function(search) {
        // we need at least 1 if the pager is set to look at events.
        if (this.entityName == this.EVENTS_ENTITY_NAME) {
            search.setMinimumStatusBuckets(1);
        }
    },

    /**
     * Bind a generic UI event listener.
     */
    bindUIEvents: function(){
        this.container.bind("click", this.onUIEvent.bind(this));
    },

    /**
     * Return the correct item count based on a module entityName value
     * (EVENTS_ENTITY_NAME, RESULTS_ENTITY_NAME or SETTINGS_MAP_ENTITY_NAME).
     */
    getEntityCount: function(){
        var count;
        var context = this.getContext();
        var search  = context.get("search");
        switch(this.entityName){
            case this.AUTO_ENTITY_NAME:
                count = search.job.areResultsTransformed() ? search.job.getResultCount() : search.getEventAvailableCount();
                break;
            case this.EVENTS_ENTITY_NAME:
                //Search now has it's own getEventAvailableCount
                //that will return the correct answer even when the user has
                //selected a subset of the timerange
                count = search.getEventAvailableCount();
                break;
            case this.RESULTS_ENTITY_NAME:
                count = search.job.getResultCount();
                break;
            case this.SETTINGS_MAP_ENTITY_NAME:
                count = this.length;
                break;
            default:
                this.logger.error("Invalid module entityName value of", this.entityName);
                count = 0;
                break;
        }
        return count;
    },
    /**
     * Override default.
     */
    getModifiedContext: function() {
        var context = this.getContext();
        context.set("results.offset",   this.offset);

        if (this.entityName == this.SETTINGS_MAP_ENTITY_NAME) {
            context.set("results.totalCountCallback", function(length) {
                this.length = (length != null) ? length : this.length;
                this.getResults();
            }.bind(this));
        }
        // pass a reference to onOffsetChange down, for any second paginators we may find below.
        context.set("results.upstreamPaginator", this);
        return context;
    },
    getResultParams: function($super) {
        var context = this.getContext(),
            search  = context.get("search");
        var params = $super();
        params.search = search._postProcess+'|stats count';
        params.output_mode = 'json';
        params.count = 1;
        return params;
    },
    getResultURL: function(params) {
        var context = this.getContext(),
            search  = context.get("search");
        var sid = search.job.getSID();
        var uri = Splunk.util.make_url('/splunkd/search/jobs/', sid, '/results_preview');
        uri += '?' + Splunk.util.propToQueryString(params);
        return uri;
    },
    /**
     * Override default.
     */
    getResults: function($super) {
        var context = this.getContext(),
            search = context.get("search");
        if(search._postProcess){
            return $super();
        }else{
            this.renderResults();
        }
    },
    /**
     * Override render results so the message is set to an empty string if no content is available.
     */
    renderResults: function($super, htmlFragment){
        var context = this.getContext(),
            search = context.get("search"),
            count;
        if(search._postProcess && htmlFragment && htmlFragment[0] && htmlFragment[0].count){
            count = htmlFragment[0].count;
        }else{
            count = this.getEntityCount();
        }
        if(!count){
            this.resultsContainer.html("");
            return;
        }
        var options = {
            max_items_page: context.get('results.count'),
            max_pages: context.get('results.maxPages'),
            item_offset: this.offset
        };
        var paginator = new Splunk.paginator.Google(count, options);
        var render = this.template({p: paginator});
        this.resultsContainer.html(render);
    },
    /**
     * Does room exist for more pages to be displayed (Used for request throttling).
     */
    hasCapacity: function(){
        var context = this.getContext();
        return ($("li.page", this.container).length < context.get("results.maxPages"));
    },
    /**
     * Handle job complete and retrieve new results if required.
     */
    onJobDone: function(event){
        if(this.getEntityCount()==0){
            this.resultsContainer.html("");
        }
    },

    /**
     * Handle job progress notification and retrieve new results if required.
     *
     * @param {Object} event A jQuery event.
     */
    onJobProgress: function(event){
        if(this.hasCapacity() && this.getEntityCount()>0){
            this.getResults();
        }
    },

    /**
     * Handle a UI event and retrieve results response.
     *
     * @oaram {Object} element The DOM element that triggered the event.
     */
    onOffsetChange: function(element){
        element = $(element);//Cast to a jquery element.
        var resource = element.attr("href");
        var query = resource.split("#")[1];
        var context = this.getContext();
        var currentEventsCount = this.getEntityCount();

        try{
            this.offset = parseInt(Splunk.util.queryStringToProp(query).offset, 10);
        }catch(err){
            this.logger.error("Could not parse offset from uri.", err);
            return false;
        }

        if(currentEventsCount <= this.offset) {
            this.offset = (Math.ceil(currentEventsCount/context.get('results.count'))*context.get('results.count'))-context.get('results.count');
        }
        this.pushContextToChildren();
        this.getResults();
        return false;//Cancel the click/keyboard event from making a request.
    },

    /**
     * Handles a new search.
     */
    onContextChange: function(){
        this.offset = 0;
        var context = this.getContext();
        var search  = context.get("search");
        if (search.isJobDispatched()){
            if (this.getEntityCount()==0) {
                this.resultsContainer.html('');
            }
        }

        // if there is an upstream paginator, we catch it's offset and if it's different, we update ourselves.
        var hasUpstreamPaginator = context.has("results.upstreamPaginator");

        // NOTE: this means the upstream paginator has sent us an offset value.
        //       most of the time paginator takes it's internal property, and publishes it to the world
        //       via the context.  In this case however when we have another paginator above us,
        //       that pattern is reversed,  we actually listen to the offset from above...
        if (hasUpstreamPaginator && context.has("results.offset")) {
            this.offset = context.get("results.offset");
        }
        //subtle but important corner case - reset offset when count change is greater than offset.
        if (this.offset != 0 && context.has("results.offset") && parseInt(context.get("results.offset"), 10) > this.offset){
            this.offset = 0;
        }
        this.getResults();
    },

    /**
     * Top level UI event listener and dispatcher.
     *
     * @param {Object} event A jQuery event.
     */
    onUIEvent: function(event){
       var eventType = event.type;
       var eventTarget = event.target;//What was the source element of the event.
       if((eventType==="click") && $(eventTarget).is("a")){
           if ($(eventTarget).hasClass('disabled')) return false;
           var context = this.getContext();
           var upstreamPaginatorReference = context.get("results.upstreamPaginator");
           if (upstreamPaginatorReference) {
                upstreamPaginatorReference.onOffsetChange(eventTarget);
                // unless the upper paginator is already visible onscreen, scroll up to it.
                $(window).scrollTop(Math.min($(window).scrollTop(), upstreamPaginatorReference.container.offset().top));
           }
           return this.onOffsetChange(eventTarget);
       }
    },
    /**
     * Reset the UI to its original state.
     */
    resetUI: function(){
        this.offset = 0;
        this.length = 0;
        //TODO - review why this push was here.  If the caller wanted to push the changes
        //       to downstream modules they will be doing it themselves.
        //       my guess is it was here cause arguably it was 'resetting' downstream modules
        //       but a module's resetUI() should only worry about itself.
        //this.pushSettingsToChildren();
        this.resultsContainer.html("");
    },

    requiresDispatch: function($super,search) {
        var entityName = this.getParam('entityName');
        if (entityName == this.SETTINGS_MAP_ENTITY_NAME) return false;
        return $super(search);
    }
});
