/** Splunk.InstrumentedModule is an abstract base class that is a useful tool for active debugging. 
 * By inserting it into the inheritance chain, you can make certain modules write out interesting metrics 
 * inline into the page.
 * the idea was, that if you were having a problem with say All lister modules and ConvertToIntention, 
 * you could make those files subclasses of InstrumentedModule instead of Module,
 * and then all those concrete instances would get some fields that showed status information.
 * However, this is very limited if you use straight inheritance like this,  since
 * you can then only instrument modules that are either unimplemented directly,  or that call $super()
 * The more powerful way to implement this kind of thing is with a Decorator / Augmentor concept,
 * where you literally take the object's methods and wrap your own instrumenting logic around them.
 */ 

Splunk.Module.InstrumentedModule = $.klass(Splunk.Module.DispatchingModule, {
    
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        // create some DOM elements if you need some.
        $('<input type="text" style="width:50px;" class="instrumentationField"/>').prependTo(this.container);       
    },

    getResults: function($super, args) {
        $super(args);
        this._requestCounter = this._requestCounter || 0;
        $(".instrumentationField",this.container)
            .attr("value",this._requestCounter++);
    }
});
Splunk.Module.InstrumentedModule.isAbstract = true;
