
Splunk.ModuleLoader= $.klass({

    initialize: function() {
        this.PERMALINK_ARGS_PREFIX = 'form.';
        this.logger = Splunk.Logger.getLogger("module_loader.js");
        this.messenger = Splunk.Messenger.System.getInstance();
        this._modules = [];
        this._topLevelModules = [];
        this._modulesByID = {};

        // decorate all module prototypes with module classNames.
        for (var name in Splunk.Module) {
            if (Splunk.Module[name] && this._hasSuperclass(Splunk.Module[name], Splunk.Module) && !Splunk.Module[name].isAbstract) {
                Splunk.Module[name].prototype.moduleType = 'Splunk.Module.' + name;
            }
        }

        // listen to the moduleLoadStatusChange event. ModuleLoader fires this itself in some cases,
        // but modules that do asyncLoading will trigger the the change into WAITING_FOR_HIERARCHY
        // and modules under autoRun/permalink points will themselves trigger the change into HAS_CONTEXT
        $(document).bind('moduleLoadStatusChange', this.onModuleLoadStatusChange.bind(this));
        
        // Now kick off the first phase. From here on in subsequent phase changes will 
        // come when the last event comes in for the current phase. 
        // in other words, see onModuleLoadStatusChange().
        this.setLoadPhase(Splunk.util.moduleLoadStates.WAITING_FOR_INITIALIZATION);
    },


    getLoadPhase: function() {
        return this._loadPhase;
    },
    
    setLoadPhase: function(statusInt) {
        this._loadPhase = statusInt;
        switch (statusInt) {
            case Splunk.util.moduleLoadStates.WAITING_FOR_INITIALIZATION:
                // some modules may use the async loading mechanism. 
                //$(document).trigger('allModulesNonexistent');  //hah. 
                this.buildModuleInstanceList();
                break;

            case Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY: 
                $(document).trigger('allModulesInitialized');
                this.buildHierarchyAndTopLevelModules();
                break;

            case Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT:
                $(document).trigger('allModulesInHierarchy');
                this.pushContexts();
                break;

            default: 
                this.logger.error("ModuleLoader.setLoadPhase was given a phase it doesnt care about. Odd.  (" + statusInt + ")");
                break;
        }
    },
 
    onModuleLoadStatusChange: function(event, moduleId, statusInt) {
        if (!statusInt) this.logger.error("Assertion failed - received null or invalid statusInt for module=", moduleId, " statusInt=", statusInt);
        
        //optimization to short circuit even calculating lowestLoadState once it's purely context-changes. 
        // ie once ModuleLoader has loaded everybody he doesnt care what they have to say. 
        // His kids are off to college and he's rented out their rooms.
        if (this.getLoadPhase() >= Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT) {
            return;
        }

        var lowestLoadState = this.getLowestLoadState();
        
        // some part of the initial page load is still happening.
        // we are still in some phase strictly BEFORE WAITING_FOR_CONTEXT, 
        // and the module's lowestLoad state is either the same, or one higher.
        if (this.getLoadPhase() < lowestLoadState <= Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT) {
            // we this event is for the very last module to get WAITING_FOR_INITIALIZATION. We then move to WAITING_FOR_HIERARCHY. 
            if ((this.getLoadPhase() == Splunk.util.moduleLoadStates.WAITING_FOR_INITIALIZATION) && (this.getLowestLoadState() >= Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY)) {
                this.setLoadPhase(Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY);
                return;
            }
            // we're still loading the hierarchy AND this event is for the very last module to move to HAS_PARENT. 
            if ((this.getLoadPhase() == Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY) && (this.getLowestLoadState() >= Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT)) {
                this.setLoadPhase(Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT);
                return;
            }
            //this.logger.debug("lowest load state is " + this.getLowestLoadState() + " and were in " + this.getLoadPhase());

            // we're still loading the first contexts AND this event is for the very last module to move to HAS_CONTEXT. 
            if ((this.getLoadPhase() == Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT) && (this.getLowestLoadState() >= Splunk.util.moduleLoadStates.HAS_CONTEXT)) {
                this.setLoadPhase(Splunk.util.moduleLoadStates.HAS_CONTEXT);
            }

        }
    },
    
    buildModuleInstanceList: function() {
        this._modules = [];

        // get the collection of all module container divs.
        var moduleContainers = $('.SplunkModule');

        for (var i=0, lim=moduleContainers.length; i<lim; i++) {
            var container = moduleContainers[i];
            var subclass = container.className.replace("SplunkModule ","");

            var moduleId = $(container).attr('id');
            
            if (subclass in Splunk.Module) {
                var module = new Splunk.Module[subclass](container);
                
                this._modules.push(module);
                if (this._modulesByID.hasOwnProperty(container.id)) {
                    this.logger.error(sprintf(_("Splunk.ModuleLoader - Assertion failed. Two modules were given the same id %s"),container.id));
                }
                this._modulesByID[container.id] = module;

                // if it doesnt need async loading, then we mark it WAITING_FOR_HIERARCHY here.
                // otherwise:  by returning true from requiresAsynchronousLoading 
                //   the module accepts a contract to update its own state to WAITING_FOR_HIERARCHY 
                //   and fire moduleLoadStatusChange later.
                
            } else {
                alert(sprintf(_('Splunk encountered the following unknown module: "%s" .  The view may not load properly.'), subclass));
                this.logger.error("Splunk.ModuleLoader - Assertion failed. View config specifies a Module whose implementation cannot be found. className=",
                subclass);
            }
        }
        // Note: this means literally we've run the constructors. 
        // Because of possible async loading, this does NOT generally mean allModulesInitialized. 
        this._constructedAllModules = true;
        var state = Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY;
        for (var j=0, mod_lim=this._modules.length; j<mod_lim; j++) {
            var mod = this._modules[j];
            if (!mod.requiresAsynchronousLoading()) {
                mod.setLoadState(state);
            }
        }
    },
    
    buildHierarchyAndTopLevelModules: function() {
        this._topLevelModules = [];

        // then, setup parent-child relationships
        this._withEachModule(this._modules, function(childModule) {

            var parentSelector = childModule.container.attr('s:parentmodule');
            if (parentSelector) {

                var parentContainer = $(parentSelector)[0];
                // throw an exception if a parentmodule selector is specified but no matching elements are found
                if (!parentContainer) {
                    this.logger.error(
                        'Splunk.ModuleLoader - Module "'
                        + childModule.container.attr('id')
                        + '" could not find its declared parent module "'
                        + parentSelector + '"');
                }
                this.getModuleInstanceById(parentSelector.substring(1)).addChild(childModule);
            } else {
                this._topLevelModules.push(childModule);
            }
        }.bind(this));
        
        // there is no asynchronous 'hierarchy-loading' process.  
        // We could maybe have one someday. 
        var state = Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT;
        this._withEachModule(this._modules, function(childModule) {
            childModule.setLoadState(state);
        });
    },
    
    chartingSettingsToContext: function(settings, context) {
        var settingNameMap = {'c.chart' : 'charting.chart',
                      'c.title' : 'charting.chartTitle',
                      'c.stack' : 'charting.chart.stackMode',
                      'c.split' : 'charting.layout.splitSeries',
                      'c.nulls' : 'charting.chart.nullValueMode',
                      'c.legend' : 'charting.legend.placement',
                      'c.x.title' : 'charting.primaryAxisTitle.text',
                      'c.y.title' : 'charting.secondaryAxisTitle.text',
                      'c.y.min' : 'charting.secondaryAxis.minimumNumber',
                      'c.y.max' : 'charting.secondaryAxis.maximumNumber',
                      'c.y.scale' : 'charting.secondaryAxis.scale',
                      'c.markers': 'charting.chart.showMarkers'};

        for (var arg in settings) {
            if (settingNameMap.hasOwnProperty(arg)) {
                context.set(settingNameMap[arg], settings[arg]);
            } else if (arg.indexOf('charting.') == 0) {
                context.set(arg, settings[arg]);
            }
        }
    },
    
    pushContexts: function() {
        // check to see if the python gave us a parsed search to resurrect.
        var hashParams = Splunk.util.queryStringToProp(Splunk.util.getHash());
        var search, queryArgs = {};
 
        // populate context with values parsed from fragment id (taking precedence), or query string
        var context = new Splunk.Context();
        
        var extractFormValues = function(params) {
            var cnt = 0;
            var formValues = {};
            for (var key in params) {
                if (key.indexOf(this.PERMALINK_ARGS_PREFIX) == 0) {
                    formValues[key] = params[key];
                    cnt++;
                }
            }
            return cnt ? formValues : null;
        }.bind(this);
        var formValues = extractFormValues(hashParams);
        if (!formValues) {
            queryArgs = Splunk.util.queryStringToProp(window.location.search);
            formValues = extractFormValues(queryArgs);
        }
        // fix for the IE browsers having version 9 or below
        // ignore the hash part along with the duplicate segment of the url
        else if(formValues && $.browser.msie && window.location.hash) {

            var duplicateSegment = window.location.hash.substring(1, window.location.hash.indexOf("/"));
            var duplicateSegmentPattern = new RegExp('\/' + duplicateSegment + '#' + duplicateSegment + '\/', 'g').test(document.location.href);

            if(duplicateSegmentPattern) {
                var ignoreDuplicateSegment = window.location.hash.substring(window.location.hash.indexOf("?"));
                queryArgs = Splunk.util.queryStringToProp(ignoreDuplicateSegment);
                formValues = extractFormValues(queryArgs);
            }
        }
        
        // form search modules need to acquire their tokens after hierarchy is built          
        // and push the form search context 
        if (formValues) {
            var l,
                earliest = queryArgs.earliest,
                latest = queryArgs.latest,
                range = new Splunk.TimeRange(earliest, latest),
                ss = new Splunk.Search();
            ss.setTimeRange(range);
            for (l in formValues) {
                context.set(l, formValues[l]);
            }
            context.set('search', ss); // downstream modules expect a search to be in the context
            context.set('is_form_search', 1); // a secret word to pass the TimeRangePicker's guard
            this._withEachModule(this._modules, function(module) {
                if (module.getToken() || module.moduleType == 'Splunk.Module.TimeRangePicker') {
                    module.baseContext = $.extend(module.baseContext, context);
                    module.onContextChange();
                }
            });
        }
        
        if (hashParams.hasOwnProperty("q")) {
            this.logger.info("Kick off search based on fragment identifier");
            this.logger.info("Extracted fragment identifier params:", JSON.stringify(hashParams));
            Splunk.toBeResurrected = {
                fullSearch: hashParams.q || "",
                baseSearch: hashParams.q || "",
                decompositionFailed: true,
                intentions: [],
                earliest: hashParams.earliest || "",
                latest: hashParams.latest || ""
            };
            this.logger.info("Constructed search for module framework:", JSON.stringify(search));
            search = Splunk.Search.resurrect(Splunk.toBeResurrected);

            context.set("search", search);
            this.chartingSettingsToContext(hashParams, context);

            this.startResurrection(context, this._topLevelModules);
        } else if (Splunk.toBeResurrected) {
            search = Splunk.Search.resurrect(Splunk.toBeResurrected);
            // if this job was resurrected from a search id,  then we cannot safely allow it to be cancelled when we leave the view. 
            // trivial example is the sid links used by report builder. 
            if (search.isJobDispatched()) {
                search.job.setAsAutoCancellable(false);
            }

            context.set("search", search);

            var qsDict = Splunk.util.queryStringToProp(document.location.search);
            this.chartingSettingsToContext(qsDict, context);

            this.startResurrection(context, this._topLevelModules);
        // if there's no permalink, we mark the modules ready from the top down
        // and then we push from the autoRun points.
        } else {
            var propagateHasContextState = function(module) {
                // We stop marking modules ready when we hit DispatchingModule instances. 
                // They are not ready so they should remain locked and unable to pull or push.
                if (!module.requiresDispatch()) {
                    module.setLoadState(Splunk.util.moduleLoadStates.HAS_CONTEXT);
                    module.markPageLoadComplete();
                    if (Splunk.util.normalizeBoolean(module.getParam("autoRun"))) {
                        module.pushContextToChildren();
                    } else {
                        module.withEachChild(function(child) {
                            propagateHasContextState(child);
                        });
                    }
                }
            };

            this._withEachModule(this._topLevelModules, function(module) {
                propagateHasContextState(module);
            });
        }
        
        this.logger.debug("ModuleLoader's work is done.  - now that contexts are pushed, we clear cached contexts for all non-dispatching modules except the topmost ones.");
        this._withEachModule(this._modules, function(module) {
            // the reason we dont clear the cache for the top level modules, 
            // is because when we've resurrected from the permalink,  if the view 
            // has either a) no modules like SearchBar/TimeRangePicker to resurrect that data model, 
            // or b) has some but not all of them,    the topmost baseContext cache, being the one we resurrected
            // contains the only copy of that resurrected data. 
            // properly marking the contexts stale WHEN we cache them during page load,  
            // helps but is not sufficient.
            if (!module.requiresDispatch(search)
                && module.parent
                && module.baseContext
                && (!module.baseContext.get('search') || !module.baseContext.get('search').isJobDispatched())) {
                module.baseContext = null;
            }
        });
        Splunk.Globals["Jobber"].clearForPolling();
        
        // Run search if prepopulation args are present
        if (formValues) {
            this._withEachModule(this._modules, function(module) {
                if (module.moduleType == 'Splunk.Module.SubmitButton') {
                    module.pushContextToChildren(null, true);
                    return;
                }
            });
        }
        
    },

    getLowestLoadState: function() {
        
        var minimumStatus = Splunk.util.moduleLoadStates.HAS_CONTEXT;
        for (var i=0,l=this._modules.length; i<l; i++) {
            minimumStatus = Math.min(minimumStatus, this._modules[i].getLoadState());
        }

        // If he hasnt constructed some modules, he doesnt KNOW that he hasnt constructed them yet. 
        // so we leave a flag until we know that we've run the constructors for all of them.
        if (!this._constructedAllModules) minimumStatus = Math.min(minimumStatus, Splunk.util.moduleLoadStates.WAITING_FOR_INITIALIZATION);
        
        return minimumStatus;
    },

    getModuleLoadState: function(moduleId) {
        return this.getModuleInstanceById(moduleId).getLoadState();
    },

    _hasSuperclass: function(subclass, superclass) {
        // return true if the subclass has the superclass as a parent or ultimate grandparent
        var i = 0;
        while ((subclass.superclass) && i < 100) {
            //TODO - this had a single equals, but everything seemed to work. Changed it, and Im now deeply suspicious.
            if (subclass.superclass == superclass) return true;

            subclass = subclass.superclass;
            i++;
        }
        return false;
    },

    startResurrection: function(context, topLevelModules) {
        this._withEachModule(topLevelModules, function(module) {
            
            var seamModule = module;
            // we are walking down, looking for the first module whose IMMEDIATE children
            // require dispatch on an undispatched search.
            // if none are found, we will go to the first branch in the tree.  ie the first module with more than one child.
            var nullSearch = new Splunk.Search();
            while (!seamModule.requiresDispatch(nullSearch) && !seamModule.someChildrenRequireDispatch(nullSearch)) {
                if (seamModule._children && seamModule._children.length == 1) {
                    seamModule = seamModule._children[0];
                // if there is more than one child, then we can go no deeper and we have to start resurrection from here. 
                // and if there are NO children, then it doesnt make much sense to resurrect at all, but lets do it anyway. 
                //    (maybe someone will make a view where there's no dispatching modules, but somehow the resurrected values 
                //     do end up doing *something* meaningful.)
                } else {
                    break;
                }
            }

            var search = context.get("search");
            this.logger.warn("resurrection proceeding from ", seamModule.moduleType, " id=", seamModule.container.attr("id"));
            var upwardContext = context.clone();
            seamModule.applyContext(upwardContext);
            seamModule.passContextToParent(upwardContext);

            seamModule.withEachAncestor(function(module) {
                module.setLoadState(Splunk.util.moduleLoadStates.HAS_CONTEXT);
                module.markPageLoadComplete();
            });
            
            seamModule.setLoadState(Splunk.util.moduleLoadStates.HAS_CONTEXT);
            seamModule.pushContextToChildren(context);
            seamModule.markPageLoadComplete();
        }.bind(this));
    },

    /*
     * Utility function to iterate over all the modules and run a callback for each.
     */
    _withEachModule: function(moduleInstances, moduleFunc) {
        var numberOfModules = moduleInstances.length;
        if (!numberOfModules) {
            this.logger.warn("No modules found in view.");
        }
        for (var i=0;i<numberOfModules;i++) {
            moduleFunc(moduleInstances[i]);
        }
    },

    /**
     * Returns the active Javascript module class instance that corresponds to
     * a specific container DOM id
     *
     * NOTE: This method is only intended for testing introspection.  If you
     *      are using this method in primary development, you're doing it wrong.
     *
     */
    getModuleInstanceById: function(moduleId) {
        if (this._modulesByID.hasOwnProperty(moduleId)) {
            return this._modulesByID[moduleId];
        } else {
            this.logger.error("no module loaded with id=" + moduleId);
        }
        throw new Error('Could not find module class instance for DOM ID=' + moduleId + ' (' + this._modules.length + ' modules total).');
    },

    
   
    ///////////////////////////////////////////////////////////////////////////
    // Parameter persistence methods
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Persists all of the current modules' parameters.
     *
     * @param {String} The unique ID under which to save the viewstate.  If
     *      null, then a new ID will be generated.
     * @param {Boolean} Indicates if this viewstate is to be saved in a shared
     *      context within the current app.  Defaults to false.
     *
     */
    commitViewParams: function(viewstate_id, is_shared) {

        // ensure that a valid viewstate is passed
        // if the current view also specifies a display view, then push this
        // viewstate into the global context so that both the current and 
        // display view can access the pending viewstate
        if (!viewstate_id) {
            viewstate_id = this._generateViewstateId();
            if (Splunk.util.getCurrentDisplayView() != Splunk.util.getCurrentView()) {
                viewstate_id = '*:' + viewstate_id;
            }
        } else {
            viewstate_id = $.trim(viewstate_id);
        }

        // collect all parameters from all modules

        var payload = [];

        this._withEachModule(this._modules, function(module) {
            var tmpParams = module.snapshotParamset();

            for (var key in tmpParams) {
                if (tmpParams.hasOwnProperty(key)) {
                    payload.push(
                        module._buildParamName(key)
                        + '=' + encodeURIComponent(tmpParams[key])
                    );
                }
            }
        });

        if (payload.length == 0) {
            this.logger.warn(sprintf(
                'commitViewParams - no parameters to persist; app=%s view=%s',
                Splunk.util.getCurrentApp(),
                Splunk.util.getCurrentView()
            ));
            return null;
        }

        if (is_shared == true) {
            payload.push('_is_shared=true');
        }

        $.ajax({
            type: 'POST',
            url: this._modules[0]._buildParamUri(viewstate_id),
            data: payload.join('&'),
            dataType: 'json',
            success: this._commitViewParamsCallback.bind(this),
            error: this._commitViewParamsErrorback.bind(this)
        });

        return viewstate_id;
    },

    /**
     * Private method.  Handles commitViewParams callback.
     *
     */
    _commitViewParamsCallback: function(data, textStatus) {
        this.logger.debug('_commitViewParamsCallback - status=' + textStatus);
    },

    /**
     * Private method.  Handles commitViewParams error condition.
     *
     */
    _commitViewParamsErrorback: function(xhr, status, error) {
        this.logger.error('_commitViewParamsErrorback - ' + error);
    },

    /**
     * Private method.  Returns a relatively unique ID that can be used as a
     * viewstate ID.
     *
     */
    _generateViewstateId: function() {
        return (new Date()).getTime().toString(36);
    },

    /**
     * Retrieve an object literal representation of all templateArgs returned from the view.py render method and trigger viewDataChange
     * event having event and data arguments.
     */
    refreshViewData: function(){
        $.ajax({
            type: "GET",
            url: Splunk.util.make_url("api", "app", Splunk.util.getCurrentApp(), Splunk.util.getCurrentView()),
            cache: false,
            dataType: "text",
            complete: function(data, textStatus){
                if(data.status==200){
                    try{
                        viewData = JSON.parse(data.responseText);
                    }catch(e){
                        this.logger.warn("Could not parse view data with error", e);
                        return;
                    }
                    $(document).trigger("viewDataChange" , [viewData]);
                }else{
                    this.logger.error("Could not retrieve view data change status was", data.status);
                }
            }.bind(this)
        });
    }

});

