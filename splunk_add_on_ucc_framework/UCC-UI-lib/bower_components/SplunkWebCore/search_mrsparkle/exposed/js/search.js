Splunk.Search = $.klass({
    _baseSearch: false,
    _fullSearchWithIntentions: false,
    _postProcess: false,
    _range : false,
    _intentions: [],
    _maxTime : 0,
    _maxCount: false,
    _maxEvents: false,
    _savedSearchName: false,
    _remoteServerList: [],
    _selectedEventCount: -1,
    _selectedEventAvailableCount: -1,
    _acl: {},

    _statusBuckets: 0,
    _requiredFieldList: [],
    
    job : false,
    logger: Splunk.Logger.getLogger("search.js"),
    messenger: Splunk.Messenger.System.getInstance(),

    initialize: function(searchStr, timeRange) {
        this._baseSearch = searchStr || "*";
        if (searchStr) {
            this.job = new Splunk.Job(searchStr);
        }
        this._range = timeRange || new Splunk.TimeRange();
        this._intentions = [];
    },
    clone: function(noArg) {
        if (noArg) this.logger.error("the preserveJobReference arg has been removed from Search.clone");
        var search = new Splunk.Search(this._baseSearch, this.getTimeRange().clone());
        search._fullSearchWithIntentions = this._fullSearchWithIntentions;
        search._intentions = $.extend(true,[],this._intentions);

        if (this.job) search.job = this.job;

        search._savedSearchName = this._savedSearchName;
        search._viewStateId = this._viewStateId;
        search._remoteServerList = this._remoteServerList;
        search._selectedEventCount = this._selectedEventCount;
        search._selectedEventAvailableCount = this._selectedEventAvailableCount;
        search._postProcess = this._postProcess;
        search._statusBuckets = this._statusBuckets;
        search._requiredFieldList = this._requiredFieldList;
        search._maxTime = this._maxTime;
        search._maxEvents = this._maxEvents;
        search._maxCount = this._maxCount;
        search._acl = this._acl;
        search.decompositionFailed = this.decompositionFailed;
 
        return search;
    },
    equalToSearch: function(search) {
        if (this.job && search.job && this.job.getSearchId() != search.job.getSearchId()) return false;
        if (this.isJobDispatched() != search.isJobDispatched()) return false;
        if (this.toString()    != search.toString()) return false;
        if (!Splunk.util.objectSimilarity(this._intentions, search._intentions)) return false;
        if (!Splunk.util.objectSimilarity(this._remoteServerList, search._remoteServerList)) return false;
        if (!search.getTimeRange().equalToRange(this.getTimeRange())) return false;
        if (search._selectedEventCount != this._selectedEventCount) return false;
        if (search._selectedEventAvailableCount != this._selectedEventAvailableCount) return false;
        if (search._postProcess != this._postProcess) return false;
        return true;
    },
    abandonJob: function() {
        this.job = null;
        if (this._fullSearchWithIntentions && this._intentions.length ==0) {
            this._baseSearch = this._fullSearchWithIntentions;
        }
        this._selectedEventCount = -1;
        this._selectedEventAvailableCount = -1;
        this._statusBuckets = 0;
        this._requiredFieldList = []; 

    },
    isJobDispatched: function() {
        return !!(this.job && this.job.getSearchId());
    },
    
    toString: function() {
        return this._fullSearchWithIntentions || this._baseSearch;
    },
    getSearch: function() {
        this.logger.warn("Splunk.Search.getSearch is deprecated. use Splunk.Search.toString");
        return this.toString();
    },
    getBaseSearch: function() {
        return this._baseSearch;
    },
    setBaseSearch: function(search) {
        if (this.isJobDispatched()) {
            this.logger.error("Assertion failed - setSearchStr should not be called once a Search is running. If your intention is to abandon the running job, you can call this.abandonJob() although think hard about whether you need to cancel the running one.");
        }
        if (this._baseSearch != search) {
            this._savedSearchName = false;    
        }
        this._baseSearch = search;
        this._fullSearchWithIntentions = null;
    },
    getSavedSearchName: function() {
        return this._savedSearchName;
    },
    setSavedSearchName: function(name) {
        this._savedSearchName = name;
    },
    getViewStateId: function() {
        return this._viewStateId;
    },
    setViewStateId: function(id) {
        this._viewStateId = id;
    },


    getPostProcess: function() {
        return this._postProcess;
    },
    setPostProcess: function(search) {
        this._postProcess = search;
    },

    getMaxCount: function() {
        return this._maxCount;
    },
    setMaxCount: function(count) {
        if (!Splunk.util.isInt(count)) {
            this.messenger.send("error", "splunk.search.job", sprintf(_("specified maxCount (%count)s is not an integer"), {count: count}));
        }
        this._maxCount = count;
    },
    getMaxEvents: function() {
        return this._maxEvents;
    },
    setMaxEvents: function(count) {
        if (!Splunk.util.isInt(count)) {
            this.messenger.send("error", "splunk.search.job", sprintf(_("specified maxEvents (%count)s is not an integer"), {count: count}));
        }
        this._maxEvents = count;
    },

    // remote server list specifies which of the distributed peers the search
    // should run against (including the main server distributing the search).
    // values in the list are splunkd instance names, not hostnames.
    // and they end up as the remote_server_list POST argument to dispatch.
    getDistributedServerList: function() {
        return this._remoteServerList;
    },
    setDistributedServerList: function(serverList) {
        this._remoteServerList = serverList;
    },
    getMinimumStatusBuckets: function() {return this._statusBuckets;},
    setMinimumStatusBuckets: function(statusBuckets) {
        if (statusBuckets > this._statusBuckets) {
            this._statusBuckets = statusBuckets;
        }
    },
    getMaxTime: function() {return this._maxTime;},
    setMaxTime: function(maxTime) {this._maxTime = maxTime;},
    getRequiredFieldList: function() {return this._requiredFieldList;},
    setRequiredFields: function(requiredFieldList) {
        // Make a copy of arguments list, could mutate while deduping. SPL-37431
        requiredFieldList = $.extend([], requiredFieldList);

        // if we're already ["*"] then that's all she wrote.
        if (this._requiredFieldList.indexOf("*") != -1) {
            return;
        }
        // if the specified field list has star in it, set it to just "*"
        else if (requiredFieldList.indexOf("*") != -1) {
            this._requiredFieldList = ["*"];
            return;
        }
        else {
            // remove duplicates. (doesnt check for duplicates in the input itself)
            for (var i=0, len=this._requiredFieldList.length; i<len; i++) {
                var incomingIndex = requiredFieldList.indexOf(this._requiredFieldList[i]);
                if (incomingIndex !=-1) {
                    requiredFieldList.splice(incomingIndex,1);
                }
            }
            this._requiredFieldList = this._requiredFieldList.concat(requiredFieldList);
        }
    },

    /**
     * Returns the proper URI for assets on this current job.
     *
     * TODO: inspect the <link> attributes on the job feed to get
     * auto-population of these locations.
     *
     */
    getUrl: function(asset, optionalArgs) {
        var args = optionalArgs || {};

        var sid = this.job.getSearchId();
        if (!sid) {
            sid = 'NO_SID';
            this.logger.error('getUrl called on search job without an SID');
        }

        var base = Splunk.util.make_url('api/search/jobs', sid);

        if (!asset) return base;

        asset = asset.toLowerCase();

        switch(asset) {
            case 'results':
            case 'control':
                return base + '/' + asset;

            case 'summary':
            case 'events':
            case 'timeline':
                var range = this.getTimeRange();
                if (range.isSubRangeOfJob()) {
                    args['earliest_time'] = range.getEarliestTimeTerms();
                    args['latest_time']   = range.getLatestTimeTerms();
                    args["output_time_format"] = Splunk.util.getConfigValue('SEARCH_RESULTS_TIME_FORMAT');
                }
                //this.logger.debug("Search.getURL", "for asset=" + asset + " earliest_time= " + args["earliest_time"]);
                //this.logger.debug("Search.getURL", "for asset=" + asset + " latest_time= " + args["latest_time"]);
                var url = base + '/' + asset + '?' + Splunk.util.propToQueryString(args);
                //alert(url);
                return url;
            default:
                break;
        }

        this.logger.error('Requested unknown search job asset:', asset);
        return false;
    },


    /////////////////////////////////////////
    // TimeRange methods
    /////////////////////////////////////////

    getTimeRange: function() {
        return this._range;
    },

    /**
     * clears any time terms in the users search.
     *
     */
    clearTimeRange: function() {
        this._range = new Splunk.TimeRange();
        this.setSavedSearchName(false);
        return this;
    },

    /**
     */
    setTimeRange: function(range) {
        if (!this._range.equalToRange(range)) {
            this.setSavedSearchName(false);
        }
        this._range = range;
        return this;
    },
    /*
     * This method hides the delegation to this.job.getEventCount
     * and when something has selected a smaller range within the overall search
     * , it will return the event count for that.
     * Clients who need the overall eventCount even in that situation can still
     * use search.job.getEventCount()
     */
    getEventCount: function() {
        if (this._selectedEventCount == -1) {
            return this.job.getEventCount();
        }
        return this._selectedEventCount;
    },
    /*
     * See above comment on Search.getEventCount()
     */
    getEventAvailableCount: function() {
        if (this._selectedEventAvailableCount == -1) {
            return this.job.getEventAvailableCount();
        }
        return this._selectedEventAvailableCount;
    },
    /*
     * if modules such as FlashTimeline are using search.setTimeRange()
     * to select a subset of the timerange, they should iterate over the timeline
     * data, and then use this method to set accurate numbers for eventCount
     * and eventAvailableCount.
     */
    setSelectedEventCount: function(count) {
        this._selectedEventCount = count;
    },
    /*
     * see above comment on Search.setSelectedEventCount()
     */
    setSelectedEventAvailableCount: function(count) {
        this._selectedEventAvailableCount = count;
    },


    /**
     * Handles dispatch requests.  Determines whether it needs to collapse the
     * intentionStack, or if the search can be dispatched.
     * onSuccess and onFailure are two optional callbacks that can be passed.
     *
     */
    dispatchJob: function(onSuccess, onFailure, group) {
        
        var range = this.getTimeRange();
        if (range.isSubRangeOfJob()) {
            range.setAsSubRangeOfJob(false);
            if(this.isJobDispatched()) {
                // do not reset status buckets unless the job was dispatched
                this.abandonJob();
            }
        }
        if (this.isJobDispatched()) {
            this.logger.error("Assertion Failed -- call to redispatch a search that already had a searchId=" + this.job.getSearchId());
            return false;
        }
        // IF this search requires a roundtrip to the server in
        // order to flatten intentions, it will make one.  Either way, barring
        // the unexpected, the successHandler will be called.
        // -- searchStr - absorbIntentions will pass this as the only argument to our passed function.
        // -- likewise onSuccess and onFailure are passed along from the arguments we received.
        
        this.absorbIntentions(function(searchStr) {
            
            // if onFailure is called by this fork, it'll mean we parsed successfully but failed to start the search
            this._startTransformedSearch(searchStr, onSuccess, onFailure, group);
        }.bind(this),
        // On the other hand if onFailure is called by this fork, we failed to parse the search at all.
        onFailure);
        return true;
    },
    /**
     * This will take the final searchStr and actually POST to kickoff the job on the backend.
     */
    _startTransformedSearch: function(searchStr, onSuccess, onFailure, group) {
        
        var autoCancelInterval = Splunk.util.getAutoCancelInterval();
        if (autoCancelInterval && Splunk.Globals['Jobber'] && (autoCancelInterval < Splunk.Globals['Jobber'].KEEP_ALIVE_INTERVAL/1000)) {
            this.logger.error("autoCancelInterval (", autoCancelInterval, ") is set to less than the Jobber's KEEP_ALIVE_INTERVAL (", (Splunk.Globals['Jobber'].KEEP_ALIVE_INTERVAL/1000), ") which can result in jobs getting cancelled if they go a long time in between progress events.");
        }
        // set defaults and dispatch
        
        var args = {
            'search': searchStr,
            'status_buckets': this.getMinimumStatusBuckets(),
            'namespace': Splunk.util.getCurrentApp(),
            'ui_dispatch_app': Splunk.util.getCurrentApp(),
            'ui_dispatch_view': Splunk.util.getCurrentDisplayView(),
            'auto_cancel': autoCancelInterval,
            'wait': 0
        };

        if (this.getSavedSearchName()) {
            args["label"] = this.getSavedSearchName();
        }
        if (this.getMaxTime() > 0) {
            args["max_time"] = this.getMaxTime();
        }
        if (this.getMaxCount()) {
            args["max_count"] = this.getMaxCount();
        } 
        if (this.getMaxEvents()) {
            args["auto_finalize_ec"] = this.getMaxEvents();
        } 

        var requiredFieldList = this.getRequiredFieldList();
        if (requiredFieldList.length > 0) {
            args["required_field_list"] = requiredFieldList.join(",");
        }
        
        if (this._searchModeLevel) {
            args["adhoc_search_level"] = this._searchModeLevel;
        }
        
        if (this.getDistributedServerList().length>0) {
            args["remote_server_list"] = this.getDistributedServerList().join(",");
        }
        var range = this.getTimeRange();
        args["earliest_time"] = range.getEarliestTimeTerms();
        args["latest_time"]   = range.getLatestTimeTerms();
        if (range.getAbsoluteEarliestTime() || range.getAbsoluteLatestTime()) {
            args["timeFormat"] = Splunk.util.getConfigValue('DISPATCH_TIME_FORMAT');
        }

        this.logger.info('_dispatchNewSearch - search=' + searchStr + ' earliest_time=' + args["earliest_time"] + " latest_time=" + args["latest_time"]);
        
        // TODO - EXTREMELY IMPORTANT.  WITH THE CONTEXT CLEANUP, THIS CLONE IS NO LONGER NECESSARY. 
        // TODO TRIPLE CHECK THE ABOVE STATEMENT
        var clonedSearch = this;
        if (Splunk._testHarnessMode) {
            clonedSearch.job.setSearchId("TEST_HARNESS_MODE_ID_" + (20000*Math.random()));
            onSuccess(clonedSearch);
            return;
        } else {
            var statusMonitor = Splunk.Globals['PageStatus'].register('Search - POST to dispatch new job.');
        
            $.post(
                Splunk.Globals['Jobber'].JOB_MGMT_ENDPOINT,
                args,
                function(data) {
                    // Got a valid response from splunkd and an sid, on to the
                    // show!
                    if (data['success'] && data['data']) {
                        if (!this.job) {
                            this.job = new Splunk.Job(this.toString());
                        }
                        this.job.setSearchId(data['data']);
                        
                        // we dispatched it, so unless the user saves it, this job will be safe to cancel onunload.
                        this.job.setAsAutoCancellable(true);
                        // NOTE - the callback may well call setAsAutoCancellable(false) so dont mess with the order here.
                        onSuccess(this);
                        // notify anyone who's listening.
                        if (!this.job.getCreateTime()) {
                            // not ideal, but we dont know the actual jobCreate time, so we use now() on the client and correct for the timezone offset on display.
                            this.job.setCreateTime(new Date().getTime()/1000);
                        }
                        
                        $(document).trigger('jobDispatched', [this.job, group]);
                        statusMonitor.loadComplete();

                    // Got an unsuccessful response from splunkd, maybe the
                    // search string was malformed, or we got a response that
                    // didn't even contain a success property.
                    } else if (!data['success']) {
                        
                        this.logger.error("Assertion Failed: Splunkd returned an unsuccessful response when trying to dispatch a search:", data);
                        if (data.hasOwnProperty("messages")) {
                            var messages = data["messages"];
                            for (var i=0; i<messages.length; i++) {
                                var msg = messages[i];
                                var className = (msg["type"]=="FATAL")?"splunk.services":"splunk.search.job";
                                this.messenger.send(msg["type"].toLowerCase(), className, msg["message"]);
                            }
                            
                        // fallback message if nothing comes back from appserver
                        } else {
                            this.messenger.send("fatal", "splunk.search.job", 
                                _("Splunkd returned an unsuccessful response when trying to dispatch a search. Try again or contact an admin.")
                            );
                        }
            
                        if (onFailure) onFailure(this);

                    // In this case it contained a success => true
                    // without an sid.  BONK!
                    } else {
                        this.messenger.send("fatal", "splunk.search.job", _("Could not get a search id for the search."));
                        this.logger.error("Received a successful response trying to dispatch a job but did not receive an sid:", data);
                        if (onFailure) onFailure(this);
                    }

                    // For now, always log messages returned.  We might want
                    // to limit this later.
                    if (data.messages && data.messages.length > 0) {
                        for(var k=0, j=data.messages.length; k<j; k+=1) {
                            var type = data.messages[k].type;
                            this.logger[((type=="FATAL")?"error":type.toLowerCase())](data.messages[k].text);
                        }
                    }
                }.bind(clonedSearch),
                'json'
            );
        }
    },

    /////////////////////////////////////////
    // Intention Methods
    /////////////////////////////////////////
    hasIntentions: function() {
        return this._intentions.length > 0;
    },
    addIntention: function(intentionDict) {
        if (!intentionDict) {
            throw ("Assertion Failed - addIntention called for null intention");
        } 
        this._fullSearchWithIntentions = null;
        this._intentions.push(intentionDict);
        this.setSavedSearchName(false);
    },
    setIntentions: function(intentionsList) {
        if (this._intentions.length) {
            this.logger.error("May be an error state. Somebody is replacing intentions. If you are a developer and you dont think this is an error state anymore, change it");
        }
        this._intentions = intentionsList;
        this._fullSearchWithIntentions = null;
        this.setSavedSearchName(false);
    },
    clearIntentions: function() {
        if (this.hasIntentions()) {
            this.setSavedSearchName(false);
        }
        this._intentions = [];
    },
    absorbIntentions: function(onSuccess, onFailure) {
        if (!this._baseSearch) throw(this._baseSearch + " is not a search");

        
        // TODO - pass the onFailure method if it exists.

        var search;
        if (this._intentions.length>0) {

            var clearIntention = this.getIntentionReference("clear");
            if (clearIntention) {
                this.logger.warn("Blowing away all existing intentions and previous search string due to 'clear'! Using arg value as replacement intention.");
                this._intentions = [clearIntention["arg"]];
                this.setBaseSearch("*");
            }
            search = Splunk.util.addLeadingSearchCommand(this._baseSearch );
            // if there's a drilldown intention and a postProcess, we have to 
            // a) append the postProcess search to the base search before we send to parse.
            // b) remove the postProcess arg from the search object here.
            if (this.getPostProcess() && this.getIntentionReference("drilldown")) {
                search += " | " + this.getPostProcess();
                this.setPostProcess(false);
            }

            var plotIntention = this.getIntentionReference("plot");
            if (plotIntention) {
                plotIntention["arg"]["defer"] = "False";
                // for consistency on the front-end, we're going to be putting
                // this splitType key into the intention arg,
                // even though, the backend has no idea what this means, we
                // just remove it here.
                if (plotIntention["arg"].hasOwnProperty("splitType")) {
                    delete plotIntention["arg"]["splitType"];
                }
                // if we dont even have a 'mode', then this is an invalid 'plot' 
                // intention and it will only confuse the intentions system.  
                // shut it down.
                if (!plotIntention["arg"].hasOwnProperty("mode")) {
                    this.popIntention("plot");
                }
                // if the mode was 'original', then we ignore everybody
                //if (plotIntention["arg"]["mode"] == "original") {
                //    this.popIntention("plot");
                //    var fieldsIntention = {name:"addfields", arg:plotIntention["arg"]["fields"].join(",")}
                //    this.addIntention(fieldsIntention);
                //} 
            }

            //this.logger.debug("sending to parse endpoint \nq=", q, "intentions=" + JSON.stringify(this._intentions));

            if (Splunk._testHarnessMode) {
                onSuccess("search 'Search is in _testHarnessMode and all intentions parsing is disabled'");
            } else {
                var statusMonitor = Splunk.Globals['PageStatus'].register('Search - POST to intention parser');
                $.post(
                    Splunk.util.make_url('/parser/parse'),
                    {
                        "q"              : search,
                        "intentions"  : JSON.stringify(this._intentions),
                        "namespace": Splunk.util.getCurrentApp()
                    },
                    function(responseText) {
                        this.parserCallback(responseText, onSuccess, onFailure);
                        statusMonitor.loadComplete();
                    }.bind(this)
                );
            }
        }
        // if intentions have somehow been added and then collapsed on this Search, we'll have this property.
        else if (this._fullSearchWithIntentions) {
            search = Splunk.util.addLeadingSearchCommand(this._fullSearchWithIntentions);
            
            onSuccess(search);
        // nobody's ever added any intentions to this Search, so _baseSearch is all we need.
        } else {
            search = Splunk.util.addLeadingSearchCommand(this._baseSearch);
            onSuccess(search);
        }
    },
    /*
     * essentially a private method. Never to be called outside of Search.
     * does the work for both getIntention and popIntention
     */
    getIntentionIndex : function(intentionName, secondArgKey) {
        for (var i=0, l=this._intentions.length; i<l; i++) {
            if (this._intentions[i].name == intentionName) {
                if (!secondArgKey) {
                    return i;
                } else {
                    // I know it's verbose, but this is a weird part and I want to
                    // keep this as readable as possible while we're forking things
                    // this way.
                    var isMatchingKeyValueIntention   = this._intentions[i]["arg"].hasOwnProperty(secondArgKey);
                    var isMatchingSearchTermIntention = (this._intentions[i]["arg"] == secondArgKey);
                    if (isMatchingKeyValueIntention || isMatchingSearchTermIntention) {
                        return i;
                    }
                }
            }
        }
        return -1;
    },
    popIntention: function(intentionName, secondArgKey) {
        var index = this.getIntentionIndex(intentionName, secondArgKey);
        if (index==-1) return false;
        return this._intentions.splice(index,1)[0];
    },
    getIntentionReference: function(intentionName, secondArgKey) {
        var index = this.getIntentionIndex(intentionName, secondArgKey);
        if (index==-1) return false;
        return this._intentions[index];
    },
    parserCallback: function(responseJSON, onSuccess, onFailure) {
        
        // 1.  check for 'search'.  Detect absence thereof which is not good. 
        if (responseJSON.hasOwnProperty("search")) {
            this._fullSearchWithIntentions = responseJSON['search'];
            this.job = new Splunk.Job(this._fullSearchWithIntentions);
            this._intentions = [];
            if (onSuccess) onSuccess(this._fullSearchWithIntentions);
            else this.logger.debug("No success handler for dispatching " + this._fullSearchWithIntentions);
        } 
        // having no no search AND no messages is very unlikely but very bad if it happens.
        // in the unlikely event of such a loss of cabin pressure, we log an error AND send a message.
        else {
            this.logger.warn(_("parser response was valid JSON but contained no search."));
            if (!responseJSON.hasOwnProperty("messages")) {
                var msg = _("parser response was valid JSON but contained neither search nor messages");
                this.messenger.send("error", "splunk.search.job", msg);
            } else {
                if (onFailure) onFailure(this.toString());
                else this.logger.error('parserCallback died but no onFailure');
            }
        }

        // 2.Lastly, whether we succeeded or not, we check for messages and send them.
        if (responseJSON.hasOwnProperty("messages")) {
            this.messenger.send("error", "splunk.search.job", responseJSON['messages'].join('\n'));
        }

    },
    /** 
     * TREAT AS PRIVATE METHOD. 
     * Silly method on its own. 
     * Extremely useful to overide for unit test coverage though. 
     */
    sendDocumentToLocation: function(doc, loc) {
        doc.location = loc;
    },
    /**
     * call this method when you want to take the search represented here, and 
     * send the user over to view this search in the specified view.
     */
    sendToView: function(viewName, additionalArgs, dispatchBeforeRedirect, openInPopup, options, appName) {
        var args = additionalArgs || {};
        options = options || {};
        appName = appName || Splunk.util.getCurrentApp();
        var urlPath = [Splunk.util.make_url("app", appName, viewName)];

        if (dispatchBeforeRedirect && this.isJobDispatched()) {
            this.logger.warn("sendToView was called on a dispatched search, but the 'dispatchBeforeRedirect' flag was passed. This flag will be ignored. This may be a sign of a deeper problem.");
        }
        var windowName = '_blank';
        
        var windowFeatures = (options.hasOwnProperty("windowFeatures") && options.windowFeatures) ? options.windowFeatures : "resizable=yes,status=no,scrollbars=yes,toolbar=no";
        if (options.hasOwnProperty("autosize") && options.autosize==true){
            var dimensions = Splunk.util.getWindowDimensions();
            windowFeatures = windowFeatures + ",height=" + Math.round(dimensions.height*0.90, 0) + ",width=" + Math.round(dimensions.width*0.90, 0);
        }
        var searchInstance = this;
        // called by 3 different places to abstract away the popup/no-popup decision.
        var goToFinalURL = function(url) {
            if (openInPopup) {
                try {
                    searchInstance.sendDocumentToLocation(this._popupWindow.document, url);
                } catch(e) {
                    this.logger.error(e);
                    this.logger.error("error setting the popups document.location directly. Switching to plan B which is to do another call to window.open with the same window name.");
                    try {
                        window.open(url, windowName, windowFeatures);
                    } catch(e2) {
                        this.logger.error(e2);
                        this.logger.error("popup opening has failed.");
                        this.messenger.send('error', 'splunk.search', _("Splunk encountered an error when it tried to launch the report builder popup (or the popup was blocked by an uncommonly aggressive popup blocker)."));
                    }
                }
            } else {
                searchInstance.sendDocumentToLocation(document, url);
            }
        }.bind(this);
        // if we need the popup, we launch it right away, and correct it's URL later in the parser callback OR in the POST callback
        if (openInPopup) {
            // kind of a tricky situation. If we launch the popup early, we risk the popupBlocker timers tripping more
            // if we launch the popup late though, there might be no this._popupWindow.document by the time our POST
            // returns.  Since the latter defeats the popupBlocker entirely, doing it early is the safer option.
            try {
                this._popupWindow = window.open(urlPath, windowName, windowFeatures);
            } catch(e) {
                this.logger.error(e);
                this.logger.error("failed to open the initial window");
            }
        }
        // FROM HERE THERE ARE THREE CASES
        // 1. We are already dispatched, meaning we have an sid already and everything else is irrelevant.
        if (this.isJobDispatched()) {
            this.job.setAsAutoCancellable(false);
            args["sid"] = this.job.getSearchId();
            goToFinalURL(urlPath + "?" + Splunk.util.propToQueryString(args));
        }
        // 2. we are NOT dispatched (or the job was abandoned recently), and the requestor wants it a fresh search dispatched.
        else if (dispatchBeforeRedirect) {            
            var onSuccess = function(search) {
                args["sid"] = search.job.getSearchId();
                // we have to set it explicitly in onSuccess, cause all jobs get it set to True right when dispatched and before onSuccess(). 
                search.job.setAsAutoCancellable(false);
                
                goToFinalURL(urlPath + "?" + Splunk.util.propToQueryString(args));
            }.bind(this);
            var onParseFailure = function() {
                this.messenger.send("fatal", "splunk.search", _("Encountered an unexpected error while parsing intentions."));
            }.bind(this);
            
            this.dispatchJob(onSuccess, onParseFailure, 0, []);
        }
        // 2. we are NOT dispatched and we dont want to be.  However we still need to 
        // construct the parser callback so it can do the parsing step if its needed. 
        // the callback convention is cumbersome but useful -- the absorbIntentions code will detect
        // whether there are no intentions and then in that case simply execute
        // successHandler right away.
        else {
                
            var range = this.getTimeRange();
            var successHandler = function(searchStr) {
                args["q"] = searchStr;
                if (range.getEarliestTimeTerms()) {
                    args["earliest"] = range.getEarliestTimeTerms();
                }
                if (range.getLatestTimeTerms()) {
                    args["latest"] = range.getLatestTimeTerms();
                }
                goToFinalURL(urlPath  + "?" + Splunk.util.propToQueryString(args));
            };
            var failHandler = function(e) {
                this.messenger.send("fatal", "splunk.search", _("Encountered an unexpected error while parsing intentions."));
            }.bind(this);

            this.absorbIntentions(successHandler, failHandler);
        }
        // focus the popup to bring it to the foreground. 
        // (NOTE DUE TO THE ASYNC NATURE OF THE ABOVE, IT PROBABLY DOESNT HAVE ITS FINAL URL YET.)
        if (openInPopup) {
            try {
                this._popupWindow.focus();
            } catch(e) {}
        }
    },
    canWrite : function(){
        return Splunk.util.normalizeBoolean(this._acl.can_write);
    }

});

