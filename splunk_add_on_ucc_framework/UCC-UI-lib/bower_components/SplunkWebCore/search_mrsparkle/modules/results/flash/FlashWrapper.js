Splunk.namespace("Module");

Splunk.Module.FlashWrapper = $.klass(Splunk.Module.DispatchingModule, {

    CUSTOM_DATE_FORMATS: {
        "EEE MMM d": {
            "day_before_month": "EEE d MMM",
            "ja_JP": "EEE MMM d\u65e5",
            "ko_KR": "EEE MMM d\uc77c",
            "zh_CN": "EEE MMM d\u65e5",
            "zh_TW": "EEE MMM d\u65e5"
        },
        "MMMM": {
        },
        "yyyy": {
            "ja_JP": "yyyy\u5e74",
            "ko_KR": "yyyy\ub144",
            "zh_CN": "yyyy\u5e74",
            "zh_TW": "yyyy\u5e74"
        }
    },

    _isBridgeConnected: false,

    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("flash_wrapper.js");

        // we keep track now of each render, to match it to the corresponding onDataUpdated event.
        this.updateId = -1;

        this.swfObjectId = "swfObject_" + this.container.attr('id');
        this.bridge = new Splunk.JABridge(this.swfObjectId);
        this.minVersion = Splunk.util.getConfigValue("FLASH_MAJOR_VERSION") + "." + Splunk.util.getConfigValue("FLASH_MINOR_VERSION") + "." + Splunk.util.getConfigValue("FLASH_REVISION_VERSION");
        
        // used to communicate with PageStatus singleton about rendering in progress. 
        this.renderMonitor = false;
        // used to communicate with PageStatus singleton about the async swf loading. 
        this.swfLoadMonitor = Splunk.Globals['PageStatus'].register(this.moduleType + ' - loading swf file - ' + this.container.attr('id'));
        
        this.initializeBridge();
        if (swfobject.hasFlashPlayerVersion(this.minVersion)){
            this.addObjectStructure();
        } else {
            this.showFlashError();
        }
        $(document).bind("PrintStart", this.onPrintStart.bind(this));
        $(document).bind("PrintEnd", this.onPrintEnd.bind(this));
    },
    
    /**
     * Retrieve base64 encoded image snapshot of Flash movie for overlay and shutdown existing movie.  
     */
    onPrintStart: function(){
        if($.browser.msie){
            return;
        }    
        var snapshot = null;
        try {
            snapshot = this.bridge.callMethod("getSnapshot");
        } catch(e) {
            this.logger.warn("JABridge instance is either unavailable, not-connected or does not support callMethod getSnapshot");
        }
        if (snapshot){
            var img = document.createElement("img");
            img.setAttribute("width", snapshot.width);
            img.setAttribute("height", snapshot.height);
            this.hideContent("onPrintStart");
            $('.FlashWrapperContainer', this.container)[0].appendChild(img).src = snapshot.data;//bypass jquery for performance (base64 encoded images are large)
        }
    },
    
    /**
     * Destroy base64 encoded image snapshot of Flash movie and bring back Flash movie to previous state.
     */
    onPrintEnd: function(){
        if ($.browser.msie) {
            return;
        }
        $('.FlashWrapperContainer img', this.container).remove();
        this.showContent("onPrintStart");
    },
   
    /**
     * Current version of jQuery ui is buggy. Additional logic to make things work consistently.
     */
    enableResizable: function(){
        if (!($.browser.safari && $.browser.version < "526")) { //disable resizing for safari 3 and below only
            $("div.FlashWrapperContainer", this.container).resizable({autoHide: true, handles: "s", stop: this.onResizeStop.bind(this)});
            $("div.FlashWrapperContainer").mouseup( //workaround until jquery ui is updated
                function(event){
                    $(this).width('100%'); 
                }
            );
        }
    },
    
    connectBridge: function(isReconnect) {
        if (!isReconnect) isReconnect = false;

        this.bridge.connect(function(){this.onConnect(isReconnect);}.bind(this), this.onClose.bind(this));
    },

    /**
     * Template method that subclasses can implement if they need to call 
     * bridge.addMethod or bridge.addEvent,  which can only be called after the 
     * bridge object has been constructed, but before the connect() method 
     * has been called.
     */
    initializeBridge: function() {
        this.bridge.addMethod("formatSimpleString", this.formatSimpleString.bind(this), [ "str" ], "String");
        this.bridge.addMethod("formatNumericString", this.formatNumericString.bind(this), [ "strSingular", "strPlural", "num" ], "String");
        this.bridge.addMethod("formatNumber", this.formatNumber.bind(this), [ "num" ], "String");
        this.bridge.addMethod("formatDate", this.formatDate.bind(this), [ "time", "timeZoneOffset", "dateFormat" ], "String");
        this.bridge.addMethod("formatTime", this.formatTime.bind(this), [ "time", "timeZoneOffset", "timeFormat" ], "String");
        this.bridge.addMethod("formatDateTime", this.formatDateTime.bind(this), [ "time", "timeZoneOffset", "dateFormat", "timeFormat" ], "String");
    },

    /**
     * Retrieve the normalized computed style for a specified element.
     * 
     * @param {Array} specificity An array of elements to try and find a related css property from. The first element to return a property exits the routine.
     * @param {String} cssProperty The css property following standard css property convention not camel case.
     * 
     * @type String || null
     * @return Returns a hexadecimal value of a matching element css selector property or null.
     */    
    getCSSColor: function(specificity, cssProperty){
        var color;
        for (var i=0; i<specificity.length; i++){
            var computedColor = specificity[i].css(cssProperty);
            color = Splunk.util.normalizeColor(computedColor);
            if (color){
                return color;
            }
        }
        return null;
    },
    
    /**
     * Handler for when SWFObject has embedded Flash content.
     * SWFObject adds movies asynchronously (absolutely unnecessary) so this is a workaround for all its stupidity.
     * 
     * @param {Object) event SWFObject event object having success, id and ref attributes.
     */
    onSWFReady: function(event){
        if (event.success) {
            if (this.isContentVisible())
                this.connectBridge(false);
            else
                $(this.bridge.getFlashElement(this.swfObjectId)).css("display", "none");
            if (Splunk.util.normalizeBoolean(this.getParam("enableResize"))) {
                this.enableResizable();
            }
        } else {
            this.logger.error("The embedding of the SWF was unsuccessful.");
        }
    },

    addObjectStructure: function(){
        var targetId = "FlashWrapperContainer" + this.container.attr('id');//SWFObject requires an explicit id.
        
        var swlUrl = '';
        if (this.getParam('swfFile').substring(0,1) == '/') {
            swfUrl = Splunk.util.make_url(this.getParam('swfFile'));
        } else {
             swfUrl = Splunk.util.make_url("/static/flash/" + this.getParam("swfFile"));
        }

        var expressInstallUrl = false;
        var staticPath = Splunk.util.make_url("/static");
        if (staticPath.charAt(staticPath.length - 1) == "/")
            staticPath = staticPath.substring(0, staticPath.length - 1);
        var flashVars = {
            'staticPath': staticPath,
            'hostPath': Splunk.util.make_url('/splunkd'),
            'basePath': ""
        };
        var params = {
            wmode: "opaque",
            allowFullScreen: "true"
        };
        var bgcolor = this.getCSSColor([this.container], "background-color");
        if(bgcolor){
            params["bgcolor"] = bgcolor;
        }
        var attributes = {
            id: this.swfObjectId,
            name: this.swfObjectId
        };
        $(".FlashWrapperContainer", this.container).append("<div id="+targetId+"></div>");//SWFObject does complete node replacement, not target child replacement.
        swfobject.embedSWF(swfUrl, targetId, "100%", "100%", this.minVersion, expressInstallUrl, flashVars, params, attributes, this.onSWFReady.bind(this));
    },

    showFlashError: function() {
        var msg = _("Splunk requires a newer version of Flash.");
        this.logger.warn(msg);
        var target = $("div.FlashWrapperContainer", this.container)[0];
        target.innerHTML = sprintf(
            '<p class="error">%s (Minimum version: %s.%s.%s) <a href="http://get.adobe.com/flashplayer/" target="_blank" class="spl-icon-external-link-xsm">Download Flash Player</a></p>',
            msg,
            Splunk.util.getConfigValue('FLASH_MAJOR_VERSION'),
            Splunk.util.getConfigValue('FLASH_MINOR_VERSION'),
            Splunk.util.getConfigValue('FLASH_REVISION_VERSION')
        );
    },
    
    update: function() {
        this.updateId = this.callBridgeMethod("update");
    },
    
    /**
     * Handle JABridge close event.
     */
    onClose: function(){
        this.logger.warn("The JABridge connection was closed with an id of", this.bridge.id());
        this._isBridgeConnected = false;
    },
    
    /**
     * Handle JABridge connect event.
     * 
     * @param {Boolean} isReconnect Controls if the flash movie should be brought back to life.
     */
    onConnect: function(isReconnect) {
        this._isBridgeConnected = true;
        this.setPresentation();
        this.onContextChange();
        this.bridge.addEventListener('updated', this.onDataUpdated.bind(this));
        this.bridge.addEventListener("openAsImage", this.onOpenAsImage.bind(this));
        this.setBridgeProperty("enableOpenAsImage", !jQuery.browser.msie);//ie does not support uri data scheme.
        this.setBridgeProperty("timeZone", Splunk.util.getConfigValue('SERVER_ZONEINFO'));
        this.update();
        this.swfLoadMonitor.loadComplete();
    },
    onJobProgress: function() {
        var context = this.getContext();
        var search  = context.get("search");
        if (search.job.isDone()) {
            // Notifying PageStatus that a render is beginning. 
            if (!this.renderMonitor) {
                this.renderMonitor = Splunk.Globals['PageStatus'].register(this.moduleType + ' - rendering final data - ' + this.container.attr('id'));
            }
        }
    },
    /**
     * Handle a resize stop event from the Resizable jQuery extension. See http://docs.jquery.com/UI/Resizable
     * Saves the new height with a 'px' suffix to viewstate.conf.
     * 
     * @param {Object} event Original browser event.
     * @param {Object} ui Prepared ui object having the following attributes: http://docs.jquery.com/UI/Resizable#overview
     */
    onResizeStop: function(event, ui) {
        $(event.target).width('100%');
        this.setParam('height', ui.size.height + "px");
    },
    onDataUpdated: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        // screen out previews and (for the timeline) async updates onJobProgress
        if (search.isJobDispatched() && search.job.isDone()) {
            // each time you call 'update' you get back an int that increments each time. 
            // We keep this int as a local property - this.updateId
            // if the 'updateCount' of this particular dataUpdated event, matches the last 
            // update we asked for,  then we mark it complete. 
            // it's possible however that we asked for another update RIGHT when the penultimate 
            // update request returned.  That's what this check is doing.
            if (this.renderMonitor && (event.updateCount >= this.updateId)) {
                this.renderMonitor.loadComplete();
                this.renderMonitor = false;
            }
        }
    },
    /**
     * Handle JABridge event that has the base64 encoded png image invoked via a flash context menu click. A popup a window with the image will be launched.
     * @param {Object} event An object literal having the following structure { snapshot: { data:, width:, height: } } where data is a base64 encoded image.
     */
    onOpenAsImage: function(event) {
        var snapshot = event.snapshot;
        Splunk.window.open(snapshot.data, this.swfObjectId, {height: snapshot.height+16, width: snapshot.width+16});
    },

    /**
     * Set presentation control settings on Flash movies. Used for skinning.
     * 
     * Example CSS:
     * .YOURCONTAINER {
     *    background-color:#CCC; -> backgroundColor
     *    border-left-color:#000; -> foregroundColor
     *    color:#FFF; -> fontColor
     *    border-right-color:#FFF; -> seriesColor
     * }
     */
    setPresentation: function(){
        var styleMap = [
            {css: "border-left-color", flash: "foregroundColor"},
            {css: "color", flash: "fontColor"},
            {css: "background-color", flash: "backgroundColor"}
        ];
        for(var i=0; i<styleMap.length; i++){
            var styleMapAttributes = styleMap[i];
            var value = this.getCSSColor([this.container], styleMapAttributes.css);
            if(value){
                try{
                    this.bridge.callMethod("setValue", styleMapAttributes.flash, value.replace("#", "0x"));
                    this.logger.info("Set", styleMapAttributes.flash, value);
                }catch(e){
                    this.logger.error("Could not setValue", styleMapAttributes.flash);
                }
            }
        }
    },

    hideContent: function(key) {
        key = (key != null) ? String(key) : "";

        if (this._hideKeys)
        {
            this._hideKeys[key] = true;
            return false;
        }

        this._hideKeys = {};
        this._hideKeys[key] = true;

        this.logger.warn("closing down JABridge connection");
        this.bridge.close();
        $(this.bridge.getFlashElement(this.swfObjectId)).css("display", "none");

        return true;
    },

    showContent: function(key) {
        if (!this._hideKeys)
            return false;

        key = (key != null) ? String(key) : "";

        delete this._hideKeys[key];
        for (key in this._hideKeys)
        {
            if (this._hideKeys.hasOwnProperty(key))
                return false;
        }

        this._hideKeys = null;

        $(this.bridge.getFlashElement(this.swfObjectId)).css("display", "");
        this.logger.warn("bringing back JABridge connection");
        this.connectBridge(true);

        return true;
    },

    isContentVisible: function() {
        return !this._hideKeys;
    },

    getBridgeProperty: function(name) {
        try {
            return this.bridge.getProperty(name);
        } catch(e) {
            this.logger.error("externalInterface/jabridge exception on getProperty('", name, "')", e);
            return false;
        }
    },
    
    setBridgeProperty: function(name, value) {
        if (!this._isBridgeConnected) return;
        try {
            this.bridge.setProperty(name, value);
        } catch(e) {
            this.logger.error("externalInterface/jabridge exception on setProperty('", name, "', '", value, "')", e);
        }
    },
    
    callBridgeMethod: function() {
        if (!this._isBridgeConnected) return;

        try {
            return this.bridge.callMethod.apply(this, arguments);
        } catch(e) {
            this.logger.error("externalInterface/jabridge exception on callMethod()", e);
        }
    },

    formatSimpleString: function(str) {
        return _(str);
    },

    formatNumericString: function(strSingular, strPlural, num) {
        return sprintf(ungettext(strSingular, strPlural, num), this.formatNumber(num));
    },

    formatNumber: function(num) {
        var pos = Math.abs(num);
        if ((pos > 0) && ((pos < 1e-3) || (pos >= 1e9)))
            return format_scientific(num, "##0E0");
        return format_decimal(num);
    },

    formatDate: function(time, timeZoneOffset, dateFormat) {
        if (dateFormat)
        {
            var customFormat = this.CUSTOM_DATE_FORMATS[dateFormat];
            if (customFormat)
            {
                var localeName = locale_name();
                if (customFormat[localeName])
                    dateFormat = customFormat[localeName];
                else if (locale_uses_day_before_month() && customFormat["day_before_month"])
                    dateFormat = customFormat["day_before_month"];
            }
        }
        return format_date(this.epochToDateTime(time, timeZoneOffset), dateFormat);
    },

    formatTime: function(time, timeZoneOffset, timeFormat) {
        if (timeFormat == "full")
                return format_time_microseconds(this.epochToDateTime(time, timeZoneOffset), timeFormat);
        return format_time(this.epochToDateTime(time, timeZoneOffset), timeFormat);
    },

    formatDateTime: function(time, timeZoneOffset, dateFormat, timeFormat) {
        if (timeFormat == "full")
                return format_datetime_microseconds(this.epochToDateTime(time, timeZoneOffset), dateFormat, timeFormat);
        return format_datetime(this.epochToDateTime(time, timeZoneOffset), dateFormat, timeFormat);
    },

    epochToDateTime: function(time, timeZoneOffset) {
        var date = new Date(Math.floor((time + timeZoneOffset) * 1000));
        var dateTime = new DateTime({
            date: date,
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            second: date.getUTCSeconds(),
            microsecond: date.getUTCMilliseconds() * 1000
        });
        dateTime.weekday = function() {
            var d = this.date.getUTCDay() - 1;
            if (d < 0)
                d = 6;
            return d;
        };
        return dateTime;
    }
});
