
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.BaseReportBuilderField = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        this.messenger = Splunk.Messenger.System.getInstance();
        this.lockBaseContext = true;
        this._selectElement = $("select",this.container)
            .change(this.onUIChange.bind(this));
        
    },
    
    onUIChange: function(event) {
        this.pushContextToChildren();
    },

    showIfCompatible : function() {
        var context = this.getContext();
        if (!context) {
            this.logger.debug(this.moduleType + ", No base context. Hiding  Foo");
            this.hide();
            return false;
        }

        if (this.isCompatibleWithContext(context)) {            
            var plotIntention = context.get("search").getIntentionReference("plot");
            if (this.isCompatibleWithIntention(plotIntention)) {
                this.show();
            } else {
                this.hide();
            }
        } else {
            this.hide();
        }
    },
    /** 
     * template method - designed to be overridden by concrete subclasses. 
     * check whatever you like in the context, and return true if your module
     * is 'compatible' with this data model. 
     * Return false if your module is NOT 'compatible' with this data model. 
     * if/when you return false, 
     * a) your modifications in getModifiedContext will not apply
     * b) your module will become invisible until it *is* compatible. 
     */ 
    isCompatibleWithContext: function(explicitContext) {
        var context = explicitContext || this.getContext();
        return !context.get("reporting.advancedMode");
    },
    
    /** 
     * template method - designed to be overridden by concrete subclasses. 
     * This is a convenience method, for concrete classes that want to just 
     * do all their compatibility checking against the plot intention
     * and dont care about anything else in the context. 
     * NOTE: You cant do anything by overriding this that you could not 
     * do by overriding  isCompatibleWithContext. 
     * this just gives you an easier way to do purely intention-based logic.
     */ 
    isCompatibleWithIntention: function(plotIntention) {return true;},
    
    onContextChange: function($super) {
        this.logger.debug(this.moduleType + " onContextChange");
        this.showIfCompatible();
    },
       
    getPlotIntentionArg: function() {
        this.logger.error(this.moduleType, "getPlotIntentionArg not implemented");
    },
       
    absorbPlotIntentionArg: function(intentionArg) {
        this.logger.error(this.moduleType, "absorbPlotIntentionArg not implemented");
    },

    applyContext: function(context) {
        var search = context.get("search");
        // TODO - getIntention should maybe be replaced or augmented with a getIntention method.
        //        constantly popping and pushing it on is odd and seems to be happening a lot.
        var plotIntention = search.getIntentionReference("plot");
        
        //this.logger.debug("before ", this.moduleType, " applyContext, the arg is " + $.param(plotIntention["arg"]));
        // order is important because absorbPlotIntentionArg needs to happen even if ultimately the intention is not compatible.
        if (plotIntention && this.absorbPlotIntentionArg(plotIntention["arg"]) && this.isCompatibleWithIntention(plotIntention)) {
            //this.logger.debug("after successful applyContext, " + $.param(plotIntention["arg"]));
            this.logger.debug(this.moduleType, " absorbPlotIntention returned true. Showing Foo.");
            this.show();
            // push our modified search (without the intention) back onto the context.
            context.set("search", search);
            return true;
        } else {
            //this.logger.debug("after UNsuccessful  ", this.moduleType, " applyContext, " + $.param(plotIntention["arg"]));
            this.logger.debug(this.moduleType, " absorbPlotIntention returned false. Hiding  Foo.");
            this.hide();
            return false;
        }
    },
    
    getModifiedContext: function() {
        var argumentDict = this.getPlotIntentionArg();
        // the fact that we preserve the jobInstance is a little unusual.
        // typically modules that know they are modifying the search within their 
        // context, will bleach away the Job information.   
        // However for BaseReportBuilderField
        // instances, it is very helpful to pass along the preexisting job, as
        // so downstream modules can obtain the field list and other information
        // about the 'dataset'.
        var context = this.getContext();
        var search  = context.get("search");
        var plotIntention = search.getIntentionReference("plot");
        if (!plotIntention) {
            return context;
        }

        if (argumentDict && this.isCompatibleWithIntention(plotIntention)) {
            
            for (var key in argumentDict) {
                if (plotIntention["arg"].hasOwnProperty(key)) {
                    this.logger.error(this.moduleType, "plot intention already has a value for " , key);
                    if (this.getFieldType) {
                        this.logger.error(this.moduleType, this.getFieldType(), " plot intention already has a value for " , key);
                    }
                }
                plotIntention["arg"][key] = argumentDict[key];
            }    
        }
        context.set("search", search);
        return context;
    },

    lazyAdd: function(arg, asKey, map) {
        if (arg) {
            map[asKey] = arg;
        }
    },

    show: function($super, invisibilityMode) {
        invisibilityMode = invisibilityMode || "report_builder";
        return $super(invisibilityMode);
    },

    hide: function($super, invisibilityMode) {
        invisibilityMode = invisibilityMode || "report_builder";
        return $super(invisibilityMode);
    },
    
    /** 
     * method to be called when, for whatever reason, something in the current 
     * data model (Context) wont work in 'basic' mode. 
     */ 
    puntToAdvancedMode: function(optionalDetailMessage) {
        $(document).trigger('incompatibleWithBasicMode', [optionalDetailMessage]);
    }
});
Splunk.Module.BaseReportBuilderField.isAbstract = true;
