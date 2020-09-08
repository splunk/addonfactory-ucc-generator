Splunk.Module.ResultsActionButtons = $.klass(Splunk.Module, {

    SAVED_SEARCH_FORM_CONTAINER_CLASS: '.savedSearchForm',
    SAVED_SEARCH_FORM_TITLE: _('Save Report'),

    SHARE_LINK_FORM_CONTAINER_CLASS: '.shareLinkForm',
    SHARE_LINK_FORM_TITLE: _('Get Link to Results'),


    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("ResultsActionButtons.js");
        this.messenger = Splunk.Messenger.System.getInstance();
		var that = this;

		// we check for availability of the pdfgen endpoint on module initialization so that:
		//  we don't have to check when the user presses the render PDF button
        Splunk.pdf.is_pdf_available();

        $(".printButton", this.container).click(this.onPrintButtonClick.bind(this));
        $(".linkButton", this.container).click(this.onLinkButtonClick.bind(this));
        $(".editButton", this.container).click(this.onEditButtonClick.bind(this));

        $('.previousRunsLink', this.container).click(this.onPreviousRunsLinkClick.bind(this));
        $('.splViewEventsLink', this.container).click(this.onViewEventsLinkClick.bind(this));
        
        $('.renderpdf', this.container).click(this.onRenderPDFClick.bind(this));
    },
    
    checkAppropriateMode: function(context) {
        if (this._params.hasOwnProperty("eventsView")) {
            $('.splViewEvents', this.container).show();
        } else {
            $('.splViewEvents', this.container).hide();
        }
		if (this._params.hasOwnProperty("renderPDF")) {
            Splunk.pdf.is_pdf_available(function(pdfService) {
                if (pdfService === "pdfgen") {
                    $('.renderpdf', this.container).show();
                }
            });
        } else {
            $('.renderpdf', this.container).hide();
		}

        var search  = context.get("search");

        if (search.getSavedSearchName() && search.canWrite() && this._params.hasOwnProperty("editView")) {
            $(".editButton", this.container).show();
        }
        else {
            $(".editButton", this.container).hide();
            $(".editButton").next(".splPipe").hide();
        }
        if (search.getSavedSearchName()) {
            $(".previousRunsLink", this.container).show();
        }
        else {
            $(".previousRunsLink", this.container).hide();
        }
        // the 3 cases specified in the design are so confusing that I had to 
        // pull it out into it's own method.
        this.setupSaveMenu(search.getSavedSearchName());
    },

    setupSaveMenu: function(savedSearchName) {
        //if called with the optional arg, (which means we expose the option to overwrite the saved search)
        // then the spec is here
        //http://twiki.splunk.com/twiki/bin/view/Main/ViewEditSavedReport#UI_Text_Edit_Saved_Report
        // 1. Save settings for <report name>...  
        // 2. Save report as...
        // 3. Save just this version of the report
        //
        // otherwise,  we go with the other strings in http://twiki.splunk.com:9000/twiki/bin/view/Main/Reporting#UI_Text_Report_Builder_Format_Re
        // 1. Save these report settings (to run again) 
        // 2. Save just this version of the report
            
        
        // in this one combination,  we just turn the save button into a single grey button that 
        // just says 'Save results',  and that's all it does. No menu at all. 
        if (savedSearchName && this._params.hasOwnProperty("editView")) {
            // and then 'save' is not the primary action.
            
            $(".saveButton", this.container)
                .click(this.onSaveResultsClick.bind(this))
                .text(_("Save results"));
            return true;
        }
        // ok. Wherever we are, it's a full-on 'edit' view now.  Now all that's left is two cases.  
        // Either we have a saved search that we're editing, or we dont.
        var menuDict = [];
        if (savedSearchName) {
            menuDict.push({
                "label" : _("Save report"),
                callback: function(event) {this.onOverwriteReportClick(event, savedSearchName);}.bind(this)
            });
            menuDict.push({
                "label" : _("Save report as..."),
                callback: function(event) {
                    var context = this.getContext();
                    var search = context.get("search");
                    Splunk.Popup.SaveSearchWizard(search, {title: _("Save Report")});
                }.bind(this)
            });
        } else {
            menuDict.push({
                "label" : _("Save report..."),
                callback: function(event) {
                    var context = this.getContext();
                    var search = context.get("search");
                    Splunk.Popup.SaveSearchWizard(search, {title: _("Save Report")});
                }.bind(this)
            });
            menuDict.push({
                "label" : _("Save report and add to dashboard"),
                callback: function(event) {
                    var context = this.getContext();
                    var search = context.get("search");
                    Splunk.Popup.DashboardWizard(search);
                }.bind(this)
            });
        }
        // this last element gets pushed in both cases so it's out here. 
        menuDict.push({
            "label" : _("Save results only"),
            callback: this.onSaveResultsClick.bind(this)
        });
        
        var saveMenu = new Splunk.MenuBuilder({
            containerDiv: document.body,
            menuDict: menuDict,
            activator: $('.saveButton', this.container),
            menuClasses: 'splMenu-primary resultsActionsMenu'
        });
        
    },

    onContextChange: function() {
        this.checkAppropriateMode(this.getContext());
    },

    applyContext: function(context) {

        this.checkAppropriateMode(context);
    },

    onPrintButtonClick: function(event) {
        $(document).trigger("PrintPage");
    },

    onLinkButtonClick: function(event) {
        var formContainer = $(this.SHARE_LINK_FORM_CONTAINER_CLASS, this.container)[0];
        var title = this.SHARE_LINK_FORM_TITLE;
        var context = this.getContext();
        var search  = context.get("search");
        Splunk.Popup.createShareLinkForm(formContainer, title, search);
        return false;
    },
    onEditButtonClick: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        
        var baseURL = [Splunk.util.make_url("app", Splunk.util.getCurrentApp(), this._params["editView"])];
        var args = {};

        //args["sid"] = search.job.getSearchId();
        args["s"]    = search.getSavedSearchName();
        // TODO -- might need to dispatch a slow status_buckets=1 requiredFieldList=["*"] search for baseSID, or else they wont be 
        // able to go back to step 1 and go into the 'form' mode.
        //var baseSID = search.job.getSearchId();
    
        try {
            window.location.href = baseURL + "?" + Splunk.util.propToQueryString(args);
        } catch(e) {
            this.logger.error(e);
            this.logger.error("failed to open the initial window");
        }

    },
    onSaveReportClick: function(event) {
        var formContainer = $(this.SAVED_SEARCH_FORM_CONTAINER_CLASS, this.container)[0];
        var title = this.SAVED_SEARCH_FORM_TITLE;
        var context = this.getContext();
        var search  = context.get("search");
        Splunk.Popup.createSavedSearchForm(formContainer, title, search);
    },
    
    onOverwriteReportClick: function(event, savedSearchName) {

        this.logger.debug('onOverwriteReportClick - START savedSearchName=' + savedSearchName);
        
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

    onSaveResultsClick: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        var onSuccess = function() {
            this.messenger.send('info', 'splunk.search', _("Your search results have been saved."));
        }.bind(this);
        var onFailure = function(e) {
            this.messenger.send('error', 'splunk.search', _("Splunk encountered an error and is unable to save your results. ") + e);
        }.bind(this);
        search.job.save(onSuccess, onFailure);
    },

    onPreviousRunsLinkClick: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        var args = {savedSearch: search.getSavedSearchName()};
        Splunk.window.openJobManager(args);
    },

    onViewEventsLinkClick: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        if (search) {
            var eventSearch = search.job.getEventSearch();
            var eventsView = this._params["eventsView"];
        
            if (eventSearch && eventsView) {
                search.abandonJob();
                search.setBaseSearch(eventSearch);    
                search.sendToView(eventsView);
                return false;
            } 
        }
        this.messenger.send('error', 'splunk.search', _("Splunk encountered an error and we are unable to load the events for this search."));
        return false;
    },
    
    onRenderPDFClick: function(event) {
        var that = this;
        Splunk.pdf.is_pdf_available(
            function(pdfService) { 
                var url;
                if (pdfService === "pdfgen") {
                    var context = that.getContext();
                    var search  = context.get("search");
                    var savedSearchName = search.getSavedSearchName();
                    var sid = search.job.getSID();
                    
                    url = Splunk.pdf.get_render_url_for_saved_search(savedSearchName, Splunk.ViewConfig.app.id, sid);
                    viewName = Splunk.ViewConfig.view.label || ""; 
                }
    
                if (typeof url !== "undefined")
                {    
                    window.open(url, "PDF");
                } else {
                    Splunk.Popup.DisplayPDFUnavailable($('.pdfPopup'));
                }
            },
            function() {
                Splunk.Popup.DisplayPDFUnavailable($('.pdfPopup'));
            }
        );
    }
});
