//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.TitleBar = $.klass(Splunk.Module.DispatchingModule, {

    SAVED_SEARCH_FORM_CONTAINER_CLASS: '.savedSearchForm',
    SAVED_SEARCH_FORM_TITLE: _('Save Search'),

    SHARE_LINK_FORM_CONTAINER_CLASS: '.shareLinkForm',
    SHARE_LINK_FORM_TITLE: _('Get Link to Results'),

    EVENTTYPE_FORM_CONTAINER_CLASS: '.eventtypeForm',
    EVENTTYPE_FORM_TITLE: _('Save As Event Type'),

    REPORTBUILDER_LINK_CLASS: "resultsLink",
    DISABLED_CLASS: "disabled",

    // don't let this thing dispatch, we're only a DispatchingModule
    // to get the onJobDone method
    requiresDispatch: function(search) {return false;},


    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("Splunk.Module.TitleBar");
        this.messenger = Splunk.Messenger.System.getInstance();
        this.canScheduleSearch = Splunk.ViewConfig.app.can_alert;
        this.lastEnabled = null;
        // an extra property "enabled" is used here for the menu items.
        // this tells the getEnabledActionsMenuData function to enable/disable the action menu items.
        // The enabled values can be a single string denoting "*" or one of "progress" and or "done", see getEnabledActionsMenuData method for further details.
        
        $('.editPanel button.move', this.container).bind('click', function(){ 
            Splunk.Globals.Viewmaster.openPanelFormHelper(Splunk.util.getCurrentView(), 'move');
        });
 
        $('.editPanel button.add', this.container).bind('click', function(){ 
            Splunk.Globals.Viewmaster.openPanelFormHelper(Splunk.util.getCurrentView(), 'add');
        });
       
        this.actionsMenuItemsDict = [];

        this.actionsMenuItemsDict.push({
            "label" : _("Save search..."),
            callback: function(){
                var search = this.getContext().get("search");
                Splunk.Popup.SaveSearchWizard(search);
            }.bind(this),
            "showInFilter" : ['search'],
            "enabled" : ["progress", "done"]
        });

        // Explicit removal of "Build report" for search/charting
        if ( Splunk.util.getCurrentView()!="charting" ) {
            this.actionsMenuItemsDict.push({
                "label" : _("Build report..."),
                "enabledWhen" : "progress",
                callback: function(event) {
                    this.buildReportLink();
                }.bind(this),
                "showInFilter" : ['search'],
                "enabled" : ["progress", "done"]
            });
        }
        
        this.actionsMenuItemsDict.push({
            "label" : _("Add to dashboard..."),
            callback: function(){
                var search = this.getContext().get("search");
                Splunk.Popup.DashboardWizard(search);
            }.bind(this),
            "showInFilter" : ['search'],
            "enabled" : ["progress", "done"]
        });
            
        if (this.canScheduleSearch) {
          this.actionsMenuItemsDict.push({
              "label" : _("Create alert..."),
              callback: function(){
                  var search = this.getContext().get("search");
                  Splunk.Popup.AlertWizard(search);
              }.bind(this),
              "showInFilter" : ['search'],
              "enabled" : ["progress", "done"]
          });
        }
       
        if (this.canScheduleSearch) {
            this.actionsMenuItemsDict.push({
                "label" : _("Schedule search..."),
                callback: function(){
                    var search = this.getContext().get("search");
                    Splunk.Popup.ScheduleDigestWizard(search);
                }.bind(this),
                "showInFilter" : ['search'],
                "enabled" : ["progress", "done"]
            });
	    }

        this.actionsMenuItemsDict.push({
            "divider": "actionsMenuDivider",
            "showInFilter" : ['search'],
            "enabled" : "*"
        });
        
        this.actionsMenuItemsDict.push({
            "label" : _("Save as event type..."),
            "alwaysEnabled" : true,
            callback: this.onEventtypeForm.bind(this),
            "showInFilter" : ['search'],
            "enabled" : "*"
        });
        
        this.actionsMenuItemsDict.push({
            "divider": "actionsMenuDivider",
            "showInFilter" : ['search'],
            "enabled" : "*"
        });
        
        this.actionsMenuItemsDict.push({
            "label" : _("Inspect search job..."),
            "alwaysEnabled" : true,
            callback: function(event) {
                var context = this.getContext();
                var search  = context.get("search");
                Splunk.window.openJobInspector(search.job.getSearchId());
                return false;
            }.bind(this),
            "showInFilter" : ['search'],
            "enabled" : "*"
        });
        
        this.actionsMenuItemsDict.push({
            "divider": "actionsMenuDivider",
            "showInFilter" : ['search'],
            "enabled" : "*"
        });
        
        this.actionsMenuItemsDict.push({
            "label": _("Save results"),
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
            "showInFilter" : ['search'],
            "enabled" : ["progress", "done"]
        });
        
        this.actionsMenuItemsDict.push({
            // formerly Link to search
            "label" : _("Get link to results..."),
            callback: function(event) {
                var formContainer = $(this.SHARE_LINK_FORM_CONTAINER_CLASS, this.container)[0];
                var title = this.SHARE_LINK_FORM_TITLE;
                var search = this.getContext().get("search");
                Splunk.Popup.createShareLinkForm(formContainer, title, search);
            }.bind(this),
            "showInFilter" : ['search'],
            "enabled" : ["progress", "done"]
        });
        
        this.actionsMenuItemsDict.push({
            "label" : _("Export results..."),
            callback: function(event) {
                var formContainer = $('.exportPopupContainer', this.container)[0];
                var context = this.getContext();
                var search  = context.get("search");
                Splunk.Popup.createExportResultsForm(formContainer, search.job);
            }.bind(this),
            "showInFilter" : ['search'],
            "enabled" : ["done"]
        });
        
        this.actionsMenuItemsDict.push({
            "label" : _("Print..."),
            callback: function(event) {
                $(document).trigger("PrintPage");
                return false;
            }.bind(this),
            "showInFilter" : ['search', 'dashboard', 'dashboard-SimpleDashboard'],
            "enabled" : "*"
        });

        this.messenger = Splunk.Messenger.System.getInstance();
        this._showActionsMenu = Splunk.util.normalizeBoolean(this._params["showActionsMenu"]);
        
        // determine the menu filter set; dashboards need a runtime check on
        // the kind of view definition; defaults to 'search' filterset
        this._filter = Splunk.util.normalizeBoolean(this.getParam("actionsMenuFilter")) || 'search';
        if (this._filter == 'dashboard') {
            var viewObjectMode = Splunk.util.getCurrentViewConfig()['view']['objectMode'];
            if (viewObjectMode == 'SimpleDashboard') {
                this._filter = 'dashboard-SimpleDashboard';
            }
        }
        
        if ( this._showActionsMenu ) {
            this.PERMALINK_SEARCH_CLASS = "permalinkSearch";
            this.PERMALINK_SID_CLASS    = "permalinkSID";
            this.REPORTBUILDER_CLASS    = "reportBuilderLink";
            
            // build the actions menu
            this.actionsMenu = new Splunk.MenuBuilder({
                containerDiv: this.container,
                menuDict: this.getEnabledActionsMenuData(this.actionsMenuItemsDict, "*"),
                activator: $('.actionsMenu', this.container),
                menuClasses: 'splMenu-primary',
                filter: this._filter
            });

            this._initEventListeners();
        }
    },

    _initEventListeners: function() {
        // PERMALINK PART 1
        $(document).bind('jobDispatched', this.updatePermalinks.bind(this));
    },
    applyContext: function($super, context) {
        var retVal = $super(context);
        if (!this.isPageLoadComplete()) {
            // PERMALINK PART 2
            this.updatePermalinks();
        }
        return retVal;
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
    updateActionsMenu: function(enabled) {
        if (this.lastEnabled && this.lastEnabled==enabled || !this._showActionsMenu) {
            return;
        }
        this.lastEnabled = enabled;
        var menuData = this.getEnabledActionsMenuData(this.actionsMenuItemsDict, enabled);
        this.actionsMenu.updateMenu(menuData);
    },
    
    /**
     * Modify a menu data structure based on enabled attribute value of a String or an Array of enabled states.
     * 
     * NOTE: The "*" string is treated as a wild card.
     * 
     * @param {Array} menuData An Array of menu item objects.
     * @param {String} enabled The enabled attribute value to match on otherwise the menu item is disabled. Can be one of "progress", "done"  or "*".
     * 
     * @type Array
     * @return An Array of menu item objects disabled/enabled based on enabled matching.
     */
    getEnabledActionsMenuData: function(menuData, enabled) {
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

    buildReportLink: function() {
        /*
            This callback clones out the href in the Jobstatus module's link for the report builder
            If the search has not yet been completed/finalized, it will display an alert box to the user
            If there is no Report Builder link anywhere in the DOM (perhaps the JobStatus module does
            not exist in this view, for example), nothing happens at all.
        */
        var context = this.getContext();
        var search  = context.get("search");
        var builderLink = $(".JobStatus a." + this.REPORTBUILDER_LINK_CLASS);
        if (builderLink.length < 1) {
            this.logger.error(this.moduleType, " user clicked 'build report', but we could not find the 'Build report' link in this view.");
            return false;
        }
        if (search.isJobDispatched()) {
            builderLink.click();
            return false;
        } else {
            alert(_("Please run a search first."));
        }
    },

    updatePermalinks: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        
        var args = {};
        args["q"] = Splunk.util.addLeadingSearchCommand(search.toString());
        var range = search.getTimeRange();
        if (range) {
            if (range.getEarliestTimeTerms()) {
                args["earliest"] = range.getEarliestTimeTerms();
            }
            if (range.getLatestTimeTerms()) {
                args["latest"] = range.getLatestTimeTerms();
            }
        }
        $("li." + this.PERMALINK_SEARCH_CLASS + " a", this.container).attr("href", "?" + Splunk.util.propToQueryString(args));
        $("li." + this.PERMALINK_SID_CLASS + " a",    this.container).attr("href", "?sid=" + encodeURIComponent(search.job.getSearchId()));
    },

    // Export dialog functions
    exportPopupAccept: function() {
        this.exportForm = $(this.exportPopupHandle).find(".exForm");
        return this.exportForm.submit();
    },

    exportPopupCancel: function() {
            return true;
    },

    onJobStatusChange: function(event, status) {
        // reset the menu on a starting a new job (ie, cancelling the previous one)
        switch(status) {
            case 'cancel':
                this.updateActionsMenu("*");
                break;
            default: 
                break;
        }
    },

    resetUI: function() {
        this.updateActionsMenu("*");
    },

    onJobDone: function() {
        // put in the usable menu on job completion
        this.updateActionsMenu("done");
    },
    
    onJobProgress: function() {
        this.updateActionsMenu("progress");
    },

    //Set the saved search name if it exists
    onContextChange: function(){
        var context = this.getContext();
        var search  = context.get("search");
        var savedSearchName = "";
        if (search.getSavedSearchName()){
            savedSearchName = ": " + search.getSavedSearchName();
        }
        $("em", this.container).text(savedSearchName);
    },

    // Saved search form popup
    onSavedSearchForm: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        var formContainer = $(this.SAVED_SEARCH_FORM_CONTAINER_CLASS, this.container)[0];
        var title = this.SAVED_SEARCH_FORM_TITLE;
        Splunk.Popup.createSavedSearchForm(formContainer, title, search);
    },

    onEventtypeForm: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        var formContainer = $(this.EVENTTYPE_FORM_CONTAINER_CLASS, this.container)[0];
        Splunk.Popup.createEventtypeForm(formContainer, this.EVENTTYPE_FORM_TITLE, search);
    }

});
