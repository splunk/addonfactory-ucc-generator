Splunk.Module.EventsViewer = $.klass(Splunk.Module.AbstractPagedModule, {
    EVENT_SELECTOR: "li.item",
    LOADING_MESSAGE: _("Getting search results..."),
    MENU_LOADER_CLASS_NAME: "loader",
    FIELD_ACTIONS_RESOURCE: "/api/field/actions/%(app)s/%(sid)s/%(offset)s?maxLines=%(maxLines)s",
    FIELD_ACTIONS_FIELD_NAME_WILDCARD: "*",
    FIELD_ACTIONS_FIELD_VALUE_WILDCARD: "*",
    FIELD_MENU_CLASSES: "splMenu-primary",
    FIELD_MENU_CLASS_NAME: "fm",
    FIELD_NAME_CLASS_NAME: "k",
    FIELD_VALUE_CLASS_NAME: "v",
    EVENT_ACTION_MENU_CLASSNAME: "actions",
    RENDER_REFRESH_TIME_CONSTRAINT: 1.5,
    REPORT_LINK_INTENTION: '{"name": "plot", "arg": {"mode": "timechart", "fields": [["count", "__events"]], "splitby": "%(fieldName)s"}}',
    RESULTS_CONTAINER_CLASS_NAME: "buffer",
    SCROLLER_ENABLED_CLASS_NAME: "EventsViewerScroller",
    SEGMENT_HOVER_CLASS_NAME: "h",
    SHOW_INLINE_CLASS_NAME: "showinline",
    SHOW_INLINE_LOADING_MESSAGE: _("Retrieving updated lines..."),
    SHOW_INLINE_ERROR_MESSAGE: _("Could not retrieve updated lines, try again?"),
    SHOW_SOURCE_CLASS_NAME: "showsrc",
    SOFT_WRAP_CLASS_NAME: "EventsViewerSoftWrap",
    STATUS_MESSAGE_SELECTOR: ".resultStatusMessage .resultStatusHelp",
    TAG_CLASS_NAME: "tg",
    TAG_ERROR_MESSAGE: _("Tagging is currently unavailable."),
    TAG_FIELD_POPUP_ACTION_CLASS_NAME: "tf",
    TAG_FIELD_POPUP_TITLE: _("Tag This Field"),
    TAG_FIELD_POPUP_SELECTOR: ".tagfieldpopup",
    TAG_INTENTION_PREFIX: "tag::",
    TERM_CLASS_NAME: "t",
    TIMESTAMP_CLASS_NAME: "time",
    TIMESTAMP_EPOCH_TIME_ATTRIBUTE_NAME: "s:epoch",
    UI_EVENT_TYPES: ["click", "mouseover", "mouseout", "change"],
    /**
     *  Override default initialize. See $super for implementation details.
     */
    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("events_viewer.js");
        this.mergeLoadParamsIntoContext("results", ["displayRowNumbers", "segmentation", "softWrap"]);
        this.doc = $(document);
        this.enableBehavior = Splunk.util.normalizeBoolean(this._params.enableBehavior);
        this.enableEventActions = Splunk.util.normalizeBoolean(this._params.enableEventActions);
        this.enableFieldActions = Splunk.util.normalizeBoolean(this._params.enableFieldActions);
        this.enableTermSelection = Splunk.util.normalizeBoolean(this._params.enableTermSelection);
        this.menu = null;
        this.menuXHR = null;
        this.maxLinesConstraint = parseInt(this._params.maxLinesConstraint, 10);
        this.messenger = Splunk.Messenger.System.getInstance();
        this.reportFieldLink = this._params.reportFieldLink || null;
        this.renderedCount = -1;
        this.resultsContainer = $("."+this.RESULTS_CONTAINER_CLASS_NAME, this.container);
        this.scrollerMinHeight = parseInt(this._params.scrollerMinHeight, 10);
        this.scrollerMaxHeight = parseInt(this._params.scrollerMaxHeight, 10);
        this.scroller = null;
        if(Splunk.util.normalizeBoolean(this._params.scrollerEnable)){
            this.scroller = new Splunk.scroller.YAxis(this.scrollerMinHeight, this.scrollerMaxHeight, this.container, this.SCROLLER_ENABLED_CLASS_NAME);
        }
        if(this.enableBehavior){
            this.bindEventListeners();
        }
    },
    /**
     * Binds top level event listeners.
     */
    bindEventListeners: function(){
        this.container.bind(this.UI_EVENT_TYPES.join(" "), this.onUIEvent.bind(this));
    },
    /**
     * jQuery closest compat layer, broken for event.target on MSIE (http://tinyurl.com/nbmv8c).
     * 
     * @param {Object} node a jQuery casted element reference.
     * @param {String} expression Standard jQuery expression syntax.
     * @type Object
     * @return A jQuery casted matching element set.
     */
    closest: function(node, expression){
        if($.browser.msie){
            if(node.is(expression)){
                return node;
            }else{
                while(node.parent().length>0){
                    var parent = node.parent(expression);
                    if(parent.length>0){
                        return parent;
                    }
                    node = node.parent();
                }
                return $([]);
            }
        }else{
            return node.closest(expression);
        }
    },
    /**
     * Get the adjacent field name for an element.
     *
     * @param {Object} element jQuery casted element reference.
     * @type String
     * @return The text value of an adjacent field node.
     */
    getAdjacentFieldName: function(element){
        var selector = "." + this.FIELD_NAME_CLASS_NAME + ":first";
        return element.siblings(selector).text();
    },
    /**
     * Get the adjacent field value for an element.
     *
     * @param {Object} element jQuery casted element reference.
     * @type String
     * @return The text value of an adjacent field node.
     */
    getAdjacentFieldValue: function(element){
        var selector = "." + this.FIELD_VALUE_CLASS_NAME + ":first";
        return element.siblings(selector).text();
    },
    /**
     * Cache wrapper for retrieving a UI events related event renderer namespace.
     * 
     * @param {Object} target A jQuery casted DOM element.
     * @type String
     * @return A non-empty string for a matching namespace or an empty string if none found.
     */
    getRendererNamespace: function(target){
        if(!target[0].SplunkRendererNamespace){
            var parent = this.closest(target, this.EVENT_SELECTOR);
            var namespace = (parent.length)?parent.attr("s:renderernamespace"):null;
            if(namespace){
                target[0].SplunkRendererNamespace = namespace;
                return namespace;
            }else{
                return "";
            }
        }else{
            //this.logger.info("Using cache thank you.");
            return target[0].SplunkRendererNamespace;
        }
    },
    /**
     * Override to control firing. See $super for implementation details.
     */
    getResults: function($super){
        var context = this.getContext();
        var search = context.get("search");
        if(search.isJobDispatched()){
            this.menuGC([this.menu]);
            $super();
        }
    },
    /**
     * Override to augment param(s). See $super for implementation details.
     */
    getResultParams: function($super){
        var params = $super();
        var context = this.getContext();
        var search  = context.get("search");
        params.display_row_numbers = (Splunk.util.normalizeBoolean(context.get("results.displayRowNumbers")) ? 1 : 0);
        params.entity_name  = this.getParam("entityName");
        params.enable_event_actions = (this.enableEventActions)?1:0;
        params.enable_field_actions = (this.enableFieldActions)?1:0;
        params.segmentation = context.get("results.segmentation");
        params.sid = search.job.getSearchId();
        params.min_lines = params.max_lines;
        params.max_lines_constraint = this.maxLinesConstraint;

        if (
            search.job.getEventSorting() == "realtime"
            && this.getParam("entityName") == "events" 
            && !this.getSortField()
            && !search.getPostProcess()
        ) {
            params.offset = -(context.get("results.offset"))-context.get("results.count");
        }

        if($.browser.msie){
            params.replace_newlines = 1;
        }
        var postProcess = search.getPostProcess();
        if(postProcess){
            params.post_process = postProcess;
        }

        // New world assumption: If the job has no status buckets
        // but does have results, then request the results endpoint
        // instead.
        if (!(params.entity_name == "events" && search.job.getEventAvailableCount() > 0) && search.job.getStatusBuckets() == 0) params.entity_name = 'results_preview';

        return params;
    },
    /**
     * Get a segments parent.
     *
     * @param {Object} element A DOM element reference.
     * @type Object
     * @return A matching term elements parent casted as a jQuery element (excludes all non-term elements).
     */
    getSegmentParent: function(element){
        var parent = element.parentNode;
        if(parent.childNodes[parent.childNodes.length-1]==element && $(parent).hasClass(this.TERM_CLASS_NAME)){
            element = parent;
        }
        return $(element);
    },
    /**
     * Perform garbage collection on an array of menu pointers.
     * 
     * @param {Array} menus An array of menu pointers. Note, a pointer value can be null.
     */
    menuGC:function(menus){
        for(var i=0; i<menus.length; i++){
            var menu = menus[i];
            if(menu){
                menu.removeMenu();
                menu = null;
            }
        }
    },

    /**
     * Handle before job dispatch.
     *
     * @param {Object} search Search object.
     */
    onBeforeJobDispatched: function(search) {
        // even if we have no fields specified, we always need status_buckets>=1 or we might not 
        search.setMinimumStatusBuckets(1);
        // we use the method on AbstractPagedModule to get correct value from either runtime context or load param.
        var fields = this.getNormalizedFields();
        if (fields.length>0){
            search.setRequiredFields(fields);
        }
    },
    /**
     * Handle a new search. See $super for implementation details.
     */
    onContextChange: function($super){
        $super();
        this.renderedCount = -1;
        var context = this.getContext();
        //1 deal with values which dont involve any requests.
        if(context.has("results.softWrap")){
            this.setSoftWrapClassName(Splunk.util.normalizeBoolean(context.get("results.softWrap")));
        }
        if(context.has("results.scrollerEnable")){
            if(context.get("results.scrollerEnable") && !this.scroller){
                this.scroller = new Splunk.scroller.YAxis(this.scrollerMinHeight, this.scrollerMaxHeight, this.container, this.SCROLLER_ENABLED_CLASS_NAME);
            }else if(this.scroller){
                this.scroller.destroy();
                this.scroller = null;
            }
        }
        var search = context.get("search");
        if(!search || !search.isJobDispatched()){
            this.logger.error("Assertion failed - ", this.moduleType, " extends DispatchingModule but has received an undispatched search");
        }
        //2 deal with various conditions that each require a request.
        if(this.haveResultParamsChanged() && (search.job.isDone() || (search.job.getEventAvailableCount() > 0))){
            this._pageComplete = false;
            this.getResults();
        }
    },
    /**
     * Handle a UI event to click on a field and propagate intention to search.
     *
     * @param {Object} event The triggered DOM event.
     */
    onFieldSelect: function(event){
        var element = $(event.target);
        var name = this.getIntentionName(event);
        var fieldName = this.getAdjacentFieldName(element);
        var intention = {
            arg: {},
            name: name
        };
        intention.arg[fieldName] = element.text();
        intention = this.getKeydownMutatedIntention(intention, event);
        this.passIntention(intention);
    },
    /**
     * Handle job progress notification and get results if required. See $super for implementation details.
     *
     * @param {Object} event A jQuery event.
     */
    onJobProgress: function(event){
        var context = this.getContext();
        var search  = context.get("search");
        //standard descending event sorting
        if (search.job.getEventSorting()=="desc" && !search.getTimeRange().isRealTime() && !search.job.isDone()){
            var needMoreEvents = this.renderedCount < context.get("results.count");
            var moreEventsAreAvailable = search.job.getEventAvailableCount() > Math.max(this.renderedCount, 0);
            if (needMoreEvents && moreEventsAreAvailable){
                // Need to remember that we've already asked for these events
                // for the case when the next progress event occurs before renderResults.
                // without this assignment we will get multiple calls to getResults 
                // competing with eachother or perhaps aborting eachother.
                this.renderedCount = Math.min(search.job.getEventAvailableCount(), context.get("results.count"));
                //this.logger.info("onJobProgress triggering getResults");
                this.getResults();
            }
        //all other event sorting, including real time, we just request on every progress event.
        }else{
            this.getResults();
        }
    },
    /**
     * Handle the retrieval of data required to generate the field actions menu. Performs callback string association to appropriate function
     * and graceful exception handling.
     * 
     * @param {Object} data An object literal following standard json response format adhering to menu builder data format.
     * @param {Array} defaults An array of object literals following standard json response format adhering to menu builder data format. NOTE: For no defaults pass in an empty array.
     */
    onMenuData: function(data, defaults){
        if(data.status==200){
            try{
                var envelope = JSON.parse(data.responseText);
            }catch(e){
                this.logger.error("Could not parse field menu", e);
                this.menuGC([this.menu]);
                return;
            }
            if(envelope.success){
                var menuData = [];
                var fieldActions = Splunk.Module.EventsViewer.FieldAction.menuDataRemap(envelope.data);
                var menuItems = defaults.concat(fieldActions);
                for(var i=0; i<menuItems.length; i++){
                    var menuItem = menuItems[i];
                    if(menuItem.hasOwnProperty("callback")){
                        var callback = menuItem.callback;
                        if(this[callback]){
                            menuItem.callback = this[callback].bind(this);
                        }else if(window[callback]){
                            menuItem.callback = window[callback];
                        }else{
                            menuItem.callback = function(){
                                this.logger.info("No callback defined for this menu item.");
                            }.bind(this);
                        }
                        this.logger.info(callback);
                    }
                    menuData.push(menuItem);
                }
                if(this.menu){
                    try{
                        this.menu.updateMenu(menuData);
                        this.logger.info("Successfully loaded serialized field action menu items.");
                    }catch(e){
                        this.logger.error("Could not instantiate field menu with data", JSON.stringify(menuData), e);
                        this.menuGC([this.menu]);
                    }
                }else{
                    this.logger.warn("No menu instance exists, menu not updated.");
                }
            }else{
                this.logger.warn("The field menu data is invalid", envelope);
                this.menuGC([this.menu]);
            }
        }else{
            this.logger.warn("Could not load field menu data.");
            this.menuGC([this.menu]);
        }   
    },    
    /**
     * Add the ability to unsafely post somewhere else from a click on a MenuBuilder item.
     * NOTE: MenuBuilder future feature.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onPost: function(event){
        var element = $(event.target);
        var form = $('<form/>');
        var target = element.attr("s:post.target");
        if(target){
            form.attr('target', target);
        }
        var uri = element.attr("s:post.uri");
        if(uri){
            form.attr('action', uri);
        }
        form.attr('method', 'post');
        var payload = element.data('data');
        if(payload) {
            for(var param in payload){
                if (!payload.hasOwnProperty(param)) continue;
                var input = $('<input/>');
                input.attr({
                   'type': 'hidden',
                   'name': param,
                   'value': payload[param]
                });
                form.append(input);
            }
        }
        var appendedElement = this.container[0].appendChild(form[0]);
        appendedElement.submit();
        this.container[0].removeChild(appendedElement);//sayonara
        return false;
    },
    /**
     * Handle a report on field action. Spawns a report popup window with the appropriate field.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onReportField: function(event){
        var element = $(event.target);
        var fieldName = element.attr("s:fieldname");
        var intention = JSON.parse(sprintf(this.REPORT_LINK_INTENTION, {fieldName: fieldName}));
        var context = this.getContext();
        var search  = context.get("search");
        var baseSID = search.job.getSearchId();
        search.abandonJob();
        search.addIntention(intention);
        search.sendToView(this.reportFieldLink, {base_sid: baseSID}, true, true, {autosize: true});
        return false;
    },
    /**
     * Handle a UI event to retrieve an individual events html via XHR.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onShowInline: function(event){
        var element = $(event.target);
        var resource = element.attr("href");
        var target = this.closest(element, this.EVENT_SELECTOR);
        element.html(this.SHOW_INLINE_LOADING_MESSAGE);
        $.ajax({
            type: "GET",
            url: resource,
            dataType: "html",
            error: function(){
                this.logger.error(sprintf(_("Could not load %(resource)s"), {resource: resource}));
            }.bind(this),
            complete: function(data, textStatus){
                if(data.status==200){
                    target.html(data.responseText);
                }else{
                    element.html(this.SHOW_INLINE_ERROR_MESSAGE);
                }
            }.bind(this)
        });
        return false;
    },
    /**
     * Handle a UI event to click on the show source link for the event.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onShowSource: function(event){
        var element = $(event.target);
        Splunk.window.open(element.attr("href"), "showsource");
        return false;
    },
    /**
     * Handle a search on field action.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onSearch: function(event){
        var element = $(event.target);
        var searchStr = element.attr("s:search.search_string");
        var view = element.attr("s:search.view");
        var app = element.attr("s:search.app");
        var target = element.attr("s:search.target");
        var preserve_tr = Splunk.util.normalizeBoolean(element.attr("s:search.preserve_timerange"));
        var earliest = element.attr("s:search.earliest");
        var latest = element.attr("s:search.latest");
        var search = null;
        if (preserve_tr) {
            var context = this.getContext();
            search = context.get("search");
            search.abandonJob();
            search.setBaseSearch(searchStr);
        } else {
            search = new Splunk.Search();
            search.setBaseSearch(searchStr);
        }
        if (earliest || latest) {
            var timerange = new Splunk.TimeRange(earliest, latest);
            search.setTimeRange(timerange);
        }
        var openPopup = (target == "_self") ? false : true;
        search.sendToView(view, {}, false, openPopup, {'windowFeatures': 'resizable=yes,status=no,scrollbars=yes,toolbar=yes'}, app);
        return false;
    },    
    /**
     * Create an event menu.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onShowEventMenu: function(event){
        this.onShowMenu(event, this.FIELD_ACTIONS_FIELD_NAME_WILDCARD, this.FIELD_ACTIONS_FIELD_VALUE_WILDCARD, []);
        return true;
    },
    /**
     * Create a field menu.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onShowFieldMenu: function(event){
        var element = $(event.target);
        var fieldName = this.getAdjacentFieldName(element);
        var fieldValue = this.getAdjacentFieldValue(element);
        var defaults = Splunk.Module.EventsViewer.FieldAction.fieldMenuDefaults(fieldName, fieldValue);
        this.onShowMenu(event, fieldName, fieldValue, defaults);
        return true;
    },
    /**
     * A factory method for creating a new menu dropdown via XHR. Menus are created on the fly vs. multiple instances.
     *
     * @param {Object} event The triggered DOM event.
     * @param {String} fieldName The field name.
     * @param {String} fieldValue The field value.
     * @param {Array} defaults An array of object literals following standard json response format adhering to menu builder data format. NOTE: For no defaults pass in an empty array.
     */
    onShowMenu: function(event, fieldName, fieldValue, defaults){  
    	event.preventDefault();      
        var element = $(event.target);
        //ensure we have an anchor tag. otherwise go up the dom and get the A tag to ensure focus/accessibility support (eg if we get called via onShowEventMenu)
        //for perf reasons, assuming the A tag is the parent. this assumption currently convers all existing use case. however if a wider veriety of structure is implemented for a menu link, .closest would be safer.
        if(element[0].nodeName === "SPAN"){
            element = element.parent();
        }
        
        var context = this.getContext();
        var search  = context.get("search");
        var max_lines = context.get("results.maxLines");
        var appURIComponent = encodeURIComponent(Splunk.util.getCurrentApp());
        var sidURIComponent = encodeURIComponent(search.job.getSearchId());
        var resource = Splunk.util.make_url(sprintf(this.FIELD_ACTIONS_RESOURCE, {app: appURIComponent, sid: sidURIComponent, offset: this.closest(element, this.EVENT_SELECTOR).attr("s:offset"), maxLines: max_lines}));
        var data = {
            view: Splunk.util.getCurrentView()
        };
        if(fieldName!=this.FIELD_ACTIONS_FIELD_NAME_WILDCARD){
           data.field_name = fieldName;
        }
        if(fieldValue!=this.FIELD_ACTIONS_FIELD_VALUE_WILDCARD){
           data.field_value = fieldValue;
        }
        var timeRange = search.getTimeRange();
        if(timeRange.isSubRangeOfJob()){
            data.latest_time = timeRange.getLatestTimeTerms();
        }
        this.menuGC([this.menu]);
        this.menu = new Splunk.MenuBuilder({
            containerDiv: this.container,
            menuDict: [{
                menuType: "htmlBlock",
                element: $("."+this.MENU_LOADER_CLASS_NAME, this.container),
                action: "clone"
            }],
            activator: element,
            menuClasses: this.FIELD_MENU_CLASSES,
            showOnInit: true
        });
        if(this.menuXHR){
            this.logger.info("Existing XHR request canceled.");
            try{
                this.menuXHR.abort();
            }catch(e){}
            this.menuXHR = null;
        }
        this.menuXHR = $.ajax({
            type: "GET",
            url: resource,
            data: data,
            dataType: "text",
            error: function(){
                this.logger.error(sprintf(_("Could not load %(resource)s"), {resource: resource}));
            }.bind(this),
            complete: function(data, textStatus){
                this.onMenuData(data, defaults);
            }.bind(this)
        });
    },
    /**
     * Handle a tag field action. Spawns a popup window, pre-populates the field input.
     * NOTE: This method is large to encapsulate all popup dependencies.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event. 
     */
    onTagField: function(event){
        var element = $(event.target);
        var fieldName = element.attr("s:fieldname");
        var fieldValue = element.attr("s:fieldvalue");
        try{
            new Splunk.Popup.createTagFieldForm($(this.TAG_FIELD_POPUP_SELECTOR), this.TAG_FIELD_POPUP_TITLE, element.attr("s:fieldname"), element.attr("s:fieldvalue"), this.getResults.bind(this));
        }catch(e){
            this.logger.warn("Could not launch tag popup field form", e);
        }
        return false;
    },
    /**
     * Handle a UI event to click on a tag and propagate intention to search.
     *
     * @param {Object} event The triggered DOM event.
     */
    onTagSelect: function(event){
        var element = $(event.target);
        var name = this.getIntentionName(event);
        var fieldName = this.TAG_INTENTION_PREFIX + this.getAdjacentFieldName(element);
        var intention = {
            arg: {},
            name: name
        };
        intention.arg[fieldName] = element.text();
        intention = this.getKeydownMutatedIntention(intention, event);
        this.passIntention(intention);
    },
    /**
     * Handle a UI event to hover over a segment.
     *
     * @param {Object} event The triggered DOM event.
     */
    onTermHighlight: function(event){
        var element = this.getSegmentParent(event.target);
        element.addClass(this.SEGMENT_HOVER_CLASS_NAME);
    },
    /**
     * Handle a UI event to hover off a segment.
     *
     * @param {Object} event The triggered DOM event.
     */
    onTermBlur: function(event){
        var element = this.getSegmentParent(event.target);
        element.removeClass(this.SEGMENT_HOVER_CLASS_NAME);
    },
    /**
     * Handle a UI event to click on a segment and propagate intention to search.
     *
     * @param {Object} event The triggered DOM event.
     */
    onTermSelect: function(event){
        var element = this.getSegmentParent(event.target);
        var name = this.getIntentionName(event);

	if (element.hasClass("path")) {
	    var val = element.text();
	    var key = "";
	    var i = element;
	    var wcpart = "";
	    while (!element.is("pre")) {
		var parent = element.parent();
		var key_part = element.siblings(".PropName:first");
		if (key_part && key_part.hasClass("PropName")) {
		    if (key == "")
			key = key_part.text() + wcpart;
		    else
		    key = key_part.text() + wcpart + "." + key;
		    wcpart = "";
		} else if (parent.hasClass("Array")) {
		    wcpart = wcpart + "{}";
		}

		element = parent;
	    }

	    var context = new Splunk.Context();
	    var search  = new Splunk.Search("*");

	    var escape_re = /(\\|\")/g;


	    key = key.replace(escape_re, "\\$1");
	    val = val.replace(escape_re, "\\$1");

	    var spath_intention = {
		name: "addcommand",
		arg: {command: "spath",
		      args: '"' + key + '"'}
	    };

	    var where_intention = {
		name: "addcommand",
		arg: {command: "search",
		      args: '"' + key + '"="' +val+ '"'}
	    };

	    search.addIntention(spath_intention);
	    search.addIntention(where_intention);

	    context.set("search", search);

	    this.passContextToParent(context);
	    return;
	}

        var intention = {
            arg: element.text(),
            name: name
        };
        intention = this.getKeydownMutatedIntention(intention, event);
        this.passIntention(intention);
    },
    /**
     * Handle a UI event to retrieve an individual events html via XHR.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onTimestampSelect: function(event) {
        var em = $(event.target);
        var epoch = em.attr(this.TIMESTAMP_EPOCH_TIME_ATTRIBUTE_NAME);
        if (epoch) {
            epoch = parseInt(epoch, 10);
            var context = new Splunk.Context();
            var search = new Splunk.Search();
            var range = new Splunk.TimeRange(epoch,  epoch+1);
            search.setTimeRange(range);
            context.set("search", search);
            this.passContextToParent(context);
        } else {
            this.logger.error("received a click on a timestamp however there was no ", this.TIMESTAMP_EPOCH_TIME_ATTRIBUTE_NAME, " attribute on the element so we cannot proceed.");
        }
        return false;
    },
    /**
     * Top level UI event listener and dispatcher.
     *
     * @param {Object} event The triggered DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onUIEvent: function(event){
        var eventType = event.type;
        var eventTarget = $(event.target);
        var rendererNamespace = this.getRendererNamespace(eventTarget);
        //custom event renderer behavioral augmentation.
        if(rendererNamespace){
            this.doc.trigger(rendererNamespace, [{"nativeEvent":event, "module":this}]);
        }
        if(eventType==="click"){
        	eventTargetParent = eventTarget.parent();
        	if (eventTargetParent.hasClass(this.EVENT_ACTION_MENU_CLASSNAME)) {
        		eventTarget = eventTarget.parent();
        	}
        
            if(eventTarget.hasClass(this.SHOW_INLINE_CLASS_NAME)){
                return this.onShowInline(event);
            }else if(eventTarget.hasClass(this.TERM_CLASS_NAME) && this.enableTermSelection){
                return this.onTermSelect(event);
            }else if(eventTarget.hasClass(this.SHOW_SOURCE_CLASS_NAME)){
                return this.onShowSource(event);
            }else if(eventTarget.hasClass(this.FIELD_VALUE_CLASS_NAME) && this.enableTermSelection){
                return this.onFieldSelect(event);
            }else if(eventTarget.hasClass(this.TAG_CLASS_NAME) && this.enableTermSelection){
                return this.onTagSelect(event);
            }else if(eventTarget.hasClass(this.FIELD_MENU_CLASS_NAME)){
                return this.onShowFieldMenu(event);
            }else if(eventTarget.hasClass(this.EVENT_ACTION_MENU_CLASSNAME)){
                return this.onShowEventMenu(event);
            }else if(eventTarget.hasClass(this.TIMESTAMP_CLASS_NAME) && this.enableTermSelection){
                return this.onTimestampSelect(event);
            }else if(eventTarget.hasClass("jsexpand")){
		var elem = eventTarget[0];
		var container = elem.nextSibling;
		if(!container) return;
		var disp = "none";
		if(container.style.display == "none"){
		    disp = "inline";
		    elem.innerHTML = '[-]';
		} else {
		    elem.innerHTML = '[+]';
		}
		container.style.display = disp;
		return false;
	    }
        }else if(eventType==="mouseover" && this.enableTermSelection){
            if(eventTarget.hasClass(this.TERM_CLASS_NAME)){
                return this.onTermHighlight(event);
            }
        }else if(eventType==="mouseout"){
            if(eventTarget.hasClass(this.TERM_CLASS_NAME)){
                return this.onTermBlur(event);
            }
        }
    },
    /**
     * Takes an html stream of results, parses and returns an array of the events.
     * 
     * Note: This code does not use jQuery, raw DOM manipulation yields 2x faster.
     * 
     * @param {String} html An html string to parse.
     * @type Array
     * @return An array of event DOM html event elements.
     */
    parseResults: function(html){
        var chunkElement = null;
        var listElement = null;
        var buffer = [];
        var tmpContainer = document.createElement("div");
        tmpContainer.innerHTML = html;
        for(var i=0; (child = tmpContainer.childNodes[i]); i++){
            if(child.nodeName=="LI" && child.className=="chunk"){
                chunkElement = child;
                break;
            }
        }
        if(chunkElement){
            for(var j=0; (child = chunkElement.childNodes[j]); j++){
                if(child.nodeName=="OL" && child.className=="list"){
                    listElement = child;
                    break;
                }
            }
        }
        if(listElement){
            var s;
            for(var k=0; (child = listElement.childNodes[k]); k++){            
                s = (child.nodeName=="LI" && child.className.indexOf("item")!=-1)?1:0;
                switch(s){//switch faster than conditional
                    case 1:
                        buffer.push(child);
                        break;
                    default:
                        break;
                }
            }
        }
        return buffer;
    },
    /**
     * Reset the UI to its original state.
     */
    resetUI: function(){
        this.offset = 0;
        this.resultsContainer.html("");
    },
    /**
     * Override and set renderedCount. See $super for implementation details.
     */
    renderResults: function($super, htmlFragment){
        //var events = this.parseResults(htmlFragment);
        $super(htmlFragment, true);//TODO: turboInnerHTML strips event listeners for most browser, benchmark performance vs jQuery.html method (see SPL-22873)
        this.renderedCount = $(this.EVENT_SELECTOR, this.container).length;
        if(this.scroller){
            this.scroller.reset();
        }
    },
    /**
     * Set/Reset the class name for soft wrap control.
     *
     * @param {Boolean} state Add or remove the softwrap class.
     */
    setSoftWrapClassName: function(state){
        if(state){
            this.resultsContainer.addClass(this.SOFT_WRAP_CLASS_NAME);
        }else{
            this.resultsContainer.removeClass(this.SOFT_WRAP_CLASS_NAME);
        }
    }
});

