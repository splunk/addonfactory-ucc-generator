define(
    [
        'jquery',
        'backbone',
        'underscore',
        'splunk.session',
        'util/console',
        'splunk.util'
    ], function($, Backbone, _, SplunkSession, console, splunkUtil){
    
    var Session = function() {
        this._session = SplunkSession.getInstance();
        this.cid = _.uniqueId();
        this.timeout = 'SessionTimeout.' + this.cid;
        this.start = 'SessionStart.' + this.cid;
        this.restart = 'HaltOnRestart.' + this.cid; //Stop all the pollers when restart is initiated from the UI

        $(document).on(this.timeout, function() {
            console.log("ui_inactivity_timeout occurred, current limit is: " + splunkUtil.getConfigValue("UI_INACTIVITY_TIMEOUT", this._session.UI_INACTIVITY_TIMEOUT) + ' minute(s)');
            this.trigger('timeout');
        }.bind(this));
        $(document).on(this.start, function() {
            this.trigger('start');
        }.bind(this));
        $(document).on(this.restart, function() {
            this.trigger('restart');
        }.bind(this));
    };

    _.extend(Session.prototype, Backbone.Events, {
        dispose: function() {
            $(document).off(this.timeout);
            $(document).off(this.start);
            $(document).off(this.restart);
        }
    });
    
    return new Session;
});
