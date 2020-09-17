
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.ConditionalSwitcher = $.klass(Splunk.Module.AbstractSwitcher, {
    
    /* 
     * 
     */
    initialize: function($super, container) {
        $super(container);
        this._locked = true;
        this.hide(this.HIDDEN_MODULE_KEY);
    },

    requiresDispatch: function($super, search) {
        try {
            return !search.isJobDispatched();
        } catch(e) {
            return $super(search);
        }
    },

    checkCondition: function() {
        var conditionStr = this.getParam("condition");
        // getting these as local variables allows us to support some shortcuts for search.foo() and job.bar();
        var context = this.getContext();
        var search = context.get("search");
        var job    = context.get("search").job;
        var conditionResult = !!eval("(" + this.getParam("condition") + ")");
        this.logger.debug(this.moduleType + " evaluating (" + conditionStr + ") and its " + conditionResult);
        
        return conditionResult;
    },
    onJobStatusChange: function() {
	this.onJobProgress();
    },
    onJobProgress: function() {
        var conditionStr = this.getParam("condition");
        if (conditionStr.indexOf("job")!=-1) {
            var result = this.checkCondition();
            if (result && this._activeChildIndex!=0) {
                this.setActiveChild(0);
                this.pushContextToChildren();
            } else if (!result && this._activeChildIndex!=1){
                this.setActiveChild(1);
                this.pushContextToChildren();
            }
        }
    },
    addChild: function($super, child) {
        if (this._children.length>1) {
            this.logger.error("ERROR - ConditionalSwitcher can only have 2 children. A third child will never be visible and never receive any data.");
            return false;
        }
        return $super(child);
    },
    onContextChange: function($super) {
        $super();
        try {
            var result = this.checkCondition();
            if (result) {
                this.setActiveChild(0);
            } else {
                this.setActiveChild(1);
            }
            this._locked = false;
        } catch(e) {
            this.logger.warn("the condition threw an exception " + e);
            this._locked = true;
        }
    },
    pushContextToChildren: function($super,  explicitContext) {
        if (this._locked) return false;
        return $super(explicitContext);
    }

});