/**
 * Static class for re-mapping field action appserver data to MenuBuilder data, retrieval of default event and field menu items.
 */
Splunk.Module.EventsViewer.FieldAction = {
    /**
     * Generate a data structure following MenuBuilder conventions from a field actions appserver data response.
     * 
     * @param {Object} data Envelope following field actions appserver convention.
     * @return An array of object literals following menu builder convention.
     * @type Array
     */
    menuDataRemap: function(data){
        var menuData = [];
        var logger = Splunk.Logger.getLogger("Splunk.Module.EventsViewer.FieldAction.menuDataRemap");
        for(var i=0; i<data.length; i++){
            var item = data[i];
            if(item.hasOwnProperty("type")){
                var type = item.type;
                switch(type){
                    case "link":
                        var linkMenuItem = this.linkMenuItem(item);
                        if(linkMenuItem){
                            menuData.push(linkMenuItem);
                        }
                        break;
                    case "search":
                        var searchMenuItem = this.searchMenuItem(item);
                        if(searchMenuItem){
                            menuData.push(searchMenuItem);
                        }
                        break;
                    default:
                        logger.warn("Non-supported field action type", type);
                        break;
                }
            }
        }
        return menuData;
    },
    /**
     * Handle field actions appserver "link" type data.
     * 
     * @param {Object} item Field actions 
     * @return Object literal following an individual menu item following menu builder convention or a null Object.
     * @type Object
     */
    linkMenuItem: function(item){
        var logger = Splunk.Logger.getLogger("Splunk.Module.EventsViewer.FieldAction.linkMenuItem");
        var menuItem = null;
        var requiredAttributes = ["label", "link.uri", "link.method"];
        for(var i=0; i<requiredAttributes.length; i++){
            var requiredAttribute = requiredAttributes[i];
            if(!item.hasOwnProperty(requiredAttribute)){
                logger.info.warn("Missing required attribute", requiredAttribute);
                return menuItem;
            }
        }
        var method = item["link.method"];
        switch(method){
            case "GET":
                menuItem = {
                    "label": item["label"],
                    "uri": item["link.uri"]
                };
                if(item.hasOwnProperty("link.target")){
                    menuItem["attrs"] = {"target": item["link.target"]};
                }
                break;
            case "POST":
                menuItem = {
                    "callback": "onPost",
                    "label": item["label"],
                    "attrs": {
                        "s:post.uri": item["link.uri"]
                    }
                };
                if(item.hasOwnProperty("link.payload")){
                    menuItem['data'] = item["link.payload"];
                }
                if(item.hasOwnProperty("link.target")){
                    menuItem.attrs["s:post.target"] = item["link.target"];
                }
                break;
            default:
                logger.warn("Non-supported link.method". method);
                break;
        }
        return menuItem;
    },
    /**
     * Handle field actions appserver "search" type data.
     * 
     * @param {Object} item Field actions 
     * @return Object literal following an individual menu item following menu builder convention or a null Object.
     * @type Object
     */
    searchMenuItem: function(item){
        var logger = Splunk.Logger.getLogger("Splunk.Module.EventsViewer.FieldAction.searchMenuItem");
        var menuItem = null;
        var requiredAttributes = ["label", "search.target", "search.search_string", "search.app", "search.view"];

        for(var i=0, j=requiredAttributes.length; i<j; i++){
            var requiredAttribute = requiredAttributes[i];
            if(!item.hasOwnProperty(requiredAttribute)){
                logger.info.warn("Missing required attribute", requiredAttribute);
                return menuItem;
            }
        }

        menuItem = {
            "callback": "onSearch",
            "label": item.label,
            "attrs": {
                "s:search.search_string": item["search.search_string"],
                "s:search.app": item['search.app'],
                "s:search.view": item['search.view'],
                "s:search.target": item['search.target']
            }
        };

        if (item.hasOwnProperty("search.preserve_timerange")) {
            menuItem["attrs"]["s:search.preserve_timerange"] = item['search.preserve_timerange'];
        }

        if (item.hasOwnProperty("search.earliest")) {
            menuItem["attrs"]["s:search.earliest"] = item["search.earliest"];
        }

        if (item.hasOwnProperty("search.latest")) {
            menuItem["attrs"]["s:search.latest"] = item["search.latest"];
        }

        return menuItem;
    },
    /**
     * An array of default field actions.
     * 
     * @param {String} fieldName The field name.
     * @param {String} fieldValue The field value.
     * @return An array of object literals following menu builder convention.
     * @type Array
     */
    fieldMenuDefaults: function(fieldName, fieldValue){
        var menuData = [];
        //tag
        var tagMenuItem = {
            "callback": "onTagField",
            "label": sprintf(_("Tag %(field_name)s=%(field_value)s"), {"field_name": fieldName, "field_value": fieldValue}),
            "attrs": {
                "s:fieldname": fieldName,
                "s:fieldvalue": fieldValue
             }
        };
        menuData.push(tagMenuItem);
        //report
        var reportMenuItem = {
            "callback": "onReportField",
            "label": _("Report on field"),
            "attrs": {
                "s:fieldname": fieldName,
                "s:fieldvalue": fieldValue
            }
        };
        menuData.push(reportMenuItem);
        return menuData;
    }
};