// Static methods


//Splunk.Search.resurrectFromSearchId = function(sid, callback) {

    /*
    // I was playing around with an async way to retreive a full search
    // given only an sid.  Kinda tricky and the shift to async broke all the existing
    // unit-test coverage, so im not making the switch.
    $.get(
        Splunk.Globals['Jobber'].JOB_MGMT_ENDPOINT + "/" + sid,
        {},
        function(data) {
            // WEIRDNESS - getting to the correct URL returns the correct data
            //             but success is false....
            //             We Fail At Success...
            if (!data['success']) {
                data['success'] = true;
            }
            if (data['success'] && data['data']) {
                var jobDict = data['data'];
                // TODO - until Sorkin helps us out, we have no record of what the
                //        SUBMITTED time arguments were.
                var range = new Splunk.TimeRange(null, null);

                var search = new Splunk.Search(jobDict["search"], range);
                // TODO - We have no decomposition accessible from the client,
                //        instead we're doing it all in view.py.
                //        but in theory this should also decompose intentions...
                callback(search);
            }
        },
        'json'
    );
}*/
/**
 * Simple method for creating a partially fleshed out Search given only
 * sid and optional argument 'q'.
 * Note - this is only used by SearchHistory,  and most of resurrection uses the
 * resurrect() method, which generates a more full fleshed out search given
 * greater detail up front.
 */
