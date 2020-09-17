
/*
 * The FieldViewer simply displays the top N values for a given field.
 */
Splunk.Module.FieldViewer = $.klass(Splunk.Module.AbstractPagedModule, {
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement  = Splunk.Module.NEVER_ALLOW;
        
        this.logger = Splunk.Logger.getLogger("field_viewer.js");
        this._fieldName  = this._params["field"];
        this._listContainer = $("div.fieldList",this.container);
    },

    onBeforeJobDispatched: function(search) {
        // needs at least one status bucket in it's dispatched searches.
        search.setMinimumStatusBuckets(1);
        // makes sure the API collects summaries for it's fields.
        search.setRequiredFields([this._fieldName]);
    },
    
    onContextChange: function() {
        // whenever someone gives us a job that's running, try once right away to get results.
        var context = this.getContext();
        var search  = context.get("search");
        // if the job is dispatched,
        // and then either
        //        it's done (possibly with eventCount 0),
        //        or it's got some events available (and its not done)

        if (search.job.isDone() || (search.job.getEventCount() > 0)) {
            this.getResults();
        }
    },

    onJobProgress: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        if (search.job.isDone() || (search.job.getEventCount() > 0)) {
            this.getResults();
        }
    },

    getResultURL: function() {
        var context = this.getContext();
        var args = {
            field_list:  this._fieldName,
            top_count:   context.get("results.count")
        };
        context = this.getContext();
        var search  = context.get("search");
        return search.getUrl('summary', args);
    },

    renderResults: function(resultXML) {
        var list = $("<ul/>");
        var moduleInstance = this;
        $(resultXML).find("summary").find("field").find("modes").find("value").each(function(index) {   
           
            $("<li/>")
                .append($("<span/>").text($(this).find("text").text())
                    .click(moduleInstance.onClick.bind(moduleInstance))
                )

                .append(" (" + $(this).attr("c") + ")")
                .appendTo(list);
        });
        list.find("span")
            .mouseover(function(mozEvent) { $(this).addClass("mouseoverHighlight"); })
            .mouseout(function(mozEvent) { $(this).removeClass("mouseoverHighlight"); });
        this._listContainer.html('');
        this._listContainer.append(list);

        if (this._params["link"]) {
            // we create a link, and onclick we will add in a plot intention, 
            // dispatch the search, get the sid, and then redirect the user 
            // to an sid permalink.  
            // redirecting them to a 'q' permalink is roughly as easy here, but 
            // 'q' resurrection is not working right now in the report_builder 
            // modules for reasons too complicated to explain here.
            $("<a>")
                .attr("href","#")
                .text(this._params["link"]["label"])
                .append(" &raquo;")
                .click(function(event) {
                    var search = this.getContext().get("search");
                    search.sendToView(this._params["link"]["view"], {}, false, false);
                }.bind(this))
                .appendTo(this._listContainer);
        }
    },

    onClick: function(evt) {
        var originator = evt.target;
        if (originator.tagName.toUpperCase() != "SPAN") return false;
       
        var intention = {};
        intention["name"] = (evt.altKey)? "negateterm" : "addterm";
        intention["arg"] = {};
        intention["arg"][this._fieldName]  = $(originator).text();

        var context = new Splunk.Context();
        var search  = new Splunk.Search();
        search.addIntention(intention);
        context.set("search", search);
        this.passContextToParent(context);
    }, 
    resetUI: function() {
        this._listContainer.html('');
    }
});
