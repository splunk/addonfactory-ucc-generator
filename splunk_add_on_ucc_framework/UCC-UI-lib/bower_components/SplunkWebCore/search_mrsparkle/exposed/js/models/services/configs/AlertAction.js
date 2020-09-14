define(['underscore','models/SplunkDBase'],function(_, Base){

    return Base.extend({
        urlRoot: 'configs/conf-alert_actions',
        getSetting: function(key, defaultValue) {
            return this.entry.content.has(key) ? this.entry.content.get(key) : defaultValue;
        },
        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
        }
    });

});