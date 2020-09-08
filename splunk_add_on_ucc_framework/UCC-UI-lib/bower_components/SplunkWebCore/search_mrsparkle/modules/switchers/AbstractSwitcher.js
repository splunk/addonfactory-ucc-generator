
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

// Although switchers subclass DispatchingModule, they return false from requiresDispatch 
// which means they have to tolerate sometimes having undispatched searches.
Splunk.Module.AbstractSwitcher = $.klass(Splunk.Module.DispatchingModule, {
    _titles: [],
    _altTitles: [],
    _frozenContexts: [],
    _mode: null,
    initialize: function($super,container) {
        $super(container);
        this.messenger = Splunk.Messenger.System.getInstance();
        this.logger = Splunk.Logger.getLogger("abstract_switcher.js");
        this._titles = [];
        this._altTitles = [];
        this._mode = this._params["mode"] || "independent";
        this._activeChildIndex = 0;
        this._preferredChildIndex = -1;

        this._disabled = Splunk.util.normalizeBoolean(this._params["disableOnNull"]);
    },

    /**
     * although we dont want to force dispatches, we do want the machinery that DispatchingModules have. 
     */
    requiresDispatch: function(search) {return false;},
    disable: function() {this._disabled = true;},
    enable: function() {this._disabled = false;},
    isDisabled: function() {return this._disabled;},

    /*
     * another fun way the switchers have to bend the model.
     */
    someChildrenRequireDispatch: function($super, search) {
        return this._getActiveChild().requiresDispatch(search);
    },

    onLoadStatusChange: function($super,statusInt) {
        $super(statusInt);
        if (!this.isPageLoadComplete() && statusInt == Splunk.util.moduleLoadStates.WAITING_FOR_CONTEXT) {
            if (this._mode == "serializeAll") {
                for (var i=0; i<this._children.length-1; i++) {
                    var child = this._children[i];

                    // for each child, we find the last child's last child's last child....
                    // which for us, we refer to as the 'deepest' descendant although it might be shallower than some
                    // others in the middle.
                    var deepestDescendant = child;
                    while (deepestDescendant._children.length>0) {
                        deepestDescendant = deepestDescendant._children[deepestDescendant._children.length-1];
                    }
                    deepestDescendant.isSwitcherLeaf = true;
                    // null out the parent reference before calling addChild.
                    this._children[i+1].parent = null;
                    deepestDescendant.addChild(this._children[i+1]);
                    //this.logger.debug(this.moduleType, " rewired ", deepestDescendant.moduleType, " to be the parent of ", this._children[i+1].moduleType);
                }
            }
            var activeChildTitle = this._params["selected"] || null;
            if (activeChildTitle) {
                for (var j=0; j<this._titles.length; j++) {
                    if (this._titles[j] == activeChildTitle) {
                        
                        this.setActiveChild(j);
                        return;
                    }
                }
            } 
            this.setActiveChild(0);
        }
    },

    checkCompatibilities: function(context) {
        var search  = context.get("search");  
        if (this._mode != "independent") {
            return false;
        }
        var markIncompatible = function (i, message, messageTarget) {
            // if they are currently on the incompatible tab, then we switch them away.
            if (this._activeChildIndex == i) {

                this._preferredChildIndex = this._activeChildIndex;
                this.setActiveChild((i+1) % this._children.length);
                this.pushContextToChildren();
            }
            this.lockChild(i, message, messageTarget);
        }.bind(this);

        var markCompatible = function(i) {
            this.unlockChild(i);

            if (this._preferredChildIndex == i && this._activeChildIndex != i) {
                this._preferredChildIndex = -1;

                this.setActiveChild(i);
                this.pushContextToChildren();
            }

        }.bind(this);

        // we ONLY worry about locking/unlocking, if we have a resultsTableButton
	var eventsListIndex = this.getChildIndexByGroupName("splIcon-events-list"); 
        var resultsTableIndex = this.getChildIndexByGroupName("splIcon-results-table");
        var resultsChartIndex = this.getChildIndexByGroupName("splIcon-results-chart");
        var activeChildGroup;

        if (resultsTableIndex != -1) {
            if (search.job.areResultsTransformed()) {
                //markCompatible(resultsTableIndex);
                activeChildGroup = this._titles[this._activeChildIndex];
                if (!this.alreadyAutoSwitchedForThisJob) {
		    if ((context.has("from_history") && Splunk.util.normalizeBoolean(context.get("from_history"))) || (activeChildGroup in {"splIcon-events-list" : 1, "splIcon-events-table": 1})) {
			if (resultsChartIndex == -1 || !this.getContext().has("charting.chart"))
			    this.setActiveChild(resultsTableIndex);
			else
			    this.setActiveChild(resultsChartIndex);
			this.pushContextToChildren();
                    }

		    if (eventsListIndex != -1) {
			if (search.job.getStatusBuckets() == 0)
			    this.lockChild(eventsListIndex);
			else
			    this.unlockChild(eventsListIndex);
		    }
		}
            } else {
		if (eventsListIndex != -1)
		    this.unlockChild(eventsListIndex);

                activeChildGroup = this._titles[this._activeChildIndex];
		if (!this.alreadyAutoSwitchedForThisJob && activeChildGroup in {"splIcon-results-table" : 1, "splIcon-results-chart": 1}) {
		    this.setActiveChild(0);

                    this.pushContextToChildren();		    
		}
                //markIncompatible(resultsTableIndex, _("The results table option is only relevant when the search has transformed results."), "pageControls");
            }
	    
	    this.alreadyAutoSwitchedForThisJob = true;
        }
    },

    getChildIndexByGroupName: function(group) {
        for (var i=0; i<this._children.length; i++) {
            var child = this._children[i];
            if (child._params["group"] == group) {
                return i;
            }
        }
        return -1;
    },

    lockChild: function(childIndex, message, messageTarget) {
        this.logger.error("lockChild not implemented, or an instance of AbstractSwitcher was created directly. Both of these are not normal.");
    },

    unlockChild: function(childIndex) {
        this.logger.error("unlockChild not implemented, or an instance of AbstractSwitcher was created directly. Both of these are not normal.");
    },

    addChild: function($super,child) {
        $super(child);
        var childIndex = this._children.length - 1;

        // grab the child's title from the 'groupLabel' param
        // 'groupLabel' is the translated version of 'group'
        var childTitle = sprintf(_('Splunk is unable to find a title for child #%s'), childIndex);
        if (child._params.hasOwnProperty("groupLabel")) {
            childTitle = child._params["groupLabel"];
        }
        this._titles[childIndex] = childTitle;

        // grab the child's alternative title from the 'altTitle' param
        // these are handy for tooltips and such
        var childAltTitle = undefined;
        if (child._params.hasOwnProperty("altTitle")) {
            childAltTitle = child._params["altTitle"];
        }
        this._altTitles[childIndex] = childAltTitle;
    },

    _getActiveChild: function() {
        var index = (this._mode == "serializeAll")  ? 0: this._activeChildIndex;
        return this._children[index];
        //return this._children[this._activeChildIndex];
    },

    setActiveChild: function(childIndex) {
        this._activeChildIndex = childIndex;
        this.logger.debug(this.container.attr('id') + " - setActiveChild(" + childIndex + ")");
        var numberOfChildren = this._children.length;

        // NOTE: if we're in serializeAll we always leave the last child visible.
        if (this._mode == "serializeAll") numberOfChildren--;

        var invisibilityMode = "hidden by switcher " + this.moduleType + "#" + this.moduleId;
        //this.logger.debug(this.moduleType + " initiating a hide, and has " + this._children.length + " children");

        for (var i=0; i<numberOfChildren; i++) {
	    var child = this._children[i];
            if (i==parseInt(childIndex,10)) {
                child.showDescendants(invisibilityMode);
                child.show(invisibilityMode);
		//this.pushContextToChildren();
            } else {
		child.hideDescendants(invisibilityMode);
                child.hide(invisibilityMode);
            }
        }

        var resultsChartIndex = this.getChildIndexByGroupName("splIcon-results-chart");
	if (resultsChartIndex != -1) {
	    var parent = this.parent;
	    while (parent) {
		if (parent.updateHistory) {
		    parent.updateHistory();
		}
		parent = parent.parent;
	    }
	}

    },

    /**
     * switchers can be configured to disable themselves when the search is in a 'null' state
     * this includes both a) nothing has been run and b) the previous search was cancelled.
     */
    onJobStatusChange: function(event, status) {
        if (status=="cancel" && Splunk.util.normalizeBoolean(this._params["disableOnNull"])) {
            this.disable();
        }
    },

    /** 
     * we listen to jobProgress events because we inspect the job at runtime for 
     * incompatibilities and cases where we're supposed to automatically switch the user 
     * to a specific child.
     */
    onJobProgress: function() {
        var context = this.getContext();
        if (!this.alreadyAutoSwitchedForThisJob) {
            this.checkCompatibilities(context);
        }
    },

    onContextChange: function($super) {
        this.alreadyAutoSwitchedForThisJob = false;
        this.enable();
        return $super();
    },

    pushContextToChildren: function(explicitContext) {
        
        if (this.isDisabled()) return false;
        var context = explicitContext || this.getModifiedContext();
        var search  = context.get("search");  

        //this.checkCompatibilities(childContext);
        

        var activeChild = this._getActiveChild();
        if (activeChild && activeChild.requiresDispatch(search)) {
            this._fireDispatch(search);
            // BAIL OUT. and currently _fireDispatch will result in another
            // call to pushContextToChildren.  TODO - rethink/improve this.
            return;

        } else {
            this.logger.info(this.moduleType, ".onContextChange - no children require dispatch");
        }
        activeChild.baseContext = context;
        // TODO - onContextChange GOES AWAY and becomes a special handler for onModuleLoadStatusChange, when it is the HAS_CONTEXT state.
        activeChild.setLoadState(Splunk.util.moduleLoadStates.HAS_CONTEXT);
                
        activeChild.onContextChange();
        activeChild.pushContextToChildren();
        if (!activeChild.isPageLoadComplete()) {
            activeChild.markPageLoadComplete();
        }
    },

    getResults: function(params) {}

});
Splunk.Module.AbstractSwitcher.isAbstract = true;

