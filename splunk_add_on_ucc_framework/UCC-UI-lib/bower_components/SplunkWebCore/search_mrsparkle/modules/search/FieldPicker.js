/**
 * See onUIEvent method for the primary event lifecycle/dispatching.
 * NOTE: FieldSummaryLayer and Popup Objects have their own proprietary dispatching models.
 * 
 * Do you believe in magic? None here.
 */
Splunk.Module.FieldPicker = $.klass(Splunk.Module.HiddenFieldPicker, {
    INLINE_HEADER_CLASS_NAME: "inlineHeader",
    INLINE_HEADER_COUNT_CLASS_NAME: "totalFieldsCount",
    POPUP_ADD_ALL_CLASS_NAME: "fpAddAllLink",
    POPUP_ADD_UNIT_CLASS_NAME: "fpAddFieldBehavior",
    POPUP_ADD_UNIT_CLOSEST_SELECTOR: "tr",
    POPUP_AVAILABLE_FIELDS_SELECTOR: ".fpFieldListContainerOuter .fpFieldListContainerInner",
    POPUP_REMOVE_ALL_CLASS_NAME: "fpClearSelectedFields",
    POPUP_CLASS_NAME: "FieldPickerPopup",
    POPUP_CONTENT_CLASS_NAME: "popupContent",
    POPUP_FILTER_KEYWORD_CLASS_NAME: "fpKeywordFilterField",
    POPUP_FILTER_KEYWORD_CLEAR_CLASS_NAME: "fpKeywordFilterClear",
    POPUP_FILTER_KEYWORD_DEFAULT_VALUE: "",
    POPUP_FILTER_PERCENT_CLASS_NAME: "fpFrequencyFilterField",
    POPUP_FILTER_PERCENT_CLEAR_CLASS_NAME: "fpFrequencyFilterClear",
    POPUP_FILTER_PERCENT_DEFAULT_VALUE: "1",
    POPUP_NON_SELECTED_FIELDS_SELECTOR: ".fpFieldList tbody tr:not(.fieldSelected)",
    POPUP_SELECTED_FIELD_CLASS_NAME: "fieldSelected",
    POPUP_REMOVE_UNIT_CLASS_NAME: "fpRemoveFieldBehavior",
    POPUP_REMOVE_UNIT_CLOSEST_SELECTOR: "li",
    POPUP_SELECTED_FIELD_CONTAINER_CLASS_NAME: "fpSelectedFields",
    POPUP_SELECTED_FIELD_SELECTOR: ".fpSelectedFields li",
    POPUP_SELECTED_FIELD_NAME_ATTR: "s:fieldname",
    POPUP_SELECTED_FIELD_HTML_TEMPLATE: '<li><span class="splIcon splIcon-arrow-w fpRemoveFieldBehavior"/>%(fieldName)s</li>',
    POPUP_SORT_KEY_ATTR: "s:sortkey",
    POPUP_SORT_DIR_ATTR: "s:sortdir",
    POPUP_SUMMARY_CLASS_NAME: "fpFieldSummary",
    POPUP_UPDATE_FIELDS_CONTAINER_CLASS_NAME: "fpUpdateFields",
    POPUP_UPDATE_FIELDS_UPDATE_CLASS_NAME: "fpUpdateFieldsUpdate",
    SIDEBAR_CONTROL_SELECTOR: ".sidebarControl a",
    SIDEBAR_CONTROL_OPEN_CLASS_NAME: "splIcon-sidebar-open",
    SIDEBAR_CONTROL_CLOSED_CLASS_NAME: "splIcon-sidebar-closed",
    LAUNCH_POPUP_CLASS_NAME: "fpActivate",
    UI_EVENT_TYPES: ["click", "keyup"],
    SIDEBAR_SELECTOR: "div.withSidebar",
    /**
     * Class constructor.
     * 
     * @param {Object} $super See lowpro docs.
     * @param {Object} container See module docs.
     */
    initialize: function($super, container) {
        $super(container);
        // its parent class HiddenFieldPicker will have called hide
        this.show(this.HIDDEN_MODULE_KEY);

        this.logger = Splunk.Logger.getLogger("Splunk.Module.FieldPicker");
        this.displaySideBar(Splunk.util.normalizeBoolean(this.getParam("sidebarDisplay")));
        this.fieldSummaryLayer = null;
        this.fieldSummaryLayerTarget = $("<div>").attr("class", "FieldSummaryLayerTwoTarget").appendTo("body");
        this.filterKeyword = null;
        this.filterPercent = null;   
        this.firefox2FixFlag = false;
        this.inFlightXHR = null;
        this.inlineHeaderElement = $("." + this.INLINE_HEADER_CLASS_NAME, this.container);
        this.inlineHeaderCountElement = $("." + this.INLINE_HEADER_COUNT_CLASS_NAME, this.inlineHeaderElement);
        this.noneMatchRenderAllResults = "";
        this.popup = null;
        this.reportLinkTarget = (this._params["link"])?this._params["link"]["view"]:false;  
        this.selectedFields = this.getSelectedFieldList();//copy of current field list
        this.sortKey = null;
        this.sortDir = null;
        this.container.bind(this.UI_EVENT_TYPES.join(" "), this.onUIEvent.bind(this));
        $(this.SIDEBAR_CONTROL_SELECTOR).bind(this.UI_EVENT_TYPES.join(" "), this.onUIEvent.bind(this));//Sidebar is in outerspace.
        this.checkStatusBuckets = false;
    },

    /**
     * applyContext is the mechanism by which modules pluck changes out of upward-travelling contexts. 
     * the most familiar example of this is when you click on a term in the EventsViewer. 
     * However the implementation below is catching the upward travelling contexts that come from 
     * SuggestedFieldViewer, when a user clicks 'add to selected fields'.
     */
    applyContext: function(context) {
        if (this.isPageLoadComplete()) {
            var search = context.get("search");
            var fieldsIntention = search.getIntentionReference("setfields");
            if (fieldsIntention) {
                this.selectedFields = [];
                var fields = fieldsIntention["arg"];
                for (var i=0; i<fields.length; i++) {//do not include underscore prefixed fields
                    var field = fields[i];
                    if (field.charAt(0)!=="_") {
                        this.selectedFields.push(field);
                    }
                }
                this.setSelectedFieldList(this.selectedFields);
                // notify everyone else
                this.pushContextToChildren();
                return true;
            }
        }
    },

    /**
     * Commit all changes within the popup state machine and push context to children.
     */
    commitPopupChanges: function() {
        // commit to persistence layer
        this.setSelectedFieldList(this.selectedFields);
        // notify everyone else
        this.pushContextToChildren();
    },

    /**
     * Control the display of the side bar. If the side bar is not in the DOM pass through.
     * 
     * @parm {Boolean} display The desired display state, true to show false to hide.
     */
    displaySideBar: function(display) {
        var sidebar = $(this.SIDEBAR_CONTROL_SELECTOR);
        var currentDisplay = (sidebar.hasClass(this.SIDEBAR_CONTROL_CLOSED_CLASS_NAME))?false:true;
        if(currentDisplay!=display){
            sidebar.click();
        }
    },

    /**
     * Convenience method for enabling the display of the "Update Fields" prompt within a launched field picker.
     */
    displayUpdateFieldsMessage: function() {
        if (this.popup) {
            var popupContainer = this.popup.getPopup();
            $("." + this.POPUP_UPDATE_FIELDS_CONTAINER_CLASS_NAME, popupContainer).css("display", "block");
        }        
    },

    /**
     * Perform graceful destruction of field summary layer.
     */
    fieldSummaryLayerGC: function() {
        if (this.fieldSummaryLayer) {
            this.removeFirefox2Fix();
            this.fieldSummaryLayer.hide();
            this.fieldSummaryLayer = null;
        }
    },

    /**
     * Retrieve the uri params as an object literal based on the current state of this object.
     * 
     * @type Object
     * @return An object literal having attribute/value pairs one level deep.
     */
    getResultParams: function() {
        var context = this.getContext();
        var search  = context.get("search");
        var params = {
            sid: search.job.getSearchId()
        };
        if (this.selectedFields.length>0) {
            params.field_list = this.selectedFields.join(",");
        }
        if (this.filterKeyword) {
            params.filter_keyword = this.filterKeyword;
        }
        if (this.filterPercent) {
            params.filter_percent = this.filterPercent;
        }
        if (this.sortKey) {
            params.sort_key = this.sortKey;
        }
        if (this.sortDir) {
            params.sort_dir = this.sortDir;
        }
        return params;
    },

    /**
     * Gracefully perform garbage collection on in-flight XHR.
     */
    inFlightXHRGC: function() {
        if (this.inFlightXHR) {
            try {
                this.inFlightXHR.abort();
            } catch (e) {
                this.logger.warn("Could not call abort on inflight XHR.");
            }
            this.inFlightXHR = null;
        }
    },

    /**
     * framework method used to set key requirements right before jobs get dispatched
     * the rule is that the module that actually needs the underlying data, should set 
     * the flag.  
     * As such, HiddenFieldPicker does NOT set status_buckets nor required_field_list
     * instead its the modules that interpret and use that argument that make this choice. 
     * eg: consider the 'allowTransformedFieldSelect' option on SimpleResultsTable . 
     *
     * Because the FieldPicker ITSELF needs to pick and choose from any field, 
     * it itself needs the field summaries to be on the job. Therefore it sets the 
     * arguments here even though HiddenFieldPicker module does not.
     * 
     * @param {Object} search See search object for specification.
     */
    onBeforeJobDispatched: function(search) {
        // needs at least one status bucket in it's dispatched searches.
        search.setMinimumStatusBuckets(1);
        // needs *all* the fields in order to do it's job.
        search.setRequiredFields(["*"]);
    },

    /**
     * Handle context change, refresh appropriate DOM elements, commit popup changes and destroy popup.
     */
    onContextChange: function() {
        this.checkStatusBuckets = true; 
        if (!this.isPageLoadComplete()) {
            this.refreshInlineHeaderCount();
        }
        if (this.popup) {
            this.commitPopupChanges();
            this.popup.destroyPopup();
        }

        var context = this.getContext();
        var search  = context.get("search");
        var sid = search.job.getSearchId();

    },

    /**
     * Handle a dispatched event from the Field Summary Layer. 
     * 
     * @type {Object} arg An object having {String} type, {Object} event and {Object} intention attributes.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onFieldSummaryLayerDispatch: function(arg) {
        var context;
        var search;
        switch(arg.type) {
            case "search":
                if (arg.event.altKey) {
                    arg.intention.name = "negateterm";
                }
                context = new Splunk.Context();
                search = new Splunk.Search("*");
                search.addIntention(arg.intention);
                context.set("search", search);
                this.passContextToParent(context);
                if (this.popup) {
                    this.popup.destroyPopup();
                }
                break;
            case "report":
                context = this.getContext();
                search = context.get("search");
                var searchStr = $.trim(search.job.getEventSearch()) + " | " + arg.reportSearch;
                context = new Splunk.Context();
                search = new Splunk.Search(searchStr);
                search.addIntention(arg.intention);
                context.set("search", search);
                this.passContextToParent(context);
                if (this.popup) {
                    this.popup.destroyPopup();
                }
                break;
            case "close":
                this.fieldSummaryLayerGC();
                break;
            default:
                break;
        }
        return false;
    },

    /**
     * Handle job progress event by updating the header count. NOTE: Currently the popup is not updated automatically.
     */
    onJobProgress: function() {
        this.refreshInlineHeaderCount();
        this.displayUpdateFieldsMessage();
        if (this.checkStatusBuckets) {
            var context = this.getContext();
            var search  = context.get("search");
            var sid = search.job.getSearchId();
            if (sid && (search.job.getStatusBuckets() < 1)) {
                //hide
                $(window).trigger('hidesidebar');
            } else {
                //show
                $(window).trigger('showsidebar');
            }
            this.checkStatusBuckets = false;
        }
    },

    /**
     * Handle a UI event to launch popup.
     *
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event
     */
    onLaunchPopup: function(event, target) {
    	event.preventDefault();
    
        this.inFlightXHRGC();
        var params = this.getResultParams();
        var url = this.getResultURL(params);
        this.inFlightXHR = $.ajax({
            type: "GET",
            url: url,
            dataType: "html",
            error: function() {
                this.inFlightXHR = null;
                this.logger.error(sprintf(_("Could not load %(url)s"), {url: url}));
            }.bind(this),
            complete: function(data, textStatus) {
                this.inFlightXHR = null;
                if (data.status==200 || data.status==304) {
                    this.popup = new Splunk.Popup(data.responseText, {
                        cloneFlag: false,
                        title : _("Fields"),
                        pclass : this.POPUP_CLASS_NAME,
                        buttons : [
                            {
                                label: _("Cancel"),
                                type : "secondary",
                                callback: function(){
                                    return true;
                                }.bind(this)
                            },
                            {    
                                label: _("Save"),
                                type : "primary",
                                callback: function(){
                                    this.commitPopupChanges();
                                    return true;
                                }.bind(this)
                            }
                        ],
                        onDestroy : this.popupGC.bind(this)
                    });
                    this.onUIEventPopupBind();
                } else {
                    this.popup = new Splunk.Popup(data.responseText, {
                        cloneFlag: false,
                        title : _("No Fields"),
                        pclass : this.POPUP_CLASS_NAME,
                        buttons : [
                            {
                                label: _("OK"),
                                type : "primary",
                                callback: function(){
                                    return true;
                                }.bind(this)
                            }
                        ],
                        onDestroy : this.popupGC.bind(this)
                    });
                    this.onUIEventPopupBind();
                }
            }.bind(this)
        });

   		return true;
    },

    /**
     * Add all non-selected fields.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupAddAll: function(event, target) {
        var self = this;
        var popupContainer = this.popup.getPopup();
        $(this.POPUP_NON_SELECTED_FIELDS_SELECTOR, popupContainer).each(function(){
            var term = $(this).attr(self.POPUP_SELECTED_FIELD_NAME_ATTR);
            if (jQuery.inArray(term, self.selectedFields)==-1) {
                self.selectedFields.push(term);
                $(this).addClass(self.POPUP_SELECTED_FIELD_CLASS_NAME);
                var popupContainer = self.popup.getPopup();
                var selectedFieldTemplate = sprintf(self.POPUP_SELECTED_FIELD_HTML_TEMPLATE, {fieldName: Splunk.util.escapeHtml(term)});
                $("." + self.POPUP_SELECTED_FIELD_CONTAINER_CLASS_NAME, popupContainer).append($(selectedFieldTemplate));
            }
        });
        return false;
    },

    /**
     * Add/Remove an individual field unit.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupToggleUnit: function(event, target) {
        var closestElement = target.closest(this.POPUP_ADD_UNIT_CLOSEST_SELECTOR);
        if (closestElement.length>0) {
            var fieldName = closestElement.attr(this.POPUP_SELECTED_FIELD_NAME_ATTR);
            var popupContainer = this.popup.getPopup();
            if (closestElement.hasClass(this.POPUP_SELECTED_FIELD_CLASS_NAME)) {
                var selectedFields = $(this.POPUP_SELECTED_FIELD_SELECTOR, popupContainer);
                for (var i=0; i<selectedFields.length; i++) {
                    var selectedField = $(selectedFields[i]);
                    if (selectedField.text()==fieldName) {
                        this.selectedFields.splice(jQuery.inArray(fieldName, this.selectedFields), 1);
                        selectedField.remove();
                        closestElement.removeClass(this.POPUP_SELECTED_FIELD_CLASS_NAME);
                        break;
                    }
                }
            } else {
                if (jQuery.inArray(fieldName, this.selectedFields)==-1) {
                    this.selectedFields.push(fieldName);
                    closestElement.addClass(this.POPUP_SELECTED_FIELD_CLASS_NAME);
                    var selectedFieldTemplate = sprintf(this.POPUP_SELECTED_FIELD_HTML_TEMPLATE, {fieldName: Splunk.util.escapeHtml(fieldName)});
                    $("." + this.POPUP_SELECTED_FIELD_CONTAINER_CLASS_NAME, popupContainer).append($(selectedFieldTemplate));
                }
            }
        }
        return false;
    },

    /**
     * Clear all currently selected fields.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupClearAll: function(event, target) {
        if (this.selectedFields.length>0) {
            var popupContainer = this.popup.getPopup();
            this.selectedFields = [];
            $(this.POPUP_SELECTED_FIELD_SELECTOR, popupContainer).remove();
            $("." + this.POPUP_SELECTED_FIELD_CLASS_NAME).removeClass(this.POPUP_SELECTED_FIELD_CLASS_NAME);
        }
        return false;
    },

    /**
     * Handle a sort event on the available fields.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupSort: function(event, target) {
        this.sortKey = target.attr(this.POPUP_SORT_KEY_ATTR);
        this.sortDir = target.attr(this.POPUP_SORT_DIR_ATTR);
        this.renderAvailableFieldsResults();
        return false;
    },

    /**
     * Handle a filter event on the available fields.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupFilter: function(event, target) {
        var popupContainer = this.popup.getPopup();
        this.filterKeyword = Splunk.util.trim($("." + this.POPUP_FILTER_KEYWORD_CLASS_NAME, popupContainer).attr("value"));
        this.filterPercent = Splunk.util.trim($("." + this.POPUP_FILTER_PERCENT_CLASS_NAME, popupContainer).attr("value"));                
        this.renderAvailableFieldsResults();
        return true;
    },

    /**
     * Reset the keyword filter back to default. 
     * 
     * @param {Object} event The DOM event triggered.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupFilterClearKeyword: function(event) {
        var popupContainer = this.popup.getPopup();
        $("." + this.POPUP_FILTER_KEYWORD_CLASS_NAME, this.popupContainer).attr("value", this.POPUP_FILTER_KEYWORD_DEFAULT_VALUE);
        this.filterKeyword = (this.POPUP_FILTER_KEYWORD_DEFAULT_VALUE.length>0)?this.POPUP_FILTER_KEYWORD_DEFAULT_VALUE:null;
        this.renderAvailableFieldsResults();
        return false;
    },

    /**
     * Reset the percent filter back to default.
     * 
     * @param {Object} event The DOM event triggered.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupFilterClearPercent: function(event) {
        var popupContainer = this.popup.getPopup();
        $("." + this.POPUP_FILTER_PERCENT_CLASS_NAME, this.popupContainer).attr("value", this.POPUP_FILTER_PERCENT_DEFAULT_VALUE);
        this.filterPercent = (this.POPUP_FILTER_PERCENT_DEFAULT_VALUE.length>0)?this.POPUP_FILTER_PERCENT_DEFAULT_VALUE:null;
        this.renderAvailableFieldsResults();
        return false;
    },

    /**
     * Remove an individual field unit.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupRemoveUnit: function(event, target) {
        var closestElement = target.closest(this.POPUP_REMOVE_UNIT_CLOSEST_SELECTOR);
        if (closestElement.length>0) {
            var fieldName = closestElement.text();
            var popupContainer = this.popup.getPopup();
            this.selectedFields.splice(jQuery.inArray(fieldName, this.selectedFields), 1);
            var selectedFields = $("." + this.POPUP_SELECTED_FIELD_CLASS_NAME, popupContainer);
            closestElement.remove();
            for (var i=0; i<selectedFields.length; i++) {
                var selectedField = $(selectedFields[i]);
                if (selectedField.attr(this.POPUP_SELECTED_FIELD_NAME_ATTR)==fieldName) {
                    selectedField.removeClass(this.POPUP_SELECTED_FIELD_CLASS_NAME);
                    break;
                }
            }
        }
        return false;
    },

    /**
     * Handle jQuery sortable stop event for re-arrangement of selected field order. This is not triggered via the main UI dispatcher.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} ui The jQuery ui Object see http://docs.jquery.com/UI/Sortable for details.
     */
    onPopupSortableSelectedFieldsStop: function(event, ui) {
        var self = this;
        var popupContainer = this.popup.getPopup();
        var reorderFields = [];
        $(this.POPUP_SELECTED_FIELD_SELECTOR, popupContainer).each(function(){
            var fieldName = $(this).text();
            reorderFields.push(fieldName);
        });
        this.selectedFields = reorderFields;
    },

    /**
     * Handle the launch of the field summary layer.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupFieldSummaryLayerLaunch: function(event, target) {
        var context = this.getContext();
        var search = context.get("search");
        var sid = search.job.getSearchId();
        var fieldName = target.attr(this.POPUP_SELECTED_FIELD_NAME_ATTR);
        this.fieldSummaryLayer = new Splunk.Popup.FieldSummaryLayerTwo(sid, fieldName, this.fieldSummaryLayerTarget, target, this.onFieldSummaryLayerDispatch.bind(this));
        this.addFirefox2Fix();
        this.fieldSummaryLayer.show();
    },

    /**
     * Handle the update of fields displayed.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPopupUpdateFields: function(event, target) {
        this.renderAllResults();
        return false;
    },

    /**
     * Observe changes in the side bar, update param value for persistence.
     * 
     * @param {Object} event The DOM event triggered.
     * @param {Object} target The DOM target casted as a jQuery object.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onSideBarChange: function(event, target) {
        display = ($(target).hasClass(this.SIDEBAR_CONTROL_CLOSED_CLASS_NAME))?true:false;
        this.setParam("sidebarDisplay", display);
        return true;
    },

    /**
     * Top level UI event listener and dispatcher.
     *
     * @param {Object} event A DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onUIEvent: function(event) {
    	
        var type = event.type;
        var target = $(event.target);
        
        // walk up tree for a bit. since the user may have clicked on a span, this is necessary to find the a tag.
        if (target.parent().is('a')) target = target.parent();
        
        if (type==="click") {
            if (target.hasClass(this.SIDEBAR_CONTROL_OPEN_CLASS_NAME) || target.hasClass(this.SIDEBAR_CONTROL_CLOSED_CLASS_NAME)) {
                return this.onSideBarChange(event, target);
            } else if (target.hasClass(this.LAUNCH_POPUP_CLASS_NAME)) {
                return this.onLaunchPopup(event, target);
            } else if (this.popup) {
                if (target.attr(this.POPUP_SORT_KEY_ATTR) && target.attr(this.POPUP_SORT_DIR_ATTR)) {
                    return this.onPopupSort(event, target);
                } else if(target.hasClass(this.POPUP_FILTER_KEYWORD_CLEAR_CLASS_NAME)) {
                    return this.onPopupFilterClearKeyword(event, target);
                } else if(target.hasClass(this.POPUP_FILTER_PERCENT_CLEAR_CLASS_NAME)) {
                    return this.onPopupFilterClearPercent(event, target);
                } else if(target.hasClass(this.POPUP_ADD_ALL_CLASS_NAME)) {
                    return this.onPopupAddAll(event, target);
                } else if(target.hasClass(this.POPUP_REMOVE_ALL_CLASS_NAME)) {
                    return this.onPopupClearAll(event, target);
                } else if(target.hasClass(this.POPUP_ADD_UNIT_CLASS_NAME)) {
                    return this.onPopupToggleUnit(event, target);
                } else if(target.hasClass(this.POPUP_REMOVE_UNIT_CLASS_NAME)) {
                    return this.onPopupRemoveUnit(event, target);
                } else if(target.hasClass(this.POPUP_SUMMARY_CLASS_NAME)) {
                    return this.onPopupFieldSummaryLayerLaunch(event, target);
                } else if(target.hasClass(this.POPUP_UPDATE_FIELDS_UPDATE_CLASS_NAME)) {
                    return this.onPopupUpdateFields(event, target);
                }
            }
            //TODO add gc for "X" button click - no handler available in popup object
        } else if (type=="keyup") {
            if (this.popup && ( target.hasClass(this.POPUP_FILTER_KEYWORD_CLASS_NAME) || target.hasClass(this.POPUP_FILTER_PERCENT_CLASS_NAME) ) ) {
                return this.onPopupFilter(event, target);
            }
        }
    },

    /**
     * Helper for gracefully binding onUIEvent to current popup instance.
     */
    onUIEventPopupBind: function() {
        $("input:visible:enabled:first").focus();
        if (this.popup) {
            var popupContainer = this.popup.getPopup();
            popupContainer.bind(this.UI_EVENT_TYPES.join(" "), this.onUIEvent.bind(this));
            this.onUIEventPopupBindSortableSelectedFields();
        } else {
            this.logger.warn("Cannot bind event listeners for a non-existant popup instance.");
        }
        
    },

    /**
     * jQuery UI likes specific element observers over global dispatchers.
     */
    onUIEventPopupBindSortableSelectedFields: function() {
        var popupContainer = this.popup.getPopup();
        popupContainer.find("." + this.POPUP_SELECTED_FIELD_CONTAINER_CLASS_NAME).sortable({
            axis: "y", cursor: "move",
            stop: this.onPopupSortableSelectedFieldsStop.bind(this)
        });
    },

    /**
     * Helper  for gracefully unbinding onUIEvent to current popup instance.
     */
    onUIEventPopupUnbind: function() {
        if (this.popup) {
            var popupContainer = this.popup.getPopup();
            popupContainer.unbind(this.UI_EVENT_TYPES.join(" "), this.onUIEvent.bind(this));
        } else {
            this.logger.warn("Cannot unbind event listeners for a non-existant popup instance.");
        }
    },

    /**
     * NOTE!!! Do not call this method directly it should be fired as a callback via the onDestroy option supplied to the Popup class.
     * Helper for the graceful destruction of a popup and possible field summary layer.
     */
    popupGC: function() {
        this.onUIEventPopupUnbind();
        this.noneMatchRenderAllResults = "";
        if (this.popup) {
            //Calling this.popup.destroyPopup() will cause a recursion error!
            this.popup = null;
        }
        this.selectedFields = this.getSelectedFieldList();
        this.filterKeyword = null;
        this.filterPercent = null;
        this.sortKey = null;
        this.sortDir = null;
        this.fieldSummaryLayerGC();
    },

    /**
     * Refresh the DOM of the inline field count header.
     */
    refreshInlineHeaderCount: function() {
        var context = this.getContext();
        var search  = context.get("search");
        //Handle case where no fields exist in field summary when status buckets are 0.
        var fieldCount = (search.job.getStatusBuckets()==0) ? 0 : search.job.getEventFieldCount();
        this.inlineHeaderCountElement.text(sprintf(ungettext('%d field', '%d fields', fieldCount), fieldCount));
        this.inlineHeaderElement.show();
    },

    /**
     * Retrieve the structural markup and instantiate a new model dialog popup with it.
     */
    renderAllResults: function() {
        this.inFlightXHRGC();
        if (!this.popup) {
            return;
        }
        var params = this.getResultParams();
        var url = this.getResultURL(params);
        this.inFlightXHR = $.ajax({
            type: "GET",
            url: url,
            dataType: "html",
            beforeSend: function(XMLHttpRequest) {
                //don't set If-None-Match header to empty string value (see SPL-70971)
                if (this.noneMatchRenderAllResults) {
                    try {
                        XMLHttpRequest.setRequestHeader("If-None-Match", this.noneMatchRenderAllResults);
                    } catch(e) {
                        //IE6 does not have setRequestHeader()
                    }
                }
            }.bind(this),
            error: function() {
                this.logger.error(sprintf(_("Could not load %(url)s"), {url: url}));
                this.inFlightXHR = null;
            }.bind(this),
            complete: function(data, textStatus) {
                this.inFlightXHR = null;
                this.noneMatchRenderAllResults = data.getResponseHeader("Etag");
                if (data.status==200) {
                    if (this.popup) {
                        var popupContainer = this.popup.getPopup();
                        $("." + this.POPUP_CONTENT_CLASS_NAME, popupContainer).html(data.responseText);
                        this.onUIEventPopupBindSortableSelectedFields();
                    }
                }
            }.bind(this)
        });
    },

    /**
     * Retrieve the structural markup for only the available fields. Useful for sorting and filtering routines.
     */
    renderAvailableFieldsResults: function() {
        this.inFlightXHRGC();
        if (!this.popup) {
            return;
        }
        var params = this.getResultParams();
        var popupContainer = this.popup.getPopup();
        params.has_layout = 0;
        var url = this.getResultURL(params);
        this.inFlightXHR = $.ajax({
            type: "GET",
            url: url,
            dataType: "html",
            error: function() {
                this.logger.error(sprintf(_("Could not load %(url)s"), {url: url}));
                this.inFlightXHR = null;
            }.bind(this),
            complete: function(data, textStatus) {
                this.inFlightXHR = null;
                if (this.popup) {
                    var popupContainer = this.popup.getPopup();
                    $(this.POPUP_AVAILABLE_FIELDS_SELECTOR, popupContainer).html(data.responseText);
                }
            }.bind(this)
        });
    },

    /**
     * See module specification for this method.
     */
    resetUI: function() {
        this.inlineHeaderElement.hide();
    },

    /**
     * NOTE: This is based on legacy implementation see original authors for design pattern.
     */
    setSelectedFieldList: function($super, list, writeSessionOnly) {
        $super(list, writeSessionOnly);
        // send out to persistence layer
        fieldListStr = Splunk.util.fieldListToString(this._selectedFields);
        this.setParam("fields", fieldListStr, writeSessionOnly);
    },

    /**
     *  Function to handle specific FF2 bug with the FieldSummaryLayerTwo display.  If the FieldPicker lives in the sidebar
     *  and it has overflow:hidden, remove the overflow:hidden while FieldSummaryLayer is open.  This fixes a z-index issue
     *  with FF2 and position:fixed inside elements with overflow:hidden.
     *
     *  More info: SPL-28249
     */
    addFirefox2Fix: function() {
        if ( $.browser.mozilla && $.browser.version.substr(0,3) < "1.9" ){ /* only do this for ff2 */
            if ( $(this.container).parents(this.SIDEBAR_SELECTOR).length != 0 && $(this.SIDEBAR_SELECTOR).css('overflow') == 'hidden') {
                $(this.SIDEBAR_SELECTOR).css('overflow','visible');
                this.firefox2FixFlag = true;           
            }
        }        
    },

    /**
     *  Removes the FF2 fix applied in addFirefox2Fix()
     */
    removeFirefox2Fix: function(){
        if ( this.firefox2FixFlag ) { // only do this if the flag indicates the fix is in place
            $(this.SIDEBAR_SELECTOR).css('overflow','hidden');
            this.firefox2FixFlag = false;
        }
    }
});
