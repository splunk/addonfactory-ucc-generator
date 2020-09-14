//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

// A simple, but extensible, results table
Splunk.Module.SimpleResultsTable = $.klass(Splunk.Module.AbstractPagedModule, {
    DRILLDOWN_VISIBILITY_KEY : "ResultsTableInteractionValidity",
    LEADING_UNDERSCORE_PREFIX : "VALUE_",
    RENDER_REFRESH_TIME_CONSTRAINT: 1.5,
    QUOTE_ESCAPE_REGEX: /\"/g,
    BACKSLASH_ESCAPE_REGEX: /\\/g,
    DEFAULT_SPARKLINE_SETTINGS: {type: 'line', lineColor: '#008000', highlightSpotColor: null, minSpotColor: null, maxSpotColor: null, spotColor: null, fillColor: null},

    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.popupHandler = null;
        this.menu = null;
        this.entityName = this.getParam("entityName");
        // basically just copies over the given keys from the load params
        // into the runtime settings map.
        this.mergeLoadParamsIntoContext("results", ["displayRowNumbers", "dataOverlayMode"]);

        //this.displayMenu = Splunk.util.normalizeBoolean(this._params.displayMenu);

        this.drilldown   = this.getParam("drilldown");
        this.drilldownPrefix = this.getParam("drilldownPrefix");
        this.fieldFormats = this.getParam('fieldFormats') || {};

        if ((this.drilldown != 'none') && this.displayMenu) {
            this.logger.error("You cannot enable both the new drilldown clicks and the old menu prototype.");
            this.displayMenu = false;
        }

        this.renderedCount = -1;
        this.resultsContainer = this.container;

        this.container.bind("mouseover", this.onRowMouseover.bind(this));
        this.container.bind("mouseout", this.onRowMouseout.bind(this));
        this.container.bind("click", this.onRowClick.bind(this));
        this.container.bind("keyup", this.onRowKeyup.bind(this));

        //in the click handler we only proceed if there's no selection
        // (wasnt a drag-selection masquerading as a click)
        // However two more pieces are required to prevent ctrl-click selection.
        // #1 is for most browsers, firefox/safari
        this.container.bind("mousedown", function(evt) {
            if (this.getNormalizedCtrlKey(evt)) evt.preventDefault();
        }.bind(this));
        // #2 is for IE.
        this.container.bind("selectstart", function(evt) {
            if (this.getNormalizedCtrlKey(evt)) return false;
        }.bind(this));

        this.setSortField(null);
        this.setSortAsc(false);

    },



    /**
     * We sometimes will require transformed results
     * see comments on this function in DispatchingModule.js for more details.
     */
    requiresTransformedResults: function() {
        return (this.getInferredEntityName()=="results");
    },

    onLoadStatusChange: function($super, statusInt) {
        $super(statusInt);
        if (statusInt == Splunk.util.moduleLoadStates.HAS_CONTEXT) {

            var context = this.getContext();
            if (context === null) {
                this.logger.warn('getContext could not retrieve a context object when called from SimpleResultsTable\'s onLoadStatusModule.');
                return;
            }

            if (context.get("results.dataOverlayMode")) {
                this.onResultsRendered();
            }
        }
        else if (statusInt == Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY) {
            this.hideDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        }
    },

    /**
     * Handle before job dispatch and set the appropriate status buckets and required fields.
     *
     * @param {Object} search Search object.
     */
    onBeforeJobDispatched: function(search) {
        // we use the method on AbstractPagedModule to get correct value from either runtime context or load param.
        var fields = this.getNormalizedFields();

        if (this.entityName!="results") {
            // SPL-66501 we do not need to set minimum status buckets.
            //search.setMinimumStatusBuckets(1);
            if (fields.length>0) {
                search.setRequiredFields(fields);
            }
        }
    },

    /**
     * Get the th node for the x'th column.
     *
     * @param {Number} x The x-coordinate for a cell in a table.
     * @param {Object} element A jQuery cell element reference.
     * @type String
     */
    getColumnFieldCell: function(x, element) {
        var resultsTable = element.parents("table.simpleResultsTable");
        if(x==0 && resultsTable.find("th:nth-child("+ (x + 1) +")").hasClass("pos")) {
            x++;
        }
        return resultsTable.find("th:nth-child("+ (x + 1) +")");
    },
    /**
     * Get a table cells column name.
     *
     * @param {Number} x The x-coordinate for a cell in a table.
     * @param {Object} element A jQuery cell element reference.
     * @type String
     */
    getColumnName: function(x, element) {
        return Splunk.util.trim(this.getColumnFieldCell(x, element).text());
    },

    /**
     * Get a table row's first td element.
     * this does NOT include the row-number cell which may be sometimes present.
     *
     * @param {Object} element A jQuery cell element reference.
     * @type Object
     */
    getRowFieldCell: function(element) {
        // this is much easier than walking back with $.prev()
        var tdNodes = $(element.parents("tr")[0]).find("td:not('.pos')");
        if (tdNodes.length>0) {
            return $(tdNodes[0]);
        }
        return element;
    },
    /**
     * Get the text value of the first cell in the given element's row.
     * this does NOT include the row-number cell which may be sometimes present.
     *
     * @param {Object} element A jQuery cell element reference.
     * @type String
     */
    getRowFieldValue: function(element) {
        return this.getRowFieldCell(element).text();
    },

    /**
     * Get the text value of the first column header in the element's table.
     * this does NOT include the empty row-number cell which may be sometimes
     * present in the upper left corner.
     *
     * @param {Object} element A jQuery cell element reference.
     * @type String
     */
    getRowFieldName : function(el) {
        return Splunk.util.trim($(el.parents("table.simpleResultsTable").find("th:not('.pos')")[0]).text());
    },



    /**
     * Get a table cells x and y coordinates.
     *
     * @param {Object} element A jQuery cell element reference.
     * @type Object
     * @return An object having x and y properties.
     */
    getXYCoordinates: function(element) {
        var previousColumns = (element[0].tagName == "TD") ? element.prevAll() : $(element.parents().filter("td")[0]).prevAll();
        var previousRows    = $(element.parents().filter("tr")[0]).prevAll();
        return {x:previousColumns.length, y:previousRows.length-1};
    },

    /**
     * Look for timerange attributes on the given tablecell
     * and return a Splunk.TimeRange instance.
     *
     * @param {Object} element A jQuery cell element reference.
     * @type Object
     * @return an instance of Splunk.TimeRange
     */
    getTimeRangeFromCell: function(rowCell) {
        var startTime   = rowCell.attr("startTime");
        var endTime     = rowCell.attr("endTime");
        // if we only have one _time value, then we throw away the milliseconds and return a timeRange around
        // that single second.
        if (!endTime) {
            startTime = parseInt(startTime, 10);
            endTime = startTime + 1;
        }
        return new Splunk.TimeRange(startTime, endTime);
    },



    /**
     * Retrieve the inferred data results or events. If entityName is "auto" defers to job areResultsTransformed method.
     */
    getInferredEntityName: function() {
        // In some invalid cases, this could request the parent's context when
        // the parent has no context. It only seems to be an issue when saved
        // searches are requested which do not exist.
        try {
            var context = this.getContext();
        } catch(err) {
            this.logger.error(err);
            return (this.entityName == "auto") ? "results" : this.entityName;
        }
        if (this.entityName == "auto") {
            var search = context.get("search");
            if (!search) {
                return "results";
            }
            return (search.job.areResultsTransformed()) ? "results" : "events";
        } else {
            return this.entityName;
        }
    },

    getResultParams: function($super) {
        var params = $super();
        var context = this.getContext();
        var search  = context.get("search");
        var sid         = search.job.getSearchId();
        var timeRange   = search.getTimeRange();

        if (!sid) this.logger.error(this.moduleType, "Assertion Failed. getResultParams was called, but searchId is missing from my job.");

        params.sid = sid;
        params.entity_name = this.getInferredEntityName();
        params.display_row_numbers = context.get("results.displayRowNumbers");

        if (search.job.isPreviewable() && !search.job.isDone()) {
            params.show_preview = "1";
        }

        var postprocess = search.getPostProcess() || "";

        if (this.getSortField()) {
            var sortClause = [];
            sortClause.push("| sort ");
            // in case you're confused, offset and count will ALWAYS be present
            // here courtesy of the parent class.
            // NOTE - because AbstractPagedModule checks for sortField,
            //        there will never be any reversals active here.
            var minimumRequiredOffset = parseInt(params.offset, 10) + parseInt(params.count, 10);

            if (Splunk.util.isInt(minimumRequiredOffset)) {
                sortClause.push(minimumRequiredOffset + " ");
            }
            if (!this.getSortAsc()) {
                sortClause.push("- ");
            }

            // because it's going inside double quotes,
            // we escape any double quote chars with literal 2-character value \"
            // and before that, we have to lift all other existing backslash literals up a level,
            // by replacing ALL \  with \\.
            sortClause.push(sprintf('"%s"', this.getSortField().replace(this.BACKSLASH_ESCAPE_REGEX, '\\\\').replace(this.QUOTE_ESCAPE_REGEX, '\\\"')));

            postprocess += sortClause.join("");

            params.sortField = this.getSortField();
            if (this.getSortAsc())
                params.sortDir = "Asc";
            else
                params.sortDir = "Desc";
        }

        if (postprocess != "")
            params.postprocess = postprocess;

        // Check that this search has any transforming commands.
        // If it does, then our field_list argument will have unintended consequences
        // and will generally be meaningless.
        // TODO: this currently has a quirk that makes tabular event data show
        //      all fields when entityName=events, isTransforming=true
        if (!Splunk.util.normalizeBoolean(this.getParam('allowTransformedFieldSelect'))
            && (search.job.areResultsTransformed())) {
            delete params["field_list"];
        }
        if (this.drilldown != "none" || params.entity_name=="events") {
            params["mark_interactive"] = 1;
        }
        return params;
    },

    /**
     * SimpleResultsTable can have child modules.
     * and IF it is currently holding a _selection state,  it will pass on the details
     * of that selection to the downstream modules.
     */
    getModifiedContext : function() {
        var context = this.getContext();
        if (this._selection) {
            for (key in this._selection) {
                context.set(this.drilldownPrefix + "." + key, this._selection[key]);
            }

            var search = context.get("search");
            var searchRange = search.getTimeRange();

            var searchModified = false;
            // if the selection itself has a timeRange (ie this is a timechart or an event click)
            // then we use that.
            if (this._selection.timeRange) {
                search.setTimeRange(this._selection.timeRange);
                searchModified = true;
            // otherwise, if this is a relative or realtime search.
            // then we take the current absolute-time snapshot FROM THE JOB
            // and use that as the drilldown timerange.
            } else if (!searchRange.isAbsolute() && !searchRange.isAllTime()) {
                var job = this.getContext().get("search").job;
                search.setTimeRange(job.getTimeRange());
                searchModified = true;
            }

            // if this is a transformed search, but we are specifically displaying events
            // we need to modify the context or else the click args will be invalid at best
            if (this.entityName == "events" && search.job.areResultsTransformed()) {
                var eventSearch = search.job.getEventSearch();
                search.abandonJob();
                search.setBaseSearch(eventSearch);
                searchModified = true;
            }
            /*
            if (search.getPostProcess()) {
                search.setPostProcess(false);
                searchModified = true;
            }
            */

            // push the modified search back into the context.
            if (searchModified) context.set("search", search);
        }


        // Since Tables can be paged, and can now contain child modules, and
        // those child modules can themselves be paged,  it's important to
        // clear out offset information, as well as the call back for the
        // master/slave paginator logic.
        context.set("results.offset", 0);
        context.set("results.upstreamPaginator", null);
        return context;
    },

    isReadyForContextPush: function($super) {
        if (!this._selection) {
            return Splunk.Module.CANCEL;
        }
        return $super();
    },


    /**
     *  Returns the appropriate element to highlight, which will be either a row or a tablecell.
     */
    getElementToHighlight: function(el) {
        if (!$(el).parent().length) return false;
    
        if ($(el).hasClass('pos') ) return false;

        // if this is a multivalue field and you're over the TD instead of over a value, we bail..
        if (el.tagName == 'TD' && $(el).find("div.mv").length > 0) return false;

        var row = $(el).parents("#" + this.moduleId + " tr").get(0);

        switch (this.drilldown) {
            case "all":
                return $(el);
            case "row":
                return $(row);
            default:
                // drilldown configuration takes precedence.
                // only after we've given them a chance does this take effect.
                if (this.getInferredEntityName() == "events") {
                    return $(el);
                }
        }
        return false;
    },
    getNormalizedCtrlKey: function(evt) {
        // lazily loading to avoid re-evaling the regex.
        if (!this.hasOwnProperty("isMac")) this.isMac = /mac/.test(navigator.userAgent.toLowerCase());
        return (this.isMac) ? evt.metaKey : evt.ctrlKey;
    },
    getSelectionState: function(evt) {
        var el = $(evt.target);
        var coordinates = this.getXYCoordinates(el);
        var selection = {};
        var rowCell;

        if (this.drilldown == "none") {
            return false;
        } else if (this.drilldown == "all") {
            // if this is configured to do cell click, but the cell in particular is not marked as clickable.

            if (!el.hasClass('d') && !el.parent().hasClass('d')) return;

            selection.element = el;
            selection.name   = this.getRowFieldName(el);
            selection.value  = this.getRowFieldValue(el);

            selection.name2  = this.getColumnName(coordinates.x, el);
            selection.value2 = el.text();


        } else if (this.drilldown == "row") {
            rowCell = $($(el).parents("tr")[0]);
            selection.element = rowCell;
            selection.name    = Splunk.util.trim($(el.parents("table.simpleResultsTable").find("th:not('.pos')")[0]).text());
            selection.value   = this.getRowFieldValue(el);
            // for row clicks the second pair is the same, but we send it anyway.
            // as far as what information we send downstream, this is EXACTLY as though we were
            // in drilldown='all'  and the user actually clicked on the first column.
            selection.name2  = selection.name;
            selection.value2 = selection.value;
        }

        selection.modifierKey = this.getNormalizedCtrlKey(evt);

        if (selection.name == "_time") {
            rowCell = this.getRowFieldCell(el);
            selection.timeRange = this.getTimeRangeFromCell(rowCell);
        }

        // temporary fix for SPL-27829. For more details see comment in FlashChart.js,
        //   on FlashChart.stripUnderscoreFieldPrefix();
        if (selection.name2 && selection.name2.indexOf(this.LEADING_UNDERSCORE_PREFIX) !=-1) {
            selection.name2 = selection.name2.replace(this.LEADING_UNDERSCORE_PREFIX, "_");
        }
        return selection;
    },

    isSortingElement: function(el) {
        return el[0].tagName == 'A' && el.parent()[0].tagName == 'TH' || (el[0].tagName == 'TH');
    },

    onRowMouseover: function(evt) {
    	if ($(evt.target).is('.empty_results, .resultStatusHelp a')) return false;
        if (this.drilldown == 'none' && this.getInferredEntityName() != "events") return false;

        var toHighlight = this.getElementToHighlight(evt.target);
        if (toHighlight) {
            toHighlight.addClass('mouseoverHighlight');
            if (this.drilldown == "all") {
                // I'd really like to just take the existing jquery collection in toHighlight and merge it with
                //    these two other jquery objects, and do it all within 'getElementToHighlight' even
                //    however $().add() needs to do it all within one monolithic xpaths which is weak.
                this.getRowFieldCell(toHighlight).addClass('mouseoverHighlight');
                var coordinates = this.getXYCoordinates(toHighlight);
                this.getColumnFieldCell(coordinates.x, toHighlight).addClass('mouseoverHighlight');
            }
        }
    },

    onRowMouseout: function(evt) {
    	if ($(evt.target).is('.empty_results, .resultStatusHelp a')) return false;
        if (this.drilldown == 'none' && this.getInferredEntityName() != "events") return false;

        var toHighlight = this.getElementToHighlight(evt.target);
        if (toHighlight) {
            toHighlight.removeClass('mouseoverHighlight');
            if (this.drilldown == "all") {
                this.getRowFieldCell(toHighlight).removeClass('mouseoverHighlight');
                var coordinates = this.getXYCoordinates(toHighlight);
                this.getColumnFieldCell(coordinates.x, toHighlight).removeClass('mouseoverHighlight');
            }
        }
    },

    /**
     * If the module is configured with drilldown='none', meaning there's no downward-travelling clicks
     * AND the module finds itself rendering events,  we special case the handling of clicks.
     * In this case clicking on field values and _time values will have essentially the same behaviour that
     * EventsViewer has.
     */
    onEventRowClick: function(evt) {
        var el = $(evt.target);
        // if this is a click on a multivalue cell, but not on ONE of the values, then bail.
        if (el.find("div.mv").length > 0) {
            return;
        }

        if (this._selection && this._selection.element) {
            this._selection.element.removeClass("selected");
        }
        this._selection = {};
        el.addClass("selected");
        this._selection.element = el;

        var name = this.getIntentionName(evt);
        var coordinates = this.getXYCoordinates(el);
        var fieldName = this.getColumnName(coordinates.x, el);
        if (fieldName == "_time") {
            var context = new Splunk.Context();
            var search  = new Splunk.Search("*");
            var range = this.getTimeRangeFromCell(el);

            search.setTimeRange(range);
            context.set("search", search);
            this.passContextToParent(context);
        } else {
            var intention = {
                arg: {},
                name: name
            };
            intention.arg[fieldName] = el.text();
            intention = this.getKeydownMutatedIntention(intention, evt);
            this.passIntention(intention);
        }
    },

    /**
     * returns a string representing the currently selected text in the browser.
     */
    getCurrentSelectedText: function() {
        var selectedText = "";
        var range;
        if (window.getSelection) {        // Firefox, Opera, Safari
            range = window.getSelection();
            selectedText = range.toString();
        }
        else {
            if (document.selection && document.selection.createRange) {        // Internet Explorer
                range = document.selection.createRange ();
                selectedText = range.text;
            }
        }
        return selectedText;
    },

    onRowKeyup: function(evt) {
        // only proceed if the user pressed enter key
        if (evt.which == 13) {
            return this.onRowSelect(evt);   
        }

        return true;
    },

    onRowClick: function(evt) {
        // browsers are annoying.  If you have say a tablecell, call it A,  and a link element, call it B.
        // and there's a mousedown on B,  then you move the mouse and mouseup on A.  Whether or not there's a selection,
        // firefox says this is not a click, therefore no onRowClick firing, therefore no problem. Happy user copy's and pastes.
        // if there's a mousedown on B, some moving of the mouse and mouseup on B.  ok. This sucks.  Even if the human's
        // intention is to select text,  the browser calls this a click.  So we explicitly check for a text selection.
        // if there's a text selection immediately at the moment of a click, then the click somehow managed to select text.
        // Operationally our UI interprets this to mean no click.  no harm no foul.
        if (this.getCurrentSelectedText().length > 0) {
            this.logger.debug("received a click event, or at least what the browser tells us is a click event, but there's a text selection right now so the browser's lying. Returning.");
            return false;
        }
        return this.onRowSelect(evt);
    },

    onRowSelect: function(evt) {
        var el = $(evt.target);

        // let normal links through
        if (el.is('a')) {
            return true;
        }

        // skip the number column
        if (el.hasClass('pos')) return;

        //1. Sorting Clicks

        // when the little sorting arrows themselves arent clickable god kills a kitten.
        if (el[0].tagName == 'SPAN') el = el.parent();

        // Check if this is a click on a sorter.
        if (this.isSortingElement(el)) {
            // SPL-73850 - Prevent default for clicks on table headers since the <a> elements now do have a href
            evt.preventDefault();
            var sortField = Splunk.util.trim(el.text());
            if (sortField == this.getSortField()) {
                this.setSortAsc(!this.getSortAsc());
            } else {
                this.setSortAsc(false);
                this.setSortField(sortField);
            }
            this.getResults();
            return;
        }

        // if this is a multivalue field and you're clicking the TD instead of a value, we bail..
        if (el[0].tagName == 'TD' && $(el).find("div.mv").length > 0) return false;

        //2 No drilldown type is configured.
        if (this.drilldown == "none") {
            if (this.getInferredEntityName() == "events") {
                return this.onEventRowClick(evt);
            }
            return;
        }


        // bail if somehow this isnt a td element
        if (el[0].tagName != 'TD' && el.parent()[0].tagName != 'TD') return;

        //3 hereafter we are definitely handling a drilldown click.
        // Make our child modules visible.
        this.showDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        var coordinates;
        // remove old highlighting.
        if (this._selection && this._selection.element) {
            this._selection.element.removeClass("selected");
            if (this.drilldown == "all") {
                this.getRowFieldCell(this._selection.element).removeClass('selected');
                coordinates = this.getXYCoordinates(this._selection.element);
                this.getColumnFieldCell(coordinates.x, this._selection.element).removeClass('selected');
            }
        }
        this._selection = this.getSelectionState(evt);
        // add new highlighting.
        if (this._selection && this._selection.element) {
            this._selection.element.addClass("selected");
            if (this.drilldown == "all") {
                this.getRowFieldCell(this._selection.element).addClass('selected');
                coordinates = this.getXYCoordinates(this._selection.element);
                this.getColumnFieldCell(coordinates.x, this._selection.element).addClass('selected');
            }
        }

        // now that we have setup the selection state,
        // that selection state will be put onto the context
        // within getModifiedContext
        // All we do here is push.
        this.pushContextToChildren();
    },


    /**
     * Handle a new search. See $super for implementation details.
     */
    onContextChange: function($super) {
        $super();

        this._selection = null;
        this.hideDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);

        this.renderedCount = -1;

        var context = this.getContext();
        if (this.haveResultParamsChanged()) {
            var search  = context.get("search");
            if (search.job.isDone() || (search.job.getEventAvailableCount() > 0)) {
                this._pageComplete = false;
                this.getResults();
            }
        }
        //TODO - another use case for a way to know if the given key has changed.
        // TODO - I THINK THIS IS STILL NECESSARY BUT IM NOT SURE WHY.
        else if (context.has("results.dataOverlayMode")){
            this.onResultsRendered();
        }
    },


    onJobProgress: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        var isJobDone = search.job.isDone();

        //add control logic for event sorting
        if (this.getInferredEntityName()=="events") {
            if (search.job.getEventSorting()=="desc") {
                var needMoreEvents = this.renderedCount < context.get("results.count");
                var moreEventsAreAvailable = search.job.getEventAvailableCount()>this.renderedCount;
                if (needMoreEvents && moreEventsAreAvailable){
                    // Need to remember that we've already asked for these events
                    // for the case when the next progress event occurs before renderResults.
                    // without this assignment we will get multiple calls to getResults
                    // competing with eachother or perhaps aborting eachother.
                    this.renderedCount = Math.min(search.job.getEventAvailableCount(), context.get("results.count"));

                    //this.logger.info("onJobProgress triggering getResults");
                    this.getResults();
                }
            } else {
                this.getResults();
            }
        //add control logic for preview case
        } else {
            if (search.job.isPreparing())
            {
                var message = _('Waiting for search to start: job is preparing.');
                if (search.job.isQueued())
                {
                    message = _('Waiting for search to start: job is queued.');
                }
                else if (search.job.isParsing())
                {
                    message = _('Waiting for search to start: evaluating subsearches.'); 
                }
                
                this.resultsContainer.html(
                        '<p class="resultStatusMessage">'
                        + message
                        + '</p>'
                    );
            }
            else if (!search.job.isPreviewable() && !search.job.isDone()) {
                this.resultsContainer.html(
                        '<p class="resultStatusMessage">'
                        + _('Waiting for search to complete...')
                        + '</p>'
                    );
            } else {
                this.getResults();
            }
        }
    },

    onJobDone: function(event) {
        if (this.getInferredEntityName()=="results") {
            this.getResults();
        }
    },
    /**
     * Reset the UI to its original state.
     */
    resetUI: function(){
        this.resultsContainer.html("");
    },
    /**
     * Override and set renderedCount. See $super for implementation details.
     */
    showInfoMessage: false,
    renderResults: function($super, htmlFragment) {
        $super(htmlFragment);
        if (this.getInferredEntityName()=="events") {
            this.renderedCount = $("tr", this.container).length - 1;
        }

        // SPL-82119 - show message describing maxseries limit
        if(this.getContext().get('groupSelection') == 'index' && $(window.location.href.indexOf('indexing_volume') > -1 && "tr", this.container).length - 1 <= 10) {
            this.showInfoMessage = true;
        }

        if(this.showInfoMessage && $('.viewHeader #metricsInfoMessage').length == 0) {
            $('.viewHeader').prepend(' <h5 id="metricsInfoMessage">Note: By default metrics.log shows the 10 busiest of each type, for each sampling window. The sampling quantity is adjustable in limits.conf, [metrics] maxseries = num.</h5>');
        }
    },


    getFieldFormat: function(fieldName, type) {
        var fieldFormats = this.fieldFormats;
        var tryFields = [fieldName, '*'];
        for (var i=0, len=tryFields.length; i<len; i++) {
            if (fieldFormats[tryFields[i]]) {
                match = $.grep(fieldFormats[tryFields[i]], function(entry) {
                    return entry.type == type;
                });
                if (match)
                    return match[0];
            }
        }
    },


    onResultsRendered: function() {
        //this.logger.debug('SimpleResultsTable.onResultsRendered - START');
        var context = this.getContext();
        if (!context.has("results.dataOverlayMode")) return false;

        switch(context.get("results.dataOverlayMode")) {
            case "none":
                this.resetHeatMap(this.container);
                this.decorateBounds(this.container, false, false);
                break;
            case "heatmap":
                this.decorateBounds(this.container, false, false);
                this.decorateHeatMap(this.container);
                break;
            case "highlow":
                this.resetHeatMap(this.container);
                this.decorateBounds(this.container, true, true);
                break;
            default:
                this.logger.warn("Context contains unsupported dataOverlayMode value of", context.get("results.dataOverlayMode"));
                break;
        }

        var self = this;
        var $sl = $("span.sparklines", this.container);
        $sl.each(function() {
            var el = $(this);
            var coordinates = self.getXYCoordinates(el);
            var fieldName = self.getColumnName(coordinates.x, el);
            var sld = [];
            var fieldFormat = self.getFieldFormat(fieldName, 'sparkline');
            var sparkline_settings = fieldFormat ? fieldFormat.options : self.DEFAULT_SPARKLINE_SETTINGS;

            $("div.mv",this).each(function() {
                var datum = parseInt(this.innerHTML, 10);
                if (!isNaN(datum)) {
                    sld.push(datum);
                }
            });

            $(this).html("").sparkline(sld, sparkline_settings);
        });

    },

    decorateHeatMap: function(container) {

        // define heat map targets
        var high = [230, 49, 53];
        var low = [62, 135, 191];
        var neutral = [245 ,245 ,245];

        $('td[heat]', container).each(function() {
            var heat = parseFloat(this.getAttribute('heat'));
            var r2, b2, g2;
            if (heat != 0) {
                target = (heat > 0 ? high : low);

                r2 = parseInt(target[0] + (neutral[0] - target[0]) * (1-Math.abs(heat)), 10);
                b2 = parseInt(target[1] + (neutral[1] - target[1]) * (1-Math.abs(heat)), 10);
                g2 = parseInt(target[2] + (neutral[2] - target[2]) * (1-Math.abs(heat)), 10);

                this.style.backgroundColor = 'rgb(' + r2 + ',' + b2 + ',' + g2 + ')';
            }
        });

    },

    resetHeatMap: function() {
        $('td[heat]', this.container).each(function() {
            this.style.backgroundColor = '';
        });

    },

    decorateBounds: function(container, showLow, showHigh) {
        if (showHigh) {
            $('td[isMax]', container).addClass('highValue');
        } else {
            $('td[isMax]', container).removeClass('highValue');
        }

        if (showLow) {
            $('td[isMin]', container).addClass('lowValue');
        } else {
            $('td[isMin]', container).removeClass('lowValue');
        }
    }

});
