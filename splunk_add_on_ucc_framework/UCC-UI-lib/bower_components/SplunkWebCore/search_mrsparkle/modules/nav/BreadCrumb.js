//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.BreadCrumb = $.klass(Splunk.Module, {
    urlArgs: {},
    //CANCELING_MESSAGE: _("Your report is canceling"), 
    CANCELED_MESSAGE: _("Your previous report was canceled"), 
    initialize: function($super, container) {
        $super(container);
        //this.messenger = Splunk.Messenger.System.getInstance();
        
        var qsDict = Splunk.util.queryStringToProp(document.location.search);
        for (key in {base_sid:1, s:1}) {
            if (qsDict.hasOwnProperty(key)) this.urlArgs[key] = qsDict[key];
        }
        if (Splunk.util.normalizeBoolean(this.getParam("goBackOnJobCancelled"))) {
            $(document).bind("jobCanceled", this.onJobCanceled.bind(this));
        } 

        var moduleInstance = this;
        $("a", this.container)
            .click(function() {
                var args = $.extend(true, {}, moduleInstance.urlArgs);
                // build the args for our URL on the fly
                
                // if there was a viewstate already, we overlay the current viewstate props on what had already.
                if (args.hasOwnProperty("vs")) {
                    Splunk.Globals.ModuleLoader.commitViewParams(args["vs"]);
                // otherwise we generate a brand new one.
                } else {
                    args["vs"] = Splunk.Globals.ModuleLoader.commitViewParams();
                }
                // avoid overdetermining everything.  
                // presence of s beats sid,   presence of sid beats q.   
                if (args.hasOwnProperty('s') && args.hasOwnProperty('sid')) {
                    delete args['sid'];
                }
                if ((args.hasOwnProperty("sid") || args.hasOwnProperty("s")) && args.hasOwnProperty("q")) {
                    delete args["q"];
                }
                
                url = $(this).attr("href");
                if (url.indexOf("?")!=-1) {
                    moduleInstance.logger.warn("breadcrumb URL already has args on it");
                    url = url.substring(0,url.indexOf("?"));
                }

                $(this).attr("href", url + "?" + Splunk.util.propToQueryString(args));
                //return false;
            });
    },
    applyContext: function(context) {
        if (!this.isPageLoadComplete()) {
            var search = context.get("search");
            this.urlArgs["q"] = search.toString();
            this.urlArgs["vs"] = search.getViewStateId();
            if (search.isJobDispatched()) {
                this.urlArgs["sid"] = search.job.getSearchId();
            }
            var savedSearchName = search.getSavedSearchName() || "";
            if (savedSearchName) {
                this.urlArgs["s"] = savedSearchName;
                // deal with the design, which wants to say "Report: Foo"  when we're in the displayView, 
                // and "Edit Foo" at other times.  Couldnt map this into something which was both generic 
                // and also useful.
                var prefixStr = (this._params["options"] && this._params["options"].length > 0 )? "Edit" : "Report:";
                $(".savedSearchName", this.container).text(prefixStr + " " + savedSearchName);    
            }
        }
    },
    getResultParams: function(){
        return {message: this.CANCELED_MESSAGE};
    },
    /**
     * if the job was cancelled then the sid is dead.  We'll have to fall back to passing only the 'q'. 
     */
    onJobCanceled: function(event, sid) {
        
        var previousSID = this.urlArgs["sid"];
        if (previousSID && (previousSID != sid)) {
            this.logger.warn("Breadcrumb module had a particular job and detected a cancel for someone elses job. Ignoring.");
            return false;
        }
        if (this.urlArgs.hasOwnProperty("sid")) {
            delete this.urlArgs["sid"];
        }
        //this.messenger.send('info', 'splunk.search', this.CANCELING_MESSAGE);
        var link = $("a:last", this.container);
        if (link.length>0) {
            this.getResults();
            // click runs the event handler but sadly it doesnt actually click() the link 
            link.click();
            // ...so we have to do it.
            document.location = link.attr("href");
        // if we're not showing a link to any 'step 1',  then we kick them to the default view for the app.
        } else {
            document.location = Splunk.util.make_url('app', Splunk.util.getCurrentApp());
        }
    }
});