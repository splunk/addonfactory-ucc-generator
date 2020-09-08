Splunk.Module.JobStatus = $.klass(Splunk.Module.DispatchingModule, {

    ALERT_WIZARD_CLASS_NAME: "alertwizard",
    BACKGROUND_CLASS_NAME: "background",
    CANCEL_CLASS_NAME: "cancel",
    CLOSE_CLASS_NAME: "close",
    DASHBOARD_WIZARD_CLASS_NAME: "dashboardwizard",
    FINALIZE_CLASS_NAME: "finalize",
    OUTPUT_CLASS_NAME: "output",
    PAUSE_CLASS_NAME: "pause",
    UNPAUSE_CLASS_NAME: "unpause",
    RESULTS_LINK_CLASS_NAME: "resultsLink",
    SAVE_CLASS_NAME: "save",
    SAVE_WIZARD_CLASS_NAME: "savewizard",
    DISABLED_CLASS_NAME: "splButton-disabled",
    
    FINALIZING_STATE: "finalizing",
    RUNNING_STATE: "running",
    COMPLETE_STATE: "complete",
    EMPTY_STATE: "empty",
    PAUSED_STATE: "paused",
    
    SAVED_SEARCH_POPUP_SELECTOR: ".savedsearchpopup",
    SAVED_SEARCH_POPUP_TITLE: "Save Search",
	
    SHARE_LINK_FORM_CONTAINER_CLASS: '.shareLinkForm',
    SHARE_LINK_FORM_TITLE: "Save and Share Results",
    DISABLED_CLASS: "disabled",
    EVENTTYPE_FORM_CONTAINER_CLASS: '.eventtypeForm',
    EVENTTYPE_FORM_TITLE: _('Save As Event Type'),
    REPORTBUILDER_LINK_CLASS: "resultsLink",

    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("Splunk.Module.JobStatus");
        this.container.click(this.onUIEvent.bind(this));//Bootstrap top level event dispatcher.
        this.currentState = this.EMPTY_STATE;
        this.headerClass = "";
        this.links = $(".jobActions", this.container);
        this.header = $(".splHeader", this.container);
        this._autoPauseTimer = null;
        this._isAutoPauseTriggered = false;
        this.currentRealTimeSearchState = false;
        
        this.alertLink = $("." + this.ALERT_WIZARD_CLASS_NAME, this.links);
        this.backgroundLink = $("." + this.BACKGROUND_CLASS_NAME, this.links);
        this.cancelLink = $("." + this.CANCEL_CLASS_NAME, this.links);
        this.closeLink = $("." + this.CLOSE_CLASS_NAME, this.links);
        this.dashboardLink = $("." + this.DASHBOARD_WIZARD_CLASS_NAME, this.links);
        this.finalizeLink = $("." + this.FINALIZE_CLASS_NAME, this.links);
        this.outputLink = $("." + this.OUTPUT_CLASS_NAME, this.links);
        this.pauseLink = $("." + this.PAUSE_CLASS_NAME, this.links);
        this.saveLink = $("." + this.SAVE_CLASS_NAME, this.links);
        this.saveWizardLink = $("." + this.SAVE_WIZARD_CLASS_NAME, this.links);
        this.unpauseLink = $("." + this.UNPAUSE_CLASS_NAME, this.links);

        this.currentView = Splunk.util.getCurrentView();

        //TODO move this to a JS var via script tag in template
        this.canScheduleSearch = Splunk.util.normalizeBoolean($('input[name="can_schedule_search"]', this.container).attr('value'));       
       
        // the resultsLink param offers a way for the user to view the search results
        // in a different view.
        // the primary use of this param is to launch report builder, in the report_builder_define_data view,
        this.setupResultsLink();

        // Handle the cases where job status are changed from other views.
        $(document).bind('jobPaused', function(event, job) {
            this._controlStatus(event, job, 'pause');
        }.bind(this));
        $(document).bind('jobFinalized', function(event, job) {
            this._controlStatus(event, job, 'finalize');
        }.bind(this));
        $(document).bind('jobUnpaused', function(event, job) {
            this._controlStatus(event, job, 'unpause'); 
        }.bind(this));
		
		
        this.printBtn = $(".print", this.container);		
        this.printBtn.click(function(e){
            if(this.printBtn.hasClass(this.DISABLED_CLASS_NAME)){				
                return false;
            }
            $(document).trigger("PrintPage");
            e.preventDefault();
            return false;			
        }.bind(this));

        this.inspectorBtn = $(".inspector", this.container);		
        this.inspectorBtn.click(function(e){
            if(this.inspectorBtn.hasClass(this.DISABLED_CLASS_NAME)){				
                return false;
            }
            var context = this.getContext();
            var search  = context.get("search");
            var searchId = search.job.getSearchId();
            if(searchId){
                Splunk.window.openJobInspector(search.job.getSearchId());
            }

            return false;		
        }.bind(this));

        this.querys = Splunk.util.queryStringToProp(window.location.search);		
        this.messenger = Splunk.Messenger.System.getInstance();

        this._filter = Splunk.util.normalizeBoolean(this.getParam("actionsMenuFilter")) || 'flashtimeline';
        if (this._filter == 'dashboard') {
            var viewObjectMode = Splunk.util.getCurrentViewConfig()['view']['objectMode'];
            if (viewObjectMode == 'SimpleDashboard') {
                this._filter = 'dashboard-SimpleDashboard';
            }
        }
		
        this.isEditReport = false;
        if(typeof this.querys.s !== 'undefined' && this._filter == 'reportformat'){
            this.isEditReport = true;
        }

        // build the actions menu
        this.buildSaveMenu();

        //build create menu		
        this.buildCreateMenu();

    },
    
    buildSaveMenu: function(){
		this.saveMenuItemsDict = [];
		
		if (this.isEditReport) {
            this.saveMenuItemsDict.push({
                "label" : _("Save report"),
                "style": "save-report",
                callback: function(event) {
                    var context = this.getContext();
                    var search  = context.get("search");
                    var savedSearchName = search.getSavedSearchName();
                    this.onOverwriteReportClick(event, savedSearchName);
                }.bind(this),
                "showInFilter" : ['reportformat'],
                "enabled" : ["done", "progress"]
            });
            
            this.saveMenuItemsDict.push({
                "label" : _("Save report as..."),
                "style": "save-report-as",
                callback: function(event) {
                    var context = this.getContext();
                    var search = context.get("search");
                    Splunk.Popup.SaveSearchWizard(search, {title: _("Save Report")});
                }.bind(this),
                "showInFilter" : ['reportformat'],
                "enabled" : ["done", "progress"]
            });
        }else{
            this.saveMenuItemsDict.push({
                "label" : _("Save report..."),
                "style": "save-report",
                callback: function(){
                    var search = this.getContext().get("search");
                    
                    Splunk.Popup.SaveSearchWizard(search,{
                        title:_('Save Report'),
                        onDone: function(e){
                            var target = $(e.target);
                            if(!target.is('a')){
                                target = target.closest('a');
                            }
                            var searchName = target.data('searchname');
                            Splunk.util.redirect_to(
                            		('app' + '/' + Splunk.util.getCurrentApp() + '/' + 'report_builder_display'), 
                            		{'s' : searchName});
                        }
                    });

                }.bind(this),
                "showInFilter" : ['reportformat', 'reportview'],
                "enabled" : ["done", "progress"]
            });

        }


        this.saveMenuItemsDict.push({
            "label" : _("Save search..."),
            "style": "save-search",
            callback: function(){
                var search = this.getContext().get("search");
                Splunk.Popup.SaveSearchWizard(search);

            }.bind(this),
            "showInFilter" : ['flashtimeline', 'charting'],
            "enabled" : ["done", "progress"]
        });
		
		this.saveMenuItemsDict.push({
            "divider": "actionsMenuDivider",
            "showInFilter" : ['flashtimeline', 'charting', 'reportformat', 'reportview' ],
            "enabled" : "*"
        });
		
		this.saveMenuItemsDict.push({
            "label": _("Save results"),
            "style": "save-results",
            callback: function(event) {
                //TODO - revisit whether this direct property check is still necessary
                if (this.baseContext) {
                    var search = this.getContext().get("search");
                    var self = this;
                    search.job.save(
                        function() {
                            self.messenger.send("info", "splunk.search", _("These search results have been saved. You can retrieve them later via the jobs manager."));
                        },
                        function() {
                            self.messenger.send("error", "splunk.search", _("Failed to save search results.  The search job may have expired."));
                        });
                }
            }.bind(this),
            "showInFilter" : ['flashtimeline', 'charting', 'reportformat', 'reportview'],
            "enabled" : ["done", "progress"]
        });
		
        this.saveMenuItemsDict.push({
            // formerly Link to search
            "label" : _("Save & share results..."),
            "style": "share-results",
            callback: function(event) {
                //var formContainer = $(this.SHARE_LINK_FORM_CONTAINER_CLASS, this.container)[0] TODO ensure this form container is in the right spot/included
                var formContainer = $(this.SHARE_LINK_FORM_CONTAINER_CLASS)[0];
                var title = this.SHARE_LINK_FORM_TITLE;
                var search = this.getContext().get("search");
                Splunk.Popup.createShareLinkForm(formContainer, title, search);
            }.bind(this),
            "showInFilter" : ['flashtimeline', 'charting', 'reportformat', 'reportview'],
            "enabled" : ["done", "progress"]
        });

        this.saveMenu = new Splunk.MenuBuilder({
            //containerDiv: this.container,
            menuDict: this.getEnabledMenuData(this.saveMenuItemsDict, "*"),
            activator: $('.save', this.container),
            menuClasses: 'splMenu-primary',
            filter: this._filter
        });	
	},

    buildCreateMenu: function(){

        this.createMenuItemsDict = [];

        if(this.isEditReport){
            $('.create', this.container).hide();
        }

    
	this.createMenuItemsDict.push({
	    "label" : _("Dashboard panel..."),
	    "style": "create-dashboard-panel",
	    callback: function() {
		var search = this.getContext().get("search");
		var vizType = "event";
		if (search.job.areResultsTransformed()) {
		    vizType = "table";
		    
		    this.withEachDescendant(function(module) {
			var mc = module.getModifiedContext();
			if (module.moduleId.indexOf("JSChart") != 0)
			    return;
			
			if (!mc.has("charting.chart") || !$(module.container).is(":visible"))
			    return;
			
			vizType = mc.get("charting.chart");
		    });
		}

		Splunk.Popup.DashboardWizard(search, {panel_type: vizType});
	    }.bind(this),
	    "showInFilter" : ['flashtimeline', 'charting', 'reportformat'],
	    "enabled" : ["done", "progress"]
	});
	
        if (this.canScheduleSearch) {
          this.createMenuItemsDict.push({
              "label" : _("Alert..."),
              "style": "create-alert",
              callback: function(){
                  var search = this.getContext().get("search");
                  Splunk.Popup.AlertWizard(search);
              }.bind(this),
              "showInFilter" : ['flashtimeline', 'charting'],
              "enabled" : ["done", "progress"]
          });
        }
		
        this.createMenuItemsDict.push({
            "label" : _("Report..."),
            "style": "create-report",
            "enabledWhen" : "progress",
            "callback": function(event){
                return this.onBuildReport(event);
            }.bind(this),
            /* TODO: make this replace the page but open a new target=_blank.
             * Due to weirdness in legacy onBuildReport this is fragrile.
             */ 
            "showInFilter" : ['flashtimeline'],
            "enabled" : ["done", "progress"]
        });
		
        this.createMenuItemsDict.push({
            "label" : _("Event type..."),
            "style": "create-event-type",
            "alwaysEnabled" : true,
            callback: function(){
                var context = this.getContext();
                var search  = context.get("search");
                var formContainer = $(this.EVENTTYPE_FORM_CONTAINER_CLASS, this.container)[0];
                Splunk.Popup.createEventtypeForm(formContainer, this.EVENTTYPE_FORM_TITLE, search);	
            }.bind(this),
            "showInFilter" : ['flashtimeline', 'charting'],
            "enabled" : "*"
        });
		
		this.createMenuItemsDict.push({
            "label" : _("Scheduled PDF..."),
            "style": "create-schedule-pdf",
            "callback": this.schedulePDF.bind(this),
            "showInFilter" : ['dashboard', 'dashboard-SimpleDashboard'],
            "enabled" : (Splunk.util.getCurrentViewConfig()['view'] && Splunk.util.getCurrentViewConfig()['view']['hasAutoRun'])?"*":[]
        });

        if (this.canScheduleSearch) {
            this.createMenuItemsDict.push({
                "label" : _("Scheduled search..."),
                "style": "create-schedule-digest",
                callback: function(){
                    var search = this.getContext().get("search");
                    Splunk.Popup.ScheduleDigestWizard(search, {title: _("Create Scheduled Search")});
                }.bind(this),
                "showInFilter" : ['flashtimeline'],
                "enabled" : ["progress", "done"]
            });
            
            this.createMenuItemsDict.push({
                "label" : _("Scheduled report..."),
                "style": "create-schedule-digest",
                callback: function(){
                    var search = this.getContext().get("search");
                    Splunk.Popup.ScheduleDigestWizard(search, {title: _("Create Scheduled Report")});
                }.bind(this),
                "showInFilter" : ['charting', 'reportformat'],
                "enabled" : ["progress", "done"]
            });
        }


        this.createMenu = new Splunk.MenuBuilder({
            //containerDiv: this.container,
            menuDict: this.getEnabledMenuData(this.createMenuItemsDict, "*"),
            activator: $('.create', this.container),
            menuClasses: 'splMenu-primary',
            filter: this._filter
        });


	},
	onOverwriteReportClick: function(event, savedSearchName) {

        var context = this.getContext();
        var search  = context.get("search");
        
        if (!savedSearchName) {
            this.messenger.send('fatal', 'splunk.search', 
                sprintf(_('Tried to update "%s" but it was not loaded into the current view'), savedSearchName)
            );
            return;
        }
        
        // check that the saved search has a viewstate already persisted
        var viewstateId = search.getViewStateId();
        if (!viewstateId) {
            this.messenger.send('fatal', 'splunk.search', 
                sprintf(_('Tried to update "%s" but it did not have an existing viewstate'), savedSearchName)
            );
            return;
        }

        //this.logger.debug(sprintf(
        //    'onOverwriteReportClick - saved_vsid=%s temp_vsid=%s', 
        //    viewstateId,
        //    Splunk.util.getCurrentViewState()
        //));
        
        // go
        Splunk.Globals.ModuleLoader.commitViewParams(viewstateId, true);

        this.messenger.send('info', 'splunk.search',
            _('Successfully updated view settings')
        );
    },
	getEnabledMenuData: function(menuData, enabled){		
		//return menuData;
		var wildCard = "*";
        var validEnabledValues = ["progress", "done", wildCard];
        if($.inArray(enabled, validEnabledValues)==-1){
            this.logger.warn("Invalid menu enabled value of", enabled, ", setting default to wildCard");
            enabled = wildCard;
        }
        var newMenu = [];
        for (var i=0; i<menuData.length; i++) {
            var oldMenuEntry = menuData[i];
            if (!oldMenuEntry.hasOwnProperty("enabled") || wildCard==oldMenuEntry.enabled || $.inArray(enabled, oldMenuEntry.enabled)!=-1) {
                newMenu.push(oldMenuEntry);
            } else {
                var newMenuEntry = {
                    "label": oldMenuEntry.label,
                    "style": this.DISABLED_CLASS,
                    "showInFilter": oldMenuEntry.showInFilter
                };
                newMenu.push(newMenuEntry);
            }
        }
        return newMenu;
		
	},
	/**
     * Convenience method for the efficient and easy re-generation of the actions menu following the enabled pattern described in getEnabledActionsMenuData.
     * Update the actions menu based on an enabled state and regenerates if required.
     * Does not regenerate the same menu if the same enabled state matches the previously passed in value.
     * 
     * NOTE: This method interacts with the stateful member this.actionsMenuItemsDict
     * 
     * @param {String} enabled See getEnabledActionsMenuData method signature for details.
     */
	updateMenu: function(enabled) {
        if (this.lastEnabled && this.lastEnabled==enabled /*|| !this._showActionsMenu */) {
            return;
        }
        this.lastEnabled = enabled;
		
		var createMenuData = this.getEnabledMenuData(this.createMenuItemsDict, enabled);
        this.createMenu.updateMenu(createMenuData);
		
        var saveMenuData = this.getEnabledMenuData(this.saveMenuItemsDict, enabled);
        this.saveMenu.updateMenu(saveMenuData);
    },    
    /**
     * Handles controlling the status bar when a user changes a job's state remotely.
     */
    _controlStatus: function(event, job, action) {
        var jobSID = job.getSID();
        var context = this.getContext();
        if (!context) return;
        var search = context.get('search');
        if (!search || !search.job) return;
        var sid = search.job.getSID();
        if (sid == jobSID) this.onJobStatusChange(event, action);        
    },
    
    setState: function(state, optionalJob) {
        if (this.currentState != state) {
	        allLinks = this.links.find("a");
	        this.enableLinks(allLinks);
	        this.pauseLink.show();
	        this.unpauseLink.hide();
	        
	        switch (state) {
                case this.EMPTY_STATE:
                    this.disableLinks(allLinks);
                    break;
                case this.RUNNING_STATE:
                    break;
                case this.PAUSED_STATE:
                    this.unpauseLink.show();
                    this.pauseLink.hide();
                    this.disableLinks(this.backgroundLink);
                    break;
                case this.FINALIZING_STATE:
                case this.COMPLETE_STATE:
                    this.disableLinks(this.pauseLink);
                    this.disableLinks(this.finalizeLink);
                    this.disableLinks(this.backgroundLink);
                    this.disableLinks(this.cancelLink);
                    break;
                default:
                    break;
            }


            if (this.currentRealTimeSearchState==true)
                this.disableLinks(this.backgroundLink);
        }
        
        this.currentState = state;
        this.updateHeader(state, optionalJob || null);
    },
    
    disableLinks: function(links) {
    	links.addClass(this.DISABLED_CLASS_NAME);
    	links.attr('tabindex', "-1");
    },
    
    enableLinks: function(links) {
        links.removeClass(this.DISABLED_CLASS_NAME);
        links.removeAttr('tabindex');
    },
    
    /**
     * Sets the parent links class name to realtime or removes it. Used for the display/hide control for real-time search related valid actions defined in JobStatus.css selectors.
     * Has builtin cache using currentRealTimeSearchState instance member.
     * 
     * @param {Boolean} bool Is it a real time search or not.
     */
    setRealTimeSearchState: function(bool) {
        if (bool && this.currentRealTimeSearchState!=bool) {
            this.disableLinks(this.backgroundLink);
        } else if(this.currentRealTimeSearchState!=bool) {
            this.enableLinks(this.backgroundLink);
        }
        this.currentRealTimeSearchState = bool;
    },
    
    /**
     * given one of 'events', 'scanned', 'progress' or 'results', this method will 
     * return a human-readable header string. 
     * As a part of a strategy to preserve CSS backward compatibility, we have to return an array 
     * of dictionaries instead of a simple array of strings.  This is so that the 'name' 
     * you see here can end up rendered as a classname on the corresponding DOM element
     */
    getHeaderFragment: function(name, job) {
        // kind of strange to return a dict, but we need to preserve the classname, for backward compatibility with the skins. 
        //  ie.  all of the little em's and h2's have class="progress"  etc. and the skins unfortunately picked that up.
        var returnDict = {"name": name};
        switch (name) {
            case "events":
                var events = job.getEventCount();
                
                if (job.isDone()) {
                    returnDict["text"] = sprintf(ungettext('%s matching event', '%s matching events', events), format_number(events));
                } else {
                    returnDict["text"] = sprintf(/* TRANS: &#8805 is the greater than or equal to symbol */ungettext('&#8805; %s matching event', '&#8805; %s matching events', events), format_number(events));
                }
                break;
            case "scanned":
                var scanned = job.getScanCount();
                returnDict["text"] = sprintf(ungettext('%s scanned event', '%s scanned events', scanned), format_number(scanned));
                break;
            case "progress":
                var progress = Math.round(job.getDoneProgress() * 100);
                returnDict["text"] = sprintf(_('%s%% complete'), progress);
                break;
            case "results":
                var results = job.getResultCount();
                returnDict["text"] = sprintf(ungettext('%s result', '%s results', results), format_number(results));
                break;
            default:
                this.logger.error("getHeaderFragment - unknown name provided - ", name);
                returnDict["text"] = "";
                break;
        }
        return returnDict;
    },
    
    /**
     * Called when we need to update the headers and <em> elements. 
     * Generally called onJobProgress, onJobDone, and onContextChange.
     *
     */
    updateHeader: function(className, optionalJob) {
        
        var headers = [];
        
        // CSS compatibility issue 1 - in the old implementation the 'splHeader' class got a custom 'state' classname 
        // so we have to preserve that.  Here we remove the old one and later we'll add the new one.
        this.header.removeClass(this.headerClass);

        var job = optionalJob || this.getContext().get("search").job;

        switch (className) {
            case "finalizing":
                // CSS compatibility issue 2 - all of the h2 and em elements had their own 
                // class="progress"   class="scanned"  etc..  
                // to allow getHeaderFragment to do this *somewhat* generically, 
                // we are forced here to use a more complex headers array. 
                headers.push({"name":"","text":_('Your search is finalizing...')});
                this.headerClass = "running";
                break;
            case "pausing":
                headers.push({"name":"","text":_('Your search is pausing...')});
                break;
            case "paused":
                headers.push({"name":"","text":_('Your search is paused.')});
                this.headerClass = "paused";
                break;
            case "running":
                this.headerClass = "running";
                //TODO - it would be cool to add a 
                // <param name="transformingDisplay">progress,results</param>
                // and 
                // <param name="nonTransformingDisplay">events,scanned</param>
                // so that you could really customize your own view to give you whatever
                // ie <param name="transformingDisplay">progress,scanned,results</param>
                // or going the other way, <param name="transformingDisplay">progress</param>
          
                headers.push(this.getHeaderFragment("events", job));
                headers.push(this.getHeaderFragment("scanned", job));
                    
                break;
            case "complete":
                this.headerClass = "complete";
                headers.push(this.getHeaderFragment("events", job));
                break;
            case "empty":
                break;
            default : 
                this.logger.warn("there should be no unspecified cases in this switch. className=", className);
                break;
        }
        this.header.addClass(this.headerClass);
        this.header.html('');
        // The first element in the headers array is always rendered as an h2 element. 
        if (headers.length>0) {
            h2 = $("<h2>")
                .html(headers[0]["text"])
                .addClass(headers[0]["name"]);
            
            var onDeckCircle = $("<div>");

            onDeckCircle.append(h2);
        
            for (var i=1; i<headers.length; i++) {
                // follow the css convention of using .splPipe on our | chars.
                onDeckCircle.append($('<span class="splPipe">|</span>'));
                // subsequent items in the headers array are rendered as <em> elements, and are given a matching classname.
                emElement = $("<em>")
                    .addClass(headers[i]["name"])
                    .text(headers[i]["text"]);
                onDeckCircle.append(emElement);
            }
            this.header.html(onDeckCircle.html());
        }
        
    },
    

    /**
     * Called when a new search comes down from above.
     */
    onContextChange: function($super){
        this.header.html('');
        this.show();
        this.setRealTimeSearchState(false);
        var context = this.getContext();
        var search  = context.get("search");
        var job = search.job;
        var events = search.job.getEventCount();
        if (job.isDone()){
            this.setState(this.COMPLETE_STATE);
        } else if (job.isCanceled()){
            this.setState(this.EMPTY_STATE);
        } else if (job.isPaused()){
            this.setState(this.PAUSED_STATE);
        } else if (job.isFinalized()){
            this.setState(this.COMPLETE_STATE);
        } else if (job.isRunning()){
            this.setState(this.RUNNING_STATE);
        } else{
            this.setState(this.EMPTY_STATE);
        }


        //
        // handle auto-pause requests; current use case is clicks from the 
        // dashboard will auto-pause after 30 seconds
        //
        // TODO: while the proper way to do this is via context, the parameter
        //      set during resurrection only intermittently makes its way
        //      here; therefore deferring to URI inspection until the context
        //      issue is resolved
        //
        
        if (
            Splunk.util.normalizeBoolean(this.querys['auto_pause'])
            //context.get('auto_pause') == true // TODO: reinstate per above
            && this._autoPauseTimer == null
            && job.isRunning()
            && this.getParam('autoPauseInterval')
            && !this._isAutoPauseTriggered) {
                this._isAutoPauseTriggered = true;
                this.startAutoPause();
        }
        
        this.disableLinks(this.printBtn);
        // when onContextChange is called, there is a job and it has an sid
        // that is why the job inspector should be enabled and not disabled 
        this.enableLinks(this.inspectorBtn);
		
        $super();
		
    },


    /**
     * unlike most implementations of onBeforeJobDispatched, we dont actually need to modify the ancestor's search
     * before dispatching it, we just need to know so we can put up the UI for the 'running' state
     * This is so that we can give immediate user feedback rather than waiting for the POST to return.
     */
    onBeforeJobDispatched: function(search) {
        var jobOverride = new Splunk.Job("*");
        this.setState(this.RUNNING_STATE, jobOverride);
        this.cancelAutoPause();
        // since we are firing a new job, the old job inspector should be disabled
       	this.disableLinks(this.inspectorBtn);
    },
    
    
    /**
     * Handle job complete and update UI.
     */
    onJobDone: function(event){
        var context = this.getContext();
        var search  = context.get("search");

        var events = search.job.getEventCount();
        if (this._params["hideOnJobDone"] == "True") {
            this.hide();
            this.setState(this.EMPTY_STATE);
        } else {
            this.setState(this.COMPLETE_STATE);
        }
        this.cancelAutoPause();
		
		// put in the usable menu on job completion
        this.updateMenu("done");
        this.updateMenu("done");

        this.enableLinks(this.printBtn);
    },
    
    
    /**
     * Handle job progress.
     */
    onJobProgress:function(){
        var context = this.getContext();
        var search  = context.get("search");
        if(!search.job.isPaused() && !search.job.isFinalized()){
            this.setState(this.RUNNING_STATE);
            this.updateResultsLink(search.job.getSearchId());
        }
        this.setRealTimeSearchState(search.job.isRealTimeSearch());
		
        this.enableLinks(this.inspectorBtn);		
        this.updateMenu("progress");
    },
    
    /**
     * Handle the in-between states of the links, after a user clicks on
     * a control but before the control is acknowledged by the server.
     *
     * @param {Object} event The event that fired the onJobStatusChange (see jobber.js)
     * @param {String} status The status event identifier.
     */
    onJobStatusChange: function(event, status){
		
        switch(status){
            case "pause":
                this.setState(this.PAUSED_STATE);
				this.enableLinks(this.inspectorBtn);
                break;
            case "unpause":
                this.setState(this.RUNNING_STATE);
                break;
            case "finalize":
                this.setState(this.FINALIZING_STATE);
                break;
            // NOTE - the autocancellation of previous jobs will not hit this, 
            // because the previous job is only cancelled after the next one is POSTed
            // which means that by that time the previous job wont match this module's sid.
            case "cancel":
                this.setState(this.EMPTY_STATE);
                this.updateMenu("*");
                this.disableLinks(this.inspectorBtn);
                break;
            default:
                this.logger.warn("Job status change that is not being monitored.");
                break;
        }
        this.cancelAutoPause();
    },

    /**
     * Handle a save action. Spawns a popup window from  EAI, w00t!.
     *
     * @param {Object} event A jQuery event.
     */
    onSave: function(event){
        var formContainer = $(this.SAVED_SEARCH_POPUP_SELECTOR)[0];
        var title = this.SAVED_SEARCH_POPUP_TITLE;
        Splunk.Popup.createSavedSearchForm(formContainer, title, this.getContext().get("search"));
        return false;
    },

    /**
     * Top level UI event listener and dispatcher.
     *
     * @param {Object} event A jQuery event.
     * @return Control the cancellation of events triggered.
     * @type Boolean
     */
    onUIEvent: function(event){
    
        
        var eventType = event.type;
        var eventTarget = $(event.target);
        
        
        // walk up tree for a bit. since the user may have clicked on a span, this is necessary to find the a tag.
        for (var i=0; i<4; i++) {
            if (!eventTarget.is('a')){ 
                eventTarget = eventTarget.parent();
            } else {
            	event.target = eventTarget;
                break;
            }
        }
        
        if((eventType==="click") && eventTarget.is("a")){
            if (eventTarget.hasClass(this.DISABLED_CLASS_NAME)) {
                return false;
            }
            this.cancelAutoPause();
            var context = this.getContext();
            var search  = context.get("search");
            var job     = search.job;
            if(eventTarget.hasClass(this.PAUSE_CLASS_NAME)){
                job.pause();
                return false;
            }else if(eventTarget.hasClass(this.UNPAUSE_CLASS_NAME)){
                job.unpause();
                return false;
            }else if(eventTarget.hasClass(this.FINALIZE_CLASS_NAME)){
                job.finalize();
                return false;
            }else if(eventTarget.hasClass(this.CANCEL_CLASS_NAME)){
                if (search.isJobDispatched()) {
                    job.cancel();
                }
                return false;
            }else if(eventTarget.hasClass(this.BACKGROUND_CLASS_NAME)){
                job.save();
                if (job.isPreviewable) job.setPreviewable(false);
                $.each(this.getModulesInTree(), function(idx, module){
                    module.reset();
                });
                var messenger = Splunk.Messenger.System.getInstance();
                var app = job['_eai:acl']['app'] || 'search';
                var view = job['_request']['ui_dispatch_view'] || 'flashtimeline';
                var url = sprintf('/app/%s/%s?sid=%s', app, view, job.getSID());
                messenger.send('info', "splunk.search.job", _('Your search job has been backgrounded. To retrieve it, visit [['+url+'| this page]]. Backgrounded jobs expire after 1 week.'));
                
                return false;
            }else if(eventTarget.hasClass(this.CLOSE_CLASS_NAME)){
                this.setState(this.EMPTY_STATE);
                return false;
            }else if(eventTarget.hasClass(this.DASHBOARD_WIZARD_CLASS_NAME)){
                Splunk.Popup.DashboardWizard(search);
                return false;
            }else if(eventTarget.hasClass(this.ALERT_WIZARD_CLASS_NAME)){
                Splunk.Popup.AlertWizard(search);
                return false;
            }else if(eventTarget.hasClass(this.SAVE_WIZARD_CLASS_NAME)){
                Splunk.Popup.SaveSearchWizard(search);
                return false;
            }
        }
        return true;
    },

    /**
     * Reset the UI to its original state.
     */
    resetUI: function(){
        this.setState(this.EMPTY_STATE);
		this.updateMenu("*");
    },
    
    /**
     * BEGIN: please audit link, label, popup system.
     */
    setupResultsLink: function() {
        var paramDict = this._params[this.RESULTS_LINK_CLASS_NAME];
        // if there's no params, then the mako template will not have rendered
        // the link anyway so were done.
        if (!paramDict) {
            return false;
        }
        
        // we update the actual href attr, so that even unusual click interactions
        // like right-clicking will still have correct behaviour.
        var link = $("." + this.RESULTS_LINK_CLASS_NAME, this.container);
        link.find('.splIconicButtonLabel').text(paramDict["label"]);
        if (paramDict.hasOwnProperty("popup")) {
            // rel="popup" looks weird but it's a best practice for accessibility.
            // we check for it later onclick.
            link.attr("rel", "popup");
        }
    },
    updateResultsLink: function(sid) {
        var context = this.getContext();
        var search  = context.get("search");

        var link = $("." + this.RESULTS_LINK_CLASS_NAME, this.container);
        var paramDict = this._params[this.RESULTS_LINK_CLASS_NAME];
        if (link && paramDict) {
            var viewTarget = paramDict["viewTarget"];
            if (search.job.areResultsTransformed() && paramDict.hasOwnProperty("transformedResultsViewTarget")) {
                viewTarget = paramDict["transformedResultsViewTarget"];
                // we almost dont have to worry about rewriting this because there is now a 'running' status
                // vs a 'runningReport'  status.  However we also need to rewrite the link in the 'complete' status 
                // and 'paused'  status etc so here we just rewrite them all.
                link.find('.splIconicButtonLabel').text(_("Show report"));
            }
            else {
                link.find('.splIconicButtonLabel').text(_("Build report"));
            }
            var path = Splunk.util.make_url("/app/", Splunk.util.getCurrentApp(), viewTarget);
            var url = path + "?" + $.param({"sid": sid});
            link.attr("href", url);
            link.show();
        }
    },
    /**
     * Handle a build report action. Spawn a popup and cancel execution of the anchor element or allow the execution of
     * anchor element to change the address location.
     *
     * @param {Object} event The DOM event triggered.
     * @type Boolean
     */
    onBuildReport: function(event){
        var eventTarget = $(event.target);
        
        var viewTarget = this._params[this.RESULTS_LINK_CLASS_NAME]["viewTarget"];
        var context = this.getContext();
        var search  = context.get("search");
        
        var args = {};
        // mark this job as off limits to the auto-cancellation. 
        // NOTE - we cant let the base_sid be cancelled in this window cause report builder might be using it
        // and we cant let it be cancelled in the report_builder view because THIS view might be using it. 
        // upshot is that these sids will hang around until their TTL kills them. 
        // to fix that we'll eventually have to have these windows talking to eachother and have the last one out 
        // turn out the lights or something....
        search.job.setAsAutoCancellable(false);
        
        args["base_sid"] = search.job.getSearchId();

        // if this search already has transforming commands,  and we're configured to send them to step 2, do so.
        if (search.job.areResultsTransformed() ) {
            if (this._params[this.RESULTS_LINK_CLASS_NAME].hasOwnProperty("transformedResultsViewTarget")) {
                viewTarget = this._params[this.RESULTS_LINK_CLASS_NAME]["transformedResultsViewTarget"];
            }
        } else {
            var placeholderIntention = {"name": "plot", "arg": {"mode": "timechart", "fields" : [["count", "__events"]]}};
            search.abandonJob();
            search.addIntention(placeholderIntention);
        }
        search.sendToView(viewTarget, args, false, false, {autosize: true});
        return false;
    },
    /**
     * END: please audit link, label, popup system.
     */
     
     
    //
    // auto-pause handling
    //
    

    /**
     * Main method to initiate auto-pause sequence
     */
    startAutoPause: function() {
        this._autoPauseInterval = this.getParam('autoPauseInterval') * 1000;
        $(".autoPauseStatus", this.container).show();
        
        if (this._autoPauseInterval < 1) {
            this.logger.warn(sprintf('invalid autoPauseInterval interval (%s); skipping auto-pause', this._autoPauseInterval));
            return;
        }
        this._autoPauseTimer = setTimeout(this.updateAutoPauseTimer.bind(this), 100);
        this._autoPauseStartTime = new Date();
        $('.autoPauseToggle', this.container).click(function() {
            this.cancelAutoPause();
            return false;
        }.bind(this));
        
    },
    

    /**
     * Stops auto-pause
     */
    cancelAutoPause: function() {
        clearTimeout(this._autoPauseTimer);
        this._autoPauseTimer = null;
        $('.autoPauseText', this.container).html('');
        $(".autoPauseStatus", this.container).hide();
    },
    

    /**
     * Periodic method called to refresh on-screen auto-pause status info
     */
    updateAutoPauseTimer: function() {
        var elapsedTime = parseInt((new Date()) - this._autoPauseStartTime, 10);
        var timeRemaining = Math.round((this._autoPauseInterval - elapsedTime) / 1000);
        if (timeRemaining < 1) {
            this.cancelAutoPause();
            this.openAutoPauseDialog();
            return;
        }
        
        $('.autoPauseText', this.container).html(sprintf(ungettext(
            'Auto-pausing in <strong>%s</strong> second.', 
            'Auto-pausing in <strong>%s</strong> seconds.', 
            timeRemaining), 
        timeRemaining));
        
        this._autoPauseTimer = setTimeout(this.updateAutoPauseTimer.bind(this), 500);
        
    },
    

    /**
     * Opens the interstitial auto-pause dialog and provides the user
     * with job control options
     */
    openAutoPauseDialog: function() {
        
        var context = this.getContext();
        var search = context.get("search");
        
        if (search.job.isDone()) {
            return;
        }
        
        // first pause the job automatically
        search.job.pause();
        
        // grab the contents to populate the popup
        var popupContents = $('.autoPause', this.container)[0];
        var popupInstance = new Splunk.Popup(popupContents, {
            title: _('Auto-pause'),
            buttons: [
                {
                    label: _('Resume search'),
                    type: 'secondary',
                    callback: function(evt) {
                        var context = this.getContext();
                        var search = context.get("search");
                        search.job.unpause();
                        return true;
                    }.bind(this)
                },
                {
                    label: _('Finalize search'),
                    type: 'primary',
                    callback: function(evt) {
                        var context = this.getContext();
                        var search = context.get("search");
                        search.job.finalize();
                        return true;
                    }.bind(this)
                }
            ]
        });
        
        $('.splButton-primary', popupInstance.getPopup()).focus();

    },
    schedulePDF: function() {
        if (Splunk.util.getCurrentViewConfig()['view']['hasAutoRun']) {
            return Splunk.Popup.SchedulePDF($('.pdfPopup'), function(error) {
                this.messenger.send('error', this.moduleType, error);
            }.bind(this));
        } else {
            return function() {};
        }
    }
});
