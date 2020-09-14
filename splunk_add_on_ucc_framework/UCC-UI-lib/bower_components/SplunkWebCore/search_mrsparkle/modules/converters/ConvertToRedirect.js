Splunk.Module.ConvertToRedirect = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        this.parentEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        this.hide(this.HIDDEN_MODULE_KEY);
    },
    onContextChange: function() {
        var context = this.getContext();
        var type = this.getParam('type').toLowerCase();
        var value = context.get(this.getParam('settingToConvert'));
    
        if (value) {
            var options = {};
            switch(type) {
                case 'savedsearch':
                case 'saved_search':
                case 's':
                    options['s'] = value;
                    break;
                case 'search':
                case 'sid':
                    options['sid'] = value;
                    break;
                default:
                    break;
                 
            }
            Splunk.util.redirect_to(['app', Splunk.util.getCurrentApp(), '@go'].join('/'), options);
        }
    }
});
