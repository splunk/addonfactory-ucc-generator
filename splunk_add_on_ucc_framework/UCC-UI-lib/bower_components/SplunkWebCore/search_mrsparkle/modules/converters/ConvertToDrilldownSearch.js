Splunk.Module.ConvertToDrilldownSearch = $.klass(Splunk.Module, {
    
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement  = Splunk.Module.ALWAYS_REQUIRE;
        this.parentEnforcement = Splunk.Module.ALWAYS_REQUIRE;


        if (Splunk.util.normalizeBoolean(this.getParam("enableDebugOutput"))) {
            this.setUpDebuggingCrap();
        }
        this.clickDirection = "down";
        this.drilldownPrefix = this.getParam("drilldownPrefix");
        this.hide(this.HIDDEN_MODULE_KEY);
    },

    addDrilldownIntention: function(search, click) {
        var intention = {
            arg:{
                vals:[]
            },
            flags:["keepevents"],
            name:"drilldown"
        };
        // Looks clunky but our drilldown spec requires we pass explicit nulls in 
        // spots where we have no values. 
        // We cant proceed naively cause JS likes to take [foo,bar]  and if foo is undefined you end up with [bar]
        // step 1.   load em up at explicit indices.
        var vals = intention.arg.vals;
        intention.arg.vals[0] = [];
        intention.arg.vals[0][0] = click.name;
        
        intention.arg.vals[0][1] = click.value;

        intention.arg.vals[1] = [];
        intention.arg.vals[1][0] = click.name2;
        intention.arg.vals[1][1] = click.value2;
        
        // step 1.   if we let the values be undefined, the json conversion will kill them
        // so we walk through and replace with explicit nulls
        // being VERY careful to not touch values like '0'  or '-1' cause JS weak typing 
        // would happily damage these.
        for (var i=0; i<intention.arg.vals.length; i++) {
            for (var j=0; j<intention.arg.vals[i].length; j++) {
                if (!intention.arg.vals[i][j] && ("" + intention.arg.vals[i][j] == "undefined")) {
                    intention.arg.vals[i][j] = null;
                }
            }
        }

        search.addIntention(intention);
        return search;

    },

    setUpDebuggingCrap: function() {
        var moduleInstance = this;
        $("<input type='checkbox' checked=\"checked\"/>")
            .click(function() {
                if ($(this).prop('checked')) {
                    moduleInstance.debugContainer.show();
                    moduleInstance._propagationPulldown.show();
                } else {
                    moduleInstance.debugContainer.hide();
                    moduleInstance._propagationPulldown.hide();
                }
            }).appendTo(this.container);

        this.container.append("Show debug foo");

        this._propagationPulldown = $("<div>").text("drilldown clicks should propagate:")
            .append(
            $("<select>")
                .append($("<option value='up'>Up</option").text("Up (experimental)"))
                .append($("<option selected='selected' value='down'></option").text("Down"))
                .change(function() {
                    moduleInstance.clickDirection = $(this).val();
                })
            )
            .appendTo(this.container);
         this.debugContainer = $("<div>").appendTo(this.container);
    },

    outputDebugMessages: function() {
        if (!this.debugContainer) return;
        var context = this.getContext();
        var click = context.getAll(this.drilldownPrefix);
        var search  = context.get("search");

         //quick and dirty debugging output.
        var debugMsg = "<h3>Debugging the drilldown intention args</h3>";
        debugMsg += "search = " + search.toString() + "<br/>";
        for (name in click) {
            debugMsg += name + "=" + click[name] + "<br/>";
        }
        this.debugContainer.html(debugMsg);
    },

    pushContextToChildren: function($super, explicitContext) {
        var click = this.getContext().getAll(this.drilldownPrefix);
        //this.logger.debug(click);
        if (click.name || click.value || click.name2 || click.value2) {
        
            if (this.clickDirection == "down") {
                return $super(explicitContext);
            }
            else {
                this.outputDebugMessages();
                var upwardContext = new Splunk.Context();
                var search  = new Splunk.Search();
                upwardContext.set("search", search);
                
                this.applyKeysToContext(click, upwardContext);
                this.passContextToParent(upwardContext);
            }
        }
    },

    applyKeysToContext: function(click, context) {
        if (click && (click.name || click.value || click.name2 || click.value2) ) {
            var search  = context.get("search");
            search.abandonJob();
        
            if (click.name == "_time") {
                if (click.timeRange) {
                    // We no longer add the timerange. 
                    // The FlashChart / SimpleResultsTable will have done this already.
                    //search.setTimeRange(click.timeRange);
                    
                    // TODO THE INTENTION DOES NOT ACTUALLY USE THIS VALUE FOR ANYTHING, 
                    //      so it may be more confusing to send it than not
                    click.value = click.timeRange.getEarliestTimeTerms() + "-" + click.timeRange.getLatestTimeTerms();
                    if (click.name2 == "_time") click.value2 = click.value;

                } else {
                    this.logger.error("we appear to have a time click but we are missing the TimeRange instance");
                }
            }
            // NOTE: we no longer differentiate between the cases where we have split-by args and where we do not
            // or when its transforming or non transforming.  
            // in all cases we use a drilldown intention even if the args are null, because 
            // that's the only way we can unwind N transforming commands down to the 
            // correct N-1 transforming commands.
            this.addDrilldownIntention(search, click);
            context.set("search", search);
        } 
        return context;
    },

    getModifiedContext: function() {
        var context = this.getContext();
        this.outputDebugMessages();
        var click = context.getAll(this.drilldownPrefix);
        
        //TODO - i think this clinches it. We need to turn getModifiedContext() into modifyContext(context)
        //       i pulled this out only because i need to apply the modifications to two different contexts...

        this.applyKeysToContext(click, context);
        
        return context;
    }
});
