
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.NullModule = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        this.hide(this.HIDDEN_MODULE_KEY);
    }
});