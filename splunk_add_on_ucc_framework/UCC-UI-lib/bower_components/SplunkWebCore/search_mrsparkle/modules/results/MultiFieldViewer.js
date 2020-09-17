
Splunk.Module.MultiFieldViewer = $.klass(Splunk.Module.AbstractPagedModule, {
     MOUSEOVER_HIGHLIGHT_CLASS : "mouseoverHighlight",
     SELECTED_HIGHLIGHT_CLASS: "selected",
    /*
     * overriding initialize to set up references and event handlers.
     */
     initialize: function($super, container) {
        $super(container);
        this.childEnforcement  = Splunk.Module.NEVER_ALLOW;

        this._requestInProgress = false;

        this.logger = Splunk.Logger.getLogger("MultiFieldViewer.js");
        this.messenger = Splunk.Messenger.System.getInstance();
        this._fieldLayerContainer = $(".fieldLayers",this.container);
        this._fieldTabsContainer =  $(".fieldTabs", this.container);
        this._fieldHeaderText = _("%s selected fields");

        // 1 Initialize FieldSummaryLayer 
        var popupLayerTemplate = $('.popupContainer', this.container);
        var reportLinkTarget = (this._params["link"]) ? this._params["link"]["view"] : false;
        this.fieldSummaryLayer = new Splunk.Popup.FieldSummaryLayer(
            popupLayerTemplate,
            this._fieldLayerContainer,
            reportLinkTarget
        );

        // close the layers on all other clicks.
        $(document).click(this._onDocumentClick.bind(this));
    },

     /* function to handle closing of the menu */
     _onDocumentClick: function(evt) {
     	 // ignore if the event target is a fieldTab div or one of it's containing elements.
         var target = $(evt.target);
         if (!target.is(".fieldTabs > div, .fieldTabs > div *") && target.closest('.fieldValuePopupInner').length < 1) {
     	 	this.hideAll();
         }
     },

    onContextChange: function() {
        var context = this.getContext();
        //TODO - another case where we need 'hasChanged(name)'
        if (context.has("results.fields")) {
            this.getResults();
        }
    },

    onBeforeJobDispatched: function(search) {
        // needs at least one status bucket in it's dispatched searches.
        search.setMinimumStatusBuckets(1);
        // we use the method on AbstractPagedModule to get correct value from either runtime context or load param.
        var fields = this.getNormalizedFields();
        if (fields.length > 0) {
            search.setRequiredFields(fields);
        }
    },

    onJobProgress: function(event) {
        this.getResults();
    },

    /***********************************
     * Methods for getting the data for the sidebar links
    ************************************/

    /*
     * URL for the overall request that generates the sidebar links.
     */
    getResultURL: function(params) {
        var search = this.getContext().get("search");
        return search.getUrl('summary', params);
    },

    /*
     * URL for the overall request that generates the sidebar links.
     */
    getResultParams: function() {
        var params = {};
        params["min_freq"] = 0;
        var fields = this.getNormalizedFields();
        if (fields.length > 0) {
            params["field_list"] = fields;
        }
        return params;
    },

    /**
     * suppress the parser error thrown when no results are returned
     */
    getResultsErrorHandler: function($super, xhr, textStatus, exception) {
        if (textStatus == 'parsererror') {
            return;
        }
        return $super(xhr, textStatus, exception);
    },

    updateHeader: function(fieldCount) {
        var fieldHeader = $(".inlineFieldHeader", this.container);
        fieldHeader.html('');
        $("<h4>").text(sprintf(this._fieldHeaderText, fieldCount))
            .appendTo(fieldHeader);
    },

    /*
     * rendering callback for the request that generates the sidebar links.
     * NOTE: there is a different request that is made on demand
     * to generate the field layers themselves.
     */
    renderResults: function(xmlDoc) {
        this._fieldTabsContainer.html('');
        var moduleInstance = this;

        var summaryNode = $(xmlDoc).find("summary");
        var eventCount = summaryNode.attr("c");
        var fieldNodes = $(xmlDoc).find("field");

        var matchingFields = this.getMatchingFields(fieldNodes);
        this.updateHeader(matchingFields.length);
        $.each(matchingFields, function(index) {
            var fieldElt = $(this);
            var fieldName       = Splunk.util.escapeBackslash(fieldElt.attr("k"));
            var count           = fieldElt.attr("c");
            var distinctCount   = fieldElt.attr("dc");
            var isExact         = Splunk.util.normalizeBoolean(fieldElt.attr("exact"));

            // treat as numeric if HALF or more of the occurences are considered numeric
            var isNumeric = (fieldElt.attr("nc") > count/2);
            var tabAnchor = moduleInstance.addTab(fieldName, count, distinctCount, eventCount, isExact, isNumeric);

            // if we have an open fieldLayer, we kick off the open here,
            // using the fresh distinctCount.

            if (moduleInstance._openTabFieldName == fieldName) {
                if (moduleInstance._requestInProgress) {
                    moduleInstance.logger.warn(moduleInstance.moduleType + " got a progress event with an open summaries layer, but we're still waiting for a previous request. TODO - This can lead to stale data being displayed.");
                } else {
                    moduleInstance.fieldSummaryLayer.refresh(
                        moduleInstance.onFieldSummaryLayerRender.bind(moduleInstance),
                        moduleInstance.onFieldValueClick.bind(moduleInstance),
                        moduleInstance.getContext().get("results.count")
                    );
                }
            }
        });


        // out with the old
        $(".allFieldsLink", this.container).remove();
        var fieldPicker = $(".FieldPicker");
        var search = this.getContext().get("search");
        var fieldPickerCount = search.job.getEventFieldCount();
        if (fieldPicker && fieldPickerCount) {
            // in with the new.
            var allFieldsLink = $("<a>")
                .addClass("allFieldsLink")
                .attr("href", "#")
                .click(function(evt) {
                    $("a.fpActivate", fieldPicker).click();
                    return false;
                })
                .text(_("Edit"));
            this.container.prepend(allFieldsLink);
        }



    },

    /**
     * Pulled out as a seperate method simply so that SuggestedFieldViewer can override it.
     */
    getMatchingFields: function(fieldNodes) {
        return fieldNodes;
    },

    /**
     * adds a new tab element with the given fieldName and distinctCount
     */
    addTab : function(fieldName, count, distinctCount, eventCount, isExact, isNumeric) {

        var moduleInstance = this;

        var tabContainer = $("<div/>")
            .click(function(evt) {
                moduleInstance.openLayer($(this), fieldName, count, distinctCount, eventCount, isExact, isNumeric);
                evt.preventDefault();
            })
            .append('<span class="splIcon splIcon-triangle-4-e"></span>');

        var tabText = _("%(numericIndicator)s  <span class='fieldName'>%(fieldName)s</span> <span class='valueCount'>(%(optionalGreaterThanSymbol)s%(count)s)</span>");
        var tabTextParams = {
            fieldName: Splunk.util.escapeHtml(Splunk.util.smartTrim(fieldName, this.getParam('maxDisplayLength'))),
            numericIndicator: (isNumeric) ? _("<span class='iconNumeric'>#</span>") : "<span class='iconString'>a</span>",
            optionalGreaterThanSymbol: isExact ? '' : '≥',
            count: distinctCount
        };
        var anchor = $("<a href='#'></a>")
            .html(sprintf(tabText, tabTextParams))
            .attr('title', fieldName);

        if (this._openTabFieldName == fieldName) {
            tabContainer.addClass(this.SELECTED_HIGHLIGHT_CLASS);
        }
        anchor.appendTo(tabContainer);

        tabContainer
            .mouseover(function(event) {
                $(this).addClass(moduleInstance.MOUSEOVER_HIGHLIGHT_CLASS);
            })
            .mouseout(function(event) {
                $(this).removeClass(moduleInstance.MOUSEOVER_HIGHLIGHT_CLASS);
            });
        this._fieldTabsContainer.append(tabContainer);
        return anchor;
    },

    /***********************************
     * Methods for dealing with selected/open state.
    ************************************/

    resetUI: function() {
        if (this.fieldSummaryLayer) this.fieldSummaryLayer.close();
        this._fieldTabsContainer.html('');
        $(".inlineFieldHeader", this.container).html('');
        $(".allFieldsLink", this.container).remove();
    },

    hideAll: function() {
        this._setSelectedTab();
        if (this.fieldSummaryLayer) this.fieldSummaryLayer.close();
    },

    /**
     * highlights the given tab, and unhighlights any others.
     */
    _setSelectedTab: function(tab, fieldName) {
        // also keep track of it because we re-render everything onJobProgress
        // so we need to preserve selection then.
        this._openTabFieldName = fieldName;
        // use the selected highlight classname itself as the selector, to remove it from the existing tab
        var previouslySelectedTab = $("." + this.SELECTED_HIGHLIGHT_CLASS,this.container);
        previouslySelectedTab.removeClass(this.SELECTED_HIGHLIGHT_CLASS);
        if (tab) tab.addClass(this.SELECTED_HIGHLIGHT_CLASS);
    },

    /***********************************
     * Methods to handle the individual layers showing the value for the given field.
    ************************************/

    /**
     * Opens the layer for the given tab. fieldViewerInstance is the
     * SimpleFieldViewer instance that implements the interior of the layer for us.
     */
    openLayer: function(tab, fieldName, count, distinctCount, eventCount, isExact, isNumeric) {
        this._requestInProgress = true;
        this._setSelectedTab(tab, fieldName);

        var onCancelled = function() {
            this._setSelectedTab();
            this._openTabFieldName = false;
        }.bind(this);

        var customLinks = this.getCustomLinks(fieldName, count, distinctCount, eventCount, isExact, isNumeric);
        //if (this.fieldSummaryLayer) this.fieldSummaryLayer.close();

        // (step 1 was initializing it)
        // 2. setField, and build the links in preparation for opening.
        this.fieldSummaryLayer.setField(
            this.getContext().get("search"),
            fieldName,
            count,
            distinctCount,
            eventCount,
            isNumeric,
            customLinks,
	    this
        );
        // 2 Open it.
        this.fieldSummaryLayer.open(tab,onCancelled);

        // 3 Refresh the data, which we will call onJobProgress while it's open
        this.fieldSummaryLayer.refresh(
            this.onFieldSummaryLayerRender.bind(this),
            this.onFieldValueClick.bind(this),
            this.getContext().get("results.count")
        );
    },

    getCustomLinks: function(fieldName, count, distinctCount, eventCount, isExact, isNumeric) {
        var customLinks = [];
        var frequencyText = _("Appears in %(percent)s%% of results");
        var frequencyPercentage = Math.round(count / eventCount * 100);
        var frequencyArgs = {fieldName: Splunk.util.escapeHtml(fieldName), percent: frequencyPercentage};

        customLinks.push($("<h4>" +  sprintf(frequencyText,frequencyArgs) + "</h4>"));

        customLinks.push($('<a href="#"></a>')
            .text(_("Show only events with this field"))
            .click(this.narrowToSelected.bind(this)));
        return customLinks;
    },

    narrowToSelected: function() {
        var fieldName = this.fieldSummaryLayer.fieldName;

        // TODO - intention classes or utils are needed.
        var intentionArg = {};
        intentionArg[fieldName] = "*";
        var intention = {name: "addterm", arg: intentionArg};

        var search  = new Splunk.Search();
        search.addIntention(intention);

        var context = new Splunk.Context();
        context.set("search", search);

        this.passContextToParent(context);
        return false;
    },

    onFieldSummaryLayerRender: function() {
        this._requestInProgress = false;
    },

    onFieldValueClick: function(evt, fieldName, fieldValue) {

        // TODO - intention classes or utils are needed.
        var intention = {};
        intention["name"] = (evt.altKey)? "negateterm" : "addterm";
        intention["arg"] = {};
        intention["arg"][fieldName]  = fieldValue;

        var search  = new Splunk.Search();
        search.addIntention(intention);

        var context = new Splunk.Context();
        context.set("search", search);

        this.passContextToParent(context);
    }
});
