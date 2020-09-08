Splunk.Module.Count = $.klass(Splunk.Module, {
    
	/**
     * Count Dracula where's your trousers?
     */
    initialize: function($super, container){
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
		this.logger = Splunk.Logger.getLogger("Count.js");
		
		var options = this.getCountOptions();
		
		var menuDict = [];
		
		for(var i=0,len=options.length;i<len;i++){
			var txt = options[i].text;
			menuDict.push({
				"label" : _(txt),
				callback: (function(val, _this){ return function(){
					_this.onSelectChange.apply(_this, [val]);
				};})(txt, this)
			});
		}
		
		var perPageMenu = new Splunk.MenuBuilder({
			menuDict: menuDict,
			activator: $('.perPageLabel', this.container),
			menuClasses: 'splMenu-primary CountMenu'
		});		
    },
	getCountOptions: function(){
		//abstracted for testability reasons (test_count unit test specifically)
		return this.getParam('options') || [];
	},

    /**
     * adds count values for downstream modules.
     */
    getModifiedContext: function(){
        var context = this.getContext();
        context.set("results.count", this.getParam('default') || $('.perPagePlaceholder', this.container).html());
        return context;
    },

    onSelectChange: function(val) {
		if(isNaN(val)){
			return;
		}
		
		$('.perPagePlaceholder', this.container).text(val);		
        this.setParam('default', val);

	var context = this.getContext();
	var search = context.get("search");	

	if (search && search.job && search.job.isCanceled())
	    return;

        this.pushContextToChildren();
    }
});