Splunk.Search.resurrectFromSearchId = function(sid, q) {
    q = q || "*";
    var search = new Splunk.Search(q);
    search.job.setSearchId(sid);
    return search;
};

/**
 * Given JSON input matching the output of view.py's resurrection code,
 * will create and return a Search instance matching the specified arguments.
 *
 * TODO: make this compatible with a method called something like "Splunk.Job.updateFromPrimitive"
 * which is the current updateByTicketValues method.
 */
Splunk.Search.resurrect = function(paramsDict) {
    var q = paramsDict["baseSearch"] || "*";
    var search = new Splunk.Search(q);
    // NOTE: order is important here.    
    //       both setIntentions and setBaseSearch will clear _fullSearchWithIntentions as a precaution.
    if (paramsDict.hasOwnProperty("intentions")) {
        search.setIntentions(paramsDict["intentions"]);
    }
    if (paramsDict.hasOwnProperty("baseSearch")) {
        search.setBaseSearch(paramsDict["baseSearch"]);
    }
    if (paramsDict.hasOwnProperty("acl")) {
        search._acl = paramsDict["acl"];
    }
    if (paramsDict.hasOwnProperty("fullSearch")) {
        search._fullSearchWithIntentions = paramsDict["fullSearch"];
    }
    
    if (paramsDict.hasOwnProperty("vsid")) {
        search.setViewStateId(paramsDict["vsid"]);
    }
    if (paramsDict.hasOwnProperty("remote_server_list")) {
        search.setDistributedServerList(paramsDict["remote_server_list"]);
    }
    if (paramsDict.hasOwnProperty("decompositionFailed") && Splunk.util.normalizeBoolean(paramsDict["decompositionFailed"])) {
        // put in a check to make this less confusing should it ever break.
        if (search.hasIntentions()) {
            var logger =  Splunk.Logger.getLogger("search.js");
            logger.error("splunkWeb tells us the decomposition failed, but we received intentions somehow.");
        }
        search.decompositionFailed = true;
    }
    search.job.setAsAutoCancellable(true);
    if (paramsDict.hasOwnProperty("job")) {
        jobDict = paramsDict["job"];
        
        search.job.updateByTicketValues(jobDict);
        
        // if the job is marked as having a 'delegate' property, this currently means it 
        // was dispatched by the scheduler and the UI should never cancel it.
        if (jobDict.hasOwnProperty("delegate")) {
            // keep this around as a seperate property just cause I want to be extra paranoid in cancel() 
            // and never ever let them be cancelled.
            search.job.delegate = jobDict["delegate"];
            search.job.setAsAutoCancellable(false);
        }
    }

    
    // TODO i think we have outgrown search.getSavedSearchName()  and 
    // instead we need either a SavedSearch type with its own properties array
    // or an internal instance of SavedSearch that lives as search.savedSearch
    // so we can just blindly populate savedSearch values from the backend savedSearch 
    // objects to the front end....
    if (paramsDict.hasOwnProperty("next_scheduled_time")) {
        search.next_scheduled_time = paramsDict["next_scheduled_time"];
    }
    
    var timeRangeArgs = ["earliest", "latest", "earliestTZOffset", "latestTZOffset"];
    var timeRangeValues = [];
    for (var i=0; i<timeRangeArgs.length; i++) {
        timeRangeValues[i] = (paramsDict.hasOwnProperty(timeRangeArgs[i])) ?  paramsDict[timeRangeArgs[i]] : null;
    }
    search.setTimeRange(new Splunk.TimeRange(timeRangeValues[0],timeRangeValues[1],timeRangeValues[2],timeRangeValues[3]));

    // set the saved search after everything else, because many of the above setter methods 
    // will actually clear the saved search property.
    if (paramsDict.hasOwnProperty("name")) {
        search.setSavedSearchName(paramsDict["name"]);
    } else if (paramsDict.hasOwnProperty("s")) {
        search.setSavedSearchName(paramsDict["s"]);
    } else if (paramsDict.hasOwnProperty("job") && paramsDict["job"].hasOwnProperty("label") && paramsDict["job"]["label"]) {
        search.setSavedSearchName(paramsDict["job"]["label"]);
    }

    // report_builder logic is made modularizable by the addition of a 'splitType' property
    // which serves as a sort of abstract signifier of what the user's tryign to do.
    // we resurrect it here jsut cause it allows the report_builder  modules to rely
    // on it during resurrection as well as during dispatch.
    for (var j=0, l=search._intentions.length; j<l; j++) {
        if (search._intentions[j]["name"] == "plot") {
            var plotIntention = search._intentions[j];

            if (plotIntention["arg"].hasOwnProperty("splitby")) {
                plotIntention["arg"]["splitType"] ="single";
            }
            else if (
                (plotIntention["arg"].hasOwnProperty("fields")) &&
                (plotIntention["arg"]["fields"].length > 1)
            ) {
                plotIntention["arg"]["splitType"] ="multiple";
            }
            else {
                plotIntention["arg"]["splitType"] ="none";
            }
        }
    }
    
    // We only need to trigger jobResurrected when we need to start the Jobber's poller.
    // For the 'q' resurrection, the normal pushContextToChildren will cause
    // it to be dispatched at the appropriate place in the hierarchy.
    if (search.isJobDispatched()) {
        // if the params contain a 'group', then we broadcast that too. 
        // with a group, dashboards will use the job.getCreateTime() and write that 
        // into the last refreshed text. 
        // and in the future we may use this for the cases with no group, 
        // to tell the user 
        // "you are viewing results from a search run on March 2nd 2009"
        var group = paramsDict["group"] || null;
        $(document).trigger('jobResurrected', [search.job, group]);
    }
    return search;
};
