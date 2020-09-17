
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.SingleFieldChooser = $.klass(Splunk.Module.BaseReportBuilderField, {
    
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("single_field_chooser.js");
        //this._selected = this._params["selected"] || "_raw";
        // even though we dont want this module to force dispatches, we do want to take
        // advantage of existing sids when we have one.
        $(document).bind('jobProgress', function(event, job) {
            var context = this.getContext();
            var search  = context.get("search");
            if (search && (search.job.getSearchId() == job.getSID())) {
                this.onJobProgress(event);
            }
        }.bind(this));
        $(".deleteSeries", this.container).click(this.removeNextSeries.bind(this));
    },

    onBeforeJobDispatched: function(search) {
        // needs at least one status bucket in it's dispatched searches.
        search.setMinimumStatusBuckets(1);
        // needs *all* the fields in order to do it's job.
        search.setRequiredFields(["*"]);
    },

    isCompatibleWithIntention: function(plotIntention) {
        if (!plotIntention || !plotIntention["arg"].hasOwnProperty("mode")) {
            return false;
        }
        else if (plotIntention["arg"]["splitType"] != "multiple" && this._isClone) {
            return false;
        }
        return true;
    },

    getPlotIntentionArg: function() {
        var selectedOption = $("select option:selected",this.container);
        var value = (this.__resurrectedFieldName )  ? this.__resurrectedFieldName : selectedOption.attr("value");
        return {fields:[value]};
    },
    getModifiedContext: function($super) {
        var context = this.getContext();
        var search  = context.get("search");

        var plotIntention = search.getIntentionReference("plot");
        if (!plotIntention) return context;

        if (!plotIntention["arg"].hasOwnProperty("mode")) {
            this.logger.warn("no module set the mode before it got to ", this.moduleType, " so it doesnt know which fields format to use.");
            // add the plot intention back before returning

            return context;
        }

        var modesWithSpecialFieldsFormat = {"timechart":1, "chart":1};
        if (plotIntention["arg"]["mode"] in modesWithSpecialFieldsFormat) {
            return this.getModifiedContextForSpecialModes();
        } else {
            return $super();
        }
    },

    getModifiedContextForSpecialModes: function() {
        var context = this.getContext();
        var search  = context.get("search");
        var plotIntention = search.getIntentionReference("plot");

        var intentionArg = this.getPlotIntentionArg();
        // getPlotIntentionArg had to wrap the 'fields' value in an array, to keep 'top' and 'rare'
        // working.  However here we need to undo that cause here we need to use the *value*
        // as the second element, in an Array, which is then contained in another Array.
        // Confused yet?
        var fieldName = intentionArg["fields"][0];

        if (fieldName && this.isCompatibleWithIntention(plotIntention)) {
            // add a fields term if there isnt one.
            if (!plotIntention["arg"].hasOwnProperty("fields")) {
                plotIntention["arg"]["fields"] = [];
            }

            // ok. Now we choose between inserting into the open 'fields' slot
            // of the last series, or creating a new series for ourselves.
            var numberOfSeries = plotIntention["arg"]["fields"].length;

            var insertionIndex;
            // if there's an open slot in an already existing series
            if (numberOfSeries>0 && plotIntention["arg"]["fields"][numberOfSeries-1].length<2) {
                //this.logger.warn(this.moduleType, " case 1 inserting fieldName ", fieldName ," into index ", numberOfSeries-1);
                insertionIndex = numberOfSeries-1;
            // create a new series.
            } else {
                //this.logger.warn(this.moduleType, " case 2 inserting fieldName ", fieldName ," into index ", numberOfSeries);
                plotIntention["arg"]["fields"][numberOfSeries] = [];
                insertionIndex = numberOfSeries;
            }

            plotIntention["arg"]["fields"][insertionIndex][1] = fieldName;
            //this.logger.warn(this.moduleType, " inserted at index=", insertionIndex, " and now says ", plotIntention["arg"]["fields"][insertionIndex].join(","));
        }
        context.set("search", search);
        return context;
    },

    onContextChange: function($super) {
        var context = this.getContext();
        var search  = context.get("search");
        var plotIntention = search.getIntentionReference("plot");
        if (plotIntention && plotIntention["arg"]["splitType"] != "multiple") {
            $("fieldset", this.container).removeClass("showDeleteLinks");
        }
        if (this._priorXML) {
            if (plotIntention && plotIntention["arg"]["fields"] && plotIntention["arg"]["fields"].length > 0) {
                // because we have to worry about the multiple series case, 
                // we have to figure out which statop is ours in the matrix of field args.
                // fortunately since the args are all layered on piece by piece as they 
                // go through the modules, it'll be the top one.
                var fieldsMatrix = plotIntention["arg"]["fields"];
                var matchingStatOp = fieldsMatrix[fieldsMatrix.length-1][0];
                if (plotIntention["arg"]["mode"] == "timechart" && matchingStatOp == "count") {   
                    // clearing the select element first,  is a short and simple way to 
                    // obliterate evidence of prior selection. 
                    // so when we call render a couple lines down,  'events'  will be selected by default again
                    this._selectElement.html('');
                }   
            }
            this.renderResults(this._priorXML);
        }
        $super();
    },

    onJobProgress: function() {
        this.getResults();
    },

    getResultURL: function($super, params) {
        //this.logger.info(this.moduleType, "getting field list.");
        params = params || {};
        params["top_count"] = 0;

        var qsDict = Splunk.util.queryStringToProp(document.location.search);
        var baseSID = qsDict["base_sid"];
        if (baseSID) {
            var search = Splunk.Search.resurrectFromSearchId(baseSID);
            return search.getUrl('summary', params);
        }
        this.logger.error("we are unable to determine a usable URL to retrieve the available fields");
    },
    getResultsErrorHandler: function($super, xhr, textStatus, exception) {
        $super(xhr, textStatus, exception);
        this.puntToAdvancedMode(_("We were unable to retrieve from the original job. It may have expired or been canceled."));
    },
    renderResults: function(xml) {
        // we save the value that was selected, for later.
        var selectedVal = this._selectElement.val();

        // We have a need to conditionally show 'Events' only in the case of reportType=timechart + statOp=count. 
        // this would be straightforward but for the following. 
        // 1 report builder supports using the UI while the search is still running
        // which means that the field list may change and be re-rendered repeatedly. 
        // 2 changing upstream module UI will result in a context push through this module, 
        // and that context change may switch us from 'events' being relevant, to irrelevant. 
        // The lowest impact solution i have right now, is to hang onto the xml we render from
        // and within this.onContextChange,  trigger a re-render with what is basically the 'last-known-xml' 
        // This will (SHOULD SOON) be superceded by a bunch of new requirements, around enabling and 
        // disabling non-numeric options when numeric statops are selected.   
        // SEE SPL-21688,  eg user should be discouraged if not prevented from choosing nonsense options like 'avg(host)'
        // 
        this._priorXML = xml;
        this._selectElement.html('');
        var moduleInstance = this;
        var showEventsOption = false;
        var search = this._resurrectedSearchForInitialLoad || this.getContext().get("search");


        if (search) {
            // null out the property in all cases. 
            this._resurrectedSearchForInitialLoad = null;
            var plotIntention = search.getIntentionReference("plot");

            if (plotIntention && plotIntention["arg"]["mode"] == "timechart") {
                var fieldsMatrix = plotIntention["arg"]["fields"];
                // need to check whether the MOST RECENTLY ADDED statop,  is count.
                if (fieldsMatrix[fieldsMatrix.length-1][0] == "count") {
                    showEventsOption = true;
                }
            }
        }
        if (showEventsOption) {
            $("<option/>")
                .text(_("Events"))
                .attr("value", "__events")
                .attr("selected", "selected")
                .appendTo(moduleInstance._selectElement);
        }
        $(xml).find("summary").find("field").each(function() {
            var fieldName = $(this).attr('k');
            var optionText = [fieldName];
            var isNumeric = $(this).find("mean").length > 0;
            if (isNumeric) {
                optionText.push(" (n)");
            }
            //optionText.push("  - (" + $(this).attr('dc')+ ")");
            
            $("<option/>")
                .text(optionText.join(""))
                .attr("value", fieldName)
                .attr("s:isnumeric", isNumeric)
                .appendTo(moduleInstance._selectElement);
        });


        if (this.__resurrectedFieldName) {
            this._selectElement.val(this.__resurrectedFieldName);
            if (this.__resurrectedFieldName != this._selectElement.val()) {
                this.logger.warn("could not find our field to resurrect ", this.__resurrectedFieldName, " but maybe this job is still running and the field hasnt turned up yet.");
            }
            this.__resurrectedFieldName = null;
        } else {
            // setting the previous selectedVal.  Not ideal, because there's some
            // interaction warts.
            // one weirdness:  mouseovers actually change what jquery gets back from
            // val(), even though onchange wasnt actually fired..  Very odd.
            if (selectedVal) this._selectElement.val(selectedVal);
        }
        
        // see overridden hide() method for an explanation of this nonsense.  yes, I overrode hide().  and show() too.
        if ( $.browser.msie && $.browser.version == '6.0' ) {
            this.showIfCompatible();   
        }
    },
    removeNextSeries: function() {
        var child = this._children[0];
        if (child.moduleType != "Splunk.Module.StatChooser") {
            this.logger.error(this.moduleType, " somehow doesnt have a StatChooser as its first child.");
        }
        var grandChild = child._children[0];
        if (grandChild.moduleType != "Splunk.Module.SingleFieldChooser") {
            this.logger.error(this.moduleType, " somehow doesnt have a SingleFieldChooser as its first child.");
        }
        // remove the html from the page.
        child.container.remove();
        grandChild.container.remove();
        // unhook the references from the children arrays
        child.removeChild(grandChild);
        this.removeChild(child);

        // now we adopt the great grand-children.
        for (var i=0; i<grandChild._children.length;i++) {
            grandChild._children[i].parent = null;
            this.addChild(grandChild._children[i]);
        }

        // deal with the remove links and 'add new series' links.
        // we walk down until we're one past the last pair.
        var m = this;
        while (m.moduleType == "Splunk.Module.StatChooser" || m.moduleType == "Splunk.Module.SingleFieldChooser") {
            m = m._children[0];
        }
        var firstChildAfterTrailingPair = m;
        firstChildAfterTrailingPair.parent._isTrailingPair = true;
        firstChildAfterTrailingPair.parent.parent._isTrailingPair = true;
        $("fieldset", firstChildAfterTrailingPair.parent.container).removeClass("showDeleteLinks");
        // reach up and flush the contexts so we can get our add-series link back.
        this.parent.parent.pushContextToChildren();
    },
    absorbPlotIntentionArg: function(intentionArg) {

        if (intentionArg.hasOwnProperty("fields")) {

            var fields = intentionArg["fields"];
            if (intentionArg["mode"] == "timechart" || intentionArg["mode"] == "chart") {

                if (intentionArg["splitType"] == "multiple") {
                    this.logger.error('we have not implemented resurrection for multiple series yet');
                } else {
                    this.__resurrectedFieldName = fields[0][1];
                    delete fields[0][1];
                }
                return true;
            } else if (intentionArg["mode"] == "top" || intentionArg["mode"] == "rare") {
                if (fields.hasOwnProperty("clauses")) {
                    this.__resurrectedFieldName = fields["clauses"][0];
                } else {
                    this.__resurrectedFieldName = fields[0];
                }
                delete intentionArg["fields"];
                return true;
            }
        }
        return false;
    },

    applyContext: function($super, context) {
        var search = context.get("search");
        // Tricky problem API --  this module needs to piggyback on a search to get it's fieldList,
        // but in general the searches that get dispatched *by* the report_wizard, will
        // not have the full field list.
        // So there's a problem here.  Put simply, if you linked in here from a
        // search view that had required_field_list=*, then this module will
        // be able to show the user the full list of fields.
        // if however you generated a report here and later came back here on a
        // link from the Job Management page, the report will resurrect, but you
        // wont be able to pick any different fields..
        
        // order is important.  The unit testing for this makes the getResults call synchronous
        // so for the coverage to be meaningful it has to happen after the main applyContext logic has happened.
        var retVal = $super(context);
        
        this._resurrectedSearchForInitialLoad = search;
        this.getResults();
        return retVal;
    },

    show: function($super) {
        $super();
        if ( $.browser.msie && $.browser.version == '6.0' ) {
            $(this.container).find('select').show(); 
        } 
    },

    hide: function($super) {
        $super();
        
        /* welcome to the nonsense.  IE6, because it can, decides to reshow our select elements when their contents 
         * are changed, even though they're within a hidden element.  so this part basically just jolts them back into hidden
         * status so they don't appear scattered across the page.  oh, and just .hide() doesn't work, you have to completely flip
         * the bits.  
         */
        if ( $.browser.msie && $.browser.version == '6.0' ) {
            $(this.container).find('select').show().hide(); 
        }
    }
});



