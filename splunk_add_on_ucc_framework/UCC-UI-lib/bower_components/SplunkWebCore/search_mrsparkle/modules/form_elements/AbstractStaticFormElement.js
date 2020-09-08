Splunk.Module.AbstractStaticFormElement = $.klass(Splunk.Module, {

    initialize: function($super, container) {
        $super(container);
    },

    onUserAction: function(event) {
        if (Splunk.util.normalizeBoolean(this.getParam('searchWhenChanged'))) {
            this.pushContextToChildren();
        } else {
            this.setChildContextFreshness(false);
        }
    },

    getModifiedContext: function() {
        var context = this.getContext();
        var contextKey = this.getParam('settingToCreate');
        var val = this.getListValue();
        if (val) {
            context.set(contextKey, val);
            
            var token = this.getToken();
            if (token) {
                context.set('form.'+token, val);
            }
        }
        return context;
    },

    getListValue: function() {return null;}

});
