Splunk.namespace("Splunk.Messenger");

/**
 * A controller like class who carries a message.
 *
 * Example:
 * var broker = new Splunk.Messenger.Bus();
 *
 * //Send a message.
 * broker.send("info", "Info message a", "foobar_b", null, null);
 * broker.send("info", "Info message b", "foobar_a", null, null);
 *
 * //Get all messages.
 * broker.receive(null, null, function(message){
 *     alert("Got some arbitrary message object.");
 * });
 *
 * //Get all messages filtered by level 'info'.
 * broker.receive({"level":"info"}, null, function(message){
 *     alert("Got a a message object with a level of info.");
 * });
 *
 * //Get all messages filtered by level 'info' and ordered by date.
 * broker.receive({"level":"info"}, ['date'], function(msg){
 *     alert("Got a message object with a level of info sorted by date (latest first).");
 * });
 */
Splunk.Messenger.Bus = $.klass({
    DATE_FORMAT: "%Y-%m-%dT%H:%M:%S",
    MAX_SUBJECTS_BUFFER: 100,
    MAX_OBSERVERS_BUFFER: 200,
    /**
     * Initializes Messenger Bus.
     */
    initialize: function(){
        this.count = 1;
        this.id = 0;
        this.logger = Splunk.Logger.getLogger("Splunk.Messenger.Bus");
        this.observers = [];
        this.subjects = [];
        $(window).bind("unload", this.gc.bind(this));
    },
    /**
     * Create a new observer object.
     *
     * @param {Object||null} filter An object literal key/value filter: {(key) {String} One of x properties for an Object: (value) {String || RegExp} An arbitrary string value to match or regular expression object, all matching.
     * @param {Array||null} sort An Array of key values to sort by.
     * @param {Boolean} negate If you wish to negate the entire filter, matching only items that do not match the filter.
     * @param {Boolean} cancel Stop the propogation of notification to other observers.
     * @return An new observer object.
     * @type Object
     */
    createObserver: function(filter, sort, callback, negate, cancel){
        filter.control = filter.hasOwnProperty('control') ? filter.control : true;
        return {
            'filter':filter,
            'sort':sort,
            'callback':callback,
            'negate':negate,
            'cancel':cancel
        };
    },
    /**
     * Create a new subject object.
     *
     * @param {String} level The severity level.
     * @param {String} content The message content.
     * @param {*} className The class identifier for the message of any type.
     * @param {String} date The UTC ISO Date.
     * @param {String} id An id value (Does not have to be unique).
     * @return An new subject object.
     * @type Object
     */
    createSubject: function(level, content, className, date, id, control){
        return {
            'level':level,
            'control':control,
            'content':content,
            'className':className,
            'date':date,
            'id': id
        };
    },
    /**
     * Filter an Array of Objects given an arbitrary set of key/value pairs.
     *
     * @param {Array} arrayOfObjects An array of object literal values.
     * @param {Object} kv An object literal key/value filter: {(key) {String} One of x properties for an Object: (value) {String || RegExp} An arbitrary string value to match or regular expression object, all matching.
     * @return Matching (included) and non-matching (excluded) subject(s).
     * @type Object
     */
    filter: function(arrayOfObjects, kv){
        var included = [];
        var excluded = [];
        for(i=0; i<arrayOfObjects.length; i++){
            var object = arrayOfObjects[i];
            var match = true;
            for(var k in kv){
                if(kv.hasOwnProperty(k) && object.hasOwnProperty(k) && object[k] !== undefined &&
                    ((k=='control' && (kv[kv]||!object[k])
                    || ((kv[k] instanceof RegExp)?object[k].search(kv[k])!=-1:kv[k]==object[k])))){
                    continue;
                }else{
                    match = false;
                    break;
                }
            }
            if(match){
                included.push(object);
            }else{
                excluded.push(object);
            }
        }
        return {"included":included, "excluded":excluded};
    },
    /**
     * Garbage collection routine.
     */
    gc: function(){
        this.observers = [];
    },
    /**
     * Create an empty subject object.
     *
     * @return An empy subject.
     * @type Object
     */
    getEmptySubject: function(){
        return this.createSubject("", "", "", "", "", false);
    },
    /**
     * Get a unique id with zero padding.
     */
    getUniqueId: function(){
        this.id++;
        var paddingLength = [this.MAX_OBSERVERS_BUFFER].join("").length + 1;
        var zeropad = [this.id, ""].join("");
        while(zeropad.length<paddingLength){
            zeropad = ["0", zeropad].join("");
        }
        return zeropad;
    },
    /**
     * Get matching subject item(s) based on optional filter and sort criteria.
     *
     * @param {Boolean} del Delete the entire message queue after retrieval.
     * @param {Object||null} filter An object literal key/value filter: {(key) {String} One of x properties for an Object: (value) {String || RegExp} An arbitrary string value to match or regular expression object, all matching.
     * @param {Array||null} sort An Array of key values to sort by.
     * @param {Boolean} (Optional) negate If you wish to negate the entire filter, matching only items that do not match the filter.
     * @return Matched subject(s).
     * @type Array
     */
    getSubjects: function(del, filter, sort, negate){
        negate = arguments[3] || false;
        //this.logger.info("Filter negation enabled", arguments);
        var filtered = (filter && this.hasSubjectProperty(filter))?this.filter(this.subjects, filter):{"included":this.subjects.concat([]), "excluded":[]};
        var included = (negate)?filtered.excluded:filtered.included;
        var excluded = (negate)?filtered.included:filtered.excluded;
        if(del){
            this.subjects = excluded;
        }
        return (sort && sort.length>0)?this.sort(included, sort):included;
    },
    /**
     * Get the length of matching subjects.
     *
     * @param {Object||null} filter An object literal key/value filter: {(key) {String} One of x properties for an Object: (value) {String || RegExp} An arbitrary string value to match or regular expression object, all matching.
     * @param {Boolean} (Optional) negate If you wish to negate the entire filter, matching only items that do not match the filter.
     * @return The length of matching queue entities.
     * @type Number
     */
    getSubjectLength: function(filter){
        var negate = arguments[1] || false;
        return this.getSubjects(false, filter, null, negate).length;
    },
    /**
     * Check if an object has a subject property.
     *
     * @param {Object} object An object to check properties against.
     * @return If the object has a queue entity property.
     * @type Boolean
     */
    hasSubjectProperty: function(object){
        for(var property in object){
            if(this.isValidSubjectProperty(property)){
                return true;
            }
        }
        return false;
    },
    /**
     * Check if a subject has all required properties.
     *
     * @param {Object} object An object to check properties against.
     * @return If the object is a valid queue entity.
     * @type Boolean
     */
    isValidSubject: function(object){
        var subject = this.getEmptySubject();
        for(var property in subject){
            if(subject.hasOwnProperty(property) && !object.hasOwnProperty(property)){
                return false;
            }
        }
        return true;
    },
    /**
     * Check if subject property is valid.
     *
     * @param {String} property A property to validate.
     * @return If the property is a queue entity property.
     * @type Boolean
     */
    isValidSubjectProperty: function(property){
        var subject = this.getEmptySubject();
        return (subject.hasOwnProperty(property))?true:false;
    },
    /**
     * Send notification to all observers.
     *
     * @param {Array} observers An array of observers.
     */
    notify: function(observers){
        //this.logger.info("notify subject(s)");
        observers = observers.concat([]).sort(this.observerNotifySortby.bind(this));
        var observer;
        for(var j=0; j<observers.length; j++){
            observer = observers[j];
            var subjects = this.getSubjects(observer.cancel, observer.filter, observer.sort, observer.negate);
            for(var k=0; k<subjects.length; k++){
                var subject = subjects[k];
                this.logger.info(subject);
                try{
                    observer.callback(subject);
                }catch(e){
                    //setTimeout(function(e){throw e;}, 0);//Keep on trucking...
                }
            }
        }
        for(var l=0; l<observers.length; l++){
            observer = observers[l];
            this.getSubjects(true, observer.filter, null, observer.negate);//remove all matched observers.
        }
    },
    /**
     * Sort pattern for observer notification.
     *
     * @param {Object} a
     * @param {Object} b
     * @return Defaults to 0, no sort required.
     * @type Number
     * @return
     * < 0: Sort "a" to be a lower index than "b"
     * = 0: "a" and "b" should be considered equal, and no sorting performed.
     * > 0: Sort "b" to be a lower index than "a".
     */
    observerNotifySortby: function(a, b){
        return 0;
    },
    /**
     * Create an observer of subjects(s).
     *
     * @param {Object||null} filter An object literal key/value filter: {(key) {String} One of x properties for an Object: (value) {String || RegExp} An arbitrary string value to match or regular expression object, all matching.
     * @param {Array||null} sort An Array of key values to sort by.
     * @param {Function} callback A callback handler to call with the matching message.
     * @param {Boolean} negate If you wish to negate the entire filter, matching only items that do not match the filter.
     * @param {Boolean} cancel Stop the propogation of notification to other observers.
     */
    receive: function(filter, sort, callback, negate, cancel){
        var observer = this.createObserver(filter, sort, callback, negate, cancel);
        if(this.observers.length>=this.MAX_OBSERVERS_BUFFER){
            this.logger.warn("observers length exceeds MAX_OBSERVERS_BUFFER constraint of", this.MAX_OBSERVERS_BUFFER, "dropping earliest item.");
            this.observers.shift();
        }
        this.observers.push(observer);
        this.notify([observer]);
    },
    /**
     * Send a subject.
     *
     * @param {String} level The severity level.
     * @param {String} content The message string text.
     * @param {*} className The class identifier for the message of any type.
     * @param {String || null} id An id value (Does not have to be unique), if null generates a unique value.
     * @param {String || null} date An optional UTC ISO Date, if null defaults value of now is added.
     */
    send: function(level, content, className, id, date, control){
        //this.logger.info("send message");
        date = date || (new Date()).strftime(this.DATE_FORMAT);
        id = id || this.getUniqueId();
        control = control ? true : false;
        var subject = this.createSubject(level, content, className, date, id, control);
        if(this.subjects.length>=this.MAX_SUBJECTS_BUFFER){
            this.logger.warn("subjects length exceeds MAX_SUBJECTS_BUFFER constraint of", this.MAX_SUBJECTS_BUFFER, "dropping earliest item.");
            this.subjects.shift();
        }
        this.logger.info(sprintf('MSG [%s, %s] %s', level, className, content));
        this.subjects.push(subject);
        this.notify(this.observers);
    },
    /**
     * Sort an Array of Objects given an arbitrary set of key/value pairs in (default is alpha ordering).
     *
     * @param {Array} arrayOfObjects An array of object literal values.
     * @param {Array} key An Array of key values to sort by.
     * @return A sorted array of objects.
     * @type Object
     */
    sort: function(arrayOfObjects, keys){
        var sortedArray = arrayOfObjects.concat([]);
        for(var i=0; i<keys.length; i++){
            var k = keys[i];
            sortedArray.sort(function(a, b){
                if(!a.hasOwnProperty(k) || !b.hasOwnProperty(k)){
                    this.logger.warn("Cannot sort with invalid key", k);
                    return 0;
                }else{
                    return ([a[k], b[k]].sort()[0]!==a[k])?1:-1;
                }
            });
        }
        return sortedArray;
    }
});
/**
 * Augment Bus for application specific implementation. Based on className hierarchy and splunkd server messaging.
 * Overrides send and receive methods.
 *
 * Example:
 * var broker = Splunk.Messenger.System.getInstance();
 *
 * //Send a message.
 * broker.send("info", "splunk", "This is a message");
 * broker.send("info", "splunk.search.job", "This is a message");
 * broker.send("info", "splunk.search", "This is a message");
 *
 * //Get all messages.
 * broker.receive("splunk.search.job", function(message){
 *     alert("Got one message matching className splunk.search.job.");
 * });
 *
 * broker.receive("splunk", function(message){
 *     alert("Got any message matching className splunk or splunk.search");
 * });
 *
 * //Get all non-matching messages.
 * broker.receive("*", function(msg){
 *     alert("Got a message that is neither splunk, splunk.search or splunk.search.job");
 * });
 */
