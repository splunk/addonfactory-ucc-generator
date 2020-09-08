Splunk.Module.SubmitButton = $.klass(Splunk.Module, {
    
    MAX_URI_LENGTH_IE: 2048,
    // in IE the history manager adds an SUID to map state data to URL data, it's random so we hard code the max length
    MAX_SUID_SUFFIX_LENGTH: 38,
    
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        this.logger = Splunk.Logger.getLogger("SubmitButton.js");
        this._previouslyPushedSearch  = false;
        this.PERMALINK_ARGS_PREFIX = "form.";
        
        if (this._params.hasOwnProperty("label")) {
            this._submitButton = $("button.splButton-primary", this.container);
        } else {
            this._submitButton = $("input.searchButton", this.container);
        }

        this._submitButton.click(this.onClick.bind(this));
    	// previously, if a request was dispatched when a dispatch was in flight, we'd lose it
    	// now we queue it, and keep the most recent, to dispatch as soon as the in flight dispatch succeeds.
    	this._queuedRequest = null;

        var self = this;
        if (Splunk.util.normalizeBoolean(this._params["updatePermalink"])) {
            this._useHistory = true;
            this._justpushed = false;
            this._historyQueue = [];
            this._args = {};

            $script(Splunk.util.make_url('/static/js/contrib/jquery.history.js'), function () {
                if (self._historyQueue.length > 0) {
                    var queryArgs = Splunk.util.queryStringToProp(window.location.search);
                    var formValues = self.extractFormValues(queryArgs);
                    var replace = formValues ? true:false;
                    var history = null;
                    
                    if (replace) {
                        history = self._historyQueue[self._historyQueue.length-1];
                        History.replaceState(history, document.title, '?' + Splunk.util.propToQueryString(history));
                    } else {
                        for (var i = 0; i<self._historyQueue.length; i++) {
                            history = self._historyQueue[i];
                            History.pushState(history, document.title, '?' + Splunk.util.propToQueryString(history));
                        }
                    }
                    self._justpushed = true;
                }
                self._historyQueue = null;
                History.Adapter.bind(window,'statechange',function(){
                    var State = History.getState();
                    var data = State.data;
                    var formValues = self.extractFormValues(data);
                    if (!data || (!data.q && !formValues)) {
                        $.each(self.getModulesInTree(), function(idx,mod) {mod.reset();});

                        self._args = {};
                        var search, context, parent;
                        if (Splunk.toBeResurrected) {
                            search = Splunk.Search.resurrect(Splunk.toBeResurrected);
                            context = new Splunk.Context();
                            context.set("search", search);
                            
                            context.set("from_history", "1");
                            parent = self;
                            self.baseContext = context;
                            while (parent.parent) {
                                parent = parent.parent;
                                parent.baseContext = context;
                                parent.onContextChange();
                            }

                            self.pushContextToChildren(context, true);
                        }
                        return;
                    }
                    
                    if (self._justpushed) {
                        self._justpushed = false;
                        return;
                    }

                    context = new Splunk.Context();
                    
                    if (formValues) {
                        var l;
                        for (l in formValues) {
                            context.set(l, formValues[l]);
                        }
                        search = new Splunk.Search();
                        context.set("search", search);
                    } else if (data.q) { 
                        var range = new Splunk.TimeRange(data.earliest, data.latest);
                        search = new Splunk.Search(data.q, range);
                        context.set("search", search);
                        
                        Splunk.Globals.ModuleLoader.chartingSettingsToContext(data, context);
                    }

                    parent = self;
                    while (parent.parent) {
                        parent = parent.parent;
                    }
        	
                    self._args = data;
                    context.set("from_history", "1");
                    parent.baseContext = context;
                    parent.onContextChange();
                    parent.pushContextToChildren();
                });
            });
        } else {
            this._useHistory = false;
        }
    },
    
    updateHistory: function() {
        var context = this.getContext();
        if (this._useHistory && this._args.q)
            this.pushHistory(context, true);
    },
    
    pushHistory: function(context, replace) {
        if (!this._useHistory) { 
            return;
        }
        if (context.has("from_history") && Splunk.util.normalizeBoolean(context.get("from_history")) && !replace) {
            return;
        }
        
        var search  = context.get("search");
        var q = Splunk.util.addLeadingSearchCommand(search.toString());

        var args = {};
        var formValues = context.getAll('form');
        if (!$.isEmptyObject(formValues)) {
            var key;
            for (key in formValues) {
                if (typeof formValues[key] !== 'function' && typeof formValues[key] !== 'object') {
                    args['form.'+key] = formValues[key];
                }
            }
        } else {
            args["q"] = q;
        }
        var range = search.getTimeRange();
        
        if (range) {
            if (range.getEarliestTimeTerms()) {
                args["earliest"] = range.getEarliestTimeTerms();
            }
            if (range.getLatestTimeTerms()) {
                args["latest"] = range.getLatestTimeTerms();
            }
            if (range.isAllTime()) {
                args["earliest"] = 0;
            }
        }

    	var settingNameMap = {'charting.chart': 'c.chart',
    			      'charting.chartTitle': 'c.title',
    			      'charting.chart.stackMode': 'c.stack',
    			      'charting.layout.splitSeries': 'c.split',
    			      'charting.chart.nullValueMode': 'c.nulls',
    			      'charting.legend.placement': 'c.legend',
    			      'charting.primaryAxisTitle.text': 'c.x.title',
    			      'charting.secondaryAxisTitle.text': 'c.y.title',
    			      'charting.secondaryAxis.minimumNumber': 'c.y.min',
    			      'charting.secondaryAxis.maximumNumber': 'c.y.max',
    			      'charting.secondaryAxis.scale': 'c.y.scale',
    			      'charting.chart.showMarkers': 'c.markers'};
    	
    	// any property value beginning with '#' or '@' is escaped by duplicating that character
        // un-escape them by removing the duplicate
    	var unescapePropertyValue = function(escapedValue) {
    	    var value = escapedValue.replace(/^@@/, '@').replace(/^##/, '#');
            return value;
    	};
    
    	var settings = {};
        this.withEachDescendant(function(module) {
    		var mc = module.getModifiedContext();
    		if (module.moduleId.indexOf("JSChart") != 0)
    		    return;
    
    		if (!mc.has("charting.chart") || !$(module.container).is(":visible")){
    		    return;
    		}
    		for (var keyType in {'charting': null})  {
    		    var props = mc.getAll(keyType);
    		    for (var key in props) {
        			if (props.hasOwnProperty(key) && props[key] != null) {
        			    var propName = keyType + "." + key;
        			    if(typeof props[key] === 'string') {
        			        props[key] = unescapePropertyValue(props[key]);
        			    }
        			    settings[settingNameMap[propName] || propName] = props[key];
        			}
    		    }
    		}
	    });
        
        if ($.isEmptyObject(formValues)) {
            $.extend(args, settings);
        }
        
    	replace = false;
    	if (Splunk.util.objectSimilarity(args, this._args)) {
    	    return;
    	} else {
    	    if ((Splunk.util.objectSimilarity(this._args.q, args.q) &&
                 Splunk.util.objectSimilarity(this._args.earliest, args.earliest) &&
                 Splunk.util.objectSimilarity(this._args.latest, args.latest)) && 
                 $.isEmptyObject(formValues)) {
    	        replace = true;
    	    }

            if (!this._args.q && Splunk.toBeResurrected && !Splunk.toBeResurrected.job) {
                replace = true;
            }
            this._args = args;
    	}

        if (this._historyQueue instanceof Array) {
            if (replace) {
                if (this._historyQueue.length > 0) {
                    this._historyQueue[this._historyQueue.length-1] = args;
                }
            } else { 
                this._historyQueue.push(args);
            }
            
        } else {
            this._justpushed = true;
            var qs = Splunk.util.propToQueryString(args);
            if (History.isInternetExplorer()) {
                var baseUri = document.location.href.split("#")[0],
                    // the IE permalinking will add a prefix to the fragment identifier based on the last segment of the URI,
                    // need to account for that in our length calculation
                    uriSegments = baseUri.split("/"),
                    lastSegment = uriSegments[uriSegments.length - 1],
                    preQsLength = (baseUri + "#" + lastSegment + "/?").length;
                
                if((preQsLength + qs.length + this.MAX_SUID_SUFFIX_LENGTH) > this.MAX_URI_LENGTH_IE) {
                    qs = "";
                }
            }

            if (replace) {
                History.replaceState(args, document.title,'?'+qs);
            } else {
                History.pushState(args, document.title,'?'+qs);
            }
        }
    },
    pushContextToChildren: function($super, explicitContext, force) {
        var formInternalSearches = [];    
        this.withEachAncestor(function(module) {
            if (typeof module.getInternalSearchDeferred == 'function') {
                formInternalSearches.push(module.getInternalSearchDeferred());
            }
        });
        if (!formInternalSearches.length) {
            formInternalSearches.push($.Deferred().resolve());
        }

        // wait until all internal searches in dynamic elements are done
        $.when.apply($, formInternalSearches).done(function() {
            // cleaning the context will make parents to refresh their contexts
            // when getModifiedContext is called in the next step
            this.ensureFreshContexts();
            
            var context = explicitContext || this.getModifiedContext();
            var search  = context.get("search");

            //SubmitButton's magic, incantation #1 - unless the context is resurrected, ignore all requests.
            // instead the button click will pass Context changes down.
            if (force || !this.isPageLoadComplete() || Splunk.util.normalizeBoolean(this._params["allowSoftSubmit"])) {
                $super(explicitContext);
            } 
            
            var hasDispatchingDescendants = false;
            this.withEachDescendant(function(module) { 
                if (module.requiresDispatch(search)) {
                    hasDispatchingDescendants = true;
                    return;
                }
            });
            if (hasDispatchingDescendants) {
                // only push history if SubmitButton acts as an invisible observer to prevent double history push
                this.pushHistory(context);
            }
        }.bind(this));
    },
    
    extractFormValues: function(params) {
        var formValues = {};
        var cnt = 0;
        for (var key in params) {
            if (key.indexOf(this.PERMALINK_ARGS_PREFIX) == 0) {
                formValues[key] = params[key];
                cnt++;
            }
        }
        return cnt ? formValues : null;
    },
        
    applyContext: function($super,context) {
        var search  = context.get("search");
        this._previouslyPushedSearch = search;

        return $super(context);
    },
    
    _fireDispatch: function($super, dispatchedSearch) {
	    if (this.dispatchAlreadyInProgress == true) {
            this._queuedRequest = dispatchedSearch;
	    }
	    $super(dispatchedSearch);
	},
    
    _fireDispatchSuccessHandler: function(dispatchedSearch) {
        this.logger.debug("success - context dispatched for search=", dispatchedSearch.toString());
        var context = this.getContext();
        context.set("search", dispatchedSearch);
        this.pushContextToChildren(context, true);

        this._removeLastSearch();
        this._lastSuccessfulDispatchedSearch = dispatchedSearch;
        this.dispatchAlreadyInProgress = false;

        if (this._queuedRequest) {
            this._fireDispatch(this._queuedRequest);
            this._queuedRequest = null;
        }
    },

    onClick : function(event) {
        // the only time we can safely add and remove the greyed out class, is if the submit 
        // button click is the sole way for changes to go through.  In other words, !allowSoftSubmit
        
        this.pushContextToChildren(null, true);
    }
});
