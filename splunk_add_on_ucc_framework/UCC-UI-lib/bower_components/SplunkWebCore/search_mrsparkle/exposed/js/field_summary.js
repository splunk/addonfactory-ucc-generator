/*
 * The shape of things to come. 
 * These static methods on Splunk.Popup are going to ultimately become a class of modules like FormHelper modules. 
 * There will be:
 *    - some kind of method so other modules can get a reference to one when they need it  
 *    - if a module needs one of them,  the conf will reflect the dependency somehow (fail when the FormHelper module is absent).
 * main advantages are: 
 *    - css/js/html only imported in the views that need it
 *    - as modules they can have their own self contained and bundleable python endpoints
 * 
 * For now this is a straight class, and it looks a little like a module cause that's where it's going, but it's not a module yet.
 */
Splunk.Popup.FieldSummaryLayer = $.klass({
    search: null,
    popupLayer: null,
    fieldName: null,
    count: 0,
    distinctCount: 0,
    reportLinkViewTarget : null,
    
    reportLinkSelector:  ".reportLinks",
    fieldLinksContainer: ".fieldLinks",
    headerContainer:     ".fieldHeader",
    
    tbodySelector: ".popupContent table tbody",
    
    categoricalReportLabels : [_("Top values by time"), _("Top values overall")],
    numericalReportLabels   : [_("Average over time"), _("Maximum value over time"), _("Minimum value over time")],
    
    initialize: function(popupLayerTemplate, popupLayerContainer, reportLinkViewTarget ) {
        this.popupLayer = popupLayerTemplate.clone(); //make a copy of the dom element
        this.popupLayer.prependTo('body');
        this.reportLinkViewTarget = reportLinkViewTarget;
        
        this.logger = Splunk.Logger.getLogger("FieldSummaryLayer");

        // there could be two or modules on the page using this class. 
        // these instances themselves broadcast an event, and they will always defer to 
        // the most recently opened instance.
        $(document).bind('fieldSummaryOpened', function(event, fieldSummaryInstance) {
            if (fieldSummaryInstance !== this) {
                this.close();
            }
        }.bind(this));    
    },
    setField: function(search, fieldName, initialCount, initialDistinctCount, initialEventCount, isNumeric, customLinks, module) {
        this.search = search;
	this.module = module;
        this.fieldName = fieldName;
        this.count = initialEventCount;
        this.distinctCount = initialDistinctCount;
        this.eventCount = initialEventCount;
        this.customLinks = customLinks;
        // TODO - If we build them here we still need to pass in an isNumeric flag.  Or else build them on each render..
        this.buildReportLinks(isNumeric);
        this.updateFieldLinks(customLinks);
        this.updateHeader(10, isNumeric);
        
    },
    open: function(openerElement, onCancelled) {
        this.popupLayer.find('.splHeader h2').text("Loading...");
        var selection = this.popupLayer;
        selection.css("left",openerElement.offset().left + openerElement.outerWidth());
        selection.css("top", openerElement.offset().top);
        selection.css("visibility", "visible");
        selection.css('z-index','499');
        selection.show();
        var tbody = $(this.popupLayer).find(this.tbodySelector);
        tbody.html('');

        this.onCancelled = onCancelled || function() {};
        this.popupLayer.find('.splHeader .splIcon-close').click(this.close.bind(this));
        // trigger the event to any other open instances of this class will close themselves.
        $(document).trigger("fieldSummaryOpened", [this]);
    },
    close: function() {
        this.popupLayer.hide();
        if (this.onCancelled) this.onCancelled();
       
    },
    refresh: function(onRendered, onFieldValueClick, pageSize) {
        
        var args = {
            field_list:  this.fieldName,
            top_count: pageSize,
            min_freq: 0
        };
        $.ajax({
            type: "GET",
            url: this.search.getUrl('summary', args),
            dataType: "xml",
            error: function() {
                this.logger.error("Could not load FieldSummary");
            }.bind(this),
            complete: function(data, textStatus) {
                if (data.status==200) {
                    this.renderResults(data.responseXML, onRendered, onFieldValueClick, pageSize);
                }else if(data.status==204){
                	this.popupLayer.find(this.headerContainer).text(_("No field summary information."));
                }else if(data.status==404){
                    this.popupLayer.find(this.headerContainer).text(_("Could not retrieve field summary information. Check if the job has been canceled or expired."));
                }
            }.bind(this)
        });
    },
    renderResults: function(resultXML, onRendered, onFieldValueClick, pageSize) {
        if (onRendered) onRendered();
        this.eventCount = parseInt($(resultXML).find("summary").attr("c"), 10); 
        var fieldNode = $(resultXML).find("summary").find("field");

        // update count and distinctCount with the real values.
        this.distinctCount = parseInt(fieldNode.attr("dc"), 10);
        // treat as numeric if HALF or more of the occurences are considered numeric
        var isNumeric = (parseInt(fieldNode.attr("nc"), 10) > this.eventCount/2);
        
        // assert that the received fieldName matches the requested fieldName
        if (fieldNode.attr("k") != this.fieldName) {
            this.logger.error("Assertion failed - asked for " + this.fieldName + " and received " + fieldNode.attr("k"));
        }

        this.updateNumericalStats(fieldNode, isNumeric);
        //this.updateFieldLinks();
		
		
        this.updateHeader(pageSize, isNumeric);
        
        
        var colTitle = _('Values');
		if (pageSize) {
			var displayedCount = Math.min(pageSize, this.distinctCount);
			
			// the header is of marginal value if there's 10 or fewer
			if (this.distinctCount > displayedCount) {
				var displayText = _("Top %(pageCount)s values");
				var displayArgs = {pageCount: displayedCount, name: this.pluralizeNoun(this.fieldName)};
				colTitle = sprintf(displayText,displayArgs);
			} 
		}
         
         
        var tbody = $(this.popupLayer).find(this.tbodySelector);
        tbody.html('');
        //SPL-19396    If we dump all this complex percentage widths on all these
        // position relative/absolute divs,   the table rendering in firefox 2
        // goes insane.  
        tbody.hide();
        var moduleInstance = this;
        tbody.html('<tr class="fieldNameHeaderRow"><th class="fieldName">' + colTitle + '</th><th style="text-align:right;">#</th><th style="text-align:right;">%</th><th>&nbsp;</th></tr>');

        fieldNode.find("value").each(function(index) {
            moduleInstance.renderTableRowFromFieldNode(tbody, $(this), onFieldValueClick);
        });
        // second half of the fix for SPL-19396. And no, using .show() doesnt work.
        //tbody.show();
        if ($.browser.msie) tbody.css("display", "block");
        else tbody.css("display", "table-row-group");
        
        // check if we're offscreen, if so then shift up till we're in the viewport
        var posY = $(this.popupLayer).offset().top;
        var height = $(this.popupLayer).height();
        var wh = $(window).height();
        var wst = $(window).scrollTop();
        
        // if the viewport height + viewport scrollTop is less than the top offset of the popup plus its height..
        if ( wh + wst < posY + height ) { // oh god oh god oh god, we're offscreen at the bottom
            var diff = (posY + height) - (wh + wst) + 5; //get the difference between the two and add 5px for good measure
            
            if ( diff > 0 ) {
                var shiftUp = Math.max(posY - diff, 0);
                 // shift it up by the amount that it's overflowing the bottom
                $(this.popupLayer).animate({
                    top: shiftUp     
                }, "fast");
            }
        }
        
    },
    updateNumericalStats: function(fieldNode, isNumeric) {
        var container = $(".numericalStats", this.popupLayer);
        container.html('');
        

        if (isNumeric) {
            var numericalStats = [
                {key: "min", label:_("Min")},
                {key: "max", label:_("Max")},
                {key: "mean", label:_("Mean")},
                {key: "stdev", label:_("Stdev")}
            ];
            for (var i=0; i<numericalStats.length; i++) {
                numericalStats[i].value = format_number(fieldNode.find(numericalStats[i].key).text());
                $("<span>").html(sprintf(_("<b>%(label)s</b>: %(value)s"), numericalStats[i])).appendTo(container);
            }
        }
    },
    updateHeader: function(pageSize, isNumeric) {
        var suffix = (isNumeric) ? _(" (numeric)") : _(" (categorical)");
        this.popupLayer.find('.splHeader h2').text(this.fieldName + suffix);
      
    },
    updateFieldLinks: function(customLinks) {
        var container = $(this.fieldLinksContainer, this.popupLayer);
        container.html('');
        // these are the 'add field to FieldPicker',   'narrow results to events containing this field' etc...
        if (customLinks) {    
            for (var i=0,len=customLinks.length; i<len; i++) {
                container.append(customLinks[i]);
            }
        }
    },
    renderTableRowFromFieldNode: function(tbody, fieldNode, onFieldValueClick) {
        var fieldValue          = fieldNode.find("text").text();
        var count               = fieldNode.attr("c");
        var percentage          = Math.round(100 * count / this.eventCount);
        
        // stupid calculation foo to figure out by how much to trim the fieldValue based on the length of the count in chars
        // we want the total length to be 36 chars, so figure out how many chars in the count, and subtract from 30 ( 36 minus the 2 paren chars, the ellipses, and a space)
        var countLength = count.toString().length;
        if ( (fieldValue.length + countLength) > 33 ) {
            var trimToLength = (30 - parseInt(countLength,10));
            var trimmedFieldValue = Splunk.util.smartTrim(fieldValue, trimToLength);
        } else {
            trimmedFieldValue = fieldValue;
        }
        
        // ghetto rounding to 2 decimal places.
        percentage = Math.round(100 * percentage) / 100;

        // make sure that we never draw more than 100%.
        percentage = Math.min(percentage, 100);
        
        var graphBar = $('<div class="splBarGraphBar"></div>').css('width', percentage + '%');   //set the width to percent of top val
        //var graphVal = $('<div class="splBarGraphValue"></div>').text(format_percent(count / this.eventCount));       //set the % value to be displayed here

        var graph = $('<div class="splBarGraph"></div>').append(graphBar); //.append(graphVal);
        
        var graphCell = $('<td class="fieldValueGraphCell"></td>').append(graph);
        var graphFieldName = $('<a></a>').attr('href','#').text(trimmedFieldValue);
        var graphHeader = $('<th></th>').addClass("fieldName").append(graphFieldName).attr('title',fieldValue);
        var graphRow = $('<tr></tr>');
        graphRow.append(graphHeader); // field name
        graphRow.append($("<td></td>").text(format_number(count))); // field count
        graphRow.append($("<td></td>").text(format_percent(count / this.eventCount))); // percentage
        graphRow.append(graphCell);
        if (onFieldValueClick) {
            graphRow.click(function(evt) {
                onFieldValueClick(evt, this.fieldName, fieldValue);
		this.close();
                return false;
            }.bind(this));
        }
        tbody.append(graphRow);
    },
    /*
     * behind the scenes, or "how 'showing 1-10 of 1,232 sourcetypes' got his 's'"
     * useful utility that takes an english noun and makes it plural
     * Note that outside of the english locales we return a generic localized version.
     */
    pluralizeNoun: function(nounStr) {
        if (!nounStr.length) return nounStr;

        var fallback = sprintf(_("values of %s "), nounStr);

        // seems weird to say  '17 as'  or '28341 ips'
        if (nounStr.length < 3) return fallback;
        else if (Splunk.util.getConfigValue('LOCALE', 'en-US').indexOf("en-") != 0 ) {
            return fallback;
        }

        var lastChar = nounStr.charAt(nounStr.length - 1);
        var lastTwoChars = nounStr.substring(nounStr.length - 2);

        // terminal chars that are just too problematic. punt.
        if (lastChar in {"s":1,"z":1,"y":1}) {
            return fallback;
        }
        if (lastTwoChars in {"ch":1, "sh":1, "ex":1}) {
            return nounStr + "es";
        }
        return nounStr + "s";
    },

    /*
     * useful method that takes fieldName and distinctCount and pluralizes as necessary.
     */
    buildCountAndNoun: function() {
        if (this.distinctCount == 1) {
            return this.distinctCount + " " + this.fieldName;
        } else {
            return this.distinctCount + " " + this.pluralizeNoun(this.fieldName);
        }
    },
    /*
     * Sets up the relevant accelerator links to take the user into report builder
     */
    buildReportLinks: function(isNumeric) {
        // TODO - with sendToView refactoring now nobody uses our windowName property so im commenting it out.
        //var windowName = this.reportLinkViewTarget + "_popup";
        var fallbackURL = Splunk.util.make_url("app", Splunk.util.getCurrentApp(), this.reportLinkViewTarget);

        var moduleInstance = this;
        
        var container = $(this.reportLinkSelector, this.popupLayer).html('<h4>' + _('Charts') + ' </h4>');
            
        var labelSet = (isNumeric) ? this.numericalReportLabels.concat(this.categoricalReportLabels) : this.categoricalReportLabels;
        for (var i=0; i<labelSet.length; i++) {
            var label = labelSet[i];
            var anchor = $('<a></a>');
            anchor.text(label);
            anchor.attr("rel", "popup");        // best practices markup. Might help us with some popup blockers somewhere.
            anchor.attr("href", fallbackURL);   // the URL we initially load, that will be changed when the POST to parse returns.
                //.attr("target", windowName)  // set the windowName.
           anchor.click(function(event) {
                    event.preventDefault();
                    try{
                        moduleInstance.launchReportLink($(this).text());
                    } catch(e) {
                        moduleInstance.logger.error(e);
                        moduleInstance.logger.error("error launching report link");
                    }
                    return false;
                }).appendTo(container);
        }
        //$(this.reportLinkSelector, this.popupLayer).append(container);
    },
    /**
     * Click handler for the report builder accelerator links.
     */
    launchReportLink: function(label) {
	
        var args = {
            base_sid: this.search.job.getSearchId()
        };
        var linkSearch = this.search.clone();
        
        var eventSearch = linkSearch.job.getEventSearch();
        linkSearch.abandonJob();
	
	if (!this.module) {
	    linkSearch.setBaseSearch(eventSearch);
	    linkSearch.addIntention(this.getIntentionForReportLink(label, this.fieldName));
	    linkSearch.sendToView(this.reportLinkViewTarget, args, true, true, {autosize: true});
	    return false;
	}
	
	var escapedField = Splunk.util.searchEscape(this.fieldName);
	var reportSearch = null;
	var chartType = null;
	switch (label) {
            //  ie 'Values over time'
            case this.categoricalReportLabels[0]:
		reportSearch = "timechart count by " + escapedField;
		chartType = "line";
		break;
            //  ie 'Top overall values'
            case this.categoricalReportLabels[1]:
		reportSearch = "top limit=10000 " + escapedField;
		chartType = "bar";
		break;
            case this.numericalReportLabels[0]:
		reportSearch = "timechart avg(" + escapedField + ")";
		chartType = "line";
		break;
            case this.numericalReportLabels[1]:
		reportSearch = "timechart max(" + escapedField + ")";
		chartType = "line";
		break;
            case this.numericalReportLabels[2]:
		reportSearch = "timechart min(" + escapedField + ")";
		chartType = "line";
		break;
		    default:
		// no-op
		break;
	}

	if (reportSearch) {
	    linkSearch = new Splunk.Search($.trim(eventSearch) + " | " + reportSearch);
	    var context = new Splunk.Context();
	    context.set("search", linkSearch);
	    
	    context.set("charting.chart", chartType);

	    var parent = this.module;
	    while (parent.parent) {
		parent = parent.parent;
	    }
	    
	    parent.baseContext = context;
	    parent.onContextChange();
	    parent.pushContextToChildren();
	}

        //linkSearch.sendToView(this.reportLinkViewTarget, args, true, true, {autosize: true});

	this.close();
        return false;
    },
    /**
     * Until the day when the report builder links are configurable, 
     * The mapping of link-label to plot intention is hardcoded here.
     */
    getIntentionForReportLink: function(label, fieldName) {
        switch (label) {
            //  ie 'Values over time'
            case this.categoricalReportLabels[0]:
                return {"name": "plot", "arg": {"mode": "timechart", "fields" : [["count", "__events"]], "splitby": fieldName}};
            //  ie 'Top overall values'
            case this.categoricalReportLabels[1]:
                return {"name": "plot", "arg": {"mode": "top", "limit" : 10000, "fields": [fieldName]}};
            case this.numericalReportLabels[0]:
                return {"name": "plot", "arg": {"mode": "timechart", "fields" : [["avg", fieldName]]}};
            case this.numericalReportLabels[1]:
                return {"name": "plot", "arg": {"mode": "timechart", "fields" : [["max", fieldName]]}};
            case this.numericalReportLabels[2]:
                return {"name": "plot", "arg": {"mode": "timechart", "fields" : [["min", fieldName]]}};
            default:
                this.logger.error("no intention for label=", label, " fieldName=", fieldName);
                break;
        }
        return false;
    }
});