Splunk.Messenger.System = $.klass(Splunk.Messenger.Bus, {
    RECEIVE_WILD_CARD: "*",
    RECEIVE_LEVELS: ["persistent", "info", "warn", "error", "fatal"],
    RECEIVE_LEVEL: "fatal",
    REQUEST_TIMEOUT: 5000,
    SERVER_ENABLED: true,
    SERVER_POLL_INTERVAL: 60000,
    SERVER_RESOURCE: Splunk.util.make_url("/api/messages/index"),
    SERVER_CLASSIFIER: "splunk.services",
    SERVER_SESSION_EXPIRED_MESSAGE: _("Your session has expired."),
    SERVER_DOWN_MESSAGE: _("Your network connection may have been lost or Splunk web may be down."),
    SERVER_BACK_UP_MESSAGE: _("Your network connection was either restored or Splunk web was restarted."),    
    
    // number of consecutive request failures to throw warning to user
    // about potential connection issues
    OFFLINE_WARNING_THRESHOLD: 2,

    /**
     * Intializes Messenger System.
     *
     * @param {Object} super
     */
    initialize: function(){
        Splunk.Messenger.Bus.prototype.initialize.call(this);
        this.logger = Splunk.Logger.getLogger("Splunk.Messenger.System");
        this.intervalId = null;
        this.isRequestQueued = false;
        this.isServerDown = false;
        this.errorCount = 0;
        this.abortRequests = false;
        this.previousEtag = "";
        if(this.SERVER_ENABLED && typeof DISABLE_MESSENGER === 'undefined') {
            setTimeout(this.getServerMessages.bind(this), 0);//chrome throttle for status code of 0
            this.startPoller();
        }
        $(document).bind("SessionTimeout", this.onSessionTimeout.bind(this));
        $(document).bind("SessionStart", this.onSessionStart.bind(this));
    },
    /**
     * Serialize a className into a hierarchy matching RegExp object.
     *
     * @param {String} className
     * @type RegExp
     * @return RegExp serialized className.
     */
    classNameSerialize: function(className){
        var regex;
        if(!className)
            className = this.RECEIVE_WILD_CARD;
        if(className===this.RECEIVE_WILD_CARD){
            regex = /./;
        }else{
            var classNameParts = className.split(".");
            if(classNameParts.length===0){
                classNameParts = [className];
            }
            var pattern = "^" + classNameParts.join("\.");
            try{
                regex = new RegExp(pattern);
            }catch(e){
                this.logger.error("Could not create RegExp object for className", className);
                return null;
            }
        }
        return regex;
    },
    /**
     * Retrieve messages from the app server.
     */
    getServerMessages: function(){
        if(!this.isRequestQueued && !this.abortRequests){
            this.isRequestQueued = true;
            $.ajax({
                type: "GET",
                url: this.SERVER_RESOURCE,
                dataType: "text",
                beforeSend: function(XMLHttpRequest){
                    //don't set If-None-Match header to empty string value (see SPL-70971)
                    if (this.previousEtag) {
                        try {
                            XMLHttpRequest.setRequestHeader("If-None-Match", this.previousEtag);
                        } catch(e) {
                            // IE6 does not have setRequestHeader()
                        }
                    }
                }.bind(this),
                timeout: this.REQUEST_TIMEOUT,
                error: this.onServerMessagesError.bind(this),
                complete: this.onServerMessagesComplete.bind(this)
            });
            //this.logger.info("Getting messages from server.");
        }
    },
    /**
     * Override sort pattern for observer notification. Follows class hiearchy pattern: aaa.bbb.ccc, aaa.bbb, aaa, *.
     *
     * @param {Object} a
     * @param {Object} b
     * @return Defaults to 0, no sort required.
     * @type Number
     * @return
     * < 0: Sort "a" to be a lower index than "b"
     * = 0: "a" and "b" should be considered equal, and no sorting performed.
     * > 0: Sort "b" to be a lower index than "a".
     */
    observerNotifySortby: function(a, b){
        var classNameA = (a.filter.className instanceof RegExp)?a.filter.className.toString():a.filter.className;
        var classNameB = (b.filter.className instanceof RegExp)?b.filter.className.toString():b.filter.className;
        var classNameWildCard = this.classNameSerialize(this.RECEIVE_WILD_CARD).toString();
        if(classNameA===classNameWildCard){    
            return 1;
        }else if(classNameB===classNameWildCard){
            return -1;
        }else{
            return ([classNameA, classNameB].sort()[0]!==classNameA)?1:-1;
        }
    },
    /**
     * Handle error repsonse from jQuery $.ajax
     */
    onServerMessagesError: function(){
        //this.logger.error("onServerMessagesError fired");
    },
    /**
     * Handle a splunk appserver jsonresponse envelope.
     *
     * @param {Object} data The XMLHttpRequest object.
     * @param {String} textStatus A string describing the type of success of the request.
     */
    onServerMessagesComplete: function(data, textStatus){
        this.isRequestQueued = false;
        this.previousEtag = data.getResponseHeader("Etag");
        switch(data.status){
            case 0:
         	case 12029: //IE9(prob 8 as well) has it's own HTTP error status of 12029.. WTF?! 
                this.errorCount++;
         		this.previousEtag = new Date();
                if (this.errorCount >= this.OFFLINE_WARNING_THRESHOLD) {
                    this.isServerDown = true;
                    this.send("error", this.SERVER_CLASSIFIER, this.SERVER_DOWN_MESSAGE);
                    this.logger.warn("Server message timeout, offline");           	
                }
            	break;
            case 304:
                this.errorCount = 0;
                break;
            case 412:
                this.abortRequests = true;
                this.send("error", this.SERVER_CLASSIFIER, this.SERVER_SESSION_EXPIRED_MESSAGE);
                this.logger.warn("Server message session expired, abort further requests.");
                break;
            case 200:
                this.errorCount = 0;
                if(this.isServerDown){
                    this.logger.info("Server message back online.");
                    this.isServerDown = false;
                    this.previousEtag = new Date();
                    
                    // all messages from this persistent store should be marked as 'persistent'
                    this.send("persistent", this.SERVER_CLASSIFIER, this.SERVER_BACK_UP_MESSAGE);
                    break;
                }
                this.processResponse(data);
                break;
            default:
                break;
        }
    },
    /**
     * Handle Splunk.Session start event, ensure abortRequests is false to enable poller http requests.
     * 
     * @param {Object} event A jQuery event object.
     * @param {Date} date The fire time of the event.
     */    
    onSessionStart: function(event, date){
        this.logger.info("Starting message poller...");
        this.abortRequests = false;
    },    
    /**
     * Handle Splunk.Session timeout event, ensure abortRequests is true to cancel poller http requests.
     * 
     * @param {Object} event A jQuery event object.
     * @param {Date} date The fire time of the event.
     */
    onSessionTimeout: function(event, date){
        this.logger.info("Stopping message poller...");
        this.abortRequests = true;
    },
    /**
     * Process response data from messages endpoint.
     * 
     * @param {Object} data The XMLHttpRequest object.
     */
    processResponse: function(data){
        try{
            this.logger.info("Server message process response");
            data = JSON.parse(data.responseText);
        }catch(e){
            this.logger.warn("Could not parse server messages with error");
            return;
        }
        for(var i=0; i<data.messages.length; i++){
            var dataObj = data.messages[i];
            if(dataObj.hasOwnProperty("type") && dataObj.hasOwnProperty("message")){
                try{
                    this.send(dataObj.type.toLowerCase(), this.SERVER_CLASSIFIER, dataObj.message, dataObj.id);
                }catch(e){
                    this.logger.error("Could not send message through bus", e);
                }
            }else{
                this.logger.error("Missing jsonresponse property from app server.");
            }
        }        
    },
    /**
     * Override receive method based on className and id.
     *
     * @param {String} className The class identifier for the message following ("foo.bar" convention, "*" for all non-matched classNames)
     * @param {Function} callback A callback handler to call with the matching message.
     * @param {String} (Optional) id An id value (Does not have to be unique).
     */
    receive: function(className, callback, id, control){

        if(!className)
            className = this.RECEIVE_WILD_CARD;
        var classNameRegExp = this.classNameSerialize(className);
        if(!classNameRegExp){
            return;
        }
        for(var i=0; i<this.RECEIVE_LEVELS.length; i++){
            var filter = {};
            filter.className = classNameRegExp;
            if(id){
                filter.id = id;
            }
            if(control)
                filter.control = true;
            filter.level = this.RECEIVE_LEVELS[i];
            var uniqueReceiver = true;
            for(var j=0; j<this.observers.length; j++){
                var observerFilter = this.observers[j].filter;
                if((observerFilter.level && observerFilter.level===filter.level) && (observerFilter.className && observerFilter.className.toString()===filter.className.toString())){
                    uniqueReceiver = false;
                    this.logger.warn("Can't add another receiver with level", filter.level, "for already observed className", className);
                    break;
                }
            }
            if(uniqueReceiver){
                Splunk.Messenger.Bus.prototype.receive.call(this, filter, null, callback, false, true);
            }
            if(this.RECEIVE_LEVELS[i]===this.RECEIVE_LEVEL){
                break;
            }
        }
    },
    /**
     * Reset polling the server at a set interval for messages.
     */
    resetPoller: function(){
        if(this.intervalId){
            clearInterval(this.intervalId);
        }
        this.startPoller();
    },
    /**
     * Override send method.
     *
     * @param {String} level The severity level.
     * @param {String} className className The class identifier for the message following ("foo.bar" convention)
     * @param {String} content The message string text.
     * @param {String} (Optional) id An id value (Does not have to be unique).
     */
    send: function(level, className, content, id, control){
        id = id || null;
        if(jQuery.inArray(level, this.RECEIVE_LEVELS)!=-1){
            if(this.SERVER_ENABLED){
                this.resetPoller();
            }
            Splunk.Messenger.Bus.prototype.send.call(this, level, content, className, id, null, control);
        }else{
            this.logger.warn("Message not sent, invalid message level -", level, "- needs to be one of", this.RECEIVE_LEVELS.join(","));
        }
    },
    /**
     * Start polling the server at a set interval for messages.
     */
    startPoller: function(){
        this.intervalId = setInterval(this.getServerMessages.bind(this), this.SERVER_POLL_INTERVAL);
    },
    /**
     * Inject a control event to instruct listeners to clear their display
     */
    clear: function() {
        this.send('info', 'control', 'CLEAR', null, true);
    }
});
Splunk.Messenger.System.instance = null;
/**
 * Singleton reference to Messenger System object.
 *
 * @return A reference to a shared Messenger System object.
 * @type Object
 */
Splunk.Messenger.System.getInstance = function(){
    if(!Splunk.Messenger.System.instance){
        Splunk.Messenger.System.instance = new Splunk.Messenger.System();
    }
    return Splunk.Messenger.System.instance;
};
