Splunk.namespace("Module");

Splunk.Module.ChartTypeFormatter = $.klass(Splunk.Module.BaseChartFormatter, {

    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("chart_type_formatter.js");
        this._contextKey = "charting.chart";
        this.optionCompatibilityKey = "mode";
        this.optionCompatibilityTable = {
            "timechart" : {
                "values"  : ["line", "area", "column"],
                "default" : "line"
            },
            "chart" : {
                "values"  : [
                    "column", 
                    "line", 
                    "area", 
                    "bar", 
                    "ratioBar", 
                    "pie", 
                    "scatter", 
                    "bubble", 
                    "radialGauge",
                    "fillerGauge",
                    "markerGauge"
                ],
                "default" : "line"
            },
            "top"  : {
                "values"  : [
                    "column", 
                    "bar", 
                    "pie"
                    ],
                "default" : "bar"
            },
            "rare" : {
                "values"  : ["column", "bar", "pie"],
                "default" : "bar"
            }
        };
    },
    
    /**
     * Adjust the chart type so that it makes sense when given a plot intention
     * mode.  Recognized modes are listed above in optionCompatibilityTable
     *
     */
    setCompatibleDefaults: function() {
        var context = this.getContext();
        var search  = context.get("search");
        if (search.getViewStateId()) return false;
        var plotIntention = search.getIntentionReference("plot");
        
        if (plotIntention && plotIntention["arg"]) {

            var mode = plotIntention["arg"]["mode"];

            switch (mode) {
                
                case 'timechart':
                    var statOpsForColumn = {"sum":1};
                    var fields = plotIntention["arg"]["fields"];
                    var statop = fields[0][0];

                    // force specific stats commands into fixed chart types
                    if (statOpsForColumn.hasOwnProperty(statop)) {
                        this._formElement.val("column");

                    // switch the current widget option to a default only if the
                    // currently selection option is invalid
                    } else if (this.optionCompatibilityTable[mode]['values'].indexOf(this._formElement.val()) == -1) {
                        this._formElement.val("line");
                    }
                    break;
                    
                case 'top':
                case 'rare':
                    this._formElement.val("bar");
                    break;
                    
                default:
                    // nothing; currently catches the 'chart' mode
                    break;
            }
            
            // TODO: temporary solution, to override the stickiness entirely
            this.setParam('default', this._formElement.val(), true);
        }
    },
    applyContext: function(context) {
        this.setCompatibleDefaults();
    },
    onContextChange: function($super) {
	this.withEachOption(function(i, element) {
	    this.enableOption($(element));
	}.bind(this));

	$super();

        if (Splunk.util.normalizeBoolean(this.getParam("ensureCompatibleType"))) {
	    var context = this.getContext();
	    var search = context.get("search");
	    var match = search.toString().match(/.*\|\s*(chart|timechart|stats|top|rare|ctable|contingency|table)/);

	    if (match) {
		var type = match[1];

		if (this.optionCompatibilityTable.hasOwnProperty(type)) {
		    var compat = this.optionCompatibilityTable[type];
		    var val = this.getParam("default");
		    var legalValues = compat["values"];
		    
		    this.withEachOption(function(i, element) {
			if (legalValues.indexOf($(element).val()) == -1) {
			    this.disableOption($(element));
			    if ($(element).val() == val) {
				this._formElement.val(compat["default"]);
				this.setParam('default', this._formElement.val(), true);
			    }
			}
		    }.bind(this));
		}
	    }
	}
    },
    pushContextToChildren: function($super, explicitContext) {
	$super(explicitContext);

	var parent = this.parent;
	while (parent) {
	    if (parent.updateHistory) {
		parent.updateHistory();
	    }
	    parent = parent.parent;
	}
    },
    enableCompatibleOptions: function() {
        
        if (!this.isPageLoadComplete()) {
            this.setCompatibleDefaults();
        }
        var context = this.getContext();
        var search  = context.get("search");
        var plotIntention = search.getIntentionReference("plot");

        if (plotIntention && plotIntention["arg"]) {
            var defaultValue = false;
            var key = this.optionCompatibilityKey;
            var table = this.optionCompatibilityTable;
            var keyValue = plotIntention["arg"][key];

            if (table.hasOwnProperty(keyValue)) {
                defaultValue = table[keyValue]["default"];
                var legalValues = table[keyValue]["values"];

                this.withEachOption(function(i, element) {
                    if (legalValues.indexOf($(element).val())!=-1) {
                        this.enableOption($(element));
                    } else {
                        this.disableOption($(element));
                    }
                }.bind(this));
            }
        } else {
            this.enableAllOptions();
        }
        this.disableOption($("option[value='bubble']", this.container));
        //this.disableOption($("option[value='scatter']", this.container));
    },
    withEachOption: function(callback) {
        this._formElement.find("option").each(function(i, element){
            callback(i, element);
        });
    },
    enableOption: function(element) {
        element.prop('disabled', false);
    },
    disableOption: function(element) {
        element.prop("disabled", true);
        // SPL-52115 - IE 6/7 do not support <option disabled> :(
        if ($.browser.msie && $.browser.version < 8) {
            element.remove();
        }
    },
    enableAllOptions: function() {
        this.withEachOption(function(i, element) {
            this.enableOption($(element));
        }.bind(this));
    }
});
