
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.StatChooser = $.klass(Splunk.Module.BaseReportBuilderField, {
   
    /*
     * overriding initialize to set up references and event handlers.
     */
    _isTrailingPair: true,
    _statMap: {},
        
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("stat_chooser.js");
        $(".insertAdditionalSeries", this.container).click(this.insertAdditionalSeries.bind(this));
        // some stat ops have more than one legal form. We map them to the single form that 
        // we have in the pulldown values, so we can match definitively during resurrection.
        var s = this._statMap;
        s.c = s.count = "count";
        s.dc = s.distinct_count = "dc";
        s.mean = s.avg = "avg";
        s["var"] = s.varp= "var";
        s.p = s.perc= "perc";
        s.stdev = s.stdevp = "stdev";
    },
    getPlotIntentionArg: function() {
        var selectedOption = $("select option:selected",this.container);
        var value = selectedOption.attr("value");
        if (value=="") {
            return false;
        }
        return {"statop" : value};
    },

    isCompatibleWithIntention: function(plotIntention) {
        if (!plotIntention) return false;
        
        var relevantModes = {"timechart":1, "chart":1};
        if (!plotIntention["arg"].hasOwnProperty("mode") || !(plotIntention["arg"]["mode"] in relevantModes)) {
            return false;
        } else if (plotIntention["arg"]["splitType"] != "multiple" && this._isClone) {
            return false;
        }
        return true;
    },

    /* We could infer this at runtime by looking at grandchildren, but it's
     * dangerous territory to have Modules knowing things about descendants and
     * parents.  So instead we just use a boolean flag and make sure we keep it
     * set correctly.
     */
    isTrailingPair: function() {
        return this._isTrailingPair;
    },

    onContextChange: function($super) {
        var context = this.getContext();
        var search  = context.get("search");
        var plotIntention = search.getIntentionReference("plot");
        
        if (plotIntention && plotIntention["arg"]["splitType"] == "multiple" && this.isTrailingPair()) {
            $("fieldset", this.container).addClass("showAdditional");
        } else {
            $("fieldset", this.container).removeClass("showAdditional");
        }
        $super();
    },
   
    /*
     * Because this module is only compatible with chart and timechart, we dont
     * have to worry about the differing 'fields' formats in the plot intention.
     */
    getModifiedContext: function() {
        var context = this.getContext();
        var search  = context.get("search");
        
        var argumentDict = this.getPlotIntentionArg();
        var statOp = argumentDict["statop"];
        
        // the fact that we preserve the jobInstance is a little unusual.
        // typically modules that know they are modifying the search within their 
        // context, will bleach away the Job information.   
        // However for BaseReportBuilderField
        // instances, it is very helpful to pass along the preexisting job, as
        // so downstream modules can obtain the field list and other information
        // about the 'dataset'.
        var plotIntention = search.getIntentionReference("plot");
                
        if (statOp && this.isCompatibleWithIntention(plotIntention)) {
            // TREAD CAUTIOUSLY.
            // make one if there isnt one.
            if (!plotIntention) {
                plotIntention = {"name":"plot","arg":{}};
            }
           
            // add a fields term if there isnt one.
            if (!plotIntention["arg"].hasOwnProperty("fields")) {
                plotIntention["arg"]["fields"] = [];
            }
            // ok. Now we choose between inserting into the open 'fields' slot
            // of the last series, or creating a new series for ourselves.
           
            var numberOfSeries = plotIntention["arg"]["fields"].length;

           
            var insertionIndex;
            // if there's an open slot in an already existing series
            if (numberOfSeries>0 && !plotIntention["arg"]["fields"][numberOfSeries-1][0]) {
                //this.logger.warn(this.moduleType, " case 1 inserting statOp ", statOp ," into index ", numberOfSeries-1);
                insertionIndex = numberOfSeries-1;
            // create a new series.
            } else {
                //this.logger.warn(this.moduleType, " case 2 inserting statOp ", statOp ," into index ", numberOfSeries);
                plotIntention["arg"]["fields"][numberOfSeries] = [];
                insertionIndex = numberOfSeries;
            }

            plotIntention["arg"]["fields"][insertionIndex][0] = statOp;

            //this.logger.warn(this.moduleType, " inserted at index=", insertionIndex, " and now says ", plotIntention["arg"]["fields"][insertionIndex].join(","));
            //statChooser always inserts it's stat in the last open slot of the fields clause.
            //var numberOfSeries = plotIntention["arg"]["fields"].length;
            //plotIntention["arg"]["fields"][numberOfSeries-1][0] = statOp;
           
            // push our modified search back onto the context.
            context.set("search", search);    
            return context;
        }
        else {
            return context;
        }
    },
    absorbPlotIntentionArg: function(intentionArg) {
        if (intentionArg["mode"] == "top" || intentionArg["mode"] == "rare") return false;
        if (intentionArg.hasOwnProperty("fields")) {
            var fields = intentionArg["fields"];
            if (fields.length > 1) {
                this.logger.error('we have not implemented resurrection for multiple series yet');
            }
            var statop = fields[0][0];
            if (this._statMap.hasOwnProperty(statop)) {
                statop = this._statMap[statop];
            } 
            delete fields[0];
            if (fields.length ==0) {
                delete intentionArg["fields"];
            }
            this._selectElement.val(statop);
            if (this._selectElement.val() == statop) {
                return true;
            } else {
                this.logger.error("received a statop value that we were unable to resurrect -- ", statop);
            }
        }
        return false;
    },
    
    insertAdditionalSeries: function() {
        var fieldChooserChild = this._children[0];
        this._isTrailingPair = fieldChooserChild._isTrailingPair = false;

        $("fieldset", this.container).removeClass("showAdditional");
        $("fieldset", fieldChooserChild.container).addClass("showDeleteLinks");

        var statChooserContainerDiv = this.container.clone();
        statChooserContainerDiv.attr("id", this.container.attr("id") + "_clone");
 
        statChooserContainerDiv.insertAfter(fieldChooserChild.container);
        var addlStatChooser = new Splunk.Module.StatChooser(statChooserContainerDiv);
        addlStatChooser._isClone = true;

        var fieldChooserContainerDiv = $($(".SingleFieldChooser")[0]).clone();
        $("fieldset", fieldChooserContainerDiv).removeClass("showDeleteLinks");


        fieldChooserContainerDiv.insertAfter(statChooserContainerDiv);
        var addlFieldChooser = new Splunk.Module.SingleFieldChooser(fieldChooserContainerDiv);
        if (this._children[0]._priorXML) {
            addlFieldChooser._priorXML = this._children[0]._priorXML;
        } else {
            this.logger.error("Assertion Failed - for cases around the 'count + events' case, we need to clone the priorXML property, but we failed to do so");
        }
        addlFieldChooser._isClone = true;
    
        var orphans = fieldChooserChild._children;
        for (var i=this._children.length; i>=0; i--) {
            var child = fieldChooserChild._children[i];
            fieldChooserChild.removeChild(child);
        }
        fieldChooserChild.addChild(addlStatChooser);
        addlStatChooser.addChild(addlFieldChooser);
       
        for (var j=0;j<orphans.length; j++) {
            addlFieldChooser.addChild(orphans[j]);
        }
        // while we only have these two descendants, we can safely push the new context to them.
        this.pushContextToChildren();       
    }
});