/**
 * Future replacement for Splunk.Popup.FieldSummaryLayer.
 */
Splunk.Popup.FieldSummaryLayerTwo = $.klass({
    URL_PATTERN: "/field/summary/%(sid)s/%(fieldName)s",
    POPUP_SELECTOR: ".fieldValuePopup",
    /**
     * Constructor
     * 
     * @param {String} sid The current job sid.
     * @param {String} fieldName The field name.
     * @param {Object} target DOM element reference to the parent target of where all content will be appended.
     * @param {DOM} opener A DOM element reference to the opener. 
     * @param {Function} dispatcher A dispatch handler to receive all events.
     * Sample dispatcher:
     *     myDispatcher: function(arg) {
     *        switch(arg.type) {
     *            case "search":
     *                if (arg.event.altKey) {
     *                    arg.intention.name = "negateterm";
     *                }
     *                var context = new Splunk.SearchContext("*");
     *                context.addIntention(arg.intention);
     *                this.passContextToParent(context);
     *                break;
     *            case "report":
     *                var context = this.getBaseContext();
     *                var args = {
     *                    base_sid: context.job.getSearchId()
     *                }
     *                var linkContext = context.clone();
     *                var eventSearch = linkContext.job.getEventSearch();
     *                linkContext.abandonJob();
     *                linkContext.setBaseSearch(eventSearch);
     *                linkContext.addIntention(arg.intention);
     *                linkContext.sendToView(this.reportLinkTarget, args, true, true, {autosize: true});
     *                break;
     *            case "close":
     *                break;
     *            default:
     *                break;
     *        }
     *        this.fieldSummaryLayer2.hide();
     *        this.fieldSummaryLayer2 = null;    
     *        return false;
     *    }
     * @param {Object} options (Optional) An object literal representing options.
     *        {Boolean} animateOpen Control if the layer is animated on open or not. Defaults to false.
     *        {Boolean| positionFromChild Is the popup positioned from within a child container. Defaults to the body.
     */
    initialize: function(sid, fieldName, target, opener, dispatcher, options) {
        this.logger = Splunk.Logger.getLogger("Splunk.FieldSummary");
        this.sid = sid;
        this.target = $(target);
        this.opener = $(opener);
        this.dispatcher = dispatcher;
        this.options = options || {};
        this.url = Splunk.util.make_url(sprintf(this.URL_PATTERN, {sid: this.sid, fieldName: encodeURIComponent(fieldName)}));
    },
    /**
     * Top level UI event listener and dispatcher. Normalizes to a standard  argument sent to observer.
     * Passes an argument object having event (Object), type {String} and intention {Object} attributes.
     * 
     * @param {Object} event A DOM event.
     * @type Boolean
     * @return Cancel (false) or enable (true) the propagation of this event.
     */
    onUIEvent: function(event) {
        var reportSearch;
        var chartType;
        var eventType = event.type;
        var eventTarget = $(event.target);
        var type = eventTarget.attr("s:type");
        if (eventType=="click" && type) {
            var intention = eventTarget.attr("s:intention") || null;
            if (intention) {
                try {
                    intention = JSON.parse(intention);
                } catch(e) {
                    this.logger.error("Could not serialize intention", e);
                    return false;
                }
                if (intention.hasOwnProperty("arg")) {
                    for (var i in intention.arg ) {
                        intention.arg[i] = intention.arg[i];
                    }
                }
            } else {
                intention = {};
            }
            reportSearch = eventTarget.attr("s:reportsearch");
            chartType = eventTarget.attr("s:charttype");
            return this.dispatcher({"type":type, "intention":intention, "event":event, "reportSearch": reportSearch, "chartType": chartType});
        }
    },
    /**
     * Show a field summary layer.
     */
    show: function() {
        $.ajax({
            type: "GET",
            url: this.url,
            dataType: "html",
            error: function() {
                this.logger.error(sprintf(_("Could not load %(url)s"), {url: this.url}));
            }.bind(this),
            complete: function(data, textStatus) {
                if (data.status==200) {
                    this.renderResults(data.responseText);
                } else {
                    this.logger.error(sprintf(_("Invalid status code for %(url)s"), {url: url}));
                }
            }.bind(this)
        });
    },
    /**
     * Hide a field summary layer.
     */
    hide: function() {
        this.target.html("");
        var popup = $(this.POPUP_SELECTOR, this.target);
        popup.css("visibility", "hidden");
    },
    /**
     * Handle the rendering of a field layer HTML block.
     * 
     * @param {String} html Delicious html nugget.
     */
    renderResults: function(html) {
        this.target.html(html);
        var popup = $(this.POPUP_SELECTOR, this.target);
        popup.bind("click", this.onUIEvent.bind(this));
        popup.css("visibility", "visible");
        this.position(popup);
    },
    /**
     * Positional nudge.
     * 
     * NOTICE!!! copy/paste of original positional logic.
     * 
     * @param {Object} popup A JQuery casted element reference to the popup.
     */
    position: function(popup){
        var startTop = (this.options.positionFromChild)?this.opener.position():this.opener.offset().top;
        popup.css("left", this.opener.offset().left + this.opener.outerWidth()).css("top", startTop);
        var tbody = $(popup).find('.popupContent table tbody');
        if ($.browser.msie) tbody.css("display", "block");
        else tbody.css("display", "table-row-group");
        
        // check if we're offscreen, if so then shift up till we're in the viewport
        var posY = popup.offset().top;
        var height = popup.height();
        var wh = $(window).height();
        var wst = $(window).scrollTop();

        // if the viewport height + viewport scrollTop is less than the top offset of the popup plus its height..
        if ( wh + wst < posY + height ) { // oh god oh god oh god, we're offscreen at the bottom
            var diff = (posY + height) - (wh + wst) + 5; //get the difference between the two and add 5px for good measure
            //check if we have a parent with overflow:hidden and if we'll be sliding up too far and getting our head chopped off
            //  (note: we will hit this case in flashtimeline, so this check is necessary
            
            if(this.options.positionFromChild){
                var pwo = popup.parents().filter(function(){
                    return $(this).css('overflow') == 'hidden'; 
                }).filter(":first"); //get the first parent with overflow:hidden
            
                if ( pwo.length ) {  // we have at least one parent with overflow hidden, make sure it won't decapitate
                    var pwoTop = pwo.offset().top;
                    if ( pwoTop > (posY - diff)) { //off with his head.
                        var d = posY - pwoTop;
                        diff = (d > 0) ? d : 0;            
                    }
                }
            }
            
            if ( diff > 0 ) {
                // shift it up by the amount that it's overflowing the bottom
                var shiftUp;
                if (this.options.animateOpen) {
                    shiftUp = "-=" + diff + "px";  //put it in the format .animate likes for animating scrolltop
                    popup.animate({
                        top: shiftUp     
                    }, "fast");
                } else {
                    shiftUp = Math.max(posY - diff, 0);
                    popup.css("top", shiftUp);
                }
            }
        }        
    }
});
