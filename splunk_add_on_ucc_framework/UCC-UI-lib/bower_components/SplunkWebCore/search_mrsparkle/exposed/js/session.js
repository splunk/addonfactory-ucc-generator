Splunk.namespace("Splunk.Session");
/**
 * A simple class that dispatches jQuery document events Splunk.Session.TIMEOUT_EVENT and Splunk.Session.START_EVENT.
 * Events triggered on UI activity/no-activity configuration setting POLLER_TIMEOUT_INTERVAL.
 */
Splunk.Session = $.klass({
    EVENT_BUFFER_TIMEOUT: 1000,//Never operate on many DOM events without a governor (ie., 1000ms governor cancels >30 scroll events).
    UI_INACTIVITY_TIMEOUT: 60,
    START_EVENT: "SessionStart",
    TIMEOUT_EVENT: "SessionTimeout",
    RESTART_EVENT: "HaltOnRestart", //Stop all the pollers when restart is initiated from the UI
    UI_EVENT_TYPES: ["click", "keydown", "mouseover", "scroll"],
    /**
     * Initializes Session.
     */
    initialize: function(){
        this.logger = Splunk.Logger.getLogger("session.js");
        this.eventBuffer = [];
        this.timeoutDelay = Splunk.util.getConfigValue("UI_INACTIVITY_TIMEOUT", this.UI_INACTIVITY_TIMEOUT);
        this.timeoutDelay *= 60000;

        // SPL-82672 if timeoutDelay is > 2147483647 they are most likely treating it as milliseconds.
        if(this.timeoutDelay > 2147483647) {
            this.logger.warn("ui_inactivity_timeout must be treated as minutes not milliseconds. Defaulting to 60 min");
            this.timeoutDelay = 3600000;
        }

        this.timeoutID = null;
        $(document).bind(this.START_EVENT, this.onSessionStart.bind(this));
        if(!this.timeoutDelay<1){
            $(document).bind(this.TIMEOUT_EVENT, this.onSessionTimeout.bind(this));
            $(document).bind(this.UI_EVENT_TYPES.join(" "), this.onUIEvent.bind(this));
            this.startTimeout();
        }
        $(document).trigger(this.START_EVENT, new Date());
    },
    /**
     * Top level UI event listener and dispatcher, triggers Splunk.Session.START_EVENT if timeoutID is null, resets the 
     * timer if timeoutID not null.
     *
     * @param {Object} event A DOM event.
     */
    onUIEvent: function(event){
        if(this.timeoutID){
            this.eventBuffer.push("");
            if(this.eventBuffer.length===1){
                this.resetTimeout();
                setTimeout(
                    function(){
                        this.eventBuffer = [];
                    }.bind(this),
                    this.EVENT_BUFFER_TIMEOUT
                );
            }
        }else{
            this.startTimeout();
            $(document).trigger(this.START_EVENT, new Date());
        }
    },
    /**
     * Start of new UI activity/session.
     * 
     * @param {Object) event The jQuery passed event.
     * @param {Date} date The time the event was fired.
     */
    onSessionStart: function(event, date){},
    /**
     * End of UI activity/session.
     * 
     * @param {Object) event The jQuery passed event.
     * @param {Date} date The time the event was fired.
     */
    onSessionTimeout: function(event, date){},
    /**
     * Reset timeout, stop and start again.
     */
    resetTimeout: function(){
        this.stopTimeout();
        this.startTimeout();
    },
    /**
     * Inform subscribers of server restart started
     */
    signalRestart: function(){
        $(document).trigger(this.RESTART_EVENT);
    },
    /**
     * Start timeout, set timeoutID.
     */
    startTimeout: function(){
        this.timeoutID = window.setTimeout(this.timeoutHandler.bind(this), this.timeoutDelay);
    },
    /**
     * Stop timeout, if timeoutID exists clear the previous delay and set timeoutID back to null.
     * 
     * Note: Passing an invalid ID to clearTimeout does not have any effect (and doesn't throw an exception).
     */
    stopTimeout: function(){
        if(this.timeoutID){
            window.clearTimeout(this.timeoutID);
            this.timeoutID = null;
        }
    },
    /**
     * Handler for successful timeout, set timeoutID back to null, trigger Splunk.Session.TIMEOUT_EVENT.
     */
    timeoutHandler: function(){
        this.stopTimeout();
        $(document).trigger(this.TIMEOUT_EVENT, new Date());
    }
});
Splunk.Session.instance = null;
/**
 * Singleton reference to Session object.
 *
 * @return A reference to a shared Session object.
 * @type Object
 */
Splunk.Session.getInstance = function(){
    if(!Splunk.Session.instance){
        Splunk.Session.instance = new Splunk.Session();
    }
    return Splunk.Session.instance;
};
