
/**
 * Splunk.Module is the abstract base class for Splunk UI modular components.
 * Sensible default values and behaviors are provided whever possible, and
 * instructions for overriding correctly are provided inline.
 *
 */
Splunk.Module = $.klass({
    /**
     * Defines the URI segment that identifies the default viewstate
     * persistence set name used for normal module 'stickiness'.
     */
    CURRENT_VIEWSTATE_KEY: '_current',
    HIDDEN_MODULE_KEY: 'hidden module',
    _childModulesHaveFreshContexts: true,
    _state : Splunk.util.moduleLoadStates["WAITING_FOR_INITIALIZATION"],

    /**
     * Constructor.  If you override it, 99.9% of the time you should in your
     * first line call $super(container).
     */
    initialize: function(container) {

        this.logger = Splunk.Logger.getLogger("AbstractModule.js");

        if (this.parent || this.container || this._children) {
            this.logger.error(this.moduleType, ".initialize - Assertion Failed. Modules may not be reinitialized.");
        }

        this.container = $(container);
        this.resultsContainer = $('<div/>').appendTo(this.container);

        this.parent = null;
        this._children = [];
        
         
        this.childEnforcement = 0;
        this.parentEnforcement = 0;



        this.baseContext = null;
        
        this._paramsToUseAsSettings = [];
        this._lastSuccessfulDispatchedContext = null;
        
        // Holding place for the last param set collected by getResults
        this._previousResultParams = null;


        // TODO - this could be very useful, but I think should be avoided -ncm
        //this.container.module = this;

        //this._enablePropertyWatch = false;
        //if (this._enablePropertyWatch) $("<input class='debugInspector'/>").prependTo(this.container);
        // get the current DOM ID for this module
        this.moduleId = this.container.attr('id');

        this.token = null;
        // initialize this._params for modules

        // I have no idea what to call this, but a module can be shown or hide
        // for a couple different reasons, and we cant just do show() and hide()
        // directly, or else we'd only be able to have one 'mode' of invisibility
        // per view.
        this._invisibilityModes = {};
        
        // init params
        this.importParams();

        //XMLHTTPRequest Governor
        this.getResultsRetryCounter = 0;
        this.getResultsRetryPolicy = 3;
        // getResultsXHRObject holds a reference to the XHR object generated when
        // getResults is called.  If a request to reset the module is called,
        // abort will be called on the xhr object this is assigned to.
        this.getResultsXHRObject = null;
 
        this.pushContextWhenReady = false;


        // observe any view data change events
        $(document).bind('viewDataChange', this.onViewDataChange.bind(this));
        
        // we wire up the events to the handler here. This used to be in ModuleLoader
        $(document).bind('moduleLoadStatusChange', function(event, module, statusInt) {
            if (module.moduleId == this.moduleId) {
                this.onLoadStatusChange(statusInt);
            }
        }.bind(this));
        
        //this.container.mouseover(function() {
        //    var search = this.getContext().get("search");
        //    this.logger.debug("manual debugging - ", this.moduleType, " search=", search)
        //    this.logger.debug("manual debugging - sid=", search.job.getSearchId());
        //}.bind(this));
    },

    getLoadState: function() {
        return this._state;
    },

    setLoadState: function(statusInt, suppressEvent) {
        var oldState = this._state;
        if (oldState != statusInt) {
            this._state = statusInt;
            if (!suppressEvent) {
                $(document).trigger('moduleLoadStatusChange', [this, statusInt]);
            } 
        }
    },
    
    markPageLoadComplete: function() {
        this._pageLoadComplete = true;
    },

    isPageLoadComplete: function() {
        return this._pageLoadComplete || false;
    },

    /*
     * extract token from module's intentions
     */
    getToken: function() {
        var params = {};
        if (this._children.length > 0 && this._children[0].moduleType.indexOf('ConvertToIntention')>0) {
            params = this._children[0]._params;
        } else {
            params = this._params;
        }
        
        var intention_arg = {};
        if (params.hasOwnProperty('intention') && params.intention.hasOwnProperty('arg')) {
            intention_arg = params.intention.arg;
        } 
        
        for (var key in intention_arg) {
            if (intention_arg.hasOwnProperty(key)) {
                this.token = key;
            }
        }
        return this.token;
    },
    
    /*
     * Any module that returns false from requiresAsynchronousLoading() will be
     * considered to be 'WAITING_FOR_HIERARCHY'
     * ie  'Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY'
     * as soon as it returns from it's constructor.
     * Conversely any module that returns true here must then be responsible for
     * doing it's own asynchronous loading, and making sure when its over that
     * the corresponding moduleLoadStatusChange event gets fired.
     */
    requiresAsynchronousLoading: function() {return false;},
    
    /**
     * If the page is still loading, the module has its hierarchy wired up, 
     * and the module is in a state of either WAITING_FOR_CONTEXT or HAS_CONTEXT, 
     * then we run whatever hierarchy validation it has defined.
     */
    onLoadStatusChange: function(statusInt) {
        if (!this._hierarchyValidated && (statusInt >= Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT)) {
            this.validateHierarchy();
        }
    },


    /////////////////////////////////////////
    // Methods which involve pushing non-search settings to child modules
    // below the current module.
    /////////////////////////////////////////
    mergeLoadParamsIntoContext: function(namespace, paramNames) {
        for (var i=0; i<paramNames.length; i++) {
            var pair = {namespace:namespace,  param: paramNames[i]};
            this._paramsToUseAsSettings.push(pair);
        }
    },

    /////////////////////////////////////////
    // Methods which involve how Search.dispatchJob gets called
    /////////////////////////////////////////

    /*
     * Public function, but not to be commonly overridden.  It's intended as
     * a safer way to check for isSubclassOf(Splunk.Module.DispatchingModule)
     * returning false basically says a module doesnt need its context to be
     * running and exposing data endpoints when the user runs the
     * search.
     * However in complex cases, modules can use this to change the behaviour to 
     * depend on their specific configuration.
     */
    requiresDispatch: function(search) {return false;},

    /*
     * Essentially an event handler, this will be called when the underlying
     * Context instance available in this.getContext(), has changed.
     */
    onContextChange: function() {},
    
    /*
     * method that actually kicks off the dispatch process.
     * the hard work is delegated to Search.dispatchJob though.
     */
    _fireDispatch: function(search) {
        if (!search) {
            this.logger.error("Assertion failed.  required arg 'search' not passed to ", this.moduleType, "._fireDispatch");
            return; // Failed assertions should fail.
        }
        
        // Check that we're not already dispatching from this very point in the hierarchy.
        // the user might be holding down the return key in SearchBar
        // If we are already dispatching, then we just bail. All will be well. 
        // The former dispatch will either succeed or fail. In either case all will be well. 
        // Note - it was tempting to put this on Job or Search, but they get 
        //        cloned/re-initialized a little bit and this seemed less sketchy + trivial.
        // Note - this also makes the assumption about history repeating itself.
        if (this.dispatchAlreadyInProgress) {
            return false;
        } else {
            this.dispatchAlreadyInProgress = true;
            // working prototype of an idea whereby most or possibly all usage of ConvertToIntention 
            // where it's defining 'stringreplace' itnentions can be eliminated from config.  
            // In the clear majority of the cases (maybe all) the developer's desired behaviour could 
            // be achieved automatically using only the code below, without using any 'stringreplace' intention. 
            // As far as I can tell the 'stringreplace' intention offers no meaningful functionality beyond the 
            // below except for the 'prefix' and 'suffix', and prefix and suffix IMO should be on the 
            // input module above.  (or maybe supplied sometimes by a generic converter)
            // TODO - at the moment my thinking is that,  if there is NOT a stringreplace intention that 
            // contains a value for intention["arg"][token],  then we replace the token inline from the context. 
            // if there is, this means there's legacy ConvertToIntention+stringreplace code upstream 
            // and we leave it alone.
            var USE_AUTOMATIC_STRING_REPLACEMENT = false;
            if (USE_AUTOMATIC_STRING_REPLACEMENT) {
                var context = this.getContext();
                var baseSearch = search.toString();
                var tokens = Splunk.util.discoverReplacementTokens(baseSearch);
                for (var i=0; i<tokens.length; i++) {
                    var replacer = new RegExp("\\$" + tokens[i] + "\\$");
                    baseSearch = Splunk.util.replaceTokens(baseSearch, replacer, context.get(tokens[i]));
                    search.setBaseSearch(baseSearch);
                }
            }
            search.dispatchJob(this._fireDispatchSuccessHandler.bind(this), this._fireDispatchFailHandler.bind(this), this.getGroupName());
        }
    },

    /**
     * Detects whether or not the last run search should be canceled.
     * This is only used by the _fireDispatch callback methods.
     */
    _removeLastSearch: function() {
        var lastSearch = this._lastSuccessfulDispatchedSearch;
        if(lastSearch && lastSearch.isJobDispatched()) {
            // remove the search job from the jobber
            Splunk.Globals['Jobber'].removeJob(lastSearch.job.getSearchId());
            // it's possible we have a stale state here, so use the job's refreshCanBeAutoCancelled async method
            // to make sure it's safe to cancel the job
            lastSearch.job.refreshCanBeAutoCancelled(function(canBe) {
                if(canBe) {
                    lastSearch.job.cancel();
                }
            });
        }
    },
    
    /**
     * The success handler used by _fireDispatch.
     * This is broken out here so that other modules may overwrite it,
     * in particular if they need to overwrite pushContextToChildren as in SubmitButton.
     */
    _fireDispatchSuccessHandler: function(dispatchedSearch) {
        this.logger.debug("success - context dispatched for search=", dispatchedSearch.toString());

        var context = this.getModifiedContext();
        context.set("search", dispatchedSearch);
        this.withEachDescendant(function(module) {
            module.reset();
        });
        this.pushContextToChildren(context);
        this._removeLastSearch();
        this._lastSuccessfulDispatchedSearch = dispatchedSearch;
        this.dispatchAlreadyInProgress = false;
    },
    
    /**
     * The fail handler used by _fireDispatch.
     * This is broken out here so that other modules may overwrite it.
     */
    _fireDispatchFailHandler: function(failedSearch) {
        this.dispatchAlreadyInProgress = false;
        this.logger.error(this.moduleType, " Context failed to dispatch job for search=", failedSearch.toString());
        // Why are we doing this here?  It does not seem like it's necessary.
        this._removeLastSearch();
        // in the name of providing immediate feedback when a search POST goes out, 
        // some modules (notably JobStatus) will have changed state onBeforeJobDispatched
        // this reset is required to reset them back to their null state.
        var descendants = this.getDescendants();
        for (var i=0, len=descendants.length; i<len; i++) {
            descendants[i].reset();
        }
    },

    /*
     * method used during Search calculations, that tells us
     * whether there are any *immediate* children which require the
     * context objects to be dispatched before getting them.
     */
    someChildrenRequireDispatch: function(search) {
        var requireDispatch = false;
        this.withEachChild(function(child) {
            if (child.requiresDispatch(search)) {
                requireDispatch = true;
                return false; // this breaks out of the withEachChild loop, mirroring jQuery's behavior.
            }
        });
        return requireDispatch;
    },
    
    /**
     * A generic mechanism for any module in the tree, that's about to get a search 
     * kicked off for it,  to make a change that can affect the resulting job.  
     * 
     * Main usage is to set the required_field_list and status_buckets
     * params on the POST to dispatch the job, so that the job gets run with correct fields and statistics 
     * to give each module what it requires.
     * When to use:   
     *   1 When your module ITSELF knows it will require the event text, call search.setMinimumStatusBuckets(n)
     *   2 When your module will or may need to render certain fields without redispatching, call 
     *   search.setRequiredFieldList(array). 
     * When not to use: 
     *   If module A is setting something ON BEHALF of module B downstream, that's wrong.  
     *      Convention is to make the downstream module B implement it for itself.
     */
    onBeforeJobDispatched: function(search) {},
    
    /**
     * Ensures the contexts in the calling module's ancestor tree are fresh.
     * The contexts may be set to stale if they have changes which have not been
     * propogated down stream.  For example, when a user types into an input field,
     * but submits the form via an "enter" press on another form field.
     */
    ensureFreshContexts: function() {

        // We create a contract that the current search is not dispatched.
        // If it is there is nothing we can do. Perhaps getContext should
        // be set to invalidate the current context in your module?
        if (!this.getContext().get('search') || this.getContext().get('search').isJobDispatched()) {
            return;
        }

        var stale = null;
        this.withEachAncestor(function(module) {
            // We traverse up the ancestor chain and stop if the module has
            // a dispatched search. This prevents modules that have a stale
            // context but are part of some group of modules with dispatched
            // context from being updated by downstream modules that don't
            // need the upstream modules to redispatch. Got it? K, me neither.
            if (module.getContext().get('search').isJobDispatched()) {
                return false;
            }

            if (!module._childModulesHaveFreshContexts) {
                stale = module;
            }
        }, true);
        
        if (stale) {
            stale.withEachDescendant(function (child) {
                child.baseContext = null;

                // Tempting to set this here but it's not technically true.
                // You could argue that it is true for any given descendant 
                // after ALL descendants have had the property nulled.
                // but then it would be in a subsequent withEachDescendant loop
                // however im going to leave it false until the new cached context 
                // actually arrives down at runtime.

                //child.setChildContextFreshness(true);
            });

            // Set the freshness to true for the highest ancestor with a
            // stale context so that we dont' get stuck nulling contexts
            // in future getContext pulls.
            stale.setChildContextFreshness(true);
        }
    },
    
    /**
     * marks the freshness of context data held by the current modules CHILDREN 
     * 
     * NOTE: we could just walk down and null out all the stale contexts
     *       here with a single withEachDescendant.
     *       (That would eliminate the need for ensureFreshContexts()) 
     *       however this method is designed to be called often, for example 
     *       onkeypress,  and to traverse the tree that often is undesirable.
     * 
     * @returns {undefined}
     */
    setChildContextFreshness: function(bool) {
        this._childModulesHaveFreshContexts = (!!bool);
    },
   
    /**
     * This method should really never be overridden.
     * This method is the recommended way of getting the current
     * Context that is the sum total of all information
     * provided by the modules ancestors further up the page.
     */
    getContext: function() {
        // INVARIANT:  Any modifications taken by the client, on the value we return, must never in any 
        //  cases effect the output of subsequent calls to this function. 
        // it can be somewhat confusing that context.get(namespace) ITSELF clones its internal object 
        // properties. 
        // The key thing to remember in this method, is that the invariant applies even if the client 
        // uses context.set method to explicitly modify keys.

        var context = null;
        if (this.baseContext) {

            // MUST BE CLONED. 
            context = this.baseContext.clone();
        } else {
            // for views that havent run any searches yet, this will cause an upward
            // cascade of getModifiedContext whereby they all get set on demand.
            if (this.parent) {
                // TODO - technically we should clone here as well. There *could* be inflight async changes underway 
                //this.logger.debug(this.moduleType + " backfilling from " + this.parent.moduleType);
                var baseContext = this.parent.getModifiedContext();

                if (baseContext != null) {
                    if (this.getLoadState() < Splunk.util.moduleLoadStates.HAS_CONTEXT) {
                        this.logger.debug(this.moduleType +  " - Although we're still loading the page we have to let modules cache contexts.");
                        
                        this.parent.setChildContextFreshness(false);
                    }
                    
                    this.baseContext = baseContext;
                    context = baseContext.clone();
                } else {
                    var exception_msg = sprintf("getContext was called by %(moduleId)s with no baseContext. %(moduleId)s's parent returned a null context. This should not happen.", this);
                    throw(exception_msg);
                }
            // the module is at the top level of the view hierarchy.
            } else {
                context = new Splunk.Context();
                var search = new Splunk.Search();
                context.set("search", search);
            }
        }
        // TODO - there's nothing inherently wrong with this. 
        // basically some modules want to pick up the same keys either from above as like events.fields
        // or from their own params as <param name="fields"></param>
        // you set this up by calling this.mergeLoadParamsIntoContext(list) within initialize;
        for (var i=0,len=this._paramsToUseAsSettings.length; i<len; i++) {
            var pair = this._paramsToUseAsSettings[i];    
            var namespacedKey = pair.namespace + "." + pair.param;
            if ( this.getParam(pair.param) != null && !context.has(namespacedKey) ){
                context.set(namespacedKey, this.getParam(pair.param));
            }
        }
        return context;
    },

    /**
     * This method should really not be overridden by subclassed modules.
     * Instead either override:
     *
     * getModifiedContext when your module is receiving a new Context that
     * has the potential to create a new search job or
     *
     * applyContext when your module is receiving a Context that
     * has been created from an old UI state or from a previously run and
     * finished job, or from a user interaction further down the page.
     *
     */
    pushContextToChildren: function(explicitContext) {
        // if (this._children.length == 0) return;
        
        // This allows modules to regulate when they will push contexts down.
        // if a module needs to take its own action asynchronously and then it will 
        // push later, it should return Splunk.Module.DEFER
        // if it is outright cancelling the push and doesnt want ANY modules downstream
        // to receive it,  it should return Splunk.Module.CANCEL
        // if the push was cancelled, then a flag is set, 
        // this.pushContextWhenReady, for the module's internal use.
        var readiness = this.isReadyForContextPush();
        if (readiness == Splunk.Module.CANCEL) {
            if (!this.isPageLoadComplete()) {

                var propagateLoadCompleteFlag = function(module) {
                    module.markPageLoadComplete();
                    module.withEachChild(function(child) {
                        propagateLoadCompleteFlag(child);
                    });
                };
                propagateLoadCompleteFlag(this);
            }
            return;

        } else if (readiness == Splunk.Module.DEFER) {
            this.pushContextWhenReady = true;
            return;

        } else if (readiness == Splunk.Module.CONTINUE){
            if (this.pushContextWhenReady) {
                this.pushContextWhenReady = false;
            }

        } else {
            this.logger.error(this.moduleType + " returned illegal value from isReadyForContextPush");
        }
    
        // Check to make sure the ancestors have fresh contexts.
        this.ensureFreshContexts();
        
        var childContext = explicitContext || this.getModifiedContext();

        // If the context received is null then stop the chain
        if (childContext == null || !childContext.has("search")) {
            this.logger.warn(this.moduleType, 'TODO  - hit old behaviour of returning NULL - getModifiedContext returns a context with a "null" search, stopping the pushContextToChildren call.');
            return;
        } else if (this.getLoadState() < Splunk.util.moduleLoadStates.HAS_CONTEXT) {
            return;
        }
        
        // ok off we go. Roll em up!
        this.withEachDescendant(function(module) {
            // I agonized for a long time about only moving back to WAITING_FOR_CONTEXT from HAS_CONTEXT
            // and then if the module is in "CONFUSING_PAGE_LOAD_STATE", not moving it to WAITING_FOR_CONTEXT
            // but it doesnt work.
            module.setLoadState(Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT);
        });

        var search = childContext.get("search");

        // The "from_history" context attribute is used by modules that respond differently to changes that are triggered
        // by browser history events.  The intention is that this attribute lasts for only one context push, so we check
        // for it here and set it to "0" if needed.
        var currentContext = this.getContext();
        if(currentContext.has('from_history') && Splunk.util.normalizeBoolean(currentContext.get('from_history'))) {
            currentContext.set('from_history', "0");
            this.baseContext = currentContext;
        }

        if (this.someChildrenRequireDispatch(search)) {
            search.abandonJob();
            this.withEachDescendant(function(module) {
                module.onBeforeJobDispatched(search);
            });
            this._fireDispatch(search);
            // Another call to pushContextToChildren will come through
            // which is normal, as now the context will have a dispatched
            // search and will not fall into this if block.
            return;
        }
        this.withEachChild(function(child) {
            // give them the baseContext.
            
            child.baseContext = childContext;
            // TODO - onContextChange GOES AWAY and becomes a special handler for onModuleLoadStatusChange, when it is the HAS_CONTEXT state.
            child.setLoadState(Splunk.util.moduleLoadStates.HAS_CONTEXT);
            child.onContextChange();
            child.pushContextToChildren();
            if (!child.isPageLoadComplete()) {
                child.markPageLoadComplete();
            }
        });

        this.setChildContextFreshness(true);
    },
   
    /**
     * A method meant to be overriden by inheriting modules.
     * Sets up the contract that if a module receives a pushContextToChildren
     * call while not ready for one, it will propagate that push once it is
     * ready.
     */ 
    isReadyForContextPush: function() {
         if (this.getLoadState() < Splunk.util.moduleLoadStates.HAS_CONTEXT) return false;
         return true;
    },

    /**
     * Resets the context to null and removes the job from the jobber manifest.
     * Not usually overriden.  Called by the more general 'reset' method.
     */
    resetContext: function() {
        //TODO - reevaluate whether we still need this paranoia after both nate and nick's recent improvements.
        if (this.baseContext && this.baseContext.has("search") ) {
            var search = this.baseContext.get("search");
            if (search.isJobDispatched()) {
                Splunk.Globals['Jobber'].removeJob(search.job.getSearchId());
            }
        }
        this.baseContext = null;
        this._lastSuccessfulDispatchedSearch = null;
    },


    /////////////////////////////////////////
    // Methods which involve Selection State and things that modify the search
    // for the modules children.
    /////////////////////////////////////////
    /**
     * override me to pass a modified - or refined - context to children
     * rather than the context this module was given.
     */
    getModifiedContext: function() {
        if (!this.baseContext) {
            this.logger.debug(this.moduleType, "does not override getModifiedContext, has no local cache and thus is backfilling");
        }
        return this.getContext();
    },

    /**
     * NEEDS DOCUMENTATION
     */
    applyContext: function(context) {
        if (!this.isPageLoadComplete()) {
            this.logger.warn(this.moduleType, " does not implement applyContext");
        }
    },


    /////////////////////////////////////////
    // Methods which involve modifying the state of the module's parents.
    /////////////////////////////////////////


    /**
     * a child module calls this method on its parent to request that the
     * parent modify it's state
     * the module may choose to either
     * a) accept the request,
     * b) pass the request along to it's parent, or ignore the request.
     */
    passContextToParent: function(context) {
        // default behavior is to pass the request to parents until we find one
        // that wants to handle it.
        if (this.parent) {
            // resurrection proceeds up the entire tree no matter what.
            if (!this.isPageLoadComplete()) {
                this.parent.applyContext(context);
                this.parent.passContextToParent(context);
            }
            // but the upstream-click contexts get stopped at the first return true.
            else if (!this.parent.applyContext(context)) {
                return this.parent.passContextToParent(context);
            } 
        } else if (!this.isPageLoadComplete()) {
            // The topmost module gets the remnant of resurrection, as its base context.");
            var newBaseContext = context.clone();
            var topSearch = newBaseContext.get("search");
            newBaseContext.set("search", topSearch);
            this.baseContext = newBaseContext;

            return;
        }
        // if the propagation continues all the way to the top 
        // and we're not resurrecting, then
        // we are left without anything to do. 
        this.logger.warn("an upstream interaction made it to the top of the tree (to ", this.moduleType, ") because none of its downstream modules were able to take any action.");
        return false;
    },



    /*
     * Adopt the given module instance as a child.
     */
    addChild: function(child) {
        if (child.parent) {
            this.logger.error(this.moduleType, ".addChild - Assertion failed. this", child.moduleType, " instance already has a parentModule. There Can Be Only One.");
        }
        this._children.push(child);
        child.parent = this;
    },

    /*
     * impl. would be fancier with splice() but somehow this seems simpler/better.
     *
     * could be:
     * var idx = this._children.indexOf(childModule);
     * if (idx >= 0) this._children.splice(this._children.indexOf(childModule),1);
     */
    removeChild : function(childModule) {
        var newChildrenList = [];
        for (var i=0; i<this._children.length;i++) {
            if (childModule == this._children[i]) {
                this._children[i].parent = null;
            } else {
                newChildrenList.push(this._children[i]);
            }
        }
        this._children = newChildrenList;
    },

    validateHierarchy: function() {
        this._hierarchyValidated = true;
        var msg = false;
        if (this.childEnforcement==Splunk.Module.ALWAYS_REQUIRE && this._children.length==0) {
            msg = "This view has a %s module but it is configured with no child modules to push its changes to. This represents a configuration error.";
        } else if (this.childEnforcement==Splunk.Module.NEVER_ALLOW && this._children.length>0) {
            msg = "This view has a %s module configured to push changes to downstream modules. This module never has any changes to push so this represents a configuration error.";
        }
        if (this.parentEnforcement==Splunk.Module.ALWAYS_REQUIRE && !this.parent) {
            msg = "This view has a %s module but that module has no parent modules to receive changes from. This module will not work in this configuration so this represents a configuration error.";
        } else if (this.parentEnforcement==Splunk.Module.NEVER_ALLOW && this.parent) {
            msg = "This view has a %s module but that module receives changes from other modules upstream. Since this module will ignore all such changes, this represents a configuration error.";
        }
        if (msg) {
            if ($("div.Message").length>0) {
                var messenger = Splunk.Messenger.System.getInstance();
                messenger.send('error', 'splunk', _(sprintf(msg, this.moduleType)));
            } else {
                this.displayInlineErrorMessage(_(sprintf(msg, this.moduleType)));
            }
        }
    },

    /**
     * Methods to handle passing things to the tree scoped by the current module.
     * Plural methods returns a flat array with a generally predictable, though not
     * guaranteed, order.  Singular methods only return an object reference or null.
     *
     * Example use:
     *
     * * Cancel all jobs in the current module tree:
     *        $.each(this.getModulesInTree(), function(module){
     *             if (module.baseContext && module.baseContext.isJobDispatched()) module.baseContext.job.cancel();
     *        });
     *
     * * Hide all modules below the current module:
     *         $.each(this.getDescendants(), function(module) {
     *             module.container.css('display', 'none');
     *         })
     */
     
    /**
     * Helper method that takes a callback, iterates through each ancestor module
     * and passes the ancestor to the callback.  Presumably the callback acts
     * on the passed ancestor.
     * 
     * If the callback ever returns false, the loop is broken and does not continue
     * executing.
     * 
     * @param fn {Function} the callback which gets passed the module
     * @param reverse {Boolean} normally the ancestors are traversed from the root down to the child.
     *        When true, allows the ancestors to be traversed from the child to the root.
     * @return undefined
     */
    withEachAncestor: function(fn, reverse) {
        var ancestors = this.getAncestors();
        if (reverse) ancestors.reverse();
        for(var i=0, j=ancestors.length; i<j; i++) {
            var resp = fn(ancestors[i]);
            if (resp === false) return false;
        }
        return true;
    },
    
    /**
     * Helper method that takes a callback, iterates through each child module
     * and passes the child to the callback.  Presumably the callback acts
     * on the passed child module.
     * 
     * If the callback ever returns false, the loop is broken and does not continue
     * executing.
     * 
     * This method distinguishes itself from withEachDescendant by only operating
     * on the calling module's children, and not propogating down through the 
     * grandchildren, great-grandchildren, etc.
     * 
     * @param {Function} the callback which gets passed the module
     * @return undefined
     */
    withEachChild: function(fn) {
        var children = this._children;
        for(var i=0, j=children.length; i<j; i++) {
            var resp = fn(children[i]);
            if (resp === false) return false;
        }
        return true;
    },
    
    /**
     * Helper method that takes a callback, iterates through each ancestor module
     * and passes the ancestor to the callback.  Presumably the callback acts
     * on the passed ancestor.
     * 
     * If the callback ever returns false, the loop is broken and does not continue
     * executing.
     * 
     * Executes the callback on ALL of the calling module's descendants, not just the
     * child modules.
     * 
     * @param {Function} the callback which gets passed the module
     * @return {Boolean} returns false if the callback returns false, true if the loop
     *                   completes 
     */
    withEachDescendant: function(fn) {
        this.withEachChild(function(child) {
            if (fn(child) === false) return false;
            child.withEachDescendant(fn);
        });
        return true;
    },

    /**
     * Find the root module in a module's tree.
     * @returns Splunk.Module object
     * @returns null
     */
    getRootAncestor: function() {
        var pointer = this, resp = null;
        while(pointer) {
            resp = pointer;
            pointer = pointer.parent;
        }
        return resp;
    },

    /**
     * Return an ordered list of all of the ancestors.
     * @returns Array
     */
    getAncestors: function() {
        var pointer = this.parent, resp = [];
        while(pointer) {
            resp.unshift(pointer);
            pointer = pointer.parent;
        }
        return resp;
    },

    /* walks up the tree looking for a 'group'.  Although group is reflected as a regular _param 
     * value, this functionality is not intended for wider usage.  Used only on dashboards currently.
     * Specifically HiddenSavedSearch broadcasts an event that has its sid and also the groupName
     * it is contained within.  This event is listened to by code in dashboard.html  to 
     * display the 'last refreshed' text for the panel. 
     */
    getGroupName: function() {
        if (this._params.hasOwnProperty("group")) {
            return this._params["group"];
        } 
        return (this.parent) ? this.parent.getGroupName() : false;
    },

    /**
     * Return an array of all the calling module's decendants.
     * @returns Array
     */
    getDescendants: function() {
        var resp=this._children.slice();
        for(var i=0; i<resp.length; i++) {
            resp = resp.concat(resp[i]._children);
        }
        return resp;
    },

    /**
     * Return an array of all the modules in the calling module's tree.
     * @returns Array
     */
    getModulesInTree: function() {
        var root = this.getRootAncestor();
        return [root].concat(root.getDescendants());
    },

    show: function(invisibilityMode) {
        invisibilityMode = invisibilityMode || "global";
        //this.logger.debug(this.moduleType , '.show( ' , invisibilityMode, ')');

        if (this._invisibilityModes.hasOwnProperty(invisibilityMode)) {
            delete this._invisibilityModes[invisibilityMode];
        }
        this._changeVisibility();
    },

    hide: function(invisibilityMode) {
        invisibilityMode = invisibilityMode || "global";
        //this.logger.debug(this.moduleType , '.hide( ' , invisibilityMode, ')');
        this._invisibilityModes[invisibilityMode] = 1;
        this._changeVisibility();
    },

    /**
     * Will show the module and all it's descendant modules.
     * clients should pass a mode arg if they want their visibility
     * changes to be respected regardless of other clients that might
     * call these methods.
     * iow - if anyone out there thinks it's invisible, it's invisible.
     *       if nobody does, it's visible.
     */
    showDescendants: function(invisibilityMode) {
        // this isSwitcherLeaf property is an idiosyncracy introduced for the
        // SerializedSwitcher modules, which modify the hierarchy for their own
        // evil purposes.
        if (!this.isSwitcherLeaf) {
            for (var i=0; i<this._children.length;i++) {
                this._children[i].show(invisibilityMode);
                this._children[i].showDescendants(invisibilityMode);
            }
        }
    },

    /**
     * Will hide the module and all it's descendant modules.
     */
    hideDescendants: function(invisibilityMode) {
        // see comment about isSwitcherLeaf on the showDescendants method.
        if (!this.isSwitcherLeaf) {
            
            for (var i=0, len=this._children.length; i<len;i++) {
                this._children[i].hide(invisibilityMode);
                this._children[i].hideDescendants(invisibilityMode);
            }
        }
    },

    /**
     * Utility method used by both hide and show.
     * TODO - needs a less dumb implementation.
     */
    _changeVisibility: function() {
        var visible = true;
        for (var mode in this._invisibilityModes) {
            if (this._invisibilityModes.hasOwnProperty(mode)) {
                visible = false;
            }
        }
        if (visible) this.container.show();
        else this.container.hide();
    },

    /**
     * Event triggered when view controller data has updates. Implement this method to observe event.
     *
     * @param {Object} event A jQuery event.
     * @param {Object} data An object literal representation of all templateArgs returned from the view.py render method.
     */
    onViewDataChange: function(event, data) {},

    /**
     * Call this method to broadcast an onViewDataChange event.
     */
    pushViewDataChange: function(){
        Splunk.Globals.ModuleLoader.refreshViewData();
    },

    ///////////////////////////////////////////////////////////////////////////
    // Module parameter persistence methods
    ///////////////////////////////////////////////////////////////////////////


    /**
     * Import the startup parameters for this module, as passed in by via the
     * main HTML template.
     *
     */
    importParams: function() {

        this._params = {};
        this._stickyParamList = [];
        this._persistableParamList = [];

        if (!Splunk.Module.loadParams) {
            this.logger.info('importParams - view does not have any parameters defined');
            return;
        }

        if (Splunk.Module.loadParams.hasOwnProperty(this.moduleId)) {
            this._params = $.extend(true, {}, Splunk.Module.loadParams[this.moduleId]);
        }

        if (!Splunk.Module.paramConfig) {
            this.logger.info('importParams - view does not have parameter config defined');
            return;
        }

        if (Splunk.Module.paramConfig.sticky.hasOwnProperty(this.moduleId)) {
            this._stickyParamList = Splunk.Module.paramConfig.sticky[this.moduleId];
        }
        if (Splunk.Module.paramConfig.persistable.hasOwnProperty(this.moduleId)) {
            this._persistableParamList = Splunk.Module.paramConfig.persistable[this.moduleId];
        }
    },


    /**
     * Returns the current module's value for parameter 'key'.  If the value is
     * not set, then 'null' is returned.
     *
     * @param {string} key The name of the parameter to retrieve.
     * @param {string} fallbackValue The value to return if the module does
     *      not have an explicit value set; will supercede the default param
     *      value set in the .conf file.
     *
     */
    getParam: function(key, fallbackValue) {

        if (!key) {
            throw Error(_('getParam: Splunk cannot get param; null key name passed'));
        }

        if (this._params.hasOwnProperty(key)) {
            return this._params[key];
        } else if (fallbackValue != null) {
            return fallbackValue;
        } else {
            return null;
        }

    },


    /**
     * Persists a module parameter.  This is used to support default sticky
     * state on views without a viewstate specified.
     *
     * @param {string} key The name of the parameter to persist.
     * @param {string} value The value of the parameter to persist.
     * @param {bool} isSessionOnly Indicates if the parameter change should
     *        only persist for the current session. Default is false.
     *
     */
    setParam: function(key, value, isSessionOnly) {

        this._params[key] = value;

        if (this.getContext().get("viewStateId")) {
            this.logger.debug('setParam - skipping param write; inside viewstate');
            return;
        }

        if ($.inArray(key, this._stickyParamList) == -1 && !this._matchesWildcardParam(key)) {
            this.logger.info('setParam - skipping param write: "' + key + '" is not sticky');
            return;
        }

        if (!isSessionOnly) {

            if (!(typeof(value) == 'string') && !(typeof(value) == 'boolean') && isNaN(value)) {
                this.logger.debug(
                    'setParam - Cannot persist non-primitive value: key='
                    + key + ' type=' + typeof(value));
                return;
            }

            $.ajax({
                type: 'POST',
                url: this._buildParamUri(),
                data: this._buildParamName(key) + '=' + encodeURIComponent(value),
                dataType: 'json',
                success: this._setParamCallback.bind(this),
                error: this._setParamErrorback.bind(this)
            });
        }

    },

    /**
     * Returns the current parameter state of this module.  Only parameters
     * that are configured to be persistable are included.
     *
     */
    snapshotParamset: function() {

        var output = {};
        var value = null;
        var wildcardPrefixes = this._getWildcardPrefixes();
        
        for (var key in this._params) {

            if ((this._params.hasOwnProperty(key) && $.inArray(key, this._persistableParamList) > -1)
                || this._matchesWildcardParam(key))
            {
                value = this._params[key];
                if (!(typeof(value) == 'string') && !(typeof(value) == 'boolean') && isNaN(value)) {
                    this.logger.warn(
                        'snapshotParamset - Cannot persist non-primitive value: key='
                        + key + ' type=' + typeof(value));
                    continue;
                }
                output[key] = this._params[key];
            }
        }
        return output;

    },

    /**
     * Private.  Returns a map of wildcarded param prefixes
     *
     */
    _getWildcardPrefixes: function() {
        var wildcardPrefixes = {};
        for (var i=0, L=this._persistableParamList.length; i<L; i++) {
            var paramName = this._persistableParamList[i];
            if (paramName.substring(paramName.length-1) == "*") {
                wildcardPrefixes[paramName.substring(0, paramName.length-1)] = 1;
            }
        }
        return wildcardPrefixes;
    },

    /**
     * Private. Indicates if 'key' matches any wildcarded parameters. Returns
     * the raw param key value if match, false otherwise.
     *
     */
    _matchesWildcardParam: function(key, forceRefresh) {
        // generate cached list of prefixes
        if (!this.hasOwnProperty('_wildcardPrefixes')) {
            this._wildcardPrefixes = this._getWildcardPrefixes();
        }

        for (var prefix in this._wildcardPrefixes) {
            if (key.substring(0, prefix.length) == prefix && this._wildcardPrefixes.hasOwnProperty(prefix)) {
                return prefix + '*';
            }
        }
        return false;
        
    },

    /**
     * Private method.  Handles the callback from setParam()
     *
     */
    _setParamCallback: function(data, textStatus) {
        this.logger.debug('_setParamCallback - response: ' + data);
    },

    /**
     * Private method.  Handles error conditions from the setParam() callback.
     *
     */
    _setParamErrorback: function(xhr, status, error) {
         this.logger.error('_setParamCallback - error: ' + xhr.responseText);
    },

    /**
     * Private method.  Returns the relative URI of the endpoint that accepts
     * parameter persistence.
     *
     */
    _buildParamUri: function(viewstate_id) {

        viewstate_id = viewstate_id || '_current';

        return Splunk.util.make_url(
            'app',
            Splunk.util.getCurrentApp(),
            Splunk.util.getCurrentView(),
            viewstate_id
        );

    },

    /**
     * Private method.  Returns the parameter key name that is accepted by the
     * parameter persistence URI, as returned by _buildParamUri()
     *
     */
    _buildParamName: function(key) {
        if (key == null) {
            throw Error('_buildParamName - Cannot build name; null key');
        }
        return encodeURIComponent(this.moduleId + '.' + key);
    },



    ///////////////////////////////////////////////////////////////////////////
    // Default content renders
    ///////////////////////////////////////////////////////////////////////////

    /**
     * By default, DispatchingModule instances will always attempt to ask the python
     * server for HTML content at the following location:
     *
     *         /module/<host_app>/<module_name>/render?client_app=<client_app>
     *
     * where <host_app> is the application that contains the code for the module,
     * while <client_app> is the user context from which this module has been requested
     *
     */
    getResultURL: function(params) {
        var uri = Splunk.util.make_url('module', Splunk.util.getConfigValue('SYSTEM_NAMESPACE'), this.moduleType, 'render');
        params = params || {};
        if (!params.hasOwnProperty('client_app')) {
            params['client_app'] = Splunk.util.getCurrentApp();
        }
        uri += '?' + Splunk.util.propToQueryString(params);
        return uri;
    },

    getResultParams: function () {
        return {};
    },

    /**
     * Convenience method for resetting XHR state such as
     * the XHR object and retry counter.
     */ 
    resetXHRStatus: function() {
        this.getResultsXHRObject = null;
        this.getResultsRetryCounter = 0;
    },

    getResultsErrorHandler: function(xhr, textStatus, errorThrown) {
        //this.logger.info('->XHR DEBUG: observer: error status:', xhr.status, 'module:', this.moduleId, 'responseText:', !!(xhr.responseText));
        this.resetXHRStatus();
        if (textStatus == 'abort') {
            this.logger.debug(this.moduleType, '.getResults() aborted');
        } else {
            this.logger.warn(this.moduleType, '.getResults() error; textStatus=' + textStatus + ' errorThrown=' + errorThrown);
        }
    },

    getResultsCompleteHandler: function(xhr, textStatus) {
        //this.logger.info('->XHR DEBUG: observer: complete status:', xhr.status, 'module:', this.moduleId, 'responseText:', !!(xhr.responseText));
        this.resetXHRStatus();
    },

    /**
     * Fetch the HTML contents for this module from server
     *
     * Enforces an XMLHTTPRequest (XHR) single channel retry policy, garbage collection and feedback loop with jobber to penalize
     * the poller. 
     */
    getResults: function() {
        //XHR retry/feedback control
        if (this.getResultsXHRObject) {
            //in-flight
            if (this.getResultsXHRObject.readyState < 4) {
                var job = this.getContext().get("search").job;
                //job is running and within retry policy
                if (job && !job.isDone() && this.getResultsRetryCounter < this.getResultsRetryPolicy) {
                    this.getResultsRetryCounter++;
                    this.logger.info('XHR already in-flight for module', this.moduleId, 'attempt', this.getResultsRetryCounter, 'of', this.getResultsRetryPolicy, 'exit out'); 
                    return;
                //wipe existing XHR and get fresh results
                } else {
                    this.abortGetResults(); 
                    this.resetXHRStatus();
                    this.logger.info('XHR in-flight destroyed for module', this.moduleId, 'for job', job.getSearchId(), 'and replaced with new one');
                }
            //an xhr previously completed without proper garbage collection, flush internal state
            } else {
                this.resetXHRStatus();
            }
        }
        this.logger.info('XHR clear for takeoff for module', this.moduleId);
        var params = this.getResultParams();
        // have to be careful and make a copy of the params.
        // Otherwise once it's a property and not just a free variable,
        // when it gets passed into getResultURL, it would get passed by reference and not by
        // value.  This causes a little bit of havoc so to avoid that we just deep copy the params.
        this._previousResultParams = $.extend(true, {}, params);

        if (Splunk._testHarnessMode) {
            this.logger.debug(this.moduleType, ".getResults -- we are in _testHarnessMode. If you're not running unit tests right now, something is horribly wrong.");
            return false;
        }

        var resultUrl = this.getResultURL(params);
        if (!resultUrl) {
            this.logger.warn("getResultsURL() appears to be unimplemented or returning null for this instance.");
        }

        var callingModule = this.moduleType;

        // we augment all requests to pass along the module name, by default
        this.getResultsXHRObject = $.ajax({
            type: "GET",
            cache: ($.browser.msie ? false : true),
            url: resultUrl,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-Splunk-Module', callingModule);
            },
            success: function(htmlFragment, textStatus, xhr) {
                if (params["sid"]) {
                    var job = this.getContext().get("search").job;
                    if (job && (params["sid"] != job.getSearchId())) {
                        this.logger.warn(this.moduleType, "while a request to a particular sid was in-flight, it appears the sid changed underneath us. We are dropping the response and NOT calling renderResults. old sid is", params["sid"], " and the new sid is ", job.getSearchId());
                        return;
                    }
                }
                //this.logger.info('->XHR DEBUG: observer: success status:', xhr.status, 'module:', this.moduleId, 'responseText:', !!(htmlFragment));
                //JQuery 1.4 bug where success callback is called after an aborted request
                //NOTE: status 0 means the resource is unreachable
                if (xhr.status==0) {
                    return;
                }
                this.renderResults(htmlFragment);
                this.resetXHRStatus();
            }.bind(this),
            complete: this.getResultsCompleteHandler.bind(this),
            error: this.getResultsErrorHandler.bind(this)
        });
    },

    haveResultParamsChanged: function() {
        var currentResultParams = this.getResultParams();
        return (!Splunk.util.objectSimilarity(this._previousResultParams, currentResultParams));
    },

    /**
     * Calls abort on the xhr object handling a getResult request.
     * This is often used when reseting a module's heirarchy to ensure
     * outgoing async requests don't end up populating a module's view erroneously.
     */
    abortGetResults: function() {
        // If the xhr request is not DONE, then we abort it.
        if (this.getResultsXHRObject && this.getResultsXHRObject.readyState < 4) {
            this.logger.info('Aborting getResults request for', this.moduleType);
            this.getResultsXHRObject.abort();
        }
    },

    /**
     *
     * Inserts content into module.  Default behavior is to ask appserver for content.
     *
     * override me to render the result of a getResults
     * Feel free to either replace or supplement the DOM elements that were
     * created by initialize().
     *
     * @param {String} htmlFragment The html to inject.
     * @param {Boolean} turbo Use shallow clone for faster html injection. CAUTION: All event listeners will be lost in clone.
     */
    renderResults: function(htmlFragment, turbo) {
        if (!htmlFragment) {
            this.resultsContainer.html('No content available.');
            return;
        }

        if (turbo) {
            this.resultsContainer = $(Splunk.util.turboInnerHTML(this.resultsContainer[0], htmlFragment));
        } else {
            this.resultsContainer.html(htmlFragment);
        }

        // fire any finalizing methods
        if (this.onResultsRendered) {
            this.onResultsRendered();
        }
    },

    /**
     * Calls the potentially overridden resetContext and resetUI for a total
     * refresh of the module and UI.
     */
    reset: function() {
        this.abortGetResults();
        this.resetXHRStatus();
        this.resetContext();
        this.resetUI();
    },

    /**
     * Should be overridden by each module to reset its interface back to a
     * default state.
     */
    resetUI: function() {
        this.logger.warn(this.moduleType, 'has not implemented a resetUI method.');
    },

    /**
     * adjusts current module DIV width to its parent width
     *
     */
    resizeWidthToParent: function() {
        this.container.width(this.container.parent().width());
    },

    /**
     * Display an error message in the content of the module.
     * @param {String} message The message to display.
     */
    displayInlineErrorMessage: function(message) {
        this.logger.error(message);
        var errorDiv = $('div.error', this.container);
        if (errorDiv.length == 0 ) {
            errorDiv = $("<div>")
                .addClass("error")
                .appendTo(this.container);
        }
        errorDiv.text(message);
        this.container.show();
    },

    /////////////////////////////////////////
    //  Testing/Debugging Methods
    /////////////////////////////////////////
    /*
     * print a module hierarchy (diagnostic)
     */
    printHierarchy: function(indentation) {
        if (!indentation) indentation = "";
        this.logger.debug(indentation, this.moduleType);

        for (var i=0; i<this._children.length;i++) {
            this._children[i].printHierarchy(indentation + "    ");
        }
    }
});

Splunk.Module.ALWAYS_REQUIRE = 1;
Splunk.Module.NEVER_ALLOW = -1;

// constants returned by isReadyForContextPush()
Splunk.Module.CANCEL = -1;
Splunk.Module.DEFER = 0;
Splunk.Module.CONTINUE = 1;
