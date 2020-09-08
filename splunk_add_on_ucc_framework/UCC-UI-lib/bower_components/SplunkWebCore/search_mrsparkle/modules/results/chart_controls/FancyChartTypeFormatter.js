Splunk.namespace("Module");

Splunk.Module.FancyChartTypeFormatter = $.klass(Splunk.Module.ChartTypeFormatter, {
   
    initialize: function($super, container){
        $super(container);
        
        this._formElement = $('input',container);
        this._activator = $('.chartTypeActivator', container);
        
        this.chartTypeMenu = new Splunk.MenuBuilder({
            containerDiv: container,
            menuDict: [
                {   
                    "label" : _("Column"),
                    "style" : "column",
                    "attrs" : { chartval: "column" }
                },
                {   
                    "label" : _("Line"),
                    "style" : "line",
                    "attrs" : { chartval: "line" }
                },
                {   
                    "label" : _("Area"),
                    "style" : "area",
                    "attrs" : { chartval: "area" }
                },
                {   
                    "label" : _("Bar"),
                    "style" : "bar",
                    "attrs" : { chartval: "bar" }
                },
                {   
                    "label" : _("Pie"),
                    "style" : "pie",
                    "attrs" : { chartval: "pie" }
                },
                {   
                    "label" : _("Scatter"),
                    "style" : "scatter",
                    "attrs" : { chartval: "scatter" }
                },
                {   
                    "label" : _("Bubble"),
                    "style" : "bubble",
                    "attrs" : { chartval: "bubble" }
                }
            ],
            activator: this._activator,
            menuClasses: 'chartTypeMenu'
        });
        
        $(this.chartTypeMenu.getMenu()).bind('click', this.handleMenuClick.bind(this));
    },
       
    enableCompatibleOptions: function() {
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
                    if (legalValues.indexOf($(element).children('a').attr('chartval'))!=-1) {
                        this.enableOption($(element));
                    } else {
                        this.disableOption($(element));
                    }
                }.bind(this));
            } 
        } else {
            this.enableAllOptions();
        }
    },
    withEachOption: function(callback) {
        var list = this.chartTypeMenu.getMenu();
        $(list).find("li").each(function(i, element){
            callback(i, element);
        });
    },
    enableOption: function(element) {
        element.removeClass("disabled");
    },
    disableOption: function(element) {
        element.addClass("disabled");
    }, 
    enableAllOptions: function() {
        this.withEachOption(function(i, element) {
            this.enableOption($(element));
        }.bind(this));
    },
    
    /* handle clicks in the menu */
    handleMenuClick: function(evt) {
        var t = evt.target;
        
        if ( $(t).is('li') ){
            $elem = $(t);
        } else if ( $(t).is('a') ) {
            $elem = $(t).parent('li');
        } else 
            return;

        this._formElement.val($elem.children('a').attr('chartval'));
        this.setActivator($elem);
        this.handleInputChange(evt);   
    },
    
    /* Change the text and image of the activator on change */
    setActivator: function($elem) {
        this._activator.children('a')
            .text($elem.children('a').text())
            .removeClass()
            .addClass($elem.attr('class'));    
    }
});
