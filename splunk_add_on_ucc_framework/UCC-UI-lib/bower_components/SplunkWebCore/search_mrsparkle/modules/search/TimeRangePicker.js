//put Module in the namespace if it isnt already there.

Splunk.namespace("Module");

Splunk.Module.TimeRangePicker = $.klass(Splunk.Module, {

    EARLIEST_TIME_ATTR: 'earliest_time',
    LATEST_TIME_ATTR: 'latest_time',
    ALL_TIME_LABEL: _('All time'),
    CUSTOM_TIME_LABEL: _('Custom time'),
    DATEPICKER_CLASS: 'customDateTime',
    
    DATE_RANGE_ERROR_MSG: _('Earliest time must be before latest time'),
    
    // activator text
    DATE_RANGE_TEXT: _('Date range'),
    DATES_BEFORE_TEXT: _('All dates before'),
    DATES_AFTER_TEXT: _('All dates after'),

	// define sequence order among user-defined times before where to insert
	// the custom controls
	CUSTOM_DATE_SEAM: 500,

    _timeZone: null,

    _selectedRange: null,
    _menu: null,
    _activator: null,
    
    // lazy checker to see if we've moved the popup dom to be a first-child of body yet
    _haveMovedPopupDom: false,
    
    // storage for the Date() instances we made from the dates the user picked. 
    // since these are in the browser's timezone, they are DEEPY UNTRUSTWORTHY
    _customEarliestDate: null,
    _customLatestDate: null,
    
    // pointers to timespinner objects for custom date/times
    _earliestTime: null,
    _latestTime: null,

    _datePickerMode: false,
    
    _customDateTimePopup: false,
    
    
    /**
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        this.logger = Splunk.Logger.getLogger("time_range_picker.js");

        this._timeZone = new splunk.time.SplunkTimeZone(Splunk.util.getConfigValue("SERVER_ZONEINFO"));

        this._activator = $('.timeRangeActivator', this.container);

        var FALLBACK_MENU_DICT = [{"style": "timeRangePreset", "attrs": {}, "label": _("Error: Failed to load configured time ranges.")}];
        
        // read in time ranges from mako-generated template
        try {
            this._menuDict = this._params.timeRangeJson;
        } catch(e) {
            this.logger.error(e + ", " + e.message);
        }
        if (!this._menuDict) {
            this._menuDict = FALLBACK_MENU_DICT;
        }

        // insert custom time item
        var cust = this._buildCustomDateItem();
        this._menuDict.push(cust);
        
        // set references to custom popup 
        this._customDateTimePopup = $('.trpCustomDateTime', this.container); // reference to popup dom
        this._customDateTimePopupObj = null; // reference to popup object
        
        // set up custom time popup
        this._setupCustomDateTime();
	
        // build menu
        this._menu = new Splunk.MenuBuilder({
            containerDiv: this.container,
            menuDict: this._menuDict,
            activator: this._activator.parent('.timeRangeActivatorWrapper'),
            menuClasses: 'splMenu-primary timeRangeMenu'
        });
       
        var selectedLabel = this.getParam('selected');
        // overwrite the old deprecated 'selected' param with the new standard 'default' param, if it's present.
        if (this._params.hasOwnProperty("default")) {
            selectedLabel = this.getParam('default');
        }
        var menuReference = this._menu.getMenu();
        menuReference.click(this._onMenuClick.bind(this));
        
        var matchedSomePreset = false;
        if (selectedLabel) {
            var moduleInstance = this;
            menuReference
                .find('.timeRangePreset a').each(function(){
                    //var thisText = $(this).text().toLowerCase();
                    var thisText = moduleInstance._getRawLabel($(this).text()).toLowerCase();
                    if (thisText == selectedLabel.toLowerCase()) {
                        matchedSomePreset = true;
                        moduleInstance._activator.text($(this).text());
                        moduleInstance._setSelectedRangeToPreset($(this));
                    }
                });
        }
        // we didnt match anything
        if (!matchedSomePreset) {
            // but we expected to...
            if (selectedLabel) {
                this.logger.error(this.moduleType, " specified a selected timeRange in its config, (", selectedLabel, ") but that is not a valid option");
                this._activator.text(this.ALL_TIME_LABEL);
            } else {
                this._activator.text(this.ALL_TIME_LABEL);
            }
        } 
        
        // this is a fix for a bug introduced in jquery-ui.1.7.2 whereby the datepicker fires a mouseover event.
        // the mouseover triggers the submenu show, so submenus are already open when the timeRangePicker opens
        this._menu.hideSubMenus();   
    },

    /**
     * Returns the built-in english version of the translated time string
     */
    _getRawLabel: function(translatedTime) {

        for (var key in this._menuDict) {
            if (this._menuDict.hasOwnProperty(key)) {

                // if this item is a submenu, we go inside and iterate over all it's items.
                if (this._menuDict[key].hasOwnProperty("items")) {
                    var subMenu = this._menuDict[key]["items"];
                    for (var subKey in subMenu) {
                        if (translatedTime == subMenu[subKey]['label']) {
                            return subMenu[subKey]['rawLabel'];
                        }
                    }
                }
                // otherwise this is a plain old timeRangePreset, and we check for a match.
                else {
                    if (translatedTime == this._menuDict[key]['label']) {
                        return this._menuDict[key]['rawLabel'];
                    }
                }
            }
        }

        return '';
    },
    /**
     *  Set up custom date time popup. Setup radio switching for date range/relative/advanced switching, and attach handlers for popup buttons
     */
    _setupCustomDateTime: function() {
        // set up panel switching 
        var context = this;
        $('.rangeType input[type="radio"]', this._customDateTimePopup).click(function(){
            var justSelected = '.' + $(this).val();
            
            $('.visibleDateTimePanel', context._customDateTimePopup)
                .removeClass('visibleDateTimePanel')
                .fadeOut('fast', function(){
                    $('.dateTimePanel', context._customDateTimePopup).css('display','none');
                    $(justSelected, context._customDateTimePopup).fadeIn('fast').addClass('visibleDateTimePanel');
                });				
		});
 		
 		// set up the date range mode
 		this._setupDateRangeMode();
 		
 		// set up the relative mode
 		this._setupRelativeMode();
 		
 		// set up the realtime mode
 		this._setupRealtimeMode();
 		
 		// set up the advanced mode
 		this._setupAdvancedMode();
        
        // set up button handlers
        $('.trpApply', this._customDateTimePopup).click(this._onApplyClick.bind(this));
        $('.trpCancel', this._customDateTimePopup).click(this._onCancelClick.bind(this));
    },
    /**
     * Set up custom date/time date range mode.  Assign event handlers for radio switching, setup datepickers, timespinners, and perhaps a pony 
     */
    _setupDateRangeMode: function() {
        // set up specific / absolute time switcher ('specific date' v. 'now')
        $('.earliestSpecificDateRadio', this._customDateTimePopup).click(function(){
            this._enableDateTime('.earliestDateTime');
        }.bind(this));
        $('.earliestDateRadio', this._customDateTimePopup).click(function(){
            this._disableDateTime('.earliestDateTime');
        }.bind(this));
        $('.latestSpecificDateRadio', this._customDateTimePopup).click(function(){
            this._enableDateTime('.latestDateTime');
        }.bind(this));
        $('.nowDateRadio', this._customDateTimePopup).click(function(){
            this._disableDateTime('.latestDateTime');
        }.bind(this));
        
        var module = this;

        // datepicker has been configured for the right locale at this point, so use its date format
        var dateFormat = $.datepicker._defaults['dateFormat'];

        var defaultDate = new Date(); // latest date defaults to today (at 00:00:00.000)        
        $('.latestDate', this._customDateTimePopup).val($.datepicker.formatDate(dateFormat, defaultDate));

        defaultDate.setDate(defaultDate.getDate()-1); // earliest defaults to yesterday (at 00:00:00.000)
        $('.earliestDate', this._customDateTimePopup).val($.datepicker.formatDate(dateFormat, defaultDate));
        
        // set up datepickers
        $(this._customDateTimePopup).find('.earliestDate').datepicker({
            currentText: '',
            defaultDate: defaultDate,
			prevText: '',
			nextText: ''
        });
        $(this._customDateTimePopup).find('.latestDate').datepicker({
            currentText: '',
			prevText: '',
			nextText: ''
        });        
        
        // set up timespinners 
        this._earliestTime = new Splunk.TimeSpinner($('.earliestTime', this._customDateTimePopup));
        this._latestTime = new Splunk.TimeSpinner($('.latestTime', this._customDateTimePopup));
    },
    /**
     *  Setup custom date/time relative mode.  Assign event handlers to change event on selects, restrict input to numbers for relative value, and set the
     *      display of relative time for user to view their selection as a string.
     */
    _setupRelativeMode: function() {
        var module = this; // maintain ref to object while allowing us to use jquery scoped 'this'
        
        // changing the relative unit changes the relative snap to match
        $('.relativeMode select.relativeUnit', this._customDateTimePopup).change(function(){
            if ( $('.relativeSnap option:selected', this._customDateTimePopup).val() != 'none' ) {
                var selectedVal = $('.relativeUnit option:selected', module._customDateTimePopup).val();
                $('.relativeSnap', module._customDateTimePopup).val(selectedVal);
            }
            module._setRelativeDisplays();
        }); 
        // update displayed string on changes
        $('.relativeMode select.relativeSnap', this._customDateTimePopup).change(function(){
            module._setRelativeDisplays();
        });
        $('.relativeMode input', this._customDateTimePopup).keyup(function () { 
            // restrict to only numeric input
            this.value = this.value.replace(/[^0-9\.]/g,'');
            //update displayed string on change
            module._setRelativeDisplays();
        }); 
        
        // initialize relative displayed string on setup
        this._setRelativeDisplays();
    },
    /**
     *  Function to handle updating the relative string displays
     */
    _setRelativeDisplays: function() {
         var relativeString = this._buildRelativeString();
        this._setRelSearchLangEquivalent(relativeString);
        this._setRelativeRealLangStringDisplay(relativeString);
     },
     /**
     *  Function to build a relative time string from the values entered in the relative pane of the custom date/time popup.  returns relative string.
     */
    _buildRelativeString: function() {
        var val = parseInt($('.relativeValue', this._customDateTimePopup).val(),10) || 0;
        var unit = $('.relativeUnit option:selected', this._customDateTimePopup).val() || 's';
        
        // build snap value
        var snap = '';
        if ( $('.relativeSnap option:selected', this._customDateTimePopup).val() != 'none' ) {
            snap = '@' + $('.relativeSnap option:selected', this._customDateTimePopup).val();
        }
        
        var relativeString = '-' + val + unit + snap;
        
        return relativeString;
    },
    /**
     *  Function to display relative string to user as they build it.
     */
    _setRelSearchLangEquivalent: function(relativeString) {
        $('.relativeEffectives .searchLangEquivalent', this._customDateTimePopup).html(relativeString);
    },
    /**
     *  Function to display relative time string in human language form
     */
    _setRelativeRealLangStringDisplay: function(relativeString){
        $.getJSON(Splunk.util.make_url('/util/time/parser?ts='+relativeString), function(jsonObject) { 
            var effectiveRange = _('Invalid relative string');
            var effectiveIso = '';
            if ( jsonObject[relativeString] ) {
                effectiveRange = jsonObject[relativeString].localized + " - " + _('(now)');
                effectiveIso = jsonObject[relativeString].iso;
            } 
            $('.relativeEffectives .effectiveRange', this._customDateTimePopup).html(effectiveRange).attr('title',effectiveIso);            
        });
    },
     /**
     *  Setup custom date/time realtime mode.  Assign event handlers to change event on selects, restrict input to numbers for realtime value, and set the
     *      display of realtime for user to view their selection as a string.
     */
    _setupRealtimeMode: function() {
        var module = this; // maintain ref to object while allowing us to use jquery scoped 'this'
        
        // changing the realtime unit updates search equivalent
        $('.realtimeMode select.rollingWindowUnit', this._customDateTimePopup).change(function(){
            module._setRealtimeDisplays();
        }); 
        // update displayed string on changes
        $('.realtimeMode input', this._customDateTimePopup).keyup(function () { 
            // restrict to only numeric input
            this.value = this.value.replace(/[^0-9\.]/g,'');
            //update displayed string on change
            module._setRealtimeDisplays();
        }); 
        
        // initialize realtime displayed string on setup
        this._setRealtimeDisplays();
    },
    /**
     *  Function to handle updating the realtime string displays
     */
    _setRealtimeDisplays: function() {
        var realtimeString = this._buildRealtimeString();
        this._setRealtimeSearchLangEquivalent(realtimeString);
     },
    /**
     *  Function to build a realtime time string from the values entered in the realtime pane of the custom date/time popup.  returns realtime string.
     */
    _buildRealtimeString: function() {
        var val = parseInt($('.rollingWindowSize', this._customDateTimePopup).val(),10) || 0;
        var unit = $('.rollingWindowUnit option:selected', this._customDateTimePopup).val() || 's';
        
        var realtimeString = 'rt-' + val + unit;
        
        return realtimeString;
    },
    /**
     *  Function to display realtime string to user as they build it.
     */
    _setRealtimeSearchLangEquivalent: function(realtimeString) {
        $('.realtimeEffectives .searchLangEquivalent', this._customDateTimePopup).html(realtimeString);
    },
    /**
     *  Setup custom date/time advanced mode.    
     */
    _setupAdvancedMode: function() {
        var context = this; // reduce bind(this) calls
        // display human language versions when they blur an input or after they wait 1.5 seconds without typing
        var advancedStartTimer = null;
        var advancedEndTimer = null;
        $('.advancedStart', this._customDateTimePopup).bind('blur', function(){
            clearTimeout(advancedStartTimer);
            context._setAdvancedRealLanguage('start');
        }).bind('keyup', function() {
            clearTimeout(advancedStartTimer);
            advancedStartTimer = setTimeout(function(){context._setAdvancedRealLanguage('start');}, 1500);
        });
        $('.advancedEnd', this._customDateTimePopup).bind('blur', function(){
            clearTimeout(advancedEndTimer);
            context._setAdvancedRealLanguage('end');
        }).bind('keyup', function() {
            clearTimeout(advancedEndTimer);
            advancedEndTimer = setTimeout(function(){context._setAdvancedRealLanguage('end');}, 1500);
        });
    },
    /**
     *  Function to take entered advanced start and advanced end value and convert to human readable
     */
    _setAdvancedRealLanguage: function (whichAdvanced) {
        var advancedVal;
        var toUpdate;
        if ( whichAdvanced == 'start' ){
            advancedVal = Splunk.util.trim($('.advancedStart', this._customDateTimePopup).val());
            toUpdate = $('.advancedEffectiveStart', this._customDateTimePopup);
        } else if ( whichAdvanced == 'end' ){
            advancedVal = Splunk.util.trim($('.advancedEnd', this._customDateTimePopup).val());
            toUpdate = $('.advancedEffectiveEnd', this._customDateTimePopup);
        } else {
            this.logger.error("TimeRangePicker: _setAdvancedRealLanguage called without a flag switch.");
            return;
        }        
        
        if ( !advancedVal ) {
            return;
        }
        
        var url = Splunk.util.make_url('/util/time/parser?ts='+encodeURIComponent(advancedVal));
        
        $.getJSON(url, function(jsonObject) {
            var effectiveVal = _('Invalid time string');
            var effectiveIso = '';
           
            if ( jsonObject[advancedVal] ) {
		if (advancedVal.substr(0,2) == 'rt') {
		    effectiveVal = jsonObject[advancedVal].iso; }
		else {
                    effectiveVal = jsonObject[advancedVal].localized; }

                effectiveIso = jsonObject[advancedVal].iso;
            }
            
            toUpdate.html(effectiveVal).attr('title', effectiveIso);
        });
        
    },
    /**
     *  Function to build json struct for a custom datepicker item.  Returns json dict. 
     */
    _buildCustomDateItem: function() {
        var customDateItem = {
                "label" : _('Custom time...'),
                "style" : "customDateItem",
                "callback" : function(){this._popCustomDateTime();}.bind(this)
        };

        return customDateItem;
    },
    /**
     *  Function to move popup dom to body tag and create an inline popup (show it) 
     */
    _popCustomDateTime: function() {
        if ( !this._haveMovedPopupDom ) {
            this._customDateTimePopup.appendTo('body');
            this._haveMovedPopupDom = true;
        }
        
        this._customDateTimePopupObj = new Splunk.Popup(this._customDateTimePopup, {
            title: _('Custom Time Range'),
            pclass: 'trpCustom',
            inlineMode: true,
            onDestroy: this._onPopupDestroy.bind(this)
        });      
    	//focus on first input
       	$('input:visible:enabled:first', this._customDateTimePopup).focus();
    },
    /**
     *  Function fired when custom date/time popup is destroyed.  Moves popup framework back inside module 
     */
     _onPopupDestroy: function() {
        //this._customDateTimePopup.appendTo(this.container);
        
        this._customDateTimePopupObj = null; 
    },
    /**
     *  Function to enable date/time entry fields for a custom date/time
     */
     _enableDateTime: function(el){    
        // removed disabled attr, enable the datepicker
        $(el, this._customDateTimePopup).find('.customDate').datepicker('enable');   
        
        // enable timespinner
        $(el, this._customDateTimePopup).find('input').prop('disabled', false);
        
        // remove disabled classes from wrapper
        $(el, this._customDateTimePopup).removeClass('dateTimeDisabled');
    },
    /**
     *  Function to disable date/time entry fields for a custom date/time
     */
    _disableDateTime: function(el){    
        // add disabled attr, disable the datepicker
        $(el, this._customDateTimePopup).find('.customDate').datepicker('disable');   
        
        // disable timespinner
        $(el, this._customDateTimePopup).find('input').prop('disabled', true);
        
        // add disabled classes from wrapper
        $(el, this._customDateTimePopup).addClass('dateTimeDisabled');
    },
    /**
     *  Function fired when 'apply' clicked in custom date/time popup.  Will destroy popup if _applyCustomDateTime returns true
     */
    _onApplyClick: function() {
        if ( this._applyCustomDateTime() ) {
            this._customDateTimePopupObj.destroyPopup();
        }        
    },
    /**
     *  Function to handle a 'cancel' click in custom date/time popup
     */
    _onCancelClick: function() {
        this._customDateTimePopupObj.destroyPopup();
    },
    /**
     *  Function to apply custom date changes.  returns true to close popup, false to leave it open (on error) 
     */
    _applyCustomDateTime: function() {
        
        var toDate = null;
        var fromDate = null;
        var errMsg = null;
        
        // figure out which mode we're in based on the state of the radio buttons
        var mode = $('.rangeType input[type="radio"]:checked', this._customDateTimePopup).val();

        switch(mode) {
            /*-- relative mode --*/
            case 'relativeMode':
                // get the relative string
                var relativeString = this._buildRelativeString();            
                
                // apply the relative string
                this._fireCustom(relativeString, 'now');
                        
                // return true to close the popup        
                return true;
            
                break;
                
            /*-- realtime mode --*/
            case 'realtimeMode':
                // get the realtime string
                var realtimeString = this._buildRealtimeString();            
                
                // apply the realtime string
                this._fireCustom(realtimeString, 'rt');
                        
                // return true to close the popup        
                return true;
            
                break;
                
            /*-- advanced mode --*/
            case 'advancedMode':
                var earliest = $('.advancedStart', this._customDateTimePopup).val() || null;
                var latest = $('.advancedEnd', this._customDateTimePopup).val() || null;
                
                // apply advanced custom earliest/latest
                this._fireCustom(earliest, latest);
                
                return true;
                
                break;
                
            default:  // assuming this is date mode.  This could also be that the radio isn't checked at all, which is problematic.  best to guess it's a 
                      // date mode as we'll most likely have defaults set that will at least not explode.  
                /*-- date mode --*/
    
                // earliest
                //  if specific checked, get value else leave null
                if ( !$('.earliestDateTime', this._customDateTimePopup).is('.dateTimeDisabled') ){
                    fromDate = this._getDateWithTime('.earliestDate', '.earliestTime');    
                }
                
                // latest
                //  if specific checked get value else leave null        
                if ( !$('.latestDateTime', this._customDateTimePopup).is('.dateTimeDisabled') ){
                    toDate = this._getDateWithTime('.latestDate', '.latestTime');    
                }
                
                // check that earliest is before latest
                if ( fromDate && toDate && (fromDate > toDate) ) {
                    this._showDatepickerError(this.DATE_RANGE_ERROR_MSG);  
                    return false;
                } else {
                    this._clearDatepickerErrors(); // clear any errors if there were any
                    this._datePickerMode = true;
                    this._customEarliestDate = fromDate;
                    this._customLatestDate = toDate;
                    
                    this._setActivatorText(fromDate, toDate); // set activator text using toDate and fromDate
                    this._fireAbsolute(fromDate, toDate);
                    
                    return true;
                }            
            
                break;                
                        
        }
               
    },
    /**
     *  Function to create TimeRange object and push context to children (or setContextFreshness).  Takes an earliest and latest string.
     */
    _fireCustom: function(earliest, latest) {
        this._selectedRange = new Splunk.TimeRange(earliest, latest);
        $('body').trigger('menuOpening');

        var search = this.getModifiedContext().get("search");
        var range = search.getTimeRange();
        
        if (Splunk.util.normalizeBoolean(this.getParam('searchWhenChanged'))) {
            this.pushContextToChildren();
        } else {
            this.setChildContextFreshness(false);
        }
        
        this._activator.text(range.toConciseString());
        
    },
    _fireAbsolute: function(fromDate, toDate) {
        var f = Splunk.util.getConfigValue("SEARCH_RESULTS_TIME_FORMAT");

        var earliestEpochTime = null;
        if (fromDate)
        {
            var earliestDateTime = new splunk.time.DateTime(fromDate.strftime(f));
            earliestDateTime.setTimeZone(this._timeZone);
            earliestEpochTime = earliestDateTime.getTime();
        }

        var latestEpochTime = null;
        if (toDate)
        {
            var latestDateTime = new splunk.time.DateTime(toDate.strftime(f));
            latestDateTime.setTimeZone(this._timeZone);
            latestEpochTime = latestDateTime.getTime();
        }

        this._selectedRange = new Splunk.TimeRange(earliestEpochTime, latestEpochTime);
        $('body').trigger('menuOpening');

        if (Splunk.util.normalizeBoolean(this.getParam('searchWhenChanged'))) {
            this.pushContextToChildren();
        } else {
            this.setChildContextFreshness(false);
        }
    },
    /**
     *  Function to get date object from a datepicker and a timespinner.  args are the selectors for the datepicker and the timespinner, returns 
     *      date object with date/time set. 
     */
    _getDateWithTime: function(datepicker, timefield) {
        dateWithTime = $(datepicker, this._customDateTimePopup).datepicker('getDate');
        t = $(timefield, this._customDateTimePopup);

        var hours = t.find('.hours').val() || 0;
        var minutes = t.find('.minutes').val() || 0;
        var seconds = t.find('.seconds').val() || 0;
        var milliseconds = t.find('.milliseconds').val() || 0;

        dateWithTime.setHours(hours, minutes, seconds, milliseconds);

        return dateWithTime;
    },
    getResults: function($super) {
        // make sure we dont silently pass back previous absolute time args in *any* error conditions. 
        // I'd rather hit the assertion in getModifiedContext
        this._selectedRange = null;
        return $super();
    },
    renderResults: function(xmlDoc) {
        responseDict = JSON.parse(xmlDoc.toString());
        var earliestEpochTime    = responseDict["earliestEpochTime"] || null;
        var latestEpochTime      = responseDict["latestEpochTime"] || null;
        var earliestOffset = null;
        var latestOffset   = null;
        if (responseDict["earliestOffset"]) {
            earliestOffset       = parseInt(responseDict["earliestOffset"][0], 10);
        }
        if (responseDict["latestOffset"]) {
            latestOffset         = parseInt(responseDict["latestOffset"][0], 10);
        }
        this._selectedRange = new Splunk.TimeRange(earliestEpochTime, latestEpochTime, earliestOffset, latestOffset);
        $('body').trigger('menuOpening');
        
        if (Splunk.util.normalizeBoolean(this.getParam('searchWhenChanged'))) {
            this.pushContextToChildren();
        } else {
            this.setChildContextFreshness(false);
        }
    },
    getResultParams: function() {
        var f = Splunk.util.getConfigValue("SEARCH_RESULTS_TIME_FORMAT");
        var params = {};
        if (this._customEarliestDate) params["earliest"] = this._customEarliestDate.strftime(f);
        if (this._customLatestDate)   params["latest"]   = this._customLatestDate.strftime(f);

        return params;
    },
    /**
     *  Function to display an error message in a datepicker submenu
     *   note: currently we only have one error message that we display, in the case that the start date is later than the end date. 
     *  this function is set up exclusively for that case.  if we need more messaging, we'll need to genericize this.  
     */
    _showDatepickerError: function(errMsg) {
    	this._clearDatepickerErrors();
    	$('.datepickerErrMsg', this._customDateTimePopup).append('<p>' + errMsg + '</p>');
    },
    /**
     *  Function to clear error messages in datepickers 
     */
    _clearDatepickerErrors: function(){
    	$('.datepickerErrMsg', this._customDateTimePopup).empty();
    },
    /**
     *  Function to display a short version of the new custom date range in the menu activator 
     */
    _setActivatorText: function(fromDate, toDate) {
        var newText = null;
        var hasFromDate = (fromDate instanceof Date);
        var hasToDate = (toDate instanceof Date);
        var isFromDay = (hasFromDate && (fromDate.getHours() == 0) && (fromDate.getMinutes() == 0) && (fromDate.getSeconds() == 0) && (fromDate.getMilliseconds() == 0));
        var isToDay = (hasToDate && (toDate.getHours() == 0) && (toDate.getMinutes() == 0) && (toDate.getSeconds() == 0) && (toDate.getMilliseconds() == 0));

        if (hasFromDate && hasToDate)
        {
            if (isFromDay && isToDay)  // have a start and end, this is a range or specific date
            {
                // subtract 1 day from toDate
                var toDatePrev = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() - 1);
                if (fromDate.getTime() < toDatePrev.getTime())  // start and end date are more than one day apart, this is a range
                    newText = format_date(fromDate, "medium") + " - " + format_date(toDatePrev, "medium");
                else  // start and end date represent one day, specific date
                    newText = format_date(fromDate, "medium");
            }
        }
        else if (hasFromDate)
        {
            if (isFromDay)  // have a start but no end, dates after
                newText = this.DATES_AFTER_TEXT + " " + format_date(fromDate, "medium");
        }
        else if (hasToDate)
        {
            if (isToDay)  // have an end but no start, dates before
                newText = this.DATES_BEFORE_TEXT + " " + format_date(toDate, "medium");
        }

        if (!newText)  // uh, bad condition, just put 'custom' and walk away slowly
            newText = this.CUSTOM_TIME_LABEL;

        this._activator.text(newText);
    },
    /* 
    We override getModifiedContext, because this class implements a 'selection' state. In this case
    it implements a "Selection Time" behaviour.  Children will display data from the selected time range.
    */
    getModifiedContext: function() {
        var range = null;
        if (this._selectedRange) {
            range = this._selectedRange;
        } else {
            this.logger.error("Assertion Failed - we have no selected range.  If this occurs with the calendar-pickers its a possible race condition.");
            range = new Splunk.TimeRange();
        }
        var context = this.getContext();
        var search  = context.get("search");
        search.abandonJob();
        search.setTimeRange(range);
        // TODO - I've decided for now that we cant let context.get() return references, because it 
        //        breaks encapsulation. 
        //        however in theory we could say that context is only responsible for 
        //        encapsulating simple literals and objects have a more wild-west feel...   
        context.set("search", search);
        return context;
    },
    onContextChange: function() {
        // only handle context changes that come from the history OR when form search is used
        var context = this.getContext();
        if ((!context.has("from_history") || !Splunk.util.normalizeBoolean(context.get("from_history"))) &&
            (!context.has("is_form_search") || !Splunk.util.normalizeBoolean(context.get("is_form_search"))))
            return;

        var search = this.getContext().get("search");
        var range = search.getTimeRange();

        if (range && !(range._constructorArgs[0] == null && range._constructorArgs[1] == null)) {
            this._datePickerMode = false;
            this._insertNewMenuItem(range);
        }
    },
    /* 
     * Examines the context's TimeRange and sets its own UI to duplicate that TimeRange
     * If it cannot find a match, it creates an <option> element and blindly puts the
     * earliest and latest args of the TimeRange instance into its values,
     * and uses TimeRange.toConciseString() to output the label.
     */
    applyContext: function(context) {
        var search = context.get("search");
        var range = search.getTimeRange();
        

        var RECONCILE_TIME_INTENTIONS = false;
        if (RECONCILE_TIME_INTENTIONS) {
            var timeIntentionToString = function(search, intentionName) {
                var intention = search.getIntentionReference(intentionName);
                if (intention) {
                    var arg = intention["arg"];
                    return Splunk.TimeRange.relativeArgsToString(arg["count"], arg["unit"], arg["snapUnit"]);
                }
                return false;
            };
            var earliestIntentionTerm = timeIntentionToString(search, "earliesttime");
            var latestIntentionTerm   = timeIntentionToString(search, "latesttime");

            var needToRenormalize = earliestIntentionTerm || latestIntentionTerm;
            if (needToRenormalize) {
                var earliestArg = earliestIntentionTerm || range.getEarliestTimeTerms();
                var latestArg   = latestIntentionTerm   || range.getLatestTimeTerms();
                range = new Splunk.TimeRange(earliestArg, latestArg);
            }
        }
        var earliest = range.getEarliestTimeTerms() || null;
        var latest   = range.getLatestTimeTerms()   || null;
        
        
        if (!this.isPageLoadComplete()) {
            if (earliest || latest) {
                // walk through all our existing options and if there's a match, select it.
                var moduleInstance = this;
                var foundAMatch = false;
                var self = this;
                this._menu.getMenu().find('.timeRangePreset a').each(function(){
                    var thisEarliest = $(this).attr(self.EARLIEST_TIME_ATTR) || null;
                    var thisLatest   = $(this).attr(self.LATEST_TIME_ATTR)   || null;
                    var thisRange = new Splunk.TimeRange(thisEarliest, thisLatest);
                    
                    if (range.equalToRange(thisRange)) {
                        moduleInstance._activator.text($(this).text());
                        moduleInstance._datePickerMode = false;
                        moduleInstance._selectedRange = range;
                        foundAMatch = true;
                        // this return is within an each(), so it's more like a break.
                        return true;
                    } 
                });
                if (foundAMatch) {
                    return;
                }
                else {
                    // create a new OPTION element, insert it, and select it
                    this._insertNewMenuItem(range);
                    return;
                }
            }
            this._selectedRange = new Splunk.TimeRange();
            this._activator.text(this.ALL_TIME_LABEL);
        } else if (range && !(range._constructorArgs[0] == null && range._constructorArgs[1] == null)) {
            this._datePickerMode = false;
            this._insertNewMenuItem(range);
            this.baseContext = null;
            this.pushContextToChildren();
            return true;
        }
        return false;
    },
    _insertNewMenuItem: function(timeRange) {
        var newOption = {};
        var link = $("<a>")
            .attr(this.EARLIEST_TIME_ATTR, timeRange.getEarliestTimeTerms())
            .attr(this.LATEST_TIME_ATTR, timeRange.getLatestTimeTerms())
            .text(timeRange.toConciseString());
        
        if ($(".customTimeRange", this.container).size() == 3) {
            $(".customTimeRange:first", this.container).remove();
        }
        
        $("<li>")
            .addClass("timeRangePreset customTimeRange")
            .append(link)
        .appendTo($(".innerMenuWrapper", this.container)[0]);
            
        this._selectedRange = timeRange;
        
        if (timeRange.getDuration() == -1) {
            this._activator.text(timeRange.toConciseString());
        } else {
            this._activator.text(this.CUSTOM_TIME_LABEL);
        }
    },
    _onMenuClick: function(evt) {
        var t = evt.target;
       
        if ( $(t).parent('li').hasClass('timeRangePreset') ) {
            this._setSelectedRangeToPreset($(t));
            this.setParam('default', this._getRawLabel($(t).text()));

            if (Splunk.util.normalizeBoolean(this.getParam('searchWhenChanged'))) {
                this.pushContextToChildren();
            } else {
                this.setChildContextFreshness(false);
            }

            $('.timeRangeActivator', this.container).text($(t).text());
        }
    },
   
    /*
     * Returns an array of searchterms representing the selected timerange option
     * in the pulldown.
     */
    _setSelectedRangeToPreset: function(presetElement) {
        var earliest = presetElement.attr(this.EARLIEST_TIME_ATTR);
        var latest   = presetElement.attr(this.LATEST_TIME_ATTR);
        this._selectedRange = new Splunk.TimeRange(earliest, latest);
    }  
    
});
